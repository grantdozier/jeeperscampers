import React, { useState } from 'react';
import { ShoppingCart, Star, Menu, X, Wrench, Truck, Home } from 'lucide-react';
import CamperConfigurator from './CamperConfigurator';
import { OrderForm } from './OrderForm'; // Import the new OrderForm component

const JeepersCampers = () => {
  const [activeTab, setActiveTab] = useState('builder');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<number>(0);
  const [showLightbox, setShowLightbox] = useState(false);

  const [config, setConfig] = useState({
    frame: 'standard',
    wheels: 'standard',
    breakingHubs: false,
    // Enclosure options
    enclosureType: '', // 'single-door' or 'dual-door'
    rearHatch: false,
    // Kitchen options
    partitionKitchenCounter: false,
    kitchenStoveTop: false,
    kitchenFridge: false,
    kitchenCabinet: false,
    kitchenFaucet: false,
    kitchenDrawers: false,
    refrigerator: false,
    // Roof options
    roofTent: '',
    // Exterior options
    diamondPlateFrontExterior: false,
    diamondPlatePowderCoat: false,
    vNoseFrontStorage: false,
    vNosePowderCoat: false,
    fullyArticulatedHitch: false,
    frontStorageBoxes: false,
    toolBoxDPlated: false,
    toolBoxPowderCoat: false,
    rearReceiverHitch: false,
    trailerWiringLights: false,
    roofTopAccessSteps: false,
    // Interior options
    interiorWiringPackage: false,
    lithiumBattery: false,
    onboardBatteryCharger: false,
    redarcCharger: false,
    interiorLightingPackage: false,
    tenSpeedFan: false,
    onboardWaterTank: false,
    onboardPropaneTank: false,
    campluxOutdoorShower: false,
    roamShowerRoom: false,
    // Interior packages
    basicInteriorPackage: false,
    premiumInteriorPackage: false,
  });

  const [cart, setCart] = useState<any[]>([]);

  const reviews = [
    { id: 1, name: 'Mike T.', rating: 5, comment: 'Took this beauty through the Rockies. Handled like a dream! The build quality is exceptional and it towed perfectly behind my Jeep.', date: '2024-09-15' },
    { id: 2, name: 'Sarah K.', rating: 5, comment: 'Perfect for weekend adventures. The kitchen setup is genius! Love how everything folds out so smoothly.', date: '2024-08-22' },
    { id: 3, name: 'John D.', rating: 4, comment: 'Great build quality. Only wish it came with more storage options. But overall very happy with the purchase.', date: '2024-07-30' },
    { id: 4, name: 'Lisa M.', rating: 5, comment: 'Worth every penny. Customer service was excellent too! They helped customize exactly what we needed.', date: '2024-06-18' },
    { id: 5, name: 'Dave R.', rating: 5, comment: 'This camper has been to 15 states with us. Rock solid construction and the roof tent is amazing!', date: '2024-05-10' },
  ];

  const prices = {
    // Base frame (only standard now)
    standard: 5999,
    // Wheel packages
    wheels_standard: 800,
    wheels_offroad: 1400,
    wheels_extreme: 2200,
    // Breaking hubs
    breakingHubs: 0, // Price TBD
    // Enclosure options
    enclosureType_singleDoor: 1600,
    enclosureType_dualDoor: 2000,
    rearHatch: 400,
    // Kitchen options
    partitionKitchenCounter: 1200,
    kitchenStoveTop: 0, // Included with partition
    kitchenFridge: 0, // Included with partition
    kitchenCabinet: 0, // Included with partition
    kitchenFaucet: 0, // Included with partition
    kitchenDrawers: 300,
    refrigerator: 500,
    // Roof tent options (multiple options available)
    roofTent_basic: 2500,
    roofTent_premium: 3500,
    roofTent_luxury: 4500,
    // Exterior options
    diamondPlateFrontExterior: 600,
    diamondPlatePowderCoat: 200,
    vNoseFrontStorage: 800,
    vNosePowderCoat: 200,
    fullyArticulatedHitch: 600,
    frontStorageBoxes: 400,
    toolBoxDPlated: 300,
    toolBoxPowderCoat: 150,
    rearReceiverHitch: 100,
    trailerWiringLights: 250,
    roofTopAccessSteps: 100,
    // Interior options
    interiorWiringPackage: 400,
    lithiumBattery: 800,
    onboardBatteryCharger: 500,
    redarcCharger: 600,
    interiorLightingPackage: 300,
    tenSpeedFan: 150,
    onboardWaterTank: 600,
    onboardPropaneTank: 200,
    campluxOutdoorShower: 400,
    roamShowerRoom: 300,
    // Interior packages
    basicInteriorPackage: 1000,
    premiumInteriorPackage: 2500,
  };

  const calculatePrice = () => {
    let total = prices.standard + prices[('wheels_' + config.wheels) as keyof typeof prices];

    // Handle enclosure type
    if (config.enclosureType === 'single-door') {
      total += prices.enclosureType_singleDoor;
    } else if (config.enclosureType === 'dual-door') {
      total += prices.enclosureType_dualDoor;
    }

    // Handle roof tent
    if (config.roofTent === 'basic') {
      total += prices.roofTent_basic;
    } else if (config.roofTent === 'premium') {
      total += prices.roofTent_premium;
    } else if (config.roofTent === 'luxury') {
      total += prices.roofTent_luxury;
    }

    // Handle boolean options
    Object.keys(config).forEach((key) => {
      if (config[key as keyof typeof config] === true && prices[key as keyof typeof prices]) {
        total += prices[key as keyof typeof prices];
      }
    });

    return total;
  };

  const toggleConfig = (key: string) => setConfig((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  const setWheelType = (wheels: string) => setConfig((prev) => ({ ...prev, wheels }));
  const setEnclosureType = (enclosureType: string) => setConfig((prev) => ({ ...prev, enclosureType }));
  const setRoofTent = (roofTent: string) => setConfig((prev) => ({ ...prev, roofTent }));

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
    parts.push('Standard Frame');
    parts.push(cfg.wheels.charAt(0).toUpperCase() + cfg.wheels.slice(1) + ' Wheels');
    if (cfg.enclosureType === 'single-door') parts.push('Single Door Enclosure');
    if (cfg.enclosureType === 'dual-door') parts.push('Dual Door Enclosure');
    if (cfg.rearHatch) parts.push('Rear Hatch');
    if (cfg.partitionKitchenCounter) parts.push('Kitchen Counter');
    if (cfg.roofTent === 'basic') parts.push('Basic Roof Tent');
    if (cfg.roofTent === 'premium') parts.push('Premium Roof Tent');
    if (cfg.roofTent === 'luxury') parts.push('Luxury Roof Tent');
    if (cfg.basicInteriorPackage) parts.push('Basic Interior');
    if (cfg.premiumInteriorPackage) parts.push('Premium Interior');
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
            <div className="text-3xl font-bold text-orange-500">BADLAND</div>
            <div className="text-2xl font-light">CAMPERS</div>
          </div>
          <nav className="hidden md:flex space-x-6">
            {['builder', 'reviews', 'gallery', 'about'].map((tab) => (
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
            {['builder', 'reviews', 'gallery', 'about'].map((tab) => (
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

      {/* Mobile Navigation - Always Visible */}
      <nav className="md:hidden bg-gray-700 px-4 py-2">
        <div className="flex space-x-1 overflow-x-auto">
          {['builder', 'gallery', 'reviews', 'about'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 rounded text-sm whitespace-nowrap transition ${
                activeTab === tab 
                  ? 'bg-orange-500 text-white' 
                  : 'text-gray-300 hover:text-orange-500 hover:bg-gray-600'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </nav>

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
          <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-6 lg:gap-8" style={{ gridTemplateColumns: '1fr 1.5fr' }}>
            {/* CONFIGURATOR PANEL */}
            <div className="bg-gray-800 rounded-lg p-2 sm:p-3 lg:p-4">
              <h2 className="text-base sm:text-xl lg:text-2xl font-bold mb-2 lg:mb-4 text-center">Build Your Camper</h2>
              
              {/* Frame Type - Standard Only */}
              <div className="mb-3 lg:mb-6">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold mb-2 lg:mb-3 flex items-center">
                  <Truck className="mr-1 sm:mr-2 text-orange-500" size={16} />
                  Frame Type
                </h3>
                <div className="bg-gray-700 p-2 sm:p-3 rounded border-2 border-orange-500">
                  <div className="text-center">
                    <div className="font-bold text-sm lg:text-base">Standard Frame</div>
                    <div className="text-orange-500 text-sm lg:text-base">
                      ${prices.standard.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Wheel Selection */}
              <div className="mb-3 lg:mb-6">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold mb-2 lg:mb-3">Wheel Package</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 sm:gap-2 lg:gap-3">
                  {['standard', 'offroad', 'extreme'].map((wheel) => (
                    <button
                      key={wheel}
                      onClick={() => setWheelType(wheel)}
                      className={`p-1 sm:p-2 lg:p-3 rounded border-2 transition ${
                        config.wheels === wheel
                          ? 'border-orange-500 bg-orange-500/20'
                          : 'border-gray-600 hover:border-orange-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-bold text-xs lg:text-sm capitalize">{wheel}</div>
                        <div className="text-orange-500 text-xs lg:text-sm">
                          ${prices[('wheels_' + wheel) as keyof typeof prices].toLocaleString()}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Breaking Hubs */}
              <div className="mb-3 lg:mb-6">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold mb-2 lg:mb-3">Breaking Hubs</h3>
                <label className="flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.breakingHubs}
                      onChange={() => toggleConfig('breakingHubs')}
                      className="mr-2 w-4 h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                    />
                    <span className="text-xs sm:text-sm lg:text-base">Breaking Hubs (Trailer Brakes)</span>
                  </div>
                </label>
              </div>

              {/* Enclosure Options */}
              <div className="mb-3 lg:mb-6">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold mb-2 lg:mb-3 flex items-center">
                  <Wrench className="mr-1 sm:mr-2 text-orange-500" size={16} />
                  Enclosure Options
                </h3>
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  <button
                    onClick={() => setEnclosureType('single-door')}
                    className={`p-2 sm:p-3 rounded border-2 transition ${
                      config.enclosureType === 'single-door'
                        ? 'border-orange-500 bg-orange-500/20'
                        : 'border-gray-600 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs sm:text-sm lg:text-base">Enclosed - Single Side Door</span>
                      <span className="text-orange-500 text-xs sm:text-sm lg:text-base">${prices.enclosureType_singleDoor.toLocaleString()}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setEnclosureType('dual-door')}
                    className={`p-2 sm:p-3 rounded border-2 transition ${
                      config.enclosureType === 'dual-door'
                        ? 'border-orange-500 bg-orange-500/20'
                        : 'border-gray-600 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs sm:text-sm lg:text-base">Enclosed - Dual Side Doors</span>
                      <span className="text-orange-500 text-xs sm:text-sm lg:text-base">${prices.enclosureType_dualDoor.toLocaleString()}</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Rear Hatch */}
              <div className="mb-3 lg:mb-6">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold mb-2 lg:mb-3">Rear Hatch</h3>
                <label className="flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.rearHatch}
                      onChange={() => toggleConfig('rearHatch')}
                      className="mr-2 w-4 h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                    />
                    <span className="text-xs sm:text-sm lg:text-base">Rear Hatch</span>
                  </div>
                  <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.rearHatch.toLocaleString()}</span>
                </label>
              </div>

              {/* Kitchen Options */}
              <div className="mb-3 lg:mb-6">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold mb-2 lg:mb-3">Kitchen Options</h3>
                <div className="space-y-2">
                  {/* Partition - Kitchen Counter */}
                  <label className="flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.partitionKitchenCounter}
                        onChange={() => {
                          toggleConfig('partitionKitchenCounter');
                          // Auto-enable sub-options when partition is selected
                          if (!config.partitionKitchenCounter) {
                            setConfig((prev) => ({
                              ...prev,
                              partitionKitchenCounter: true,
                              kitchenStoveTop: true,
                              kitchenFridge: true,
                              kitchenCabinet: true,
                              kitchenFaucet: true,
                            }));
                          } else {
                            setConfig((prev) => ({
                              ...prev,
                              partitionKitchenCounter: false,
                              kitchenStoveTop: false,
                              kitchenFridge: false,
                              kitchenCabinet: false,
                              kitchenFaucet: false,
                            }));
                          }
                        }}
                        className="mr-2 w-4 h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Partition - Kitchen Counter</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.partitionKitchenCounter.toLocaleString()}</span>
                  </label>

                  {/* Sub-options (auto-filled when partition is selected) */}
                  {config.partitionKitchenCounter && (
                    <div className="ml-6 space-y-1 text-xs sm:text-sm text-gray-400">
                      <div className="flex items-center">
                        <span className="mr-2">✓</span> Stove Top (included)
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">✓</span> Fridge (included)
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">✓</span> Kitchen Cabinet (included)
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">✓</span> Faucet (included)
                      </div>
                    </div>
                  )}

                  {/* Additional Back Hatch Options */}
                  <label className="flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.kitchenDrawers}
                        onChange={() => toggleConfig('kitchenDrawers')}
                        className="mr-2 w-4 h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Kitchen Drawers</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.kitchenDrawers.toLocaleString()}</span>
                  </label>

                  <label className="flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.refrigerator}
                        onChange={() => toggleConfig('refrigerator')}
                        className="mr-2 w-4 h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Refrigerator</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.refrigerator.toLocaleString()}</span>
                  </label>
                </div>
              </div>

              {/* Roof Tent Options */}
              <div className="mb-3 lg:mb-6">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold mb-2 lg:mb-3">Roof Tent Options</h3>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => setRoofTent(config.roofTent === 'basic' ? '' : 'basic')}
                    className={`p-2 sm:p-3 rounded border-2 transition ${
                      config.roofTent === 'basic'
                        ? 'border-orange-500 bg-orange-500/20'
                        : 'border-gray-600 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs sm:text-sm lg:text-base">Basic Roof Tent</span>
                      <span className="text-orange-500 text-xs sm:text-sm lg:text-base">${prices.roofTent_basic.toLocaleString()}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setRoofTent(config.roofTent === 'premium' ? '' : 'premium')}
                    className={`p-2 sm:p-3 rounded border-2 transition ${
                      config.roofTent === 'premium'
                        ? 'border-orange-500 bg-orange-500/20'
                        : 'border-gray-600 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs sm:text-sm lg:text-base">Premium Roof Tent</span>
                      <span className="text-orange-500 text-xs sm:text-sm lg:text-base">${prices.roofTent_premium.toLocaleString()}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setRoofTent(config.roofTent === 'luxury' ? '' : 'luxury')}
                    className={`p-2 sm:p-3 rounded border-2 transition ${
                      config.roofTent === 'luxury'
                        ? 'border-orange-500 bg-orange-500/20'
                        : 'border-gray-600 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs sm:text-sm lg:text-base">Luxury Roof Tent</span>
                      <span className="text-orange-500 text-xs sm:text-sm lg:text-base">${prices.roofTent_luxury.toLocaleString()}</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Exterior Options */}
              <div className="mb-3 lg:mb-6">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold mb-2 lg:mb-3">Exterior Options</h3>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.diamondPlateFrontExterior}
                        onChange={() => toggleConfig('diamondPlateFrontExterior')}
                        className="mr-2 w-4 h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Diamond Plated Front Exterior</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.diamondPlateFrontExterior.toLocaleString()}</span>
                  </label>

                  {config.diamondPlateFrontExterior && (
                    <label className="ml-6 flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.diamondPlatePowderCoat}
                          onChange={() => toggleConfig('diamondPlatePowderCoat')}
                          className="mr-2 w-4 h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                        />
                        <span className="text-xs sm:text-sm lg:text-base">Powder Coat</span>
                      </div>
                      <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.diamondPlatePowderCoat.toLocaleString()}</span>
                    </label>
                  )}

                  <label className="flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.vNoseFrontStorage}
                        onChange={() => toggleConfig('vNoseFrontStorage')}
                        className="mr-2 w-4 h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">V-Nose Front Storage (D-Plated)</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.vNoseFrontStorage.toLocaleString()}</span>
                  </label>

                  {config.vNoseFrontStorage && (
                    <label className="ml-6 flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.vNosePowderCoat}
                          onChange={() => toggleConfig('vNosePowderCoat')}
                          className="mr-2 w-4 h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                        />
                        <span className="text-xs sm:text-sm lg:text-base">Powder Coat</span>
                      </div>
                      <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.vNosePowderCoat.toLocaleString()}</span>
                    </label>
                  )}

                  <label className="flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.fullyArticulatedHitch}
                        onChange={() => toggleConfig('fullyArticulatedHitch')}
                        className="mr-2 w-4 h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Fully Articulated Hitch Assembly</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.fullyArticulatedHitch.toLocaleString()}</span>
                  </label>

                  <label className="flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.frontStorageBoxes}
                        onChange={() => toggleConfig('frontStorageBoxes')}
                        className="mr-2 w-4 h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Front Storage Boxes</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.frontStorageBoxes.toLocaleString()}</span>
                  </label>

                  <label className="flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.toolBoxDPlated}
                        onChange={() => toggleConfig('toolBoxDPlated')}
                        className="mr-2 w-4 h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Tool Box D-Plated</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.toolBoxDPlated.toLocaleString()}</span>
                  </label>

                  {config.toolBoxDPlated && (
                    <label className="ml-6 flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.toolBoxPowderCoat}
                          onChange={() => toggleConfig('toolBoxPowderCoat')}
                          className="mr-2 w-4 h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                        />
                        <span className="text-xs sm:text-sm lg:text-base">Powder Coat</span>
                      </div>
                      <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.toolBoxPowderCoat.toLocaleString()}</span>
                    </label>
                  )}

                  <label className="flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.rearReceiverHitch}
                        onChange={() => toggleConfig('rearReceiverHitch')}
                        className="mr-2 w-4 h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Rear Receiver Hitch</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.rearReceiverHitch.toLocaleString()}</span>
                  </label>

                  <label className="flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.trailerWiringLights}
                        onChange={() => toggleConfig('trailerWiringLights')}
                        className="mr-2 w-4 h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Trailer Wiring + Lights</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.trailerWiringLights.toLocaleString()}</span>
                  </label>

                  <label className="flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.roofTopAccessSteps}
                        onChange={() => toggleConfig('roofTopAccessSteps')}
                        className="mr-2 w-4 h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Roof Top Access Steps (both sides)</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.roofTopAccessSteps.toLocaleString()}</span>
                  </label>
                </div>
              </div>

              {/* Interior Options */}
              <div className="mb-3 lg:mb-6">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold mb-2 lg:mb-3">Interior Options</h3>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.interiorWiringPackage}
                        onChange={() => toggleConfig('interiorWiringPackage')}
                        className="mr-2 w-4 h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Interior Wiring Package</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.interiorWiringPackage.toLocaleString()}</span>
                  </label>

                  <label className="flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.lithiumBattery}
                        onChange={() => toggleConfig('lithiumBattery')}
                        className="mr-2 w-4 h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Lithium Battery</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.lithiumBattery.toLocaleString()}</span>
                  </label>

                  <label className="flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.onboardBatteryCharger}
                        onChange={() => toggleConfig('onboardBatteryCharger')}
                        className="mr-2 w-4 h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Onboard Battery Charger (120V AC)</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.onboardBatteryCharger.toLocaleString()}</span>
                  </label>

                  <label className="flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.redarcCharger}
                        onChange={() => toggleConfig('redarcCharger')}
                        className="mr-2 w-4 h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">REDARC In-Vehicle DC Battery Charger</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.redarcCharger.toLocaleString()}</span>
                  </label>

                  <label className="flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.interiorLightingPackage}
                        onChange={() => toggleConfig('interiorLightingPackage')}
                        className="mr-2 w-4 h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Interior Lighting Package</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.interiorLightingPackage.toLocaleString()}</span>
                  </label>

                  <label className="flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.tenSpeedFan}
                        onChange={() => toggleConfig('tenSpeedFan')}
                        className="mr-2 w-4 h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">10 Speed Fan</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.tenSpeedFan.toLocaleString()}</span>
                  </label>

                  <label className="flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.onboardWaterTank}
                        onChange={() => toggleConfig('onboardWaterTank')}
                        className="mr-2 w-4 h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Onboard Water Tank w/ Water Pump</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.onboardWaterTank.toLocaleString()}</span>
                  </label>

                  <label className="flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.onboardPropaneTank}
                        onChange={() => toggleConfig('onboardPropaneTank')}
                        className="mr-2 w-4 h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Onboard Propane Tank w/ Plumbing</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.onboardPropaneTank.toLocaleString()}</span>
                  </label>

                  <label className="flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.campluxOutdoorShower}
                        onChange={() => toggleConfig('campluxOutdoorShower')}
                        className="mr-2 w-4 h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Camplux Outdoor Shower - Tankless (no refunds on public nudity tickets)</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.campluxOutdoorShower.toLocaleString()}</span>
                  </label>

                  <label className="flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.roamShowerRoom}
                        onChange={() => toggleConfig('roamShowerRoom')}
                        className="mr-2 w-4 h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">ROAM Shower Room - Shower Screen</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.roamShowerRoom.toLocaleString()}</span>
                  </label>
                </div>
              </div>

              {/* Interior Packages */}
              <div className="mb-3 lg:mb-6">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold mb-2 lg:mb-3">Interior Packages</h3>
                <div className="space-y-2">
                  <label className="flex items-start justify-between p-2 sm:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={config.basicInteriorPackage}
                        onChange={() => {
                          toggleConfig('basicInteriorPackage');
                          if (!config.basicInteriorPackage && config.premiumInteriorPackage) {
                            toggleConfig('premiumInteriorPackage');
                          }
                        }}
                        className="mr-2 w-4 h-4 mt-1 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <div>
                        <span className="text-xs sm:text-sm lg:text-base font-bold">Basic Interior Package</span>
                        <div className="text-xs text-gray-400 mt-1">Sheeted particle board walls and ceiling</div>
                      </div>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.basicInteriorPackage.toLocaleString()}</span>
                  </label>

                  <label className="flex items-start justify-between p-2 sm:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={config.premiumInteriorPackage}
                        onChange={() => {
                          toggleConfig('premiumInteriorPackage');
                          if (!config.premiumInteriorPackage && config.basicInteriorPackage) {
                            toggleConfig('basicInteriorPackage');
                          }
                        }}
                        className="mr-2 w-4 h-4 mt-1 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <div>
                        <span className="text-xs sm:text-sm lg:text-base font-bold">Premium Interior Package</span>
                        <div className="text-xs text-gray-400 mt-1">Solid wood (cedar, teakwood)</div>
                      </div>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.premiumInteriorPackage.toLocaleString()}</span>
                  </label>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="bg-gray-700 rounded-lg p-2 sm:p-3 lg:p-4 mb-3 lg:mb-6">
                <h3 className="font-bold mb-2 text-sm lg:text-base">Configuration Summary</h3>
                <div className="space-y-1 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span>Frame:</span>
                    <span className="text-orange-500">Standard</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wheels:</span>
                    <span className="text-orange-500 capitalize">{config.wheels}</span>
                  </div>
                  {config.enclosureType && (
                    <div className="flex justify-between">
                      <span>Enclosure:</span>
                      <span className="text-orange-500">{config.enclosureType === 'single-door' ? 'Single Door' : 'Dual Doors'}</span>
                    </div>
                  )}
                  {config.roofTent && (
                    <div className="flex justify-between">
                      <span>Roof Tent:</span>
                      <span className="text-orange-500 capitalize">{config.roofTent}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between font-bold text-sm lg:text-lg">
                      <span>Total:</span>
                      <span className="text-orange-500">${calculatePrice().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={addToCart}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 sm:py-3 lg:py-4 rounded-lg font-bold text-sm sm:text-base lg:text-xl transition flex items-center justify-center"
              >
                <ShoppingCart className="mr-1 sm:mr-2" size={16} />
                Add to Cart
              </button>
            </div>

            {/* VISUAL PREVIEW */}
            <div className="bg-gray-800 rounded-lg p-2 sm:p-3 lg:p-4 sticky top-4">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-2 lg:mb-4 text-center">Your Camper Preview</h3>
              
              {/* Interactive 3D Configurator */}
              <div className="mb-2 lg:mb-4 bg-gray-700 rounded-lg p-1 sm:p-2 lg:p-3" style={{ minHeight: '300px' }}>
                <CamperConfigurator config={config} />
              </div>

              {/* Configuration Summary */}
              <div className="bg-gray-700 rounded-lg p-2 lg:p-3 mb-2 lg:mb-3">
                <h4 className="font-bold mb-2 text-sm lg:text-base">Current Configuration:</h4>
                <div className="space-y-1 text-xs lg:text-sm">
                  <div className="flex justify-between">
                    <span>Frame:</span>
                    <span className="text-orange-500">Standard</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wheels:</span>
                    <span className="text-orange-500 capitalize">{config.wheels}</span>
                  </div>
                  {config.enclosureType && (
                    <div className="flex justify-between">
                      <span>Enclosure:</span>
                      <span className="text-orange-500">{config.enclosureType === 'single-door' ? 'Single Door' : 'Dual Doors'}</span>
                    </div>
                  )}
                  {config.roofTent && (
                    <div className="flex justify-between">
                      <span>Roof Tent:</span>
                      <span className="text-orange-500 capitalize">{config.roofTent}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Dimensions:</span>
                    <span className="text-orange-500">{dims.width}" × {dims.height}"</span>
                  </div>
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between font-bold text-sm lg:text-lg">
                      <span>Total:</span>
                      <span className="text-orange-500">${calculatePrice().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Gallery */}
              <div className="hidden lg:block">
                <h4 className="font-bold mb-2 text-sm">Gallery</h4>
                <div className="grid grid-cols-2 gap-2">
                  {galleryMedia.map((media, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedMedia(idx);
                        setShowLightbox(true);
                      }}
                      className="w-full h-16 object-cover rounded cursor-pointer hover:opacity-80 transition"
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

        {/* GALLERY TAB */}
        {activeTab === 'gallery' && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Badland Campers Gallery</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryMedia.map((media, idx) => (
                <div
                  key={idx}
                  className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform duration-300 cursor-pointer"
                  onClick={() => {
                    setSelectedMedia(idx);
                    setShowLightbox(true);
                  }}
                >
                  <div className="relative h-48 overflow-hidden">
                    {media.type === 'image' ? (
                      <img
                        src={media.src}
                        alt={media.title}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="relative">
                        <video
                          src={media.src}
                          title={media.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                          <div className="bg-orange-500 rounded-full p-3">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 text-orange-500">{media.title}</h3>
                    <p className="text-gray-400 text-sm">{media.description}</p>
                  </div>
                </div>
              ))}
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
              <h2 className="text-3xl font-bold mb-6 text-center">About Badland Campers</h2>
              
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
          <div className="max-w-4xl mx-auto">
            {cart.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <p className="text-gray-400 mb-6">Add some campers to your cart before placing an order.</p>
                <button
                  onClick={() => setActiveTab('builder')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded font-bold"
                >
                  Start Building
                </button>
              </div>
            ) : (
              <OrderForm
                cart={cart}
                onOrderComplete={() => {
                  setCart([]);
                }}
                onBackToBuilder={() => setActiveTab('builder')}
                getConfigDisplay={getConfigDisplay}
              />
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
