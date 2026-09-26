import { messages } from '../../../../data/messages.es-CO';

import styles from './CatalogPage.module.scss';

export function CatalogPage() {
  return (
    <section className={styles.page} aria-labelledby="catalog-title">
      <div className={styles.header}>
        <h1 id="catalog-title" className={styles.title}>
          {messages.catalog.title}
        </h1>
        <p className={styles.subtitle}>{messages.catalog.subtitle}</p>
      </div>
    </section>
  );
}
