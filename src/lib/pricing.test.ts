import { calculateDeposit, calculatePrice, DEPOSIT_PERCENT, PRICES } from './pricing';

describe('camper pricing', () => {
  it('prices a base camper using server-shared rules', () => {
    expect(
      calculatePrice({ wheels: 'standard', enclosureType: 'single-door', roofTent: 'basic' }),
    ).toBe(
      PRICES.standard +
        PRICES.wheels_standard +
        PRICES.enclosureType_singleDoor +
        PRICES.roofTent_basic,
    );
  });

  it('adds selected accessories once', () => {
    const base = calculatePrice({ wheels: 'offroad', enclosureType: 'dual-door', roofTent: 'premium' });
    const configured = calculatePrice({
      wheels: 'offroad',
      enclosureType: 'dual-door',
      roofTent: 'premium',
      rearHatch: true,
      refrigerator: true,
    });

    expect(configured - base).toBe(PRICES.rearHatch + PRICES.refrigerator);
  });

  it('calculates the advertised deposit', () => {
    expect(DEPOSIT_PERCENT).toBe(50);
    expect(calculateDeposit(15_999)).toBe(8_000);
  });
});
