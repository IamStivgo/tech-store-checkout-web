import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Backdrop } from '../../../../src/components/organisms/Backdrop/Backdrop';

const renderBackdrop = (open: boolean, onDismiss = jest.fn()) =>
  render(
    <Backdrop
      open={open}
      title="Resumen de pago"
      back={
        <button type="button" onClick={onDismiss}>
          Editar
        </button>
      }
      footer={<button type="button">Pagar $ 50.900</button>}
      onDismiss={onDismiss}
    >
      <p>Total $ 50.900</p>
    </Backdrop>,
  );

describe('Backdrop', () => {
  it('renders nothing while closed', () => {
    renderBackdrop(false);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('is one modal dialog named by the front title, including the back layer', () => {
    renderBackdrop(true);

    const dialog = screen.getByRole('dialog', { name: 'Resumen de pago' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toContainElement(screen.getByRole('button', { name: 'Editar' }));
    expect(dialog).toContainElement(screen.getByRole('button', { name: 'Pagar $ 50.900' }));
    expect(screen.getByText('Total $ 50.900')).toBeInTheDocument();
  });

  it('keeps the back layer operable', async () => {
    const onDismiss = jest.fn();
    renderBackdrop(true, onDismiss);

    await userEvent.click(screen.getByRole('button', { name: 'Editar' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('treats Escape as "Editar"', async () => {
    const onDismiss = jest.fn();
    renderBackdrop(true, onDismiss);

    await userEvent.keyboard('{Escape}');

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
