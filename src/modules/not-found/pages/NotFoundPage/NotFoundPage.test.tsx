import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import { NotFoundPage } from './NotFoundPage';

describe('NotFoundPage', () => {
  it('explains the page does not exist and links back to the store', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Página no encontrada' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir a la tienda' })).toHaveAttribute('href', '/');
  });
});
