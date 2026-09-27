import { render, screen } from '@testing-library/react';

import { Badge } from '../../../../src/components/atoms/Badge/Badge';

describe('Badge', () => {
  it('shows its text with the tone', () => {
    render(<Badge tone="success">Disponible</Badge>);

    expect(screen.getByText('Disponible')).toHaveClass('success');
  });

  it('is neutral by default', () => {
    render(<Badge>Nuevo</Badge>);

    expect(screen.getByText('Nuevo')).toHaveClass('neutral');
  });

  it('adds a decorative icon', () => {
    render(
      <Badge tone="danger" icon="x-circle">
        Agotado
      </Badge>,
    );

    expect(screen.getByText('Agotado').querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
