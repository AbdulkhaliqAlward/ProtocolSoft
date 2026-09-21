import type { Metadata } from 'next';

import type { Locale } from '@protocol-soft/shared';

/** Per-page metadata with the approved alternates pattern (ar at unprefixed
 *  path, en under /en). Titles join the site template set in [locale]/layout. */
export const pageMetadata = (locale: Locale, title: string, description: string, path: string): Metadata => ({
  title,
  description,
  alternates: {
    canonical: locale === 'en' ? `/en${path === '/' ? '' : path}` : path,
    languages: { ar: path, en: `/en${path === '/' ? '' : path}` },
  },
});
