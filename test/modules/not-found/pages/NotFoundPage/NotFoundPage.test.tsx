import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import { NotFoundPage } from '../../../../../src/modules/not-found/pages/NotFoundPage/NotFoundPage';

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

  it('explains that a product does not exist', () => {
    render(
      <MemoryRouter>
        <NotFoundPage variant="product" />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Producto no encontrado' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Es posible que el enlace esté incompleto o que el producto ya no esté disponible.',
      ),
    ).toBeInTheDocument();
  });
});
