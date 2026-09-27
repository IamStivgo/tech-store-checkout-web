import styles from './Spinner.module.scss';

export type SpinnerSize = 20 | 48;

export interface SpinnerProps {
  readonly size?: SpinnerSize;
  /** Announced to assistive technology; omit it when the surrounding text already says it. */
  readonly label?: string;
}

export function Spinner({ size = 20, label }: SpinnerProps) {
  return (
    <span className={styles.spinner} {...(label ? { role: 'status' } : {})}>
      <svg
        className={size === 48 ? styles.large : styles.small}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <circle className={styles.track} cx="12" cy="12" r="9.5" />
        <path className={styles.arc} d="M21.5 12A9.5 9.5 0 0 0 12 2.5" />
      </svg>
      {label && <span className={styles.label}>{label}</span>}
    </span>
  );
}
