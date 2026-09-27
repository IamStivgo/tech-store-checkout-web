import { Link } from 'react-router';

import { Icon } from '../../../../components/atoms/Icon';
import { ROUTES } from '../../../../config/routes';
import { messages } from '../../../../data/messages.es-CO';

import styles from './NotFoundPage.module.scss';

export interface NotFoundPageProps {
  /** What was not found: any page (unknown route) or a product. */
  readonly variant?: keyof typeof messages.notFound;
}

export function NotFoundPage({ variant = 'page' }: NotFoundPageProps) {
  const { title, body } = messages.notFound[variant];

  return (
    <section className={styles.page} aria-labelledby="not-found-title">
      <Icon name="package" size={48} className={styles.icon} />
      <h1 id="not-found-title" className={styles.title}>
        {title}
      </h1>
      <p className={styles.body}>{body}</p>
      <Link to={ROUTES.home}>{messages.common.goToStore}</Link>
    </section>
  );
}
