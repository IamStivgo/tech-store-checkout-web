import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';

import { Input } from './Input';

describe('Input', () => {
  it('lets the user type', async () => {
    render(<Input aria-label="Nombre" />);

    await userEvent.type(screen.getByRole('textbox', { name: 'Nombre' }), 'Ana');

    expect(screen.getByRole('textbox', { name: 'Nombre' })).toHaveValue('Ana');
  });

  it('is marked invalid for assistive technology', () => {
    render(<Input aria-label="Correo" invalid />);

    expect(screen.getByRole('textbox', { name: 'Correo' })).toBeInvalid();
  });

  it('is valid by default', () => {
    render(<Input aria-label="Correo" />);

    expect(screen.getByRole('textbox', { name: 'Correo' })).not.toHaveAttribute('aria-invalid');
  });

  it('exposes the native input through its ref, as form libraries need', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input aria-label="Teléfono" ref={ref} hasSuffix />);

    expect(ref.current).toBe(screen.getByRole('textbox', { name: 'Teléfono' }));
  });
});
