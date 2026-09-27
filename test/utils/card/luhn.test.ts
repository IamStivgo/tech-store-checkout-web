import { luhnCheck } from '../../../src/utils/card/luhn';

describe('luhnCheck', () => {
  it.each(['4242424242424242', '5555555555554444', '4111111111111111', '79927398713', '0'])(
    'accepts %s',
    (digits) => {
      expect(luhnCheck(digits)).toBe(true);
    },
  );

  it.each(['4242424242424241', '79927398710', '', '4242 4242', '42a2'])('rejects %j', (digits) => {
    expect(luhnCheck(digits)).toBe(false);
  });
});
