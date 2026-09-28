import {
  CHECKOUT_STORAGE_KEY,
  parseCheckout,
  serializeCheckout,
} from '../modules/checkout/store/checkout-persistence';
import { restoreCheckout } from '../modules/checkout/store/checkout.slice';
import type { AsyncStorage } from '../services/storage/encrypted-storage';

import type { AppStore, RootState } from './store';

/** Saves at most every half second, so typing in the form does not write on every key. */
const SAVE_INTERVAL_MS = 500;

/** State to start the store with: the checkout saved before a reload, if still valid. */
export const loadSavedState = async (
  storage: AsyncStorage,
  now: Date,
): Promise<Partial<RootState> | undefined> => {
  const stored = await storage.getItem(CHECKOUT_STORAGE_KEY);
  const saved = parseCheckout(stored, now);
  if (!saved && stored !== null) {
    // Expired or no longer valid: forget it.
    await storage.removeItem(CHECKOUT_STORAGE_KEY);
  }
  return saved ? { checkout: restoreCheckout(saved) } : undefined;
};

/** Keeps the checkout in storage while the buyer goes through it; returns the stop function. */
export const saveCheckoutChanges = (
  store: AppStore,
  storage: AsyncStorage,
  now: () => Date = () => new Date(),
): (() => void) => {
  let saved = store.getState().checkout;
  let pending: ReturnType<typeof setTimeout> | undefined;

  const unsubscribe = store.subscribe(() => {
    if (pending || store.getState().checkout === saved) {
      return;
    }
    pending = setTimeout(() => {
      pending = undefined;
      saved = store.getState().checkout;
      void storage.setItem(CHECKOUT_STORAGE_KEY, serializeCheckout(saved, now()));
    }, SAVE_INTERVAL_MS);
  });

  return () => {
    unsubscribe();
    clearTimeout(pending);
  };
};
