import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router';

import { PaymentResultPage } from '../../../../../src/modules/payment-result';
import { ProductPage } from '../../../../../src/modules/product/pages/ProductPage/ProductPage';
import type { CardTokenizer } from '../../../../../src/services/tokenization/card-tokenizer';
import { CardTokenizerContext } from '../../../../../src/services/tokenization/card-tokenizer-context';
import { FakeCardTokenizer } from '../../../../../src/services/tokenization/fake-card-tokenizer';
import { createAppStore } from '../../../../../src/store/store';
import { aProductDetail } from '../../../../builders/product.builder';
import {
  aTransaction,
  anApprovedTransaction,
  TRANSACTION_ID,
} from '../../../../builders/transaction.builder';
import { routeFetch } from '../../../../services/api/route-fetch';
import { citiesOf, DEPARTMENTS, fillValidCheckoutForm } from '../../../checkout/fill-checkout-form';

const PRODUCT_ID = '7d094266-0b4e-4789-9522-96e1cd7ffa60';
const cents = (amountInCents: number) => ({ amountInCents, currency: 'COP' as const });
const QUOTE = {
  productId: PRODUCT_ID,
  quantity: 1,
  unitPrice: cents(3_990_000),
  productAmount: cents(3_990_000),
  serviceFee: cents(300_000),
  deliveryFee: cents(800_000),
  total: cents(5_090_000),
  delivery: {
    zone: 'LOCAL',
    billableWeightKg: 1,
    freeShippingApplied: false,
    freeShippingThreshold: cents(15_000_000),
    estimatedBusinessDays: { min: 1, max: 1 },
  },
  calculatedAt: '2026-09-28T12:50:00.000Z',
};
const ACCEPTANCE = {
  endUserPolicy: { acceptanceToken: 'a.b.c', permalink: 'https://docs.example/terms.pdf' },
  personalDataAuth: { acceptanceToken: 'd.e.f', permalink: 'https://docs.example/data.pdf' },
};

const checkoutRoutes = (payment: { status?: number; body: unknown }) => ({
  [`GET /products/${PRODUCT_ID}`]: { body: aProductDetail() },
  'GET /locations/departments': { body: DEPARTMENTS },
  'GET /locations/departments/11/cities': { body: citiesOf('11001', 'Bogotá, D.C.') },
  'GET /checkout/quote': { body: QUOTE },
  'GET /payments/acceptance-tokens': { body: ACCEPTANCE },
  'POST /customers': { status: 201, body: { id: 'customer-1' } },
  'POST /transactions': { status: 201, body: aTransaction() },
  [`POST /transactions/${TRANSACTION_ID}/payment`]: payment,
  [`GET /transactions/${TRANSACTION_ID}`]: { body: anApprovedTransaction() },
});

const renderCheckout = (tokenizer: CardTokenizer = new FakeCardTokenizer()) => {
  const store = createAppStore();
  render(
    <Provider store={store}>
      <CardTokenizerContext value={tokenizer}>
        <MemoryRouter initialEntries={[`/products/${PRODUCT_ID}`]}>
          <Routes>
            <Route path="/products/:productId" element={<ProductPage />} />
            <Route path="/transactions/:transactionId" element={<PaymentResultPage />} />
          </Routes>
        </MemoryRouter>
      </CardTokenizerContext>
    </Provider>,
  );
  return { store, user: userEvent.setup() };
};

const reachSummary = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByRole('button', { name: 'Pagar con tarjeta de crédito' }));
  await fillValidCheckoutForm(user);
  await user.click(screen.getByRole('button', { name: 'Continuar' }));
  await screen.findByRole('dialog', { name: 'Resumen de pago' });
  await user.click(await screen.findByRole('checkbox', { name: /términos y condiciones/ }));
  await user.click(screen.getByRole('checkbox', { name: /datos personales/ }));
};

describe('ProductPage payment', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('pays with the card token and opens the result of the payment', async () => {
    const api = routeFetch(checkoutRoutes({ body: anApprovedTransaction() }));
    const { store, user } = renderCheckout();
    await reachSummary(user);

    await user.click(screen.getByRole('button', { name: /^Pagar \$\s50\.900/ }));

    expect(
      await screen.findByRole('heading', { level: 1, name: '¡Pago aprobado!' }),
    ).toBeInTheDocument();
    expect(store.getState().checkout).toMatchObject({ step: 'PRODUCT', details: null });
    const payRequest = api
      .requests()
      .find(({ url }) => url.endsWith(`/transactions/${TRANSACTION_ID}/payment`));
    expect(await payRequest?.json()).toEqual({
      cardToken: expect.stringMatching(/^tok_fake_approved_4242_/) as string,
      installments: 3,
      acceptanceToken: 'a.b.c',
      personalDataAuthToken: 'd.e.f',
    });
    const transactionRequest = api
      .requests()
      .find(({ url }) => url.endsWith('/api/v1/transactions'));
    expect(await transactionRequest?.json()).toMatchObject({
      productId: PRODUCT_ID,
      quantity: 1,
      customerId: 'customer-1',
      shippingAddress: { recipientName: 'Ana María Gómez', cityCode: '11001' },
    });
  });

  it('stays on the summary and explains a payment the provider rejected', async () => {
    routeFetch(
      checkoutRoutes({
        status: 422,
        body: { status: 422, code: 'PAYMENT_REJECTED_BY_PROVIDER' },
      }),
    );
    const { store, user } = renderCheckout();
    await reachSummary(user);

    await user.click(screen.getByRole('button', { name: /^Pagar \$\s50\.900/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('La pasarela rechazó el pago.');
    expect(store.getState().checkout.step).toBe('SUMMARY');
  });

  it('follows a payment the provider did not answer in time on the result page', async () => {
    routeFetch(
      checkoutRoutes({ status: 504, body: { status: 504, code: 'PAYMENT_PROVIDER_TIMEOUT' } }),
    );
    const { user } = renderCheckout();
    await reachSummary(user);

    await user.click(screen.getByRole('button', { name: /^Pagar \$\s50\.900/ }));

    expect(
      await screen.findByRole('heading', { level: 1, name: '¡Pago aprobado!' }),
    ).toBeInTheDocument();
  });

  it('keeps the form open when the card cannot be tokenized', async () => {
    routeFetch(checkoutRoutes({ body: anApprovedTransaction() }));
    const failing: CardTokenizer = {
      tokenize: () => Promise.resolve({ ok: false, error: 'INVALID_CARD' }),
    };
    const { store, user } = renderCheckout(failing);
    await user.click(await screen.findByRole('button', { name: 'Pagar con tarjeta de crédito' }));
    await fillValidCheckoutForm(user);

    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'La pasarela no aceptó los datos de la tarjeta.',
    );
    expect(store.getState().checkout.step).toBe('DETAILS');
  });
});
