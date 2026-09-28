import { generatePath, Link, useParams } from 'react-router';

import { Icon, type IconName } from '../../../../components/atoms/Icon';
import { Spinner } from '../../../../components/atoms/Spinner';
import { Banner } from '../../../../components/molecules/Banner';
import { ROUTES } from '../../../../config/routes';
import { messages } from '../../../../data/messages.es-CO';
import type { ApiError } from '../../../../services/api/api-error';
import type { Transaction, TransactionStatus } from '../../../../services/api/contract';
import { useGetTransactionQuery } from '../../../../services/api/payments.api';
import { deliveryEstimate } from '../../../../utils/date/delivery-dates';
import { formatCop } from '../../../../utils/format-currency';
import { NotFoundPage } from '../../../not-found';

import styles from './PaymentResultPage.module.scss';

/** How often a PENDING payment is asked again (the API suggests Retry-After: 2). */
export const PENDING_POLL_MS = 2000;
const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;

type Outcome = 'pending' | 'approved' | 'declined' | 'closed';

const OUTCOMES: Record<TransactionStatus, Outcome> = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DECLINED: 'declined',
  ERROR: 'declined',
  VOIDED: 'declined',
  CANCELLED: 'closed',
  EXPIRED: 'closed',
};

const ICONS: Record<Exclude<Outcome, 'pending'>, IconName> = {
  approved: 'check-circle',
  declined: 'x-circle',
  closed: 'clock',
};

const isMissing = (error: unknown): boolean => {
  const status = (error as Partial<ApiError>).status;
  return status === HTTP_NOT_FOUND || status === HTTP_BAD_REQUEST;
};

function Details({ transaction }: { readonly transaction: Transaction }) {
  const { product, quantity, amounts, payment, reference, delivery } = transaction;
  const estimate =
    transaction.status === 'APPROVED'
      ? deliveryEstimate(
          new Date(transaction.finalizedAt ?? transaction.createdAt),
          delivery.estimatedBusinessDays,
        )
      : undefined;
  return (
    <dl className={styles.details}>
      <div className={styles.row}>
        <dt>{messages.result.product(product.name, quantity)}</dt>
        <dd />
      </div>
      <div className={styles.row}>
        <dt>{messages.result.reference}</dt>
        <dd>{reference}</dd>
      </div>
      {payment?.cardLastFour && (
        <div className={styles.row}>
          <dt>{messages.result.card(payment.cardBrand ?? '', payment.cardLastFour)}</dt>
          <dd />
        </div>
      )}
      <div className={styles.row}>
        <dt>
          {transaction.status === 'APPROVED'
            ? messages.result.total
            : messages.result.totalNotCharged}
        </dt>
        <dd className={styles.total}>{formatCop(amounts.total.amountInCents)}</dd>
      </div>
      {estimate && (
        <div className={styles.row}>
          <dt>
            <Icon name="truck" size={20} />
          </dt>
          <dd>
            {estimate.kind === 'single'
              ? messages.summary.etaSingle(estimate.day)
              : messages.summary.etaRange(estimate.first, estimate.last)}
          </dd>
        </div>
      )}
    </dl>
  );
}

/** Final step of the checkout: the payment status, asked again while it is PENDING. */
export function PaymentResultPage() {
  const { transactionId = '' } = useParams();
  const {
    data: transaction,
    error,
    refetch,
  } = useGetTransactionQuery(transactionId, {
    pollingInterval: 0,
  });
  const outcome = transaction ? OUTCOMES[transaction.status] : undefined;
  // Polling only while the provider has not answered.
  useGetTransactionQuery(transactionId, {
    skip: outcome !== 'pending',
    pollingInterval: PENDING_POLL_MS,
  });

  if (error && isMissing(error)) {
    return <NotFoundPage />;
  }

  return (
    <section className={styles.page} aria-labelledby="result-title" aria-live="polite">
      {error && !transaction && (
        <Banner
          variant="danger"
          action={{
            label: messages.common.retry,
            onClick: () => {
              void refetch();
            },
          }}
        >
          {messages.result.error}
        </Banner>
      )}
      {!error && (!transaction || outcome === 'pending') && (
        <>
          <Spinner size={48} />
          <h1 id="result-title" className={styles.title}>
            {messages.result.pending.title}
          </h1>
          <p className={styles.body}>{messages.result.pending.body}</p>
        </>
      )}
      {transaction && outcome && outcome !== 'pending' && (
        <>
          <Icon name={ICONS[outcome]} size={48} className={styles[outcome]} />
          <h1 id="result-title" className={styles.title}>
            {messages.result[outcome].title}
          </h1>
          <p className={styles.body}>
            {outcome === 'approved'
              ? messages.result.approved.body(transaction.reference)
              : (transaction.payment?.statusMessage ?? messages.result[outcome].body)}
          </p>
          <Details transaction={transaction} />
          <div className={styles.actions}>
            {outcome !== 'approved' && (
              <Link
                className={styles.primary}
                to={generatePath(ROUTES.product, { productId: transaction.product.id })}
              >
                {messages.result.tryAgain}
              </Link>
            )}
            <Link to={ROUTES.home}>{messages.common.goToStore}</Link>
          </div>
        </>
      )}
    </section>
  );
}
