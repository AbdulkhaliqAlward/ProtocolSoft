/** Services overview: one panel per published service (what it is, who it
 *  fits, a link to the full spec sheet and a preselected contact form), then
 *  one closing action. The spec sheet itself (deliverables, process) lives on
 *  each service page and is not repeated here. Unpublished services are
 *  omitted upstream by the API — never stubbed. */
import type { Metadata } from 'next';
import Link from 'next/link';

import type { Locale, PublicServiceSummary } from '@protocol-soft/shared';

import { PageHero, clause } from '@/components/sections';
import { localePath } from '@/components/siteChrome';
import { Spark } from '@/components/Spark';
import { CtaBand } from '@/components/ui';
import { getOptional } from '@/lib/internalApi';
import { pageMetadata } from '@/lib/pageMeta';

/** Who each track fits, and the action that starts it. */
const FIT: Record<string, Record<Locale, { fits: string[]; action: string }>> = {
  'custom-software': {
    ar: {
      fits: ['تدير عملية يدوياً، أو تتوزع بين الجداول والرسائل.', 'لا تناسبك الأنظمة الجاهزة دون حلول التفافية كثيرة.', 'تحتاج أن تتحدث أنظمتك القائمة مع بعضها.'],
      action: 'ناقش نظامك',
    },
    en: {
      fits: ['You run a process by hand, or across spreadsheets and email.', 'Off-the-shelf tools only fit with constant workarounds.', 'You need your existing systems to talk to each other.'],
      action: 'Discuss your system',
    },
  },
  'digital-products': {
    ar: {
      fits: ['لديك فكرة منتج لعملائك وتريد اختبارها بجدية.', 'لديك منصة قائمة تحتاج إعادة بناء أو توسعاً.', 'تريد التصميم والبناء والإطلاق لدى فريق واحد.'],
      action: 'ناقش فكرة منتجك',
    },
    en: {
      fits: ['You have a product idea for customers and want to test it properly.', 'An existing platform needs rebuilding or scaling.', 'You want design, build and launch with one team.'],
      action: 'Discuss your product idea',
    },
  },
  cybersecurity: {
    ar: {
      fits: ['أنظمتك تعمل، ولا تعرف بدقة أين تقف أمنياً.', 'تستعد لمتطلبات تنظيمية أو مراجعة قادمة.', 'تريد أن يعرف فريقك ما يفعله عند وقوع حادث.'],
      action: 'اطلب تقييماً أمنياً',
    },
    en: {
      fits: ['Your systems run, but you do not know exactly where you stand.', 'You are preparing for regulatory requirements or an upcoming review.', 'You want your team to know what to do when an incident happens.'],
      action: 'Request a security assessment',
    },
  },
};

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


const T = (value: { ar: string; en: string } | string | null | undefined, locale: Locale): string => {
  if (value == null) return '';
  return typeof value === 'string' ? value : (value[locale] ?? '');
};

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale: Locale = localeParam === 'en' ? 'en' : 'ar';
  const ar = locale === 'ar';

  const services = await getOptional<PublicServiceSummary[], PublicServiceSummary[]>('/api/internal/content/services', locale, undefined, []);

  return (
    <>
      <PageHero
        title={ar ? 'خدماتنا' : 'Our services'}
        lead={ar
          ? 'ثلاثة مسارات واضحة: نبني الأنظمة، نطلق المنتجات، ونحمي ما يعمل. كل خدمة بنطاق مكتوب ومراحل تسليم محددة.'
          : 'Three clear tracks: we build systems, launch products, and protect what runs. Every service comes with a written scope and defined delivery phases.'}
        crumbs={[{ label: ar ? 'الرئيسية' : 'Home', href: localePath(locale, '/') }, { label: ar ? 'الخدمات' : 'Services' }]}
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
              const href = localePath(locale, `/services/${s.slug}`);
              const fit = FIT[s.slug]?.[locale];
              return (
                <article key={s.slug} id={s.slug} className="svc-panel" aria-labelledby={`${s.slug}-title`} data-reveal>
                  <div className="svc-panel__head">
                    <span className="clause-no">{clause(i + 1)}</span>
                    <h2 id={`${s.slug}-title`}>{T(s.title, locale)}</h2>
                    <p>{T(s.summary, locale)}</p>
                    <div className="cluster">
                      <Link href={href} className="btn btn--primary">{ar ? 'النطاق والتفاصيل' : 'Scope and details'}</Link>
                      {fit && (
                        <Link href={`${localePath(locale, '/contact')}?service=${s.slug}`} className="btn btn--text">
                          {fit.action} <span className="btn__arrow" aria-hidden="true">→</span>
                        </Link>
                      )}
                    </div>
                  </div>
                  {fit && (
                    <div className="svc-panel__fit">
                      <h3>{ar ? 'مناسب لك إذا' : 'A fit if'}</h3>
                      <ul className="svc-panel__list" role="list">
                        {fit.fits.map((f) => (
                          <li key={f}><Spark size="sm" /><span>{f}</span></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </section>

      <CtaBand
        locale={locale}
        heading={ar ? 'لست متأكداً من المسار المناسب؟' : 'Not sure which track fits?'}
        body={ar ? 'صف لنا التحدي، ونقترح عليك من أين تبدأ.' : 'Describe the challenge, and we will suggest where to start.'}
        ctaLabel={ar ? 'احجز جلسة استكشاف' : 'Book a discovery session'}
      />
    </>
  );
}
