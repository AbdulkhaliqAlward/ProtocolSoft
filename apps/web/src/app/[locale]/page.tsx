/**
 * Homepage (Phase 5, §16.1): hero + value/differentiators + services overview +
 * methodology + secure-by-design + final CTA. Every section is data-driven from
 * the Internal Public Content API with honest empty behavior (§6.9: empties are
 * hidden, never placeholder text).
 * Visual treatment: deep purple hero with geometric texture, warm cream body,
 * amber accents (palette derived from the company logo).
 * Featured-project section renders ONLY for a gate-passing case study (Phase 2
 * §6.3); with D-4 keeping case studies unpublished, it never renders in Phase 5.
 */
import type { Metadata } from 'next';

import {
  getContent,
} from '@/lib/internalApi';
import { pageMetadata } from '@/lib/pageMeta';
import { CtaBand, SectionHeading } from '@/components/ui';
import { InitiativeCard } from '@/components/InitiativeCard';
import type { Locale, PublicContactConfig, PublicInitiativeCard, PublicServiceSummary, PublicSiteSettings } from '@protocol-soft/shared';

interface HomepageData {
  published: boolean;
  hero: {
    enabled: boolean;
    kicker: { ar: string; en: string } | null;
    headline: { ar: string; en: string } | null;
    subheadline: { ar: string; en: string } | null;
    primaryCtaLabel: { ar: string; en: string } | null;
    secondaryCtaLabel: { ar: string; en: string } | null;
    secondaryCtaTarget: { ar: string; en: string } | null;
    backgroundPattern: string | null;
  };
  sections: {
    valueStatementEnabled: boolean;
    valueStatement: { ar: string; en: string } | null;
    differentiators: Array<{ title: { ar: string; en: string }; description: { ar: string; en: string } }>;
    servicesOverviewEnabled: boolean;
    servicesHeading: { ar: string; en: string } | null;
    whyEnabled: boolean;
    whyItems: Array<{ title: { ar: string; en: string }; description?: { ar: string; en: string } }>;
    methodologyEnabled: boolean;
    methodologySteps: Array<{ title: { ar: string; en: string }; promise: { ar: string; en: string } }>;
    featuredProject: { enabled: boolean; heading: { ar: string; en: string } | null; project: unknown; fallbackMode: string; neutralAlternative: unknown };
    technicalInitiatives: { enabled: boolean; heading: { ar: string; en: string } | null; initiatives: PublicInitiativeCard[] };
    secureByDesignEnabled: boolean;
    secureByDesign: { ar: string; en: string } | null;
  };
  finalCta: { enabled: boolean; heading: { ar: string; en: string } | null; body: { ar: string; en: string } | null; ctaLabel: { ar: string; en: string } | null; ctaTarget: { ar: string; en: string } | null };
}

const T = (value: { ar: string; en: string } | string | null | undefined, locale: Locale): string => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return value[locale] ?? '';
};

const show = (value: string): boolean => value.trim().length > 0;

/** Stable React key from a localized field: the locale-scoped API returns plain
 *  strings while card-shaped data keeps {ar,en} objects. */
const keyOf = (value: { ar: string; en: string } | string): string =>
  typeof value === 'string' ? value : value.en || value.ar;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = locale === 'en' ? 'en' : 'ar';
  return pageMetadata(
    l,
    l === 'en' ? 'Protocol Soft — Software Engineering & Cybersecurity' : 'بروتوكول سوفت — هندسة البرمجيات والأمن السيبراني',
    l === 'en'
      ? 'Custom systems, digital products and platforms, and cybersecurity services.'
      : 'تطوير الأنظمة المخصصة، بناء المنتجات والمنصات الرقمية، وخدمات الأمن السيبراني.',
    '/',
  );
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale: Locale = localeParam === 'en' ? 'en' : 'ar';

  let settings: PublicSiteSettings | null = null;
  let homepage: HomepageData | null = null;
  let services: PublicServiceSummary[] = [];
  let contact: PublicContactConfig | null = null;

  try {
    settings = await getContent<PublicSiteSettings>('/api/internal/content/site-settings', locale);
  } catch {
    settings = null;
  }
  try {
    homepage = await getContent<HomepageData>('/api/internal/content/homepage', locale);
  } catch {
    homepage = null;
  }
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

  const hero = homepage?.hero;
  const sections = homepage?.sections;
  const finalCta = homepage?.finalCta;
  const kicker = T(hero?.kicker, locale) || (locale === 'ar' ? 'هندسة البرمجيات والأمن السيبراني' : 'Software Engineering & Cybersecurity');
  const headline = show(T(hero?.headline, locale)) ? T(hero?.headline, locale) : T(settings?.tagline, locale) || (locale === 'ar' ? 'نبني أنظمة رقمية موثوقة، ونحميها لتعمل بثقة.' : 'Trusted digital systems, built and protected to run with confidence.');
  const subheadline = T(hero?.subheadline, locale);
  const primaryCta = T(hero?.primaryCtaLabel, locale) || (locale === 'ar' ? 'ابدأ مشروعك' : 'Start a Project');
  const secondaryCta = T(hero?.secondaryCtaLabel, locale);
  const secondaryTarget = T(hero?.secondaryCtaTarget, locale) || '/services';

  const valueStatement = T(sections?.valueStatement, locale);
  const differentiators = (sections?.differentiators ?? []).filter((d) => show(T(d.title, locale)));
  const servicesEnabled = sections?.servicesOverviewEnabled !== false;
  const servicesHeading = T(sections?.servicesHeading, locale) || (locale === 'ar' ? 'خدماتنا' : 'Our Services');
  const whyItems = sections?.whyEnabled === false ? [] : (sections?.whyItems ?? []).filter((w) => show(T(w.title, locale)));
  const methodologySteps = sections?.methodologyEnabled === false ? [] : (sections?.methodologySteps ?? []).filter((s) => show(T(s.title, locale)));
  const secureByDesign = sections?.secureByDesignEnabled === false ? null : T(sections?.secureByDesign, locale);
  const initiatives = sections?.technicalInitiatives.enabled === true ? (sections.technicalInitiatives.initiatives ?? []) : [];

  // Featured project renders only when the gate passed upstream (§6.3). D-4 keeps
  // case studies unpublished in Phase 5, so `project` is always null here.
  const featured = sections?.featuredProject.project;

  return (
    <>
      {/* ── Hero: deep-purple full-bleed section with geometric shapes
             for visual texture. Large editorial typography serves as the
             primary visual element. Amber accents on dark purple. ── */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__geo" aria-hidden="true" />
        <div className="container hero__inner">
          {show(kicker) && <p className="kicker">{kicker}</p>}
          <h1 id="hero-title">{headline}</h1>
          {show(subheadline) && <p className="hero__sub">{subheadline}</p>}
          <div className="hero__ctas">
            <a href={locale === 'ar' ? '/contact' : '/en/contact'} className="btn btn--primary btn--lg">{primaryCta}</a>
            {show(secondaryCta) && (
              <a href={locale === 'ar' ? secondaryTarget : `/en${secondaryTarget}`} className="link-arrow">
                <span>{secondaryCta}</span>
                <span className="link-arrow__glyph" aria-hidden="true">←</span>
              </a>
            )}
          </div>
          <span className="hero__rule" aria-hidden="true" />
          <ul className="trust-row">
            <li>{locale === 'ar' ? 'شريك تقني طويل الأمد' : 'A long-term technology partner'}</li>
            <li>{locale === 'ar' ? 'الأمان من اليوم الأول' : 'Secure by design'}</li>
            <li>{locale === 'ar' ? 'تواصل بالعربية والإنجليزية' : 'Bilingual communication'}</li>
          </ul>
        </div>
      </section>

      {/* ── Value statement + differentiators ── */}
      {show(valueStatement) && (
        <section className="section" aria-labelledby="value-title" data-reveal>
          <div className="container">
            <SectionHeading title={locale === 'ar' ? 'لماذا بروتوكول سوفت' : 'Why Protocol Soft'} />
            <p className="measure" style={{ fontSize: 'var(--fs-body-lg)', color: 'var(--color-text-muted)' }}>{valueStatement}</p>
            {differentiators.length > 0 && (
              <div className="grid grid--3" style={{ marginTop: 'var(--sp-7)' }}>
                {differentiators.map((d) => (
                  <div key={keyOf(d.title)} className="card card--feature">
                    <h3>{T(d.title, locale)}</h3>
                    <p>{T(d.description, locale)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Services overview (auto-derived from published services) ── */}
      {servicesEnabled && (
        <section className="section" id="services" aria-labelledby="services-title" style={{ paddingTop: 0 }} data-reveal>
          <div className="container">
            <SectionHeading
              title={servicesHeading}
              lead={locale === 'ar' ? 'ثلاثة مسارات نعمل بها مع فرق تقنية وأعمال.' : 'Three tracks we work in with technical and business teams.'}
            />
            {services.length === 0 ? (
              <p className="muted">{locale === 'ar' ? 'سيتم نشر تفاصيل الخدمات قريباً.' : 'Service details will be published soon.'}</p>
            ) : (
              <div className="grid grid--3">
                {services.map((s) => (
                  <a key={s.slug} href={locale === 'ar' ? `/services/${s.slug}` : `/en/services/${s.slug}`} className="card">
                    <h3>{T(s.title, locale)}</h3>
                    <p>{T(s.summary, locale)}</p>
                    <span className="link-arrow">
                      <span>{locale === 'ar' ? 'اعرف المزيد' : 'Learn more'}</span>
                      <span className="link-arrow__glyph" aria-hidden="true">←</span>
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Why items (rendered only when CMS supplies them — no fake content) ── */}
      {whyItems.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }} aria-label={locale === 'ar' ? 'ما يميزنا' : 'What sets us apart'} data-reveal>
          <div className="container grid grid--3">
            {whyItems.map((w) => (
              <div key={keyOf(w.title)} className="card card--feature">
                <h3>{T(w.title, locale)}</h3>
                {w.description && <p>{T(w.description, locale)}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Methodology (§16.1.5) ── */}
      {methodologySteps.length > 0 && (
        <section className="section" id="methodology" aria-labelledby="methodology-title" style={{ paddingTop: 0 }} data-reveal>
          <div className="container">
            <SectionHeading title={locale === 'ar' ? 'طريقة عملنا' : 'How we work'} />
            <ol className="steps">
              {methodologySteps.map((s) => (
                <li key={keyOf(s.title)} className="step">
                  <h3>{T(s.title, locale)}</h3>
                  <p>{T(s.promise, locale)}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ── Featured project: gate-passing case study ONLY; otherwise omitted ── */}
      {featured != null && (
        <section className="section" style={{ paddingTop: 0 }} aria-label={locale === 'ar' ? 'مشروع مميز' : 'Featured project'} data-reveal>
          <div className="container">
            <SectionHeading title={locale === 'ar' ? 'مشروع مميز' : 'Featured Project'} />
            {/* Gate-passing case-study card renders here in a future approved phase (D-4). */}
          </div>
        </section>
      )}

      {/* ── Technical initiatives — only when the section is enabled (D2: off at launch) ── */}
      {initiatives.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }} aria-label={T(sections?.technicalInitiatives.heading, locale) || (locale === 'ar' ? 'مبادرات تقنية' : 'Technical initiatives')} data-reveal>
          <div className="container">
            <SectionHeading title={T(sections?.technicalInitiatives.heading, locale) || (locale === 'ar' ? 'مبادرات تقنية' : 'Technical initiatives')} />
            {initiatives.map((i) => (
              <InitiativeCard key={keyOf(i.title)} initiative={i} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* ── Secure by design (content-led editorial section) ── */}
      {secureByDesign && show(secureByDesign) && (
        <section className="section" style={{ paddingTop: 0 }} aria-labelledby="secure-title" data-reveal>
          <div className="container">
            <div className="measure">
              <SectionHeading
                title={locale === 'ar' ? 'الأمان من اليوم الأول' : 'Secure by design'}
              />
              <p style={{ color: 'var(--color-text-muted)' }}>{secureByDesign}</p>
              <a href={locale === 'ar' ? '/services/cybersecurity' : '/en/services/cybersecurity'} className="btn btn--soft" style={{ marginTop: 'var(--sp-4)' }}>
                {locale === 'ar' ? 'خدمات الأمن السيبراني' : 'Cybersecurity services'}
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ── Final CTA band ── */}
      {finalCta?.enabled !== false && (
        <CtaBand
          locale={locale}
          heading={show(T(finalCta?.heading, locale)) ? T(finalCta?.heading, locale) : (locale === 'ar' ? 'جاهزون للاستماع إلى تحديك التقني.' : 'Ready to talk about your technical challenge?')}
          body={T(finalCta?.body, locale) || undefined}
          ctaLabel={T(finalCta?.ctaLabel, locale) || (locale === 'ar' ? 'ابدأ مشروعك' : 'Start a Project')}
          email={contact?.channels.emailMain || undefined}
          phone={contact?.channels.phone || undefined}
        />
      )}
    </>
  );
}
