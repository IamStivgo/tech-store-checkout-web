import { checkoutApi } from '../../../src/services/api/checkout.api';
import { createAppStore } from '../../../src/store/store';

import { stubFetch } from './fetch-stub';

const cents = (amountInCents: number) => ({ amountInCents, currency: 'COP' as const });

describe('checkoutApi', () => {
  let fetchStub: ReturnType<typeof stubFetch>;

  beforeEach(() => {
    fetchStub = stubFetch();
  });

  afterEach(() => {
    fetchStub.restore();
  });

  it('quotes a product, quantity and city', async () => {
    const quote = {
      productId: '7d094266-0b4e-4789-9522-96e1cd7ffa60',
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
      calculatedAt: '2026-09-24T20:15:00.000Z',
    };
    fetchStub.respondJson(quote);

    const result = await createAppStore().dispatch(
      checkoutApi.endpoints.getQuote.initiate({
        productId: quote.productId,
        quantity: 1,
        cityCode: '11001',
      }),
    );

    expect(result.data).toEqual(quote);
    expect(fetchStub.requestUrls()).toEqual([
      `http://localhost/api/v1/checkout/quote?productId=${quote.productId}&quantity=1&cityCode=11001`,
    ]);
  });
});
