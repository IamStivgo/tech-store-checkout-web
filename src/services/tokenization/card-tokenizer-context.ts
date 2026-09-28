import { createContext, useContext } from 'react';

import type { CardTokenizer } from './card-tokenizer';
import { FakeCardTokenizer } from './fake-card-tokenizer';

/** The tokenizer the app was built with (main.tsx); the fake one unless configured otherwise. */
export const CardTokenizerContext = createContext<CardTokenizer>(new FakeCardTokenizer());

export const useCardTokenizer = (): CardTokenizer => useContext(CardTokenizerContext);
