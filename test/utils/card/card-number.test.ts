import {
  cardDigits,
  formatCardNumber,
  validateCardNumber,
} from '../../../src/utils/card/card-number';

describe('cardDigits', () => {
  it('keeps only digits, up to 19', () => {
    expect(cardDigits('4242-4242 4242x4242')).toBe('4242424242424242');
    expect(cardDigits('1'.repeat(25))).toBe('1'.repeat(19));
  });
});

describe('formatCardNumber', () => {
  it.each([
    ['', ''],
    ['4', '4'],
    ['4242', '4242'],
    ['42424', '4242 4'],
    ['4242424242424242', '4242 4242 4242 4242'],
    ['4242 4242-4242x4242', '4242 4242 4242 4242'],
    ['4000056655665556123', '4000 0566 5566 5556 123'],
  ])('formats %j as %j', (value, formatted) => {
    expect(formatCardNumber(value).value).toBe(formatted);
  });

  it('puts the caret at the end when typing at the end', () => {
    expect(formatCardNumber('42424')).toEqual({ value: '4242 4', caret: 6 });
  });

  it('keeps the caret after the same digit when typing in the middle', () => {
    // "4242 4242" with a 9 typed after the second digit: "429|42 4242".
    expect(formatCardNumber('42942 4242', 3)).toEqual({ value: '4294 2424 2', caret: 3 });
    // A digit that becomes the first of a group leaves the caret after the space.
    expect(formatCardNumber('42429 4242', 5)).toEqual({ value: '4242 9424 2', caret: 6 });
  });

  it('keeps the caret at the start', () => {
    expect(formatCardNumber('4242', 0).caret).toBe(0);
  });
});

describe('validateCardNumber', () => {
  it.each([
    '4242424242424242',
    '4242 4242 4242 4242',
    '4222222222222',
    '4000056655665556007',
    '5555555555554444',
    '2223003122003222',
  ])('accepts %s', (value) => {
    expect(validateCardNumber(value)).toBe('VALID');
  });

  it.each([
    ['a failed checksum', '4242424242424241'],
    ['a wrong VISA length', '42424242424242'],
    ['a wrong MasterCard length', '5555555555554'],
    ['letters', '4242abcd42424242'],
    ['nothing', ''],
  ])('rejects %s', (_case, value) => {
    expect(validateCardNumber(value)).toBe('INVALID');
  });

  it.each(['378282246310005', '6011111111111117'])('rejects other brands like %s', (value) => {
    expect(validateCardNumber(value)).toBe('UNSUPPORTED_BRAND');
  });
});
