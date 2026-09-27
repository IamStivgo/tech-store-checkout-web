import { render, screen } from '@testing-library/react';

import {
  ResponsiveImage,
  type ResponsiveImageData,
} from '../../../../src/components/atoms/ResponsiveImage/ResponsiveImage';

const image: ResponsiveImageData = {
  src: '/images/products/tec-cbl-usbc-640.jpg',
  alt: 'Cable USB-C trenzado gris enrollado',
  width: 640,
  height: 640,
  sources: [
    { type: 'image/avif', srcSet: '/images/products/tec-cbl-usbc-320.avif 320w' },
    { type: 'image/webp', srcSet: '/images/products/tec-cbl-usbc-320.webp 320w' },
  ],
};

describe('ResponsiveImage', () => {
  it('offers modern formats first with the JPEG as fallback', () => {
    const { container } = render(<ResponsiveImage image={image} sizes="100vw" />);

    const sources = Array.from(container.querySelectorAll('source'));
    expect(sources.map((source) => source.getAttribute('type'))).toEqual([
      'image/avif',
      'image/webp',
    ]);
    expect(sources.every((source) => source.getAttribute('sizes') === '100vw')).toBe(true);
    expect(screen.getByRole('img', { name: image.alt })).toHaveAttribute('src', image.src);
  });

  it('reserves its space with the intrinsic size and loads lazily by default', () => {
    render(<ResponsiveImage image={image} sizes="100vw" />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('width', '640');
    expect(img).toHaveAttribute('height', '640');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('fetchpriority', 'auto');
  });

  it('loads a priority image eagerly with high fetch priority', () => {
    render(<ResponsiveImage image={image} sizes="100vw" priority />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'eager');
    expect(img).toHaveAttribute('fetchpriority', 'high');
  });
});
