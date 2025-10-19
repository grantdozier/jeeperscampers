import React, { useState } from 'react';
import { ShoppingCart, Star, Menu, X, Wrench, Truck, Home } from 'lucide-react';
import CamperConfigurator from './CamperConfigurator';

const JeepersCampers = () => {
  const [activeTab, setActiveTab] = useState('builder');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<number>(0);
  const [showLightbox, setShowLightbox] = useState(false);

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

  const [cart, setCart] = useState<any[]>([]);
  const [orderForm, setOrderForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const reviews = [
    { id: 1, name: 'Mike T.', rating: 5, comment: 'Took this beauty through the Rockies. Handled like a dream! The build quality is exceptional and it towed perfectly behind my Jeep.', date: '2024-09-15' },
    { id: 2, name: 'Sarah K.', rating: 5, comment: 'Perfect for weekend adventures. The kitchen setup is genius! Love how everything folds out so smoothly.', date: '2024-08-22' },
    { id: 3, name: 'John D.', rating: 4, comment: 'Great build quality. Only wish it came with more storage options. But overall very happy with the purchase.', date: '2024-07-30' },
    { id: 4, name: 'Lisa M.', rating: 5, comment: 'Worth every penny. Customer service was excellent too! They helped customize exactly what we needed.', date: '2024-06-18' },
    { id: 5, name: 'Dave R.', rating: 5, comment: 'This camper has been to 15 states with us. Rock solid construction and the roof tent is amazing!', date: '2024-05-10' },
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
    let total = prices[config.frame as keyof typeof prices] + prices[('wheels_' + config.wheels) as keyof typeof prices];
    Object.keys(config).forEach((key) => {
      if (config[key as keyof typeof config] === true && prices[key as keyof typeof prices]) {
        total += prices[key as keyof typeof prices];
      }
    });
    return total;
  };

  const toggleConfig = (key: string) => setConfig((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  const setFrameType = (frame: string) => setConfig((prev) => ({ ...prev, frame }));
  const setWheelType = (wheels: string) => setConfig((prev) => ({ ...prev, wheels }));

  const addToCart = () => {
    const item = {
      id: Date.now(),
      config: { ...config },
      price: calculatePrice(),
    };
    setCart([...cart, item]);
    setShowCart(true);
  };

  const removeFromCart = (id: number) => setCart(cart.filter((i) => i.id !== id));

  const getConfigDisplay = (cfg: any) => {
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

  // Enhanced gallery media data with intuitive labels based on filenames
  const galleryMedia = [
    {
      type: 'image',
      src: `${process.env.PUBLIC_URL}/images/camper_side_view.jpeg`,
      title: 'Side View',
      description: 'Classic side profile showcasing the sleek design and proportions'
    },
    {
      type: 'image', 
      src: `${process.env.PUBLIC_URL}/images/camper_alternate_side_view.jpeg`,
      title: 'Alternate Side View',
      description: 'Different angle highlighting the rugged construction and details'
    },
    {
      type: 'image',
      src: `${process.env.PUBLIC_URL}/images/camper_with_roam_tent.jpeg`, 
      title: 'With ROAM Tent Setup',
      description: 'Fully deployed with roof tent - ready for adventure'
    },
    {
      type: 'image',
      src: `${process.env.PUBLIC_URL}/images/camper_back_view.jpeg`,
      title: 'Rear View',
      description: 'Back panel design and rear-mounted accessories'
    },
    {
      type: 'image',
      src: `${process.env.PUBLIC_URL}/images/camper_back_view_opened.jpeg`,
      title: 'Rear Kitchen Opened',
      description: 'Kitchen module fully deployed for outdoor cooking'
    },
    {
      type: 'image',
      src: `${process.env.PUBLIC_URL}/images/camper_interior.jpeg`,
      title: 'Interior View', 
      description: 'Inside the camper showing storage and living space'
    },
    {
      type: 'image',
      src: `${process.env.PUBLIC_URL}/images/camper_in_tow.jpeg`,
      title: 'In Tow',
      description: 'On the road - perfect towing companion for any adventure'
    },
    {
      type: 'image',
      src: `${process.env.PUBLIC_URL}/images/camper_at_park_with_car.jpeg`,
      title: 'At the Park',
      description: 'Set up at a beautiful campsite with vehicle'
    },
    {
      type: 'video',
      src: `${process.env.PUBLIC_URL}/images/camper_video.mov`,
      title: 'Camper Video Tour',
      description: 'Complete video walkthrough of features and setup'
    }
  ];

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
        {/* BUILDER TAB */}
        {activeTab === 'builder' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* CONFIGURATOR PANEL */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-3xl font-bold mb-6 text-center">Build Your Camper</h2>
              
              {/* Frame Selection */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Truck className="mr-2 text-orange-500" size={20} />
                  Frame Type
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['minimalist', 'standard', 'heavy'].map((frame) => (
                    <button
                      key={frame}
                      onClick={() => setFrameType(frame)}
                      className={`p-4 rounded border-2 transition ${
                        config.frame === frame
                          ? 'border-orange-500 bg-orange-500/20'
                          : 'border-gray-600 hover:border-orange-400'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-bold capitalize">{frame}</div>
                        <div className="text-sm text-gray-400">
                          ${prices[frame as keyof typeof prices].toLocaleString()}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Wheel Selection */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Wheel Package</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['standard', 'offroad', 'extreme'].map((wheel) => (
                    <button
                      key={wheel}
                      onClick={() => setWheelType(wheel)}
                      className={`p-4 rounded border-2 transition ${
                        config.wheels === wheel
                          ? 'border-orange-500 bg-orange-500/20'
                          : 'border-gray-600 hover:border-orange-400'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-bold capitalize">{wheel}</div>
                        <div className="text-sm text-gray-400">
                          ${prices[('wheels_' + wheel) as keyof typeof prices].toLocaleString()}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Options Grid */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Wrench className="mr-2 text-orange-500" size={20} />
                  Options & Accessories
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(prices).filter(([key]) => 
                    !key.startsWith('wheels_') && !['minimalist', 'standard', 'heavy'].includes(key)
                  ).map(([key, price]) => (
                    <label key={key} className="flex items-center justify-between p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config[key as keyof typeof config] as boolean}
                          onChange={() => toggleConfig(key)}
                          className="mr-3 w-4 h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                        />
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </div>
                      <span className="text-orange-500 font-bold">${price.toLocaleString()}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-gray-700 rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center text-2xl font-bold">
                  <span>Total Price:</span>
                  <span className="text-orange-500">${calculatePrice().toLocaleString()}</span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={addToCart}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-lg font-bold text-xl transition flex items-center justify-center"
              >
                <ShoppingCart className="mr-2" size={24} />
                Add to Cart
              </button>
            </div>

            {/* VISUAL PREVIEW */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-center">Your Camper Preview</h3>
              
              {/* Interactive 3D Configurator */}
              <div className="mb-6 bg-gray-700 rounded-lg p-4" style={{ minHeight: '400px' }}>
                <CamperConfigurator config={config} />
              </div>

              {/* Configuration Summary */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-bold mb-3">Current Configuration:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Frame:</span>
                    <span className="text-orange-500 capitalize">{config.frame}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wheels:</span>
                    <span className="text-orange-500 capitalize">{config.wheels}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dimensions:</span>
                    <span className="text-orange-500">{dims.width}" × {dims.height}"</span>
                  </div>
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span className="text-orange-500">${calculatePrice().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Gallery */}
              <div className="mt-6">
                <h4 className="font-bold mb-3">Gallery</h4>
                <div className="grid grid-cols-2 gap-2">
                  {galleryMedia.map((media, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedMedia(idx);
                        setShowLightbox(true);
                      }}
                      className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80 transition"
                    >
                      {media.type === 'image' ? (
                        <img
                          src={media.src}
                          alt={media.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <video
                          src={media.src}
                          title={media.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Customer Reviews</h2>
            <div className="grid gap-6">
              {reviews.map((r) => (
                <div key={r.id} className="bg-gray-800 p-6 rounded-lg">
                  <div className="flex justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{r.name}</h3>
                      <div className="flex space-x-1 mt-1">
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
                  <p className="text-gray-300">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABOUT TAB */}
        {activeTab === 'about' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-6 text-center">About Jeepers Campers</h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <img
                    src={`${process.env.PUBLIC_URL}/images/camper_at_park_with_car.jpeg`}
                    alt="Jeepers Campers in action"
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="space-y-4">
                  <p className="text-gray-300">
                    At Jeepers Campers, we build adventure-ready trailers that combine durability, 
                    functionality, and comfort. Each model is hand-crafted for the modern explorer 
                    who demands quality and reliability on every journey.
                  </p>
                  <p className="text-gray-300">
                    Our modular design approach allows you to customize your camper exactly to your 
                    needs, whether you're planning weekend getaways or extended off-grid adventures.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Truck size={32} />
                  </div>
                  <h3 className="font-bold mb-2">Built Tough</h3>
                  <p className="text-gray-400 text-sm">Military-grade materials and construction for any terrain</p>
                </div>
                <div className="text-center">
                  <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wrench size={32} />
                  </div>
                  <h3 className="font-bold mb-2">Fully Customizable</h3>
                  <p className="text-gray-400 text-sm">Configure every aspect to match your adventure style</p>
                </div>
                <div className="text-center">
                  <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Home size={32} />
                  </div>
                  <h3 className="font-bold mb-2">Home Away From Home</h3>
                  <p className="text-gray-400 text-sm">Comfort and convenience wherever the road takes you</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ORDER TAB */}
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
                    className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={orderForm.email}
                    onChange={(e) => setOrderForm({ ...orderForm, email: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={orderForm.phone}
                    onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white"
                  />
                  <textarea
                    placeholder="Delivery Address"
                    value={orderForm.address}
                    onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white h-24"
                  />

                  <button
                    onClick={() => {
                      if (orderForm.name && orderForm.email) {
                        alert(
                          `Order submitted successfully!\n\nName: ${orderForm.name}\nEmail: ${orderForm.email}\n\nTotal: $${cart
                            .reduce((s, i) => s + i.price, 0)
                            .toLocaleString()}\n\nWe'll contact you within 24 hours to confirm your order details.`
                        );
                        setCart([]);
                        setOrderForm({ name: '', email: '', phone: '', address: '' });
                        setActiveTab('builder');
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

      {/* LIGHTBOX */}
      {showLightbox && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex justify-center items-center p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl max-h-full w-full overflow-y-auto p-6 relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{galleryMedia[selectedMedia].title}</h2>
              <button onClick={() => setShowLightbox(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="mb-4">
              {galleryMedia[selectedMedia].type === 'image' ? (
                <img
                  src={galleryMedia[selectedMedia].src}
                  alt={galleryMedia[selectedMedia].title}
                  className="w-full max-h-96 object-contain rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <video
                  src={galleryMedia[selectedMedia].src}
                  title={galleryMedia[selectedMedia].title}
                  controls
                  className="w-full max-h-96 object-contain rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </div>
            <p className="text-gray-400 mt-4">{galleryMedia[selectedMedia].description}</p>
            
            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setSelectedMedia(selectedMedia > 0 ? selectedMedia - 1 : galleryMedia.length - 1)}
                className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded transition flex items-center space-x-2"
              >
                <span>←</span>
                <span>Previous</span>
              </button>
              <span className="text-gray-400">
                {selectedMedia + 1} of {galleryMedia.length}
              </span>
              <button
                onClick={() => setSelectedMedia(selectedMedia < galleryMedia.length - 1 ? selectedMedia + 1 : 0)}
                className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded transition flex items-center space-x-2"
              >
                <span>Next</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JeepersCampers;
