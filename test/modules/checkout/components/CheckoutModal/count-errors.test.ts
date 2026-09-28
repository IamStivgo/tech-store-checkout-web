import type { FieldErrors } from 'react-hook-form';

import { countErrors } from '../../../../../src/modules/checkout/components/CheckoutModal/count-errors';

describe('countErrors', () => {
  it('counts every field with a message, at any depth', () => {
    const errors = {
      card: { number: { type: 'custom', message: 'x' }, cvc: { type: 'custom', message: 'y' } },
      customer: { email: { type: 'custom', message: 'z' } },
      shipping: undefined,
    } as unknown as FieldErrors;

    expect(countErrors(errors)).toBe(3);
  });

  it('is zero without errors', () => {
    expect(countErrors({})).toBe(0);
  });
});
