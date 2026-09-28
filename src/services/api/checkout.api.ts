import { baseApi } from './base-api';
import type { CheckoutQuote } from './contract';

export interface QuoteRequest {
  readonly productId: string;
  readonly quantity: number;
  readonly cityCode: string;
}

export const checkoutApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // The quote depends on prices and stock that change: it is always requested again.
    getQuote: build.query<CheckoutQuote, QuoteRequest>({
      query: ({ productId, quantity, cityCode }) => ({
        url: 'checkout/quote',
        params: { productId, quantity, cityCode },
      }),
      keepUnusedDataFor: 0,
    }),
  }),
});

export const { useGetQuoteQuery } = checkoutApi;
