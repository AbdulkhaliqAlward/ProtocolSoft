/**
 * Site footer: a full-width purple band with rounded top corners. Brand (mark + name +
 * positioning line), Services (published services only), Company, Contact
 * (every empty channel is hidden, never placeholder text; WhatsApp is always
 * present via its honest availability state), then a bottom bar with the
 * copyright, language switch and legal links (rendered only once published).
 */
import Link from 'next/link';

import type { Locale, PublicContactConfig, PublicServiceSummary, PublicSiteSettings } from '@protocol-soft/shared';

import { LogoMark } from './LogoMark';
import { BRAND, localePath, switchHref } from './siteChrome';
import { Spark } from './Spark';
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
  const ar = locale === 'ar';
  const year = new Date().getFullYear();
  const company = settings?.companyName ? T(settings.companyName, locale) : BRAND.name[locale];
  const description = settings?.tagline ? T(settings.tagline, locale) : '';
  const emailMain = contact?.channels.emailMain ?? '';
  const emailSales = contact?.channels.emailSales ?? '';
  const phone = contact?.channels.phone ?? '';
  const copyright = (settings?.footerCopyright ? T(settings.footerCopyright, locale) : `© {year} ${company}`).replace('{year}', String(year));

  return (
    <footer className="site-footer">
      <div className="site-footer__plate">
        <div className="container">
          <div className="site-footer__grid">
            <div className="site-footer__brand">
              <Link href={localePath(locale, '/')} className="brand" aria-label={ar ? `${BRAND.name.ar} — الصفحة الرئيسية` : `${BRAND.name.en} — home`}>
                <LogoMark className="brand__mark" size={44} />
                <span className="brand__name" lang={locale}>{BRAND.name[locale]}</span>
              </Link>
              {description && <p>{description}</p>}
            </div>

            <nav aria-labelledby="footer-services">
              <h2 id="footer-services"><Spark size="sm" />{ar ? 'الخدمات' : 'Services'}</h2>
              <ul>
                {services.map((s) => (
                  <li key={s.slug}><Link href={localePath(locale, `/services/${s.slug}`)}>{T(s.title, locale)}</Link></li>
                ))}
                <li><Link href={localePath(locale, '/services')}>{ar ? 'كل الخدمات' : 'All services'}</Link></li>
              </ul>
            </nav>

            <nav aria-labelledby="footer-company">
              <h2 id="footer-company"><Spark size="sm" />{ar ? 'الشركة' : 'Company'}</h2>
              <ul>
                <li><Link href={localePath(locale, '/')}>{ar ? 'الرئيسية' : 'Home'}</Link></li>
                <li><Link href={localePath(locale, '/about')}>{ar ? 'من نحن' : 'About'}</Link></li>
                <li><Link href={localePath(locale, '/contact')}>{ar ? 'تواصل معنا' : 'Contact'}</Link></li>
              </ul>
            </nav>

            <div>
              <h2><Spark size="sm" />{ar ? 'تواصل' : 'Contact'}</h2>
              <ul className="channel-list">
                {emailMain && <li><a href={`mailto:${emailMain}`} className="bidi">{emailMain}</a></li>}
                {emailSales && emailSales !== emailMain && <li><a href={`mailto:${emailSales}`} className="bidi">{emailSales}</a></li>}
                {phone && <li><a href={`tel:${phone}`} className="bidi">{phone}</a></li>}
                {contact && <li><WhatsAppCta whatsapp={contact.channels.whatsapp} locale={locale} /></li>}
                <li><Link href={localePath(locale, '/contact')}>{ar ? 'نموذج التواصل' : 'Contact form'}</Link></li>
              </ul>
            </div>
          </div>

          <div className="site-footer__bottom">
            <span>{copyright}</span>
            <span className="site-footer__meta">
              {privacyPublished && <Link href={localePath(locale, '/privacy')}>{ar ? 'سياسة الخصوصية' : 'Privacy Policy'}</Link>}
              {termsPublished && <Link href={localePath(locale, '/terms')}>{ar ? 'شروط الاستخدام' : 'Terms of Use'}</Link>}
              <a href={switchHref(locale, '/')} className="footer-lang" lang={ar ? 'en' : 'ar'} hrefLang={ar ? 'en' : 'ar'}>
                {ar ? 'English' : 'العربية'}
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
