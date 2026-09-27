import { useId, type KeyboardEvent } from 'react';

import { Icon } from '../../atoms/Icon';

import styles from './QuantityStepper.module.scss';

export interface QuantityStepperProps {
  readonly label: string;
  readonly value: number;
  readonly max: number;
  readonly min?: number;
  readonly onChange: (value: number) => void;
  readonly decreaseLabel: string;
  readonly increaseLabel: string;
  /** Text under the control, e.g. "Máximo 5 por pedido". */
  readonly hint?: string;
  readonly disabled?: boolean;
}

/**
 * Spin button (WAI-ARIA APG): the value takes the focus and answers to the arrow, Home and End
 * keys; the − and + buttons are for pointer and touch, so they stay out of the tab order.
 */
export function QuantityStepper({
  label,
  value,
  max,
  min = 1,
  onChange,
  decreaseLabel,
  increaseLabel,
  hint,
  disabled = false,
}: QuantityStepperProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const hintId = `${id}-hint`;
  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < max;

  const change = (next: number) => {
    const clamped = Math.min(Math.max(next, min), max);
    if (!disabled && clamped !== value) {
      onChange(clamped);
    }
  };

  const KEY_ACTIONS: Readonly<Record<string, () => void>> = {
    ArrowUp: () => {
      change(value + 1);
    },
    ArrowRight: () => {
      change(value + 1);
    },
    ArrowDown: () => {
      change(value - 1);
    },
    ArrowLeft: () => {
      change(value - 1);
    },
    Home: () => {
      change(min);
    },
    End: () => {
      change(max);
    },
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const action = KEY_ACTIONS[event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  };

  return (
    <div className={styles.field}>
      <span id={labelId} className={styles.label}>
        {label}
      </span>
      <div className={`${styles.stepper} ${disabled ? styles.disabled : ''}`}>
        <button
          type="button"
          className={styles.button}
          aria-label={decreaseLabel}
          tabIndex={-1}
          disabled={!canDecrease}
          onClick={() => {
            change(value - 1);
          }}
        >
          <Icon name="minus" size={20} />
        </button>
        <div
          role="spinbutton"
          className={styles.value}
          tabIndex={disabled ? -1 : 0}
          aria-labelledby={labelId}
          aria-describedby={hint ? hintId : undefined}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-disabled={disabled || undefined}
          onKeyDown={handleKeyDown}
        >
          {value}
        </div>
        <button
          type="button"
          className={styles.button}
          aria-label={increaseLabel}
          tabIndex={-1}
          disabled={!canIncrease}
          onClick={() => {
            change(value + 1);
          }}
        >
          <Icon name="plus" size={20} />
        </button>
      </div>
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  );
}
