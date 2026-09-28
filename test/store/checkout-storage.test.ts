import { checkoutStarted, quantitySelected } from '../../src/modules/checkout';
import {
  CHECKOUT_STORAGE_KEY,
  saveCheckout,
} from '../../src/modules/checkout/store/checkout-persistence';
import { loadSavedState, saveCheckoutChanges } from '../../src/store/checkout-storage';
import { createAppStore } from '../../src/store/store';
import {
  aCheckoutState,
  DETAILS,
  PRODUCT_ID,
} from '../modules/checkout/store/checkout-state.builder';

const NOW = new Date('2026-09-24T20:15:00.000Z');
const savedCheckout = () =>
  (
    JSON.parse(localStorage.getItem(CHECKOUT_STORAGE_KEY) ?? 'null') as {
      checkout?: { quantity: number; step: string };
    } | null
  )?.checkout;

describe('checkout storage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts a store without saved state when nothing was saved', () => {
    expect(loadSavedState(localStorage, NOW)).toBeUndefined();
  });

  it('reopens the form asking for the card again when the summary was reached', () => {
    saveCheckout(localStorage, aCheckoutState({ step: 'SUMMARY', details: DETAILS }), NOW);

    expect(loadSavedState(localStorage, NOW)?.checkout).toMatchObject({
      step: 'DETAILS',
      details: DETAILS,
      cardReentryRequired: true,
    });
  });

  it('restores the other steps as they were', () => {
    saveCheckout(localStorage, aCheckoutState({ step: 'DETAILS' }), NOW);

    expect(loadSavedState(localStorage, NOW)?.checkout).toMatchObject({
      step: 'DETAILS',
      cardReentryRequired: false,
    });
  });

  it('saves the latest checkout at most every half second', () => {
    const store = createAppStore();
    const stop = saveCheckoutChanges(store, localStorage, () => NOW);

    store.dispatch(quantitySelected({ productId: PRODUCT_ID, quantity: 2 }));
    store.dispatch(quantitySelected({ productId: PRODUCT_ID, quantity: 3 }));
    expect(savedCheckout()).toBeUndefined();

    jest.advanceTimersByTime(500);
    expect(savedCheckout()).toMatchObject({ quantity: 3, step: 'PRODUCT' });

    store.dispatch(checkoutStarted({ productId: PRODUCT_ID, quantity: 3 }));
    jest.advanceTimersByTime(500);
    expect(savedCheckout()).toMatchObject({ step: 'DETAILS' });
    stop();
  });

  it('ignores actions that do not change the checkout and stops when asked', () => {
    const store = createAppStore();
    const stop = saveCheckoutChanges(store, localStorage);

    store.dispatch({ type: 'unrelated/action' });
    jest.advanceTimersByTime(500);
    expect(savedCheckout()).toBeUndefined();

    store.dispatch(quantitySelected({ productId: PRODUCT_ID, quantity: 2 }));
    jest.advanceTimersByTime(500);
    store.dispatch(quantitySelected({ productId: PRODUCT_ID, quantity: 4 }));
    stop();
    jest.advanceTimersByTime(500);
    expect(savedCheckout()).toMatchObject({ quantity: 2 });
  });
});
