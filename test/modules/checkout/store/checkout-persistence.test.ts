import {
  CHECKOUT_STORAGE_KEY,
  CHECKOUT_TTL_MS,
  loadCheckout,
  saveCheckout,
} from '../../../../src/modules/checkout/store/checkout-persistence';

import { aCheckoutState, DETAILS } from './checkout-state.builder';

const NOW = new Date('2026-09-24T20:15:00.000Z');
const later = (ms: number) => new Date(NOW.getTime() + ms);

describe('checkout persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('restores a saved checkout with its draft and details', () => {
    const checkout = aCheckoutState({ step: 'SUMMARY', details: DETAILS });

    saveCheckout(localStorage, checkout, NOW);

    expect(loadCheckout(localStorage, later(60_000))).toEqual(checkout);
  });

  it('remembers the transaction whose payment was being sent', () => {
    const checkout = aCheckoutState({
      step: 'SUMMARY',
      details: DETAILS,
      paymentTransactionId: '015209fe-0eb8-4534-a4b3-dde8145ac37c',
    });

    saveCheckout(localStorage, checkout, NOW);

    expect(loadCheckout(localStorage, later(1_000))?.paymentTransactionId).toBe(
      '015209fe-0eb8-4534-a4b3-dde8145ac37c',
    );
  });

  it('reads a checkout saved before payments were tracked', () => {
    const previous: Record<string, unknown> = { ...aCheckoutState() };
    delete previous.paymentTransactionId;
    localStorage.setItem(
      CHECKOUT_STORAGE_KEY,
      JSON.stringify({ version: 1, savedAt: NOW.getTime(), checkout: previous }),
    );

    expect(loadCheckout(localStorage, later(1_000))?.paymentTransactionId).toBeNull();
  });

  it('stores only the whitelisted fields, never card data', () => {
    const checkout = { ...aCheckoutState(), cardNumber: '4242424242424242', cvc: '123' };

    saveCheckout(localStorage, checkout, NOW);

    const stored = localStorage.getItem(CHECKOUT_STORAGE_KEY) ?? '';
    expect(stored).not.toMatch(/4242424242424242|cvc|cardNumber/);
    expect(JSON.parse(stored)).toMatchObject({ version: 1, savedAt: NOW.getTime() });
  });

  it('forgets a checkout abandoned for 30 minutes', () => {
    saveCheckout(localStorage, aCheckoutState(), NOW);

    expect(loadCheckout(localStorage, later(CHECKOUT_TTL_MS))).toBeUndefined();
    expect(localStorage.getItem(CHECKOUT_STORAGE_KEY)).toBeNull();
  });

  it.each([
    ['nothing saved', null],
    ['corrupt JSON', '{"version":'],
    ['another version', JSON.stringify({ version: 2, savedAt: NOW.getTime(), checkout: {} })],
    [
      'data that breaks the rules',
      JSON.stringify({
        version: 1,
        savedAt: NOW.getTime(),
        checkout: { ...aCheckoutState(), quantity: 0 },
      }),
    ],
  ])('starts over with %s', (_case, stored) => {
    if (stored !== null) {
      localStorage.setItem(CHECKOUT_STORAGE_KEY, stored);
    }

    expect(loadCheckout(localStorage, NOW)).toBeUndefined();
  });

  it('keeps working when the storage is blocked', () => {
    const blocked = {
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    } as unknown as Storage;

    expect(() => {
      saveCheckout(blocked, aCheckoutState(), NOW);
    }).not.toThrow();
    expect(loadCheckout(blocked, NOW)).toBeUndefined();
  });
});
