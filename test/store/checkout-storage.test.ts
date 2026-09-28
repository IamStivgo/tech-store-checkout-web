import { checkoutStarted, quantitySelected } from '../../src/modules/checkout';
import {
  CHECKOUT_STORAGE_KEY,
  serializeCheckout,
} from '../../src/modules/checkout/store/checkout-persistence';
import type { AsyncStorage } from '../../src/services/storage/encrypted-storage';
import { loadSavedState, saveCheckoutChanges } from '../../src/store/checkout-storage';
import { createAppStore } from '../../src/store/store';
import {
  aCheckoutState,
  DETAILS,
  PRODUCT_ID,
} from '../modules/checkout/store/checkout-state.builder';

const NOW = new Date('2026-09-24T20:15:00.000Z');

/** What the encrypted storage would keep, in memory (its encryption is tested on its own). */
const memoryStorage = () => {
  const values = new Map<string, string>();
  const storage: AsyncStorage = {
    getItem: (name) => Promise.resolve(values.get(name) ?? null),
    setItem: (name, value) => {
      values.set(name, value);
      return Promise.resolve();
    },
    removeItem: (name) => {
      values.delete(name);
      return Promise.resolve();
    },
  };
  return { storage, values };
};

let storage: AsyncStorage;
let values: Map<string, string>;
const savedCheckout = () =>
  (
    JSON.parse(values.get(CHECKOUT_STORAGE_KEY) ?? 'null') as {
      checkout?: { quantity: number; step: string };
    } | null
  )?.checkout;

describe('checkout storage', () => {
  beforeEach(() => {
    ({ storage, values } = memoryStorage());
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts a store without saved state when nothing was saved', async () => {
    expect(await loadSavedState(storage, NOW)).toBeUndefined();
  });

  it('forgets a saved checkout that is no longer valid', async () => {
    values.set(CHECKOUT_STORAGE_KEY, serializeCheckout(aCheckoutState(), new Date(0)));

    expect(await loadSavedState(storage, NOW)).toBeUndefined();
    expect(values.has(CHECKOUT_STORAGE_KEY)).toBe(false);
  });

  it('reopens the form asking for the card again when the summary was reached', async () => {
    values.set(
      CHECKOUT_STORAGE_KEY,
      serializeCheckout(aCheckoutState({ step: 'SUMMARY', details: DETAILS }), NOW),
    );

    expect((await loadSavedState(storage, NOW))?.checkout).toMatchObject({
      step: 'DETAILS',
      details: DETAILS,
      cardReentryRequired: true,
      paymentTransactionId: null,
    });
  });

  it('restores the other steps as they were', async () => {
    values.set(CHECKOUT_STORAGE_KEY, serializeCheckout(aCheckoutState({ step: 'DETAILS' }), NOW));

    expect((await loadSavedState(storage, NOW))?.checkout).toMatchObject({
      step: 'DETAILS',
      cardReentryRequired: false,
      paymentTransactionId: null,
    });
  });

  it('saves the latest checkout at most every half second', () => {
    const store = createAppStore();
    const stop = saveCheckoutChanges(store, storage, () => NOW);

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
    const stop = saveCheckoutChanges(store, storage);

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
