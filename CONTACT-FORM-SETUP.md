# Contact form launch checklist

The shared contact form appears below every site section and posts to `/api/contact`.

## Email delivery

The API defaults to the existing Formspree endpoint:

`https://formspree.io/f/xblzbazr`

In Formspree, confirm that the form's primary recipient is
`matthew@badlandcampers.com` and that `grant@doziertechgroup.com` is allowed as
a CC recipient. Formspree may require both addresses to be verified.

To use a different endpoint, add this Vercel environment variable:

`CONTACT_EMAIL_WEBHOOK_URL=https://formspree.io/f/your-form-id`

## Text delivery to Matt

Create or use an SMS-capable Twilio number, then add these Vercel environment
variables to Production and Preview:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER` (E.164 format, for example `+18435551212`)

The destination is fixed in server code as Matt's number, `+18435408503`.
Secrets must be entered directly in Vercel and must not be committed or pasted
into chat.

Redeploy after changing environment variables. Submit a test message from the
live site and confirm delivery to both email inboxes and Matt's phone.
