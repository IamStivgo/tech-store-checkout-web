import { customerSchema } from '../../../../src/modules/checkout/schemas/customer.schema';

import { aCheckoutForm } from './test-form-data';

const customer = (overrides: Record<string, string> = {}) => ({
  ...aCheckoutForm().customer,
  ...overrides,
});
const errorsOf = (overrides: Record<string, string>) =>
  customerSchema
    .safeParse(customer(overrides))
    .error?.issues.map(({ path, message }) => [path.join('.'), message]);

describe('customer schema', () => {
  it('normalizes the data like the API does', () => {
    expect(
      customerSchema.parse(
        customer({
          fullName: '  Ana   María Gómez ',
          email: ' Ana.Gomez@Example.com ',
          phone: '+57 300-123-4567',
          legalId: '1.020.304.050',
        }),
      ),
    ).toEqual({
      fullName: 'Ana María Gómez',
      email: 'ana.gomez@example.com',
      phone: '3001234567',
      legalIdType: 'CC',
      legalId: '1020304050',
    });
  });

  it.each([
    [{ fullName: 'Ana' }, 'fullName', 'Ingresa nombre y apellido'],
    [{ fullName: 'Ana G0mez' }, 'fullName', 'Ingresa nombre y apellido'],
    [{ email: 'ana@' }, 'email', 'Ingresa un email válido'],
    [{ phone: '2001234567' }, 'phone', 'Ingresa un celular o fijo colombiano válido'],
    [{ legalIdType: 'TI' }, 'legalIdType', 'Selecciona el tipo de documento'],
    [{ legalId: '1234' }, 'legalId', 'Número de documento inválido'],
    [{ legalIdType: 'NIT', legalId: '12345' }, 'legalId', 'Número de documento inválido'],
  ])('rejects %j', (overrides, field, message) => {
    expect(errorsOf(overrides)).toEqual([[field, message]]);
  });

  it.each([
    ['CE', 'e12345'],
    ['NIT', '900123456-7'],
    ['PP', 'ab1234567'],
  ])('accepts a %s number like %s', (legalIdType, legalId) => {
    expect(customerSchema.safeParse(customer({ legalIdType, legalId })).success).toBe(true);
  });
});
