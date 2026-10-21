/** About: who we are and how we work, from the published "about" page in the
 *  CMS. A draft-only page shows an honest empty state, never placeholder copy.
 *  The team section stays out until published team content exists. */
import type { Metadata } from 'next';

import type { Locale, PublicContactConfig } from '@protocol-soft/shared';

import { PageBlocks } from '@/components/PageBlocks';
import { PageHero } from '@/components/sections';
import { localePath } from '@/components/siteChrome';
import { CtaBand } from '@/components/ui';
import { getOptional } from '@/lib/internalApi';
import { pageMetadata } from '@/lib/pageMeta';

interface PageData {
  slug: string;
  title: string;
  blocks: unknown;
  seo: { title?: string | null; description?: string | null } | null;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = locale === 'en' ? 'en' : 'ar';
  return pageMetadata(
    l,
    l === 'en' ? 'About us' : 'من نحن',
    l === 'en'
      ? 'Protocol Soft builds reliable software and protects it: who we are and the principles we work by.'
      : 'بروتوكول سوفت تبني أنظمة موثوقة وتحميها: من نحن والمبادئ التي نعمل بها.',
    '/about',
  );
}


export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale: Locale = localeParam === 'en' ? 'en' : 'ar';
  const ar = locale === 'ar';

  const [page, contact] = await Promise.all([
    getOptional<PageData>('/api/internal/content/pages', locale, { slug: 'about' }),
    getOptional<PublicContactConfig>('/api/internal/content/contact-config', locale),
  ]);

  return (
    <>
      <PageHero
        title={page?.title ?? (ar ? 'من نحن' : 'About us')}
        lead={ar
          ? 'شركة هندسة برمجيات وأمن سيبراني. نبني أنظمة رقمية موثوقة، ونحميها، ثم نبقى بعد الإطلاق.'
          : 'A software engineering and cybersecurity company. We build reliable digital systems, protect them, and stay after launch.'}
        crumbs={[{ label: ar ? 'الرئيسية' : 'Home', href: localePath(locale, '/') }, { label: ar ? 'من نحن' : 'About' }]}
      />

      {page ? (
        <PageBlocks blocks={page.blocks} locale={locale} fallbackHeading={ar ? 'قصتنا' : 'Our story'} />
      ) : (
        <section className="section">
          <div className="container">
            <div className="empty-state" role="status">
              <h2>{ar ? 'هذه الصفحة لم تُنشر بعد' : 'This page is not published yet'}</h2>
              <p>{ar ? 'يمكنك التعرف على خدماتنا أو التواصل معنا مباشرة.' : 'You can explore our services or contact us directly.'}</p>
            </div>
          </div>
        </section>
      )}

      <CtaBand
        locale={locale}
        heading={ar ? 'يسعدنا أن نسمع عن مشروعك.' : 'We would like to hear about your project.'}
        ctaLabel={ar ? 'ابدأ مشروعك' : 'Start a project'}
        email={contact?.channels.emailMain || undefined}
        phone={contact?.channels.phone || undefined}
      />
    </>
  );
}
