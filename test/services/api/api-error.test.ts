import { toApiError } from '../../../src/services/api/api-error';

describe('toApiError', () => {
  it('keeps the Problem Details of the API', () => {
    expect(
      toApiError({
        status: 422,
        data: {
          type: '/problems/quantity-limit-exceeded',
          title: 'Unprocessable Entity',
          status: 422,
          detail: 'You can buy up to 3 units of this product.',
          instance: '/api/v1/checkout/quote',
          code: 'QUANTITY_LIMIT_EXCEEDED',
          traceId: 'req-1',
          context: { maxUnitsPerOrder: 3 },
        },
      }),
    ).toEqual({
      status: 422,
      code: 'QUANTITY_LIMIT_EXCEEDED',
      detail: 'You can buy up to 3 units of this product.',
      context: { maxUnitsPerOrder: 3 },
      errors: undefined,
    });
  });

  it.each([
    ['a network failure', { status: 'FETCH_ERROR', error: 'TypeError: Failed to fetch' }],
    ['a timeout', { status: 'TIMEOUT_ERROR', error: 'AbortError' }],
  ] as const)('reports %s as NETWORK_ERROR', (_case, error) => {
    expect(toApiError(error)).toEqual({ status: 'NETWORK_ERROR', code: 'NETWORK_ERROR' });
  });

  it('reports a response that is not JSON as an internal error with its status', () => {
    expect(
      toApiError({
        status: 'PARSING_ERROR',
        originalStatus: 502,
        data: '<html>',
        error: 'SyntaxError',
      }),
    ).toEqual({ status: 502, code: 'INTERNAL_ERROR' });
  });

  it('reports JSON that is not Problem Details as an internal error', () => {
    expect(toApiError({ status: 503, data: { message: 'Service Unavailable' } })).toEqual({
      status: 503,
      code: 'INTERNAL_ERROR',
    });
  });

  it('reports custom errors as internal errors', () => {
    expect(toApiError({ status: 'CUSTOM_ERROR', error: 'boom' })).toEqual({
      status: 500,
      code: 'INTERNAL_ERROR',
    });
  });
});
