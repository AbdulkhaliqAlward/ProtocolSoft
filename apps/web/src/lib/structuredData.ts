/**
 * schema.org JSON-LD builders. Only facts the CMS actually publishes are
 * emitted — no invented address, phone, founding date, ratings or reviews.
 * Contact properties appear only once they are configured in the CMS.
 */
import type { Locale } from '@protocol-soft/shared';

import { localePathname, siteUrl } from '@/lib/env';

const ORG_ID = () => `${siteUrl()}/#organization`;
const NAMES = { ar: 'بروتوكول سوفت', en: 'Protocol Soft' } as const;

export const organizationLd = (
  locale: Locale,
  opts: { description?: string; email?: string; phone?: string; sameAs?: string[] } = {},
) => ({
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': ORG_ID(),
  name: NAMES[locale],
  alternateName: NAMES[locale === 'ar' ? 'en' : 'ar'],
  url: `${siteUrl()}${localePathname(locale, '/')}`,
  logo: `${siteUrl()}/brand/icon-512.png`,
  image: `${siteUrl()}/opengraph-image.png`,
  ...(opts.description ? { description: opts.description } : {}),
  ...(opts.email ? { email: opts.email } : {}),
  ...(opts.phone ? { telephone: opts.phone } : {}),
  ...(opts.sameAs && opts.sameAs.length > 0 ? { sameAs: opts.sameAs } : {}),
  knowsLanguage: ['ar', 'en'],
});

export const websiteLd = (locale: Locale) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${siteUrl()}/#website`,
  name: NAMES[locale],
  url: `${siteUrl()}${localePathname(locale, '/')}`,
  inLanguage: locale,
  publisher: { '@id': ORG_ID() },
});

export const serviceLd = (locale: Locale, s: { slug: string; title: string; description: string }) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: s.title,
  description: s.description,
  url: `${siteUrl()}${localePathname(locale, `/services/${s.slug}`)}`,
  provider: { '@id': ORG_ID() },
  inLanguage: locale,
});

export const faqLd = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
});

export const breadcrumbLd = (locale: Locale, items: Array<{ name: string; path: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: `${siteUrl()}${localePathname(locale, it.path)}`,
  })),
});
