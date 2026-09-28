import { API_BASE_URL } from '../../config/constants';
import type { TokenizationConfig } from '../../config/tokenization-config';

import type { CardInput, CardTokenizer, TokenizationResult } from './card-tokenizer';
import { FakeCardTokenizer } from './fake-card-tokenizer';

const TOKENIZATION_KEY_PATH = '/payments/tokenization-key';

/**
 * Loads the real tokenizer (and its encryption and validation libraries) the first time a card
 * is tokenized, so the catalog does not download them.
 */
export class DeferredCardTokenizer implements CardTokenizer {
  private tokenizer: Promise<CardTokenizer> | undefined;

  constructor(private readonly load: () => Promise<CardTokenizer>) {}

  async tokenize(card: CardInput): Promise<TokenizationResult> {
    // A failed download is not kept, so the next attempt tries again.
    this.tokenizer ??= this.load().catch((error: unknown) => {
      this.tokenizer = undefined;
      throw error;
    });
    try {
      return await (await this.tokenizer).tokenize(card);
    } catch {
      return { ok: false, error: 'NETWORK' };
    }
  }
}

export const createCardTokenizer = (config: TokenizationConfig): CardTokenizer =>
  config.mode === 'jwe'
    ? new DeferredCardTokenizer(() =>
        import('./jwe-card-tokenizer').then(
          ({ JweCardTokenizer }) =>
            new JweCardTokenizer({
              ...config,
              keyUrl: `${globalThis.location.origin}${API_BASE_URL}${TOKENIZATION_KEY_PATH}`,
            }),
        ),
      )
    : new FakeCardTokenizer();
