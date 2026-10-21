/** Central env access — keeps secret usage greppable for verify:no-db audits. */
export const internalCmsUrl = (): string => process.env.CMS_INTERNAL_URL ?? 'http://localhost:3001';

/** Canonical public origin (no trailing slash) for metadata, sitemap, JSON-LD. */
export const siteUrl = (): string => (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://protosoftdev.com').replace(/\/+$/, '');

/** Public path for a locale: Arabic is unprefixed, English lives under /en. */
export const localePathname = (locale: 'ar' | 'en', path: string): string =>
  locale === 'en' ? `/en${path === '/' ? '' : path}` : path;
