import { baseApi } from '../../src/services/api/base-api';
import { createAppStore } from '../../src/store/store';

describe('createAppStore', () => {
  it('registers the RTK Query API state', () => {
    const store = createAppStore();

    expect(store.getState()).toHaveProperty(baseApi.reducerPath);
  });

  it('registers the checkout state', () => {
    expect(createAppStore().getState().checkout).toEqual({
      productId: null,
      quantity: 1,
      step: 'PRODUCT',
      details: null,
      draft: null,
      cardReentryRequired: false,
      paymentTransactionId: null,
    });
  });
});
