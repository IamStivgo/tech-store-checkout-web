import {
  checkoutClosed,
  checkoutStarted,
  detailsSubmitted,
  quantitySelected,
  selectCheckoutDetails,
  selectCheckoutProductId,
  selectCheckoutStep,
  selectQuantityFor,
  type CheckoutDetails,
} from '../../../../src/modules/checkout/store/checkout.slice';
import { createAppStore } from '../../../../src/store/store';

const PRODUCT_ID = '7d094266-0b4e-4789-9522-96e1cd7ffa60';
const OTHER_PRODUCT_ID = '5d6e7f8a-9b0c-4d1e-8f2a-3b4c5d6e7f8a';

describe('checkout slice', () => {
  it('starts on the product step with one unit of any product', () => {
    const state = createAppStore().getState();

    expect(selectCheckoutStep(state)).toBe('PRODUCT');
    expect(selectQuantityFor(state, PRODUCT_ID)).toBe(1);
  });

  it('remembers the quantity chosen for a product only', () => {
    const store = createAppStore();

    store.dispatch(quantitySelected({ productId: PRODUCT_ID, quantity: 3 }));

    expect(selectQuantityFor(store.getState(), PRODUCT_ID)).toBe(3);
    expect(selectQuantityFor(store.getState(), OTHER_PRODUCT_ID)).toBe(1);
  });

  it('moves to the details step with the product and quantity to pay', () => {
    const store = createAppStore();

    store.dispatch(checkoutStarted({ productId: PRODUCT_ID, quantity: 2 }));

    expect(selectCheckoutStep(store.getState())).toBe('DETAILS');
    expect(selectQuantityFor(store.getState(), PRODUCT_ID)).toBe(2);
  });

  it('goes back to the product step when the form is closed', () => {
    const store = createAppStore();
    store.dispatch(checkoutStarted({ productId: PRODUCT_ID, quantity: 2 }));

    store.dispatch(checkoutClosed());

    expect(selectCheckoutStep(store.getState())).toBe('PRODUCT');
    expect(selectCheckoutProductId(store.getState())).toBe(PRODUCT_ID);
  });

  it('keeps the submitted details, without card data, and moves to the summary', () => {
    const store = createAppStore();
    const details: CheckoutDetails = {
      customer: {
        fullName: 'Ana María Gómez',
        email: 'ana.gomez@example.com',
        phone: '3001234567',
        legalIdType: 'CC',
        legalId: '1020304050',
      },
      shipping: {
        departmentCode: '11',
        cityCode: '11001',
        addressLine1: 'Calle 100 # 10-20',
        addressLine2: '',
        postalCode: '',
        notes: '',
        useCustomerData: true,
      },
      installments: 1,
      card: { brand: 'VISA', lastFour: '4242' },
    };

    store.dispatch(detailsSubmitted(details));

    expect(selectCheckoutStep(store.getState())).toBe('SUMMARY');
    expect(selectCheckoutDetails(store.getState())).toEqual(details);
  });
});
