import { z } from 'zod';

import { messages } from '../../../data/messages.es-CO';

import { normalizePhone, optionalText, personNameField, phoneField } from './field-rules';

const { errors } = messages.checkout;

export const MAX_ADDRESS_LENGTH = 120;
export const MAX_NOTES_LENGTH = 200;
const MIN_ADDRESS_LENGTH = 5;
const POSTAL_CODE = /^\d{6}$/;

const recipientSchema = z.discriminatedUnion('useCustomerData', [
  // The customer receives the order: their name and phone are used.
  z.object({ useCustomerData: z.literal(true) }),
  z.object({
    useCustomerData: z.literal(false),
    recipientName: personNameField(),
    recipientPhone: phoneField().transform(normalizePhone),
  }),
]);

export const shippingSchema = z
  .object({
    departmentCode: z.string().regex(/^\d{2}$/, { error: errors.department }),
    cityCode: z.string().regex(/^\d{5}$/, { error: errors.city }),
    addressLine1: z
      .string()
      .trim()
      .min(MIN_ADDRESS_LENGTH, { error: errors.address })
      .max(MAX_ADDRESS_LENGTH, { error: errors.tooLong(MAX_ADDRESS_LENGTH) }),
    addressLine2: optionalText(MAX_ADDRESS_LENGTH),
    postalCode: z
      .string()
      .trim()
      .refine((value) => value === '' || POSTAL_CODE.test(value), { error: errors.postalCode }),
    notes: optionalText(MAX_NOTES_LENGTH),
  })
  .and(recipientSchema);

export type ShippingFormInput = z.input<typeof shippingSchema>;
export type ShippingFormValues = z.output<typeof shippingSchema>;
