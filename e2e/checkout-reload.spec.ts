import { expect, test, type Page } from '@playwright/test';

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

test('restores the checkout form after a reload, encrypted and without the card', async ({
  page,
}) => {
  await serveApi(page);
  await page.goto(`/products/${CABLE_ID}`);
  await page.getByRole('button', { name: 'Pagar con tarjeta de crédito' }).click();
  const dialog = page.getByRole('dialog', { name: 'Pago con tarjeta' });
  await dialog.getByLabel('Número de tarjeta').fill('4242424242424242');
  await dialog.getByLabel('Nombre completo').fill('Ana María Gómez');
  await dialog.getByLabel('Email').fill('ana.gomez@example.com');

  // Changes are saved at most every half second.
  await page.waitForTimeout(700);
  await page.reload();

  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel('Email')).toHaveValue('ana.gomez@example.com');
  await expect(dialog.getByLabel('Nombre completo')).toHaveValue('Ana María Gómez');
  await expect(dialog.getByLabel('Número de tarjeta')).toHaveValue('');
  // Saved encrypted (AES-GCM, key kept in IndexedDB): neither the card nor the buyer's data.
  const saved = (await page.evaluate(() => localStorage.getItem('checkout:v1'))) ?? '';
  expect(saved).toMatch(/^enc:v1:/);
  expect(saved).not.toMatch(/4242|ana\.gomez|Ana María/);
});
