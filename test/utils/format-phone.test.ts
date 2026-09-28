import { formatPhone } from '../../src/utils/format-phone';

describe('formatPhone', () => {
  it.each([
    ['3001234567', '300 123 4567'],
    ['6014567890', '601 456 7890'],
    ['300123', '300123'],
  ])('formats %s as %j', (digits, formatted) => {
    expect(formatPhone(digits)).toBe(formatted);
  });
});
