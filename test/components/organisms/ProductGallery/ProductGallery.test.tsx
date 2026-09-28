import { render, screen } from '@testing-library/react';

import { ProductGallery } from '../../../../src/components/organisms/ProductGallery/ProductGallery';

describe('ProductGallery', () => {
  it('shows the main product image with priority', () => {
    render(
      <ProductGallery
        image={{
          src: '/images/products/tec-cbl-usbc-640.jpg',
          alt: 'Cable USB-C trenzado gris enrollado',
          width: 640,
          height: 640,
          sources: [],
        }}
      />,
    );

    const img = screen.getByRole('img', { name: 'Cable USB-C trenzado gris enrollado' });
    expect(img).toHaveAttribute('loading', 'eager');
    expect(img).toHaveAttribute('fetchpriority', 'high');
  });
});
