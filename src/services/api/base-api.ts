import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
} from '@reduxjs/toolkit/query/react';

import { API_BASE_URL } from '../../config/constants';

import { toApiError, type ApiError } from './api-error';

// Absolute URL on the page's own origin: CloudFront serves the SPA and /api/* together.
const rawBaseQuery = fetchBaseQuery({ baseUrl: `${globalThis.location.origin}${API_BASE_URL}` });

/** fetchBaseQuery whose errors are always an ApiError (Problem Details or network). */
const baseQuery: BaseQueryFn<string | FetchArgs, unknown, ApiError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  return result.error ? { error: toApiError(result.error), meta: result.meta } : result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Product', 'ProductStock', 'Transaction', 'AcceptanceTokens'],
  endpoints: () => ({}),
});
