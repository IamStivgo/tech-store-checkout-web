import type {
  AcceptanceTokens,
  CheckoutQuote,
  Transaction,
  TransactionStatus,
} from '../../src/services/api/contract';

import { CATALOG } from './catalog';

const cents = (amountInCents: number) => ({ amountInCents, currency: 'COP' as const });
const CABLE = CATALOG.data[0];

export const TRANSACTION_ID = '015209fe-0eb8-4534-a4b3-dde8145ac37c';

/** Quote of one cable to Bogotá (copy deck example E1). */
export const QUOTE: CheckoutQuote = {
  productId: CABLE?.id ?? '',
  quantity: 1,
  unitPrice: cents(3_990_000),
  productAmount: cents(3_990_000),
  serviceFee: cents(300_000),
  deliveryFee: cents(800_000),
  total: cents(5_090_000),
  delivery: {
    zone: 'LOCAL',
    billableWeightKg: 1,
    freeShippingApplied: false,
    freeShippingThreshold: cents(15_000_000),
    estimatedBusinessDays: { min: 1, max: 1 },
  },
  calculatedAt: '2026-09-28T12:50:00.000Z',
};

export const ACCEPTANCE: AcceptanceTokens = {
  endUserPolicy: { acceptanceToken: 'a.b.c', permalink: 'https://example.com/terms.pdf' },
  personalDataAuth: { acceptanceToken: 'd.e.f', permalink: 'https://example.com/data.pdf' },
};

const PAID_STATUS: Partial<
  Record<TransactionStatus, { message: string | null; lastFour: string }>
> = {
  APPROVED: { message: null, lastFour: '4242' },
  DECLINED: { message: 'La transacción fue rechazada (Sandbox)', lastFour: '1111' },
};

/** The transaction as the API answers it, before or after the payment. */
export const transaction = (status: TransactionStatus): Transaction => {
  const paid = PAID_STATUS[status];
  return {
    id: TRANSACTION_ID,
    reference: 'CKT-20260928-YQDGMY1VPT',
    status,
    product: { id: CABLE?.id ?? '', sku: 'TEC-CBL-USBC', name: CABLE?.name ?? '' },
    quantity: 1,
    amounts: {
      productAmount: QUOTE.productAmount,
      serviceFee: QUOTE.serviceFee,
      deliveryFee: QUOTE.deliveryFee,
      total: QUOTE.total,
    },
    delivery: { zone: 'LOCAL', estimatedBusinessDays: { min: 1, max: 1 } },
    payment: paid
      ? {
          status,
          statusMessage: paid.message,
          method: 'CARD',
          cardBrand: 'VISA',
          cardLastFour: paid.lastFour,
          installments: 1,
          submittedAt: '2026-09-28T12:50:10.000Z',
        }
      : null,
    deliveryId: status === 'APPROVED' ? '9585aedc-5f89-494e-b33a-985ce26aebc7' : null,
    reservationExpiresAt: '2026-09-28T13:05:00.000Z',
    finalizedAt: paid ? '2026-09-28T12:50:12.000Z' : null,
    createdAt: '2026-09-28T12:50:00.000Z',
    updatedAt: '2026-09-28T12:50:12.000Z',
  };
};
