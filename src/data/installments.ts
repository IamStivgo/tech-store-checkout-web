/** Installments the payment provider accepts for credit cards (frontend design §6). */
export const INSTALLMENTS = [1, 2, 3, 6, 12, 24, 36] as const;

export type Installments = (typeof INSTALLMENTS)[number];

export const DEFAULT_INSTALLMENTS: Installments = 1;

export const installmentsLabel = (count: number): string =>
  count === 1 ? '1 cuota' : `${count} cuotas`;
