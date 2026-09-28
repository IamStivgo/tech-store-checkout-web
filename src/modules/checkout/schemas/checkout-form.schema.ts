import { z } from 'zod';

import { createCardSchema } from './card.schema';
import { customerSchema } from './customer.schema';
import { shippingSchema } from './shipping.schema';

/** The whole checkout form: one schema per section, validated together on submit. */
export const createCheckoutFormSchema = (now: () => Date) =>
  z.object({
    card: createCardSchema(now),
    customer: customerSchema,
    shipping: shippingSchema,
  });

export type CheckoutFormInput = z.input<ReturnType<typeof createCheckoutFormSchema>>;
export type CheckoutFormValues = z.output<ReturnType<typeof createCheckoutFormSchema>>;
