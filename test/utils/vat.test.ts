import { includedVat } from '../../src/utils/vat';

const VAT_RATE_PERCENT = 19;

describe('includedVat', () => {
  it.each([
    [3_990_000, 3_352_900, 637_100],
    [11_990_000, 10_075_600, 1_914_400],
    [23_980_000, 20_151_300, 3_828_700],
    [14_990_000, 12_596_600, 2_393_400],
  ])('splits %i cents into its base and its VAT', (amount, baseInCents, vatInCents) => {
    expect(includedVat(amount, VAT_RATE_PERCENT)).toEqual({ baseInCents, vatInCents });
  });

  it.each([1_990_000, 3_990_001, 99_999_900])('always adds up to the amount (%i)', (amount) => {
    const { baseInCents, vatInCents } = includedVat(amount, VAT_RATE_PERCENT);

    expect(baseInCents + vatInCents).toBe(amount);
  });

  it('has no VAT for a zero amount or a zero rate', () => {
    expect(includedVat(0, VAT_RATE_PERCENT)).toEqual({ baseInCents: 0, vatInCents: 0 });
    expect(includedVat(3_990_000, 0)).toEqual({ baseInCents: 3_990_000, vatInCents: 0 });
  });
});
