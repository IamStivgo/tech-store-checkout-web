import {
  checkoutStarted,
  quantitySelected,
  selectCheckoutStep,
  selectQuantityFor,
} from '../../../../src/modules/checkout/store/checkout.slice';
import { createAppStore } from '../../../../src/store/store';

const PRODUCT_ID = '7d094266-0b4e-4789-9522-96e1cd7ffa60';
const OTHER_PRODUCT_ID = '5d6e7f8a-9b0c-4d1e-8f2a-3b4c5d6e7f8a';

describe('checkout slice', () => {
  it('starts on the product step with one unit of any product', () => {
    const state = createAppStore().getState();

    expect(selectCheckoutStep(state)).toBe('PRODUCT');
    expect(selectQuantityFor(state, PRODUCT_ID)).toBe(1);
  });

  it('remembers the quantity chosen for a product only', () => {
    const store = createAppStore();

    store.dispatch(quantitySelected({ productId: PRODUCT_ID, quantity: 3 }));

    expect(selectQuantityFor(store.getState(), PRODUCT_ID)).toBe(3);
    expect(selectQuantityFor(store.getState(), OTHER_PRODUCT_ID)).toBe(1);
  });

  it('moves to the details step with the product and quantity to pay', () => {
    const store = createAppStore();

    store.dispatch(checkoutStarted({ productId: PRODUCT_ID, quantity: 2 }));

    expect(selectCheckoutStep(store.getState())).toBe('DETAILS');
    expect(selectQuantityFor(store.getState(), PRODUCT_ID)).toBe(2);
  });
});
