import {
  formatExpiry,
  isExpired,
  parseExpiry,
  validateExpiry,
} from '../../../src/utils/card/expiry';

// Thursday 24 September 2026, the purchase date of the mockups.
const NOW = new Date(2026, 8, 24, 15, 0);

describe('formatExpiry', () => {
  it.each([
    ['', ''],
    ['1', '1'],
    ['12', '12'],
    ['122', '12/2'],
    ['1228', '12/28'],
    ['12/28', '12/28'],
    ['12/289', '12/28'],
  ])('formats %j as %j', (value, formatted) => {
    expect(formatExpiry(value)).toBe(formatted);
  });
});

describe('parseExpiry', () => {
  it.each([
    ['12/28', { month: 12, year: 2028 }],
    ['01 / 30', { month: 1, year: 2030 }],
    [' 09/26 ', { month: 9, year: 2026 }],
  ])('reads %j', (value, expiry) => {
    expect(parseExpiry(value)).toEqual(expiry);
  });

  it.each(['', '1228', '13/28', '00/28', '1/28', '12/2028', 'ab/cd'])('rejects %j', (value) => {
    expect(parseExpiry(value)).toBeNull();
  });
});

describe('isExpired', () => {
  it('keeps a card valid until the end of its expiry month', () => {
    expect(isExpired({ month: 9, year: 2026 }, NOW)).toBe(false);
    expect(isExpired({ month: 9, year: 2026 }, new Date(2026, 8, 30, 23, 59))).toBe(false);
    expect(isExpired({ month: 9, year: 2026 }, new Date(2026, 9, 1))).toBe(true);
  });

  it('treats earlier months and years as expired', () => {
    expect(isExpired({ month: 8, year: 2026 }, NOW)).toBe(true);
    expect(isExpired({ month: 12, year: 2025 }, NOW)).toBe(true);
    expect(isExpired({ month: 1, year: 2027 }, NOW)).toBe(false);
  });
});

describe('validateExpiry', () => {
  it.each([
    ['09/26', 'VALID'],
    ['12/41', 'VALID'],
    ['08/26', 'EXPIRED'],
    ['01/42', 'INVALID'],
    ['13/28', 'INVALID'],
    ['', 'INVALID'],
  ])('checks %j as %s', (value, check) => {
    expect(validateExpiry(value, NOW)).toBe(check);
  });
});
