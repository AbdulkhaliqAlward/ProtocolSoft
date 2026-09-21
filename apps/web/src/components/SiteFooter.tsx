/**
 * Site footer (Phase 3 §8.6, rebuilt per the Phase 5 visual rebuild §11): the
 * purposeful dark section in BOTH themes. Complete and informative: brand +
 * approved positioning statement, Services links (published services),
 * Company links, contact channels (every empty channel HIDDEN — §6.9, never
 * placeholder text; WhatsApp always visually present via WA1 availability
 * state), and a bottom bar with language access + conditional legal links
 * (D-2/D-4: privacy/terms render only when actually published — they are
 * draft templates now, so the links are absent). No invented logo mark.
 */
import type { Locale, PublicContactConfig, PublicServiceSummary, PublicSiteSettings } from '@protocol-soft/shared';

import { BRAND, localePath, switchHref } from './siteChrome';
import { WhatsAppCta } from './WhatsAppCta';

const T = (value: { ar: string; en: string } | string | null | undefined, locale: Locale): string => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return value[locale] ?? '';
};

export const SiteFooter = ({
  locale,
  settings,
  contact,
  services,
  privacyPublished,
  termsPublished,
}: {
  locale: Locale;
  settings: PublicSiteSettings | null;
  contact: PublicContactConfig | null;
  services: PublicServiceSummary[];
  privacyPublished: boolean;
  termsPublished: boolean;
}) => {
  const year = new Date().getFullYear();
  const company = settings?.companyName ? T(settings.companyName, locale) : BRAND.name[locale];
  const description = settings?.tagline ? T(settings.tagline, locale) : '';
  const emailMain = contact?.channels.emailMain ?? '';
  const emailSales = contact?.channels.emailSales ?? '';
  const phone = contact?.channels.phone ?? '';

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div>
            <p className="brand" style={{ marginBottom: 12 }}>
              <span className="brand__name" lang={locale}>{company}</span>
            </p>
            {description && <p className="secondary" style={{ fontSize: 'var(--fs-body-sm)', maxWidth: 360, marginBottom: 0 }}>{description}</p>}
          </div>

          <nav aria-label={locale === 'ar' ? 'الخدمات' : 'Services'}>
            <h3>{locale === 'ar' ? 'الخدمات' : 'Services'}</h3>
            <ul>
              <li><a href={localePath(locale, '/services')}>{locale === 'ar' ? 'نظرة عامة على الخدمات' : 'Services overview'}</a></li>
              {services.map((s) => (
                <li key={s.slug}><a href={localePath(locale, `/services/${s.slug}`)}>{T(s.title, locale)}</a></li>
              ))}
            </ul>
          </nav>

          <nav aria-label={locale === 'ar' ? 'الشركة' : 'Company'}>
            <h3>{locale === 'ar' ? 'الشركة' : 'Company'}</h3>
            <ul>
              <li><a href={localePath(locale, '/about')}>{locale === 'ar' ? 'من نحن' : 'About'}</a></li>
              <li><a href={localePath(locale, '/contact')}>{locale === 'ar' ? 'تواصل معنا' : 'Contact'}</a></li>
              {/* D-4: no Case Studies link in Phase 5 */}
            </ul>
          </nav>

          <div>
            <h3>{locale === 'ar' ? 'تواصل' : 'Contact'}</h3>
            <ul className="channel-list" style={{ gap: 8 }}>
              {emailMain && (
                <li>
                  <a href={`mailto:${emailMain}`} className="bidi">{emailMain}</a>
                </li>
              )}
              {emailSales && emailSales !== emailMain && (
                <li>
                  <a href={`mailto:${emailSales}`} className="bidi">{emailSales}</a>
                </li>
              )}
              {phone && (
                <li>
                  <a href={`tel:${phone}`} className="bidi">{phone}</a>
                </li>
              )}
              {contact && <li><WhatsAppCta whatsapp={contact.channels.whatsapp} locale={locale} /></li>}
            </ul>
          </div>
        </div>

        <div className="site-footer__bottom">
          <span>{(settings?.footerCopyright ? T(settings.footerCopyright, locale) : `© ${year} ${company}`).replace('{year}', String(year))}</span>
          <span className="site-footer__meta">
            <a
              href={switchHref(locale, '/')}
              className="footer-lang"
              lang={locale === 'ar' ? 'en' : 'ar'}
            >
              {locale === 'ar' ? 'English' : 'العربية'}
            </a>
            <span className="site-footer__legal">
              {privacyPublished && <a href={localePath(locale, '/privacy')}>{locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</a>}
              {termsPublished && <a href={localePath(locale, '/terms')}>{locale === 'ar' ? 'شروط الاستخدام' : 'Terms of Use'}</a>}
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
};
