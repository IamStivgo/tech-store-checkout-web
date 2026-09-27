import { baseApi } from './base-api';
import type { ProductDetail, ProductList, ProductStock } from './contract';

export const productsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // `void` is RTK Query's documented argument type for a query called without arguments.
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    listProducts: build.query<ProductList, void>({
      query: () => 'products',
      providesTags: (result) => [
        { type: 'Product', id: 'LIST' },
        ...(result?.data.map(({ id }) => ({ type: 'Product' as const, id })) ?? []),
      ],
    }),
    getProduct: build.query<ProductDetail, string>({
      query: (productId) => `products/${encodeURIComponent(productId)}`,
      providesTags: (_result, _error, productId) => [{ type: 'Product', id: productId }],
    }),
    // Stock changes with every purchase, so it is never cached for long.
    getProductStock: build.query<ProductStock, string>({
      query: (productId) => `products/${encodeURIComponent(productId)}/stock`,
      providesTags: (_result, _error, productId) => [{ type: 'ProductStock', id: productId }],
      keepUnusedDataFor: 0,
    }),
  }),
});

export const { useListProductsQuery, useGetProductQuery, useGetProductStockQuery } = productsApi;
