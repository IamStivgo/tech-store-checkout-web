import type { LabelHTMLAttributes } from 'react';

import styles from './Label.module.scss';

export interface LabelProps extends Omit<
  LabelHTMLAttributes<HTMLLabelElement>,
  'className' | 'htmlFor'
> {
  /** Id of the control it names; required so no label is left unassociated. */
  readonly htmlFor: string;
}

export function Label({ htmlFor, children, ...rest }: LabelProps) {
  return (
    <label {...rest} htmlFor={htmlFor} className={styles.label}>
      {children}
    </label>
  );
}
