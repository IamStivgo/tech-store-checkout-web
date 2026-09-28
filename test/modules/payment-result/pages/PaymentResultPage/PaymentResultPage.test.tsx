import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router';

import {
  PaymentResultPage,
  PENDING_POLL_MS,
} from '../../../../../src/modules/payment-result/pages/PaymentResultPage/PaymentResultPage';
import { createAppStore } from '../../../../../src/store/store';
import {
  aDeclinedTransaction,
  aTransaction,
  anApprovedTransaction,
  TRANSACTION_ID,
} from '../../../../builders/transaction.builder';
import { stubFetch } from '../../../../services/api/fetch-stub';

const renderResult = (transactionId = TRANSACTION_ID) =>
  render(
    <Provider store={createAppStore()}>
      <MemoryRouter initialEntries={[`/transactions/${transactionId}`]}>
        <Routes>
          <Route path="/transactions/:transactionId" element={<PaymentResultPage />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

describe('PaymentResultPage', () => {
  let fetchStub: ReturnType<typeof stubFetch>;

  beforeEach(() => {
    fetchStub = stubFetch();
  });

  afterEach(() => {
    fetchStub.restore();
    jest.useRealTimers();
  });

  it('confirms an approved payment with its reference, total and delivery date', async () => {
    fetchStub.respondJson(anApprovedTransaction());
    renderResult();

    expect(
      await screen.findByRole('heading', { level: 1, name: '¡Pago aprobado!' }),
    ).toBeInTheDocument();
    const page = screen.getByRole('region');
    expect(page).toHaveTextContent('Tu pedido CKT-20260928-YQDGMY1VPT está confirmado.');
    expect(page).toHaveTextContent('Cable USB-C a USB-C 2 m (100 W) × 1');
    expect(page).toHaveTextContent('VISA •••• 4242');
    expect(page).toHaveTextContent(/Total pagado\s*\$\s50\.900/);
    expect(page).toHaveTextContent(/^.*Llega el/);
    expect(screen.getByRole('link', { name: 'Ir a la tienda' })).toHaveAttribute('href', '/');
    expect(screen.queryByRole('link', { name: 'Intentar de nuevo' })).not.toBeInTheDocument();
  });

  it('explains a declined payment and offers to try again', async () => {
    fetchStub.respondJson(aDeclinedTransaction());
    renderResult();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Pago rechazado' }),
    ).toBeInTheDocument();
    expect(screen.getByText('La transacción fue rechazada (Sandbox)')).toBeInTheDocument();
    expect(screen.getByText('Total del pedido')).toBeInTheDocument();
    expect(screen.queryByText('Total pagado')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Intentar de nuevo' })).toHaveAttribute(
      'href',
      `/products/${aTransaction().product.id}`,
    );
    expect(screen.queryByText(/Llega/)).not.toBeInTheDocument();
  });

  it('says a reservation that expired was not charged', async () => {
    fetchStub.respondJson(aTransaction({ status: 'EXPIRED' }));
    renderResult();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'La compra no se completó' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/No se realizó ningún cobro/)).toBeInTheDocument();
  });

  it('asks again while the payment is pending', async () => {
    jest.useFakeTimers({ advanceTimers: true });
    fetchStub.respondJson(aTransaction());
    fetchStub.respondJson(anApprovedTransaction());
    renderResult();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Estamos confirmando tu pago' }),
    ).toBeInTheDocument();
    await act(async () => {
      await jest.advanceTimersByTimeAsync(PENDING_POLL_MS);
    });

    expect(
      await screen.findByRole('heading', { level: 1, name: '¡Pago aprobado!' }),
    ).toBeInTheDocument();
  });

  it('shows the not found page for an unknown transaction', async () => {
    fetchStub.respondJson({ status: 404, code: 'TRANSACTION_NOT_FOUND' }, 404);
    renderResult();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Página no encontrada' }),
    ).toBeInTheDocument();
  });

  it('offers to retry when the status cannot be read', async () => {
    fetchStub.respondJson({ status: 500, code: 'INTERNAL_ERROR' }, 500);
    fetchStub.respondJson(anApprovedTransaction());
    renderResult();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('No pudimos consultar el estado de tu pago.');
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: '¡Pago aprobado!' }),
    ).toBeInTheDocument();
  });
});
