import { deliveryDetail } from '../../../../../src/modules/checkout/components/SummaryBackdrop/delivery-detail';
import type { DeliveryQuote } from '../../../../../src/services/api/contract';

const delivery = (overrides: Partial<DeliveryQuote>): DeliveryQuote => ({
  zone: 'NATIONAL_MAIN',
  billableWeightKg: 1,
  freeShippingApplied: false,
  freeShippingThreshold: { amountInCents: 15_000_000, currency: 'COP' },
  estimatedBusinessDays: { min: 2, max: 3 },
  ...overrides,
});

describe('deliveryDetail', () => {
  it.each([
    ['nothing within the included weight', {}, undefined],
    ['the extra weight (E2)', { billableWeightKg: 4 }, '4 kg (1 kg adicional)'],
    [
      'a special route with extra weight (E4)',
      { zone: 'SPECIAL_ROUTE', billableWeightKg: 4 },
      'Trayecto especial · 4 kg (1 kg adicional)',
    ],
    ['a special route alone', { zone: 'SPECIAL_ROUTE' }, 'Trayecto especial'],
    [
      'the free shipping threshold (E3)',
      { freeShippingApplied: true, billableWeightKg: 4 },
      'Compras desde $ 150.000',
    ],
  ] as const)('explains %s', (_case, overrides, detail) => {
    expect(deliveryDetail(delivery(overrides))?.replace(/\u00a0/g, ' ')).toBe(detail);
  });
});
