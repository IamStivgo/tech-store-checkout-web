import { paymentsApi } from '../../../src/services/api/payments.api';
import { createAppStore } from '../../../src/store/store';
import {
  aTransaction,
  anApprovedTransaction,
  TRANSACTION_ID,
} from '../../builders/transaction.builder';

import { stubFetch } from './fetch-stub';

const KEY = '5b0c1a2e-3d4f-4a5b-8c6d-7e8f9a0b1c2d';

describe('paymentsApi', () => {
  let fetchStub: ReturnType<typeof stubFetch>;

  beforeEach(() => {
    fetchStub = stubFetch();
  });

  afterEach(() => {
    fetchStub.restore();
  });

  it('creates the customer with an Idempotency-Key', async () => {
    const body = {
      fullName: 'Ana María Gómez',
      email: 'ana@example.com',
      phone: '3001234567',
      legalIdType: 'CC' as const,
      legalId: '1020304050',
    };
    fetchStub.respondJson({ id: 'customer-1' }, 201);

    const result = await createAppStore().dispatch(
      paymentsApi.endpoints.createCustomer.initiate({ idempotencyKey: KEY, body }),
    );

    expect(result.data).toEqual({ id: 'customer-1' });
    const request = fetchStub.request(0);
    expect(request.url).toBe('http://localhost/api/v1/customers');
    expect(request.method).toBe('POST');
    expect(request.headers.get('Idempotency-Key')).toBe(KEY);
    expect(await request.json()).toEqual(body);
  });

  it('creates the transaction', async () => {
    fetchStub.respondJson(aTransaction(), 201);

    const result = await createAppStore().dispatch(
      paymentsApi.endpoints.createTransaction.initiate({
        idempotencyKey: KEY,
        body: {
          productId: 'product-1',
          quantity: 1,
          customerId: 'customer-1',
          shippingAddress: {
            recipientName: 'Ana María Gómez',
            phone: '3001234567',
            addressLine1: 'Calle 100 # 10-20',
            departmentCode: '11',
            cityCode: '11001',
          },
        },
      }),
    );

    expect(result.data).toEqual(aTransaction());
    expect(fetchStub.requestUrls()).toEqual(['http://localhost/api/v1/transactions']);
  });

  it('gets fresh acceptance tokens', async () => {
    const tokens = {
      endUserPolicy: { acceptanceToken: 'a.b.c', permalink: 'https://docs.example/terms.pdf' },
      personalDataAuth: { acceptanceToken: 'd.e.f', permalink: 'https://docs.example/data.pdf' },
    };
    fetchStub.respondJson(tokens);

    const result = await createAppStore().dispatch(
      paymentsApi.endpoints.getAcceptanceTokens.initiate(undefined),
    );

    expect(result.data).toEqual(tokens);
    expect(fetchStub.requestUrls()).toEqual(['http://localhost/api/v1/payments/acceptance-tokens']);
  });

  it('pays the transaction and reads it back', async () => {
    const payment = {
      cardToken: 'tok_test_1',
      installments: 1,
      acceptanceToken: 'a.b.c',
      personalDataAuthToken: 'd.e.f',
    };
    fetchStub.respondJson(anApprovedTransaction());
    fetchStub.respondJson(anApprovedTransaction());
    const store = createAppStore();

    const paid = await store.dispatch(
      paymentsApi.endpoints.payTransaction.initiate({
        transactionId: TRANSACTION_ID,
        idempotencyKey: KEY,
        body: payment,
      }),
    );
    const read = await store.dispatch(
      paymentsApi.endpoints.getTransaction.initiate(TRANSACTION_ID),
    );

    expect(paid.data?.status).toBe('APPROVED');
    expect(read.data?.deliveryId).toBe(anApprovedTransaction().deliveryId);
    const payRequest = fetchStub.request(0);
    expect(payRequest.url).toBe(`http://localhost/api/v1/transactions/${TRANSACTION_ID}/payment`);
    expect(payRequest.headers.get('Idempotency-Key')).toBe(KEY);
    expect(await payRequest.json()).toEqual(payment);
    expect(fetchStub.requestUrls()[1]).toBe(
      `http://localhost/api/v1/transactions/${TRANSACTION_ID}`,
    );
  });
});
