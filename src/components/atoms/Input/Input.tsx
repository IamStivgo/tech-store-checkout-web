import type { InputHTMLAttributes, Ref } from 'react';

import styles from './Input.module.scss';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  readonly invalid?: boolean;
  /** Extra space on the right for an adornment such as the card brand. */
  readonly hasSuffix?: boolean;
  readonly ref?: Ref<HTMLInputElement>;
}

export function Input({ invalid = false, hasSuffix = false, ...rest }: InputProps) {
  const className = [styles.input, invalid && styles.invalid, hasSuffix && styles.withSuffix]
    .filter(Boolean)
    .join(' ');

  return <input {...rest} className={className} aria-invalid={invalid || undefined} />;
}
