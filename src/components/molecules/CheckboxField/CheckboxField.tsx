import { useId, type ReactNode } from 'react';

import { Checkbox, type CheckboxProps } from '../../atoms/Checkbox';
import { Icon } from '../../atoms/Icon';
import { describedBy, FieldMessages } from '../FieldMessages';

import styles from './CheckboxField.module.scss';

export interface CheckboxFieldLink {
  readonly href: string;
  readonly text: string;
  /** Told to screen readers, since the link opens a new tab. */
  readonly newTabHint: string;
}

export interface CheckboxFieldProps extends Omit<CheckboxProps, 'invalid'> {
  readonly label: ReactNode;
  /** Document the user accepts (e.g. terms and conditions), opened in a new tab. */
  readonly link?: CheckboxFieldLink;
  readonly error?: string;
}

export function CheckboxField({ label, link, error, id, ...checkboxProps }: CheckboxFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div className={styles.field}>
      <div className={styles.row}>
        <Checkbox
          {...checkboxProps}
          id={fieldId}
          invalid={Boolean(error)}
          aria-describedby={describedBy({ fieldId, error })}
        />
        <div className={styles.text}>
          <label htmlFor={fieldId} className={styles.label}>
            {label}
          </label>
          {/* Outside the label, so opening the document does not toggle the checkbox. */}
          {link && (
            <a className={styles.link} href={link.href} target="_blank" rel="noopener noreferrer">
              {link.text}
              <Icon name="external-link" size={16} />
              <span className={styles.visuallyHidden}>{link.newTabHint}</span>
            </a>
          )}
        </div>
      </div>
      <FieldMessages fieldId={fieldId} error={error} />
    </div>
  );
}
