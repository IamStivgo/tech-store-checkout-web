import { INCLUDED_WEIGHT_KG } from '../../../../config/constants';
import { messages } from '../../../../data/messages.es-CO';
import type { DeliveryQuote } from '../../../../services/api/contract';
import { formatCop } from '../../../../utils/format-currency';

/** Second line of the delivery row: free shipping threshold, special route or extra weight. */
export const deliveryDetail = (delivery: DeliveryQuote): string | undefined => {
  if (delivery.freeShippingApplied) {
    return messages.summary.freeFrom(formatCop(delivery.freeShippingThreshold.amountInCents));
  }
  const extraKg = delivery.billableWeightKg - INCLUDED_WEIGHT_KG;
  const weight =
    extraKg > 0 ? messages.summary.extraKg(delivery.billableWeightKg, extraKg) : undefined;
  if (delivery.zone === 'SPECIAL_ROUTE') {
    return weight ? `${messages.summary.specialRoute} · ${weight}` : messages.summary.specialRoute;
  }
  return weight;
};
