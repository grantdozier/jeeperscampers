import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star, Menu, X, Wrench, Truck, Home, CheckCircle } from 'lucide-react';
import { OrderForm } from './OrderForm'; // Import the new OrderForm component
import ContactForm from './ContactForm';
import {
  MODEL_INCLUDED_UPGRADES,
  MODEL_NAMES,
  PRICES,
  calculatePrice as computePrice,
} from '../lib/pricing';

const JeepersCampers = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [camperModel, setCamperModel] = useState<'buffalo' | 'goat'>('buffalo');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<number>(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<'success' | 'cancel' | 'verifying' | 'unconfirmed' | null>(null);

  const [config, setConfig] = useState({
    premiumOffroadWheels: false,
    enclosedCabinSingleDoor: false,
    secondCabinDoor: false,
    rearDoors: false,
    fullyArticulatedHitch: false,
    vNoseStorage: false,
    roofRack: false,
    interiorPackage: false,
    dualFlowFan: false,
    countertopsCabinets: false,
    electricalLightingPackage: false,
    waterTankFaucet: false,
    propaneStovePackage: false,
    campluxShower: false,
    arc270Awning: false,
    roofTent: '',
    // Legacy fields retained only for type-checking the non-rendered migration block.
    frame: 'standard',
    wheels: 'standard',
    breakingHubs: false,
    enclosureType: '',
    rearHatch: false,
    partitionKitchenCounter: false,
    kitchenStoveTop: false,
    kitchenFridge: false,
    kitchenCabinet: false,
    kitchenFaucet: false,
    kitchenDrawers: false,
    refrigerator: false,
    diamondPlateFrontExterior: false,
    diamondPlatePowderCoat: false,
    vNoseFrontStorage: false,
    vNosePowderCoat: false,
    frontStorageBoxes: false,
    toolBoxDPlated: false,
    toolBoxPowderCoat: false,
    rearReceiverHitch: false,
    trailerWiringLights: false,
    roofTopAccessSteps: false,
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
    basicInteriorPackage: false,
    premiumInteriorPackage: false,
  });

  const [cart, setCart] = useState<any[]>(() => {
    // Persist the cart so it survives the full-page redirect to Stripe and back
    // (in-memory state is destroyed by the cross-origin navigation).
    try {
      const saved = localStorage.getItem('bc_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bc_cart', JSON.stringify(cart));
    } catch {
      /* ignore storage errors (private mode / quota) */
    }
  }, [cart]);

  // When Stripe redirects the customer back after (or instead of) paying, show the
  // right confirmation. success_url / cancel_url carry a ?checkout= query param, and
  // success also carries the Stripe session_id, which we verify server-side before
  // treating the visit as a genuinely paid confirmation (so a bookmarked/shared
  // "?checkout=success" URL can't fake it or wipe the cart).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('checkout');
    const sessionId = params.get('session_id');
    if (status === 'success') {
      setActiveTab('order');
      window.history.replaceState({}, document.title, window.location.pathname);
      const apiBase = (process.env.REACT_APP_CHECKOUT_API_BASE || '').trim().replace(/\/+$/, '');
      if (apiBase && sessionId) {
        setCheckoutStatus('verifying');
        fetch(`${apiBase}/api/verify-session?session_id=${encodeURIComponent(sessionId)}`)
          .then((r) => r.json())
          .then((d) => {
            if (d && d.paid) {
              setCheckoutStatus('success');
              setCart([]); // clears the persisted cart too (via the persist effect)
            } else {
              setCheckoutStatus('unconfirmed');
            }
          })
          .catch(() => setCheckoutStatus('unconfirmed'));
      } else {
        // Can't verify (no session id / API base) — show success but keep the cart.
        setCheckoutStatus('success');
      }
    } else if (status === 'cancel') {
      setCheckoutStatus('cancel');
      setActiveTab('order');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Each navigation choice swaps the page content in place. Reset the viewport
  // and move keyboard/screen-reader focus to that new content so customers land
  // at the builder, checkout, gallery, or confirmation heading—not at the scroll
  // position left behind by the previous page.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.getElementById('page-content')?.focus({ preventScroll: true });
  }, [activeTab]);

  const reviews = [
    { id: 1, name: 'Mike T.', rating: 5, comment: 'Took this beauty through the Rockies. Handled like a dream! The build quality is exceptional and it towed perfectly behind my Jeep.', date: '2024-09-15' },
    { id: 2, name: 'Sarah K.', rating: 5, comment: 'Perfect for weekend adventures. The kitchen setup is genius! Love how everything folds out so smoothly.', date: '2024-08-22' },
    { id: 3, name: 'John D.', rating: 4, comment: 'Great build quality. Only wish it came with more storage options. But overall very happy with the purchase.', date: '2024-07-30' },
    { id: 4, name: 'Lisa M.', rating: 5, comment: 'Worth every penny. Customer service was excellent too! They helped customize exactly what we needed.', date: '2024-06-18' },
    { id: 5, name: 'Dave R.', rating: 5, comment: 'This camper has been to 15 states with us. Rock solid construction and the roof tent is amazing!', date: '2024-05-10' },
  ];

  // Pricing table + calculation now live in a shared, framework-neutral module
  // (src/lib/pricing.ts) so the Stripe server function recomputes the exact same
  // total server-side. `prices` is aliased here to keep all existing JSX
  // references (e.g. prices.standard) working unchanged.
  const prices = PRICES;
  const upgradeOptions = [
    ['premiumOffroadWheels', 'Premium Offroad Wheel & Tire Package', prices.premiumOffroadWheels],
    ['enclosedCabinSingleDoor', 'Enclosed Cabin with Single Door', prices.enclosedCabinSingleDoor],
    ['secondCabinDoor', 'Second Cabin Door', prices.secondCabinDoor],
    ['rearDoors', 'Rear Doors', prices.rearDoors],
    ['fullyArticulatedHitch', 'Fully Articulating Hitch', prices.fullyArticulatedHitch],
    ['vNoseStorage', 'V-Nose Storage', prices.vNoseStorage],
    ['roofRack', 'Roof Rack', prices.roofRack],
    ['interiorPackage', 'Interior Package', prices.interiorPackage],
    ['dualFlowFan', 'Dual Flow Fan', prices.dualFlowFan],
    ['countertopsCabinets', 'Countertops and Cabinets', prices.countertopsCabinets],
    ['electricalLightingPackage', 'Electrical & Lighting Package', prices.electricalLightingPackage],
    ['waterTankFaucet', '30 Gallon Water Tank and Faucet', prices.waterTankFaucet],
    ['propaneStovePackage', 'Propane Package & 2 Burner Stove', prices.propaneStovePackage],
    ['campluxShower', 'CAMPLUX Shower', prices.campluxShower],
    ['roamShowerRoom', 'The Shower Room', prices.roamShowerRoom],
    ['arc270Awning', 'The 270 Awning', prices.arc270Awning],
  ] as const;
  const availableUpgradeOptions = upgradeOptions.filter(
    ([key]) => !MODEL_INCLUDED_UPGRADES[camperModel].includes(key),
  );
  const allUpgradesSelected = availableUpgradeOptions.every(([key]) => Boolean(config[key]));

  const toggleAllUpgrades = () => {
    const nextChecked = !allUpgradesSelected;
    setConfig((previous) => {
      const next = { ...previous };
      availableUpgradeOptions.forEach(([key]) => {
        next[key] = nextChecked;
      });
      return next;
    });
  };

  const calculatePrice = () => computePrice({ model: camperModel, ...config });

  const toggleConfig = (key: string) => setConfig((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  const setWheelType = (wheels: string) => setConfig((prev) => ({ ...prev, wheels }));
  const setEnclosureType = (enclosureType: string) => setConfig((prev) => ({ ...prev, enclosureType }));
  const setRoofTent = (roofTent: string) => setConfig((prev) => ({ ...prev, roofTent }));

  const addToCart = () => {
    const item = {
      id: Date.now(),
      config: { model: camperModel, ...config },
      price: calculatePrice(),
    };
    setCart([...cart, item]);
    setShowCart(true);
  };

  const removeFromCart = (id: number) => setCart(cart.filter((i) => i.id !== id));

  const getConfigDisplay = (cfg: any) => {
    const parts = [];
    parts.push(cfg.model === 'goat' ? 'The Goat' : 'The Buffalo');
    parts.push('Rolling Camper Frame');
    parts.push('Enclosed Cabin with Single Door');
    if (cfg.model === 'buffalo') parts.push('Rear Doors');
    if (cfg.premiumOffroadWheels) parts.push('Premium Offroad Wheel & Tire Package');
    if (cfg.secondCabinDoor) parts.push('Second Cabin Door');
    if (cfg.model !== 'buffalo' && cfg.rearDoors) parts.push('Rear Doors');
    if (cfg.fullyArticulatedHitch) parts.push('Fully Articulating Hitch');
    if (cfg.vNoseStorage) parts.push('V-Nose Storage');
    if (cfg.roofRack) parts.push('Roof Rack');
    if (cfg.roofTent === 'vagabond') parts.push('ROAM Vagabond 2.0 Rooftop Tent');
    if (cfg.roofTent === 'vagabondXl') parts.push('ROAM Vagabond XL 2.0 Rooftop Tent');
    if (cfg.roofTent === 'desperado') parts.push('ROAM Desperado Hardshell Rooftop Tent');
    if (cfg.interiorPackage) parts.push('Interior Package');
    if (cfg.dualFlowFan) parts.push('Dual Flow Fan');
    if (cfg.countertopsCabinets) parts.push('Countertops and Cabinets');
    if (cfg.electricalLightingPackage) parts.push('Electrical & Lighting Package');
    if (cfg.waterTankFaucet) parts.push('30 Gallon Water Tank and Faucet');
    if (cfg.propaneStovePackage) parts.push('Propane Package & 2 Burner Stove');
    if (cfg.campluxShower) parts.push('CAMPLUX Shower');
    if (cfg.roamShowerRoom) parts.push('The Shower Room');
    if (cfg.arc270Awning) parts.push('The 270 Awning');
    return parts.join(', ');
  };

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
      src: `${process.env.PUBLIC_URL}/images/badland_campers_montana_bound.jpg`,
      title: 'Montana Bound',
      description: 'Badland Campers on the move, headed north for the next show'
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
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <img
              src={`${process.env.PUBLIC_URL}/images/badland_campers_OFFICAL_LOGO.png`}
              alt="Badland Campers"
              className="h-12 sm:h-16 md:h-20 w-auto object-contain cursor-pointer"
              onClick={() => setActiveTab('home')}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <nav className="hidden md:flex space-x-6">
            {['home', 'builder', 'reviews', 'gallery', 'about'].map((tab) => (
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
            {['home', 'builder', 'reviews', 'gallery', 'about'].map((tab) => (
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
          {['home', 'builder', 'gallery', 'reviews', 'about'].map((tab) => (
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
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm" onClick={() => setShowCart(false)}>
          <aside
            className="flex h-full w-full max-w-lg flex-col border-l border-gray-700 bg-gray-950 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            aria-label="Shopping cart"
          >
            <div className="flex items-start justify-between border-b border-gray-800 px-6 py-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">Your build</p>
                <h2 className="mt-1 text-2xl font-black">Cart</h2>
                <p className="mt-1 text-sm text-gray-400">{cart.length} {cart.length === 1 ? 'camper' : 'campers'} configured</p>
              </div>
              <button
                onClick={() => setShowCart(false)}
                className="rounded-full border border-gray-700 p-2 text-gray-300 transition hover:border-orange-500 hover:text-white"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>
            {cart.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <ShoppingCart className="mb-4 text-gray-600" size={42} />
                <h3 className="text-xl font-bold">Your cart is empty</h3>
                <p className="mt-2 max-w-xs text-sm text-gray-400">Choose a model and configure the camper that fits your trips.</p>
                <button onClick={() => setShowCart(false)} className="mt-6 rounded-lg bg-orange-500 px-5 py-3 font-bold hover:bg-orange-600">
                  Continue Building
                </button>
              </div>
            ) : (
              <>
              <div className="flex-1 space-y-4 overflow-y-auto p-6">
                {cart.map((item) => (
                  <article key={item.id} className="rounded-xl border border-gray-700 bg-gray-900 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-orange-500">Custom camper</p>
                        <h3 className="mt-1 text-xl font-black">{MODEL_NAMES[item.config.model === 'goat' ? 'goat' : 'buffalo']}</h3>
                      </div>
                      <span className="whitespace-nowrap text-lg font-black">${item.price.toLocaleString()}</span>
                    </div>
                    <p className="mt-4 border-t border-gray-800 pt-4 text-sm leading-relaxed text-gray-400">
                      {getConfigDisplay(item.config)}
                    </p>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-sm font-semibold text-gray-400 transition hover:text-red-400"
                      >
                        Remove build
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              <div className="border-t border-gray-800 bg-gray-950 p-6">
                <div className="mb-5 flex items-end justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Build total</p>
                    <p className="text-xs text-gray-500">Taxes and delivery confirmed separately</p>
                  </div>
                  <span className="text-2xl font-black text-orange-500">
                    ${cart.reduce((s, i) => s + i.price, 0).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('order');
                    setShowCart(false);
                  }}
                  className="w-full rounded-lg bg-orange-500 py-3.5 font-black text-white transition hover:bg-orange-600"
                >
                  Continue to Checkout
                </button>
                <button onClick={() => setShowCart(false)} className="mt-3 w-full py-2 text-sm font-semibold text-gray-400 hover:text-white">
                  Keep customizing
                </button>
              </div>
              </>
            )}
          </aside>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main
        id="page-content"
        tabIndex={-1}
        className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 lg:py-8 focus:outline-none"
      >
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="max-w-6xl mx-auto">
            {/* Hero Section with Logo */}
            <div className="text-center mb-8 lg:mb-12">
              <div className="flex justify-center mb-6">
                <img
                  src={`${process.env.PUBLIC_URL}/images/badland_campers_OFFICAL_LOGO.png`}
                  alt="Badland Campers Logo"
                  className="h-48 sm:h-56 lg:h-64 xl:h-72 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <p className="text-xl sm:text-2xl text-gray-300 mb-2">
                Premium Off-Road Camper Trailers
              </p>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Design and customize your perfect off-road camper trailer.
                Premium quality, rugged construction, endless adventure possibilities.
              </p>
            </div>

            <section className="mb-12 overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl">
              <div className="aspect-[16/9] overflow-hidden bg-black">
                <img
                  src={`${process.env.PUBLIC_URL}/images/badland_campers_montana_bound.jpg`}
                  alt="Badland Camper in tow at sunset on the way to Montana"
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div className="border-t border-gray-700 px-6 py-6 sm:flex sm:items-end sm:justify-between sm:gap-8 sm:px-9 sm:py-8">
                <div>
                  <p className="mb-2 text-sm font-bold uppercase tracking-[0.28em] text-orange-400">Field Notes</p>
                  <h2 className="text-3xl font-bold text-white sm:text-4xl">Montana Bound</h2>
                </div>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-300 sm:mt-0 sm:text-right sm:text-lg">
                  Badland Campers is headed to Montana for an upcoming show with a fully outfitted camper in tow.
                </p>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-12">
              {/* The Buffalo */}
              <div
                onClick={() => {
                  setCamperModel('buffalo');
                  setActiveTab('builder');
                }}
                className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-orange-500"
              >
                <div className="relative h-64 sm:h-80 bg-gray-900 flex items-center justify-center overflow-hidden">
                  <img
                    src={`${process.env.PUBLIC_URL}/images/camper_alternate_side_view.jpeg`}
                    alt="The Buffalo camper"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-3xl font-bold text-white mb-2">THE BUFFALO</h2>
                    <p className="text-gray-300 text-sm">The Ultimate Adventure Trailer</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-300 mb-4">
                    Our flagship model with premium features and maximum customization options.
                    Built for serious off-road adventures.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-400">
                      <Truck className="mr-2 text-orange-500" size={16} />
                      <span>Heavy-Duty Frame</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <Wrench className="mr-2 text-orange-500" size={16} />
                      <span>Fully Customizable</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <Home className="mr-2 text-orange-500" size={16} />
                      <span>Premium Interior Options</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 w-full">
                      Build The Buffalo
                    </button>
                    <p className="text-gray-400 text-sm mt-2">Starting at $10,000</p>
                  </div>
                </div>
              </div>

              {/* The Goat */}
              <div
                onClick={() => {
                  setCamperModel('goat');
                  setActiveTab('builder');
                }}
                className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-orange-500"
              >
                <div className="relative h-64 sm:h-80 bg-gray-900 flex items-center justify-center overflow-hidden">
                  <img
                    src={`${process.env.PUBLIC_URL}/images/jeepers_campers_greg_v2.png`}
                    alt="The Goat camper"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-3xl font-bold text-white mb-2">THE GOAT</h2>
                    <p className="text-gray-300 text-sm">Compact & Capable</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-300 mb-4">
                    A nimble off-road camper for weekend trips, tight trails, and efficient towing.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-400">
                      <Truck className="mr-2 text-orange-500" size={16} />
                      <span>Compact Design</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <Wrench className="mr-2 text-orange-500" size={16} />
                      <span>Owner-Approved Options</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <Home className="mr-2 text-orange-500" size={16} />
                      <span>Adventure Ready</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 w-full">
                      Build The Goat
                    </button>
                    <p className="text-gray-400 text-sm mt-2">Starting at $8,500</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Adventure Showcase Section */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="relative rounded-lg overflow-hidden shadow-2xl group">
                <img
                  src={`${process.env.PUBLIC_URL}/images/camper_at_park_with_car.jpeg`}
                  alt="Camping at the park"
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex items-end p-6">
                  <div>
                    <h3 className="text-white text-2xl font-bold mb-2">Weekend Getaways</h3>
                    <p className="text-gray-300">Perfect for family adventures and camping trips</p>
                  </div>
                </div>
              </div>
              <div className="relative rounded-lg overflow-hidden shadow-2xl group">
                <img
                  src={`${process.env.PUBLIC_URL}/images/camper_back_view.jpeg`}
                  alt="Camper rear view"
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex items-end p-6">
                  <div>
                    <h3 className="text-white text-2xl font-bold mb-2">Off-Road Ready</h3>
                    <p className="text-gray-300">Built tough for any terrain you encounter</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action Section */}
            <div className="relative rounded-lg overflow-hidden">
              <div className="absolute inset-0">
                <img
                  src={`${process.env.PUBLIC_URL}/images/camper_with_roam_tent.jpeg`}
                  alt="Camper with tent"
                  className="w-full h-full object-cover opacity-20"
                />
              </div>
              <div className="relative bg-gray-800/90 backdrop-blur-sm rounded-lg p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Ready to Start Your Adventure?</h3>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  Choose your model above and start customizing your perfect off-road camper.
                  Choose the features that fit your trips and see transparent pricing in real time.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setActiveTab('gallery')}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200"
                  >
                    View Gallery
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200"
                  >
                    Read Reviews
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BUILDER TAB */}
        {activeTab === 'builder' && (
          <div>
            {/* Inspiration Gallery Banner */}
            <div className="mb-4 lg:mb-6 bg-gray-800 rounded-lg overflow-hidden">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-2">
                <div className="relative group cursor-pointer" onClick={() => { setActiveTab('gallery'); setSelectedMedia(4); setShowLightbox(true); }}>
                  <img
                    src={`${process.env.PUBLIC_URL}/images/camper_back_view_opened.jpeg`}
                    alt="Kitchen Setup"
                    className="w-full h-24 sm:h-32 object-cover rounded transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition-all rounded flex items-center justify-center">
                    <span className="text-white text-xs sm:text-sm font-bold">Kitchen</span>
                  </div>
                </div>
                <div className="relative group cursor-pointer" onClick={() => { setActiveTab('gallery'); setSelectedMedia(2); setShowLightbox(true); }}>
                  <img
                    src={`${process.env.PUBLIC_URL}/images/camper_with_roam_tent.jpeg`}
                    alt="Rooftop Tent"
                    className="w-full h-24 sm:h-32 object-cover rounded transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition-all rounded flex items-center justify-center">
                    <span className="text-white text-xs sm:text-sm font-bold">Rooftop Tent</span>
                  </div>
                </div>
                <div className="relative group cursor-pointer" onClick={() => { setActiveTab('gallery'); setSelectedMedia(5); setShowLightbox(true); }}>
                  <img
                    src={`${process.env.PUBLIC_URL}/images/camper_interior.jpeg`}
                    alt="Interior"
                    className="w-full h-24 sm:h-32 object-cover rounded transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition-all rounded flex items-center justify-center">
                    <span className="text-white text-xs sm:text-sm font-bold">Interior</span>
                  </div>
                </div>
                <div className="relative group cursor-pointer" onClick={() => { setActiveTab('gallery'); setSelectedMedia(6); setShowLightbox(true); }}>
                  <img
                    src={`${process.env.PUBLIC_URL}/images/camper_in_tow.jpeg`}
                    alt="In Action"
                    className="w-full h-24 sm:h-32 object-cover rounded transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition-all rounded flex items-center justify-center">
                    <span className="text-white text-xs sm:text-sm font-bold">In Action</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] gap-4 lg:gap-8 items-start">
              {/* OPTIONS PANEL - Left Side (Scrollable) */}
              <div className="bg-gray-800 rounded-xl p-4 lg:p-6 shadow-xl border border-gray-700">
                <h2 className="text-xs sm:text-sm lg:text-base font-bold mb-2 lg:mb-4 text-center">
                  Build {camperModel === 'goat' ? 'The Goat' : 'The Buffalo'}
                </h2>

                <div className="mb-5 rounded-xl border border-orange-500/70 bg-gradient-to-br from-orange-500/15 to-gray-800 p-4">
                  <div className="flex justify-between gap-4">
                    <div>
                      <div className="font-bold text-base">{MODEL_NAMES[camperModel]} Base Package</div>
                      <div className="text-sm text-gray-300 mt-1">Purpose-built foundation, ready to configure</div>
                      <ul className="text-xs text-gray-400 mt-2 space-y-1">
                        <li>&bull; Welded and powder-coated 2-inch steel frame</li>
                        <li>&bull; Timbren axle-less suspension</li>
                        <li>&bull; Standard hitch insert</li>
                        <li>• Enclosed cabin with single door</li>
                        {camperModel === 'buffalo' && <li>• Rear doors</li>}
                      </ul>
                    </div>
                    <div className="text-orange-400 font-bold text-lg whitespace-nowrap">
                      ${computePrice({ model: camperModel }).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="text-xs sm:text-sm lg:text-base font-bold">Upgrade Options</h3>
                    <button
                      type="button"
                      onClick={toggleAllUpgrades}
                      className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                        allUpgradesSelected
                          ? 'border-orange-500 bg-orange-500 text-white'
                          : 'border-gray-600 text-gray-300 hover:border-orange-500 hover:text-white'
                      }`}
                    >
                      {allUpgradesSelected ? 'Clear all' : 'Select all'}
                    </button>
                  </div>
                  <div className="space-y-1">
                    {availableUpgradeOptions.map(([key, label, price]) => {
                      const checked = Boolean(config[key]);
                      return (
                        <label
                          key={key}
                          className="flex cursor-pointer items-center justify-between rounded bg-gray-700 p-2 transition hover:bg-gray-600 lg:p-3"
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleConfig(key)}
                              className="mr-2 w-4 h-4 accent-orange-500"
                            />
                            <span className="text-xs sm:text-sm">{label}</span>
                          </div>
                          <span className="text-orange-500 font-bold text-xs sm:text-sm">
                            ${price.toLocaleString()}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-3">
                  <h3 className="text-xs sm:text-sm lg:text-base font-bold mb-2">Rooftop Tent Options</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {([
                      ['vagabond', 'ROAM Vagabond 2.0', prices.roofTent_vagabond],
                      ['vagabondXl', 'ROAM Vagabond XL 2.0', prices.roofTent_vagabondXl],
                      ['desperado', 'ROAM Desperado Hardshell', prices.roofTent_desperado],
                    ] as const).map(([tent, label, price]) => (
                      <button
                        key={tent}
                        onClick={() => setRoofTent(config.roofTent === tent ? '' : tent)}
                        className={`p-2 lg:p-3 rounded border-2 transition ${
                          config.roofTent === tent
                            ? 'border-orange-500 bg-orange-500/20'
                            : 'border-gray-600 hover:border-orange-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs sm:text-sm">{label}</span>
                          <span className="text-orange-500 text-xs sm:text-sm">
                            ${price.toLocaleString()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Regular retail pricing verified from ROAM. Final availability and dealer pricing will sync through Shopify Collective.
                  </p>
                  <a
                    href="https://www.roamadventureco.com/collections/tents"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-xs text-orange-400 hover:text-orange-300 mt-2"
                  >
                    View current ROAM rooftop tents ↗
                  </a>
                </div>

              {false && (
              <>

              {/* Frame Type - Standard Only */}
              <div className="mb-1 sm:mb-2 lg:mb-3">
                <h3 className="text-xs sm:text-sm lg:text-base font-bold mb-1 sm:mb-2 flex items-center">
                  <Truck className="mr-1 text-orange-500" size={12} />
                  Frame Type
                </h3>
                <div className="bg-gray-700 p-1 sm:p-2 rounded border-2 border-orange-500">
                  <div className="text-center">
                    <div className="font-bold text-xs sm:text-sm lg:text-base">Standard Frame</div>
                    <div className="text-orange-500 text-xs sm:text-sm lg:text-base">
                      ${prices.standard.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Wheel Selection */}
              <div className="mb-1 sm:mb-2 lg:mb-3">
                <h3 className="text-xs sm:text-sm lg:text-base font-bold mb-1 sm:mb-2">Wheel Package</h3>
                <div className="grid grid-cols-1 gap-1 sm:gap-2">
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
                        <div className="font-bold text-xs sm:text-sm lg:text-base capitalize">{wheel}</div>
                        <div className="text-orange-500 text-xs sm:text-sm lg:text-base">
                          ${prices[('wheels_' + wheel) as keyof typeof prices].toLocaleString()}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Breaking Hubs */}
              <div className="mb-1 sm:mb-2 lg:mb-3">
                <h3 className="text-xs sm:text-sm lg:text-base font-bold mb-1 sm:mb-2">Breaking Hubs</h3>
                <label className="flex items-center justify-between p-1 sm:p-2 lg:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.breakingHubs}
                      onChange={() => toggleConfig('breakingHubs')}
                      className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                    />
                    <span className="text-xs sm:text-sm lg:text-base">Breaking Hubs (Trailer Brakes)</span>
                  </div>
                </label>
              </div>

              {/* Enclosure Options */}
              <div className="mb-1 sm:mb-2 lg:mb-3">
                <h3 className="text-xs sm:text-sm lg:text-base font-bold mb-1 sm:mb-2 flex items-center">
                  <Wrench className="mr-1 text-orange-500" size={12} />
                  Enclosure Options
                </h3>
                <div className="grid grid-cols-1 gap-1 sm:gap-2">
                  <button
                    onClick={() => setEnclosureType('single-door')}
                    className={`p-1 sm:p-2 lg:p-3 rounded border-2 transition ${
                      config.enclosureType === 'single-door'
                        ? 'border-orange-500 bg-orange-500/20'
                        : 'border-gray-600 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs sm:text-sm lg:text-base">Single Door</span>
                      <span className="text-orange-500 text-xs sm:text-sm lg:text-base">${prices.enclosureType_singleDoor.toLocaleString()}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setEnclosureType('dual-door')}
                    className={`p-1 sm:p-2 lg:p-3 rounded border-2 transition ${
                      config.enclosureType === 'dual-door'
                        ? 'border-orange-500 bg-orange-500/20'
                        : 'border-gray-600 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs sm:text-sm lg:text-base">Dual Doors</span>
                      <span className="text-orange-500 text-xs sm:text-sm lg:text-base">${prices.enclosureType_dualDoor.toLocaleString()}</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Rear Hatch */}
              <div className="mb-1 sm:mb-2 lg:mb-3">
                <h3 className="text-xs sm:text-sm lg:text-base font-bold mb-1 sm:mb-2">Rear Hatch</h3>
                <label className="flex items-center justify-between p-1 sm:p-2 lg:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.rearHatch}
                      onChange={() => {
                        // Disable kitchen options when rear hatch is disabled
                        if (config.rearHatch) {
                          setConfig((prev) => ({
                            ...prev,
                            rearHatch: false,
                            partitionKitchenCounter: false,
                            kitchenStoveTop: false,
                            kitchenFridge: false,
                            kitchenCabinet: false,
                            kitchenFaucet: false,
                            kitchenDrawers: false,
                            refrigerator: false,
                          }));
                        } else {
                          toggleConfig('rearHatch');
                        }
                      }}
                      className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                    />
                    <span className="text-xs sm:text-sm lg:text-base">Rear Hatch</span>
                  </div>
                  <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.rearHatch.toLocaleString()}</span>
                </label>
              </div>

              {/* Kitchen Options - Only available when Rear Hatch is enabled */}
              {config.rearHatch && (
              <div className="mb-1 sm:mb-2 lg:mb-3">
                <h3 className="text-xs sm:text-sm lg:text-base font-bold mb-1 sm:mb-2">Kitchen Options</h3>
                <div className="space-y-1">
                  {/* Partition - Kitchen Counter */}
                  <label className="flex items-center justify-between p-1 sm:p-2 lg:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.partitionKitchenCounter}
                        onChange={() => {
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
                        className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Kitchen Partition (splits back in half)</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.partitionKitchenCounter.toLocaleString()}</span>
                  </label>

                  {/* Sub-options (toggleable individually) */}
                  {config.partitionKitchenCounter && (
                    <div className="ml-2 sm:ml-4 space-y-1">
                      <label className="flex items-center p-1 bg-gray-600 rounded cursor-pointer hover:bg-gray-500 transition">
                        <input
                          type="checkbox"
                          checked={config.kitchenStoveTop}
                          onChange={() => toggleConfig('kitchenStoveTop')}
                          className="mr-1 w-2 h-2 sm:w-3 sm:h-3 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
                        />
                        <span className="text-xs text-gray-300">Stove Top</span>
                      </label>
                      <label className="flex items-center p-1 bg-gray-600 rounded cursor-pointer hover:bg-gray-500 transition">
                        <input
                          type="checkbox"
                          checked={config.kitchenFridge}
                          onChange={() => toggleConfig('kitchenFridge')}
                          className="mr-1 w-2 h-2 sm:w-3 sm:h-3 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
                        />
                        <span className="text-xs text-gray-300">Fridge</span>
                      </label>
                      <label className="flex items-center p-1 bg-gray-600 rounded cursor-pointer hover:bg-gray-500 transition">
                        <input
                          type="checkbox"
                          checked={config.kitchenCabinet}
                          onChange={() => toggleConfig('kitchenCabinet')}
                          className="mr-1 w-2 h-2 sm:w-3 sm:h-3 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
                        />
                        <span className="text-xs text-gray-300">Cabinet</span>
                      </label>
                      <label className="flex items-center p-1 bg-gray-600 rounded cursor-pointer hover:bg-gray-500 transition">
                        <input
                          type="checkbox"
                          checked={config.kitchenFaucet}
                          onChange={() => toggleConfig('kitchenFaucet')}
                          className="mr-1 w-2 h-2 sm:w-3 sm:h-3 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
                        />
                        <span className="text-xs text-gray-300">Faucet</span>
                      </label>
                    </div>
                  )}

                  {/* Additional Back Hatch Options */}
                  <label className="flex items-center justify-between p-1 sm:p-2 lg:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.kitchenDrawers}
                        onChange={() => toggleConfig('kitchenDrawers')}
                        className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Kitchen Drawers</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.kitchenDrawers.toLocaleString()}</span>
                  </label>

                  <label className="flex items-center justify-between p-1 sm:p-2 lg:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.refrigerator}
                        onChange={() => toggleConfig('refrigerator')}
                        className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Refrigerator</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.refrigerator.toLocaleString()}</span>
                  </label>
                </div>
              </div>
              )}

              {/* Roof Tent Options */}
              <div className="mb-1 sm:mb-2 lg:mb-3">
                <h3 className="text-xs sm:text-sm lg:text-base font-bold mb-1 sm:mb-2">Roof Tent Options</h3>
                <div className="grid grid-cols-1 gap-1 sm:gap-2">
                  <button
                    onClick={() => setRoofTent(config.roofTent === 'basic' ? '' : 'basic')}
                    className={`p-1 sm:p-2 lg:p-3 rounded border-2 transition ${
                      config.roofTent === 'basic'
                        ? 'border-orange-500 bg-orange-500/20'
                        : 'border-gray-600 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs sm:text-sm lg:text-base">Basic</span>
                      <span className="text-orange-500 text-xs sm:text-sm lg:text-base">${prices.roofTent_basic.toLocaleString()}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setRoofTent(config.roofTent === 'premium' ? '' : 'premium')}
                    className={`p-1 sm:p-2 lg:p-3 rounded border-2 transition ${
                      config.roofTent === 'premium'
                        ? 'border-orange-500 bg-orange-500/20'
                        : 'border-gray-600 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs sm:text-sm lg:text-base">Premium</span>
                      <span className="text-orange-500 text-xs sm:text-sm lg:text-base">${prices.roofTent_premium.toLocaleString()}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setRoofTent(config.roofTent === 'luxury' ? '' : 'luxury')}
                    className={`p-1 sm:p-2 lg:p-3 rounded border-2 transition ${
                      config.roofTent === 'luxury'
                        ? 'border-orange-500 bg-orange-500/20'
                        : 'border-gray-600 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs sm:text-sm lg:text-base">Luxury</span>
                      <span className="text-orange-500 text-xs sm:text-sm lg:text-base">${prices.roofTent_luxury.toLocaleString()}</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Exterior Options */}
              <div className="mb-1 sm:mb-2 lg:mb-3">
                <h3 className="text-xs sm:text-sm lg:text-base font-bold mb-1 sm:mb-2">Exterior Options</h3>
                <div className="space-y-1">
                  <label className="flex items-center justify-between p-1 sm:p-2 lg:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.diamondPlateFrontExterior}
                        onChange={() => toggleConfig('diamondPlateFrontExterior')}
                        className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Diamond Plate</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.diamondPlateFrontExterior.toLocaleString()}</span>
                  </label>

                  {config.diamondPlateFrontExterior && (
                    <label className="ml-2 sm:ml-4 flex items-center justify-between p-1 sm:p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.diamondPlatePowderCoat}
                          onChange={() => toggleConfig('diamondPlatePowderCoat')}
                          className="mr-1 w-2 h-2 sm:w-3 sm:h-3 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                        />
                        <span className="text-xs">Powder Coat</span>
                      </div>
                      <span className="text-orange-500 font-bold text-xs sm:text-sm">${prices.diamondPlatePowderCoat.toLocaleString()}</span>
                    </label>
                  )}

                  <label className="flex items-center justify-between p-1 sm:p-2 lg:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.vNoseFrontStorage}
                        onChange={() => toggleConfig('vNoseFrontStorage')}
                        className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">V-Nose Storage</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.vNoseFrontStorage.toLocaleString()}</span>
                  </label>

                  {config.vNoseFrontStorage && (
                    <label className="ml-2 sm:ml-4 flex items-center justify-between p-1 sm:p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.vNosePowderCoat}
                          onChange={() => toggleConfig('vNosePowderCoat')}
                          className="mr-1 w-2 h-2 sm:w-3 sm:h-3 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                        />
                        <span className="text-xs">Powder Coat</span>
                      </div>
                      <span className="text-orange-500 font-bold text-xs sm:text-sm">${prices.vNosePowderCoat.toLocaleString()}</span>
                    </label>
                  )}

                  <label className="flex items-center justify-between p-1 sm:p-2 lg:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.fullyArticulatedHitch}
                        onChange={() => toggleConfig('fullyArticulatedHitch')}
                        className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Articulated Hitch</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.fullyArticulatedHitch.toLocaleString()}</span>
                  </label>

                  <label className="flex items-center justify-between p-1 sm:p-2 lg:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.frontStorageBoxes}
                        onChange={() => toggleConfig('frontStorageBoxes')}
                        className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Storage Boxes</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.frontStorageBoxes.toLocaleString()}</span>
                  </label>

                  <label className="flex items-center justify-between p-1 sm:p-2 lg:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.toolBoxDPlated}
                        onChange={() => toggleConfig('toolBoxDPlated')}
                        className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Tool Box</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.toolBoxDPlated.toLocaleString()}</span>
                  </label>

                  {config.toolBoxDPlated && (
                    <label className="ml-2 sm:ml-4 flex items-center justify-between p-1 sm:p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.toolBoxPowderCoat}
                          onChange={() => toggleConfig('toolBoxPowderCoat')}
                          className="mr-1 w-2 h-2 sm:w-3 sm:h-3 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                        />
                        <span className="text-xs">Powder Coat</span>
                      </div>
                      <span className="text-orange-500 font-bold text-xs sm:text-sm">${prices.toolBoxPowderCoat.toLocaleString()}</span>
                    </label>
                  )}

                  <label className="flex items-center justify-between p-1 sm:p-2 lg:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.rearReceiverHitch}
                        onChange={() => toggleConfig('rearReceiverHitch')}
                        className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Rear Hitch</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.rearReceiverHitch.toLocaleString()}</span>
                  </label>

                  <label className="flex items-center justify-between p-1 sm:p-2 lg:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.trailerWiringLights}
                        onChange={() => toggleConfig('trailerWiringLights')}
                        className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Wiring + Lights</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.trailerWiringLights.toLocaleString()}</span>
                  </label>

                  <label className="flex items-center justify-between p-1 sm:p-2 lg:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.roofTopAccessSteps}
                        onChange={() => toggleConfig('roofTopAccessSteps')}
                        className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Roof Steps</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.roofTopAccessSteps.toLocaleString()}</span>
                  </label>
                </div>
              </div>

              {/* Interior Options */}
              <div className="mb-1 sm:mb-2 lg:mb-3">
                <h3 className="text-xs sm:text-sm lg:text-base font-bold mb-1 sm:mb-2">Interior Options</h3>
                <div className="space-y-1">
                  <label className="flex items-center justify-between p-1 sm:p-2 lg:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.interiorWiringPackage}
                        onChange={() => toggleConfig('interiorWiringPackage')}
                        className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Wiring Package</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.interiorWiringPackage.toLocaleString()}</span>
                  </label>

                  <label className="flex items-center justify-between p-1 sm:p-2 lg:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.lithiumBattery}
                        onChange={() => toggleConfig('lithiumBattery')}
                        className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Lithium Battery</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.lithiumBattery.toLocaleString()}</span>
                  </label>

                  <label className="flex items-center justify-between p-1 sm:p-2 lg:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.onboardBatteryCharger}
                        onChange={() => toggleConfig('onboardBatteryCharger')}
                        className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Battery Charger</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.onboardBatteryCharger.toLocaleString()}</span>
                  </label>

                  <label className="flex items-center justify-between p-1 sm:p-2 lg:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.redarcCharger}
                        onChange={() => toggleConfig('redarcCharger')}
                        className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">REDARC Charger</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.redarcCharger.toLocaleString()}</span>
                  </label>

                  <label className="flex items-center justify-between p-1 sm:p-2 lg:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.interiorLightingPackage}
                        onChange={() => toggleConfig('interiorLightingPackage')}
                        className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Lighting Package</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.interiorLightingPackage.toLocaleString()}</span>
                  </label>

                  <label className="flex items-center justify-between p-1 sm:p-2 lg:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.tenSpeedFan}
                        onChange={() => toggleConfig('tenSpeedFan')}
                        className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">10 Speed Fan</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.tenSpeedFan.toLocaleString()}</span>
                  </label>

                  <label className="flex items-center justify-between p-1 sm:p-2 lg:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.onboardWaterTank}
                        onChange={() => toggleConfig('onboardWaterTank')}
                        className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Water Tank + Pump</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.onboardWaterTank.toLocaleString()}</span>
                  </label>

                  <label className="flex items-center justify-between p-1 sm:p-2 lg:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.onboardPropaneTank}
                        onChange={() => toggleConfig('onboardPropaneTank')}
                        className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Propane Tank</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.onboardPropaneTank.toLocaleString()}</span>
                  </label>

                  <label className="flex items-center justify-between p-1 sm:p-2 lg:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.campluxOutdoorShower}
                        onChange={() => toggleConfig('campluxOutdoorShower')}
                        className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Outdoor Shower</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.campluxOutdoorShower.toLocaleString()}</span>
                  </label>

                  <label className="flex items-center justify-between p-1 sm:p-2 lg:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.roamShowerRoom}
                        onChange={() => toggleConfig('roamShowerRoom')}
                        className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs sm:text-sm lg:text-base">Shower Room</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.roamShowerRoom.toLocaleString()}</span>
                  </label>
                </div>
              </div>

              {/* Interior Packages */}
              <div className="mb-1 sm:mb-2 lg:mb-3">
                <h3 className="text-xs sm:text-sm lg:text-base font-bold mb-1 sm:mb-2">Interior Packages</h3>
                <div className="space-y-1">
                  <label className="flex items-start justify-between p-1 sm:p-2 lg:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
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
                        className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 mt-0.5 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <div>
                        <span className="text-xs sm:text-sm lg:text-base font-bold">Basic</span>
                        <div className="text-xs text-gray-400">Particle board</div>
                      </div>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.basicInteriorPackage.toLocaleString()}</span>
                  </label>

                  <label className="flex items-start justify-between p-1 sm:p-2 lg:p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition">
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
                        className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 mt-0.5 text-orange-500 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                      />
                      <div>
                        <span className="text-xs sm:text-sm lg:text-base font-bold">Premium</span>
                        <div className="text-xs text-gray-400">Cedar/Teak</div>
                      </div>
                    </div>
                    <span className="text-orange-500 font-bold text-xs sm:text-sm lg:text-base">${prices.premiumInteriorPackage.toLocaleString()}</span>
                  </label>
                </div>
              </div>
              </>
              )}
            </div>

            {/* VISUAL PREVIEW - Right Side (Sticky) */}
            <div className="lg:sticky lg:top-4 bg-gray-800 rounded-xl p-4 shadow-2xl border border-gray-700">
              <h3 className="text-xs sm:text-sm lg:text-base font-bold mb-1 sm:mb-2 lg:mb-3 text-center text-orange-500">
                {camperModel === 'goat' ? 'The Goat' : 'The Buffalo'}
              </h3>

              <img
                src={`${process.env.PUBLIC_URL}/images/${
                  camperModel === 'goat' ? 'jeepers_campers_greg_v2.png' : 'camper_alternate_side_view.jpeg'
                }`}
                alt={`${camperModel === 'goat' ? 'The Goat' : 'The Buffalo'} camper`}
                className="w-full max-h-72 object-cover rounded-lg mb-3"
              />

              {/* Configuration Summary */}
              <div className="bg-gray-700 rounded-lg p-1 sm:p-2 lg:p-3 mb-1 sm:mb-2 lg:mb-3">
                <h4 className="font-bold mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base border-b border-gray-600 pb-1">Config</h4>
                <div className="space-y-1 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Base:</span>
                    <span className="text-orange-500 font-semibold">{MODEL_NAMES[camperModel]} Package</span>
                  </div>
                  {config.premiumOffroadWheels && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Wheels:</span>
                      <span className="text-orange-500 font-semibold">Premium Offroad</span>
                    </div>
                  )}
                  {config.roofTent && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Rooftop Tent:</span>
                      <span className="text-orange-500 font-semibold">
                        {config.roofTent === 'vagabond'
                          ? 'Vagabond 2.0'
                          : config.roofTent === 'vagabondXl'
                            ? 'Vagabond XL 2.0'
                            : 'Desperado'}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-600 pt-1 mt-1">
                    <div className="flex justify-between font-bold text-xs sm:text-sm lg:text-base">
                      <span className="text-white">Total:</span>
                      <span className="text-orange-500">${calculatePrice().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={addToCart}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 sm:py-3 lg:py-4 rounded-lg font-bold text-xs sm:text-sm lg:text-base transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                <ShoppingCart className="mr-1 sm:mr-2" size={14} />
                Add to Cart
              </button>
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
          <div className="mx-auto max-w-6xl">
            <section className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-900">
              <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
                <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
                  <div className="mb-5 flex flex-wrap items-center gap-3">
                    <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-500">About Badland</p>
                    <span className="rounded-full border border-orange-500/50 bg-orange-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-orange-300">
                      Veteran owned
                    </span>
                  </div>
                  <h2 className="max-w-xl text-4xl font-black leading-tight sm:text-5xl">
                    Built for the trip, not the driveway.
                  </h2>
                  <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-300">
                    Badland Campers is Matt’s veteran-owned business, built around a simple idea:
                    outdoor equipment should be practical, dependable, and easy to make your own.
                    We build compact campers for people who would rather spend their time exploring
                    than wrestling with complicated gear.
                  </p>
                  <p className="mt-4 max-w-xl leading-relaxed text-gray-400">
                    The same values behind Matt’s work at Hornet Outdoors carry forward here:
                    straightforward service, American workmanship, and products shaped by real outdoor
                    use—not showroom gimmicks.
                  </p>
                </div>
                <img
                  src={`${process.env.PUBLIC_URL}/images/camper_at_park_with_car.jpeg`}
                  alt="A Badland camper ready for an outdoor trip"
                  className="h-72 w-full object-cover lg:h-full lg:min-h-[510px]"
                />
              </div>
            </section>

            <section className="grid gap-5 py-10 md:grid-cols-3">
              {[
                ['Useful by design', 'Straightforward systems, thoughtful storage, and options that earn their place.'],
                ['Made for real use', 'The Buffalo and The Goat are configured around how people camp, tow, and travel.'],
                ['Help from people', 'Questions are handled directly by a team that knows the products and the build.'],
              ].map(([title, copy], index) => (
                <div key={title} className="rounded-xl border border-gray-700 bg-gray-900 p-6">
                  <span className="text-sm font-black text-orange-500">0{index + 1}</span>
                  <h3 className="mt-4 text-xl font-bold">{title}</h3>
                  <p className="mt-2 leading-relaxed text-gray-400">{copy}</p>
                </div>
              ))}
            </section>

            <section className="flex flex-col gap-6 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
              <div>
                <h3 className="text-2xl font-black">Start with the camper. Build from there.</h3>
                <p className="mt-2 text-gray-300">Choose The Buffalo or The Goat, then add only what your trips need.</p>
              </div>
              <button
                onClick={() => setActiveTab('builder')}
                className="shrink-0 rounded-lg bg-orange-500 px-6 py-3 font-black text-white transition hover:bg-orange-600"
              >
                Explore the Builder
              </button>
            </section>
          </div>
        )}

        {/* ORDER TAB */}
        {activeTab === 'order' && (
          <div className="max-w-4xl mx-auto">
            {checkoutStatus === 'verifying' ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold mb-2">Confirming your payment…</h2>
                <p className="text-gray-400">One moment while we verify your order with Stripe.</p>
              </div>
            ) : checkoutStatus === 'unconfirmed' ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <h2 className="text-2xl font-bold mb-3">Thanks — we’re finalizing your payment</h2>
                <p className="text-gray-300 mb-2">
                  If your payment went through, you’ll get a confirmation email shortly and we’ll be in touch.
                  Nothing was charged twice — your build is still saved if you need to try again.
                </p>
                <button
                  onClick={() => {
                    setCheckoutStatus(null);
                    setActiveTab('builder');
                  }}
                  className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded font-bold"
                >
                  Back to Builder
                </button>
              </div>
            ) : checkoutStatus === 'success' ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
                <h2 className="text-3xl font-bold text-green-500 mb-3">Payment received — thank you!</h2>
                <p className="text-gray-300 mb-2">
                  Your order is confirmed. We’ve emailed a receipt and will contact you within 24 hours to
                  confirm the details of your build.
                </p>
                <p className="text-gray-400 mb-6 text-sm">
                  If you paid a 50% deposit, we’ll invoice the remaining balance as your build nears completion.
                </p>
                <button
                  onClick={() => {
                    setCheckoutStatus(null);
                    setActiveTab('home');
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded font-bold"
                >
                  Back to Home
                </button>
              </div>
            ) : cart.length === 0 ? (
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
              <>
                {checkoutStatus === 'cancel' && (
                  <div className="mb-4 bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 text-sm text-yellow-200">
                    Payment was canceled — no charge was made. Your build is still saved below, so you can try
                    again whenever you’re ready.
                  </div>
                )}
                <OrderForm
                  cart={cart}
                  onBackToBuilder={() => setActiveTab('builder')}
                  getConfigDisplay={getConfigDisplay}
                />
              </>
            )}
          </div>
        )}
      </main>

      <ContactForm compact={activeTab === 'about'} />

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
