import Stripe from 'stripe';

const ORDER_RECIPIENTS = ['matthew@badlandcampers.com', 'grant@doziertechgroup.com'];

function stripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  return new Stripe(key);
}

async function notifyOrder(session: Stripe.Checkout.Session): Promise<void> {
  const metadata = session.metadata || {};
  const isDeposit = metadata.order_type === 'deposit';
  const amount = typeof session.amount_total === 'number' ? session.amount_total / 100 : undefined;
  const money = (value?: number | string) =>
    value === undefined || value === '' ? '' : `$${Number(value).toLocaleString()}`;

  let invoiceUrl = '';
  let invoicePdf = '';
  if (typeof session.invoice === 'string') {
    const invoice = await stripeClient().invoices.retrieve(session.invoice);
    invoiceUrl = invoice.hosted_invoice_url || '';
    invoicePdf = invoice.invoice_pdf || '';
  }

  const subject = `${isDeposit ? 'Deposit received' : 'Paid in full'} — Badland Campers ${metadata.order_id || ''} — ${money(amount)}`;
  const text = [
    subject,
    '',
    `Payment status: ${session.payment_status || ''}`,
    `Customer: ${metadata.customer_name || session.customer_details?.name || ''}`,
    `Email: ${metadata.customer_email || session.customer_details?.email || ''}`,
    `Phone: ${metadata.customer_phone || ''}`,
    `Delivery location: ${metadata.delivery_location || ''}`,
    `Configuration: ${metadata.config_summary || ''}`,
    `Full build price: ${money(metadata.full_build_price_usd)}`,
    `Amount charged: ${money(amount)}`,
    `Balance due: ${money(metadata.balance_due_usd) || '$0'}`,
    `Order ID: ${metadata.order_id || ''}`,
    `Stripe session: ${session.id}`,
    invoiceUrl ? `Hosted invoice: ${invoiceUrl}` : '',
    invoicePdf ? `Invoice PDF: ${invoicePdf}` : '',
    '',
    isDeposit
      ? "This is a 50% deposit. Collect the remaining balance at build completion; the customer's card was saved for future use."
      : 'This order was paid in full.',
  ].filter(Boolean).join('\n');

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured for paid-order notifications');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || 'Badland Campers <website@badlandcampers.com>',
      to: ORDER_RECIPIENTS,
      reply_to: metadata.customer_email || session.customer_details?.email || undefined,
      subject,
      text,
    }),
  });
  if (!response.ok) {
    throw new Error(`Paid-order email failed: ${response.status} ${await response.text()}`);
  }
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const signature = request.headers.get('stripe-signature') || '';
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = await stripeClient().webhooks.constructEventAsync(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || '',
    );
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error?.message);
    return new Response(`Webhook Error: ${error?.message}`, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === 'paid') await notifyOrder(session);
    } else if (event.type === 'checkout.session.async_payment_succeeded') {
      await notifyOrder(event.data.object as Stripe.Checkout.Session);
    } else if (event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.error(`Async payment failed for ${session.id}`);
    }
  } catch (error: any) {
    console.error('Webhook handling error:', error?.message);
    return new Response('Order notification failed; please retry.', { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const config = { api: { bodyParser: false } };

async function rawRequestBody(req: any): Promise<Buffer> {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body);
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
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
  const body = req.method === 'POST' ? await rawRequestBody(req) : undefined;
  const response = await handler(
    new Request(url, { method: req.method, headers: webHeaders(req), body }),
  );
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.status(response.status).send(await response.text());
}
