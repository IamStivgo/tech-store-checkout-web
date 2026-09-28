import { render, screen } from '@testing-library/react';

import { StockBadge } from '../../../../src/components/molecules/StockBadge/StockBadge';

describe('StockBadge', () => {
  it.each([
    ['IN_STOCK', '30 disponibles', 'success'],
    ['LOW_STOCK', 'Últimas 3', 'warning'],
    ['OUT_OF_STOCK', 'Agotado', 'danger'],
  ] as const)('shows %s with its text and tone', (status, label, tone) => {
    render(<StockBadge status={status} label={label} />);

    expect(screen.getByText(label)).toHaveClass(tone);
  });
});
