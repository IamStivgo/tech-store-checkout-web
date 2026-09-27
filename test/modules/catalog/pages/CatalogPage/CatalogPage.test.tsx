import { render, screen } from '@testing-library/react';

import { CatalogPage } from '../../../../../src/modules/catalog/pages/CatalogPage/CatalogPage';

describe('CatalogPage', () => {
  it('shows the catalog title and subtitle', () => {
    render(<CatalogPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Accesorios tecnológicos' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Envío a toda Colombia · Paga con tarjeta de crédito'),
    ).toBeInTheDocument();
  });
});
