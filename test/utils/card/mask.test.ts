import { maskLastFour } from '../../../src/utils/card/mask';

describe('maskLastFour', () => {
  it('shows only the last four digits', () => {
    expect(maskLastFour('4242')).toBe('•••• 4242');
  });
});
