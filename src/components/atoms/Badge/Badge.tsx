import type { ReactNode } from 'react';

import { Icon, type IconName } from '../Icon';

import styles from './Badge.module.scss';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger';

export interface BadgeProps {
  readonly tone?: BadgeTone;
  readonly icon?: IconName;
  readonly children: ReactNode;
}

/** 24 px pill; the text carries the meaning, the color and icon only reinforce it. */
export function Badge({ tone = 'neutral', icon, children }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[tone]}`}>
      {icon && <Icon name={icon} size={16} className={styles.icon} />}
      {children}
    </span>
  );
}
