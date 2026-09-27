import { render, screen } from '@testing-library/react';

import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('announces its label as a status', () => {
    render(<Spinner size={48} label="Procesando pago" />);

    expect(screen.getByRole('status')).toHaveTextContent('Procesando pago');
  });

  it('stays silent without a label, e.g. inside a button that already says "Procesando…"', () => {
    render(<Spinner />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it.each([20, 48] as const)('renders at %i px', (size) => {
    const { container } = render(<Spinner size={size} />);

    expect(container.querySelector('svg')).toHaveAttribute('width', String(size));
  });
});
