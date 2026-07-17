// Vercel serverless function — creates a Stripe hosted Checkout Session.
//
// Deployed at:  https://<your-project>.vercel.app/api/create-checkout
// Called cross-origin from the GitHub Pages site (badlandcampers.com).
//
// WHY THIS EXISTS: the Stripe secret key must never reach the browser, and the
// amount charged must be computed on the server from the same pricing table the
// UI uses — a client can edit the browser total to anything before paying. This
// function recomputes the price of record from src/lib/pricing.ts.
//
// Env vars (set in Vercel → Project → Settings → Environment Variables):
//   STRIPE_SECRET_KEY          (required)  sk_test_… / sk_live_…
//   STRIPE_ENABLE_TOS_CONSENT  (optional)  'true' to show Stripe's native ToS
//                                          checkbox — requires a Terms of Service
//                                          URL saved in Stripe Dashboard settings.
//
// Exported as a Web `fetch` handler (`export default { fetch }`) — the signature
// Vercel's Node runtime recognizes for real Web Request/Response objects.

import Stripe from 'stripe';
import { calculatePrice, calculateDeposit, DEPOSIT_PERCENT } from '../src/lib/pricing';
import { DEPOSIT_TERMS_IS_DRAFT } from '../src/lib/terms';

function stripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  return new Stripe(key);
}

// Origins allowed to call this endpoint (the live site + local dev).
const ALLOWED_ORIGINS = [
  'https://badlandcampers.com',
  'https://www.badlandcampers.com',
  'http://localhost:3000',
];
const DEFAULT_SITE = 'https://badlandcampers.com';
const MAX_CART_ITEMS = 20;

function corsHeaders(origin: string | null): Record<string, string> {
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : DEFAULT_SITE;
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(obj: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

// A short, human-readable summary of a build for the Stripe metadata / receipt.
function summarizeConfig(config: Record<string, any>): string {
  const parts: string[] = [];
  parts.push(config.model === 'goat' ? 'The Goat base package' : 'The Buffalo base package');
  if (config.roofTent) parts.push(`${config.roofTent} rooftop tent`);
  const addOns = Object.keys(config).filter((k) => config[k] === true).length;
  if (addOns) parts.push(`${addOns} add-ons`);
  return parts.join(', ') || 'base build';
}

async function handler(request: Request): Promise<Response> {
  const origin = request.headers.get('origin');
  const headers = corsHeaders(origin);

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405, headers);
  }

  const secretKey = process.env.STRIPE_SECRET_KEY || '';
  if (!secretKey) {
    return json({ error: 'Server is not configured (missing STRIPE_SECRET_KEY).' }, 500, headers);
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400, headers);
  }

  const items: any[] = Array.isArray(body?.cart) ? body.cart : [];
  const paymentOption: 'full' | 'deposit' = body?.paymentOption === 'deposit' ? 'deposit' : 'full';
  const customer = body?.customer || {};
  const termsAccepted = body?.termsAccepted === true;
  const orderId =
    typeof body?.orderId === 'string' && body.orderId ? body.orderId.slice(0, 100) : `BC-${Date.now()}`;

  if (!items.length) {
    return json({ error: 'Your cart is empty.' }, 400, headers);
  }
  if (items.length > MAX_CART_ITEMS) {
    return json({ error: `A maximum of ${MAX_CART_ITEMS} campers can be ordered at once.` }, 400, headers);
  }
  if (!customer.email) {
    return json({ error: 'A customer email is required.' }, 400, headers);
  }
  if (paymentOption === 'deposit' && !termsAccepted) {
    return json({ error: 'You must accept the deposit terms to reserve a build.' }, 400, headers);
  }
  // Safety rail: never record acceptance of unfinished terms against a LIVE charge.
  if (paymentOption === 'deposit' && DEPOSIT_TERMS_IS_DRAFT && secretKey.startsWith('sk_live')) {
    return json(
      { error: 'Deposit terms are not finalized for live payments yet. Please contact us to complete your order.' },
      400,
      headers,
    );
  }

  // ---- PRICE OF RECORD: recompute server-side, ignore any client amounts. ----
  const fullTotal = items.reduce((sum, item) => sum + calculatePrice(item?.config || {}), 0);
  if (!(fullTotal > 0)) {
    return json({ error: 'Could not price this configuration.' }, 400, headers);
  }

  const depositAmount = calculateDeposit(fullTotal);
  const balanceDue = fullTotal - depositAmount;
  const amountDollars = paymentOption === 'deposit' ? depositAmount : fullTotal;
  const unitAmount = Math.round(amountDollars * 100); // Stripe wants integer cents

  if (unitAmount < 50) {
    return json({ error: 'Amount is below the $0.50 minimum.' }, 400, headers);
  }

  // Return the customer to whichever validated origin they came from (so both
  // localhost testing and the live site work without reconfiguration).
  const siteBase = origin && ALLOWED_ORIGINS.includes(origin) ? origin : DEFAULT_SITE;

  const camperCount = items.length;
  const countSuffix = camperCount > 1 ? ` (x${camperCount})` : '';
  const lineName =
    paymentOption === 'deposit'
      ? `${DEPOSIT_PERCENT}% Deposit — Badland Camper Build${countSuffix}`
      : `Badland Camper Build${countSuffix}`;
  const lineDescription =
    paymentOption === 'deposit'
      ? `Reserves your custom build. Remaining balance of $${balanceDue.toLocaleString()} due within 30 days of build completion/availability and before delivery.`
      : 'Full payment for your custom Badland Camper build.';

  const configSummary = items
    .map((it, i) => `#${i + 1}: ${summarizeConfig(it?.config || {})}`)
    .join(' | ')
    .slice(0, 480);

  const metadata: Record<string, string> = {
    order_id: orderId,
    order_type: paymentOption,
    camper_count: String(camperCount),
    full_build_price_usd: String(fullTotal),
    amount_charged_usd: String(amountDollars),
    customer_name: String(customer.name || '').slice(0, 200),
    customer_email: String(customer.email || '').slice(0, 200),
    customer_phone: String(customer.phone || '').slice(0, 60),
    delivery_location: String(customer.address || '').slice(0, 200),
    config_summary: configSummary,
  };
  if (paymentOption === 'deposit') {
    metadata.deposit_percent = String(DEPOSIT_PERCENT);
    metadata.balance_due_usd = String(balanceDue);
    metadata.terms_accepted = 'true';
    metadata.terms_version = String(body?.termsVersion || 'unversioned').slice(0, 100);
  }

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: unitAmount,
          product_data: { name: lineName, description: lineDescription },
        },
      },
    ],
    customer_email: customer.email,
    client_reference_id: orderId,
    metadata,
    payment_intent_data: { description: lineName, metadata },
    success_url: `${siteBase}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteBase}/?checkout=cancel`,
  };

  if (paymentOption === 'deposit') {
    // BNPL (Affirm/Klarna/Afterpay) can't do a partial deposit, and we need a
    // reusable card to collect the balance later — so restrict to card and save it.
    params.payment_method_types = ['card'];
    params.customer_creation = 'always';
    (params.payment_intent_data as Stripe.Checkout.SessionCreateParams.PaymentIntentData).setup_future_usage =
      'off_session';
  }
  // For 'full': omit payment_method_types so Stripe shows every method enabled in
  // the Dashboard (card + Affirm + Link + ACH + …) based on eligibility.

  // Optional: Stripe's own required ToS checkbox. Off by default because it FAILS
  // the create call unless a Terms of Service URL is saved in Dashboard settings.
  if (process.env.STRIPE_ENABLE_TOS_CONSENT === 'true') {
    params.consent_collection = { terms_of_service: 'required' };
  }

  try {
    const session = await stripeClient().checkout.sessions.create(params);
    if (!session.url) {
      return json({ error: 'Stripe did not return a checkout URL.' }, 502, headers);
    }
    return json({ url: session.url, id: session.id }, 200, headers);
  } catch (err: any) {
    // Log the real reason server-side, but don't leak Stripe internals to callers.
    console.error('create-checkout error:', err?.message || err);
    return json({ error: 'We couldn’t start checkout. Please try again or contact us.' }, 500, headers);
  }
}

function webHeaders(req: any): Headers {
  const headers = new Headers();
  Object.entries(req.headers || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((item) => headers.append(key, item));
    else if (value !== undefined) headers.set(key, String(value));
  });
  return headers;
}

export default async function vercelHandler(req: any, res: any): Promise<void> {
  const url = `https://${req.headers.host}${req.url}`;
  const body =
    req.method === 'GET' || req.method === 'HEAD'
      ? undefined
      : typeof req.body === 'string'
        ? req.body
        : JSON.stringify(req.body || {});
  const response = await handler(
    new Request(url, { method: req.method, headers: webHeaders(req), body }),
  );
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.status(response.status).send(await response.text());
}
