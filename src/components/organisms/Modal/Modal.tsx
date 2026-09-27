import { useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useModalBehavior } from '../../../hooks/use-modal-behavior';
import { Icon } from '../../atoms/Icon';

import styles from './Modal.module.scss';

export interface ModalProps {
  readonly open: boolean;
  readonly title: string;
  /** Accessible name of the close button, e.g. "Cerrar". */
  readonly closeLabel: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
  /** Actions pinned to the bottom, e.g. the "Continuar" button. */
  readonly footer?: ReactNode;
}

/** Full screen below 600 px, centered 560 px dialog above (design system §5.1). */
export function Modal({ open, title, closeLabel, onClose, children, footer }: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  useModalBehavior(open, dialogRef, onClose);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className={styles.overlay}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button type="button" className={styles.close} aria-label={closeLabel} onClick={onClose}>
            <Icon name="x" />
          </button>
        </header>
        <div className={styles.body}>{children}</div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
