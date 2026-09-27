import { createCheckoutFormSchema } from '../../../../src/modules/checkout/schemas/checkout-form.schema';

import { aCheckoutForm } from './test-form-data';

describe('checkout form schema', () => {
  const schema = createCheckoutFormSchema(() => new Date(2026, 8, 24));

  it('validates the card, customer and shipping sections together', () => {
    const form = aCheckoutForm();

    const result = schema.safeParse({
      ...form,
      card: { ...form.card, cvc: '' },
      customer: { ...form.customer, email: 'ana' },
    });

    expect(result.error?.issues.map(({ path }) => path.join('.'))).toEqual([
      'card.cvc',
      'customer.email',
    ]);
  });

  it('accepts the mockup data', () => {
    expect(schema.safeParse(aCheckoutForm()).success).toBe(true);
  });
});
