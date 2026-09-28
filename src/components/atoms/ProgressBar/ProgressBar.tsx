import styles from './ProgressBar.module.scss';

export interface ProgressBarProps {
  /** Between 0 and 1. */
  readonly value: number;
  readonly label: string;
}

const PERCENT = 100;

export function ProgressBar({ value, label }: ProgressBarProps) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * PERCENT);

  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={PERCENT}
      aria-valuenow={percent}
    >
      <div className={styles.fill} style={{ width: `${percent}%` }} />
    </div>
  );
}
