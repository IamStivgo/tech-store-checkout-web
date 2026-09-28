import { render } from '@testing-library/react';

import { Skeleton } from '../../../../src/components/atoms/Skeleton/Skeleton';

describe('Skeleton', () => {
  it('is hidden from assistive technology', () => {
    const { container } = render(<Skeleton />);

    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it.each(['rect', 'text', 'circle'] as const)('renders the %s variant', (variant) => {
    const { container } = render(<Skeleton variant={variant} />);

    expect(container.firstChild).toHaveClass(variant);
  });

  it('takes the given size', () => {
    const { container } = render(<Skeleton width="60%" height="1.5rem" />);

    expect(container.firstChild).toHaveStyle({ width: '60%', height: '1.5rem' });
  });
});
