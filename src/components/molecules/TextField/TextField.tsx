import { useId, type ReactNode } from 'react';

import { Input, type InputProps } from '../../atoms/Input';
import { Label } from '../../atoms/Label';
import { describedBy, FieldMessages } from '../FieldMessages';

import styles from './TextField.module.scss';

export interface TextFieldProps extends Omit<InputProps, 'invalid' | 'hasSuffix'> {
  readonly label: string;
  readonly hint?: string;
  readonly error?: string;
  /** Adornment inside the field, on the right (e.g. the card brand). */
  readonly suffix?: ReactNode;
  /** Shows "current/max" under the field, e.g. for the cardholder name. */
  readonly characterCount?: { readonly current: number; readonly max: number };
}

export function TextField({
  label,
  hint,
  error,
  suffix,
  characterCount,
  id,
  ...inputProps
}: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const countId = `${fieldId}-count`;
  const describedByIds =
    [describedBy({ fieldId, hint, error }), characterCount && countId].filter(Boolean).join(' ') ||
    undefined;

  return (
    <div className={styles.field}>
      <Label htmlFor={fieldId}>{label}</Label>
      <div className={styles.control}>
        <Input
          {...inputProps}
          id={fieldId}
          invalid={Boolean(error)}
          hasSuffix={Boolean(suffix)}
          aria-describedby={describedByIds}
        />
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </div>
      <FieldMessages fieldId={fieldId} hint={hint} error={error} />
      {characterCount && (
        <p id={countId} className={styles.count}>
          {characterCount.current}/{characterCount.max}
        </p>
      )}
    </div>
  );
}
