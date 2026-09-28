import { shippingSchema } from '../../../../src/modules/checkout/schemas/shipping.schema';

import { aCheckoutForm } from './test-form-data';

const shipping = (overrides: Record<string, unknown> = {}) => ({
  ...aCheckoutForm().shipping,
  ...overrides,
});
const errorsOf = (overrides: Record<string, unknown>) =>
  shippingSchema
    .safeParse(shipping(overrides))
    .error?.issues.map(({ path, message }) => [path.join('.'), message]);

describe('shipping schema', () => {
  it('accepts an address delivered to the customer', () => {
    expect(shippingSchema.parse(shipping({ addressLine1: '  Calle 100 # 10-20 ' }))).toEqual({
      departmentCode: '11',
      cityCode: '11001',
      addressLine1: 'Calle 100 # 10-20',
      addressLine2: 'Apto 501, Torre 2',
      postalCode: '',
      notes: '',
      useCustomerData: true,
    });
  });

  it('asks for the recipient when someone else receives the order', () => {
    expect(errorsOf({ useCustomerData: false, recipientName: '', recipientPhone: '' })).toEqual([
      ['recipientName', 'Ingresa nombre y apellido'],
      ['recipientPhone', 'Ingresa un celular o fijo colombiano válido'],
    ]);
    expect(
      shippingSchema.parse(
        shipping({
          useCustomerData: false,
          recipientName: 'Luis Pérez',
          recipientPhone: '+57 310 000 0000',
        }),
      ),
    ).toMatchObject({ recipientName: 'Luis Pérez', recipientPhone: '3100000000' });
  });

  it.each([
    [{ departmentCode: '' }, 'departmentCode', 'Selecciona un departamento'],
    [{ cityCode: '' }, 'cityCode', 'Selecciona un municipio'],
    [{ addressLine1: 'Cl 1' }, 'addressLine1', 'Ingresa la dirección'],
    [{ addressLine1: 'a'.repeat(121) }, 'addressLine1', 'Máximo 120 caracteres'],
    [{ addressLine2: 'a'.repeat(121) }, 'addressLine2', 'Máximo 120 caracteres'],
    [{ postalCode: '1100' }, 'postalCode', 'Código postal inválido'],
    [{ notes: 'a'.repeat(201) }, 'notes', 'Máximo 200 caracteres'],
  ])('rejects %j', (overrides, field, message) => {
    expect(errorsOf(overrides)).toEqual([[field, message]]);
  });

  it('accepts a six-digit postal code', () => {
    expect(shippingSchema.safeParse(shipping({ postalCode: '110111' })).success).toBe(true);
  });
});
