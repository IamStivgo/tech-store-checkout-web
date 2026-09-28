import type { CardInput } from '../../../src/services/tokenization/card-tokenizer';
import {
  createCardTokenizer,
  DeferredCardTokenizer,
} from '../../../src/services/tokenization/create-card-tokenizer';
import { FakeCardTokenizer } from '../../../src/services/tokenization/fake-card-tokenizer';

const card = (number: string) => ({
  number,
  cvc: '123',
  expMonth: '12',
  expYear: '29',
  holder: 'ANA MARIA GOMEZ',
});

describe('FakeCardTokenizer', () => {
  it.each([
    ['4242424242424242', 'tok_fake_approved_4242_1', 'VISA'],
    ['4111111111111111', 'tok_fake_declined_1111_1', 'VISA'],
    ['5555555555554444', 'tok_fake_error_4444_1', 'MASTERCARD'],
  ])('tokenizes %s as %s without calling the provider', async (number, id, brand) => {
    expect(await new FakeCardTokenizer().tokenize(card(number))).toEqual({
      ok: true,
      token: { id, brand, lastFour: number.slice(-4) },
    });
  });

  it('issues a new token every time', async () => {
    const tokenizer = new FakeCardTokenizer();
    const first = await tokenizer.tokenize(card('4242424242424242'));
    const second = await tokenizer.tokenize(card('4242424242424242'));

    expect(first.ok && second.ok && first.token.id !== second.token.id).toBe(true);
  });
});

describe('createCardTokenizer', () => {
  it('picks the tokenizer of the configured mode', () => {
    expect(createCardTokenizer({ mode: 'fake' })).toBeInstanceOf(FakeCardTokenizer);
    expect(
      createCardTokenizer({ mode: 'jwe', apiUrl: 'https://provider.test/v1', publicKey: 'pub' }),
    ).toBeInstanceOf(DeferredCardTokenizer);
  });

  const CARD: CardInput = {
    number: '4242424242424242',
    cvc: '123',
    expMonth: '12',
    expYear: '29',
    holder: 'ANA MARIA GOMEZ',
  };

  it('loads the real tokenizer once, on the first card', async () => {
    const load = jest.fn(() => Promise.resolve(new FakeCardTokenizer()));
    const tokenizer = new DeferredCardTokenizer(load);

    expect(load).not.toHaveBeenCalled();
    const first = await tokenizer.tokenize(CARD);
    await tokenizer.tokenize(CARD);

    expect(first.ok).toBe(true);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('reports a failed download as a network error and tries again next time', async () => {
    const load = jest
      .fn<Promise<FakeCardTokenizer>, []>()
      .mockRejectedValueOnce(new TypeError('Failed to fetch dynamically imported module'))
      .mockResolvedValueOnce(new FakeCardTokenizer());
    const tokenizer = new DeferredCardTokenizer(load);

    expect(await tokenizer.tokenize(CARD)).toEqual({ ok: false, error: 'NETWORK' });
    expect((await tokenizer.tokenize(CARD)).ok).toBe(true);
  });

  it('downloads the encryption key from the store API, on the page origin', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('offline'));
    const tokenizer = createCardTokenizer({
      mode: 'jwe',
      apiUrl: 'https://provider.test/v1',
      publicKey: 'pub',
    });

    await tokenizer.tokenize({
      number: '4242424242424242',
      cvc: '123',
      expMonth: '12',
      expYear: '29',
      holder: 'ANA MARIA GOMEZ',
    });

    expect(fetchSpy.mock.calls[0]?.[0]).toBe('http://localhost/api/v1/payments/tokenization-key');
    fetchSpy.mockRestore();
  });
});
