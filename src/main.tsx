import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';

import { App, appRoutes } from './App';
import { tokenizationConfig } from './config/env';
import { createCheckoutStorage } from './services/storage/encrypted-storage';
import { createCardTokenizer } from './services/tokenization/create-card-tokenizer';
import { loadSavedState, saveCheckoutChanges } from './store/checkout-storage';
import { createAppStore } from './store/store';
import './styles/global.scss';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element #root was not found');
}

const storage = createCheckoutStorage();
const tokenizer = createCardTokenizer(tokenizationConfig);

// The saved checkout is decrypted before the first render (the static header is already painted).
void loadSavedState(storage, new Date()).then((saved) => {
  const store = createAppStore(saved);
  saveCheckoutChanges(store, storage);

  createRoot(container).render(
    <StrictMode>
      <App store={store} router={createBrowserRouter(appRoutes)} tokenizer={tokenizer} />
    </StrictMode>,
  );
});
