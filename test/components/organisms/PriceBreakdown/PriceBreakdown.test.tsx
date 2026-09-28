import { render, screen } from '@testing-library/react';

import { PriceBreakdown } from '../../../../src/components/organisms/PriceBreakdown/PriceBreakdown';

describe('PriceBreakdown', () => {
  it('lists every charge with its detail and the total', () => {
    render(
      <PriceBreakdown
        rows={[
          { label: 'Productos (2)', detail: '2 × $ 119.900', amountInCents: 23_980_000 },
          { label: 'Tarifa de servicio', amountInCents: 300_000 },
          {
            label: 'Envío · Cali',
            detail: 'Compras desde $ 150.000',
            amountInCents: 0,
            valueText: 'Gratis',
          },
        ]}
        totalLabel="Total"
        totalInCents={24_280_000}
      />,
    );

    const terms = screen.getAllByRole('term');
    const values = screen.getAllByRole('definition');
    expect(terms.map((term) => term.textContent)).toEqual([
      'Productos (2)2 × $ 119.900',
      'Tarifa de servicio',
      'Envío · CaliCompras desde $ 150.000',
      'Total',
    ]);
    // formatCop separates the symbol with a non-breaking space.
    expect(values.map((value) => value.textContent.replace(/\u00a0/g, ' '))).toEqual([
      '$ 239.800',
      '$ 3.000',
      'Gratis',
      '$ 242.800',
    ]);
    expect(screen.getByText('Gratis')).toHaveClass('highlight');
  });
});
