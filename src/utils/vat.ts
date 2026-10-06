const PERCENT = 100;
const CENTS_PER_PESO = 100;

export interface IncludedVat {
  readonly baseInCents: number;
  readonly vatInCents: number;
}

/**
 * Splits an amount that already includes VAT into its base (whole pesos) and the VAT, by
 * difference so both always add up to the amount. Same formula as the API (BR-16).
 */
export const includedVat = (amountInCents: number, ratePercent: number): IncludedVat => {
  const baseInCents = Math.round(amountInCents / (PERCENT + ratePercent)) * CENTS_PER_PESO;
  return { baseInCents, vatInCents: amountInCents - baseInCents };
};
