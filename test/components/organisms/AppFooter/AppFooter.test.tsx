import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import { AppFooter } from '../../../../src/components/organisms/AppFooter/AppFooter';

describe('AppFooter', () => {
  it('shows the payment notice and the copyright inside the contentinfo landmark', () => {
    render(<AppFooter copyright="© 2026 Tech Store" notice="Pagos en modo de pruebas." />);

    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveTextContent('Pagos en modo de pruebas.');
    expect(footer).toHaveTextContent('© 2026 Tech Store');
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('links the legal pages in their own navigation', () => {
    render(
      <MemoryRouter>
        <AppFooter
          copyright="© 2026 Tech Store"
          notice="Pagos en modo de pruebas."
          links={[{ to: '/privacidad', label: 'Política de privacidad' }]}
          linksLabel="Información legal"
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('navigation', { name: 'Información legal' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Política de privacidad' })).toHaveAttribute(
      'href',
      '/privacidad',
    );
  });
});
