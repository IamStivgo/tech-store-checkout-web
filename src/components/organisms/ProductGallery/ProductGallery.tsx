import { ResponsiveImage, type ResponsiveImageData } from '../../atoms/ResponsiveImage';

import styles from './ProductGallery.module.scss';

export interface ProductGalleryProps {
  readonly image: ResponsiveImageData;
}

// Full width on phones and tablets; half of the 1200 px container on desktop.
const IMAGE_SIZES = '(min-width: 1440px) 576px, (min-width: 1024px) 50vw, 100vw';

/** Main product image: it is the largest element of the page, so it loads first. */
export function ProductGallery({ image }: ProductGalleryProps) {
  return (
    <figure className={styles.gallery}>
      <ResponsiveImage image={image} sizes={IMAGE_SIZES} priority className={styles.frame} />
    </figure>
  );
}
