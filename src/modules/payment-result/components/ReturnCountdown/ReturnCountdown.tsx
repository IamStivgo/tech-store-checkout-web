import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '../../../../components/atoms/Button';
import { messages } from '../../../../data/messages.es-CO';

import styles from './ReturnCountdown.module.scss';

const SECOND_MS = 1000;
export const RETURN_AFTER_SECONDS = 15;

export interface ReturnCountdownProps {
  /** Where the buyer goes back to: the product of the purchase. */
  readonly to: string;
  readonly seconds?: number;
}

/**
 * Goes back to the product after a few seconds. The buyer can pause it (WCAG 2.2.1), and only
 * the pause state is announced, not every second.
 */
export function ReturnCountdown({ to, seconds = RETURN_AFTER_SECONDS }: ReturnCountdownProps) {
  const navigate = useNavigate();
  const [remaining, setRemaining] = useState(seconds);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) {
      return undefined;
    }
    if (remaining === 0) {
      void navigate(to);
      return undefined;
    }
    const timer = setTimeout(() => {
      setRemaining((current) => current - 1);
    }, SECOND_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [navigate, paused, remaining, to]);

  const { countdown } = messages.result;
  return (
    <div className={styles.countdown}>
      <p className={styles.text}>{paused ? countdown.paused : countdown.returning(remaining)}</p>
      <Button
        variant="secondary"
        aria-pressed={paused}
        onClick={() => {
          setPaused((current) => !current);
        }}
      >
        {paused ? countdown.resume : countdown.pause}
      </Button>
      <span className={styles.status} role="status">
        {paused ? countdown.paused : ''}
      </span>
    </div>
  );
}
