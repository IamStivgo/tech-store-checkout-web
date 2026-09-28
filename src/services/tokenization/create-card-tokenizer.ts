import { API_BASE_URL } from '../../config/constants';
import type { TokenizationConfig } from '../../config/tokenization-config';

import type { CardTokenizer } from './card-tokenizer';
import { FakeCardTokenizer } from './fake-card-tokenizer';
import { JweCardTokenizer } from './jwe-card-tokenizer';

const TOKENIZATION_KEY_PATH = '/payments/tokenization-key';

export const createCardTokenizer = (config: TokenizationConfig): CardTokenizer =>
  config.mode === 'jwe'
    ? new JweCardTokenizer({
        ...config,
        keyUrl: `${globalThis.location.origin}${API_BASE_URL}${TOKENIZATION_KEY_PATH}`,
      })
    : new FakeCardTokenizer();
