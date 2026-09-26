import styles from './AppFooter.module.scss';

export interface AppFooterProps {
  readonly copyright: string;
  readonly notice: string;
}

export function AppFooter({ copyright, notice }: AppFooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p>{notice}</p>
        <p>{copyright}</p>
      </div>
    </footer>
  );
}
