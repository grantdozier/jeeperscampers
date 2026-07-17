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
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Info,
} from 'lucide-react';
import { calculateDeposit, DEPOSIT_PERCENT } from '../lib/pricing';
import {
  DEPOSIT_TERMS,
  DEPOSIT_TERMS_VERSION,
  DEPOSIT_TERMS_IS_DRAFT,
  DEPOSIT_INFO_BULLETS,
  DEPOSIT_CONSENT_LINE,
} from '../lib/terms';

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
  const [showTerms, setShowTerms] = useState(false);
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
Base: Rolling Camper Frame with Timbren axle-less suspension; Enclosed Cabin with Single Door${
          config.model === 'buffalo' ? '; Second Cabin Door; Rear Doors' : ''
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
      setShowTerms(true);
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
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <ShoppingCart className="mr-3 text-orange-500" size={28} />
          Complete Your Order
        </h2>

        {/* Order Summary */}
        <div className="bg-gray-700 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">Order Summary</h3>
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
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-4">Choose how to pay</h3>
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
              </div>
              <p className="text-2xl font-bold mb-1">${depositAmount.toLocaleString()} now</p>
              <p className="text-sm text-gray-400">
                Lock in your build. Remaining{' '}
                <span className="text-gray-200 font-semibold">${balanceDue.toLocaleString()}</span> due within 30
                days of completion.
              </p>
            </button>
          </div>
        </div>

        {/* Deposit terms box — required before the deposit path can proceed */}
        {paymentMode === 'deposit' && (
          <div className="mb-6 bg-gray-700 rounded-lg border border-gray-600 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowTerms((s) => !s)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <span className="flex items-center font-bold">
                <ShieldCheck className="mr-2 text-orange-500" size={20} />
                50% Deposit Terms
              </span>
              {showTerms ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            <div className="px-4 pb-2">
              <ul className="space-y-1.5 text-sm text-gray-300">
                {DEPOSIT_INFO_BULLETS.map((b, i) => (
                  <li key={i} className="flex">
                    <span className="text-orange-500 mr-2">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {showTerms && (
              <div className="px-4 pb-4 pt-2 max-h-72 overflow-y-auto border-t border-gray-600 mt-2 space-y-3">
                {DEPOSIT_TERMS_IS_DRAFT && (
                  <p className="flex items-start text-xs text-yellow-300 bg-yellow-900/30 rounded p-2">
                    <Info size={14} className="mr-2 mt-0.5 flex-shrink-0" />
                    These terms are being finalized. Bracketed items will be confirmed in writing before your
                    purchase is completed.
                  </p>
                )}
                {DEPOSIT_TERMS.map((section) => (
                  <div key={section.title}>
                    <h5 className="font-bold text-sm text-orange-400 mb-1">{section.title}</h5>
                    <ul className="space-y-1 text-xs text-gray-300">
                      {section.items.map((item, i) => (
                        <li key={i} className="flex">
                          <span className="text-gray-500 mr-2">–</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            <label className="flex items-start p-4 border-t border-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 mr-3 h-4 w-4 accent-orange-500 flex-shrink-0"
              />
              <span className="text-sm text-gray-300">{DEPOSIT_CONSENT_LINE}</span>
            </label>
          </div>
        )}

        {/* Contact / delivery form */}
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="flex flex-col sm:flex-row gap-4">
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
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/40 disabled:cursor-not-allowed text-white py-4 rounded-lg font-bold text-lg transition flex items-center justify-center"
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

        <div className="mt-6 flex items-center justify-center text-sm text-gray-400">
          <ShieldCheck size={16} className="mr-2 text-gray-500" />
          Secure payment processed by Stripe. You’ll be redirected to complete your purchase.
        </div>
      </div>
    </div>
  );
};
