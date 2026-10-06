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

  it('shows a detail under the total when there is one', () => {
    render(
      <PriceBreakdown
        rows={[{ label: 'Valor sin IVA', amountInCents: 20_151_300 }]}
        totalLabel="Total productos"
        totalInCents={23_980_000}
        totalDetail="2 × $ 119.900"
      />,
    );

    const terms = screen.getAllByRole('term');
    expect(terms[1]?.textContent.replace(/\u00a0/g, ' ')).toBe('Total productos2 × $ 119.900');
    expect(screen.getByText('2 × $ 119.900')).toHaveClass('detail');
  });

  it('shows no detail under the total by default', () => {
    render(<PriceBreakdown rows={[]} totalLabel="Total" totalInCents={5_090_000} />);

    expect(screen.getByRole('term').textContent).toBe('Total');
  });
});
