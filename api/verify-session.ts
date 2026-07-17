// Vercel serverless function — verifies a Checkout Session actually paid.
//
// Deployed at:  https://<your-project>.vercel.app/api/verify-session?session_id=cs_...
// The site calls this when Stripe redirects back to ?checkout=success so it only
// shows the confirmation (and clears the cart) for a genuinely paid session — a
// bookmarked/shared "?checkout=success" URL can't fake a confirmation.
//
// Env vars: STRIPE_SECRET_KEY (required).

import Stripe from 'stripe';

function stripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  return new Stripe(key);
}

const ALLOWED_ORIGINS = [
  'https://badlandcampers.com',
  'https://www.badlandcampers.com',
  'http://localhost:3000',
];
const DEFAULT_SITE = 'https://badlandcampers.com';

function corsHeaders(origin: string | null): Record<string, string> {
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : DEFAULT_SITE;
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

async function handler(request: Request): Promise<Response> {
  const origin = request.headers.get('origin');
  const headers = corsHeaders(origin);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed.' }, 405, headers);
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return json({ error: 'Server is not configured.' }, 500, headers);
  }

  const sessionId = new URL(request.url).searchParams.get('session_id') || '';
  if (!sessionId.startsWith('cs_')) {
    return json({ paid: false, error: 'Invalid session id.' }, 400, headers);
  }

  try {
    const session = await stripeClient().checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === 'paid';
    return json(
      {
        paid,
        payment_status: session.payment_status,
        order_type: session.metadata?.order_type || '',
        order_id: session.metadata?.order_id || '',
        amount_total: typeof session.amount_total === 'number' ? session.amount_total / 100 : null,
      },
      200,
      headers,
    );
  } catch (err: any) {
    console.error('verify-session error:', err?.message || err);
    return json({ paid: false, error: 'Could not verify session.' }, 500, headers);
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
  const response = await handler(
    new Request(url, { method: req.method, headers: webHeaders(req) }),
  );
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.status(response.status).send(await response.text());
}
