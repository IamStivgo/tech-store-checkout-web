import styles from './AppHeader.module.scss';

export interface AppHeaderProps {
  readonly brand: string;
}

export function AppHeader({ brand }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <span className={styles.brand}>{brand}</span>
      </div>
    </header>
  );
}
