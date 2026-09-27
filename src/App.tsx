import { Provider } from 'react-redux';
import { Outlet, type createBrowserRouter, type RouteObject } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { MainLayout } from './components/templates/MainLayout';
import { ROUTES } from './config/routes';
import { messages } from './data/messages.es-CO';
import { CatalogPage } from './modules/catalog';
import { NotFoundPage } from './modules/not-found';
import { ProductPage } from './modules/product';
import type { AppStore } from './store/store';

export type AppRouter = ReturnType<typeof createBrowserRouter>;

function RootLayout() {
  return (
    <MainLayout
      brand={messages.app.brand}
      skipToContentLabel={messages.app.skipToContent}
      footerCopyright={messages.app.footer.copyright}
      footerNotice={messages.app.footer.payments}
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
      { path: ROUTES.product, element: <ProductPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export interface AppProps {
  readonly store: AppStore;
  readonly router: AppRouter;
}

export function App({ store, router }: AppProps) {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}
