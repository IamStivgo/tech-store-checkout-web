import { Link } from 'react-router';

import styles from './AppFooter.module.scss';

export interface FooterLink {
  readonly to: string;
  readonly label: string;
}

export interface AppFooterProps {
  readonly copyright: string;
  readonly notice: string;
  /** Pages such as the privacy policy. */
  readonly links?: readonly FooterLink[];
  /** Accessible name of the links' navigation. */
  readonly linksLabel?: string;
}

export function AppFooter({ copyright, notice, links = [], linksLabel }: AppFooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p>{notice}</p>
        {links.length > 0 && (
          <nav aria-label={linksLabel}>
            <ul className={styles.links}>
              {links.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <p>{copyright}</p>
      </div>
    </footer>
  );
}
