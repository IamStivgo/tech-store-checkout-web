import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';

import {
  SummaryBackdrop,
  type SummaryBackdropProps,
} from '../../../../../src/modules/checkout/components/SummaryBackdrop/SummaryBackdrop';
import type { CheckoutDetails } from '../../../../../src/modules/checkout/store/checkout.slice';
import type { CheckoutQuote } from '../../../../../src/services/api/contract';
import { createAppStore } from '../../../../../src/store/store';
import { aProductSummary } from '../../../../builders/product.builder';

// Thursday 24 September 2026, the purchase date of the mockups (copy deck §7.3).
const NOW = () => new Date(2026, 8, 24, 15, 0);
const cents = (amountInCents: number) => ({ amountInCents, currency: 'COP' as const });
const product = aProductSummary();

const E1_QUOTE: CheckoutQuote = {
  productId: product.id,
  quantity: 1,
  unitPrice: cents(3_990_000),
  productAmount: cents(3_990_000),
  vat: { ratePercent: 19, base: cents(3_352_900), amount: cents(637_100) },
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
  calculatedAt: '2026-09-24T20:00:00.000Z',
};

const E3_QUOTE: CheckoutQuote = {
  ...E1_QUOTE,
  quantity: 2,
  unitPrice: cents(11_990_000),
  productAmount: cents(23_980_000),
  vat: { ratePercent: 19, base: cents(20_151_300), amount: cents(3_828_700) },
  deliveryFee: cents(0),
  total: cents(24_280_000),
  delivery: {
    ...E1_QUOTE.delivery,
    zone: 'NATIONAL_MAIN',
    freeShippingApplied: true,
    estimatedBusinessDays: { min: 2, max: 3 },
  },
};

const details = (overrides: Partial<CheckoutDetails> = {}): CheckoutDetails => ({
  customer: {
    fullName: 'Ana María Gómez',
    email: 'ana.gomez@example.com',
    phone: '3001234567',
    legalIdType: 'CC',
    legalId: '1020304050',
  },
  shipping: {
    departmentCode: '11',
    cityCode: '11001',
    addressLine1: 'Calle 100 # 10-20',
    addressLine2: '',
    postalCode: '',
    notes: '',
    useCustomerData: true,
  },
  installments: 1,
  card: { brand: 'VISA', lastFour: '4242' },
  ...overrides,
});

const CITIES = {
  data: [{ code: '11001', name: 'Bogotá, D.C.', zone: 'LOCAL' }],
  meta: { count: 1 },
};

const ACCEPTANCE = {
  endUserPolicy: { acceptanceToken: 'a.b.c', permalink: 'https://docs.example/terms.pdf' },
  personalDataAuth: { acceptanceToken: 'd.e.f', permalink: 'https://docs.example/data.pdf' },
};

/** Answers by URL, since the quote, the cities and the acceptances are requested together. */
const serveApi = (
  quotes: readonly (CheckoutQuote | 'error')[],
  acceptances: readonly (typeof ACCEPTANCE | 'error')[] = [ACCEPTANCE],
) => {
  const pending = [...quotes];
  const pendingAcceptances = [...acceptances];
  return jest.spyOn(globalThis, 'fetch').mockImplementation((input) => {
    const { url } = input as Request;
    const json = (body: unknown, status = 200) =>
      Promise.resolve(
        new Response(JSON.stringify(body), {
          status,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    if (url.includes('/cities')) {
      return json(CITIES);
    }
    if (url.includes('/payments/acceptance-tokens')) {
      const acceptance = pendingAcceptances.shift() ?? ACCEPTANCE;
      return acceptance === 'error'
        ? json({ status: 502, code: 'PAYMENT_PROVIDER_UNAVAILABLE' }, 502)
        : json(acceptance);
    }
    const next = pending.shift() ?? 'error';
    return next === 'error' ? json({ status: 500, code: 'INTERNAL_ERROR' }, 500) : json(next);
  });
};

const renderSummary = (props: Partial<SummaryBackdropProps> = {}) => {
  const onEdit = jest.fn();
  const onPay = jest.fn();
  render(
    <Provider store={createAppStore()}>
      <SummaryBackdrop
        open
        product={product}
        quantity={1}
        details={details()}
        onEdit={onEdit}
        onPay={onPay}
        now={NOW}
        {...props}
      />
    </Provider>,
  );
  return { onEdit, onPay, user: userEvent.setup() };
};

const payButton = () => screen.getByRole('button', { name: /^Pagar|Procesando/ });

describe('SummaryBackdrop', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows the E1 summary: charges from the API, card and delivery date', async () => {
    serveApi([E1_QUOTE]);
    renderSummary();

    const dialog = screen.getByRole('dialog', { name: 'Resumen de pago' });
    expect(await within(dialog).findByText('Total')).toBeInTheDocument();
    expect(dialog).toHaveTextContent('Cable USB-C a USB-C 2 m (100 W) × 1');
    expect(dialog).toHaveTextContent('Envío a Bogotá, D.C.');
    expect(dialog).toHaveTextContent(/Productos \(1\) sin IVA\s*\$\s33\.529/);
    expect(dialog).toHaveTextContent(/IVA \(19 %\)\s*\$\s6\.371/);
    expect(dialog).toHaveTextContent(/Tarifa de servicio\s*\$\s3\.000/);
    expect(dialog).toHaveTextContent('Envío · Bogotá, D.C.');
    expect(dialog).toHaveTextContent('VISA •••• 4242 · 1 cuota');
    expect(dialog).toHaveTextContent('Llega el viernes 25 de septiembre');
    expect(payButton()).toHaveTextContent('Pagar $ 50.900');
  });

  it('shows free shipping, the unit price and a delivery range (E3)', async () => {
    serveApi([E3_QUOTE]);
    renderSummary({ quantity: 2, details: details({ installments: 3 }) });

    const dialog = await screen.findByRole('dialog');
    expect(await within(dialog).findByText('Gratis')).toBeInTheDocument();
    expect(dialog).toHaveTextContent('Compras desde $ 150.000');
    expect(dialog).toHaveTextContent(/Productos \(2\) sin IVA\s*\$\s201\.513/);
    expect(dialog).toHaveTextContent(/IVA \(19 %\)\s*\$\s38\.287/);
    expect(dialog).not.toHaveTextContent('2 × $ 119.900');
    expect(dialog).toHaveTextContent('VISA •••• 4242 · 3 cuotas');
    expect(dialog).toHaveTextContent('Llega entre el lunes 28 y el martes 29 de septiembre');
    expect(payButton()).toHaveTextContent('Pagar $ 242.800');
  });

  it('pays the quoted total and goes back to edit with the button or Escape', async () => {
    serveApi([E1_QUOTE]);
    const { onEdit, onPay, user } = renderSummary();
    await screen.findByText('Total');
    await user.click(await screen.findByRole('checkbox', { name: /términos y condiciones/ }));
    await user.click(screen.getByRole('checkbox', { name: /datos personales/ }));

    await user.click(payButton());
    await user.click(screen.getByRole('button', { name: 'Editar' }));
    await user.keyboard('{Escape}');

    expect(onPay).toHaveBeenCalledWith(E1_QUOTE, ACCEPTANCE);
    expect(onEdit).toHaveBeenCalledTimes(2);
  });

  it('asks to accept both documents before paying', async () => {
    serveApi([E1_QUOTE]);
    const { onPay, user } = renderSummary();
    const terms = await screen.findByRole('checkbox', { name: /términos y condiciones/ });
    await user.click(terms);

    await user.click(payButton());

    expect(onPay).not.toHaveBeenCalled();
    expect(screen.getByRole('checkbox', { name: /datos personales/ })).toHaveAccessibleDescription(
      /Debes aceptarlo para pagar/,
    );
    expect(terms).not.toHaveAccessibleDescription(/Debes aceptarlo/);
    expect(screen.getAllByRole('link', { name: /Leer documento/ })[0]).toHaveAttribute(
      'href',
      ACCEPTANCE.endUserPolicy.permalink,
    );
  });

  it('offers to retry when the documents to accept cannot be loaded', async () => {
    serveApi([E1_QUOTE], ['error', ACCEPTANCE]);
    const { user } = renderSummary();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('No pudimos cargar los documentos que debes aceptar.');
    expect(payButton()).toBeDisabled();
    await user.click(within(alert).getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByRole('checkbox', { name: /datos personales/ })).toBeInTheDocument();
  });

  it('explains why the last payment failed', async () => {
    serveApi([E1_QUOTE]);
    renderSummary({ paymentError: 'La pasarela rechazó el pago.' });

    expect(await screen.findByRole('alert')).toHaveTextContent('La pasarela rechazó el pago.');
  });

  it('keeps the pay button disabled while the total is being calculated', () => {
    serveApi([E1_QUOTE]);
    renderSummary();

    expect(screen.getByTestId('summary-skeleton')).toHaveAttribute('aria-busy', 'true');
    expect(payButton()).toBeDisabled();
  });

  it('offers to retry when the total cannot be calculated', async () => {
    serveApi(['error', E1_QUOTE]);
    const { user } = renderSummary();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('No pudimos calcular el total de tu compra.');
    await user.click(within(alert).getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByText('Total')).toBeInTheDocument();
  });

  it('blocks editing and paying again while the payment is sent', async () => {
    serveApi([E1_QUOTE]);
    renderSummary({ paying: true });
    await screen.findByText('Total');

    expect(payButton()).toHaveTextContent('Procesando…');
    expect(payButton()).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Editar' })).toBeDisabled();
  });

  it('explains when the payment service does not answer', async () => {
    serveApi([E1_QUOTE]);
    // Without an injected clock the component estimates from today.
    renderSummary({ paymentFailed: true, now: undefined });

    expect(await screen.findByText(/^Llega/)).toBeInTheDocument();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El servicio de pagos no responde. Intenta en unos segundos.',
    );
  });

  it('asks for nothing while closed', () => {
    const fetchSpy = serveApi([E1_QUOTE]);
    renderSummary({ open: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
