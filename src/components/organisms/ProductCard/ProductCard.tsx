import { Link } from 'react-router';

import { Price } from '../../atoms/Price';
import { ResponsiveImage, type ResponsiveImageData } from '../../atoms/ResponsiveImage';
import { StockBadge, type StockStatus } from '../../molecules/StockBadge';

import styles from './ProductCard.module.scss';

export interface ProductCardProps {
  readonly href: string;
  readonly name: string;
  readonly priceInCents: number;
  readonly image: ResponsiveImageData;
  readonly stockStatus: StockStatus;
  /** Text from the copy deck, e.g. "30 disponibles", "Últimas 3" or "Agotado". */
  readonly stockLabel: string;
  /** First cards of the grid: their image is the largest element of the page (LCP). */
  readonly priority?: boolean;
}

// Rendered width of the card image for each grid layout (1/2/3/4 columns, 1200 px container).
const IMAGE_SIZES =
  '(min-width: 1440px) 300px, (min-width: 1024px) 25vw, (min-width: 600px) 33vw, (min-width: 360px) 50vw, 100vw';

/** The whole card is a link; sold-out products still open their detail. */
export function ProductCard({
  href,
  name,
  priceInCents,
  image,
  stockStatus,
  stockLabel,
  priority = false,
}: ProductCardProps) {
  const soldOut = stockStatus === 'OUT_OF_STOCK';

  return (
    <Link to={href} className={`${styles.card} ${soldOut ? styles.soldOut : ''}`}>
      <ResponsiveImage
        image={image}
        sizes={IMAGE_SIZES}
        priority={priority}
        className={styles.media}
      />
      <div className={styles.body}>
        <h2 className={styles.name}>{name}</h2>
        <Price amountInCents={priceInCents} size="lg" />
        <span className={styles.stock}>
          <StockBadge status={stockStatus} label={stockLabel} />
        </span>
      </div>
    </Link>
  );
}
