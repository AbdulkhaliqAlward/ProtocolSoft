/**
 * Home. Reading order: what we do (hero plate) → the three services → how we
 * work → why us → security as a principle → questions → one closing action.
 * Every section is data-driven from the published homepage global and hides
 * itself when its content is empty (never placeholder copy). The featured
 * project and technical-initiative sections stay off until their content
 * passes its gates (case studies hidden at launch; EDR In-Development only).
 */
import type { Metadata } from 'next';
import Link from 'next/link';

import type { Locale, PublicContactConfig, PublicInitiativeCard, PublicServiceSummary, PublicSiteSettings, PublicSocialLink } from '@protocol-soft/shared';

import { InitiativeCard } from '@/components/InitiativeCard';
import { JsonLd } from '@/components/JsonLd';
import { Faq, Section, clause } from '@/components/sections';
import { localePath } from '@/components/siteChrome';
import { Spark } from '@/components/Spark';
import { CtaBand } from '@/components/ui';
import { getOptional } from '@/lib/internalApi';
import { pageMetadata } from '@/lib/pageMeta';
import { organizationLd, websiteLd } from '@/lib/structuredData';

type L10n = { ar: string; en: string } | string | null | undefined;

interface HomepageData {
  published: boolean;
  hero: {
    enabled: boolean;
    kicker: L10n;
    headline: L10n;
    subheadline: L10n;
    primaryCtaLabel: L10n;
    secondaryCtaLabel: L10n;
    secondaryCtaTarget: L10n;
  };
  sections: {
    valueStatementEnabled: boolean;
    valueStatement: L10n;
    differentiators: Array<{ title: L10n; description: L10n }>;
    servicesOverviewEnabled: boolean;
    servicesHeading: L10n;
    whyEnabled: boolean;
    whyItems: Array<{ title: L10n; description?: L10n }>;
    methodologyEnabled: boolean;
    methodologySteps: Array<{ title: L10n; promise: L10n }>;
    featuredProject: { enabled: boolean; project: unknown };
    technicalInitiatives: { enabled: boolean; heading: L10n; initiatives: PublicInitiativeCard[] };
    secureByDesignEnabled: boolean;
    secureByDesign: L10n;
    faqEnabled?: boolean;
    faqs?: Array<{ question: string; answer: string }>;
  };
  finalCta: { enabled: boolean; heading: L10n; body: L10n; ctaLabel: L10n };
}

const T = (value: L10n, locale: Locale): string => {
  if (value == null) return '';
  return typeof value === 'string' ? value : (value[locale] ?? '');
};
const has = (v: string): boolean => v.trim().length > 0;
const keyOf = (v: L10n): string => (typeof v === 'string' ? v : (v?.en || v?.ar || ''));

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = locale === 'en' ? 'en' : 'ar';
  return pageMetadata(
    l,
    l === 'en' ? 'Protocol Soft — Software Engineering & Cybersecurity' : 'بروتوكول سوفت — هندسة البرمجيات والأمن السيبراني',
    l === 'en'
      ? 'Custom systems, digital products and platforms, and defensive cybersecurity, in Arabic and English.'
      : 'تطوير الأنظمة المخصصة، بناء المنتجات والمنصات الرقمية، وخدمات الأمن السيبراني الدفاعية، بالعربية والإنجليزية.',
    '/',
  );
}


export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale: Locale = localeParam === 'en' ? 'en' : 'ar';
  const ar = locale === 'ar';

  const [settings, homepage, services, contact, social] = await Promise.all([
    getOptional<PublicSiteSettings>('/api/internal/content/site-settings', locale),
    getOptional<HomepageData>('/api/internal/content/homepage', locale),
    getOptional<PublicServiceSummary[], PublicServiceSummary[]>('/api/internal/content/services', locale, undefined, []),
    getOptional<PublicContactConfig>('/api/internal/content/contact-config', locale),
    getOptional<PublicSocialLink[], PublicSocialLink[]>('/api/internal/content/social-links', locale, undefined, []),
  ]);

  const hero = homepage?.hero;
  const s = homepage?.sections;
  const finalCta = homepage?.finalCta;

  const kicker = T(hero?.kicker, locale) || (ar ? 'هندسة البرمجيات والأمن السيبراني' : 'Software engineering & cybersecurity');
  const headline = T(hero?.headline, locale) || T(settings?.tagline, locale) || (ar ? 'نبني أنظمة رقمية موثوقة، ونحميها لتعمل بثقة.' : 'Trusted digital systems, built and protected to run with confidence.');
  const sub = T(hero?.subheadline, locale);
  // Distinct from the header's "start a project", which sits beside the hero.
  const primaryCta = T(hero?.primaryCtaLabel, locale) || (ar ? 'تحدّث مع فريقنا' : 'Talk to our team');
  const secondaryCta = T(hero?.secondaryCtaLabel, locale) || (ar ? 'تعرّف على خدماتنا' : 'Explore our services');

  const valueStatement = s?.valueStatementEnabled === false ? '' : T(s?.valueStatement, locale);
  const commitments = [...(s?.differentiators ?? []), ...(s?.whyEnabled === false ? [] : (s?.whyItems ?? []))].filter((d) => has(T(d.title, locale)));
  const steps = s?.methodologyEnabled === false ? [] : (s?.methodologySteps ?? []).filter((m) => has(T(m.title, locale)));
  const secure = s?.secureByDesignEnabled === false ? '' : T(s?.secureByDesign, locale);
  const faqs = s?.faqEnabled === false ? [] : (s?.faqs ?? []).filter((f) => f.question && f.answer);
  const initiatives = s?.technicalInitiatives?.enabled ? (s.technicalInitiatives.initiatives ?? []) : [];

  let n = 0;
  const next = (): string => clause(++n);

  return (
    <>
      <JsonLd
        data={[
          organizationLd(locale, {
            description: T(settings?.tagline, locale) || undefined,
            email: contact?.channels.emailMain || undefined,
            phone: contact?.channels.phone || undefined,
            sameAs: social.map((l) => l.url),
            legalName: T(settings?.legalCompanyName, locale) || undefined,
          }),
          websiteLd(locale),
        ]}
      />

      {/* Hero: a full-width purple band: the thesis, the promise and two
          actions. The services are listed once, in the section below. */}
      <section className="home-hero plate plate--bleed" aria-labelledby="hero-title">
        <span className="home-hero__sparks" aria-hidden="true"><Spark size="lg" /><Spark /></span>
        <div className="container home-hero__grid">
          <div className="home-hero__head">
            <span className="eyebrow">{kicker}</span>
            <h1 id="hero-title" className="home-hero__title">{headline}</h1>
          </div>
          <div className="home-hero__main">
            {has(sub) && <p className="lead">{sub}</p>}
            <div className="cluster home-hero__actions">
              <Link href={localePath(locale, '/contact')} className="btn btn--inverse btn--lg">{primaryCta}</Link>
              <Link href={localePath(locale, '/services')} className="btn btn--outline-inverse btn--lg">{secondaryCta}</Link>
            </div>
          </div>
        </div>
      </section>

      {s?.servicesOverviewEnabled !== false && services.length > 0 && (
        <Section
          id="services"
          no={next()}
          title={T(s?.servicesHeading, locale) || (ar ? 'ثلاثة مسارات نعمل بها' : 'Three ways we work with you')}
          lead={ar ? 'اختر المسار الأقرب لتحديك؛ لكل خدمة صفحة توضح النطاق والمخرجات وطريقة العمل.' : 'Pick the track closest to your challenge; each service has a page with its scope, deliverables and process.'}
        >
          <ol className="svc-index" role="list">
            {services.map((svc, i) => (
              <li key={svc.slug}>
                <Link href={localePath(locale, `/services/${svc.slug}`)} className="svc-index__row">
                  <span className="svc-index__no">{String(i + 1).padStart(2, '0')}</span>
                  <span className="svc-index__body">
                    <span className="svc-index__title">{T(svc.title, locale)}</span>
                    <span className="svc-index__summary">{T(svc.summary, locale)}</span>
                  </span>
                  <span className="svc-index__go">{ar ? 'النطاق والتفاصيل' : 'Scope & details'} <span className="btn__arrow" aria-hidden="true">→</span></span>
                </Link>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {steps.length > 0 && (
        <Section
          id="method"
          wide
          no={next()}
          title={ar ? 'طريقة عملنا' : 'How we work'}
          lead={ar ? 'خمس خطوات ثابتة في كل مشروع، ولكل خطوة مخرج مكتوب تراجعه قبل أن ننتقل.' : 'Five steps on every project, each ending in a written output you review before we move on.'}
        >
          <ol className="steps-line" role="list">
            {steps.map((m, i) => (
              <li key={keyOf(m.title)}>
                <span className="steps-line__no">{String(i + 1).padStart(2, '0')}</span>
                <h3>{T(m.title, locale)}</h3>
                <p>{T(m.promise, locale)}</p>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {(has(valueStatement) || commitments.length > 0) && (
        <Section id="why" no={next()} title={ar ? 'لماذا بروتوكول سوفت' : 'Why Protocol Soft'} lead={has(valueStatement) ? valueStatement : undefined}>
          <ul className="commitments" role="list">
            {commitments.map((c) => (
              <li key={keyOf(c.title)}>
                <Spark />
                <div>
                  <h3>{T(c.title, locale)}</h3>
                  {has(T(c.description, locale)) && <p>{T(c.description, locale)}</p>}
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {has(secure) && (
        <section className="section section--band statement" aria-labelledby="secure-title" data-reveal>
          <div className="container rail">
            <div className="rail__head">
              <span className="clause-no">{next()}</span>
              <h2 id="secure-title">{ar ? 'الأمان من اليوم الأول' : 'Secure from day one'}</h2>
            </div>
            <div className="rail__body">
              <p className="statement__text">{secure}</p>
              <Link href={localePath(locale, '/services/cybersecurity')} className="btn btn--secondary">
                {ar ? 'خدمات الأمن السيبراني' : 'Cybersecurity services'} <span className="btn__arrow" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {initiatives.length > 0 && (
        <Section no={next()} title={T(s?.technicalInitiatives.heading, locale) || (ar ? 'مبادرات تقنية' : 'Technical initiatives')}>
          {initiatives.map((i) => <InitiativeCard key={keyOf(i.title)} initiative={i} locale={locale} />)}
        </Section>
      )}

      {faqs.length > 0 && (
        <Section id="faq" no={next()} title={ar ? 'أسئلة قبل أن تتواصل' : 'Before you get in touch'} lead={ar ? 'إجابات مختصرة عن أكثر ما يُسأل في البداية.' : 'Short answers to what people usually ask first.'}>
          <Faq items={faqs} />
        </Section>
      )}

      {finalCta?.enabled !== false && (
        <CtaBand
          locale={locale}
          heading={T(finalCta?.heading, locale) || (ar ? 'أخبرنا عن نظامك أو فكرتك.' : 'Tell us about your system or idea.')}
          body={T(finalCta?.body, locale) || undefined}
          ctaLabel={T(finalCta?.ctaLabel, locale) || (ar ? 'احجز جلسة استكشاف' : 'Book a discovery session')}
          email={contact?.channels.emailMain || undefined}
          phone={contact?.channels.phone || undefined}
        />
      )}
    </>
  );
}
