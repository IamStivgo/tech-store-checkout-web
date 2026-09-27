import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router';

import { ProductPage } from '../../../../../src/modules/product/pages/ProductPage/ProductPage';
import type { ProductDetail } from '../../../../../src/services/api/contract';
import { createAppStore, type RootState } from '../../../../../src/store/store';
import { aProductDetail } from '../../../../builders/product.builder';
import { stubFetch } from '../../../../services/api/fetch-stub';

const PRODUCT_ID = '7d094266-0b4e-4789-9522-96e1cd7ffa60';

const renderProductPage = (preloadedState?: Partial<RootState>) => {
  const store = createAppStore(preloadedState);
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/products/${PRODUCT_ID}`]}>
        <Routes>
          <Route path="/products/:productId" element={<ProductPage />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
  return store;
};

const lowStock = (): ProductDetail =>
  aProductDetail({ stock: { available: 3, status: 'LOW_STOCK' }, maxUnitsPerOrder: 3 });

const spinbutton = () => screen.getByRole('spinbutton', { name: 'Cantidad' });
const increase = () => screen.getByRole('button', { name: 'Aumentar cantidad' });

describe('ProductPage', () => {
  let fetchStub: ReturnType<typeof stubFetch>;

  beforeEach(() => {
    fetchStub = stubFetch();
  });

  afterEach(() => {
    fetchStub.restore();
  });

  it('shows a placeholder while the product loads', async () => {
    fetchStub.respondJson(aProductDetail());
    renderProductPage();

    expect(screen.getByTestId('product-skeleton')).toHaveAttribute('aria-busy', 'true');
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('shows the product with its price, stock, description, fees and pay button', async () => {
    fetchStub.respondJson(aProductDetail());
    renderProductPage();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Cable USB-C a USB-C 2 m (100 W)' }),
    ).toBeInTheDocument();
    expect(screen.getByText('$ 39.900')).toBeInTheDocument();
    expect(screen.getByText('IVA incluido')).toBeInTheDocument();
    expect(screen.getByText('En stock · 30 unidades')).toBeInTheDocument();
    expect(
      screen.getByText('Cable trenzado de 2 metros con carga rápida de hasta 100 W.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Cable USB-C trenzado gris enrollado' })).toBeVisible();
    expect(spinbutton()).toHaveAccessibleDescription('Máximo 5 por pedido');
    expect(screen.getByRole('status')).toHaveTextContent('Se suman $ 3.000 de tarifa de servicio');
    expect(screen.getByRole('button', { name: 'Pagar con tarjeta de crédito' })).toBeEnabled();
    expect(screen.getByRole('link', { name: 'Tienda' })).toHaveAttribute('href', '/');
    expect(fetchStub.requestUrls()).toEqual([`http://localhost/api/v1/products/${PRODUCT_ID}`]);
  });

  it('limits the quantity to the units the product allows per order', async () => {
    fetchStub.respondJson(lowStock());
    const store = renderProductPage();

    expect(await screen.findByText('Últimas 3 unidades')).toBeInTheDocument();
    await userEvent.click(increase());
    await userEvent.click(increase());

    expect(spinbutton()).toHaveAttribute('aria-valuenow', '3');
    expect(spinbutton()).toHaveAccessibleDescription('Máximo 3 por pedido');
    expect(increase()).toBeDisabled();
    expect(store.getState().checkout).toMatchObject({ productId: PRODUCT_ID, quantity: 3 });
  });

  it('lowers a quantity chosen before when the stock no longer allows it', async () => {
    fetchStub.respondJson(lowStock());
    renderProductPage({ checkout: { productId: PRODUCT_ID, quantity: 5, step: 'PRODUCT' } });

    expect(await screen.findByRole('spinbutton', { name: 'Cantidad' })).toHaveAttribute(
      'aria-valuenow',
      '3',
    );
  });

  it('starts the checkout with the chosen quantity', async () => {
    fetchStub.respondJson(aProductDetail());
    const store = renderProductPage();

    await userEvent.click(await screen.findByRole('button', { name: 'Aumentar cantidad' }));
    await userEvent.click(screen.getByRole('button', { name: 'Pagar con tarjeta de crédito' }));

    expect(store.getState().checkout).toEqual({
      productId: PRODUCT_ID,
      quantity: 2,
      step: 'DETAILS',
    });
  });

  it('blocks the purchase of a sold-out product', async () => {
    fetchStub.respondJson(
      aProductDetail({ stock: { available: 0, status: 'OUT_OF_STOCK' }, maxUnitsPerOrder: 0 }),
    );
    renderProductPage();

    expect(await screen.findByRole('button', { name: 'Agotado' })).toBeDisabled();
    expect(spinbutton()).toHaveAttribute('aria-disabled', 'true');
    expect(spinbutton()).not.toHaveAccessibleDescription();
    expect(screen.getAllByText('Agotado')).toHaveLength(2);
  });

  it.each([
    [404, 'PRODUCT_NOT_FOUND'],
    [400, 'VALIDATION_ERROR'],
  ])('shows the product not found page for a %i answer', async (status, code) => {
    fetchStub.respondJson({ status, code }, status, 'application/problem+json');
    renderProductPage();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Producto no encontrado' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir a la tienda' })).toHaveAttribute('href', '/');
  });

  it('offers to retry when the product cannot be loaded', async () => {
    fetchStub.failNetwork();
    fetchStub.respondJson(aProductDetail());
    renderProductPage();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('No pudimos cargar el producto.');

    await userEvent.click(within(alert).getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Cable USB-C');
  });
});
