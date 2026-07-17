const ALLOWED_ORIGINS = ['https://badlandcampers.com', 'https://www.badlandcampers.com', 'http://localhost:3000'];
const DEFAULT_EMAIL_ENDPOINT = 'https://formspree.io/f/xblzbazr';
const MATT_PHONE = '+18435408503';

function responseHeaders(origin: string | null): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
    'Content-Type': 'application/json',
  };
}

function reply(res: any, status: number, body: Record<string, unknown>, headers: Record<string, string>) {
  Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
  res.status(status).send(JSON.stringify(body));
}

const clean = (value: unknown, maximum: number) =>
  typeof value === 'string' ? value.trim().slice(0, maximum) : '';

async function sendEmail(payload: Record<string, string>): Promise<void> {
  const response = await fetch(process.env.CONTACT_EMAIL_WEBHOOK_URL || DEFAULT_EMAIL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Email delivery returned ${response.status}`);
}

async function sendText(name: string, email: string, subject: string, message: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) return false;
  const params = new URLSearchParams({
    To: MATT_PHONE,
    From: from,
    Body: `New Badland Campers message\nFrom: ${name} (${email})\nSubject: ${subject}\n${message}`.slice(0, 1500),
  });
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });
  if (!response.ok) throw new Error(`Text delivery returned ${response.status}`);
  return true;
}

export default async function contact(req: any, res: any): Promise<void> {
  const headers = responseHeaders(req.headers.origin || null);
  if (req.method === 'OPTIONS') return reply(res, 204, {}, headers);
  if (req.method !== 'POST') return reply(res, 405, { error: 'Method not allowed.' }, headers);

  const name = clean(req.body?.name, 100);
  const email = clean(req.body?.email, 254);
  const subject = clean(req.body?.subject, 160);
  const message = clean(req.body?.message, 5000);
  if (clean(req.body?.website, 200)) return reply(res, 200, { ok: true }, headers);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !subject || !message) {
    return reply(res, 400, { error: 'Please complete your name, email, subject, and message.' }, headers);
  }

  try {
    const [, textSent] = await Promise.all([
      sendEmail({
        _subject: `Badland Campers contact: ${subject}`,
        _replyto: email,
        _cc: 'grant@doziertechgroup.com',
        recipient: 'matthew@badlandcampers.com',
        name,
        email,
        subject,
        message,
        submitted_at: new Date().toISOString(),
      }),
      sendText(name, email, subject, message),
    ]);
    return reply(res, 200, { ok: true, textSent }, headers);
  } catch (error) {
    console.error('Contact delivery failed', error);
    return reply(res, 502, { error: 'We could not deliver your message. Please try again shortly.' }, headers);
  }
}
