import { Link } from 'react-router';

import { ROUTES } from '../../../../config/routes';
import { privacyPolicy } from '../../../../data/privacy-policy.es-CO';

import styles from './PrivacyPage.module.scss';

export function PrivacyPage() {
  const { title, updated, intro, sections, back } = privacyPolicy;
  return (
    <article className={styles.page} aria-labelledby="privacy-title">
      <h1 id="privacy-title" className={styles.title}>
        {title}
      </h1>
      <p className={styles.updated}>{updated}</p>
      <p>{intro}</p>
      {sections.map((section) => (
        <section key={section.title} className={styles.section}>
          <h2 className={styles.heading}>{section.title}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ))}
      <Link to={ROUTES.home}>{back}</Link>
    </article>
  );
}
