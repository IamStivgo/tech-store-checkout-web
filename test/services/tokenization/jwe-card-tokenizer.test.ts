/**
 * WebCrypto (used by jose) needs the Node environment: jsdom has no SubtleCrypto.
 * @jest-environment node
 */
import { compactDecrypt, exportSPKI, generateKeyPair } from 'jose';

import type { CardInput } from '../../../src/services/tokenization/card-tokenizer';
import { JweCardTokenizer } from '../../../src/services/tokenization/jwe-card-tokenizer';

const API_URL = 'https://provider.test/v1';
const KEY_URL = 'https://store.test/api/v1/payments/tokenization-key';
const CONFIG = { apiUrl: API_URL, publicKey: 'pub_test_key', keyUrl: KEY_URL };
const CARD: CardInput = {
  number: '4242424242424242',
  cvc: '123',
  expMonth: '12',
  expYear: '29',
  holder: 'ANA MARIA GOMEZ',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const TOKEN = { data: { id: 'tok_test_4242', brand: 'VISA', last_four: '4242' } };

describe('JweCardTokenizer', () => {
  let privateKey: CryptoKey;
  let keyResponse: unknown;

  beforeAll(async () => {
    const pair = await generateKeyPair('RSA-OAEP-256');
    privateKey = pair.privateKey;
    // The provider sends the PEM on a single line, with spaces instead of line breaks.
    keyResponse = { publicKey: (await exportSPKI(pair.publicKey)).replace(/\n/g, ' ') };
  });

  const setup = () => {
    const fetchMock = jest.fn<Promise<Response>, [string, RequestInit?]>();
    return {
      fetchMock,
      tokenizer: new JweCardTokenizer(CONFIG, fetchMock),
    };
  };

  it('encrypts the card for the provider and returns its token', async () => {
    const { fetchMock, tokenizer } = setup();
    fetchMock.mockResolvedValueOnce(json(keyResponse)).mockResolvedValueOnce(json(TOKEN, 201));

    const result = await tokenizer.tokenize(CARD);

    expect(result).toEqual({
      ok: true,
      token: { id: 'tok_test_4242', brand: 'VISA', lastFour: '4242' },
    });
    const [keyUrl, keyInit] = fetchMock.mock.calls[0] ?? [];
    const [tokenUrl, tokenInit] = fetchMock.mock.calls[1] ?? [];
    // The key comes from the store API, without the provider's credentials.
    expect(keyUrl).toBe(KEY_URL);
    expect(keyInit?.headers).toBeUndefined();
    expect(tokenUrl).toBe(`${API_URL}/tokens/cards`);
    expect(tokenInit?.method).toBe('POST');

    const { payload } = JSON.parse(tokenInit?.body as string) as { payload: string };
    const { plaintext, protectedHeader } = await compactDecrypt(payload, privateKey);
    expect(protectedHeader).toEqual({ alg: 'RSA-OAEP-256', enc: 'A256GCM' });
    expect(JSON.parse(new TextDecoder().decode(plaintext))).toEqual({
      number: '4242424242424242',
      cvc: '123',
      exp_month: '12',
      exp_year: '29',
      card_holder: 'ANA MARIA GOMEZ',
    });
    expect(tokenInit?.body).not.toContain('4242424242424242');
  });

  it('downloads the provider key once', async () => {
    const { fetchMock, tokenizer } = setup();
    fetchMock
      .mockResolvedValueOnce(json(keyResponse))
      .mockResolvedValueOnce(json(TOKEN, 201))
      .mockResolvedValueOnce(json(TOKEN, 201));

    await tokenizer.tokenize(CARD);
    await tokenizer.tokenize(CARD);

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      KEY_URL,
      `${API_URL}/tokens/cards`,
      `${API_URL}/tokens/cards`,
    ]);
  });

  it.each([
    [
      'a rejected card',
      () => json({ error: { type: 'INPUT_VALIDATION_ERROR' } }, 422),
      'INVALID_CARD',
    ],
    ['a provider failure', () => json({}, 503), 'PROVIDER_UNAVAILABLE'],
    ['an unexpected token body', () => json({ data: {} }, 201), 'PROVIDER_UNAVAILABLE'],
  ])('reports %s', async (_case, tokenResponse, error) => {
    const { fetchMock, tokenizer } = setup();
    fetchMock.mockResolvedValueOnce(json(keyResponse)).mockResolvedValueOnce(tokenResponse());

    expect(await tokenizer.tokenize(CARD)).toEqual({ ok: false, error });
  });

  it('reports a lost connection as a network error', async () => {
    const { fetchMock, tokenizer } = setup();
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    expect(await tokenizer.tokenize(CARD)).toEqual({ ok: false, error: 'NETWORK' });
  });

  it('asks for the key again after a failed download', async () => {
    const { fetchMock, tokenizer } = setup();
    fetchMock
      .mockResolvedValueOnce(json({}, 500))
      .mockResolvedValueOnce(json({}))
      .mockResolvedValueOnce(json(keyResponse))
      .mockResolvedValueOnce(json(TOKEN, 201));

    expect(await tokenizer.tokenize(CARD)).toEqual({ ok: false, error: 'PROVIDER_UNAVAILABLE' });
    expect(await tokenizer.tokenize(CARD)).toEqual({ ok: false, error: 'PROVIDER_UNAVAILABLE' });
    expect((await tokenizer.tokenize(CARD)).ok).toBe(true);
  });

  it('uses the global fetch by default', async () => {
    const fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(json(keyResponse))
      .mockResolvedValueOnce(json(TOKEN, 201));

    const result = await new JweCardTokenizer(CONFIG).tokenize(CARD);

    expect(result.ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    fetchSpy.mockRestore();
  });
});
