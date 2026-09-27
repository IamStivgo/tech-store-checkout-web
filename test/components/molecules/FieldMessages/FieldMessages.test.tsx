import { render, screen } from '@testing-library/react';

import {
  describedBy,
  FieldMessages,
} from '../../../../src/components/molecules/FieldMessages/FieldMessages';

describe('FieldMessages', () => {
  it('shows the hint and the error', () => {
    render(<FieldMessages fieldId="phone" hint="10 dígitos" error="Número inválido" />);

    expect(screen.getByText('10 dígitos')).toHaveAttribute('id', 'phone-hint');
    expect(screen.getByText('Número inválido').parentElement).toHaveAttribute('id', 'phone-error');
  });

  it.each([
    [{ hint: 'Ayuda', error: 'Error' }, 'phone-hint phone-error'],
    [{ hint: 'Ayuda' }, 'phone-hint'],
    [{ error: 'Error' }, 'phone-error'],
    [{}, undefined],
  ])('links %p through aria-describedby', (messages, expected) => {
    expect(describedBy({ fieldId: 'phone', ...messages })).toBe(expected);
  });
});
