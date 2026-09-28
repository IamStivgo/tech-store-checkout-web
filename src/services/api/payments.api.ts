import { baseApi } from './base-api';
import type {
  AcceptanceTokens,
  CreateCustomerRequest,
  CreateTransactionRequest,
  Customer,
  PayTransactionRequest,
  Transaction,
} from './contract';

/** A request the API replays safely when retried with the same key (Idempotency-Key). */
export interface IdempotentRequest<Body> {
  readonly idempotencyKey: string;
  readonly body: Body;
}

export interface PayTransactionArgs extends IdempotentRequest<PayTransactionRequest> {
  readonly transactionId: string;
}

const idempotent = <Body>(url: string, { idempotencyKey, body }: IdempotentRequest<Body>) => ({
  url,
  method: 'POST',
  headers: { 'Idempotency-Key': idempotencyKey },
  body,
});

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createCustomer: build.mutation<Customer, IdempotentRequest<CreateCustomerRequest>>({
      query: (request) => idempotent('customers', request),
    }),
    createTransaction: build.mutation<Transaction, IdempotentRequest<CreateTransactionRequest>>({
      query: (request) => idempotent('transactions', request),
    }),
    // Single-use tokens: never reused between payment attempts.
    getAcceptanceTokens: build.query<AcceptanceTokens, undefined>({
      query: () => 'payments/acceptance-tokens',
      providesTags: ['AcceptanceTokens'],
      keepUnusedDataFor: 0,
    }),
    // Answers 200 with a final status or 202 while the payment is still PENDING.
    payTransaction: build.mutation<Transaction, PayTransactionArgs>({
      query: ({ transactionId, ...request }) =>
        idempotent(`transactions/${transactionId}/payment`, request),
      invalidatesTags: (_result, _error, { transactionId }) => [
        { type: 'Transaction', id: transactionId },
        'AcceptanceTokens',
        'Product',
        'ProductStock',
      ],
    }),
    getTransaction: build.query<Transaction, string>({
      query: (transactionId) => `transactions/${transactionId}`,
      providesTags: (_result, _error, transactionId) => [
        { type: 'Transaction', id: transactionId },
      ],
      keepUnusedDataFor: 0,
    }),
  }),
});

export const {
  useCreateCustomerMutation,
  useCreateTransactionMutation,
  useGetAcceptanceTokensQuery,
  usePayTransactionMutation,
  useGetTransactionQuery,
} = paymentsApi;
