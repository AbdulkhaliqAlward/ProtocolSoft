/**
 * Site chrome: skip link, header (with the published services menu), main,
 * footer and the motion driver. Data is cached per CMS tag and expired by the
 * publish webhook; only a 404 from the CMS becomes an empty value, any other
 * failure throws so a cached page is never replaced by an empty one.
 */
import type { ReactNode } from 'react';

import type { Locale, PublicContactConfig, PublicServiceSummary, PublicSiteSettings } from '@protocol-soft/shared';

import { MotionInit } from '@/components/MotionInit';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { BRAND } from '@/components/siteChrome';
import { getOptional } from '@/lib/internalApi';

export default async function SiteLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale: param } = await params;
  const locale: Locale = param === 'en' ? 'en' : 'ar';
  const ar = locale === 'ar';

  const [settings, contact, services, privacy, terms] = await Promise.all([
    getOptional<PublicSiteSettings>('/api/internal/content/site-settings', locale),
    getOptional<PublicContactConfig>('/api/internal/content/contact-config', locale),
    getOptional<PublicServiceSummary[], PublicServiceSummary[]>('/api/internal/content/services', locale, undefined, []),
    // Legal links appear only once the pages are published (drafts 404 upstream).
    getOptional<unknown>('/api/internal/content/pages', locale, { slug: 'privacy' }),
    getOptional<unknown>('/api/internal/content/pages', locale, { slug: 'terms' }),
  ]);

  return (
    <>
      <a href="#main" className="skip-link">{ar ? 'تجاوز إلى المحتوى' : 'Skip to content'}</a>
      <SiteHeader locale={locale} ctaLabel={ar ? 'ابدأ مشروعك' : 'Start a project'} services={services} />
      <main id="main">{children}</main>
      <SiteFooter
        locale={locale}
        settings={settings ?? { companyName: { ar: BRAND.name.ar, en: BRAND.name.en }, tagline: { ar: '', en: '' }, emailMain: '', footerCopyright: { ar: `© {year} ${BRAND.name.ar}`, en: `© {year} ${BRAND.name.en}` } }}
        contact={contact}
        services={services}
        privacyPublished={privacy != null}
        termsPublished={terms != null}
      />
      <MotionInit />
    </>
  );
}
