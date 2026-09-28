const DECIMAL = 10;
const MAX_DIGIT = 9;

/** Luhn (mod 10) checksum of a string of digits; the empty string is not valid. */
export const luhnCheck = (digits: string): boolean => {
  if (!/^\d+$/.test(digits)) {
    return false;
  }

  let sum = 0;
  // From the rightmost digit, every second digit is doubled.
  for (let offset = 0; offset < digits.length; offset += 1) {
    const digit = Number(digits.charAt(digits.length - 1 - offset));
    const value = offset % 2 === 1 ? digit * 2 : digit;
    sum += value > MAX_DIGIT ? value - MAX_DIGIT : value;
  }

  return sum % DECIMAL === 0;
};
