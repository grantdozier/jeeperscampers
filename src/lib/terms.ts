// Single source of truth for the "Pay 50% Deposit" terms.
//
// Rendered in the order form's collapsible terms box (src/components/OrderForm.tsx)
// and mirrored for the client to finalize in TERMS-DRAFT.md.
//
// IMPORTANT: This is a DRAFT. Items in [BRACKETS] are business/legal decisions the
// client must confirm (refund policy, governing state, storage/late fees, tax
// handling) and the whole document should be reviewed by a licensed attorney
// before switching to LIVE Stripe keys. See OPEN_QUESTIONS below.

export const DEPOSIT_TERMS_VERSION = '2026-07-03-draft-1';

// Flip to false once the client has finalized the bracketed items and had them
// reviewed. Controls the "draft" banner shown in the on-site terms box.
export const DEPOSIT_TERMS_IS_DRAFT = true;

export interface TermsSection {
  title: string;
  items: string[];
  /** true = contains unresolved [placeholders] the client must finalize */
  needsClientInput?: boolean;
}

// Short, customer-friendly summary shown at the top of the info box.
export const DEPOSIT_INFO_BULLETS: string[] = [
  'Pay 50% now to reserve your build slot and lock in your configuration and price.',
  'The remaining 50% balance is due within 30 days of build completion / availability.',
  "Full payment is required before delivery or pickup — we can't release the camper until the balance clears.",
  'Your deposit authorizes us to begin your custom, build-to-order camper.',
  'Tax, title, registration, and delivery are not included and are quoted separately.',
];

// One-line consent shown next to the required checkbox.
export const DEPOSIT_CONSENT_LINE =
  'I understand my 50% deposit reserves my custom build and locks in my configuration and price, ' +
  'that the remaining 50% balance is due within 30 days of build completion/availability and must be ' +
  'paid in full before I take possession, and I agree to the Deposit Terms below.';

export const DEPOSIT_TERMS: TermsSection[] = [
  {
    title: '1. Your Deposit',
    items: [
      'Your deposit equals 50% of the total quoted price of your selected camper build.',
      'Placing this deposit reserves a build slot for your camper and locks in your chosen configuration and the quoted price for that build.',
      'Because each camper is custom-built to order, your deposit authorizes us to begin scheduling, ordering materials, and constructing your unit to the configuration you selected.',
    ],
  },
  {
    title: '2. Remaining Balance',
    items: [
      'The remaining balance is the other 50% of the total quoted price.',
      'The balance becomes due within [30] days after we notify you that your build is complete or otherwise available for delivery or pickup. Notification may be sent by email and/or phone to the contact information on your order.',
      'Full payment of the balance is required before you take delivery or possession of the camper. We cannot release, deliver, or transfer the unit until payment has cleared in full.',
    ],
    needsClientInput: true,
  },
  {
    title: '3. What the Deposit Secures',
    items: [
      'A confirmed place in our build queue.',
      'Your selected configuration (floor plan, options, and add-ons as listed on your order).',
      'The quoted price for that configuration, protected from future price changes as described below.',
    ],
  },
  {
    title: '4. Price Validity',
    items: [
      'The quoted price is valid for the specific build and configuration on your order.',
      'Changes you request to the configuration after your deposit may adjust the total price and/or the build timeline, and may require an additional deposit on the increased amount.',
      'Prices for new or future orders are subject to change and are not guaranteed until a deposit is placed.',
    ],
  },
  {
    title: '5. Refunds & Cancellation',
    items: [
      'Deposits are [refundable / non-refundable] within [X] days of being placed.',
      'Once your build has started, custom-order deposits are [non-refundable / refundable less a [XX]% restocking or custom-work fee], because materials and labor are committed specifically to your unit.',
      'If you cancel after completion, a [XX]% restocking fee and any incurred costs [may / will] apply.',
      'Any approved refund will be issued to the original payment method within [X] business days.',
    ],
    needsClientInput: true,
  },
  {
    title: '6. Late Balance / Storage',
    items: [
      'If the balance is not paid within [30] days of the availability notice, storage fees of [$X per day / per week] may begin to accrue.',
      'If the balance remains unpaid after [X] days, we [may treat the order as cancelled and apply the cancellation terms above / may resell the unit and retain fees as described above].',
    ],
    needsClientInput: true,
  },
  {
    title: '7. Taxes, Title, Registration & Delivery',
    items: [
      'Quoted prices and deposit amounts exclude sales/use tax, title, registration/licensing, and delivery or freight charges.',
      "These items are quoted and billed separately and are the buyer's responsibility unless expressly stated in writing.",
    ],
  },
  {
    title: '8. Delivery & Possession',
    items: [
      'Estimated completion dates are good-faith estimates, not guarantees, and may be affected by materials, suppliers, or factors outside our control.',
      'Title and risk of loss transfer to the buyer only after the balance is paid in full and the unit is delivered or picked up.',
    ],
  },
  {
    title: '9. Governing Law',
    items: [
      'These terms are governed by the laws of the State of [STATE], without regard to conflict-of-law rules. Any dispute will be handled in the courts located in [COUNTY/STATE].',
    ],
    needsClientInput: true,
  },
  {
    title: '10. Agreement',
    items: [
      'By placing your 50% deposit, you acknowledge that you have read, understood, and agreed to these terms.',
    ],
  },
];

// Decisions the client must make before these terms go live. Surfaced in
// TERMS-DRAFT.md (task: "Finalize deposit terms copy for client review").
export const OPEN_QUESTIONS: string[] = [
  'Refundability: Are deposits refundable, and for how long (grace period)? What restocking or custom-work fee (%) applies once a build starts or after completion?',
  "Balance deadline mechanics: Confirm the exact number of days (default 30) and how/when 'completion or availability' is officially communicated (email, phone, written notice) to start the clock.",
  'Governing law: Which state’s law governs, and which county/state is the venue for disputes?',
  'Storage & late fees: Should storage fees accrue if the balance is late? At what rate ($/day or $/week) and after how many days? What happens if the balance is never paid (cancel, resell, forfeit deposit)?',
  'Sales tax handling: How are sales/use tax, title, registration, and delivery/freight calculated and collected — at deposit, at final payment, or at delivery — and for which states?',
  'Configuration changes: Should customer-requested changes after deposit require an additional deposit and/or reset the build timeline and price lock?',
];

export const TERMS_LEGAL_DISCLAIMER =
  'This is a draft template for discussion only and is not legal advice. It contains ' +
  'placeholders and sample language that have not been reviewed for your jurisdiction. Before ' +
  'publishing, have these terms reviewed by a licensed attorney and reconciled with Badland ' +
  "Campers' actual refund, cancellation, storage, tax, and delivery policies.";
