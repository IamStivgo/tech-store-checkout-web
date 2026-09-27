import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { Modal } from '../../../../src/components/organisms/Modal/Modal';

function CheckoutExample({ onClose = jest.fn() }: { readonly onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  const close = () => {
    onClose();
    setOpen(false);
  };

  return (
    <>
      <main>
        <button
          type="button"
          onClick={() => {
            setOpen(true);
          }}
        >
          Pagar con tarjeta de crédito
        </button>
      </main>
      <Modal
        open={open}
        title="Pago con tarjeta"
        closeLabel="Cerrar"
        onClose={close}
        footer={<button type="button">Continuar</button>}
      >
        <label htmlFor="card">Número de tarjeta</label>
        <input id="card" />
      </Modal>
    </>
  );
}

const openModal = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Pagar con tarjeta de crédito' }));
  return screen.getByRole('dialog', { name: 'Pago con tarjeta' });
};

describe('Modal', () => {
  it('renders nothing while closed', () => {
    render(<CheckoutExample />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens as a modal dialog named by its title, with its footer', async () => {
    render(<CheckoutExample />);

    const dialog = await openModal();

    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeInTheDocument();
  });

  it('moves focus into the dialog', async () => {
    render(<CheckoutExample />);

    await openModal();

    expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveFocus();
  });

  it('keeps Tab inside the dialog in both directions', async () => {
    render(<CheckoutExample />);
    await openModal();

    await userEvent.tab();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Continuar' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Continuar' })).toHaveFocus();
  });

  it.each([
    ['the close button', () => userEvent.click(screen.getByRole('button', { name: 'Cerrar' }))],
    ['Escape', () => userEvent.keyboard('{Escape}')],
  ])('closes with %s and gives focus back to the opener', async (_way, close) => {
    const onClose = jest.fn();
    render(<CheckoutExample onClose={onClose} />);
    await openModal();

    await close();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pagar con tarjeta de crédito' })).toHaveFocus();
  });

  it('makes the page behind inert and stops it from scrolling while open', async () => {
    const { container } = render(<CheckoutExample />);

    await openModal();
    expect(container).toHaveAttribute('inert');
    expect(document.body.style.overflow).toBe('hidden');

    await userEvent.keyboard('{Escape}');
    expect(container).not.toHaveAttribute('inert');
    expect(document.body.style.overflow).toBe('');
  });
});
