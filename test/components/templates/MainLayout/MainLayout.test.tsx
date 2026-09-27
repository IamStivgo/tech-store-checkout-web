import { render, screen } from '@testing-library/react';

import { MainLayout } from '../../../../src/components/templates/MainLayout/MainLayout';

const renderLayout = () =>
  render(
    <MainLayout
      brand="Tech Store"
      skipToContentLabel="Saltar al contenido"
      footerCopyright="© 2026 Tech Store"
      footerNotice="Pagos en modo de pruebas."
    >
      <h1>Contenido</h1>
    </MainLayout>,
  );

describe('MainLayout', () => {
  it('renders the header, main content and footer landmarks', () => {
    renderLayout();

    expect(screen.getByRole('banner')).toHaveTextContent('Tech Store');
    expect(screen.getByRole('main')).toContainElement(
      screen.getByRole('heading', { name: 'Contenido' }),
    );
    expect(screen.getByRole('contentinfo')).toHaveTextContent('© 2026 Tech Store');
  });

  it('offers a skip link that targets the main content', () => {
    renderLayout();

    const skipLink = screen.getByRole('link', { name: 'Saltar al contenido' });
    expect(skipLink).toHaveAttribute('href', '#main-content');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
  });
});
