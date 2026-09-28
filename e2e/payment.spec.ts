import { expect, test, type Page } from '@playwright/test';

import { serveCheckoutApi } from './checkout-api';
import { fillCheckoutForm } from './checkout-form';
import { CATALOG } from './fixtures/catalog';
import { TRANSACTION_ID } from './fixtures/payment';

const CABLE_ID = CATALOG.data[0]?.id ?? '';

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
