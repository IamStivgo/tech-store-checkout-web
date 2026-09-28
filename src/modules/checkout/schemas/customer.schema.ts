import { z } from 'zod';

import { LEGAL_ID_TYPES, type LegalIdType } from '../../../data/legal-id-types';
import { messages } from '../../../data/messages.es-CO';

import { normalizePhone, personNameField, phoneField } from './field-rules';

const { errors } = messages.checkout;

// Same rules as the API; dots and spaces typed in the number are ignored.
const LEGAL_ID_RULES: Readonly<Record<LegalIdType, RegExp>> = {
  CC: /^\d{5,10}$/,
  CE: /^[A-Z0-9]{6,10}$/,
  NIT: /^\d{9}(?:-?\d)?$/,
  PP: /^[A-Z0-9]{6,12}$/,
};

const normalizeLegalId = (value: string): string => value.replace(/[\s.]/g, '').toUpperCase();

export const customerSchema = z
  .object({
    fullName: personNameField(),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email({ error: errors.email })),
    phone: phoneField().transform(normalizePhone),
    legalIdType: z.enum(LEGAL_ID_TYPES, { error: errors.legalIdType }),
    legalId: z.string().transform(normalizeLegalId),
  })
  .superRefine(({ legalIdType, legalId }, context) => {
    if (!LEGAL_ID_RULES[legalIdType].test(legalId)) {
      context.addIssue({ code: 'custom', path: ['legalId'], message: errors.legalId });
    }
  });

export type CustomerFormInput = z.input<typeof customerSchema>;
export type CustomerFormValues = z.output<typeof customerSchema>;
