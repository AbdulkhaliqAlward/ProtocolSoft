/** Services overview: one spec panel per published service (promise, the
 *  first deliverables, a link to the full spec sheet and a preselected
 *  contact form), then help choosing and one closing action. Unpublished
 *  services are omitted upstream by the API — never stubbed. */
import type { Metadata } from 'next';

import type { Locale, PublicContactConfig, PublicServiceSummary } from '@protocol-soft/shared';

import { PageHero, Section, clause } from '@/components/sections';
import { localePath } from '@/components/siteChrome';
import { Spark } from '@/components/Spark';
import { CtaBand } from '@/components/ui';
import { getContent } from '@/lib/internalApi';
import { pageMetadata } from '@/lib/pageMeta';

interface ServiceDetail {
  slug: string;
  title: string;
  heroHeadline: string;
  summary: string;
  deliverables: Array<{ title: string; description?: string | null }>;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = locale === 'en' ? 'en' : 'ar';
  return pageMetadata(
    l,
    l === 'en' ? 'Services' : 'الخدمات',
    l === 'en'
      ? 'Custom systems development, digital products and platforms, and defensive cybersecurity — each with a written scope.'
      : 'تطوير الأنظمة المخصصة، المنتجات والمنصات الرقمية، والأمن السيبراني الدفاعي — كل خدمة بنطاق مكتوب.',
    '/services',
  );
}

const safe = async <D,>(p: Promise<D>, fallback: D): Promise<D> => {
  try {
    return await p;
  } catch {
    return fallback;
  }
};

const T = (value: { ar: string; en: string } | string | null | undefined, locale: Locale): string => {
  if (value == null) return '';
  return typeof value === 'string' ? value : (value[locale] ?? '');
};

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale: Locale = localeParam === 'en' ? 'en' : 'ar';
  const ar = locale === 'ar';

  const [services, contact] = await Promise.all([
    safe(getContent<PublicServiceSummary[]>('/api/internal/content/services', locale), [] as PublicServiceSummary[]),
    safe(getContent<PublicContactConfig>('/api/internal/content/contact-config', locale), null),
  ]);
  const details = await Promise.all(
    services.map((s) => safe(getContent<ServiceDetail>('/api/internal/content/services', locale, { slug: s.slug }), null)),
  );

  return (
    <>
      <PageHero
        title={ar ? 'خدماتنا' : 'Our services'}
        lead={ar
          ? 'ثلاثة مسارات واضحة: نبني الأنظمة، نطلق المنتجات، ونحمي ما يعمل. كل خدمة بنطاق مكتوب ومراحل تسليم محددة.'
          : 'Three clear tracks: we build systems, launch products, and protect what runs. Every service comes with a written scope and defined delivery phases.'}
        crumbs={[{ label: ar ? 'الرئيسية' : 'Home', href: localePath(locale, '/') }, { label: ar ? 'الخدمات' : 'Services' }]}
        aside={services.length > 0 ? (
          <ol className="svc-jump" role="list" aria-label={ar ? 'انتقل إلى خدمة' : 'Jump to a service'}>
            {services.map((s, i) => (
              <li key={s.slug}><a href={`#${s.slug}`}><span className="clause-no">{clause(i + 1)}</span>{T(s.title, locale)}</a></li>
            ))}
          </ol>
        ) : undefined}
      />

      <section className="section" aria-label={ar ? 'الخدمات' : 'Services'}>
        <div className="container">
          {services.length === 0 ? (
            <div className="empty-state" role="status">
              <h2>{ar ? 'تفاصيل الخدمات قيد النشر' : 'Service details are being published'}</h2>
              <p>{ar ? 'يمكنك التواصل معنا مباشرة وسنشرح لك ما نقدمه.' : 'You can contact us directly and we will walk you through what we offer.'}</p>
            </div>
          ) : (
            services.map((s, i) => {
              const d = details[i];
              const href = localePath(locale, `/services/${s.slug}`);
              return (
                <article key={s.slug} id={s.slug} className="svc-panel" aria-labelledby={`${s.slug}-title`} data-reveal>
                  <div className="svc-panel__head">
                    <span className="clause-no">{clause(i + 1)} <Spark size="sm" /></span>
                    <h2 id={`${s.slug}-title`}>{T(s.title, locale)}</h2>
                    <p>{d?.heroHeadline || T(s.summary, locale)}</p>
                    <div className="cluster">
                      <a href={href} className="btn btn--primary">{ar ? 'النطاق والتفاصيل' : 'Scope and details'}</a>
                      <a href={`${localePath(locale, '/contact')}?service=${s.slug}`} className="btn btn--text">
                        {ar ? 'اطلب هذه الخدمة' : 'Request this service'} <span className="btn__arrow" aria-hidden="true">→</span>
                      </a>
                    </div>
                  </div>
                  {d && d.deliverables.length > 0 && (
                    <ul className="svc-panel__list" role="list" aria-label={ar ? 'ما تستلمه' : 'What you receive'}>
                      {d.deliverables.slice(0, 4).map((x) => (
                        <li key={x.title}>
                          <Spark size="sm" />
                          <span><strong>{x.title}</strong>{x.description && <span>{x.description}</span>}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              );
            })
          )}
        </div>
      </section>

      <Section
        no={clause(services.length + 1)}
        title={ar ? 'كيف تختار المسار؟' : 'How to choose a track'}
        lead={ar ? 'إن لم تكن متأكداً، صف التحدي وسنقترح نقطة البداية بصراحة.' : 'If you are not sure, describe the challenge and we will honestly suggest where to start.'}
      >
        <ul className="commitments" role="list">
          <li><Spark /><div><h3>{ar ? 'لديك عملية تحتاج نظاماً' : 'You have a process that needs a system'}</h3><p>{ar ? 'أنظمة داخلية، بوابات، أو ربط بين أنظمة قائمة: تطوير الأنظمة المخصصة.' : 'Internal systems, portals or connecting existing tools: custom software development.'}</p></div></li>
          <li><Spark /><div><h3>{ar ? 'لديك فكرة منتج لعملائك' : 'You have a product idea for customers'}</h3><p>{ar ? 'تطبيق أو منصة تُطلق للمستخدمين وتنمو معهم: المنتجات والمنصات الرقمية.' : 'An app or platform launched to users and grown with them: digital products and platforms.'}</p></div></li>
          <li><Spark /><div><h3>{ar ? 'لديك أنظمة تحتاج حماية' : 'You have systems that need protecting'}</h3><p>{ar ? 'تقييم وضعك الأمني، تحصين، وجاهزية للاستجابة: الأمن السيبراني.' : 'Assessing your posture, hardening and response readiness: cybersecurity.'}</p></div></li>
        </ul>
      </Section>

      <CtaBand
        locale={locale}
        heading={ar ? 'صف لنا التحدي، ونقترح المسار.' : 'Describe the challenge, and we will suggest the track.'}
        ctaLabel={ar ? 'ابدأ مشروعك' : 'Start a project'}
        email={contact?.channels.emailMain || undefined}
        phone={contact?.channels.phone || undefined}
      />
    </>
  );
}
