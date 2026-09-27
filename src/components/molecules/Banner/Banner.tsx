import type { ReactNode } from 'react';

import { Button } from '../../atoms/Button';
import { Icon, type IconName } from '../../atoms/Icon';

import styles from './Banner.module.scss';

export type BannerVariant = 'info' | 'success' | 'warning' | 'danger';

export interface BannerAction {
  readonly label: string;
  readonly onClick: () => void;
}

export interface BannerProps {
  readonly variant?: BannerVariant;
  readonly title?: string;
  readonly children: ReactNode;
  readonly action?: BannerAction;
}

const ICON: Readonly<Record<BannerVariant, IconName>> = {
  info: 'info',
  success: 'check-circle',
  warning: 'alert-triangle',
  danger: 'x-circle',
};

/** Danger banners interrupt screen readers (alert); the others are announced politely (status). */
export function Banner({ variant = 'info', title, children, action }: BannerProps) {
  return (
    <div
      className={`${styles.banner} ${styles[variant]}`}
      role={variant === 'danger' ? 'alert' : 'status'}
    >
      <Icon name={ICON[variant]} size={20} className={styles.icon} />
      <div className={styles.content}>
        {title && <p className={styles.title}>{title}</p>}
        <div className={styles.body}>{children}</div>
        {action && (
          <div className={styles.action}>
            <Button variant="ghost" onClick={action.onClick}>
              {action.label}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
