import type { ProductList, ProductSummary } from '../../src/services/api/contract';

const product = (
  id: string,
  sku: string,
  name: string,
  pesos: number,
  stock: ProductSummary['stock'],
): ProductSummary => {
  const slug = sku.toLowerCase();
  return {
    id,
    sku,
    name,
    shortDescription: `${name}.`,
    price: { amountInCents: pesos * 100, currency: 'COP' },
    stock,
    image: {
      alt: name,
      width: 640,
      height: 640,
      src: `/images/products/${slug}-640.jpg`,
      sources: [
        {
          type: 'image/webp',
          srcSet: `/images/products/${slug}-320.webp 320w, /images/products/${slug}-640.webp 640w`,
        },
      ],
    },
  };
};

/** Seed catalog in display order, with the stock states of the mockups. */
export const CATALOG: ProductList = {
  data: [
    product(
      '7d094266-0b4e-4789-9522-96e1cd7ffa60',
      'TEC-CBL-USBC',
      'Cable USB-C a USB-C 2 m (100 W)',
      39_900,
      { available: 30, status: 'IN_STOCK' },
    ),
    product(
      '2f6a0b1c-8d3e-4a5f-9b7c-1e2d3f4a5b6c',
      'TEC-CHG-GAN65',
      'Cargador GaN 65 W de 3 puertos',
      129_900,
      { available: 14, status: 'IN_STOCK' },
    ),
    product(
      '5d6e7f8a-9b0c-4d1e-8f2a-3b4c5d6e7f8a',
      'TEC-PWB-20K',
      'Power bank 20.000 mAh',
      139_900,
      { available: 3, status: 'LOW_STOCK' },
    ),
    product(
      '6a7b8c9d-0e1f-4a2b-9c3d-4e5f6a7b8c9d',
      'TEC-AUD-ANC',
      'Audífonos inalámbricos con cancelación de ruido',
      289_900,
      { available: 8, status: 'IN_STOCK' },
    ),
    product(
      '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
      'TEC-SSD-1TB',
      'SSD portátil 1 TB (edición limitada)',
      459_900,
      { available: 0, status: 'OUT_OF_STOCK' },
    ),
  ],
  meta: { count: 5 },
};
