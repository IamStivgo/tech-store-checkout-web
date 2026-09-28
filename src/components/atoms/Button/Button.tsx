import type { ButtonHTMLAttributes } from 'react';

import { Icon, type IconName } from '../Icon';
import { Spinner } from '../Spinner';

import styles from './Button.module.scss';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'inverse';
export type ButtonSize = 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly fullWidth?: boolean;
  readonly icon?: IconName;
  /** Shows a spinner, blocks clicks and replaces the text with `loadingText`. */
  readonly loading?: boolean;
  readonly loadingText?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  loading = false,
  loadingText,
  type = 'button',
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const className = [styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      {...rest}
      type={type}
      className={className}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
    >
      {loading ? <Spinner /> : icon && <Icon name={icon} size={20} />}
      <span>{loading && loadingText ? loadingText : children}</span>
    </button>
  );
}
