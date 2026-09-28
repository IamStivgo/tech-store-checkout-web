import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const focusableIn = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));

/**
 * Accessible modal behavior for a dialog rendered in a portal: focus moves inside and is
 * trapped, Escape closes, the rest of the page is inert and does not scroll, and focus
 * returns to the element that opened the dialog.
 */
export function useModalBehavior(
  open: boolean,
  containerRef: RefObject<HTMLElement | null>,
  onClose: () => void,
): void {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const container = containerRef.current;
    if (!open || !container) {
      return undefined;
    }

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const outside = Array.from(document.body.children).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement &&
        !element.contains(container) &&
        !element.hasAttribute('inert'),
    );
    const previousOverflow = document.body.style.overflow;

    outside.forEach((element) => {
      element.setAttribute('inert', '');
    });
    document.body.style.overflow = 'hidden';
    (focusableIn(container)[0] ?? container).focus();

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') {
        return;
      }
      const focusable = focusableIn(container);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) {
        event.preventDefault();
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      outside.forEach((element) => {
        element.removeAttribute('inert');
      });
      document.body.style.overflow = previousOverflow;
      opener?.focus();
    };
  }, [open, containerRef]);
}
