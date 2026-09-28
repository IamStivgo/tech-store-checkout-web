import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';

import { App, appRoutes } from './App';
import { tokenizationConfig } from './config/env';
import { createCardTokenizer } from './services/tokenization/create-card-tokenizer';
import { loadSavedState, saveCheckoutChanges } from './store/checkout-storage';
import { createAppStore } from './store/store';
import './styles/global.scss';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element #root was not found');
}

const store = createAppStore(loadSavedState(localStorage, new Date()));
saveCheckoutChanges(store, localStorage);
const tokenizer = createCardTokenizer(tokenizationConfig);

createRoot(container).render(
  <StrictMode>
    <App store={store} router={createBrowserRouter(appRoutes)} tokenizer={tokenizer} />
  </StrictMode>,
);
