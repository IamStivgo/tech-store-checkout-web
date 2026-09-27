import type { InputHTMLAttributes, Ref } from 'react';

import styles from './Checkbox.module.scss';

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className' | 'type'
> {
  readonly invalid?: boolean;
  readonly ref?: Ref<HTMLInputElement>;
}

/** 24 px box inside a 44 px touch target. */
export function Checkbox({ invalid = false, ...rest }: CheckboxProps) {
  return (
    <span className={styles.target}>
      <input
        {...rest}
        type="checkbox"
        className={invalid ? `${styles.checkbox} ${styles.invalid}` : styles.checkbox}
        aria-invalid={invalid || undefined}
      />
    </span>
  );
}
