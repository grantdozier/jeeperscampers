// Single source of truth for camper configuration pricing.
//
// This module is intentionally framework-neutral (no React / DOM imports) so it
// can be imported by BOTH:
//   1. the client builder UI (src/components/JeepersCampers.tsx), and
//   2. the server-side Stripe Checkout function (/api/create-checkout).
//
// The server MUST recompute the price from this table before creating a Stripe
// charge. Never trust an amount sent from the browser — a customer can edit the
// client-side total to anything (e.g. $1) before paying. This shared table keeps
// the client display and the server-of-record price from ever drifting apart.

export const PRICES = {
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
} as const;

export type PriceKey = keyof typeof PRICES;

// A camper build config. Named fields that affect pricing branches are required;
// the index signature covers the many boolean accessory toggles.
export type CamperConfig = {
  wheels: string;
  enclosureType: string;
  roofTent: string;
} & Record<string, string | boolean | undefined>;

/**
 * Compute the full (100%) price of a camper build, in whole US dollars.
 *
 * Behaviour is intentionally identical to the original inline builder logic:
 *  - base frame is always `standard`
 *  - wheels / enclosure / roof-tent are single-select and priced by variant
 *  - every other truthy boolean toggle adds its listed price (0-priced options
 *    such as included kitchen items contribute nothing)
 */
export function calculatePrice(config: Record<string, any>): number {
  let total = PRICES.standard + (PRICES[('wheels_' + config.wheels) as PriceKey] || 0);

  // Enclosure type (single-select)
  if (config.enclosureType === 'single-door') {
    total += PRICES.enclosureType_singleDoor;
  } else if (config.enclosureType === 'dual-door') {
    total += PRICES.enclosureType_dualDoor;
  }

  // Roof tent (single-select)
  if (config.roofTent === 'basic') {
    total += PRICES.roofTent_basic;
  } else if (config.roofTent === 'premium') {
    total += PRICES.roofTent_premium;
  } else if (config.roofTent === 'luxury') {
    total += PRICES.roofTent_luxury;
  }

  // Boolean accessory toggles
  Object.keys(config).forEach((key) => {
    if (config[key] === true && PRICES[key as PriceKey]) {
      total += PRICES[key as PriceKey];
    }
  });

  return total;
}

/** Deposit percentage for the "reserve your build" option. */
export const DEPOSIT_PERCENT = 50;

/**
 * Given a full price, return the deposit amount (rounded to whole dollars).
 * Used by both the UI (to display "Pay $X now") and the server (to charge it).
 */
export function calculateDeposit(fullPrice: number, percent: number = DEPOSIT_PERCENT): number {
  return Math.round((fullPrice * percent) / 100);
}
