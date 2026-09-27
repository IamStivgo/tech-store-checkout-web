export interface CardExpiry {
  readonly month: number;
  /** Four-digit year. */
  readonly year: number;
}

export type ExpiryCheck = 'VALID' | 'INVALID' | 'EXPIRED';

const MONTHS_PER_YEAR = 12;
const CENTURY = 2000;
// Cards are not issued for longer; a later date is a typo.
const MAX_YEARS_AHEAD = 15;
const EXPIRY_DIGITS = 4;
const MONTH_DIGITS = 2;

/** Adds the slash while typing: `1228` → `12/28`. */
export const formatExpiry = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, EXPIRY_DIGITS);
  return digits.length > MONTH_DIGITS
    ? `${digits.slice(0, MONTH_DIGITS)}/${digits.slice(MONTH_DIGITS)}`
    : digits;
};

/** Reads `MM/AA` (spaces allowed around the slash); null if it is not a real month. */
export const parseExpiry = (value: string): CardExpiry | null => {
  const match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }
  const month = Number(match[1]);
  const year = CENTURY + Number(match[2]);
  return month >= 1 && month <= MONTHS_PER_YEAR ? { month, year } : null;
};

const monthIndex = ({ month, year }: CardExpiry): number => year * MONTHS_PER_YEAR + month;

const currentMonth = (now: Date): CardExpiry => ({
  month: now.getMonth() + 1,
  year: now.getFullYear(),
});

/** A card works until the last day of its expiry month. */
export const isExpired = (expiry: CardExpiry, now: Date): boolean =>
  monthIndex(expiry) < monthIndex(currentMonth(now));

export const validateExpiry = (value: string, now: Date): ExpiryCheck => {
  const expiry = parseExpiry(value);
  if (!expiry || expiry.year > now.getFullYear() + MAX_YEARS_AHEAD) {
    return 'INVALID';
  }
  return isExpired(expiry, now) ? 'EXPIRED' : 'VALID';
};
