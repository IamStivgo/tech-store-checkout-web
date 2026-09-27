import styles from './Skeleton.module.scss';

export type SkeletonVariant = 'rect' | 'text' | 'circle';

export interface SkeletonProps {
  readonly variant?: SkeletonVariant;
  /** CSS length, e.g. "100%" or "8rem". */
  readonly width?: string;
  readonly height?: string;
}

/** Loading placeholder; decorative, so the loading region itself should set aria-busy. */
export function Skeleton({ variant = 'rect', width, height }: SkeletonProps) {
  return (
    <span
      className={`${styles.skeleton} ${styles[variant]}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
