import {
  addBusinessDays,
  deliveryEstimate,
  formatDay,
} from '../../../src/utils/date/delivery-dates';

// Thursday 24 September 2026, the purchase date of the mockups (copy deck §7.3).
const PURCHASE = new Date(2026, 8, 24, 15, 30);

describe('addBusinessDays', () => {
  it.each([
    [0, new Date(2026, 8, 24)],
    [1, new Date(2026, 8, 25)],
    [2, new Date(2026, 8, 28)],
    [5, new Date(2026, 9, 1)],
    [10, new Date(2026, 9, 8)],
  ])('adds %i business days skipping weekends', (days, expected) => {
    expect(addBusinessDays(PURCHASE, days)).toEqual(expected);
  });
});

describe('formatDay', () => {
  it('writes the weekday, the day and the month in Spanish', () => {
    expect(formatDay(new Date(2026, 8, 25))).toBe('viernes 25 de septiembre');
    expect(formatDay(new Date(2026, 8, 28), false)).toBe('lunes 28');
  });
});

describe('deliveryEstimate', () => {
  it.each([
    ['E1 local', { min: 1, max: 1 }, { kind: 'single', day: 'viernes 25 de septiembre' }],
    [
      'E2 main city',
      { min: 2, max: 3 },
      { kind: 'range', first: 'lunes 28', last: 'martes 29 de septiembre' },
    ],
    [
      'E5 rest of the country',
      { min: 3, max: 5 },
      { kind: 'range', first: 'martes 29 de septiembre', last: 'jueves 1 de octubre' },
    ],
    [
      'E4 special route',
      { min: 5, max: 10 },
      { kind: 'range', first: 'jueves 1', last: 'jueves 8 de octubre' },
    ],
  ])('estimates %s', (_case, businessDays, estimate) => {
    expect(deliveryEstimate(PURCHASE, businessDays)).toEqual(estimate);
  });
});
