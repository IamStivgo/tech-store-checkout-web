import { readTokenizationConfig } from '../../src/config/tokenization-config';

describe('readTokenizationConfig', () => {
  it('uses the fake tokenizer when nothing is configured', () => {
    expect(readTokenizationConfig({})).toEqual({ mode: 'fake' });
  });

  it('reads the provider URL and public key in jwe mode', () => {
    expect(
      readTokenizationConfig({
        VITE_TOKENIZATION_MODE: 'jwe',
        VITE_PAYMENT_API_URL: 'https://provider.test/v1/',
        VITE_PAYMENT_PUBLIC_KEY: 'pub_test_key',
      }),
    ).toEqual({ mode: 'jwe', apiUrl: 'https://provider.test/v1', publicKey: 'pub_test_key' });
  });

  it('fails fast when jwe mode misses its settings', () => {
    expect(() => readTokenizationConfig({ VITE_TOKENIZATION_MODE: 'jwe' })).toThrow(
      'VITE_PAYMENT_API_URL and VITE_PAYMENT_PUBLIC_KEY are required in jwe mode',
    );
  });

  it('rejects an unknown mode', () => {
    expect(() => readTokenizationConfig({ VITE_TOKENIZATION_MODE: 'plain' })).toThrow(
      'Unknown VITE_TOKENIZATION_MODE: plain',
    );
  });
});
