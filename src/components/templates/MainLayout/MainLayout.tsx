import type { ReactNode } from 'react';

import { AppFooter, type FooterLink } from '../../organisms/AppFooter';
import { AppHeader } from '../../organisms/AppHeader';

import styles from './MainLayout.module.scss';

export const MAIN_CONTENT_ID = 'main-content';

export interface MainLayoutProps {
  readonly brand: string;
  readonly skipToContentLabel: string;
  readonly footerCopyright: string;
  readonly footerNotice: string;
  readonly footerLinks?: readonly FooterLink[];
  readonly footerLinksLabel?: string;
  readonly children: ReactNode;
}

export function MainLayout({
  brand,
  skipToContentLabel,
  footerCopyright,
  footerNotice,
  footerLinks,
  footerLinksLabel,
  children,
}: MainLayoutProps) {
  return (
    <div className={styles.layout}>
      <a className={styles.skipLink} href={`#${MAIN_CONTENT_ID}`}>
        {skipToContentLabel}
      </a>
      <AppHeader brand={brand} />
      <main id={MAIN_CONTENT_ID} className={styles.main} tabIndex={-1}>
        {children}
      </main>
      <AppFooter
        copyright={footerCopyright}
        notice={footerNotice}
        links={footerLinks}
        linksLabel={footerLinksLabel}
      />
    </div>
  );
}
