import { z } from 'zod';

import type {
  CardInput,
  CardTokenizer,
  TokenizationErrorCode,
  TokenizationResult,
} from './card-tokenizer';

export interface JweTokenizerConfig {
  readonly apiUrl: string;
  readonly publicKey: string;
}

type Fetch = (input: string, init?: RequestInit) => Promise<Response>;

const KEY_ALGORITHM = 'RSA-OAEP-256';
const CONTENT_ENCRYPTION = 'A256GCM';
const HTTP_SERVER_ERROR = 500;

const keyResponseSchema = z.object({ data: z.object({ publicKey: z.string().min(1) }) });
const tokenResponseSchema = z.object({
  data: z.object({ id: z.string().min(1), brand: z.string(), last_four: z.string() }),
});

/** A failed step with the error the buyer will see. */
class TokenizationFailure extends Error {
  constructor(readonly code: TokenizationErrorCode) {
    super(code);
  }
}

const failureFor = (status: number): TokenizationFailure =>
  new TokenizationFailure(status >= HTTP_SERVER_ERROR ? 'PROVIDER_UNAVAILABLE' : 'INVALID_CARD');

/**
 * Encrypts the card for the provider (JWE, RSA-OAEP-256 + A256GCM) and exchanges it for a
 * token. The provider's RSA key is cached for the page's life; `jose` is loaded on first use.
 */
export class JweCardTokenizer implements CardTokenizer {
  private encryptionKey: Promise<CryptoKey> | undefined;

  constructor(
    private readonly config: JweTokenizerConfig,
    private readonly fetchFn: Fetch = (input, init) => fetch(input, init),
  ) {}

  async tokenize(card: CardInput): Promise<TokenizationResult> {
    try {
      const payload = await this.encrypt(card);
      const response = await this.call('/tokens/cards', {
        method: 'POST',
        body: JSON.stringify({ payload }),
      });
      const parsed = tokenResponseSchema.safeParse(await response.json());
      if (!parsed.success) {
        return { ok: false, error: 'PROVIDER_UNAVAILABLE' };
      }
      const { id, brand, last_four: lastFour } = parsed.data.data;
      return { ok: true, token: { id, brand, lastFour } };
    } catch (error) {
      return { ok: false, error: error instanceof TokenizationFailure ? error.code : 'NETWORK' };
    }
  }

  private async encrypt(card: CardInput): Promise<string> {
    const [{ CompactEncrypt }, key] = await Promise.all([import('jose'), this.key()]);
    const plaintext = JSON.stringify({
      number: card.number,
      cvc: card.cvc,
      exp_month: card.expMonth,
      exp_year: card.expYear,
      card_holder: card.holder,
    });
    return new CompactEncrypt(new TextEncoder().encode(plaintext))
      .setProtectedHeader({ alg: KEY_ALGORITHM, enc: CONTENT_ENCRYPTION })
      .encrypt(key);
  }

  private key(): Promise<CryptoKey> {
    // A failed download is not cached, so the next attempt asks again.
    this.encryptionKey ??= this.downloadKey().catch((error: unknown) => {
      this.encryptionKey = undefined;
      throw error;
    });
    return this.encryptionKey;
  }

  private async downloadKey(): Promise<CryptoKey> {
    const response = await this.call('/tokens/keys/tokenization', { method: 'GET' });
    const parsed = keyResponseSchema.safeParse(await response.json());
    if (!parsed.success) {
      throw new TokenizationFailure('PROVIDER_UNAVAILABLE');
    }
    const { importSPKI } = await import('jose');
    return importSPKI(parsed.data.data.publicKey, KEY_ALGORITHM);
  }

  private async call(
    path: string,
    { method, body }: { readonly method: 'GET' | 'POST'; readonly body?: string },
  ): Promise<Response> {
    const response = await this.fetchFn(`${this.config.apiUrl}${path}`, {
      method,
      body,
      headers: {
        Authorization: `Bearer ${this.config.publicKey}`,
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
    });
    if (!response.ok) {
      throw failureFor(response.status);
    }
    return response;
  }
}
