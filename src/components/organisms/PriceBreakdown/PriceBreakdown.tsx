import { formatCop } from '../../../utils/format-currency';

import styles from './PriceBreakdown.module.scss';

export interface PriceBreakdownRow {
  readonly label: string;
  /** Second line under the label, e.g. "2 × $ 119.900" or "4 kg (1 kg adicional)". */
  readonly detail?: string;
  readonly amountInCents: number;
  /** Replaces the amount, e.g. "Gratis", shown highlighted. */
  readonly valueText?: string;
}

export interface PriceBreakdownProps {
  readonly rows: readonly PriceBreakdownRow[];
  readonly totalLabel: string;
  readonly totalInCents: number;
  /** Second line under the total label, e.g. "2 × $ 119.900". */
  readonly totalDetail?: string;
}

/** Charges of the order and their total, with the amounts aligned and in tabular numbers. */
export function PriceBreakdown({
  rows,
  totalLabel,
  totalInCents,
  totalDetail,
}: PriceBreakdownProps) {
  return (
    <dl className={styles.breakdown}>
      {rows.map(({ label, detail, amountInCents, valueText }) => (
        <div key={label} className={styles.row}>
          <dt className={styles.label}>
            {label}
            {detail && <span className={styles.detail}>{detail}</span>}
          </dt>
          <dd className={valueText ? `${styles.amount} ${styles.highlight}` : styles.amount}>
            {valueText ?? formatCop(amountInCents)}
          </dd>
        </div>
      ))}
      <div className={`${styles.row} ${styles.total}`}>
        <dt className={styles.label}>
          {totalLabel}
          {totalDetail && <span className={styles.detail}>{totalDetail}</span>}
        </dt>
        <dd className={styles.amount}>{formatCop(totalInCents)}</dd>
      </div>
    </dl>
  );
}
