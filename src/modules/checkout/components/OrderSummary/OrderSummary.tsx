import { useId } from 'react';

import { PriceBreakdown } from '../../../../components/organisms/PriceBreakdown';
import { VAT_RATE_PERCENT } from '../../../../config/constants';
import { messages } from '../../../../data/messages.es-CO';
import { formatCop } from '../../../../utils/format-currency';
import { includedVat } from '../../../../utils/vat';

import styles from './OrderSummary.module.scss';

export interface OrderPreview {
  readonly quantity: number;
  readonly unitPriceInCents: number;
}

export interface OrderSummaryProps {
  readonly order: OrderPreview;
}

/**
 * Products of the order with the VAT their price includes. A preview calculated in the browser:
 * the quote needs the city, which the buyer types in this same form.
 */
export function OrderSummary({ order: { quantity, unitPriceInCents } }: OrderSummaryProps) {
  const titleId = useId();
  const productAmountInCents = unitPriceInCents * quantity;
  const { baseInCents, vatInCents } = includedVat(productAmountInCents, VAT_RATE_PERCENT);

  return (
    <section aria-labelledby={titleId} className={styles.order}>
      <h3 id={titleId} className={styles.title}>
        {messages.checkout.order.title}
      </h3>
      <PriceBreakdown
        rows={[
          { label: messages.checkout.order.subtotal, amountInCents: baseInCents },
          { label: messages.checkout.order.vat(VAT_RATE_PERCENT), amountInCents: vatInCents },
        ]}
        totalLabel={messages.checkout.order.total}
        totalInCents={productAmountInCents}
        totalDetail={
          quantity > 1
            ? messages.summary.unitPrice(quantity, formatCop(unitPriceInCents))
            : undefined
        }
      />
      <p className={styles.note}>{messages.checkout.order.feesLater}</p>
    </section>
  );
}
