export type TokenizationConfig =
  | { readonly mode: 'fake' }
  | { readonly mode: 'jwe'; readonly apiUrl: string; readonly publicKey: string };

type Env = Readonly<Record<string, string | undefined>>;

/**
 * How the browser tokenizes the card. `jwe` encrypts it for the payment provider (production);
 * `fake` never calls the provider and only works with the API's fake gateway (local, Docker).
 */
export const readTokenizationConfig = (env: Env): TokenizationConfig => {
  const mode = env.VITE_TOKENIZATION_MODE ?? 'fake';
  if (mode === 'fake') {
    return { mode: 'fake' };
  }
  if (mode !== 'jwe') {
    throw new Error(`Unknown VITE_TOKENIZATION_MODE: ${mode}`);
  }
  const apiUrl = env.VITE_PAYMENT_API_URL;
  const publicKey = env.VITE_PAYMENT_PUBLIC_KEY;
  if (!apiUrl || !publicKey) {
    throw new Error('VITE_PAYMENT_API_URL and VITE_PAYMENT_PUBLIC_KEY are required in jwe mode');
  }
  return { mode: 'jwe', apiUrl: apiUrl.replace(/\/$/, ''), publicKey };
};
