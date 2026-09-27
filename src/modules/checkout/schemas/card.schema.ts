import { z } from 'zod';

import { INSTALLMENTS } from '../../../data/installments';
import { messages } from '../../../data/messages.es-CO';
import { validateCardNumber, validateExpiry } from '../../../utils/card';

const { errors } = messages.checkout;

const HOLDER = /^[\p{L}\p{M} ]{5,60}$/u;
const CVC = /^\d{3}$/;

/**
 * Card section. The card data only lives in the form: it is never stored in Redux, persisted or
 * sent to the API (it is tokenized in the browser).
 */
export const createCardSchema = (now: () => Date) =>
  z.object({
    number: z.string().superRefine((value, context) => {
      const check = validateCardNumber(value);
      if (check !== 'VALID') {
        context.addIssue({
          code: 'custom',
          message: check === 'UNSUPPORTED_BRAND' ? errors.unsupportedBrand : errors.cardNumber,
        });
      }
    }),
    holder: z
      .string()
      .trim()
      .regex(HOLDER, { error: errors.holder })
      .transform((value) => value.toUpperCase()),
    expiry: z.string().superRefine((value, context) => {
      const check = validateExpiry(value, now());
      if (check !== 'VALID') {
        context.addIssue({
          code: 'custom',
          message: check === 'EXPIRED' ? errors.expired : errors.expiry,
        });
      }
    }),
    cvc: z.string().regex(CVC, { error: errors.cvc }),
    installments: z.coerce.number().pipe(z.literal(INSTALLMENTS)),
  });

export type CardFormInput = z.input<ReturnType<typeof createCardSchema>>;
export type CardFormValues = z.output<ReturnType<typeof createCardSchema>>;
