import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TextField } from './TextField';

describe('TextField', () => {
  it('is named by its visible label', async () => {
    render(<TextField label="Nombre completo" />);

    await userEvent.type(screen.getByRole('textbox', { name: 'Nombre completo' }), 'Ana');

    expect(screen.getByRole('textbox', { name: 'Nombre completo' })).toHaveValue('Ana');
  });

  it('describes the field with its hint', () => {
    render(<TextField label="Teléfono" hint="Celular de 10 dígitos" />);

    expect(screen.getByRole('textbox', { name: 'Teléfono' })).toHaveAccessibleDescription(
      'Celular de 10 dígitos',
    );
  });

  it('shows the error, marks the field invalid and describes it with the message', () => {
    render(
      <TextField label="Correo" hint="Te enviaremos el comprobante" error="Correo inválido" />,
    );

    const input = screen.getByRole('textbox', { name: 'Correo' });
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription('Te enviaremos el comprobante Correo inválido');
  });

  it('renders an adornment inside the field', () => {
    render(<TextField label="Número de tarjeta" suffix={<span>VISA</span>} />);

    expect(screen.getByText('VISA')).toBeInTheDocument();
  });

  it('shows a character counter linked to the field', () => {
    render(<TextField label="Titular" characterCount={{ current: 12, max: 50 }} />);

    expect(screen.getByRole('textbox', { name: 'Titular' })).toHaveAccessibleDescription('12/50');
  });

  it('keeps an id given by the caller', () => {
    render(<TextField id="card-number" label="Número de tarjeta" />);

    expect(screen.getByRole('textbox', { name: 'Número de tarjeta' })).toHaveAttribute(
      'id',
      'card-number',
    );
  });
});
