import type { ProductDetail, ProductSummary } from '../../src/services/api/contract';

import { CATALOG } from './catalog';

const MAX_UNITS_PER_ORDER = 5;

const toDetail = (summary: ProductSummary): ProductDetail => ({
  ...summary,
  description: `${summary.name}: descripción completa del producto.`,
  weightGrams: 300,
  images: [summary.image],
  maxUnitsPerOrder: Math.min(summary.stock.available, MAX_UNITS_PER_ORDER),
});

/** Product details served by GET /api/v1/products/{id}, keyed by id. */
export const PRODUCT_DETAILS: ReadonlyMap<string, ProductDetail> = new Map(
  CATALOG.data.map((summary) => [summary.id, toDetail(summary)]),
);
