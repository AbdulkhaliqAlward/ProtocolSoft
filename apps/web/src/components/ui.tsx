/** Closing band shared by every page: one heading, an optional line, one
 *  primary action. */
import Link from 'next/link';

import type { Locale } from '@protocol-soft/shared';

import { localePath } from './siteChrome';

/** Closing band (one per page): heading + optional line, one primary action.
 *  No email or phone here: the site's email appears only in the footer. */
export const CtaBand = ({
  locale,
  heading,
  body,
  ctaLabel,
  href,
}: {
  locale: Locale;
  heading: string;
  body?: string;
  ctaLabel: string;
  /** Action target; defaults to the contact page. */
  href?: string;
}) => (
  <section className="cta-band" data-reveal aria-label={locale === 'ar' ? 'دعوة للتواصل' : 'Call to action'}>
    <div className="container">
      <div className="cta-band__inner">
        <div>
          <h2>{heading}</h2>
          {body && <p>{body}</p>}
        </div>
        <div className="cta-band__actions">
          <Link href={href ?? localePath(locale, '/contact')} className="btn btn--primary btn--lg">{ctaLabel}</Link>
        </div>
      </div>
    </div>
  </section>
);
