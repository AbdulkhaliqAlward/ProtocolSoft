/**
 * Service detail — a spec sheet. Reading order:
 *   hero plate (headline, promise, actions, engagement facts)
 *   § 01 overview · § 02 scope (included / not included) · § 03 process as an
 *   exchange · § 04 capabilities by stage · § 05 questions · related services
 *   · one closing action (contact form preselected with this service).
 * Only published, per-locale content renders; empty sections hide themselves.
 * Lines flagged needsConfirmation in the CMS show a NEEDS CONFIRMATION tag.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import type { Locale, PublicContactConfig, PublicInitiativeCard, PublicServiceSummary } from '@protocol-soft/shared';

import { InitiativeCard } from '@/components/InitiativeCard';
import { JsonLd } from '@/components/JsonLd';
import { RichText } from '@/components/RichText';
import { Breadcrumbs, CapabilityGroups, Exchange, Faq, Scope, Section, Tbc, clause } from '@/components/sections';
import { localePath } from '@/components/siteChrome';
import { Spark } from '@/components/Spark';
import { CtaBand } from '@/components/ui';
import { getContent } from '@/lib/internalApi';
import { notFoundMetadata, pageMetadata } from '@/lib/pageMeta';
import { breadcrumbLd, faqLd, serviceLd } from '@/lib/structuredData';

const SLUGS = ['custom-software', 'digital-products', 'cybersecurity'] as const;

interface ServiceDetail {
  slug: string;
  title: string;
  heroHeadline: string;
  heroSubhead: string | null;
  summary: string;
  overview: unknown;
  deliverables: Array<{ title: string; description?: string | null }>;
  engagementFacts?: Array<{ label: string; value: string; needsConfirmation?: boolean | null }>;
  notIncluded?: Array<{ item: string; needsConfirmation?: boolean | null }>;
  capabilityGroups?: Array<{ stage: string; title: string; items?: Array<{ label: string }> | null }>;
  capabilities: string[];
  processSteps: Array<{ title: string; description?: string | null; clientProvides?: string | null; weDeliver?: string | null }>;
  faqs: Array<{ question: string; answer: string }>;
  initiativeSection: { enabled?: boolean; heading?: { ar: string; en: string } | string } | null;
  seo: { title?: string | null; description?: string | null; noindex?: boolean } | null;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale: Locale = localeParam === 'en' ? 'en' : 'ar';
  try {
    const svc = await getContent<ServiceDetail>('/api/internal/content/services', locale, { slug });
    return pageMetadata(locale, svc.seo?.title || svc.title, svc.seo?.description || svc.summary, `/services/${slug}`);
  } catch {
    return notFoundMetadata();
  }
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

export default async function ServicePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: localeParam, slug } = await params;
  const locale: Locale = localeParam === 'en' ? 'en' : 'ar';
  const ar = locale === 'ar';
  if (!SLUGS.includes(slug as (typeof SLUGS)[number])) notFound();

  let svc: ServiceDetail;
  try {
    svc = await getContent<ServiceDetail>('/api/internal/content/services', locale, { slug });
  } catch {
    notFound();
  }

  const [all, initiatives, contact] = await Promise.all([
    safe(getContent<PublicServiceSummary[]>('/api/internal/content/services', locale), [] as PublicServiceSummary[]),
    // Initiative card: published initiatives, card-safe fields only (EDR stays draft at launch).
    safe(getContent<PublicInitiativeCard[]>('/api/internal/content/initiatives', locale), [] as PublicInitiativeCard[]),
    safe(getContent<PublicContactConfig>('/api/internal/content/contact-config', locale), null),
  ]);
  const index = Math.max(0, all.findIndex((s) => s.slug === slug));
  const others = all.filter((s) => s.slug !== slug);
  const facts = svc.engagementFacts ?? [];
  const excluded = svc.notIncluded ?? [];
  const groups = (svc.capabilityGroups ?? []).filter((g) => (g.items ?? []).length > 0);
  const contactHref = `${localePath(locale, '/contact')}?service=${svc.slug}`;
  const ctaLabel = slug === 'cybersecurity' ? (ar ? 'اطلب تقييماً أمنياً' : 'Request a security assessment') : (ar ? 'اطلب استشارة' : 'Request a consultation');
  const initiativeHeading = T(svc.initiativeSection?.heading as never, locale) || (ar ? 'مبادرة تقنية مفتوحة المصدر' : 'Open-source technical initiative');

  let n = 0;
  const next = (): string => `${clause(index + 1)}.${++n}`;

  return (
    <>
      <JsonLd
        data={[
          serviceLd(locale, { slug, title: svc.title, description: svc.seo?.description || svc.summary }),
          breadcrumbLd(locale, [
            { name: ar ? 'الرئيسية' : 'Home', path: '/' },
            { name: ar ? 'الخدمات' : 'Services', path: '/services' },
            { name: svc.title, path: `/services/${slug}` },
          ]),
          ...(svc.faqs.length > 0 ? [faqLd(svc.faqs)] : []),
        ]}
      />

      <section className="svc-hero" aria-labelledby="svc-title">
        <div className="container">
          <div className="plate svc-hero__plate">
            <div className="svc-hero__main">
              <Breadcrumbs
                items={[
                  { label: ar ? 'الرئيسية' : 'Home', href: localePath(locale, '/') },
                  { label: ar ? 'الخدمات' : 'Services', href: localePath(locale, '/services') },
                  { label: svc.title },
                ]}
              />
              <span className="clause-no">{clause(index + 1)} <Spark size="sm" /></span>
              <h1 id="svc-title">{svc.heroHeadline || svc.title}</h1>
              {svc.heroSubhead && <p className="lead">{svc.heroSubhead}</p>}
              <div className="cluster svc-hero__actions">
                <Link href={contactHref} className="btn btn--inverse btn--lg">{ctaLabel}</Link>
                {(svc.deliverables.length > 0 || excluded.length > 0) && (
                  <a href="#scope" className="btn btn--outline-inverse btn--lg">{ar ? 'ما الذي يشمله؟' : "What's included?"}</a>
                )}
              </div>
            </div>
            {facts.length > 0 && (
              <dl className="facts" aria-label={ar ? 'حقائق الارتباط' : 'Engagement facts'}>
                {facts.map((f) => (
                  <div key={f.label}>
                    <dt>{f.label}</dt>
                    <dd>{f.value} {f.needsConfirmation && <Tbc />}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </section>

      <Section id="overview" no={next()} title={ar ? 'نظرة عامة' : 'Overview'} lead={svc.summary}>
        <RichText data={svc.overview} className="prose" />
      </Section>

      {(svc.deliverables.length > 0 || excluded.length > 0) && (
        <Section
          id="scope"
          no={next()}
          title={ar ? 'نطاق العمل' : 'Scope'}
          lead={ar ? 'نحدد قبل البدء ما الذي سنعمل عليه وما الذي لن يدخل في هذا الارتباط، حتى لا تكون هناك مفاجآت.' : 'Before we start, we agree what is in and what is out of this engagement, so there are no surprises.'}
        >
          <Scope locale={locale} included={svc.deliverables} excluded={excluded} />
        </Section>
      )}

      {svc.processSteps.length > 0 && (
        <Section
          id="process"
          no={next()}
          title={ar ? 'كيف نعمل' : 'How we work'}
          lead={ar ? 'كل خطوة تبادل واضح: ما نحتاجه منك، وما تستلمه منا في نهايتها.' : 'Each step is a clear exchange: what we need from you, and what you receive at the end of it.'}
        >
          <Exchange locale={locale} steps={svc.processSteps} />
        </Section>
      )}

      {(groups.length > 0 || svc.capabilities.length > 0) && (
        <Section
          id="capabilities"
          no={next()}
          title={ar ? 'القدرات' : 'Capabilities'}
          lead={ar ? 'مرتبة حسب المرحلة التي تحتاجها فيها.' : 'Grouped by the stage where you need them.'}
        >
          {groups.length > 0 ? (
            <CapabilityGroups groups={groups} />
          ) : (
            <CapabilityGroups groups={[{ stage: '', title: ar ? 'القدرات' : 'Capabilities', items: svc.capabilities.map((label) => ({ label })) }]} />
          )}
        </Section>
      )}

      {svc.faqs.length > 0 && (
        <Section id="faq" no={next()} title={ar ? 'أسئلة شائعة' : 'Common questions'}>
          <Faq items={svc.faqs} />
        </Section>
      )}

      {svc.initiativeSection?.enabled === true && initiatives.length > 0 && (
        <Section no={next()} title={initiativeHeading}>
          {initiatives.map((i) => <InitiativeCard key={T(i.title, 'en')} initiative={i} locale={locale} />)}
        </Section>
      )}

      {others.length > 0 && (
        <Section title={ar ? 'خدمات أخرى' : 'Other services'} reveal={false}>
          <ul className="related" role="list">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={localePath(locale, `/services/${o.slug}`)}>
                  <strong>{T(o.title, locale)}</strong>
                  <span>{T(o.summary, locale)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <CtaBand
        locale={locale}
        heading={ar ? 'ابدأ بجلسة استكشاف قصيرة.' : 'Start with a short discovery session.'}
        body={ar ? 'نناقش احتياجك، ونوضح النطاق والخيارات قبل أي التزام.' : 'We discuss your need and set out the scope and options before any commitment.'}
        ctaLabel={ctaLabel}
        href={contactHref}
        email={contact?.channels.emailMain || undefined}
        phone={contact?.channels.phone || undefined}
      />
    </>
  );
}
