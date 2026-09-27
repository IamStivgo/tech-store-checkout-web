import { formatCop } from './format-currency';

// Pesos and amount are separated by a non-breaking space, so they never wrap apart.
const NBSP = String.fromCharCode(0xa0);

describe('formatCop', () => {
  it.each([
    [5_090_000, '50.900'],
    [15_000_000, '150.000'],
    [300_000, '3.000'],
    [0, '0'],
  ])('formats %i cents as $ %s', (amountInCents, pesos) => {
    expect(formatCop(amountInCents)).toBe(`$${NBSP}${pesos}`);
  });
});
