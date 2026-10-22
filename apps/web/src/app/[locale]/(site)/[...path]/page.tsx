/** Catch-all: serves the legal pages (/privacy, /terms) and turns every other
 *  unknown path into a real 404 inside the site layout. Legal pages render
 *  ONLY when published per locale; draft templates return a 404. */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import type { Locale } from '@protocol-soft/shared';

import { LegalDocument, legalClauses } from '@/components/LegalDocument';
import { PageBlocks } from '@/components/PageBlocks';
import { PageHero } from '@/components/sections';
import { localePath } from '@/components/siteChrome';
import { getOptional } from '@/lib/internalApi';
import { notFoundMetadata, pageMetadata } from '@/lib/pageMeta';

interface PageData {
  slug: string;
  title: string;
  blocks: unknown;
  seo: { title?: string | null; description?: string | null } | null;
}

type Params = Promise<{ locale: string; path: string[] }>;
const legalSlug = (path: string[]): 'privacy' | 'terms' | null =>
  path.length === 1 && (path[0] === 'privacy' || path[0] === 'terms') ? path[0] : null;

export async function generateStaticParams(): Promise<Array<{ path: string[] }>> {
  return [];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale: localeParam, path } = await params;
  const legal = legalSlug(path);
  if (!legal) return notFoundMetadata();
  const locale: Locale = localeParam === 'en' ? 'en' : 'ar';
  const page = await getOptional<PageData>('/api/internal/content/pages', locale, { slug: legal });
  return page ? pageMetadata(locale, page.title, page.seo?.description || page.title, `/${legal}`) : notFoundMetadata();
}

export default async function CatchAllPage({ params }: { params: Params }) {
  const { locale: localeParam, path } = await params;
  const locale: Locale = localeParam === 'en' ? 'en' : 'ar';
  const legal = legalSlug(path);
  if (!legal) notFound();

  const page = await getOptional<PageData>('/api/internal/content/pages', locale, { slug: legal });
  if (!page) notFound(); // draft-only: a real public 404
  const clauses = legalClauses(page.blocks);

  return (
    <>
      <PageHero
        title={page.title}
        crumbs={[{ label: locale === 'ar' ? 'الرئيسية' : 'Home', href: localePath(locale, '/') }, { label: page.title }]}
      />
      {clauses ? (
        <LegalDocument clauses={clauses} locale={locale} />
      ) : (
        <PageBlocks blocks={page.blocks} locale={locale} fallbackHeading={page.title} />
      )}
    </>
  );
}
