// zod/mini: the persisted checkout is read when the app starts, so this stays small.
import * as z from 'zod/mini';

import { INSTALLMENTS } from '../../../data/installments';
import { LEGAL_ID_TYPES } from '../../../data/legal-id-types';

import type { CheckoutState } from './checkout.slice';

export const CHECKOUT_STORAGE_KEY = 'checkout:v1';
const SCHEMA_VERSION = 1;
/** An abandoned checkout is forgotten after 30 minutes without changes. */
export const CHECKOUT_TTL_MS = 30 * 60 * 1000;

const customerSchema = z.object({
  fullName: z.string(),
  email: z.string(),
  phone: z.string(),
  legalIdType: z.enum(LEGAL_ID_TYPES),
  legalId: z.string(),
});

const address = {
  departmentCode: z.string(),
  cityCode: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string(),
  postalCode: z.string(),
  notes: z.string(),
};

const draftSchema = z.object({
  customer: customerSchema,
  shipping: z.object({
    ...address,
    useCustomerData: z.boolean(),
    recipientName: z.optional(z.string()),
    recipientPhone: z.optional(z.string()),
  }),
  installments: z.string(),
});

// The shape of the submitted details; their field rules run again when the form is sent.
const detailsSchema = z.object({
  customer: customerSchema,
  shipping: z.union([
    z.object({ ...address, useCustomerData: z.literal(true) }),
    z.object({
      ...address,
      useCustomerData: z.literal(false),
      recipientName: z.string(),
      recipientPhone: z.string(),
    }),
  ]),
  installments: z.literal(INSTALLMENTS),
  card: z.object({
    brand: z.enum(['VISA', 'MASTERCARD', 'UNKNOWN']),
    lastFour: z.string().check(z.regex(/^\d{4}$/)),
  }),
});

// Whitelist (frontend design §7): card number, CVC and tokens do not exist in this shape.
const persistedSchema = z.object({
  version: z.literal(SCHEMA_VERSION),
  savedAt: z.number(),
  checkout: z.object({
    productId: z.nullable(z.string()),
    quantity: z.int().check(z.minimum(1)),
    step: z.enum(['PRODUCT', 'DETAILS', 'SUMMARY']),
    details: z.nullable(detailsSchema),
    draft: z.nullable(draftSchema),
    cardReentryRequired: z.boolean(),
    // Only an id: the payment itself is read again from the API.
    paymentTransactionId: z._default(z.nullable(z.uuid()), null),
  }),
});

/** Saves the checkout; storage can be full or blocked (private mode), which is not an error. */
export const saveCheckout = (storage: Storage, checkout: CheckoutState, now: Date): void => {
  const { productId, quantity, step, details, draft, cardReentryRequired, paymentTransactionId } =
    checkout;
  try {
    storage.setItem(
      CHECKOUT_STORAGE_KEY,
      JSON.stringify({
        version: SCHEMA_VERSION,
        savedAt: now.getTime(),
        checkout: {
          productId,
          quantity,
          step,
          details,
          draft,
          cardReentryRequired,
          paymentTransactionId,
        },
      }),
    );
  } catch {
    // Without storage the checkout still works; it is only lost on reload.
  }
};

/** The saved checkout, or undefined when it is missing, expired, corrupt or of another version. */
export const loadCheckout = (storage: Storage, now: Date): CheckoutState | undefined => {
  try {
    const raw = storage.getItem(CHECKOUT_STORAGE_KEY);
    const parsed = persistedSchema.safeParse(raw ? JSON.parse(raw) : undefined);
    if (parsed.success && now.getTime() - parsed.data.savedAt < CHECKOUT_TTL_MS) {
      return parsed.data.checkout;
    }
    storage.removeItem(CHECKOUT_STORAGE_KEY);
    return undefined;
  } catch {
    return undefined;
  }
};
