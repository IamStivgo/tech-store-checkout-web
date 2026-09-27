import { render, screen } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';

import { App, appRoutes } from '../src/App';
import { createAppStore } from '../src/store/store';

const renderAppAt = (path: string) =>
  render(
    <App
      store={createAppStore()}
      router={createMemoryRouter(appRoutes, { initialEntries: [path] })}
    />,
  );

describe('App', () => {
  it('shows the catalog inside the main layout at the home route', async () => {
    renderAppAt('/');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Accesorios tecnológicos' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('banner')).toHaveTextContent('Tech Store');
    expect(screen.getByRole('contentinfo')).toHaveTextContent('© 2026 Tech Store');
  });

  it('shows the not found page for unknown routes', async () => {
    renderAppAt('/does-not-exist');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Página no encontrada' }),
    ).toBeInTheDocument();
  });
});
