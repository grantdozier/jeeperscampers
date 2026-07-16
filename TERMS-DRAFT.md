# 50% Deposit Terms — DRAFT for review

> ⚠️ **Draft template — not legal advice.** It contains `[BRACKETED PLACEHOLDERS]`
> that are business/legal decisions you must make, and sample language that has not
> been reviewed for your jurisdiction. **Have a licensed attorney review this and
> reconcile it with Badland Campers' actual policies before switching to live Stripe
> keys.**

The live text is stored in **`src/lib/terms.ts`** and rendered on the order form when a
customer chooses "Reserve with 50% Deposit." Editing that file updates the website.
Once you've finalized the bracketed items, set `DEPOSIT_TERMS_IS_DRAFT = false` in that
file to remove the "being finalized" banner.

---

## ❓ Decisions needed from you (this is what makes it final)

1. **Refundability** — Are deposits refundable, and for how long (grace period)? What
   restocking / custom-work fee (%) applies once a build **starts** or after **completion**?
2. **Balance deadline mechanics** — Confirm the number of days (default **30**) and how/when
   "completion or availability" is officially communicated (email, phone, written notice)
   to start the clock.
3. **Governing law** — Which **state's** law governs, and which **county/state** is the venue
   for disputes?
4. **Storage & late fees** — Should storage fees accrue if the balance is late? At what rate
   (`$/day` or `$/week`) and after how many days? What happens if the balance is **never**
   paid (cancel, resell, forfeit deposit)?
5. **Sales tax / title / registration / delivery** — How are these calculated and collected —
   at deposit, at final payment, or at delivery — and for which states?
6. **Configuration changes** — Should customer-requested changes after deposit require an
   additional deposit and/or reset the build timeline and price lock?

Send me answers to these and I'll drop them straight into `src/lib/terms.ts`.

---

## Current draft text

### 1. Your Deposit
- Your deposit equals **50% of the total quoted price** of your selected camper build.
- Placing this deposit **reserves a build slot** and **locks in your chosen configuration
  and the quoted price** for that build.
- Because each camper is **custom-built to order**, your deposit authorizes us to begin
  scheduling, ordering materials, and constructing your unit to the configuration selected.

### 2. Remaining Balance
- The remaining balance is the **other 50%** of the total quoted price.
- The balance is due **within [30] days** after we notify you that your build is **complete
  or otherwise available** for delivery or pickup (by email and/or phone).
- **Full payment is required before you take delivery or possession.** We cannot release the
  unit until payment clears in full.

### 3. What the Deposit Secures
- A confirmed **place in our build queue**.
- Your **selected configuration** (floor plan, options, and add-ons on your order).
- The **quoted price**, protected from future price changes per Section 4.

### 4. Price Validity
- The quoted price is valid for the specific build and configuration on your order.
- **Changes you request** after your deposit may adjust the total and/or timeline and may
  require an additional deposit on the increase.
- Prices for new/future orders are subject to change and not guaranteed until a deposit is placed.

### 5. Refunds & Cancellation *(you confirm)*
- Deposits are **[refundable / non-refundable] within [X] days** of being placed.
- Once your build has **started**, custom-order deposits are **[non-refundable / refundable
  less a [XX]% restocking or custom-work fee]**.
- If you cancel after completion, a **[XX]% restocking fee** and incurred costs **[may / will]** apply.
- Approved refunds are issued to the **original payment method** within **[X] business days**.

### 6. Late Balance / Storage *(you confirm)*
- If the balance isn't paid within **[30] days** of the availability notice, **storage fees of
  [$X per day / per week]** may accrue.
- If unpaid after **[X] days**, we **[may cancel and apply Section 5 / may resell the unit and
  retain fees]**.

### 7. Taxes, Title, Registration & Delivery
- Prices/deposits **exclude** sales/use tax, title, registration/licensing, and delivery/freight.
- These are **quoted and billed separately** and are the buyer's responsibility unless stated
  in writing.

### 8. Delivery & Possession
- Estimated completion dates are **good-faith estimates**, not guarantees.
- Title and risk of loss transfer to the buyer **only after** the balance is paid in full and
  the unit is delivered or picked up.

### 9. Governing Law
- Governed by the laws of the **State of [STATE]**; disputes handled in the courts of
  **[COUNTY/STATE]**.

### 10. Agreement
- By placing your 50% deposit, you acknowledge you have read, understood, and agreed to these terms.

---

### Checkout consent line (next to the required checkbox)
> I understand my 50% deposit reserves my custom build and locks in my configuration and price,
> that the remaining 50% balance is due within [30] days of build completion/availability and
> must be paid in full before I take possession, and I agree to the Deposit Terms.
