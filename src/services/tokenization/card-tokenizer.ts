/** Card data typed by the buyer. It only lives in the form and in this call, never stored. */
export interface CardInput {
  readonly number: string;
  readonly cvc: string;
  /** Two digits, e.g. "08". */
  readonly expMonth: string;
  /** Two digits, e.g. "29". */
  readonly expYear: string;
  readonly holder: string;
}

export interface CardToken {
  readonly id: string;
  readonly brand: string;
  readonly lastFour: string;
}

/** NETWORK: no answer; INVALID_CARD: the provider refused the card (4xx); PROVIDER_UNAVAILABLE: 5xx. */
export type TokenizationErrorCode = 'NETWORK' | 'INVALID_CARD' | 'PROVIDER_UNAVAILABLE';

export type TokenizationResult =
  | { readonly ok: true; readonly token: CardToken }
  | { readonly ok: false; readonly error: TokenizationErrorCode };

/** Turns the card into a provider token in the browser: the card never reaches the API. */
export interface CardTokenizer {
  tokenize(card: CardInput): Promise<TokenizationResult>;
}
