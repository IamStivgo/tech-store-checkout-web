import { detectBrand, type CardBrand } from './card-brand';
import { luhnCheck } from './luhn';

const GROUP_SIZE = 4;
const MAX_CARD_DIGITS = 19;

const VALID_LENGTHS: Readonly<Record<Exclude<CardBrand, 'UNKNOWN'>, readonly number[]>> = {
  VISA: [13, 16, 19],
  MASTERCARD: [16],
};

export type CardNumberCheck = 'VALID' | 'INVALID' | 'UNSUPPORTED_BRAND';

export interface FormattedInput {
  readonly value: string;
  /** Where the caret goes after formatting, so typing in the middle does not jump to the end. */
  readonly caret: number;
}

export const cardDigits = (value: string): string =>
  value.replace(/\D/g, '').slice(0, MAX_CARD_DIGITS);

// Index right after the n-th digit once a space is inserted every four digits.
const caretAfterDigits = (digitsBefore: number): number =>
  digitsBefore === 0 ? 0 : digitsBefore + Math.floor((digitsBefore - 1) / GROUP_SIZE);

/** `4242424242424242` → `4242 4242 4242 4242`, keeping the caret after the same digit. */
export const formatCardNumber = (value: string, caret = value.length): FormattedInput => {
  const digits = cardDigits(value);
  const groups = digits.match(/\d{1,4}/g) ?? [];
  const digitsBeforeCaret = Math.min(cardDigits(value.slice(0, caret)).length, digits.length);

  return { value: groups.join(' '), caret: caretAfterDigits(digitsBeforeCaret) };
};

/** Length for the brand and Luhn; any other brand is rejected as unsupported. */
export const validateCardNumber = (value: string): CardNumberCheck => {
  const digits = value.replace(/\s/g, '');
  if (!/^\d+$/.test(digits)) {
    return 'INVALID';
  }

  const brand = detectBrand(digits);
  if (brand === 'UNKNOWN') {
    return 'UNSUPPORTED_BRAND';
  }
  return VALID_LENGTHS[brand].includes(digits.length) && luhnCheck(digits) ? 'VALID' : 'INVALID';
};
