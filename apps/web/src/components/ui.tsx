/** Closing band shared by every page: one heading, an optional line, one
 *  primary action. Direct channels render only when real values exist (§6.9). */
import type { Locale } from '@protocol-soft/shared';

import { localePath } from './siteChrome';

/** Closing band (one per page): heading + optional line, one primary action.
 *  Direct channels render only when real values exist (§6.9). */
export const CtaBand = ({
  locale,
  heading,
  body,
  ctaLabel,
  email,
  phone,
  href,
}: {
  locale: Locale;
  heading: string;
  body?: string;
  ctaLabel: string;
  email?: string;
  phone?: string;
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
          <a href={href ?? localePath(locale, '/contact')} className="btn btn--primary btn--lg">{ctaLabel}</a>
          {email && (
            <a href={`mailto:${email}`} className="btn btn--text bidi">{email}</a>
          )}
          {phone && (
            <a href={`tel:${phone}`} className="btn btn--text bidi">{phone}</a>
          )}
        </div>
      </div>
    </div>
  </section>
);
