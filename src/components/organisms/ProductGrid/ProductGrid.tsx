import type { ReactNode } from 'react';

import styles from './ProductGrid.module.scss';

export interface ProductGridProps {
  /** One `<li>` per product. */
  readonly children: ReactNode;
  /** Marks the list as loading for assistive technology while it shows skeletons. */
  readonly busy?: boolean;
  readonly label?: string;
}

/** Responsive list of products: 1, 2, 3 or 4 columns from 320, 360, 600 and 1024 px. */
export function ProductGrid({ children, busy = false, label }: ProductGridProps) {
  return (
    <ul className={styles.grid} aria-busy={busy || undefined} aria-label={label}>
      {children}
    </ul>
  );
}
