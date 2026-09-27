import { Icon } from '../../atoms/Icon';

import styles from './FieldMessages.module.scss';

export interface FieldMessagesProps {
  readonly fieldId: string;
  readonly hint?: string;
  readonly error?: string;
}

/** Ids of the hint and error texts, for the control's aria-describedby. */
export const describedBy = ({ fieldId, hint, error }: FieldMessagesProps): string | undefined =>
  [hint && `${fieldId}-hint`, error && `${fieldId}-error`].filter(Boolean).join(' ') || undefined;

/** Help text and validation error shared by every form field. */
export function FieldMessages({ fieldId, hint, error }: FieldMessagesProps) {
  return (
    <>
      {hint && (
        <p id={`${fieldId}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${fieldId}-error`} className={styles.error}>
          <Icon name="alert-triangle" size={16} />
          <span>{error}</span>
        </p>
      )}
    </>
  );
}
