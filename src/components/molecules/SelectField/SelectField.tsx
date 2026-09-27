import { useId } from 'react';

import { Label } from '../../atoms/Label';
import { Select, type SelectProps } from '../../atoms/Select';
import { describedBy, FieldMessages } from '../FieldMessages';

import styles from './SelectField.module.scss';

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export interface SelectFieldProps extends Omit<SelectProps, 'invalid' | 'children'> {
  readonly label: string;
  readonly options: readonly SelectOption[];
  /** First, empty option shown until the user chooses (e.g. "Selecciona el departamento"). */
  readonly placeholder?: string;
  readonly hint?: string;
  readonly error?: string;
}

export function SelectField({
  label,
  options,
  placeholder,
  hint,
  error,
  id,
  ...selectProps
}: SelectFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div className={styles.field}>
      <Label htmlFor={fieldId}>{label}</Label>
      <Select
        {...selectProps}
        id={fieldId}
        invalid={Boolean(error)}
        aria-describedby={describedBy({ fieldId, hint, error })}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <FieldMessages fieldId={fieldId} hint={hint} error={error} />
    </div>
  );
}
