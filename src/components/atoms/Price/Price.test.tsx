import { render, screen } from '@testing-library/react';

import { Price } from './Price';

describe('Price', () => {
  it('shows the amount in Colombian pesos', () => {
    render(<Price amountInCents={5_090_000} />);

    // Testing Library normalizes the non-breaking space of the DOM text to a regular space.
    expect(screen.getByText('$ 50.900')).toBeInTheDocument();
  });

  it('shows an optional note after the amount', () => {
    render(<Price amountInCents={3_990_000} note="IVA incluido" />);

    expect(screen.getByText('IVA incluido')).toBeInTheDocument();
  });

  it('shows no note by default', () => {
    const { container } = render(<Price amountInCents={3_990_000} size="xl" />);

    expect(container).toHaveTextContent(/^\$\s39\.900$/);
  });
});
