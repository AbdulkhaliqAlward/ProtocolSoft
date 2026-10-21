import type { Metadata } from 'next';

import type { Locale } from '@protocol-soft/shared';

import { localePathname } from '@/lib/env';

const SITE_NAME: Record<Locale, string> = { ar: 'بروتوكول سوفت', en: 'Protocol Soft' };

/** Per-page metadata with the approved alternates pattern (ar at unprefixed
 *  path, en under /en). Titles join the site template set in [locale]/layout.
 *  The share image is set explicitly: a page-level `openGraph` object replaces
 *  the parent's, so the app/opengraph-image.png convention alone is dropped. */
const SHARE_IMAGE = { url: '/opengraph-image.png', width: 1200, height: 630, alt: 'Protocol Soft — بروتوكول سوفت' };

export const pageMetadata = (locale: Locale, title: string, description: string, path: string): Metadata => ({
  title,
  description,
  alternates: {
    canonical: localePathname(locale, path),
    languages: { ar: path, en: localePathname('en', path), 'x-default': path },
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME[locale],
    title,
    description,
    url: localePathname(locale, path),
    locale: locale === 'ar' ? 'ar_SA' : 'en_US',
    alternateLocale: locale === 'ar' ? ['en_US'] : ['ar_SA'],
    images: [SHARE_IMAGE],
  },
  twitter: { card: 'summary_large_image', title, description, images: [SHARE_IMAGE.url] },
});

/** Metadata for a slug that resolved to nothing: never indexed. */
export const notFoundMetadata = (): Metadata => ({ title: '404', robots: { index: false, follow: false } });
