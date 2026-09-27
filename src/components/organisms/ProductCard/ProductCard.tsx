import { Link } from 'react-router';

import { Price } from '../../atoms/Price';
import { StockBadge, type StockStatus } from '../../molecules/StockBadge';

import styles from './ProductCard.module.scss';

export interface ProductImageSource {
  readonly type: string;
  readonly srcSet: string;
}

export interface ProductCardImage {
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly sources: readonly ProductImageSource[];
}

export interface ProductCardProps {
  readonly href: string;
  readonly name: string;
  readonly priceInCents: number;
  readonly image: ProductCardImage;
  readonly stockStatus: StockStatus;
  /** Text from the copy deck, e.g. "30 disponibles", "Últimas 3" or "Agotado". */
  readonly stockLabel: string;
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
}: ProductCardProps) {
  const soldOut = stockStatus === 'OUT_OF_STOCK';

  return (
    <Link to={href} className={`${styles.card} ${soldOut ? styles.soldOut : ''}`}>
      <picture className={styles.media}>
        {image.sources.map(({ type, srcSet }) => (
          <source key={type} type={type} srcSet={srcSet} sizes={IMAGE_SIZES} />
        ))}
        <img
          className={styles.image}
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading="lazy"
          decoding="async"
        />
      </picture>
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
