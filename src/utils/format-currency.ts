const COP_FORMAT = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const CENTS_PER_PESO = 100;

/** Formats an amount in cents as Colombian pesos, e.g. 5090000 → "$ 50.900" (non-breaking space). */
export const formatCop = (amountInCents: number): string =>
  COP_FORMAT.format(amountInCents / CENTS_PER_PESO);
