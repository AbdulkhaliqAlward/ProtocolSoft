import type { MetadataRoute } from 'next';

import type { Locale, PublicServiceSummary } from '@protocol-soft/shared';

import { localePathname, siteUrl } from '@/lib/env';
import { getContent } from '@/lib/internalApi';

/** Sitemap: public domain only, published content only. A page is listed per
 *  locale only when that locale is actually published; hreflang alternates are
 *  added when both languages exist. /preview, /api and the admin never appear. */
export const dynamic = 'force-dynamic';

const LOCALES: Locale[] = ['ar', 'en'];

const publishedServiceSlugs = async (locale: Locale): Promise<Set<string>> => {
  try {
    const services = await getContent<PublicServiceSummary[]>('/api/internal/content/services', locale);
    return new Set(services.map((s) => s.slug));
  } catch {
    return new Set();
  }
};

const pagePublished = async (slug: string, locale: Locale): Promise<boolean> => {
  try {
    await getContent<unknown>('/api/internal/content/pages', locale, { slug });
    return true;
  } catch {
    return false;
  }
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteUrl();
  const [servicesAr, servicesEn] = await Promise.all([publishedServiceSlugs('ar'), publishedServiceSlugs('en')]);
  const legal = await Promise.all(
    ['privacy', 'terms'].map(async (slug) => ({ slug, ar: await pagePublished(slug, 'ar'), en: await pagePublished(slug, 'en') })),
  );

  const routes: Array<{ path: string; ar: boolean; en: boolean }> = [
    { path: '/', ar: true, en: true },
    { path: '/services', ar: true, en: true },
    { path: '/about', ar: true, en: true },
    { path: '/contact', ar: true, en: true },
    ...[...new Set([...servicesAr, ...servicesEn])].map((slug) => ({
      path: `/services/${slug}`,
      ar: servicesAr.has(slug),
      en: servicesEn.has(slug),
    })),
    ...legal.map((l) => ({ path: `/${l.slug}`, ar: l.ar, en: l.en })),
  ];

  return routes.flatMap((r) => {
    const both = r.ar && r.en;
    const languages = both
      ? { ar: `${origin}${r.path === '/' ? '' : r.path}`, en: `${origin}${localePathname('en', r.path)}` }
      : undefined;
    return LOCALES.filter((l) => r[l]).map((l) => ({
      url: `${origin}${l === 'ar' && r.path === '/' ? '' : localePathname(l, r.path)}`,
      ...(languages ? { alternates: { languages } } : {}),
    }));
  });
}
