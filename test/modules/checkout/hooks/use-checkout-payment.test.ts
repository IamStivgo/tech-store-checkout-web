import { toShippingAddress } from '../../../../src/modules/checkout/hooks/use-checkout-payment';

const customer = {
  fullName: 'Ana María Gómez',
  email: 'ana@example.com',
  phone: '3001234567',
  legalIdType: 'CC' as const,
  legalId: '1020304050',
};

const address = {
  departmentCode: '05',
  cityCode: '05001',
  addressLine1: 'Carrera 43A # 1-50',
  addressLine2: '',
  postalCode: '',
  notes: '',
};

describe('toShippingAddress', () => {
  it('delivers to the customer and leaves out the empty optional fields', () => {
    expect(toShippingAddress(customer, { ...address, useCustomerData: true })).toEqual({
      recipientName: 'Ana María Gómez',
      phone: '3001234567',
      addressLine1: 'Carrera 43A # 1-50',
      departmentCode: '05',
      cityCode: '05001',
    });
  });

  it('delivers to another recipient with the optional fields typed', () => {
    expect(
      toShippingAddress(customer, {
        ...address,
        addressLine2: 'Apto 501',
        postalCode: '050021',
        notes: 'Portería 24 horas',
        useCustomerData: false,
        recipientName: 'Luis Pérez',
        recipientPhone: '3109876543',
      }),
    ).toEqual({
      recipientName: 'Luis Pérez',
      phone: '3109876543',
      addressLine1: 'Carrera 43A # 1-50',
      addressLine2: 'Apto 501',
      postalCode: '050021',
      notes: 'Portería 24 horas',
      departmentCode: '05',
      cityCode: '05001',
    });
  });
});
