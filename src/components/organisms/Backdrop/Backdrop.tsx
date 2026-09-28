import { useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useModalBehavior } from '../../../hooks/use-modal-behavior';

import styles from './Backdrop.module.scss';

export interface BackdropProps {
  readonly open: boolean;
  /** Title of the front layer, which names the dialog (e.g. "Resumen de pago"). */
  readonly title: string;
  /** Context on the dark back layer (product, destination, "Editar"). */
  readonly back: ReactNode;
  readonly children: ReactNode;
  /** Pinned at the bottom of the front layer, e.g. the "Pagar" button. */
  readonly footer?: ReactNode;
  /** Escape behaves like the back layer's "Editar" action. */
  readonly onDismiss: () => void;
}

/**
 * Two-layer sheet: both layers form the dialog, so the back layer stays operable while the
 * page behind is inert (design system §5.1, summary §8.4).
 */
export function Backdrop({ open, title, back, children, footer, onDismiss }: BackdropProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  useModalBehavior(open, dialogRef, onDismiss);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className={styles.overlay}>
      <div
        ref={dialogRef}
        className={styles.stack}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className={styles.back}>{back}</div>
        <section className={styles.front}>
          <span className={styles.handle} aria-hidden="true" />
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <div className={styles.content}>{children}</div>
          {footer && <div className={styles.footer}>{footer}</div>}
        </section>
      </div>
    </div>,
    document.body,
  );
}
