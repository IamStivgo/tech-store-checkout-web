import { expect, test, type Page } from '@playwright/test';

import { fillCheckoutForm } from './checkout-form';
import { CATALOG } from './fixtures/catalog';
import { CITIES, DEPARTMENTS } from './fixtures/locations';
import { ACCEPTANCE, QUOTE, transaction, TRANSACTION_ID } from './fixtures/payment';
import { PRODUCT_DETAILS } from './fixtures/product';

const CABLE_ID = CATALOG.data[0]?.id ?? '';

/** The API of a whole purchase; the payment ends with `result` (the fake tokenizer is used). */
const serveCheckoutApi = async (page: Page, result: 'APPROVED' | 'DECLINED') => {
  const paymentBodies: unknown[] = [];
  await page.route('**/api/v1/products/*', (route) => {
    const id = new URL(route.request().url()).pathname.split('/').pop() ?? '';
    return route.fulfill({ json: PRODUCT_DETAILS.get(id) });
  });
  await page.route('**/api/v1/locations/departments', (route) =>
    route.fulfill({ json: DEPARTMENTS }),
  );
  await page.route('**/api/v1/locations/departments/*/cities', (route) => {
    const code = new URL(route.request().url()).pathname.split('/').at(-2) ?? '';
    return route.fulfill({ json: CITIES[code] });
  });
  await page.route('**/api/v1/checkout/quote**', (route) => route.fulfill({ json: QUOTE }));
  await page.route('**/api/v1/payments/acceptance-tokens', (route) =>
    route.fulfill({ json: ACCEPTANCE }),
  );
  await page.route('**/api/v1/customers', (route) =>
    route.fulfill({ status: 201, json: { id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e' } }),
  );
  await page.route('**/api/v1/transactions', (route) =>
    route.fulfill({ status: 201, json: transaction('PENDING') }),
  );
  await page.route('**/api/v1/transactions/*/payment', (route) => {
    paymentBodies.push(route.request().postDataJSON());
    return route.fulfill({ json: transaction(result) });
  });
  await page.route('**/api/v1/transactions/*', (route) =>
    route.fulfill({ json: transaction(result) }),
  );
  return { paymentBodies };
};

const reachSummary = async (page: Page, cardNumber: string) => {
  await page.goto(`/products/${CABLE_ID}`);
  await page.getByRole('button', { name: 'Pagar con tarjeta de crédito' }).click();
  const form = page.getByRole('dialog', { name: 'Pago con tarjeta' });
  await fillCheckoutForm(form, cardNumber);
  await form.getByRole('button', { name: 'Continuar' }).click();
  return page.getByRole('dialog', { name: 'Resumen de pago' });
};

const hasHorizontalOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

test.describe('Payment', () => {
  test('pays an approved purchase after accepting the documents', async ({ page }, testInfo) => {
    const { paymentBodies } = await serveCheckoutApi(page, 'APPROVED');
    const summary = await reachSummary(page, '4242424242424242');

    await expect(summary.getByText('$ 50.900').first()).toBeVisible();
    await expect(summary.getByText('VISA •••• 4242 · 1 cuota')).toBeVisible();
    await summary.getByRole('button', { name: /^Pagar \$\s50\.900/ }).click();
    await expect(summary.getByText('Debes aceptarlo para pagar').first()).toBeVisible();
    await summary.getByRole('checkbox', { name: /términos y condiciones/ }).check();
    await summary.getByRole('checkbox', { name: /datos personales/ }).check();
    await summary.getByRole('button', { name: /^Pagar \$\s50\.900/ }).click();

    await expect(page.getByRole('heading', { level: 1, name: '¡Pago aprobado!' })).toBeVisible();
    await expect(page).toHaveURL(`/transactions/${TRANSACTION_ID}`);
    await expect(
      page.getByText('Tu pedido CKT-20260928-YQDGMY1VPT está confirmado.'),
    ).toBeVisible();
    expect(paymentBodies).toHaveLength(1);
    expect(paymentBodies[0]).toMatchObject({
      installments: 1,
      acceptanceToken: 'a.b.c',
      personalDataAuthToken: 'd.e.f',
    });
    expect((paymentBodies[0] as { cardToken: string }).cardToken).toMatch(
      /^tok_fake_approved_4242_/,
    );
    expect(await hasHorizontalOverflow(page)).toBe(false);
    await page.screenshot({ path: testInfo.outputPath('payment-approved.png'), fullPage: true });
  });

  test('explains a declined payment and goes back to the product to try again', async ({
    page,
  }) => {
    await serveCheckoutApi(page, 'DECLINED');
    const summary = await reachSummary(page, '4111111111111111');
    await summary.getByRole('checkbox', { name: /términos y condiciones/ }).check();
    await summary.getByRole('checkbox', { name: /datos personales/ }).check();

    await summary.getByRole('button', { name: /^Pagar \$\s50\.900/ }).click();

    await expect(page.getByRole('heading', { level: 1, name: 'Pago rechazado' })).toBeVisible();
    await expect(page.getByText('La transacción fue rechazada (Sandbox)')).toBeVisible();
    await expect(page.getByText('Total del pedido')).toBeVisible();
    await page.getByRole('link', { name: 'Intentar de nuevo' }).click();
    await expect(page).toHaveURL(`/products/${CABLE_ID}`);
  });
});
