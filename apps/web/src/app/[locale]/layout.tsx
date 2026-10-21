/**
 * Root layout of the public site: the document only (<html lang dir>, fonts,
 * global CSS, pre-paint theme). The locale comes from the URL segment (Arabic
 * is served at "/" through the proxy rewrite to /ar), never from request
 * headers, so every page can be rendered once and cached. Site chrome (header,
 * footer, data) lives one level down in (site)/layout.tsx so that
 * (site)/not-found.tsx can catch notFound() inside both layouts — a not-found
 * file in the root layout's own segment would render outside it.
 */
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { LOCALE_DIR, type Locale } from '@protocol-soft/shared';

import { DocumentShell } from '@/components/DocumentShell';
import { siteUrl } from '@/lib/env';

/** No build-time render (the CMS is not reachable while the image builds):
 *  every page renders on its first request and is then served from cache. */
export async function generateStaticParams(): Promise<Array<{ locale: string }>> {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const en = locale === 'en';
  return {
    metadataBase: new URL(siteUrl()),
    robots: { index: true, follow: true },
    title: { default: en ? 'Protocol Soft' : 'بروتوكول سوفت', template: en ? '%s | Protocol Soft' : '%s | بروتوكول سوفت' },
    description: en
      ? 'Custom systems, digital products and platforms, and defensive cybersecurity.'
      : 'تطوير الأنظمة المخصصة، بناء المنتجات والمنصات الرقمية، وخدمات الأمن السيبراني.',
  };
}

export default async function LocaleRootLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  // The proxy only routes /ar or /en here; never notFound() in a root layout.
  const { locale: param } = await params;
  const locale: Locale = param === 'en' ? 'en' : 'ar';
  return <DocumentShell lang={locale} dir={LOCALE_DIR[locale]}>{children}</DocumentShell>;
}
