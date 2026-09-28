import { productsApi } from '../../../src/services/api/products.api';
import { createAppStore } from '../../../src/store/store';
import { aProductDetail, aProductSummary } from '../../builders/product.builder';

import { stubFetch } from './fetch-stub';

describe('productsApi', () => {
  let fetchStub: ReturnType<typeof stubFetch>;

  beforeEach(() => {
    fetchStub = stubFetch();
  });

  afterEach(() => {
    fetchStub.restore();
  });

  it('lists the catalog from /api/v1/products on the same origin', async () => {
    const list = { data: [aProductSummary()], meta: { count: 1 } };
    fetchStub.respondJson(list);

    const result = await createAppStore().dispatch(productsApi.endpoints.listProducts.initiate());

    expect(result.data).toEqual(list);
    expect(fetchStub.requestUrls()).toEqual(['http://localhost/api/v1/products']);
  });

  it('gets a product and its stock by id', async () => {
    const store = createAppStore();
    const product = aProductDetail();
    fetchStub.respondJson(product);
    fetchStub.respondJson({
      productId: product.id,
      available: 29,
      status: 'IN_STOCK',
      updatedAt: '2026-09-24T20:15:00.000Z',
    });

    const detail = await store.dispatch(productsApi.endpoints.getProduct.initiate(product.id));
    const stock = await store.dispatch(productsApi.endpoints.getProductStock.initiate(product.id));

    expect(detail.data).toEqual(product);
    expect(stock.data).toMatchObject({ available: 29 });
    expect(fetchStub.requestUrls()).toEqual([
      `http://localhost/api/v1/products/${product.id}`,
      `http://localhost/api/v1/products/${product.id}/stock`,
    ]);
  });

  it('returns the Problem Details of a failed request as an ApiError', async () => {
    fetchStub.respondJson(
      {
        type: '/problems/product-not-found',
        title: 'Not Found',
        status: 404,
        detail: 'The product does not exist or is no longer available.',
        instance: '/api/v1/products/x',
        code: 'PRODUCT_NOT_FOUND',
        traceId: 'req-1',
      },
      404,
      'application/problem+json',
    );

    const result = await createAppStore().dispatch(
      productsApi.endpoints.getProduct.initiate('00000000-0000-4000-8000-000000000000'),
    );

    expect(result.error).toMatchObject({ status: 404, code: 'PRODUCT_NOT_FOUND' });
  });

  it('reports a lost connection as NETWORK_ERROR', async () => {
    fetchStub.failNetwork();

    const result = await createAppStore().dispatch(productsApi.endpoints.listProducts.initiate());

    expect(result.error).toEqual({ status: 'NETWORK_ERROR', code: 'NETWORK_ERROR' });
  });
});
