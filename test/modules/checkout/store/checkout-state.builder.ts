import type {
  CheckoutDetails,
  CheckoutState,
} from '../../../../src/modules/checkout/store/checkout.slice';

export const PRODUCT_ID = '7d094266-0b4e-4789-9522-96e1cd7ffa60';

export const DETAILS: CheckoutDetails = {
  customer: {
    fullName: 'Ana María Gómez',
    email: 'ana.gomez@example.com',
    phone: '3001234567',
    legalIdType: 'CC',
    legalId: '1020304050',
  },
  shipping: {
    departmentCode: '11',
    cityCode: '11001',
    addressLine1: 'Calle 100 # 10-20',
    addressLine2: '',
    postalCode: '',
    notes: '',
    useCustomerData: true,
  },
  installments: 3,
  card: { brand: 'VISA', lastFour: '4242' },
};

export const aCheckoutState = (overrides: Partial<CheckoutState> = {}): CheckoutState => ({
  productId: PRODUCT_ID,
  quantity: 2,
  step: 'DETAILS',
  details: null,
  draft: {
    customer: { ...DETAILS.customer, email: 'ana.gomez@' },
    shipping: { ...DETAILS.shipping, cityCode: '' },
    installments: '3',
  },
  cardReentryRequired: false,
  ...overrides,
});
