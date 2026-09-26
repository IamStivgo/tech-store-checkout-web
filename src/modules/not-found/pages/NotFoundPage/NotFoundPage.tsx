import { Link } from 'react-router';

import { ROUTES } from '../../../../config/routes';
import { messages } from '../../../../data/messages.es-CO';

import styles from './NotFoundPage.module.scss';

export function NotFoundPage() {
  return (
    <section className={styles.page} aria-labelledby="not-found-title">
      <h1 id="not-found-title" className={styles.title}>
        {messages.notFound.page.title}
      </h1>
      <p className={styles.body}>{messages.notFound.page.body}</p>
      <Link to={ROUTES.home}>{messages.common.goToStore}</Link>
    </section>
  );
}
