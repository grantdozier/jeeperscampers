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
  roamShowerRoom: 379,
  arc270Awning: 999,
  // ROAM regular retail prices verified 2026-07-17. Shopify Collective should
  // become the source of truth after the supplier connection is active.
  roofTent_vagabond: 2399,
  roofTent_vagabondXl: 2749,
  roofTent_desperado: 3199,
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
  basicInteriorPackage: 0,
  premiumInteriorPackage: 0,
  roofTent_basic: 0,
  roofTent_premium: 0,
  roofTent_luxury: 0,
} as const;

export type PriceKey = keyof typeof PRICES;

// A camper build config. Named fields that affect pricing branches are required;
// the index signature covers the many boolean accessory toggles.
export type CamperConfig = { roofTent?: string } & Record<string, string | boolean | undefined>;

export type CamperModel = 'goat' | 'buffalo';

export const MODEL_INCLUDED_UPGRADES: Record<CamperModel, PriceKey[]> = {
  goat: ['enclosedCabinSingleDoor'],
  buffalo: ['enclosedCabinSingleDoor', 'rearDoors'],
};

export const MODEL_NAMES: Record<CamperModel, string> = {
  goat: 'The Goat',
  buffalo: 'The Buffalo',
};

/**
 * Compute the full (100%) price of a camper build, in whole US dollars.
 *
 * The rolling frame is always included. Owner-approved upgrades are boolean
 * selections, while the retained rooftop-tent choices are single-select.
 */
export function calculatePrice(config: Record<string, any>): number {
  const model: CamperModel = config.model === 'buffalo' ? 'buffalo' : 'goat';
  const included = MODEL_INCLUDED_UPGRADES[model];
  let total = PRICES.rollingCamperFrame;

  included.forEach((key) => {
    total += PRICES[key];
  });

  if (config.roofTent === 'vagabond') total += PRICES.roofTent_vagabond;
  if (config.roofTent === 'vagabondXl') total += PRICES.roofTent_vagabondXl;
  if (config.roofTent === 'desperado') total += PRICES.roofTent_desperado;

  Object.keys(config).forEach((key) => {
    if (config[key] === true && !included.includes(key as PriceKey) && PRICES[key as PriceKey]) {
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
