import { installmentsLabel } from '../../src/data/installments';

describe('installmentsLabel', () => {
  it.each([
    [1, '1 cuota'],
    [3, '3 cuotas'],
    [36, '36 cuotas'],
  ])('names %i installments as %j', (count, label) => {
    expect(installmentsLabel(count)).toBe(label);
  });
});
