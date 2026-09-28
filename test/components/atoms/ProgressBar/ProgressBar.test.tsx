import { render, screen } from '@testing-library/react';

import { ProgressBar } from '../../../../src/components/atoms/ProgressBar/ProgressBar';

describe('ProgressBar', () => {
  it('reports its progress as a percentage', () => {
    render(<ProgressBar value={0.4} label="Tiempo para volver a la tienda" />);

    expect(
      screen.getByRole('progressbar', { name: 'Tiempo para volver a la tienda' }),
    ).toHaveAttribute('aria-valuenow', '40');
  });

  it.each([
    [-0.5, '0'],
    [1.7, '100'],
  ])('keeps %p within bounds', (value, expected) => {
    render(<ProgressBar value={value} label="Progreso" />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', expected);
  });
});
