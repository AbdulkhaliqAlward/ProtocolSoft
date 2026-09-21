/** About (§16.4): narrative + values from the pages collection. Renders ONLY
 *  published, per-locale content; a draft-only page stays an honest empty
 *  state (never placeholder copy). No team section markup while hidden (D6). */
import type { Metadata } from 'next';

import { getContent } from '@/lib/internalApi';
import { pageMetadata } from '@/lib/pageMeta';
import { PageBlocks } from '@/components/PageBlocks';
import { CtaBand } from '@/components/ui';
import type { Locale, PublicContactConfig } from '@protocol-soft/shared';

interface PageData {
  slug: string;
  title: string;
  blocks: unknown;
  seo: { title?: string | null; description?: string | null } | null;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = locale === 'en' ? 'en' : 'ar';
  return pageMetadata(l, l === 'en' ? 'About Us' : 'من نحن', l === 'en' ? 'About Protocol Soft.' : 'عن بروتوكول سوفت.', '/about');
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale: Locale = localeParam === 'en' ? 'en' : 'ar';

  let page: PageData | null = null;
  try {
    page = await getContent<PageData>('/api/internal/content/pages', locale, { slug: 'about' });
  } catch {
    page = null;
  }

  let contact: PublicContactConfig | null = null;
  try {
    contact = await getContent<PublicContactConfig>('/api/internal/content/contact-config', locale);
  } catch {
    contact = null;
  }

  return (
    <>
      <header className="page-header">
        <div className="container page-header__inner">
          <p className="kicker">{locale === 'ar' ? 'بروتوكول سوفت' : 'Protocol Soft'}</p>
          <h1>{page?.title ?? (locale === 'ar' ? 'من نحن' : 'About Us')}</h1>
        </div>
      </header>

      <section className="section" style={{ paddingTop: 'var(--sp-6)' }} data-reveal>
        <div className="container">
          {page ? (
            <PageBlocks blocks={page.blocks} locale={locale} />
          ) : (
            <div className="empty-state" role="status">
              <h2>{locale === 'ar' ? 'هذه الصفحة لم تُنشر بعد' : 'This page is not published yet'}</h2>
              <p>{locale === 'ar' ? 'سنشارك قصتنا قريباً. حتى ذلك الحين، يمكنك التعرف على خدماتنا أو التواصل معنا مباشرة.' : 'We will share our story soon. In the meantime, explore our services or contact us directly.'}</p>
            </div>
          )}
        </div>
      </section>

      <CtaBand
        locale={locale}
        heading={locale === 'ar' ? 'يسعدنا أن نسمع عن مشروعك.' : 'We would love to hear about your project.'}
        ctaLabel={locale === 'ar' ? 'تواصل معنا' : 'Contact us'}
        email={contact?.channels.emailMain || undefined}
        phone={contact?.channels.phone || undefined}
      />
    </>
  );
}
