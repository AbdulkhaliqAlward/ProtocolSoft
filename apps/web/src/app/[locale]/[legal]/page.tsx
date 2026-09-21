/** Legal page template (§16.7, LD1): narrow prose, zero marketing components.
 *  These pages render ONLY when actually published per locale — while they
 *  remain draft templates they 404 publicly (D-2), which is the correct,
 *  approved Phase 5 state. */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getContent } from '@/lib/internalApi';
import { pageMetadata } from '@/lib/pageMeta';
import { PageBlocks } from '@/components/PageBlocks';
import type { Locale } from '@protocol-soft/shared';

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
    return pageMetadata(locale, '404', '', `/${legal}`);
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
    notFound(); // Draft-only (the Phase 5 state): a real public 404.
  }

  return (
    <>
      <header className="page-header">
        <div className="container page-header__inner">
          <h1>{page.title}</h1>
        </div>
      </header>
      <section className="section" style={{ paddingTop: 'var(--sp-4)' }}>
        <div className="container">
          <PageBlocks blocks={page.blocks} locale={locale} />
        </div>
      </section>
    </>
  );
}
