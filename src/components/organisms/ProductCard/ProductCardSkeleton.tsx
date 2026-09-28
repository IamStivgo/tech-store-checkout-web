import { Skeleton } from '../../atoms/Skeleton';

import styles from './ProductCard.module.scss';

/** Placeholder with the card's shape: image, two lines of text and the stock pill. */
export function ProductCardSkeleton() {
  return (
    <div className={styles.card} data-testid="product-card-skeleton">
      <div className={styles.media}>
        <Skeleton variant="rect" />
      </div>
      <div className={styles.body}>
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="50%" />
        <span className={styles.stock}>
          <Skeleton variant="text" width="6rem" height="1.5rem" />
        </span>
      </div>
    </div>
  );
}
