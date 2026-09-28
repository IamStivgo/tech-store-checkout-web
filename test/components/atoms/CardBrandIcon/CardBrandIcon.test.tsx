import { render, screen } from '@testing-library/react';

import { CardBrandIcon } from '../../../../src/components/atoms/CardBrandIcon/CardBrandIcon';

describe('CardBrandIcon', () => {
  it.each([
    ['VISA', 'Visa'],
    ['MASTERCARD', 'Mastercard'],
    ['UNKNOWN', 'Marca no reconocida'],
  ] as const)('announces the %s brand by its label', (brand, label) => {
    render(<CardBrandIcon brand={brand} label={label} />);

    expect(screen.getByRole('img', { name: label })).toBeInTheDocument();
  });

  it.each(['sm', 'md'] as const)('renders at the %s size', (size) => {
    render(<CardBrandIcon brand="VISA" size={size} label="Visa" />);

    expect(screen.getByRole('img', { name: 'Visa' })).toHaveClass(size);
  });
});
