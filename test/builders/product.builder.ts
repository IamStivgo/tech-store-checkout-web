import type { ProductDetail, ProductSummary } from '../../src/services/api/contract';

/** Catalog item with the contract shape, as the API returns it. */
export const aProductSummary = (overrides: Partial<ProductSummary> = {}): ProductSummary => ({
  id: '7d094266-0b4e-4789-9522-96e1cd7ffa60',
  sku: 'TEC-CBL-USBC',
  name: 'Cable USB-C a USB-C 2 m (100 W)',
  shortDescription: 'Carga rápida de hasta 100 W y transferencia de datos USB 2.0.',
  price: { amountInCents: 3_990_000, currency: 'COP' },
  stock: { available: 30, status: 'IN_STOCK' },
  image: {
    alt: 'Cable USB-C trenzado gris enrollado',
    width: 640,
    height: 640,
    src: '/images/products/tec-cbl-usbc-640.jpg',
    sources: [
      {
        type: 'image/avif',
        srcSet:
          '/images/products/tec-cbl-usbc-320.avif 320w, /images/products/tec-cbl-usbc-640.avif 640w, /images/products/tec-cbl-usbc-960.avif 960w',
      },
    ],
  },
  ...overrides,
});

export const aProductDetail = (overrides: Partial<ProductDetail> = {}): ProductDetail => {
  const summary = aProductSummary();
  return {
    ...summary,
    description: 'Cable trenzado de 2 metros con carga rápida de hasta 100 W.',
    weightGrams: 150,
    images: [summary.image],
    maxUnitsPerOrder: 5,
    ...overrides,
  };
};
