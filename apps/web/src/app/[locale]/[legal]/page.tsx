/** Legal pages (privacy, terms): plain reading layout, no marketing blocks.
 *  They render ONLY when published per locale; while they remain draft
 *  templates they return a real public 404. */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import type { Locale } from '@protocol-soft/shared';

import { PageBlocks } from '@/components/PageBlocks';
import { PageHero } from '@/components/sections';
import { localePath } from '@/components/siteChrome';
import { getContent } from '@/lib/internalApi';
import { notFoundMetadata, pageMetadata } from '@/lib/pageMeta';

interface PageData {
  slug: string;
  title: string;
  blocks: unknown;
  seo: { title?: string | null; description?: string | null } | null;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; legal: string }> }): Promise<Metadata> {
  const { locale: localeParam, legal } = await params;
  const locale: Locale = localeParam === 'en' ? 'en' : 'ar';
  try {
    const page = await getContent<PageData>('/api/internal/content/pages', locale, { slug: legal });
    return pageMetadata(locale, page.title, page.seo?.description || page.title, `/${legal}`);
  } catch {
    return notFoundMetadata();
  }
}

export default async function LegalPage({ params }: { params: Promise<{ locale: string; legal: string }> }) {
  const { locale: localeParam, legal } = await params;
  const locale: Locale = localeParam === 'en' ? 'en' : 'ar';
  if (legal !== 'privacy' && legal !== 'terms') notFound();

  let page: PageData;
  try {
    page = await getContent<PageData>('/api/internal/content/pages', locale, { slug: legal });
  } catch {
    notFound(); // draft-only: a real public 404
  }

  return (
    <>
      <PageHero
        title={page.title}
        crumbs={[{ label: locale === 'ar' ? 'الرئيسية' : 'Home', href: localePath(locale, '/') }, { label: page.title }]}
      />
      <PageBlocks blocks={page.blocks} locale={locale} fallbackHeading={page.title} />
    </>
  );
}
