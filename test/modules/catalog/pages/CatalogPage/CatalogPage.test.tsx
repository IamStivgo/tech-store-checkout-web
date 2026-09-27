import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';

import { CatalogPage } from '../../../../../src/modules/catalog/pages/CatalogPage/CatalogPage';
import { createAppStore } from '../../../../../src/store/store';
import { aProductSummary } from '../../../../builders/product.builder';
import { stubFetch } from '../../../../services/api/fetch-stub';

const renderCatalog = () =>
  render(
    <Provider store={createAppStore()}>
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>
    </Provider>,
  );

const productList = (...products: ReturnType<typeof aProductSummary>[]) => ({
  data: products,
  meta: { count: products.length },
});

describe('CatalogPage', () => {
  let fetchStub: ReturnType<typeof stubFetch>;

  beforeEach(() => {
    fetchStub = stubFetch();
  });

  afterEach(() => {
    fetchStub.restore();
  });

  it('shows the catalog title and subtitle', async () => {
    fetchStub.respondJson(productList(aProductSummary()));
    renderCatalog();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Accesorios tecnológicos' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Envío a toda Colombia · Paga con tarjeta de crédito'),
    ).toBeInTheDocument();
    expect(await screen.findByRole('link')).toBeInTheDocument();
  });

  it('shows four placeholder cards while the products load', async () => {
    fetchStub.respondJson(productList(aProductSummary()));
    renderCatalog();

    expect(screen.getByRole('list')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getAllByTestId('product-card-skeleton')).toHaveLength(4);
    expect(await screen.findByRole('link')).toBeInTheDocument();
  });

  it('shows every product in the API order with its price and stock text', async () => {
    fetchStub.respondJson(
      productList(
        aProductSummary(),
        aProductSummary({
          id: '5d6e7f8a-9b0c-4d1e-8f2a-3b4c5d6e7f8a',
          name: 'Power bank 20.000 mAh',
          price: { amountInCents: 13_990_000, currency: 'COP' },
          stock: { available: 3, status: 'LOW_STOCK' },
        }),
        aProductSummary({
          id: '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
          name: 'SSD portátil 1 TB (edición limitada)',
          stock: { available: 0, status: 'OUT_OF_STOCK' },
        }),
      ),
    );
    renderCatalog();

    const cards = await screen.findAllByRole('link');
    expect(cards.map((card) => within(card).getByRole('heading').textContent)).toEqual([
      'Cable USB-C a USB-C 2 m (100 W)',
      'Power bank 20.000 mAh',
      'SSD portátil 1 TB (edición limitada)',
    ]);
    expect(cards[0]).toHaveTextContent('$ 39.900');
    expect(cards[0]).toHaveTextContent('30 disponibles');
    expect(cards[1]).toHaveTextContent('$ 139.900');
    expect(cards[1]).toHaveTextContent('Últimas 3');
    expect(cards[2]).toHaveTextContent('Agotado');
    expect(screen.getByRole('list', { name: 'Accesorios tecnológicos' })).not.toHaveAttribute(
      'aria-busy',
    );
  });

  it('links each card to its product page', async () => {
    fetchStub.respondJson(productList(aProductSummary()));
    renderCatalog();

    expect(await screen.findByRole('link')).toHaveAttribute(
      'href',
      '/products/7d094266-0b4e-4789-9522-96e1cd7ffa60',
    );
  });

  it('shows an error with a retry action that loads the products again', async () => {
    fetchStub.failNetwork();
    fetchStub.respondJson(productList(aProductSummary()));
    renderCatalog();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('No pudimos cargar los productos.');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();

    await userEvent.click(within(alert).getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByRole('link')).toHaveTextContent('Cable USB-C a USB-C 2 m (100 W)');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('tells the user when there are no products yet', async () => {
    fetchStub.respondJson(productList());
    renderCatalog();

    expect(
      await screen.findByRole('heading', { level: 2, name: 'Pronto tendremos productos' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Vuelve más tarde.')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
