import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import {
  ProductCard,
  type ProductCardProps,
} from '../../../../src/components/organisms/ProductCard/ProductCard';
import { ProductCardSkeleton } from '../../../../src/components/organisms/ProductCard/ProductCardSkeleton';

const props: ProductCardProps = {
  href: '/products/7d094266-0b4e-4789-9522-96e1cd7ffa60',
  name: 'Cable USB-C a USB-C 2 m (100 W)',
  priceInCents: 3_990_000,
  image: {
    src: '/images/products/tec-cbl-usbc-640.jpg',
    alt: 'Cable USB-C trenzado gris enrollado',
    width: 640,
    height: 640,
    sources: [
      { type: 'image/avif', srcSet: '/images/products/tec-cbl-usbc-320.avif 320w' },
      { type: 'image/webp', srcSet: '/images/products/tec-cbl-usbc-320.webp 320w' },
    ],
  },
  stockStatus: 'IN_STOCK',
  stockLabel: '30 disponibles',
};

const renderCard = (overrides: Partial<ProductCardProps> = {}) =>
  render(
    <MemoryRouter>
      <ProductCard {...props} {...overrides} />
    </MemoryRouter>,
  );

describe('ProductCard', () => {
  it('is a single link to the product with its name, price and stock', () => {
    renderCard();

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', props.href);
    expect(link).toHaveTextContent('Cable USB-C a USB-C 2 m (100 W)');
    expect(link).toHaveTextContent('$ 39.900');
    expect(link).toHaveTextContent('30 disponibles');
    expect(
      screen.getByRole('heading', { level: 2, name: 'Cable USB-C a USB-C 2 m (100 W)' }),
    ).toBeInTheDocument();
  });

  it('shows a lazy image with its size and modern formats first', () => {
    const { container } = renderCard();

    const image = screen.getByRole('img', { name: 'Cable USB-C trenzado gris enrollado' });
    expect(image).toHaveAttribute('src', props.image.src);
    expect(image).toHaveAttribute('width', '640');
    expect(image).toHaveAttribute('height', '640');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(
      Array.from(container.querySelectorAll('source'), (source) => source.getAttribute('type')),
    ).toEqual(['image/avif', 'image/webp']);
  });

  it('marks sold-out products but still links to their detail', () => {
    renderCard({ stockStatus: 'OUT_OF_STOCK', stockLabel: 'Agotado' });

    const link = screen.getByRole('link');
    expect(link).toHaveClass('soldOut');
    expect(link).toHaveAttribute('href', props.href);
    expect(screen.getByText('Agotado')).toHaveClass('danger');
  });

  it('does not mark products in stock as sold out', () => {
    renderCard();

    expect(screen.getByRole('link')).not.toHaveClass('soldOut');
  });
});

describe('ProductCardSkeleton', () => {
  it('is a decorative placeholder without text or links', () => {
    render(<ProductCardSkeleton />);

    const skeleton = screen.getByTestId('product-card-skeleton');
    expect(skeleton).toHaveTextContent('');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
