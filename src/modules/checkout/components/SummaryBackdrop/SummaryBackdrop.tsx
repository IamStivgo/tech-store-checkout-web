import { useState } from 'react';

import { Button } from '../../../../components/atoms/Button';
import { CardBrandIcon } from '../../../../components/atoms/CardBrandIcon';
import { Icon } from '../../../../components/atoms/Icon';
import {
  ResponsiveImage,
  type ResponsiveImageData,
} from '../../../../components/atoms/ResponsiveImage';
import { Skeleton } from '../../../../components/atoms/Skeleton';
import { Banner } from '../../../../components/molecules/Banner';
import { CheckboxField } from '../../../../components/molecules/CheckboxField';
import { Backdrop } from '../../../../components/organisms/Backdrop';
import { PriceBreakdown } from '../../../../components/organisms/PriceBreakdown';
import { installmentsLabel } from '../../../../data/installments';
import { messages } from '../../../../data/messages.es-CO';
import { useGetQuoteQuery } from '../../../../services/api/checkout.api';
import type { AcceptanceTokens, CheckoutQuote } from '../../../../services/api/contract';
import { useListCitiesQuery } from '../../../../services/api/locations.api';
import { useGetAcceptanceTokensQuery } from '../../../../services/api/payments.api';
import { deliveryEstimate } from '../../../../utils/date/delivery-dates';
import { formatCop } from '../../../../utils/format-currency';
import type { CheckoutDetails } from '../../store/checkout.slice';

import { deliveryDetail } from './delivery-detail';
import styles from './SummaryBackdrop.module.scss';

export interface SummaryProduct {
  readonly id: string;
  readonly name: string;
  readonly image: ResponsiveImageData;
}

export interface SummaryBackdropProps {
  readonly open: boolean;
  readonly product: SummaryProduct;
  readonly quantity: number;
  readonly details: CheckoutDetails;
  readonly onEdit: () => void;
  readonly onPay: (quote: CheckoutQuote, acceptance: AcceptanceTokens) => void;
  readonly paying?: boolean;
  /** Shown over the pay button when the payment could not be sent. */
  readonly paymentFailed?: boolean;
  /** Why the last payment attempt failed, shown over the pay button. */
  readonly paymentError?: string;
  /** Purchase date for the delivery estimate (injectable for tests). */
  readonly now?: () => Date;
}

const THUMBNAIL_SIZE = '48px';
const ACCEPTANCES = ['endUserPolicy', 'personalDataAuth'] as const;
type Acceptance = (typeof ACCEPTANCES)[number];
const NOTHING_ACCEPTED: Record<Acceptance, boolean> = {
  endUserPolicy: false,
  personalDataAuth: false,
};

function AcceptanceSection({
  tokens,
  accepted,
  showRequired,
  onChange,
}: {
  readonly tokens: AcceptanceTokens;
  readonly accepted: Record<Acceptance, boolean>;
  readonly showRequired: boolean;
  readonly onChange: (acceptance: Acceptance, checked: boolean) => void;
}) {
  const { acceptance } = messages.summary;
  return (
    <div className={styles.acceptance}>
      {ACCEPTANCES.map((key) => (
        <CheckboxField
          key={key}
          label={acceptance[key]}
          checked={accepted[key]}
          onChange={(event) => {
            onChange(key, event.target.checked);
          }}
          link={{
            href: tokens[key].permalink,
            text: acceptance.read,
            newTabHint: acceptance.newTab,
          }}
          error={showRequired && !accepted[key] ? acceptance.required : undefined}
        />
      ))}
    </div>
  );
}

function Breakdown({ quote, city }: { readonly quote: CheckoutQuote; readonly city: string }) {
  const { quantity, delivery } = quote;
  return (
    <PriceBreakdown
      rows={[
        {
          label: messages.summary.products(quantity),
          detail:
            quantity > 1
              ? messages.summary.unitPrice(quantity, formatCop(quote.unitPrice.amountInCents))
              : undefined,
          amountInCents: quote.productAmount.amountInCents,
        },
        { label: messages.summary.serviceFee, amountInCents: quote.serviceFee.amountInCents },
        {
          label: messages.summary.delivery(city),
          detail: deliveryDetail(delivery),
          amountInCents: quote.deliveryFee.amountInCents,
          valueText: delivery.freeShippingApplied ? messages.summary.free : undefined,
        },
      ]}
      totalLabel={messages.summary.total}
      totalInCents={quote.total.amountInCents}
    />
  );
}

/** Step 3 of the checkout: the charges computed by the API, the card and the delivery date. */
export function SummaryBackdrop({
  open,
  product,
  quantity,
  details,
  onEdit,
  onPay,
  paying = false,
  paymentFailed = false,
  paymentError,
  now = () => new Date(),
}: SummaryBackdropProps) {
  const { departmentCode, cityCode } = details.shipping;
  const quote = useGetQuoteQuery({ productId: product.id, quantity, cityCode }, { skip: !open });
  const cities = useListCitiesQuery(departmentCode, { skip: !open });
  // Single-use: fetched every time the summary opens and after each failed attempt.
  const acceptance = useGetAcceptanceTokensQuery(undefined, { skip: !open });
  const [accepted, setAccepted] = useState(NOTHING_ACCEPTED);
  const [showRequired, setShowRequired] = useState(false);
  const allAccepted = ACCEPTANCES.every((key) => accepted[key]);
  const city = cities.data?.data.find(({ code }) => code === cityCode)?.name ?? '';

  const estimate = quote.data && deliveryEstimate(now(), quote.data.delivery.estimatedBusinessDays);
  const { brand, lastFour } = details.card;

  return (
    <Backdrop
      open={open}
      title={messages.summary.title}
      onDismiss={onEdit}
      back={
        <div className={styles.context}>
          <ResponsiveImage
            image={product.image}
            sizes={THUMBNAIL_SIZE}
            className={styles.thumbnail}
          />
          <div className={styles.contextText}>
            <p className={styles.productLine}>
              {messages.summary.productQuantity(product.name, quantity)}
            </p>
            {city && <p className={styles.shipTo}>{messages.summary.shipTo(city)}</p>}
          </div>
          <Button variant="inverse" onClick={onEdit} disabled={paying}>
            {messages.summary.edit}
          </Button>
        </div>
      }
      footer={
        <div className={styles.footer}>
          {(paymentError ?? paymentFailed) && (
            <Banner variant="danger">{paymentError ?? messages.summary.serviceUnavailable}</Banner>
          )}
          <Button
            size="lg"
            fullWidth
            disabled={!quote.data || !acceptance.data || paying}
            loading={paying}
            loadingText={messages.summary.processing}
            onClick={() => {
              if (!allAccepted) {
                setShowRequired(true);
              } else if (quote.data && acceptance.data) {
                onPay(quote.data, acceptance.data);
              }
            }}
          >
            {messages.summary.pay(quote.data ? formatCop(quote.data.total.amountInCents) : '')}
          </Button>
        </div>
      }
    >
      {quote.isError && (
        <Banner
          variant="danger"
          action={{
            label: messages.common.retry,
            onClick: () => {
              void quote.refetch();
            },
          }}
        >
          {messages.summary.quoteError}
        </Banner>
      )}
      {!quote.data && !quote.isError && (
        <div className={styles.loading} aria-busy="true" data-testid="summary-skeleton">
          <Skeleton variant="text" />
          <Skeleton variant="text" />
          <Skeleton variant="text" width="60%" />
        </div>
      )}
      {quote.data && (
        <div className={styles.summary}>
          <Breakdown quote={quote.data} city={city} />
          <p className={styles.line}>
            <CardBrandIcon brand={brand} label={messages.summary.cardBrand[brand]} size="md" />
            <span>
              {messages.summary.card(
                messages.summary.cardBrand[brand],
                lastFour,
                installmentsLabel(details.installments),
              )}
            </span>
          </p>
          {estimate && (
            <p className={styles.line}>
              <Icon name="truck" size={24} className={styles.truck} />
              <span>
                {estimate.kind === 'single'
                  ? messages.summary.etaSingle(estimate.day)
                  : messages.summary.etaRange(estimate.first, estimate.last)}
              </span>
            </p>
          )}
          {acceptance.isError && (
            <Banner
              variant="danger"
              action={{
                label: messages.common.retry,
                onClick: () => {
                  void acceptance.refetch();
                },
              }}
            >
              {messages.summary.acceptance.error}
            </Banner>
          )}
          {acceptance.data && (
            <AcceptanceSection
              tokens={acceptance.data}
              accepted={accepted}
              showRequired={showRequired}
              onChange={(key, checked) => {
                setAccepted((current) => ({ ...current, [key]: checked }));
              }}
            />
          )}
        </div>
      )}
    </Backdrop>
  );
}
