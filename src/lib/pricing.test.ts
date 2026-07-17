import { calculateDeposit, calculatePrice, DEPOSIT_PERCENT, PRICES } from './pricing';

describe('camper pricing', () => {
  it('matches the owner-approved price sheet', () => {
    expect(PRICES).toMatchObject({
      rollingCamperFrame: 6000,
      fullyArticulatedHitch: 750,
      vNoseStorage: 2500,
      roofRack: 1000,
      premiumOffroadWheels: 500,
      enclosedCabinSingleDoor: 2500,
      secondCabinDoor: 1500,
      rearDoors: 1500,
      interiorPackage: 2000,
      dualFlowFan: 1000,
      countertopsCabinets: 2000,
      electricalLightingPackage: 2000,
      waterTankFaucet: 1500,
      propaneStovePackage: 1500,
      campluxShower: 1500,
    });
  });

  it('prices a base camper using server-shared rules', () => {
    expect(calculatePrice({})).toBe(PRICES.rollingCamperFrame);
  });

  it('adds owner-approved upgrades once', () => {
    const base = calculatePrice({});
    const configured = calculatePrice({
      premiumOffroadWheels: true,
      enclosedCabinSingleDoor: true,
      secondCabinDoor: true,
      rearDoors: true,
    });

    expect(configured - base).toBe(
      PRICES.premiumOffroadWheels +
        PRICES.enclosedCabinSingleDoor +
        PRICES.secondCabinDoor +
        PRICES.rearDoors,
    );
  });

  it('retains the renamed rooftop-tent choices', () => {
    expect(calculatePrice({ roofTent: 'premium' })).toBe(
      PRICES.rollingCamperFrame + PRICES.roofTent_premium,
    );
  });

  it('calculates the advertised deposit', () => {
    expect(DEPOSIT_PERCENT).toBe(50);
    expect(calculateDeposit(15_999)).toBe(8_000);
  });
});
