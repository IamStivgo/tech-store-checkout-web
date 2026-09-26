import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';

import { App, appRoutes } from './App';
import { createAppStore } from './store/store';
import './styles/global.scss';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element #root was not found');
}

createRoot(container).render(
  <StrictMode>
    <App store={createAppStore()} router={createBrowserRouter(appRoutes)} />
  </StrictMode>,
);
