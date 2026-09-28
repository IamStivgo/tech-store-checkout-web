const SUNDAY = 0;
const SATURDAY = 6;
const LOCALE = 'es-CO';

const isWeekend = (date: Date): boolean => date.getDay() === SUNDAY || date.getDay() === SATURDAY;

/** The date `days` business days after `from` (weekends skipped; the purchase day is day 0). */
export const addBusinessDays = (from: Date, days: number): Date => {
  const date = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let remaining = days;
  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    if (!isWeekend(date)) {
      remaining -= 1;
    }
  }
  return date;
};

const weekday = new Intl.DateTimeFormat(LOCALE, { weekday: 'long' });
const month = new Intl.DateTimeFormat(LOCALE, { month: 'long' });

/** `viernes 25 de septiembre`, or `lunes 28` without the month. */
export const formatDay = (date: Date, withMonth = true): string => {
  const day = `${weekday.format(date)} ${date.getDate()}`;
  return withMonth ? `${day} de ${month.format(date)}` : day;
};

export type DeliveryEstimate =
  | { readonly kind: 'single'; readonly day: string }
  | { readonly kind: 'range'; readonly first: string; readonly last: string };

/**
 * Estimated delivery from the purchase date and the business days of the zone. In a range the
 * month is written once when both days share it (copy deck §6.1).
 */
export const deliveryEstimate = (
  from: Date,
  businessDays: { readonly min: number; readonly max: number },
): DeliveryEstimate => {
  const first = addBusinessDays(from, businessDays.min);
  const last = addBusinessDays(from, businessDays.max);
  if (businessDays.min === businessDays.max) {
    return { kind: 'single', day: formatDay(first) };
  }
  const sameMonth = first.getMonth() === last.getMonth();
  return { kind: 'range', first: formatDay(first, !sameMonth), last: formatDay(last) };
};
