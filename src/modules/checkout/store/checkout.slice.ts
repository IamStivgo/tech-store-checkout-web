import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/** Checkout steps shown as layers over the product page (frontend design §3). */
export type CheckoutStep = 'PRODUCT' | 'DETAILS';

export interface CheckoutState {
  readonly productId: string | null;
  readonly quantity: number;
  readonly step: CheckoutStep;
}

export interface ProductSelection {
  readonly productId: string;
  readonly quantity: number;
}

const DEFAULT_QUANTITY = 1;

const initialState: CheckoutState = {
  productId: null,
  quantity: DEFAULT_QUANTITY,
  step: 'PRODUCT',
};

export const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    quantitySelected(state, { payload }: PayloadAction<ProductSelection>) {
      state.productId = payload.productId;
      state.quantity = payload.quantity;
    },
    checkoutStarted(state, { payload }: PayloadAction<ProductSelection>) {
      state.productId = payload.productId;
      state.quantity = payload.quantity;
      state.step = 'DETAILS';
    },
  },
  selectors: {
    selectCheckoutStep: (state) => state.step,
    /** The quantity chosen for this product; another product starts again at one unit. */
    selectQuantityFor: (state, productId: string) =>
      state.productId === productId ? state.quantity : DEFAULT_QUANTITY,
  },
});

export const { quantitySelected, checkoutStarted } = checkoutSlice.actions;
export const { selectCheckoutStep, selectQuantityFor } = checkoutSlice.selectors;
