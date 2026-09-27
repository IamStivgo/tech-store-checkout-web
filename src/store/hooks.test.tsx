import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';

import { baseApi } from '../services/api/base-api';

import { useAppDispatch, useAppSelector } from './hooks';
import { createAppStore } from './store';

const withStore = (store = createAppStore()) =>
  function StoreWrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };

describe('typed store hooks', () => {
  it('select from the application state', () => {
    const { result } = renderHook(() => useAppSelector((state) => state[baseApi.reducerPath]), {
      wrapper: withStore(),
    });

    expect(result.current.config.reducerPath).toBe('api');
  });

  it('dispatch to the application store', () => {
    const store = createAppStore();
    const { result } = renderHook(() => useAppDispatch(), { wrapper: withStore(store) });

    expect(result.current).toBe(store.dispatch);
  });
});
