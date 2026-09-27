import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import type { FieldError, ProblemDetails } from './contract';

export const NETWORK_ERROR = 'NETWORK_ERROR';
const INTERNAL_ERROR = 'INTERNAL_ERROR';
const SERVER_ERROR_STATUS = 500;

/** Every failed request, normalized from the API Problem Details or from the network. */
export interface ApiError {
  /** HTTP status, or NETWORK_ERROR when the request never got a response. */
  readonly status: number | typeof NETWORK_ERROR;
  readonly code: string;
  readonly detail?: string;
  readonly context?: ProblemDetails['context'];
  readonly errors?: readonly FieldError[];
}

const isProblemDetails = (data: unknown): data is ProblemDetails =>
  typeof data === 'object' &&
  data !== null &&
  typeof (data as { code?: unknown }).code === 'string' &&
  typeof (data as { status?: unknown }).status === 'number';

export const toApiError = (error: FetchBaseQueryError): ApiError => {
  if (error.status === 'FETCH_ERROR' || error.status === 'TIMEOUT_ERROR') {
    return { status: NETWORK_ERROR, code: NETWORK_ERROR };
  }
  if (error.status === 'PARSING_ERROR') {
    return { status: error.originalStatus, code: INTERNAL_ERROR };
  }
  if (error.status === 'CUSTOM_ERROR') {
    return { status: SERVER_ERROR_STATUS, code: INTERNAL_ERROR };
  }
  if (isProblemDetails(error.data)) {
    const { code, detail, context, errors } = error.data;
    return { status: error.status, code, detail, context, errors };
  }
  return { status: error.status, code: INTERNAL_ERROR };
};
