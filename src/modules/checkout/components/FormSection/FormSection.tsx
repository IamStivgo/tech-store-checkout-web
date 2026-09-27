import type { ReactNode } from 'react';

import styles from './FormSection.module.scss';

export interface FormSectionProps {
  readonly title: string;
  readonly children: ReactNode;
}

/** Group of related fields of the checkout form, announced with its title. */
export function FormSection({ title, children }: FormSectionProps) {
  return (
    <fieldset className={styles.section}>
      <legend className={styles.title}>{title}</legend>
      <div className={styles.fields}>{children}</div>
    </fieldset>
  );
}
