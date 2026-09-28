import { expect, test, type Page } from '@playwright/test';

import { CATALOG } from './fixtures/catalog';

const PRODUCTS_API = '**/api/v1/products';

const serveCatalog = (page: Page) =>
  page.route(PRODUCTS_API, (route) => route.fulfill({ json: CATALOG }));

const columnsOf = (page: Page) =>
  page
    .getByRole('list', { name: 'Accesorios tecnológicos' })
    .evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(' ').length);

// Catalog columns per breakpoint (<360, 360-599, 600-1023 and >=1024 px).
const expectedColumns = (width: number): number => {
  if (width < 360) {
    return 1;
  }
  if (width < 600) {
    return 2;
  }
  return width < 1024 ? 3 : 4;
};

const hasHorizontalOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

test.describe('Catalog', () => {
  test('lists the products with their price and stock without horizontal scroll', async ({
    page,
  }, testInfo) => {
    await serveCatalog(page);

    await page.goto('/');

    const cards = page.getByRole('link').filter({ has: page.getByRole('heading', { level: 2 }) });
    await expect(cards).toHaveCount(CATALOG.data.length);
    await expect(cards.first()).toContainText('Cable USB-C a USB-C 2 m (100 W)');
    await expect(cards.first()).toContainText('$ 39.900');
    await expect(cards.first()).toContainText('30 disponibles');
    await expect(cards.nth(2)).toContainText('Últimas 3');
    await expect(cards.nth(4)).toContainText('Agotado');
    expect(await hasHorizontalOverflow(page)).toBe(false);

    await testInfo.attach('catalog', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  });

  test('uses the number of columns of its breakpoint', async ({ page, viewport }) => {
    await serveCatalog(page);

    await page.goto('/');

    expect(await columnsOf(page)).toBe(expectedColumns(viewport?.width ?? 0));
  });

  test('recovers from a failed load with the retry action', async ({ page }) => {
    let calls = 0;
    await page.route(PRODUCTS_API, (route) => {
      calls += 1;
      return calls === 1 ? route.abort('connectionfailed') : route.fulfill({ json: CATALOG });
    });

    await page.goto('/');
    await expect(page.getByRole('alert')).toContainText('No pudimos cargar los productos.');
    await page.getByRole('button', { name: 'Reintentar' }).click();

    await expect(page.getByRole('link', { name: /Cable USB-C/ })).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
  });
});
