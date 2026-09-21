/** Shared visual bits: inline icons (stroke = currentColor), SectionHeading,
 *  EmptyState, and the CtaBand (§8.7). Icons are decorative (aria-hidden);
 *  meaning is always carried by adjacent text (§9.1/§14). */
import type { ReactNode } from 'react';

import type { Locale } from '@protocol-soft/shared';

import { localePath } from './siteChrome';

const paths: Record<string, ReactNode> = {
  code: <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>,
  layers: <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
  gauge: <><path d="M12 20a8 8 0 1 1 8-8" /><line x1="12" y1="12" x2="16" y2="8" /></>,
  workflow: <><rect x="3" y="3" width="6" height="6" /><rect x="15" y="15" width="6" height="6" /><path d="M9 6h6a0 0 0 0 1 0 0v6a0 0 0 0 1 0 0h-3v3" /></>,
  server: <><rect x="2" y="4" width="20" height="7" /><rect x="2" y="13" width="20" height="7" /><line x1="6" y1="7.5" x2="6.01" y2="7.5" /><line x1="6" y1="16.5" x2="6.01" y2="16.5" /></>,
  check: <><polyline points="20 6 9 17 4 12" /></>,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" /></>,
  alert: <><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
};

export const Icon = ({ name, size = 24 }: { name: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {paths[name] ?? paths.code}
  </svg>
);

export const SectionHeading = ({ kicker, title, lead }: { kicker?: string; title: string; lead?: string }) => (
  <div className="section-head">
    {kicker && <p className="kicker">{kicker}</p>}
    <h2>{title}</h2>
    {lead && <p>{lead}</p>}
  </div>
);

export const EmptyState = ({
  locale,
  title,
  guidance,
  actions,
}: {
  locale: Locale;
  title: string;
  guidance?: string;
  actions?: boolean;
}) => (
  <div className="empty-state" role="status">
    <h2 style={{ fontSize: 'var(--fs-h3)' }}>{title}</h2>
    {guidance && <p>{guidance}</p>}
    {actions && (
      <div className="empty-state__actions">
        <a href={localePath(locale, '/services')} className="btn btn--secondary">
          {locale === 'ar' ? 'استكشف خدماتنا' : 'Explore our services'}
        </a>
        <a href={localePath(locale, '/contact')} className="btn btn--ghost">
          {locale === 'ar' ? 'تواصل معنا' : 'Contact us'}
        </a>
      </div>
    )}
  </div>
);

/** CTA band — direct channels render only when real values exist (§6.9). */
export const CtaBand = ({
  locale,
  heading,
  body,
  ctaLabel,
  email,
  phone,
}: {
  locale: Locale;
  heading: string;
  body?: string;
  ctaLabel: string;
  email?: string;
  phone?: string;
}) => (
  <section className="cta-band" data-reveal aria-label={locale === 'ar' ? 'دعوة للتواصل' : 'Call to action'}>
    <div className="container cta-band__inner">
      <h2>{heading}</h2>
      {body && <p>{body}</p>}
      <div className="cta-band__actions">
        <a href={localePath(locale, '/contact')} className="btn btn--primary btn--lg">{ctaLabel}</a>
        {email && (
          <a href={`mailto:${email}`} className="btn btn--secondary bidi">{email}</a>
        )}
        {phone && (
          <a href={`tel:${phone}`} className="btn btn--secondary bidi">{phone}</a>
        )}
      </div>
    </div>
  </section>
);
