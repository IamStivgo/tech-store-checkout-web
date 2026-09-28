import { render, screen } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';

import { App, appRoutes } from '../src/App';
import { createAppStore } from '../src/store/store';

import { aProductSummary } from './builders/product.builder';
import { stubFetch } from './services/api/fetch-stub';

const renderAppAt = (path: string) =>
  render(
    <App
      store={createAppStore()}
      router={createMemoryRouter(appRoutes, { initialEntries: [path] })}
    />,
  );

describe('App', () => {
  let fetchStub: ReturnType<typeof stubFetch>;

  beforeEach(() => {
    fetchStub = stubFetch();
  });

  afterEach(() => {
    fetchStub.restore();
  });

  it('shows the catalog inside the main layout at the home route', async () => {
    fetchStub.respondJson({ data: [aProductSummary()], meta: { count: 1 } });
    renderAppAt('/');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Accesorios tecnológicos' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('banner')).toHaveTextContent('Tech Store');
    expect(screen.getByRole('contentinfo')).toHaveTextContent('© 2026 Tech Store');
    expect(await screen.findByRole('link', { name: /Cable USB-C/ })).toBeInTheDocument();
  });

  it('shows the not found page for unknown routes', async () => {
    renderAppAt('/does-not-exist');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Página no encontrada' }),
    ).toBeInTheDocument();
  });
});
