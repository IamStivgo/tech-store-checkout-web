import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';

import { App, appRoutes } from './App';
import { loadSavedState, saveCheckoutChanges } from './store/checkout-storage';
import { createAppStore } from './store/store';
import './styles/global.scss';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element #root was not found');
}

const store = createAppStore(loadSavedState(localStorage, new Date()));
saveCheckoutChanges(store, localStorage);

createRoot(container).render(
  <StrictMode>
    <App store={store} router={createBrowserRouter(appRoutes)} />
  </StrictMode>,
);
