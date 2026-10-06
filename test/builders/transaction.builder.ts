import type { Transaction } from '../../src/services/api/contract';

const cents = (amountInCents: number) => ({ amountInCents, currency: 'COP' as const });

export const TRANSACTION_ID = '015209fe-0eb8-4534-a4b3-dde8145ac37c';

export const aTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: TRANSACTION_ID,
  reference: 'CKT-20260928-YQDGMY1VPT',
  status: 'PENDING',
  product: {
    id: '7d094266-0b4e-4789-9522-96e1cd7ffa60',
    sku: 'TEC-CBL-USBC',
    name: 'Cable USB-C a USB-C 2 m (100 W)',
  },
  quantity: 1,
  amounts: {
    productAmount: cents(3_990_000),
    vat: { ratePercent: 19, base: cents(3_352_900), amount: cents(637_100) },
    serviceFee: cents(300_000),
    deliveryFee: cents(800_000),
    total: cents(5_090_000),
  },
  delivery: { zone: 'LOCAL', estimatedBusinessDays: { min: 1, max: 1 } },
  payment: null,
  deliveryId: null,
  reservationExpiresAt: '2026-09-28T13:05:00.000Z',
  finalizedAt: null,
  createdAt: '2026-09-28T12:50:00.000Z',
  updatedAt: '2026-09-28T12:50:00.000Z',
  ...overrides,
});

export const anApprovedTransaction = (overrides: Partial<Transaction> = {}): Transaction =>
  aTransaction({
    status: 'APPROVED',
    payment: {
      status: 'APPROVED',
      statusMessage: null,
      method: 'CARD',
      cardBrand: 'VISA',
      cardLastFour: '4242',
      installments: 1,
      submittedAt: '2026-09-28T12:50:10.000Z',
    },
    deliveryId: '9585aedc-5f89-494e-b33a-985ce26aebc7',
    finalizedAt: '2026-09-28T12:50:12.000Z',
    ...overrides,
  });

export const aDeclinedTransaction = (overrides: Partial<Transaction> = {}): Transaction =>
  aTransaction({
    status: 'DECLINED',
    payment: {
      status: 'DECLINED',
      statusMessage: 'La transacción fue rechazada (Sandbox)',
      method: 'CARD',
      cardBrand: 'VISA',
      cardLastFour: '1111',
      installments: 1,
      submittedAt: '2026-09-28T12:50:10.000Z',
    },
    finalizedAt: '2026-09-28T12:50:12.000Z',
    ...overrides,
  });
