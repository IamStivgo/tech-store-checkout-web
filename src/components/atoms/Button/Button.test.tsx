import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button } from './Button';

describe('Button', () => {
  it('is a plain button unless told otherwise, so it never submits a form by accident', () => {
    render(<Button>Continuar</Button>);

    expect(screen.getByRole('button', { name: 'Continuar' })).toHaveAttribute('type', 'button');
  });

  it('can submit a form', () => {
    render(<Button type="submit">Pagar</Button>);

    expect(screen.getByRole('button', { name: 'Pagar' })).toHaveAttribute('type', 'submit');
  });

  it('calls onClick when pressed', async () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Continuar</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('shows the loading text, reports it is busy and ignores clicks while loading', async () => {
    const onClick = jest.fn();
    render(
      <Button loading loadingText="Procesando…" onClick={onClick}>
        Pagar
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Procesando…' });

    await userEvent.click(button);

    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('keeps its text while loading when there is no loading text', () => {
    render(<Button loading>Pagar</Button>);

    expect(screen.getByRole('button', { name: 'Pagar' })).toBeDisabled();
  });

  it('renders a decorative icon before the text', () => {
    render(<Button icon="credit-card">Pagar con tarjeta de crédito</Button>);

    const button = screen.getByRole('button', { name: 'Pagar con tarjeta de crédito' });
    expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('can be disabled', () => {
    render(<Button disabled>Agotado</Button>);

    expect(screen.getByRole('button', { name: 'Agotado' })).toBeDisabled();
  });
});
