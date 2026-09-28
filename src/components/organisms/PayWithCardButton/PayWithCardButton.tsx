import { Button } from '../../atoms/Button';

import styles from './PayWithCardButton.module.scss';

export interface PayWithCardButtonProps {
  readonly label: string;
  /** Shown instead of the label when the product cannot be bought, e.g. "Agotado". */
  readonly unavailableLabel: string;
  readonly available: boolean;
  readonly onClick: () => void;
}

/** Main call to action: a bar fixed to the bottom on phones and tablets, inline on desktop. */
export function PayWithCardButton({
  label,
  unavailableLabel,
  available,
  onClick,
}: PayWithCardButtonProps) {
  return (
    <div className={styles.bar}>
      <Button
        size="lg"
        fullWidth
        icon={available ? 'credit-card' : undefined}
        disabled={!available}
        onClick={onClick}
      >
        {available ? label : unavailableLabel}
      </Button>
    </div>
  );
}
