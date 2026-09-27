import { render, screen } from '@testing-library/react';

import { Divider } from '../../../../src/components/atoms/Divider/Divider';

describe('Divider', () => {
  it('is a separator', () => {
    render(<Divider />);

    expect(screen.getByRole('separator')).toBeInTheDocument();
  });
});
