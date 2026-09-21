/** Services overview (§16.2): page header + one large panel per published
 *  service + compact methodology strip + CTA band. Unpublished services are
 *  omitted upstream by the API — never stubbed. */
import type { Metadata } from 'next';

import { getContent } from '@/lib/internalApi';
import { pageMetadata } from '@/lib/pageMeta';
import { CtaBand } from '@/components/ui';
import type { Locale, PublicContactConfig, PublicServiceSummary } from '@protocol-soft/shared';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = locale === 'en' ? 'en' : 'ar';
  return pageMetadata(
    l,
    l === 'en' ? 'Our Services' : 'خدماتنا',
    l === 'en'
      ? 'Custom systems development, digital products & platforms, and cybersecurity services.'
      : 'تطوير الأنظمة المخصصة، المنتجات والمنصات الرقمية، وخدمات الأمن السيبراني.',
    '/services',
  );
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale: Locale = localeParam === 'en' ? 'en' : 'ar';

  // Locale-scoped API returns plain strings for localized fields; the T helper
  // tolerates both shapes (Phase 4 lesson).
  const T = (value: { ar: string; en: string } | string | null | undefined): string => {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    return value[locale] ?? '';
  };

  let services: PublicServiceSummary[] = [];
  let contact: PublicContactConfig | null = null;
  try {
    services = await getContent<PublicServiceSummary[]>('/api/internal/content/services', locale);
  } catch {
    services = [];
  }
  try {
    contact = await getContent<PublicContactConfig>('/api/internal/content/contact-config', locale);
  } catch {
    contact = null;
  }

  const base = locale === 'ar' ? '' : '/en';

  return (
    <>
      <header className="page-header">
        <div className="container page-header__inner">
          <p className="kicker">{locale === 'ar' ? 'ما نقدمه' : 'What we offer'}</p>
          <h1>{locale === 'ar' ? 'خدماتنا' : 'Our Services'}</h1>
          <p>
            {locale === 'ar'
              ? 'ثلاثة مسارات واضحة: نبني الأنظمة، نطلق المنتجات، ونحمي ما يعمل — كل مشروع بنطاق مكتوب ومراحل مسلّمة.'
              : 'Three clear tracks: we build systems, launch products, and protect what runs — every project with written scope and delivered phases.'}
          </p>
        </div>
      </header>

      <section className="section" style={{ paddingTop: 0 }} data-reveal aria-label={locale === 'ar' ? 'الخدمات' : 'Services'}>
        <div className="container">
          {services.length === 0 ? (
            <p className="muted">{locale === 'ar' ? 'سيتم نشر تفاصيل الخدمات قريباً.' : 'Service details will be published soon.'}</p>
          ) : (
            /* One consistent editorial system: [index | content | CTA] — no
               alternating CTA placement (Phase 5 visual revision). */
            services.map((s, i) => (
              <div key={s.slug} className="service-panel">
                <span className="service-panel__index bidi" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <div className="service-panel__body">
                  <h2>{T(s.title)}</h2>
                  <p>{T(s.summary)}</p>
                </div>
                <div className="service-panel__cta">
                  <a href={`${base}/services/${s.slug}`} className="btn btn--soft">
                    {locale === 'ar' ? 'استكشف الخدمة' : 'Explore the service'}
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <CtaBand
        locale={locale}
        heading={locale === 'ar' ? 'لست متأكداً أي مسار يناسبك؟' : 'Not sure which track fits?'}
        body={locale === 'ar' ? 'أخبرنا عن تحديك، وسنقترح المسار الأنسب بصراحة.' : 'Tell us your challenge and we will honestly suggest the right track.'}
        ctaLabel={locale === 'ar' ? 'ابدأ مشروعك' : 'Start a Project'}
        email={contact?.channels.emailMain || undefined}
        phone={contact?.channels.phone || undefined}
      />
    </>
  );
}
