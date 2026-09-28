import type { CheckoutFormInput } from '../../../../src/modules/checkout/schemas/checkout-form.schema';

/** Valid form data from the mockups (copy deck §7.2 and §7.4). */
export const aCheckoutForm = (): CheckoutFormInput => ({
  card: {
    number: '4242 4242 4242 4242',
    holder: 'Ana María Gómez',
    expiry: '12/28',
    cvc: '123',
    installments: '1',
  },
  customer: {
    fullName: 'Ana María Gómez',
    email: 'ana.gomez@example.com',
    phone: '300 123 4567',
    legalIdType: 'CC',
    legalId: '1020304050',
  },
  shipping: {
    departmentCode: '11',
    cityCode: '11001',
    addressLine1: 'Calle 100 # 10-20',
    addressLine2: 'Apto 501, Torre 2',
    postalCode: '',
    notes: '',
    useCustomerData: true,
  },
});
