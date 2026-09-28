import { Provider } from 'react-redux';
import { Outlet, type createBrowserRouter, type RouteObject } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { MainLayout } from './components/templates/MainLayout';
import { ROUTES } from './config/routes';
import { messages } from './data/messages.es-CO';
import { CatalogPage } from './modules/catalog';
import { NotFoundPage } from './modules/not-found';
import type { CardTokenizer } from './services/tokenization/card-tokenizer';
import { CardTokenizerContext } from './services/tokenization/card-tokenizer-context';
import { FakeCardTokenizer } from './services/tokenization/fake-card-tokenizer';
import type { AppStore } from './store/store';

export type AppRouter = ReturnType<typeof createBrowserRouter>;

function RootLayout() {
  return (
    <MainLayout
      brand={messages.app.brand}
      skipToContentLabel={messages.app.skipToContent}
      footerCopyright={messages.app.footer.copyright}
      footerNotice={messages.app.footer.payments}
      footerLinks={[{ to: ROUTES.privacy, label: messages.app.footer.privacy }]}
      footerLinksLabel={messages.app.footer.linksLabel}
    >
      <Outlet />
    </MainLayout>
  );
}

export const appRoutes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <CatalogPage /> },
      // The checkout and the result load with their route: the catalog does not wait for them.
      {
        path: ROUTES.product,
        lazy: () =>
          import('./modules/product').then(({ ProductPage }) => ({ Component: ProductPage })),
      },
      {
        path: ROUTES.paymentResult,
        lazy: () =>
          import('./modules/payment-result').then(({ PaymentResultPage }) => ({
            Component: PaymentResultPage,
          })),
      },
      {
        path: ROUTES.privacy,
        lazy: () =>
          import('./modules/privacy').then(({ PrivacyPage }) => ({ Component: PrivacyPage })),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export interface AppProps {
  readonly store: AppStore;
  readonly router: AppRouter;
  /** Turns the card into a provider token in the browser. */
  readonly tokenizer?: CardTokenizer;
}

const defaultTokenizer = new FakeCardTokenizer();

export function App({ store, router, tokenizer = defaultTokenizer }: AppProps) {
  return (
    <Provider store={store}>
      <CardTokenizerContext value={tokenizer}>
        <RouterProvider router={router} />
      </CardTokenizerContext>
    </Provider>
  );
}
