import { detectBrand } from '../../utils/card';

import type { CardInput, CardTokenizer, TokenizationResult } from './card-tokenizer';

const OUTCOMES: readonly (readonly [prefix: string, outcome: string])[] = [
  ['4242', 'approved'],
  ['4111', 'declined'],
];

/**
 * Local and Docker only: never calls the provider. The token tells the API's fake gateway the
 * result: 4242… → approved, 4111… → declined, any other card → error (ADR-011).
 */
export class FakeCardTokenizer implements CardTokenizer {
  private issued = 0;

  tokenize(card: CardInput): Promise<TokenizationResult> {
    this.issued += 1;
    const outcome = OUTCOMES.find(([prefix]) => card.number.startsWith(prefix))?.[1] ?? 'error';
    const lastFour = card.number.slice(-4);
    return Promise.resolve({
      ok: true,
      token: {
        id: `tok_fake_${outcome}_${lastFour}_${this.issued}`,
        brand: detectBrand(card.number),
        lastFour,
      },
    });
  }
}
