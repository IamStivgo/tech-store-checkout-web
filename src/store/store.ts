import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { checkoutSlice } from '../modules/checkout';
import { baseApi } from '../services/api/base-api';

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  [checkoutSlice.reducerPath]: checkoutSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const createAppStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
    preloadedState,
  });

export type AppStore = ReturnType<typeof createAppStore>;
export type AppDispatch = AppStore['dispatch'];
