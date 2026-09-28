import { expect, test, type Page } from '@playwright/test';

import { fillCheckoutForm } from './checkout-form';
import { CATALOG } from './fixtures/catalog';
import { CITIES, DEPARTMENTS } from './fixtures/locations';
import { PRODUCT_DETAILS } from './fixtures/product';

const CABLE_ID = CATALOG.data[0]?.id ?? '';

const serveApi = async (page: Page) => {
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
};

const openCheckout = async (page: Page) => {
  await page.goto(`/products/${CABLE_ID}`);
  await page.getByRole('button', { name: 'Pagar con tarjeta de crédito' }).click();
  return page.getByRole('dialog', { name: 'Pago con tarjeta' });
};

const hasHorizontalOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

test.describe('Checkout form', () => {
  test.beforeEach(async ({ page }) => {
    await serveApi(page);
  });

  test('opens over the product page and lists the errors of an empty form', async ({
    page,
  }, testInfo) => {
    const dialog = await openCheckout(page);
    await expect(dialog).toBeVisible();
    expect(await hasHorizontalOverflow(page)).toBe(false);

    await dialog.getByRole('button', { name: 'Continuar' }).click();

    await expect(dialog.getByRole('alert')).toHaveText('Revisa los campos marcados (11).');
    await expect(dialog.getByLabel('Número de tarjeta')).toBeFocused();
    await testInfo.attach('checkout-errors', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
  });

  test('detects the brand and formats the card while typing', async ({ page }) => {
    const dialog = await openCheckout(page);
    const number = dialog.getByLabel('Número de tarjeta');

    await number.pressSequentially('5555555555554444');

    await expect(number).toHaveValue('5555 5555 5555 4444');
    await expect(dialog.getByRole('img', { name: 'Mastercard' })).toBeVisible();
  });

  test('accepts a complete form and closes', async ({ page }) => {
    const dialog = await openCheckout(page);

    await fillCheckoutForm(dialog);
    await expect(dialog.getByText('Recibe: Ana María Gómez · 300 123 4567')).toBeVisible();

    await dialog.getByRole('button', { name: 'Continuar' }).click();

    await expect(dialog).toBeHidden();
  });

  test('closes with Escape and gives the focus back to the pay button', async ({ page }) => {
    const dialog = await openCheckout(page);

    await page.keyboard.press('Escape');

    await expect(dialog).toBeHidden();
    await expect(page.getByRole('button', { name: 'Pagar con tarjeta de crédito' })).toBeFocused();
  });
});
