import { detectBrand } from '../../../src/utils/card/card-brand';

describe('detectBrand', () => {
  it.each(['4', '4242424242424242', '4000056655665556'])('detects VISA in %s', (digits) => {
    expect(detectBrand(digits)).toBe('VISA');
  });

  it.each(['51', '5555555555554444', '2221', '2230', '2300', '2699', '2710', '2720'])(
    'detects MasterCard in %s',
    (digits) => {
      expect(detectBrand(digits)).toBe('MASTERCARD');
    },
  );

  it.each(['', '5', '50', '56', '2220', '2721', '378282246310005', '6011111111111117'])(
    'does not recognize %j',
    (digits) => {
      expect(detectBrand(digits)).toBe('UNKNOWN');
    },
  );
});
