import { render, screen } from '@testing-library/react';

import { AppHeader } from '../../../../src/components/organisms/AppHeader/AppHeader';

describe('AppHeader', () => {
  it('shows the brand inside the banner landmark', () => {
    render(<AppHeader brand="Tech Store" />);

    expect(screen.getByRole('banner')).toHaveTextContent('Tech Store');
  });
});
