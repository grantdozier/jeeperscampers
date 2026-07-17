# Stripe Checkout Setup — Badland Campers

For the current account-level launch checklist, use **[STRIPE-LAUNCH.md](STRIPE-LAUNCH.md)**.
This document remains the detailed architecture and operations reference.

This site is a static React app on **GitHub Pages** (`badlandcampers.com`). Stripe
needs a server to hold the secret key and compute the real price, so we added **two
tiny serverless functions** that run on **Vercel**. The website itself does not move —
it just calls the Vercel functions over HTTPS.

```
Browser (badlandcampers.com, GitHub Pages)
   │  POST /api/create-checkout   (config + pay-in-full | 50% deposit)
   ▼
Vercel function  ── recomputes price from src/lib/pricing.ts ──► Stripe Checkout Session
   │  returns { url }
   ▼
Browser redirects to Stripe's hosted payment page ──► pays ──► back to /?checkout=success
                                                        │
Stripe ── webhook ──► /api/stripe-webhook ── emails you the confirmed order
```

**Files added**
- `api/create-checkout.ts` — creates the Checkout Session (price of record lives here).
- `api/stripe-webhook.ts` — records a paid/deposited order (fires even if the tab closes).
- `api/verify-session.ts` — confirms a session actually paid before the site shows "paid".
- `src/lib/pricing.ts` — shared price table used by the UI **and** the server.
- `src/lib/terms.ts` — the 50% deposit terms shown on the order form.
- `vercel.json`, `.env.example` — deploy config + env var template.

---

## One-time setup

### 1. Get your Stripe test keys
Stripe Dashboard → **Developers → API keys** (keep it in **Test mode** for now):
- **Publishable key** `pk_test_…` — not needed in our flow (we redirect via the server).
- **Secret key** `sk_test_…` — goes into Vercel only (never in the repo/browser).

> Security: don't paste the secret key into chat/email/commits. If it has been
> shared around, click **Roll key** in the dashboard to rotate it. Test keys can't
> move real money, but treat them as credentials anyway.

### 2. Deploy the functions to Vercel
1. Create a free account at vercel.com and **Add New → Project → Import** the
   `grantdozier/jeeperscampers` GitHub repo.
2. In the project settings before deploying:
   - **Framework Preset:** `Other` (our `vercel.json` already sets `framework: null`).
   - **Build Command:** leave the override off / empty (vercel.json handles it).
   - **Root Directory:** repo root (`.`).
3. **Settings → Environment Variables** — add (scope: Production + Preview + Development):
   | Name | Value |
   |------|-------|
   | `STRIPE_SECRET_KEY` | your `sk_test_…` |
   | `ORDER_NOTIFY_WEBHOOK_URL` | `https://formspree.io/f/xblzbazr` *(optional)* |
4. **Deploy.** You'll get a URL like `https://jeeperscampers.vercel.app`. Your
   endpoints are:
   - `https://jeeperscampers.vercel.app/api/create-checkout`
   - `https://jeeperscampers.vercel.app/api/stripe-webhook`
   - `https://jeeperscampers.vercel.app/api/verify-session`

### 3. Point the website at the functions
1. Create a `.env.production` (or `.env`) at the repo root:
   ```
   REACT_APP_CHECKOUT_API_BASE=https://jeeperscampers.vercel.app
   ```
   (Use your real Vercel URL, no trailing slash. This value is public — safe to commit.)
2. Redeploy the site: `npm run deploy` (builds and pushes to GitHub Pages).

### 4. Turn on payment methods (including Affirm)
Stripe Dashboard (**Test mode**) → **Settings → Payment methods**. Enable:
- **Card** (on by default)
- **Affirm** ← for financing on the *pay-in-full* option
- Optionally: **Link, Cash App Pay, ACH Direct Debit, Klarna, Afterpay**

We don't hard-code the method list for pay-in-full, so whatever you enable here shows
up automatically (when the amount/currency/customer qualifies). Affirm appears only for
**USD, US customers, $50–$30,000**. Builds **$20,001–$30,000** will ask the customer for
a down payment (Affirm's credit cap is $20k); over $30k, Affirm is hidden and card/ACH
is used instead.

> The **deposit** option is intentionally **card-only** — buy-now-pay-later can't split
> a payment, and we need a reusable card on file to collect the balance later.

### 5. Register the webhook
1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**.
2. Endpoint URL: `https://jeeperscampers.vercel.app/api/stripe-webhook`
3. Events to send (select all three):
   - **`checkout.session.completed`** — card / Affirm / Klarna (settle synchronously)
   - **`checkout.session.async_payment_succeeded`** — ACH & other delayed methods that
     settle 1–4 days later (without this, an ACH-paid order is never recorded)
   - **`checkout.session.async_payment_failed`** — a delayed payment failed (logged)
4. After creating it, copy the **Signing secret** (`whsec_…`).
5. Add it to Vercel env vars as `STRIPE_WEBHOOK_SECRET` and **redeploy** (env changes
   need a redeploy).

### 6. (Optional) Stripe's own Terms checkbox
We already show a required deposit-terms checkbox on our order form. If you *also* want
Stripe's native "I agree to the Terms of Service" checkbox on the hosted page:
1. Save a Terms of Service URL at Stripe → **Settings → Business → Public details**.
2. Add Vercel env var `STRIPE_ENABLE_TOS_CONSENT=true` and redeploy.
   (Leave it off until the ToS URL is set, or the checkout call will error.)

---

## Testing (Test mode)

Use Stripe's [test cards](https://docs.stripe.com/testing):
- **Success:** `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP.
- **Requires authentication (3DS):** `4000 0025 0000 3155`.
- **Declined:** `4000 0000 0000 0002`.
- **Affirm:** select Affirm on the hosted page → it opens Affirm's **test** flow → approve.

Checklist:
1. Build a camper → **Add to Cart** → **Order**.
2. **Pay in Full** → you should see card + Affirm (+ any others enabled) on Stripe's page.
3. **Reserve with 50% Deposit** → the terms box appears; the pay button stays disabled
   until you tick the checkbox; the amount shows 50% of the build.
4. Complete payment → you land back on `…/?checkout=success` with the thank-you screen and
   the cart cleared.
5. Cancel on Stripe → you land on `…/?checkout=cancel`, cart intact, with a notice.
6. Confirm the **order notification email** arrives (from the webhook) and the payment
   shows in Stripe → **Payments**, tagged with the order id + config summary in metadata.
7. Watch the webhook locally if needed: `stripe listen --forward-to
   https://jeeperscampers.vercel.app/api/stripe-webhook`.

---

## Collecting the remaining 50% balance ("the rest")

The deposit checkout **saves the customer's card** (Stripe creates a Customer and stores
the payment method). When a build is complete, collect the balance one of two ways:

**A) Stripe Invoice (recommended — cleanest paper trail, no surprise declines):**
1. Stripe Dashboard → **Customers** → open the customer (find them by the order email /
   the `order_id` in the deposit's metadata).
2. **Create invoice** for the remaining balance (shown as `balance_due_usd` in the deposit
   metadata), set **Due in 30 days**, and **Send**. The customer pays via a hosted link.

**B) Charge the saved card off-session:** possible via a future `/api/charge-balance`
endpoint (`paymentIntents.create({ customer, payment_method, off_session:true,
confirm:true })`). Faster but a large charge 30+ days later can hit an
authentication/decline that needs the customer back on-session — which is why we default
to the invoice. We can automate this later if you want.

Either way, the customer already consented at deposit time (the required terms checkbox,
recorded as `terms_accepted` / `terms_version` in metadata).

---

## Going live

When you're ready to take real money:
1. Review the generated deposit policy in `TERMS-DRAFT.md` with an attorney in the
   seller's state and confirm it matches actual cancellation, storage, tax, and delivery practices.
2. Stripe Dashboard → toggle to **Live mode**, then:
   - Copy the **live** `sk_live_…` into Vercel `STRIPE_SECRET_KEY` (replace the test one).
   - Re-enable Affirm/other methods in **Live** Settings → Payment methods (business
     verification may be required for Affirm).
   - Create a **live** webhook endpoint and put its `whsec_…` into `STRIPE_WEBHOOK_SECRET`.
   - Redeploy Vercel.
3. Keep `REACT_APP_CHECKOUT_API_BASE` pointed at the same Vercel URL; `npm run deploy`.
4. Do one real small-amount end-to-end test, then refund it.

---

## Env var reference

| Where | Name | Purpose |
|-------|------|---------|
| Vercel | `STRIPE_SECRET_KEY` | **required** — creates sessions / verifies webhooks |
| Vercel | `STRIPE_WEBHOOK_SECRET` | **required** — verifies webhook signatures |
| Vercel | `STRIPE_ENABLE_TOS_CONSENT` | optional — `true` to add Stripe's ToS checkbox |
| Vercel | `ORDER_NOTIFY_WEBHOOK_URL` | optional — order email target (defaults to Formspree) |
| Site build | `REACT_APP_CHECKOUT_API_BASE` | **required** — the Vercel base URL the site calls |
