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
      roamShowerRoom: 379,
      arc270Awning: 999,
    });
  });

  it('prices a base camper using server-shared rules', () => {
    expect(calculatePrice({ model: 'goat' })).toBe(8_500);
    expect(calculatePrice({ model: 'buffalo' })).toBe(10_000);
    expect(
      calculatePrice({
        model: 'buffalo',
        enclosedCabinSingleDoor: true,
        secondCabinDoor: true,
        rearDoors: true,
      }),
    ).toBe(11_500);
  });

  it('adds owner-approved upgrades once', () => {
    const base = calculatePrice({ model: 'goat' });
    const configured = calculatePrice({
      model: 'goat',
      premiumOffroadWheels: true,
      secondCabinDoor: true,
      rearDoors: true,
    });

    expect(configured - base).toBe(
      PRICES.premiumOffroadWheels +
        PRICES.secondCabinDoor +
        PRICES.rearDoors,
    );
  });

  it('retains the renamed rooftop-tent choices', () => {
    expect(calculatePrice({ model: 'goat', roofTent: 'vagabond' })).toBe(
      8_500 + PRICES.roofTent_vagabond,
    );
    expect(PRICES.roofTent_vagabond).toBe(2_399);
    expect(PRICES.roofTent_vagabondXl).toBe(2_749);
    expect(PRICES.roofTent_desperado).toBe(3_199);
  });

  it('calculates the advertised deposit', () => {
    expect(DEPOSIT_PERCENT).toBe(50);
    expect(calculateDeposit(15_999)).toBe(8_000);
  });
});
