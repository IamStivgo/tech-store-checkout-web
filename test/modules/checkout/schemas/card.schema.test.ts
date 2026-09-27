import { createCardSchema } from '../../../../src/modules/checkout/schemas/card.schema';

import { aCheckoutForm } from './test-form-data';

const schema = createCardSchema(() => new Date(2026, 8, 24));
const card = (overrides: Record<string, string> = {}) => ({
  ...aCheckoutForm().card,
  ...overrides,
});
const errorOf = (overrides: Record<string, string>) =>
  schema
    .safeParse(card(overrides))
    .error?.issues.map(({ path, message }) => [path.join('.'), message]);

describe('card schema', () => {
  it('accepts a valid card and upper-cases the holder', () => {
    expect(schema.parse(card())).toEqual({
      number: '4242 4242 4242 4242',
      holder: 'ANA MARÍA GÓMEZ',
      expiry: '12/28',
      cvc: '123',
      installments: 1,
    });
  });

  it.each([
    [{ number: '4242 4242 4242 4241' }, 'number', 'Número de tarjeta inválido'],
    [{ number: '3782 822463 10005' }, 'number', 'Solo aceptamos VISA y MasterCard'],
    [{ holder: 'Ana' }, 'holder', 'Ingresa el nombre como aparece en la tarjeta'],
    [{ holder: 'Ana María 2' }, 'holder', 'Ingresa el nombre como aparece en la tarjeta'],
    [{ expiry: '13/28' }, 'expiry', 'Fecha inválida'],
    [{ expiry: '08/26' }, 'expiry', 'La tarjeta está vencida'],
    [{ cvc: '12' }, 'cvc', 'CVC inválido'],
    [{ cvc: '1234' }, 'cvc', 'CVC inválido'],
  ])('rejects %j', (overrides, field, message) => {
    expect(errorOf(overrides)).toEqual([[field, message]]);
  });

  it('only accepts the installments the provider offers', () => {
    expect(schema.parse(card({ installments: '36' })).installments).toBe(36);
    expect(schema.safeParse(card({ installments: '5' })).success).toBe(false);
  });
});
