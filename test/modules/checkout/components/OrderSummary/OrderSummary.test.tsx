import { render, screen } from '@testing-library/react';

import { OrderSummary } from '../../../../../src/modules/checkout/components/OrderSummary/OrderSummary';

const text = (element: HTMLElement) => element.textContent.replace(/\u00a0/g, ' ');

describe('OrderSummary', () => {
  it('splits the price of one unit into its base and its VAT', () => {
    render(<OrderSummary order={{ quantity: 1, unitPriceInCents: 11_990_000 }} />);

    const section = screen.getByRole('region', { name: 'Tu pedido' });
    expect(section).toBeInTheDocument();
    expect(screen.getAllByRole('term').map(text)).toEqual([
      'Valor sin IVA',
      'IVA (19 %)',
      'Total productos',
    ]);
    expect(screen.getAllByRole('definition').map(text)).toEqual([
      '$ 100.756',
      '$ 19.144',
      '$ 119.900',
    ]);
  });

  it('calculates over the amount of the line and shows the unit price under the total', () => {
    render(<OrderSummary order={{ quantity: 2, unitPriceInCents: 11_990_000 }} />);

    expect(screen.getAllByRole('definition').map(text)).toEqual([
      '$ 201.513',
      '$ 38.287',
      '$ 239.800',
    ]);
    expect(
      screen.getByText('2 × $ 119.900', { normalizer: (value) => value.replace(/\u00a0/g, ' ') }),
    ).toBeInTheDocument();
  });

  it('shows no unit price for a single unit and warns that the fees carry no VAT', () => {
    render(<OrderSummary order={{ quantity: 1, unitPriceInCents: 11_990_000 }} />);

    expect(screen.queryByText(/×/)).not.toBeInTheDocument();
    expect(
      screen.getByText('La tarifa de servicio y el envío se suman en el resumen y no llevan IVA.'),
    ).toBeInTheDocument();
  });
});
