import { z } from 'zod';

import { INSTALLMENTS } from '../../../data/installments';
import { LEGAL_ID_TYPES } from '../../../data/legal-id-types';
import { customerSchema } from '../schemas/customer.schema';
import { shippingSchema } from '../schemas/shipping.schema';

import type { CheckoutState } from './checkout.slice';

export const CHECKOUT_STORAGE_KEY = 'checkout:v1';
const SCHEMA_VERSION = 1;
/** An abandoned checkout is forgotten after 30 minutes without changes. */
export const CHECKOUT_TTL_MS = 30 * 60 * 1000;

const draftSchema = z.object({
  customer: z.object({
    fullName: z.string(),
    email: z.string(),
    phone: z.string(),
    legalIdType: z.enum(LEGAL_ID_TYPES),
    legalId: z.string(),
  }),
  shipping: z.object({
    departmentCode: z.string(),
    cityCode: z.string(),
    addressLine1: z.string(),
    addressLine2: z.string(),
    postalCode: z.string(),
    notes: z.string(),
    useCustomerData: z.boolean(),
    recipientName: z.string().optional(),
    recipientPhone: z.string().optional(),
  }),
  installments: z.string(),
});

// Whitelist (frontend design §7): card number, CVC and tokens do not exist in this shape.
const persistedSchema = z.object({
  version: z.literal(SCHEMA_VERSION),
  savedAt: z.number(),
  checkout: z.object({
    productId: z.string().nullable(),
    quantity: z.number().int().min(1),
    step: z.enum(['PRODUCT', 'DETAILS', 'SUMMARY']),
    details: z
      .object({
        customer: customerSchema,
        shipping: shippingSchema,
        installments: z.literal(INSTALLMENTS),
        card: z.object({
          brand: z.enum(['VISA', 'MASTERCARD', 'UNKNOWN']),
          lastFour: z.string().regex(/^\d{4}$/),
        }),
      })
      .nullable(),
    draft: draftSchema.nullable(),
    cardReentryRequired: z.boolean(),
    // Only an id: the payment itself is read again from the API.
    paymentTransactionId: z.uuid().nullable().default(null),
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
