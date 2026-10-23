/** About: who we are and how we work, from the published "about" page in the
 *  CMS. A draft-only page shows an honest empty state, never placeholder copy.
 *  The team section appears only once team members are published and visible. */
import type { Metadata } from 'next';

import type { Locale, PublicTeamMember } from '@protocol-soft/shared';

import { PageBlocks } from '@/components/PageBlocks';
import { RichText } from '@/components/RichText';
import { PageHero, Section } from '@/components/sections';
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

  const [page, team] = await Promise.all([
    getOptional<PageData>('/api/internal/content/pages', locale, { slug: 'about' }),
    getOptional<PublicTeamMember[], PublicTeamMember[]>('/api/internal/content/team', locale, undefined, []),
  ]);
  const photoId = (photo: unknown): number | string | null =>
    photo != null && typeof photo === 'object' ? ((photo as { id?: number | string }).id ?? null) : (photo as number | string | null);

  return (
    <>
      <PageHero
        title={page?.title ?? (ar ? 'من نحن' : 'About us')}
        lead={ar
          ? 'نعمل مع الجهات التي تريد تقنية تعمل كما ينبغي، وتبقى كذلك بعد سنوات من إطلاقها.'
          : 'We work with organisations that want technology that works as it should, and keeps working years after launch.'}
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

      {team.length > 0 && (
        <Section id="team" title={ar ? 'فريقنا' : 'Our team'} wide>
          <ul className="team" role="list">
            {team.map((m) => {
              const id = photoId(m.photo);
              return (
                <li key={m.name} className="team__member">
                  {id != null ? (
                    // Gated media proxy: unscreened or private media 404s.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/media/${id}`} alt="" loading="lazy" decoding="async" className="team__avatar team__avatar--photo" />
                  ) : (
                    <span className="team__avatar" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
                      </svg>
                    </span>
                  )}
                  <div className="team__text">
                    <h3 className="team__name">{m.name}</h3>
                    <p className="team__role">{m.jobTitle}</p>
                  </div>
                  {m.bio != null && <RichText data={m.bio} className="prose team__bio" />}
                  {m.linkedinUrl && (
                    <a href={m.linkedinUrl} target="_blank" rel="noopener noreferrer" className="team__link">LinkedIn</a>
                  )}
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      <CtaBand
        locale={locale}
        heading={ar ? 'يسعدنا أن نسمع عن مشروعك.' : 'We would like to hear about your project.'}
        ctaLabel={ar ? 'احجز جلسة استكشاف' : 'Book a discovery session'}
      />
    </>
  );
}
