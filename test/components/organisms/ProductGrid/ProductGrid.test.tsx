import { render, screen } from '@testing-library/react';

import { ProductGrid } from '../../../../src/components/organisms/ProductGrid/ProductGrid';

describe('ProductGrid', () => {
  it('lists its products under an accessible name', () => {
    render(
      <ProductGrid label="Accesorios tecnológicos">
        <li>Cable USB-C</li>
        <li>Power bank</li>
      </ProductGrid>,
    );

    const list = screen.getByRole('list', { name: 'Accesorios tecnológicos' });
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(list).not.toHaveAttribute('aria-busy');
  });

  it('is marked busy while it shows placeholders', () => {
    render(
      <ProductGrid busy>
        <li />
      </ProductGrid>,
    );

    expect(screen.getByRole('list')).toHaveAttribute('aria-busy', 'true');
  });
});
