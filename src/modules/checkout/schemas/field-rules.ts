import { z } from 'zod';

import { messages } from '../../../data/messages.es-CO';

const { errors } = messages.checkout;

const COUNTRY_CODE = '+57';
// Same rules as the API (customers), so most mistakes are caught before any request.
const NATIONAL_PHONE = /^(?:3\d{9}|60\d{8})$/;
const PERSON_NAME = /^[\p{L}\p{M}' .-]+$/u;
const LETTER = /\p{L}/u;
const MIN_NAME_WORDS = 2;

/** `+57 300 123 4567` → `3001234567`. */
export const normalizePhone = (value: string): string => {
  const compact = value.replace(/[\s-]/g, '');
  return compact.startsWith(COUNTRY_CODE) ? compact.slice(COUNTRY_CODE.length) : compact;
};

export const phoneField = (message: string = errors.phone) =>
  z.string().refine((value) => NATIONAL_PHONE.test(normalizePhone(value)), { error: message });

const collapseSpaces = (value: string): string => value.trim().replace(/\s+/g, ' ');

/** First and last name: 3–80 characters, letters, apostrophes, hyphens and dots. */
export const personNameField = (message: string = errors.fullName) =>
  z
    .string()
    .transform(collapseSpaces)
    .refine(
      (value) =>
        value.length >= 3 &&
        value.length <= 80 &&
        PERSON_NAME.test(value) &&
        value.split(' ').filter((word) => LETTER.test(word)).length >= MIN_NAME_WORDS,
      { error: message },
    );

export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { error: errors.tooLong(max) });
