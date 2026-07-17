# Stripe Checkout Launch Runbook

The checkout code is complete. These account-level steps connect it to Stripe without putting secret keys in GitHub.

## 1. Deploy the API on Vercel

1. In Vercel, choose **Add New → Project** and import `grantdozier/jeeperscampers`.
2. Keep the repository root as the project root. `vercel.json` configures this as a functions-only deployment.
3. In **Project Settings → Environment Variables**, add these to Production and Preview:

   - `STRIPE_SECRET_KEY`: Stripe sandbox secret key beginning with `sk_test_`
   - `ORDER_NOTIFY_WEBHOOK_URL`: the order-notification endpoint, currently `https://formspree.io/f/xblzbazr`
   - `STRIPE_ENABLE_TOS_CONSENT`: `false`

4. Deploy and record the stable production URL, such as `https://badland-campers.vercel.app`.
5. Verify that `OPTIONS https://YOUR-PROJECT.vercel.app/api/create-checkout` returns `204`.

Never commit or paste the Stripe secret key into source files, GitHub variables, chat, or email.

## 2. Connect GitHub Pages to the API

1. Open the GitHub repository.
2. Go to **Settings → Secrets and variables → Actions → Variables**.
3. Create `REACT_APP_CHECKOUT_API_BASE` with the Vercel production URL and no trailing slash.
4. Re-run the **Deploy to GitHub Pages** workflow or push a commit.

This value is public and safe as an Actions variable. The workflow bakes it into the browser bundle.

## 3. Register the Stripe webhook

1. In the Stripe Dashboard sandbox, open **Workbench → Webhooks** and add an endpoint.
2. Set the URL to `https://YOUR-PROJECT.vercel.app/api/stripe-webhook`.
3. Subscribe to:

   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`

4. Copy that endpoint's signing secret beginning with `whsec_`.
5. Add it to Vercel as `STRIPE_WEBHOOK_SECRET`, then redeploy.

Stripe requires the raw request body to verify webhook signatures; the included endpoint already preserves it.

## 4. Sandbox acceptance test

Run each case from `https://badlandcampers.com`:

1. Build The Goat and pay in full with `4242 4242 4242 4242`, any future expiry, any three-digit CVC, and any ZIP.
2. Build The Buffalo, choose the 50% deposit, verify the payment button stays disabled until the terms checkbox is accepted, then complete payment.
3. Test a decline with `4000 0000 0000 0002`.
4. Cancel from Stripe and verify the cart remains intact.
5. Confirm a successful payment returns to the verified confirmation screen and clears the cart.
6. Confirm Stripe records the correct model, configuration, full build price, amount charged, and balance due.
7. Confirm the webhook delivery is `200` and the paid-order notification arrives.
8. Repeat on a phone-sized browser.

Do not use real card details in a Stripe sandbox.

## 5. Go-live checklist

1. Have counsel review `TERMS-DRAFT.md` and confirm the policy matches actual operations.
2. Complete Stripe business verification and enable desired live payment methods.
3. Replace the Vercel sandbox secret key with `sk_live_...`.
4. Create a separate live webhook endpoint and replace `STRIPE_WEBHOOK_SECRET` with its live signing secret.
5. Redeploy Vercel.
6. Place one controlled real order, verify the webhook and confirmation, then refund it in Stripe.
7. Document who monitors failed payments, webhook failures, refunds, disputes, and remaining-balance invoices.

Official references:

- https://docs.stripe.com/payments/checkout/how-checkout-works
- https://docs.stripe.com/checkout/fulfillment
- https://docs.stripe.com/webhooks
- https://docs.stripe.com/testing
