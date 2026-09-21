import type { Metadata } from 'next';
import { headers } from 'next/headers';

import type { Locale, PublicContactConfig, PublicServiceSummary, PublicSiteSettings } from '@protocol-soft/shared';

import { getContent } from '@/lib/internalApi';
import { MotionInit } from '@/components/MotionInit';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { BRAND } from '@/components/siteChrome';
import '../globals.css';

export const metadata: Metadata = {
  title: {
    default: 'بروتوكول سوفت | Protocol Soft',
    template: '%s | بروتوكول سوفت',
  },
  description: 'تطوير الأنظمة المخصصة، بناء المنتجات والمنصات الرقمية، وخدمات الأمن السيبراني.',
};

/** Legal pages stay 404 while draft (D-2/LD1) — the footer mirrors that: links
 *  appear only once the pages actually publish. */
const legalPublished = async (): Promise<{ privacy: boolean; terms: boolean }> => {
  const probe = async (slug: string, locale: Locale): Promise<boolean> => {
    try {
      await getContent<unknown>('/api/internal/content/pages', locale, { slug });
      return true;
    } catch {
      return false;
    }
  };
  const locale = (((await headers()).get('x-locale')) === 'en' ? 'en' : 'ar') as Locale;
  const [privacy, terms] = await Promise.all([probe('privacy', locale), probe('terms', locale)]);
  return { privacy, terms };
};

export default async function LocaleLayout({ children }: { children: React.ReactNode }) {
  const locale = (((await headers()).get('x-locale')) === 'en' ? 'en' : 'ar') as Locale;

  let settings: PublicSiteSettings | null = null;
  let contact: PublicContactConfig | null = null;
  let services: PublicServiceSummary[] = [];
  try {
    settings = await getContent<PublicSiteSettings>('/api/internal/content/site-settings', locale);
  } catch {
    settings = null;
  }
  try {
    contact = await getContent<PublicContactConfig>('/api/internal/content/contact-config', locale);
  } catch {
    contact = null;
  }
  // Published services for the footer (§11: informative footer). Unpublished
  // services are omitted upstream — never stubbed.
  try {
    services = await getContent<PublicServiceSummary[]>('/api/internal/content/services', locale);
  } catch {
    services = [];
  }
  const legal = await legalPublished();

  return (
    <>
      <a href="#main" className="skip-link">{locale === 'ar' ? 'تجاوز إلى المحتوى' : 'Skip to content'}</a>
      <SiteHeader locale={locale} ctaLabel={locale === 'ar' ? 'ابدأ مشروعك' : 'Start a Project'} />
      <main id="main">{children}</main>
      <SiteFooter
        locale={locale}
        settings={settings ?? { companyName: { ar: BRAND.name.ar, en: BRAND.name.en }, tagline: { ar: '', en: '' }, emailMain: '', footerCopyright: { ar: `© {year} ${BRAND.name.ar}`, en: `© {year} ${BRAND.name.en}` } }}
        contact={contact}
        services={services}
        privacyPublished={legal.privacy}
        termsPublished={legal.terms}
      />
      <MotionInit />
    </>
  );
}
