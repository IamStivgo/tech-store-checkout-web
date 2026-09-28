import { render, screen } from '@testing-library/react';

import { Icon } from '../../../../src/components/atoms/Icon/Icon';
import { ICONS, type IconName } from '../../../../src/components/atoms/Icon/icons';

describe('Icon', () => {
  it('is decorative and hidden from assistive technology by default', () => {
    const { container } = render(<Icon name="truck" />);

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('is announced as an image when it has a label', () => {
    render(<Icon name="alert-triangle" label="Advertencia" />);

    expect(screen.getByRole('img', { name: 'Advertencia' })).toBeInTheDocument();
  });

  it.each([16, 20, 24, 48] as const)('renders at %i px', (size) => {
    const { container } = render(<Icon name="plus" size={size} />);

    expect(container.querySelector('svg')).toHaveAttribute('width', String(size));
  });

  it.each(Object.keys(ICONS) as IconName[])('draws the %s icon', (name) => {
    const { container } = render(<Icon name={name} />);

    expect(container.querySelector('svg')?.childElementCount).toBeGreaterThan(0);
  });
});
