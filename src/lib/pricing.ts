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
  rollingCamperFrame: 6000,
  premiumOffroadWheels: 500,
  enclosedCabinSingleDoor: 2500,
  secondCabinDoor: 1500,
  rearDoors: 1500,
  fullyArticulatedHitch: 750,
  vNoseStorage: 2500,
  roofRack: 1000,
  interiorPackage: 2000,
  dualFlowFan: 1000,
  countertopsCabinets: 2000,
  electricalLightingPackage: 2000,
  waterTankFaucet: 1500,
  propaneStovePackage: 1500,
  campluxShower: 1500,
  // Existing rooftop-tent prices retained until the owner supplies replacements.
  roofTent_basic: 2500,
  roofTent_premium: 3500,
  roofTent_luxury: 4500,
  // Zero-value migration aliases referenced only by a non-rendered legacy block.
  standard: 0,
  wheels_standard: 0,
  wheels_offroad: 0,
  wheels_extreme: 0,
  enclosureType_singleDoor: 0,
  enclosureType_dualDoor: 0,
  rearHatch: 0,
  partitionKitchenCounter: 0,
  kitchenDrawers: 0,
  refrigerator: 0,
  diamondPlateFrontExterior: 0,
  diamondPlatePowderCoat: 0,
  vNoseFrontStorage: 0,
  vNosePowderCoat: 0,
  frontStorageBoxes: 0,
  toolBoxDPlated: 0,
  toolBoxPowderCoat: 0,
  rearReceiverHitch: 0,
  trailerWiringLights: 0,
  roofTopAccessSteps: 0,
  interiorWiringPackage: 0,
  lithiumBattery: 0,
  onboardBatteryCharger: 0,
  redarcCharger: 0,
  interiorLightingPackage: 0,
  tenSpeedFan: 0,
  onboardWaterTank: 0,
  onboardPropaneTank: 0,
  campluxOutdoorShower: 0,
  roamShowerRoom: 0,
  basicInteriorPackage: 0,
  premiumInteriorPackage: 0,
} as const;

export type PriceKey = keyof typeof PRICES;

// A camper build config. Named fields that affect pricing branches are required;
// the index signature covers the many boolean accessory toggles.
export type CamperConfig = { roofTent?: string } & Record<string, string | boolean | undefined>;

/**
 * Compute the full (100%) price of a camper build, in whole US dollars.
 *
 * The rolling frame is always included. Owner-approved upgrades are boolean
 * selections, while the retained rooftop-tent choices are single-select.
 */
export function calculatePrice(config: Record<string, any>): number {
  let total = PRICES.rollingCamperFrame;

  // Roof tent (single-select)
  if (config.roofTent === 'basic') {
    total += PRICES.roofTent_basic;
  } else if (config.roofTent === 'premium') {
    total += PRICES.roofTent_premium;
  } else if (config.roofTent === 'luxury') {
    total += PRICES.roofTent_luxury;
  }

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
