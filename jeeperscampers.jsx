import React, { useState } from 'react';
import { ShoppingCart, Star, Menu, X, Check } from 'lucide-react';

const JeepersCampers = () => {
  const [activeTab, setActiveTab] = useState('builder');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const [config, setConfig] = useState({
    frame: 'standard',
    wheels: 'standard',
    sidePanels: true,
    frontPanel: true,
    rearPanel: false,
    diamondPlate: true,
    roofPlatform: true,
    roofRack: true,
    roofTent: true,
    roofLadder: true,
    rearKitchen: true,
    propaneTank: true,
    kitchenCounter: true,
    sideAccessDoors: true,
    storageBoxes: true,
    jerryCanMounts: false,
    toolBox: false,
    fenders: true,
    runningBoards: true,
    lightingKit: false,
    solarPanel: false,
    waterTank: false,
    batterySystem: false,
  });

  const [cart, setCart] = useState([]);
  const [orderForm, setOrderForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const reviews = [
    { id: 1, name: 'Mike T.', rating: 5, comment: 'Took this beauty through the Rockies. Handled like a dream!', date: '2024-09-15' },
    { id: 2, name: 'Sarah K.', rating: 5, comment: 'Perfect for weekend adventures. The kitchen setup is genius!', date: '2024-08-22' },
    { id: 3, name: 'John D.', rating: 4, comment: 'Great build quality. Only wish it came with more storage options.', date: '2024-07-30' },
    { id: 4, name: 'Lisa M.', rating: 5, comment: 'Worth every penny. Customer service was excellent too!', date: '2024-06-18' },
  ];

  const prices = {
    minimalist: 3999,
    standard: 5999,
    heavy: 7999,
    wheels_standard: 800,
    wheels_offroad: 1400,
    wheels_extreme: 2200,
    sidePanels: 1200,
    frontPanel: 400,
    rearPanel: 400,
    diamondPlate: 600,
    roofPlatform: 500,
    roofRack: 400,
    roofTent: 2500,
    roofLadder: 300,
    rearKitchen: 1800,
    propaneTank: 200,
    kitchenCounter: 400,
    sideAccessDoors: 600,
    storageBoxes: 400,
    jerryCanMounts: 150,
    toolBox: 300,
    fenders: 300,
    runningBoards: 250,
    lightingKit: 450,
    solarPanel: 1200,
    waterTank: 800,
    batterySystem: 900,
  };

  const calculatePrice = () => {
    let total = prices[config.frame] + prices['wheels_' + config.wheels];
    Object.keys(config).forEach((key) => {
      if (config[key] === true && prices[key]) total += prices[key];
    });
    return total;
  };

  const toggleConfig = (key) => setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  const setFrameType = (frame) => setConfig((prev) => ({ ...prev, frame }));
  const setWheelType = (wheels) => setConfig((prev) => ({ ...prev, wheels }));

  const addToCart = () => {
    const item = {
      id: Date.now(),
      config: { ...config },
      price: calculatePrice(),
    };
    setCart([...cart, item]);
    setShowCart(true);
  };

  const removeFromCart = (id) => setCart(cart.filter((i) => i.id !== id));

  const getConfigDisplay = (cfg) => {
    const parts = [];
    parts.push(cfg.frame.charAt(0).toUpperCase() + cfg.frame.slice(1) + ' Frame');
    parts.push(cfg.wheels.charAt(0).toUpperCase() + cfg.wheels.slice(1) + ' Wheels');
    if (cfg.sidePanels) parts.push('Side Panels');
    if (cfg.roofTent) parts.push('Roof Tent');
    if (cfg.rearKitchen) parts.push('Kitchen');
    if (cfg.solarPanel) parts.push('Solar');
    return parts.join(', ');
  };

  const getFrameDimensions = () => {
    if (config.frame === 'minimalist') return { width: 240, height: 120 };
    if (config.frame === 'standard') return { width: 300, height: 140 };
    return { width: 340, height: 160 };
  };

  const dims = getFrameDimensions();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* HEADER */}
      <header className="bg-gray-800 border-b border-orange-500">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="text-3xl font-bold text-orange-500">JEEPERS</div>
            <div className="text-2xl font-light">CAMPERS</div>
          </div>
          <nav className="hidden md:flex space-x-6">
            {['builder', 'reviews', 'about'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`hover:text-orange-500 transition ${
                  activeTab === tab ? 'text-orange-500' : ''
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            <button onClick={() => setShowCart(!showCart)} className="relative hover:text-orange-500">
              <ShoppingCart size={24} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cart.length}
                </span>
              )}
            </button>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden">
              {mobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {mobileMenu && (
          <nav className="md:hidden mt-4 flex flex-col space-y-2 px-4 pb-4">
            {['builder', 'reviews', 'about'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setMobileMenu(false);
                }}
                className="text-left hover:text-orange-500"
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        )}
      </header>

      {/* CART DRAWER */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-gray-800 w-full md:w-96 h-full overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Your Cart</h2>
              <button onClick={() => setShowCart(false)}>
                <X size={24} />
              </button>
            </div>
            {cart.length === 0 ? (
              <p className="text-gray-400">Your cart is empty</p>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="bg-gray-700 p-4 rounded">
                    <p className="text-sm mb-2">{getConfigDisplay(item.config)}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-orange-500 font-bold">${item.price.toLocaleString()}</span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <div className="border-t border-gray-600 pt-4">
                  <div className="flex justify-between text-xl font-bold mb-4">
                    <span>Total:</span>
                    <span className="text-orange-500">
                      ${cart.reduce((s, i) => s + i.price, 0).toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('order');
                      setShowCart(false);
                    }}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded font-bold"
                  >
                    Proceed to Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-4 py-8">
        {/* TABS */}
        {activeTab === 'builder' && (
          <div className="text-center text-gray-400">[Builder UI — shortened for brevity]</div>
        )}

        {activeTab === 'reviews' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Customer Reviews</h2>
            {reviews.map((r) => (
              <div key={r.id} className="bg-gray-800 p-6 mb-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <div>
                    <h3 className="font-bold">{r.name}</h3>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < r.rating ? 'fill-orange-500 text-orange-500' : 'text-gray-600'}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">{r.date}</span>
                </div>
                <p>{r.comment}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-6">About Jeepers Campers</h2>
            <p className="text-gray-300">
              At Jeepers Campers, we build adventure-ready trailers that combine durability and comfort.
              Each model is hand-crafted for the modern explorer.
            </p>
          </div>
        )}

        {activeTab === 'order' && (
          <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-6">Complete Your Order</h2>
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">Your cart is empty</p>
                <button
                  onClick={() => setActiveTab('builder')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded font-bold transition"
                >
                  Go to Builder
                </button>
              </div>
            ) : (
              <>
                <div className="bg-gray-700 rounded p-6 mb-6">
                  <h3 className="font-bold mb-4">Order Summary</h3>
                  {cart.map((item, idx) => (
                    <div key={item.id} className="mb-2 border-b border-gray-600 pb-2">
                      <p className="text-sm">
                        Camper #{idx + 1}: {getConfigDisplay(item.config)}
                      </p>
                      <p className="text-orange-500 font-bold">${item.price.toLocaleString()}</p>
                    </div>
                  ))}
                  <div className="flex justify-between text-xl font-bold mt-4">
                    <span>Total:</span>
                    <span className="text-orange-500">
                      ${cart.reduce((s, i) => s + i.price, 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={orderForm.name}
                    onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={orderForm.email}
                    onChange={(e) => setOrderForm({ ...orderForm, email: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={orderForm.phone}
                    onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2"
                  />
                  <textarea
                    placeholder="Delivery Address"
                    value={orderForm.address}
                    onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2"
                  />

                  <button
                    onClick={() => {
                      if (orderForm.name && orderForm.email) {
                        alert(
                          `Order submitted!\n\nName: ${orderForm.name}\nEmail: ${orderForm.email}\n\nTotal: $${cart
                            .reduce((s, i) => s + i.price, 0)
                            .toLocaleString()}`
                        );
                      } else {
                        alert('Please fill in name and email');
                      }
                    }}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded font-bold text-xl transition"
                  >
                    Submit Order
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default JeepersCampers;
