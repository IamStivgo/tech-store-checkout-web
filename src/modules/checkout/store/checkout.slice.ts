import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Installments } from '../../../data/installments';
import type { CardBrand } from '../../../utils/card';
import type { CheckoutFormInput } from '../schemas/checkout-form.schema';
import type { CustomerFormValues } from '../schemas/customer.schema';
import type { ShippingFormValues } from '../schemas/shipping.schema';

/** Checkout steps shown as layers over the product page (frontend design §3). */
export type CheckoutStep = 'PRODUCT' | 'DETAILS' | 'SUMMARY';

/** What the summary needs from the form. Never the card number or the CVC. */
export interface CheckoutDetails {
  readonly customer: CustomerFormValues;
  readonly shipping: ShippingFormValues;
  readonly installments: Installments;
  readonly card: { readonly brand: CardBrand; readonly lastFour: string };
}

/** What the buyer has typed so far, to restore the form after a reload. Never the card. */
export interface CheckoutDraft {
  readonly customer: CheckoutFormInput['customer'];
  readonly shipping: {
    readonly departmentCode: string;
    readonly cityCode: string;
    readonly addressLine1: string;
    readonly addressLine2: string;
    readonly postalCode: string;
    readonly notes: string;
    readonly useCustomerData: boolean;
    readonly recipientName?: string;
    readonly recipientPhone?: string;
  };
  readonly installments: string;
}

export interface CheckoutState {
  readonly productId: string | null;
  readonly quantity: number;
  readonly step: CheckoutStep;
  readonly details: CheckoutDetails | null;
  readonly draft: CheckoutDraft | null;
  /** The card data was lost (reload after the form was sent): the buyer types it again. */
  readonly cardReentryRequired: boolean;
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
  details: null,
  draft: null,
  cardReentryRequired: false,
};

/**
 * State after a reload (frontend design §7): the card is never stored, so a checkout that had
 * reached the summary reopens the form and asks for the card again.
 */
export const restoreCheckout = (persisted: CheckoutState): CheckoutState =>
  persisted.step === 'SUMMARY'
    ? { ...persisted, step: 'DETAILS', cardReentryRequired: true }
    : persisted;

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
    checkoutClosed(state) {
      state.step = 'PRODUCT';
    },
    detailsSubmitted(state, { payload }: PayloadAction<CheckoutDetails>) {
      state.details = payload;
      state.step = 'SUMMARY';
      state.cardReentryRequired = false;
    },
    draftSaved(state, { payload }: PayloadAction<CheckoutDraft>) {
      state.draft = payload;
    },
    detailsEdited(state) {
      state.step = 'DETAILS';
    },
    /** The payment was sent: the next purchase starts from scratch. */
    paymentCompleted() {
      return initialState;
    },
  },
  selectors: {
    selectCheckoutStep: (state) => state.step,
    selectCheckoutProductId: (state) => state.productId,
    selectCheckoutDetails: (state) => state.details,
    selectCheckoutDraft: (state) => state.draft,
    selectCardReentryRequired: (state) => state.cardReentryRequired,
    /** The quantity chosen for this product; another product starts again at one unit. */
    selectQuantityFor: (state, productId: string) =>
      state.productId === productId ? state.quantity : DEFAULT_QUANTITY,
  },
});

export const {
  quantitySelected,
  checkoutStarted,
  checkoutClosed,
  detailsSubmitted,
  detailsEdited,
  draftSaved,
  paymentCompleted,
} = checkoutSlice.actions;
export const {
  selectCardReentryRequired,
  selectCheckoutDraft,
  selectCheckoutStep,
  selectCheckoutProductId,
  selectCheckoutDetails,
  selectQuantityFor,
} = checkoutSlice.selectors;
