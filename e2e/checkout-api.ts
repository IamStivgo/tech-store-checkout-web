import type { Page } from '@playwright/test';

import { CATALOG } from './fixtures/catalog';
import { CITIES, DEPARTMENTS } from './fixtures/locations';
import { ACCEPTANCE, QUOTE, transaction } from './fixtures/payment';
import { PRODUCT_DETAILS } from './fixtures/product';

/** The API of a whole purchase; the payment ends with `result` (the fake tokenizer is used). */
export const serveCheckoutApi = async (page: Page, result: 'APPROVED' | 'DECLINED') => {
  const paymentBodies: unknown[] = [];
  await page.route('**/api/v1/products', (route) => route.fulfill({ json: CATALOG }));
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
