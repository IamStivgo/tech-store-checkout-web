import type { Ref, SelectHTMLAttributes } from 'react';

import { Icon } from '../Icon';

import styles from './Select.module.scss';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  readonly invalid?: boolean;
  readonly ref?: Ref<HTMLSelectElement>;
}

/** Native select (best on mobile) styled like the text fields, with a chevron. */
export function Select({ invalid = false, children, ...rest }: SelectProps) {
  return (
    <span className={styles.wrapper}>
      <select
        {...rest}
        className={invalid ? `${styles.select} ${styles.invalid}` : styles.select}
        aria-invalid={invalid || undefined}
      >
        {children}
      </select>
      <span className={styles.chevron}>
        <Icon name="chevron-down" size={20} />
      </span>
    </span>
  );
}
