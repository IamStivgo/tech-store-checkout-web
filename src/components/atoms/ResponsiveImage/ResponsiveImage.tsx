import styles from './ResponsiveImage.module.scss';

export interface ImageSource {
  readonly type: string;
  readonly srcSet: string;
}

export interface ResponsiveImageData {
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly sources: readonly ImageSource[];
}

export interface ResponsiveImageProps {
  readonly image: ResponsiveImageData;
  /** Rendered width per layout, for the browser to pick a file from each `srcSet`. */
  readonly sizes: string;
  /** Above-the-fold images load eagerly with high priority (LCP); the rest lazily. */
  readonly priority?: boolean;
  readonly className?: string;
}

/** `<picture>` with modern formats first and the JPEG fallback, on a placeholder background. */
export function ResponsiveImage({
  image,
  sizes,
  priority = false,
  className,
}: ResponsiveImageProps) {
  return (
    <picture className={`${styles.picture} ${className ?? ''}`}>
      {image.sources.map(({ type, srcSet }) => (
        <source key={type} type={type} srcSet={srcSet} sizes={sizes} />
      ))}
      <img
        className={styles.image}
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
      />
    </picture>
  );
}
