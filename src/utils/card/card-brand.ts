export type CardBrand = 'VISA' | 'MASTERCARD' | 'UNKNOWN';

// 51-55 and the 2221-2720 range.
const MASTERCARD = /^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/;

/** Brand from the first digits; the store only accepts VISA and MasterCard. */
export const detectBrand = (digits: string): CardBrand => {
  if (digits.startsWith('4')) {
    return 'VISA';
  }
  return MASTERCARD.test(digits) ? 'MASTERCARD' : 'UNKNOWN';
};
