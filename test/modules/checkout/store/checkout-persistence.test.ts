import {
  CHECKOUT_TTL_MS,
  parseCheckout,
  serializeCheckout,
} from '../../../../src/modules/checkout/store/checkout-persistence';

import { aCheckoutState, DETAILS } from './checkout-state.builder';

const NOW = new Date('2026-09-24T20:15:00.000Z');
const later = (ms: number) => new Date(NOW.getTime() + ms);

describe('checkout persistence', () => {
  it('reads back a saved checkout with its draft and details', () => {
    const checkout = aCheckoutState({ step: 'SUMMARY', details: DETAILS });

    expect(parseCheckout(serializeCheckout(checkout, NOW), later(60_000))).toEqual(checkout);
  });

  it('remembers the transaction whose payment was being sent', () => {
    const checkout = aCheckoutState({
      step: 'SUMMARY',
      details: DETAILS,
      paymentTransactionId: '015209fe-0eb8-4534-a4b3-dde8145ac37c',
    });

    expect(
      parseCheckout(serializeCheckout(checkout, NOW), later(1_000))?.paymentTransactionId,
    ).toBe('015209fe-0eb8-4534-a4b3-dde8145ac37c');
  });

  it('reads a checkout saved before payments were tracked', () => {
    const previous: Record<string, unknown> = { ...aCheckoutState() };
    delete previous.paymentTransactionId;
    const saved = JSON.stringify({ version: 1, savedAt: NOW.getTime(), checkout: previous });

    expect(parseCheckout(saved, later(1_000))?.paymentTransactionId).toBeNull();
  });

  it('keeps only the whitelisted fields, never card data', () => {
    const checkout = { ...aCheckoutState(), cardNumber: '4242424242424242', cvc: '123' };

    const saved = serializeCheckout(checkout, NOW);

    expect(saved).not.toMatch(/4242424242424242|cvc|cardNumber/);
    expect(JSON.parse(saved)).toMatchObject({ version: 1, savedAt: NOW.getTime() });
  });

  it('forgets a checkout abandoned for 30 minutes', () => {
    const saved = serializeCheckout(aCheckoutState(), NOW);

    expect(parseCheckout(saved, later(CHECKOUT_TTL_MS))).toBeUndefined();
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
  ])('starts over with %s', (_case, saved) => {
    expect(parseCheckout(saved, NOW)).toBeUndefined();
  });
});
