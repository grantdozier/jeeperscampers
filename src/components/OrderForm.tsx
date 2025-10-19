import React, { useState } from 'react';
import { ShoppingCart, User, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';

interface CartItem {
  id: string;
  config: any;
  price: number;
}

interface OrderFormProps {
  cart: CartItem[];
  onOrderComplete: () => void;
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

export const OrderForm: React.FC<OrderFormProps> = ({
  cart,
  onOrderComplete,
  onBackToBuilder,
  getConfigDisplay
}) => {
  const [formData, setFormData] = useState<OrderFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    specialRequests: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const orderTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const formatOrderDetails = () => {
    return cart.map((item, index) => {
      const config = item.config;
      return `CAMPER #${index + 1}:
Frame Type: ${config.frame?.charAt(0).toUpperCase() + config.frame?.slice(1)} 
Wheel Package: ${config.wheels?.charAt(0).toUpperCase() + config.wheels?.slice(1)}
Accessories: ${Object.entries(config)
  .filter(([key, value]) => !['frame', 'wheels'].includes(key) && value === true)
  .map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))
  .join(', ') || 'None'}
Price: $${item.price.toLocaleString()}
`;
    }).join('\n');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      alert('Please fill in your name and email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderDetails = formatOrderDetails();
      
      const response = await fetch('https://formspree.io/f/xblzbazr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Customer Information
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          delivery_address: formData.address,
          special_requests: formData.specialRequests,
          
          // Order Details
          order_details: orderDetails,
          order_total: `$${orderTotal.toLocaleString()}`,
          order_count: cart.length,
          order_timestamp: new Date().toLocaleString(),
          
          // Formspree Configuration
          _replyto: formData.email,
          _subject: `New Badland Campers Order - ${formData.name} - $${orderTotal.toLocaleString()}`,
          _cc: 'grant@doziertechgroup.com',
          
          // Email Template Data
          company_name: 'Badland Campers',
          order_id: `BC-${Date.now()}`,
        }),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          onOrderComplete();
          onBackToBuilder();
        }, 3000);
      } else {
        throw new Error('Failed to submit order');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      alert('There was an error submitting your order. Please try again or contact us directly at grant@doziertechgroup.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-8 text-center">
        <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
        <h2 className="text-3xl font-bold text-green-500 mb-4">Order Submitted Successfully!</h2>
        <p className="text-gray-300 mb-6">
          Thank you, {formData.name}! Your order for ${orderTotal.toLocaleString()} has been received.
        </p>
        <p className="text-gray-400 mb-4">
          Confirmation emails have been sent to both you and our team.
          We'll contact you within 24 hours to confirm your order details.
        </p>
        <p className="text-sm text-gray-500">
          Redirecting to builder in a few seconds...
        </p>
      </div>
    );
  }

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
            <div className="flex justify-between items-center text-2xl font-bold pt-4">
              <span>Total:</span>
              <span className="text-orange-500">${orderTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Order Form */}
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
            <label className="block text-sm font-bold mb-2">
              Special Requests or Notes
            </label>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none h-24"
              placeholder="Any special requests, delivery instructions, or questions..."
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onBackToBuilder}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-4 rounded-lg font-bold text-lg transition"
            >
              Back to Builder
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-4 rounded-lg font-bold text-lg transition flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting Order...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2" size={20} />
                  Submit Order - ${orderTotal.toLocaleString()}
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-400 text-center">
            By submitting this order, you agree to be contacted by Badland Campers regarding your purchase.
            We'll send confirmation emails to both you and our team for your records.
          </p>
        </div>
      </div>
    </div>
  );
};
