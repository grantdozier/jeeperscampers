import React, { useState } from 'react';
import {
  ShoppingCart,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Clock,
  ShieldCheck,
  AlertCircle,
  Info,
  Lock,
  FileText,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { calculateDeposit, DEPOSIT_PERCENT } from '../lib/pricing';
import { DEPOSIT_TERMS_VERSION } from '../lib/terms';

interface CartItem {
  id: string;
  config: any;
  price: number;
}

interface OrderFormProps {
  cart: CartItem[];
  onBackToBuilder: () => void;
  getConfigDisplay: (config: any) => string;
}

interface OrderFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  specialRequests: string;
}

type PaymentMode = 'full' | 'deposit';

// Base URL of the Vercel deployment hosting the /api functions.
// Set REACT_APP_CHECKOUT_API_BASE at build time (see .env.example).
const API_BASE = (process.env.REACT_APP_CHECKOUT_API_BASE || '').trim().replace(/\/+$/, '');

const FORMSPREE_URL = 'https://formspree.io/f/xblzbazr';

export const OrderForm: React.FC<OrderFormProps> = ({ cart, onBackToBuilder, getConfigDisplay }) => {
  const [formData, setFormData] = useState<OrderFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    specialRequests: '',
  });

  const [paymentMode, setPaymentMode] = useState<PaymentMode>('full');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const orderTotal = cart.reduce((sum, item) => sum + item.price, 0);
  const depositAmount = calculateDeposit(orderTotal);
  const balanceDue = orderTotal - depositAmount;
  const amountNow = paymentMode === 'deposit' ? depositAmount : orderTotal;

  const formatOrderDetails = () =>
    cart
      .map((item, index) => {
        const config = item.config;
        const accessories =
          Object.entries(config)
            .filter(([key, value]) => !['frame', 'wheels'].includes(key) && value === true)
            .map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()))
            .join(', ') || 'None';
        return `CAMPER #${index + 1}:
Camper: ${config.model === 'goat' ? 'The Goat' : 'The Buffalo'}
Base: Welded and powder-coated 2-inch steel frame; Timbren axle-less suspension; Standard hitch insert; Enclosed Cabin with Single Door${
          config.model === 'buffalo' ? '; Rear Doors' : ''
        }
Accessories: ${accessories}
Price: $${item.price.toLocaleString()}
`;
      })
      .join('\n');

  // Fire-and-forget lead capture with the FULL configuration (Stripe metadata is
  // size-limited, so we email the complete build details here before redirecting).
  const sendPendingNotification = (orderId: string) => {
    const payload = {
      _subject: `⏳ PENDING PAYMENT (${paymentMode === 'deposit' ? '50% deposit' : 'full'}) — Badland Campers — ${formData.name} — $${amountNow.toLocaleString()}`,
      _replyto: formData.email,
      _cc: 'grant@doziertechgroup.com',
      company_name: 'Badland Campers',
      order_id: orderId,
      payment_mode: paymentMode,
      customer_name: formData.name,
      customer_email: formData.email,
      customer_phone: formData.phone,
      delivery_address: formData.address,
      special_requests: formData.specialRequests,
      order_details: formatOrderDetails(),
      order_total: `$${orderTotal.toLocaleString()}`,
      amount_due_now: `$${amountNow.toLocaleString()}`,
      balance_due_later: paymentMode === 'deposit' ? `$${balanceDue.toLocaleString()}` : '$0',
      order_count: cart.length,
      order_timestamp: new Date().toLocaleString(),
      status: 'Customer sent to Stripe checkout — not yet paid.',
    };
    fetch(FORMSPREE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {
      /* best-effort — never block checkout on the notification */
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // guard against a fast double-submit before the button disables
    setPaymentError(null);

    if (!formData.name || !formData.email) {
      setPaymentError('Please enter your name and email address.');
      return;
    }
    if (paymentMode === 'deposit' && !termsAccepted) {
      setPaymentError('Please read and accept the 50% deposit terms to reserve your build.');
      return;
    }
    if (!API_BASE) {
      setPaymentError(
        'Online payment isn’t configured yet. Please contact us at grant@doziertechgroup.com to complete your order.',
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const orderId = `BC-${Date.now()}`;

      const res = await fetch(`${API_BASE}/api/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: cart.map((i) => ({ config: i.config })),
          paymentOption: paymentMode,
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            specialRequests: formData.specialRequests,
          },
          termsAccepted: paymentMode === 'deposit' ? termsAccepted : undefined,
          termsVersion: DEPOSIT_TERMS_VERSION,
          orderId,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'We couldn’t start checkout. Please try again.');
      }

      // Session created — now send the lead/pending email (with the full config),
      // then redirect to Stripe's hosted Checkout page. Sending only after success
      // avoids phantom "pending" emails when checkout creation fails.
      sendPendingNotification(orderId);
      window.location.href = data.url;
    } catch (err: any) {
      setPaymentError(
        err?.message || 'There was a problem starting your payment. Please try again or contact us.',
      );
      setIsSubmitting(false);
    }
  };

  const payDisabled = isSubmitting || (paymentMode === 'deposit' && !termsAccepted);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 p-5 shadow-2xl sm:p-8">
        <div className="mb-8 rounded-xl border border-gray-700 bg-gradient-to-r from-orange-500/15 via-gray-900 to-gray-900 p-6 sm:p-8">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.24em] text-orange-400">Secure checkout</p>
          <h2 className="flex items-center text-3xl font-black sm:text-4xl">
            <ShoppingCart className="mr-3 text-orange-500" size={32} />
            Complete Your Order
          </h2>
          <p className="mt-3 max-w-2xl text-gray-300">
            Review your build, choose how you want to pay, and finish securely through Stripe.
          </p>
          <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
            {[
              [CheckCircle, '1. Build reviewed'],
              [CreditCard, '2. Choose payment'],
              [Lock, '3. Pay securely'],
            ].map(([Icon, label]: any) => (
              <div key={label} className="flex items-center rounded-lg border border-gray-700 bg-black/20 px-4 py-3 font-bold text-gray-200">
                <Icon className="mr-2 text-orange-400" size={18} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="mb-8 rounded-xl border border-gray-700 bg-gray-800 p-5 sm:p-6">
          <h3 className="mb-4 flex items-center text-xl font-black">
            <FileText className="mr-2 text-orange-400" size={21} />
            Build summary
          </h3>
          <div className="space-y-4">
            {cart.map((item, index) => (
              <div key={item.id} className="border-b border-gray-600 pb-4">
                <h4 className="font-bold text-orange-500 mb-2">Camper #{index + 1}</h4>
                <p className="text-sm text-gray-300 mb-2">{getConfigDisplay(item.config)}</p>
                <p className="text-lg font-bold">${item.price.toLocaleString()}</p>
              </div>
            ))}
            <div className="flex justify-between items-center text-2xl font-bold pt-2">
              <span>Build Total:</span>
              <span className="text-orange-500">${orderTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment option selector */}
        <div className="mb-8">
          <div className="mb-4">
            <h3 className="text-xl font-black">Choose how to pay</h3>
            <p className="mt-1 text-sm text-gray-400">Your selection determines the amount collected today.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4" role="radiogroup" aria-label="Payment option">
            {/* Pay in full */}
            <button
              type="button"
              role="radio"
              aria-checked={paymentMode === 'full'}
              onClick={() => {
                if (paymentMode !== 'full') {
                  setPaymentMode('full');
                  setTermsAccepted(false);
                }
              }}
              className={`text-left p-5 rounded-lg border-2 transition ${
                paymentMode === 'full'
                  ? 'border-orange-500 bg-gray-700'
                  : 'border-gray-600 bg-gray-800 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center mb-2">
                <CreditCard className="mr-2 text-orange-500" size={20} />
                <span className="font-bold">Pay in Full</span>
              </div>
              <p className="text-2xl font-bold mb-1">${orderTotal.toLocaleString()}</p>
              <p className="text-sm text-gray-400">
                Card and other methods. Or <span className="text-orange-400 font-semibold">finance with Affirm</span>{' '}
                at checkout — subject to approval.
              </p>
            </button>

            {/* 50% deposit */}
            <button
              type="button"
              role="radio"
              aria-checked={paymentMode === 'deposit'}
              onClick={() => {
                if (paymentMode !== 'deposit') {
                  setPaymentMode('deposit');
                  setTermsAccepted(false);
                }
              }}
              className={`text-left p-5 rounded-lg border-2 transition ${
                paymentMode === 'deposit'
                  ? 'border-orange-500 bg-gray-700'
                  : 'border-gray-600 bg-gray-800 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center mb-2">
                <Clock className="mr-2 text-orange-500" size={20} />
                <span className="font-bold">Reserve with {DEPOSIT_PERCENT}% Deposit</span>
                <span className="ml-auto rounded-full bg-orange-500/20 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-orange-300">
                  Build reservation
                </span>
              </div>
              <p className="text-2xl font-bold mb-1">${depositAmount.toLocaleString()} now</p>
              <p className="text-sm text-gray-400">
                Lock in your build. Remaining{' '}
                <span className="text-gray-200 font-semibold">${balanceDue.toLocaleString()}</span> due within 30
                days of completion notice.
              </p>
            </button>
          </div>
          {paymentMode === 'full' && (
            <div className="mt-4 flex items-start rounded-lg border border-blue-400/20 bg-blue-400/10 p-4 text-sm text-blue-100">
              <Info className="mr-2 mt-0.5 shrink-0 text-blue-300" size={17} />
              Financing options shown by Stripe, including Affirm when eligible, are offered by third parties and are subject to approval and their terms.
            </div>
          )}
        </div>

        {/* Compact deposit agreement. Full terms open separately so cart state is preserved. */}
        {paymentMode === 'deposit' && (
          <section className="mb-8 overflow-hidden rounded-xl border border-orange-500/35 bg-gradient-to-br from-orange-500/10 via-gray-800 to-gray-800 shadow-lg shadow-black/10">
            <div className="flex flex-col gap-5 p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-orange-500/15 p-2.5 text-orange-400">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-400">
                      Build reservation agreement
                    </p>
                    <h3 className="mt-1 text-xl font-black">Review before reserving your build</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
                      Your deposit reserves production capacity and authorizes Badland Campers
                      to begin scheduling, purchasing, and work for your selected configuration.
                    </p>
                  </div>
                </div>
                <a
                  href="?legal=deposit-terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-600 bg-gray-900/70 px-4 py-2.5 text-sm font-bold text-gray-100 transition hover:border-orange-500 hover:text-orange-300"
                >
                  View full terms
                  <ExternalLink size={15} />
                </a>
              </div>

              <div className="grid overflow-hidden rounded-lg border border-gray-700 bg-gray-900/60 sm:grid-cols-3 sm:divide-x sm:divide-gray-700">
                <div className="border-b border-gray-700 p-4 sm:border-b-0">
                  <p className="text-xs font-black uppercase tracking-wider text-gray-500">Pay today</p>
                  <p className="mt-1 text-lg font-black text-white">${depositAmount.toLocaleString()}</p>
                  <p className="mt-1 text-xs text-gray-400">50% build deposit</p>
                </div>
                <div className="border-b border-gray-700 p-4 sm:border-b-0">
                  <p className="text-xs font-black uppercase tracking-wider text-gray-500">Balance later</p>
                  <p className="mt-1 text-lg font-black text-white">${balanceDue.toLocaleString()}</p>
                  <p className="mt-1 text-xs text-gray-400">Due after completion notice</p>
                </div>
                <div className="p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-gray-500">Release</p>
                  <p className="mt-1 text-sm font-bold text-white">After cleared payment</p>
                  <p className="mt-1 text-xs text-gray-400">Before pickup or delivery</p>
                </div>
              </div>
            </div>

            <label
              className={`flex cursor-pointer items-start gap-3 border-t p-5 transition sm:p-6 ${
                termsAccepted
                  ? 'border-orange-500/40 bg-orange-500/10'
                  : 'border-gray-700 bg-black/10 hover:bg-black/20'
              }`}
            >
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-orange-500"
              />
              <span>
                <span className="block text-sm font-bold text-gray-100">
                  I have reviewed and agree to the 50% Build Deposit Terms.
                </span>
                <span className="mt-1 block text-xs leading-5 text-gray-400">
                  I authorize Badland Campers to begin my custom build and understand that
                  the remaining balance is due within 30 calendar days after written completion
                  or availability notice. Agreement version {DEPOSIT_TERMS_VERSION}.
                </span>
              </span>
            </label>
          </section>
        )}

        {/* Contact / delivery form */}
        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-gray-700 bg-gray-800 p-5 sm:p-6">
          <div>
            <h3 className="text-xl font-black">Contact and delivery details</h3>
            <p className="mt-1 text-sm text-gray-400">We use this information to confirm your build and coordinate next steps.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold mb-2 flex items-center">
                <User className="mr-2 text-orange-500" size={16} />
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 flex items-center">
                <Mail className="mr-2 text-orange-500" size={16} />
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 flex items-center">
                <Phone className="mr-2 text-orange-500" size={16} />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 flex items-center">
                <MapPin className="mr-2 text-orange-500" size={16} />
                Delivery Location
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                placeholder="City, State"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Special Requests or Notes</label>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none h-24"
              placeholder="Any special requests, delivery instructions, or questions..."
            />
          </div>

          {paymentError && (
            <div
              role="alert"
              aria-live="assertive"
              className="flex items-start bg-red-900/40 border border-red-700 rounded-lg p-4 text-sm text-red-200"
            >
              <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{paymentError}</span>
            </div>
          )}

          <div className="flex flex-col-reverse gap-4 border-t border-gray-700 pt-6 sm:flex-row">
            <button
              type="button"
              onClick={onBackToBuilder}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-4 rounded-lg font-bold text-lg transition"
            >
              Back to Builder
            </button>

            <button
              type="submit"
              disabled={payDisabled}
              className="flex-[1.35] bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/40 disabled:cursor-not-allowed text-white py-4 rounded-lg font-black text-lg transition flex items-center justify-center shadow-lg shadow-orange-950/30"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Redirecting to secure checkout...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2" size={20} />
                  {paymentMode === 'deposit'
                    ? `Pay ${DEPOSIT_PERCENT}% Deposit — $${depositAmount.toLocaleString()}`
                    : `Pay in Full — $${orderTotal.toLocaleString()}`}
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mx-auto mt-6 max-w-3xl rounded-lg border border-gray-700 bg-black/20 p-4 text-center text-xs leading-relaxed text-gray-400">
          Prices exclude applicable taxes, title, registration, government charges, freight, and delivery unless stated otherwise.
          Your selected configuration and accepted deposit terms control the order. Completing payment authorizes the selected charge.
        </div>

        <div className="mt-6 flex items-center justify-center text-sm text-gray-400">
          <ShieldCheck size={16} className="mr-2 text-gray-500" />
          Secure payment processed by Stripe. You’ll be redirected to complete your purchase.
        </div>
      </div>
    </div>
  );
};
