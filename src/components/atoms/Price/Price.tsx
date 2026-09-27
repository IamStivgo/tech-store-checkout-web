import { formatCop } from '../../../utils/format-currency';

import styles from './Price.module.scss';

export type PriceSize = 'sm' | 'md' | 'lg' | 'xl';

export interface PriceProps {
  readonly amountInCents: number;
  readonly size?: PriceSize;
  /** Caption shown after the amount, e.g. "IVA incluido". */
  readonly note?: string;
}

export function Price({ amountInCents, size = 'md', note }: PriceProps) {
  return (
    <span className={`${styles.price} ${styles[size]}`}>
      <span className={styles.amount}>{formatCop(amountInCents)}</span>
      {note && <span className={styles.note}>{note}</span>}
    </span>
  );
}
