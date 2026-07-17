// Customer-facing 50% deposit policy. This operational policy contains no
// placeholders, but counsel in the seller's state should review it before live use.

export const DEPOSIT_TERMS_VERSION = '2026-07-17-v1';
export const DEPOSIT_TERMS_IS_DRAFT = false;

export interface TermsSection {
  title: string;
  items: string[];
  needsClientInput?: boolean;
}

export const DEPOSIT_INFO_BULLETS: string[] = [
  'Pay 50% now to reserve your build slot and lock in your configuration and price.',
  'The remaining 50% is due within 30 calendar days after written completion or availability notice.',
  'Full cleared payment is required before delivery or pickup.',
  'A three-business-day cancellation window applies unless authorized custom work or non-returnable purchasing has already begun.',
  'Applicable tax, title, registration, government, and delivery charges are added to the final invoice.',
];

export const DEPOSIT_CONSENT_LINE =
  'I authorize Badland Campers to begin my custom build, understand that the remaining balance ' +
  'is due within 30 calendar days after written completion or availability notice, and agree to ' +
  'the Deposit Terms below, including the cancellation and storage provisions.';

export const DEPOSIT_TERMS: TermsSection[] = [
  {
    title: '1. Deposit and Build Authorization',
    items: [
      'The deposit is 50% of the quoted camper price and reserves a place in the build queue.',
      'The deposit locks the price of the model, configuration, and options listed on the accepted order, subject to approved change orders, taxes, government charges, and delivery costs.',
      'Payment authorizes Badland Campers to schedule the build, perform design and labor, and order materials for the selected custom configuration.',
    ],
  },
  {
    title: '2. Remaining Balance',
    items: [
      'The remaining balance is the unpaid 50% of the quoted camper price plus applicable final-invoice charges.',
      'The balance is due within 30 calendar days after Badland Campers sends written notice by email that the camper is complete or available for delivery or pickup.',
      'The camper will not be released, delivered, or transferred until all amounts have cleared in full.',
    ],
  },
  {
    title: '3. Configuration and Price Changes',
    items: [
      'The accepted order controls the model, configuration, included equipment, options, and quoted price.',
      'A requested change is effective only after Badland Campers accepts it in writing.',
      'An accepted change may alter price and completion timing. Fifty percent of any price increase is due when the change is approved.',
    ],
  },
  {
    title: '4. Cancellation and Refunds',
    items: [
      'The buyer may cancel in writing within three business days after payment for a full refund, provided Badland Campers has not already ordered non-returnable materials or started work with the buyer’s authorization.',
      'After that period, or once authorized work or non-returnable purchasing begins, the deposit is non-refundable to the extent of design work, labor, payment-processing costs, restocking charges, and materials committed to the custom build.',
      'If Badland Campers cancels for reasons not caused by the buyer, it will refund amounts paid for work or materials not already provided or irrevocably committed.',
      'Any refund due will be returned to the original payment method within 10 business days after the amount is determined.',
    ],
  },
  {
    title: '5. Completion, Late Payment, and Storage',
    items: [
      'Completion dates are good-faith estimates and may change because of materials, suppliers, weather, transportation, or circumstances outside reasonable control.',
      'If the balance is unpaid 30 calendar days after written availability notice, a storage charge of $25 per day may accrue, except where prohibited by law.',
      'If the balance remains unpaid 60 calendar days after notice, Badland Campers may treat the order as cancelled, resell the camper, and apply amounts paid against documented costs, storage, and other amounts due. Any remaining surplus will be refunded.',
    ],
  },
  {
    title: '6. Taxes, Title, Registration, and Delivery',
    items: [
      'Website and configuration prices exclude sales or use tax, title, registration, licensing, government fees, and delivery or freight unless expressly stated otherwise.',
      'Applicable charges will appear on the final invoice and are due with the remaining balance.',
      'The buyer is responsible for registration and legal road use in the buyer’s jurisdiction unless a signed order states otherwise.',
    ],
  },
  {
    title: '7. Delivery, Title, and Risk of Loss',
    items: [
      'Pickup or delivery will be scheduled after all amounts clear and any required paperwork is complete.',
      'Title and risk of loss transfer only when the paid camper is delivered to or picked up by the buyer.',
      'The buyer must inspect the camper at handoff and note any visible issue in writing before accepting delivery.',
    ],
  },
  {
    title: '8. Governing Law and Venue',
    items: [
      "These terms are governed by the laws of the state where Badland Campers' principal place of business is located, without regard to conflict-of-law rules.",
      'Any court proceeding must be brought in the county containing that principal place of business unless applicable law requires otherwise.',
    ],
  },
  {
    title: '9. Electronic Agreement',
    items: [
      'Electronic acceptance and payment constitute the buyer’s signature and agreement to these terms.',
      'The buyer consents to receive order, completion, invoice, and payment notices at the email address provided with the order.',
    ],
  },
];

export const OPEN_QUESTIONS: string[] = [];

export const TERMS_LEGAL_DISCLAIMER =
  'Operational terms generated for launch readiness. Have a licensed attorney in the seller’s ' +
  'state review them before enabling live payments, and confirm that the stated cancellation, ' +
  'storage, tax, delivery, and refund practices match actual business operations.';
