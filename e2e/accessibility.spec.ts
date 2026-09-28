import { createRequire } from 'node:module';

import { expect, test, type Page } from '@playwright/test';

import { serveCheckoutApi } from './checkout-api';
import { fillCheckoutForm } from './checkout-form';
import { CATALOG } from './fixtures/catalog';
import { TRANSACTION_ID } from './fixtures/payment';

const AXE_PATH = createRequire(import.meta.url).resolve('axe-core/axe.min.js');
const CABLE_ID = CATALOG.data[0]?.id ?? '';

interface AxeViolation {
  readonly id: string;
  readonly nodes: readonly { readonly target: readonly string[] }[];
}

/** WCAG 2.2 A and AA rules (color contrast included) on what is on screen now. */
const violations = async (page: Page): Promise<string[]> => {
  await page.addScriptTag({ path: AXE_PATH });
  const found = await page.evaluate(async () => {
    const axe = (
      window as unknown as {
        axe: { run: (options: unknown) => Promise<{ violations: unknown[] }> };
      }
    ).axe;
    const result = await axe.run({
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    });
    return result.violations;
  });
  return (found as AxeViolation[]).map(
    ({ id, nodes }) => `${id}: ${nodes.map(({ target }) => target.join(' ')).join(', ')}`,
  );
};

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`Accessibility (${colorScheme} theme)`, () => {
    test.use({ colorScheme });

    test('every screen of the purchase meets WCAG 2.2 AA', async ({ page }) => {
      await serveCheckoutApi(page, 'APPROVED');

      await page.goto('/');
      await expect(page.getByRole('link', { name: /Cable USB-C/ }).first()).toBeVisible();
      expect(await violations(page), 'catalog').toEqual([]);

      await page.goto(`/products/${CABLE_ID}`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect(await violations(page), 'product').toEqual([]);

      await page.getByRole('button', { name: 'Pagar con tarjeta de crédito' }).click();
      const form = page.getByRole('dialog', { name: 'Pago con tarjeta' });
      await fillCheckoutForm(form);
      expect(await violations(page), 'checkout form').toEqual([]);

      await form.getByRole('button', { name: 'Continuar' }).click();
      const summary = page.getByRole('dialog', { name: 'Resumen de pago' });
      await expect(summary.getByRole('checkbox', { name: /términos y condiciones/ })).toBeVisible();
      expect(await violations(page), 'summary').toEqual([]);

      await summary.getByRole('checkbox', { name: /términos y condiciones/ }).check();
      await summary.getByRole('checkbox', { name: /datos personales/ }).check();
      await summary.getByRole('button', { name: /^Pagar \$/ }).click();
      await expect(page).toHaveURL(`/transactions/${TRANSACTION_ID}`);
      await expect(page.getByRole('heading', { level: 1, name: '¡Pago aprobado!' })).toBeVisible();
      expect(await violations(page), 'result').toEqual([]);

      await page.goto('/privacidad');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect(await violations(page), 'privacy').toEqual([]);
    });

    test('the declined result meets WCAG 2.2 AA', async ({ page }) => {
      await serveCheckoutApi(page, 'DECLINED');

      await page.goto(`/transactions/${TRANSACTION_ID}`);
      await expect(page.getByRole('heading', { level: 1, name: 'Pago rechazado' })).toBeVisible();

      expect(await violations(page)).toEqual([]);
    });
  });
}
