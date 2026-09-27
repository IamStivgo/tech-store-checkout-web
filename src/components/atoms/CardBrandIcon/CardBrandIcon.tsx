import type { CardBrand } from '../../../utils/card';
import { Icon } from '../Icon';

import styles from './CardBrandIcon.module.scss';

export type CardBrandIconSize = 'sm' | 'md';

export interface CardBrandIconProps {
  readonly brand: CardBrand;
  /** sm: 32×20 px inside the card field; md: 40×26 px in the summary and result. */
  readonly size?: CardBrandIconSize;
  /** Accessible name, e.g. "Visa" or "Marca de la tarjeta no reconocida". */
  readonly label: string;
}

// Simplified brand marks drawn as illustrations (design system §4.7), not official artwork.
function VisaMark() {
  return (
    <>
      <rect width="40" height="26" rx="4" fill="#1a1f71" />
      <text
        x="20"
        y="17.5"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Arial, sans-serif"
        fontSize="11"
        fontStyle="italic"
        fontWeight="700"
      >
        VISA
      </text>
    </>
  );
}

function MastercardMark() {
  return (
    <>
      <rect width="40" height="26" rx="4" fill="#fff" stroke="#e2e8f0" />
      <circle cx="16" cy="13" r="7.5" fill="#eb001b" />
      <circle cx="24" cy="13" r="7.5" fill="#f79e1b" />
      <path d="M20 6.9a7.5 7.5 0 0 1 0 12.2 7.5 7.5 0 0 1 0-12.2Z" fill="#ff5f00" />
    </>
  );
}

export function CardBrandIcon({ brand, size = 'sm', label }: CardBrandIconProps) {
  const className = `${styles.brand} ${styles[size]}`;

  if (brand === 'UNKNOWN') {
    return (
      <span className={`${className} ${styles.unknown}`} role="img" aria-label={label}>
        <Icon name="credit-card" size={20} />
      </span>
    );
  }

  return (
    // Keyed by brand so the new mark fades in when the detected brand changes.
    <svg key={brand} className={className} viewBox="0 0 40 26" role="img" aria-label={label}>
      {brand === 'VISA' ? <VisaMark /> : <MastercardMark />}
    </svg>
  );
}
