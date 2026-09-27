import { render, screen } from '@testing-library/react';

import { AppFooter } from './AppFooter';

describe('AppFooter', () => {
  it('shows the payment notice and the copyright inside the contentinfo landmark', () => {
    render(<AppFooter copyright="© 2026 Tech Store" notice="Pagos en modo de pruebas." />);

    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveTextContent('Pagos en modo de pruebas.');
    expect(footer).toHaveTextContent('© 2026 Tech Store');
  });
});
