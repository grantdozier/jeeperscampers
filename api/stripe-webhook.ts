// Vercel serverless function — receives Stripe webhook events.
//
// Deployed at:  https://<your-project>.vercel.app/api/stripe-webhook
// Register this URL in Stripe Dashboard → Developers → Webhooks and subscribe to:
//   • checkout.session.completed              (card / Affirm / Klarna — sync)
//   • checkout.session.async_payment_succeeded (ACH & other delayed methods settle)
//   • checkout.session.async_payment_failed    (delayed payment failed — alert)
// Copy that endpoint's signing secret (whsec_…) into STRIPE_WEBHOOK_SECRET.
//
// This is the RELIABLE record of a paid/deposited order — it fires server-to-server
// even if the customer closes the tab before returning to the success page. If the
// order notification can't be delivered we return a non-2xx so Stripe RETRIES
// (Stripe's built-in retry is our durability mechanism — better a duplicate email
// than a lost paid order; the subject carries the session id so duplicates are
// obvious, and the Stripe Dashboard is always the source of truth).
//
// Env vars:
//   STRIPE_SECRET_KEY         (required)  sk_test_… / sk_live_…
//   STRIPE_WEBHOOK_SECRET     (required)  whsec_… endpoint signing secret
//   ORDER_NOTIFY_WEBHOOK_URL  (optional)  where to POST the order notification
//                                         (defaults to the existing Formspree form)
//
// Exported as a Web `fetch` handler so `request.text()` yields the RAW body Stripe
// signature verification requires.

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const DEFAULT_NOTIFY_URL = 'https://formspree.io/f/xblzbazr';

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const sig = request.headers.get('stripe-signature') || '';
  // constructEvent needs the RAW body — never JSON.parse before verifying.
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || '',
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err?.message);
    return new Response(`Webhook Error: ${err?.message}`, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      // Sync methods (card/Affirm/Klarna) are 'paid' here. Delayed methods (ACH)
      // arrive 'unpaid'/'processing' and settle later via async_payment_succeeded.
      if (session.payment_status === 'paid') {
        await notifyOrder(session);
      }
    } else if (event.type === 'checkout.session.async_payment_succeeded') {
      // A delayed payment (e.g. ACH) has now settled — record it.
      await notifyOrder(event.data.object as Stripe.Checkout.Session);
    } else if (event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.error(
        `Async payment FAILED for session ${session.id} (order ${session.metadata?.order_id || '?'})`,
      );
    }
  } catch (err: any) {
    // Notification failed — return 500 so Stripe retries and the order isn't lost.
    console.error('Webhook handling error:', err?.message);
    return new Response('Order notification failed; please retry.', { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function notifyOrder(session: Stripe.Checkout.Session): Promise<void> {
  const url = process.env.ORDER_NOTIFY_WEBHOOK_URL || DEFAULT_NOTIFY_URL;
  const m = session.metadata || {};
  const isDeposit = m.order_type === 'deposit';
  const amount = typeof session.amount_total === 'number' ? session.amount_total / 100 : undefined;
  const money = (v?: number | string) =>
    v === undefined || v === '' ? '' : `$${Number(v).toLocaleString()}`;

  const payload = {
    _subject: `${isDeposit ? '💰 DEPOSIT RECEIVED' : '✅ PAID IN FULL'} — Badland Campers ${m.order_id || ''} — ${money(amount)} [${session.id}]`,
    _cc: 'grant@doziertechgroup.com',
    company_name: 'Badland Campers',
    order_id: m.order_id || '',
    order_type: m.order_type || '',
    payment_status: session.payment_status || '',
    amount_charged: money(amount),
    full_build_price: money(m.full_build_price_usd),
    balance_due: money(m.balance_due_usd),
    customer_name: m.customer_name || session.customer_details?.name || '',
    customer_email: m.customer_email || session.customer_details?.email || '',
    customer_phone: m.customer_phone || '',
    delivery_location: m.delivery_location || '',
    config_summary: m.config_summary || '',
    terms_accepted: m.terms_accepted || '',
    terms_version: m.terms_version || '',
    stripe_session_id: session.id,
    stripe_customer_id: typeof session.customer === 'string' ? session.customer : '',
    stripe_payment_intent:
      typeof session.payment_intent === 'string' ? session.payment_intent : '',
    note: isDeposit
      ? "This is a 50% DEPOSIT. Collect the remaining balance via Stripe Invoice at build completion (the customer's card is saved for the balance). See SETUP.md."
      : 'Paid in full.',
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  // fetch only rejects on network errors — treat an HTTP error as a failure too so
  // the caller returns 500 and Stripe retries rather than silently dropping the order.
  if (!res.ok) {
    throw new Error(`Order notification POST failed: ${res.status} ${res.statusText}`);
  }
}

export default { fetch: handler };
