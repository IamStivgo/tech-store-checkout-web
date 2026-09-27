import { expect, test, type Page } from '@playwright/test';

import { CATALOG } from './fixtures/catalog';
import { PRODUCT_DETAILS } from './fixtures/product';

const CABLE_ID = CATALOG.data[0]?.id ?? '';
const SOLD_OUT_ID = CATALOG.data[4]?.id ?? '';
const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

const serveApi = async (page: Page) => {
  await page.route('**/api/v1/products', (route) => route.fulfill({ json: CATALOG }));
  await page.route('**/api/v1/products/*', (route) => {
    const id = new URL(route.request().url()).pathname.split('/').pop() ?? '';
    const product = PRODUCT_DETAILS.get(id);
    return product
      ? route.fulfill({ json: product })
      : route.fulfill({
          status: 404,
          contentType: 'application/problem+json',
          body: JSON.stringify({ status: 404, code: 'PRODUCT_NOT_FOUND' }),
        });
  });
};

const hasHorizontalOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

test.describe('Product page', () => {
  test.beforeEach(async ({ page }) => {
    await serveApi(page);
  });

  test('opens from the catalog with price, stock, quantity and fees', async ({
    page,
  }, testInfo) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Cable USB-C/ }).click();

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Cable USB-C a USB-C 2 m (100 W)',
    );
    await expect(page.getByText('En stock · 30 unidades')).toBeVisible();
    await expect(page.getByText('Máximo 5 por pedido')).toBeVisible();
    await expect(page.getByText(/Se suman \$\s3\.000 de tarifa de servicio/)).toBeVisible();
    expect(await hasHorizontalOverflow(page)).toBe(false);

    await testInfo.attach('product', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  });

  test('changes the quantity with the keyboard within its limits', async ({ page }) => {
    await page.goto(`/products/${CABLE_ID}`);
    const quantity = page.getByRole('spinbutton', { name: 'Cantidad' });

    await quantity.focus();
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await expect(quantity).toHaveAttribute('aria-valuenow', '3');

    await page.keyboard.press('End');
    await expect(quantity).toHaveAttribute('aria-valuenow', '5');
    await expect(page.getByRole('button', { name: 'Aumentar cantidad' })).toBeDisabled();
  });

  test('keeps the pay button in view: a bottom bar on phones, inline on desktop', async ({
    page,
    viewport,
  }) => {
    await page.goto(`/products/${CABLE_ID}`);
    const pay = page.getByRole('button', { name: 'Pagar con tarjeta de crédito' });
    await expect(pay).toBeInViewport();

    const box = await pay.boundingBox();
    const viewportHeight = viewport?.height ?? 0;
    const isFixedBar = (box?.y ?? 0) + (box?.height ?? 0) > viewportHeight - 40;
    expect(isFixedBar).toBe((viewport?.width ?? 0) < 1024);
  });

  test('shows image and details side by side on desktop', async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) < 1024, 'Two columns only from 1024 px');
    await page.goto(`/products/${CABLE_ID}`);

    const image = await page.getByRole('img', { name: /Cable USB-C/ }).boundingBox();
    const title = await page.getByRole('heading', { level: 1 }).boundingBox();

    expect(title?.x ?? 0).toBeGreaterThan((image?.x ?? 0) + (image?.width ?? 0));
  });

  test('does not let the buyer pay for a sold-out product', async ({ page }) => {
    await page.goto(`/products/${SOLD_OUT_ID}`);

    await expect(page.getByRole('button', { name: 'Agotado' })).toBeDisabled();
    await expect(page.getByRole('spinbutton', { name: 'Cantidad' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  test('explains that an unknown product does not exist', async ({ page }) => {
    await page.goto(`/products/${UNKNOWN_ID}`);

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Producto no encontrado');
    await page.getByRole('link', { name: 'Ir a la tienda' }).click();
    await expect(page).toHaveURL('/');
  });
});
