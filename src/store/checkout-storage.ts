import { loadCheckout, saveCheckout } from '../modules/checkout/store/checkout-persistence';
import { restoreCheckout } from '../modules/checkout/store/checkout.slice';

import type { AppStore, RootState } from './store';

/** Saves at most every half second, so typing in the form does not write on every key. */
const SAVE_INTERVAL_MS = 500;

/** State to start the store with: the checkout saved before a reload, if still valid. */
export const loadSavedState = (storage: Storage, now: Date): Partial<RootState> | undefined => {
  const saved = loadCheckout(storage, now);
  return saved ? { checkout: restoreCheckout(saved) } : undefined;
};

/** Keeps the checkout in storage while the buyer goes through it; returns the stop function. */
export const saveCheckoutChanges = (
  store: AppStore,
  storage: Storage,
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
      saveCheckout(storage, saved, now());
    }, SAVE_INTERVAL_MS);
  });

  return () => {
    unsubscribe();
    clearTimeout(pending);
  };
};
