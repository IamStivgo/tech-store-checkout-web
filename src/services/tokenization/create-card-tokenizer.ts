import type { TokenizationConfig } from '../../config/tokenization-config';

import type { CardTokenizer } from './card-tokenizer';
import { FakeCardTokenizer } from './fake-card-tokenizer';
import { JweCardTokenizer } from './jwe-card-tokenizer';

export const createCardTokenizer = (config: TokenizationConfig): CardTokenizer =>
  config.mode === 'jwe' ? new JweCardTokenizer(config) : new FakeCardTokenizer();
