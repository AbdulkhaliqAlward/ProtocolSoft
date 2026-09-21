/** Service detail template (§16.3): breadcrumb hero, overview prose, deliverables,
 *  capability chips, process timeline, FAQ accordion, initiative card (approved
 *  wording only, no CTA — D2), "other services" strip, CTA band.
 *  Unpublished/unarchived slugs 404 upstream → notFound(). */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getContent } from '@/lib/internalApi';
import { pageMetadata } from '@/lib/pageMeta';
import { CtaBand, Icon } from '@/components/ui';import { InitiativeCard } from '@/components/InitiativeCard';
import { RichText } from '@/components/RichText';
import type { Locale, PublicContactConfig, PublicInitiativeCard, PublicServiceSummary } from '@protocol-soft/shared';

const SLUGS = ['custom-software', 'digital-products', 'cybersecurity'] as const;

interface ServiceDetail {
  slug: string;
  title: string;
  heroHeadline: string;
  heroSubhead: string | null;
  icon: string | null;
  summary: string;
  overview: unknown;
  deliverables: Array<{ title: string; description?: string | null }>;
  capabilities: string[];
  processSteps: Array<{ title: string; description?: string | null }>;
  faqs: Array<{ question: string; answer: string }>;
  initiativeSection: { enabled?: boolean; heading?: { ar: string; en: string } | string } | null;
  seo: { title?: string | null; description?: string | null; noindex?: boolean } | null;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale: Locale = localeParam === 'en' ? 'en' : 'ar';
  try {
    const svc = await getContent<ServiceDetail>('/api/internal/content/services', locale, { slug });
    return pageMetadata(
      locale,
      svc.seo?.title || svc.title,
      svc.seo?.description || svc.summary,
      `/services/${slug}`,
    );
  } catch {
    return pageMetadata(locale, '404', '', `/services/${slug}`);
  }
}

export default async function ServicePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: localeParam, slug } = await params;
  const locale: Locale = localeParam === 'en' ? 'en' : 'ar';
  if (!SLUGS.includes(slug as (typeof SLUGS)[number])) notFound();

  let svc: ServiceDetail;
  try {
    svc = await getContent<ServiceDetail>('/api/internal/content/services', locale, { slug });
  } catch {
    notFound();
  }

  // Initiative card content comes from the published initiatives API (card-safe
  // fields only). With EDR kept draft (D-2), this returns [] and the section is
  // honestly omitted — the code path stays for the future approved phase.
  let initiatives: PublicInitiativeCard[] = [];
  try {
    initiatives = await getContent<PublicInitiativeCard[]>('/api/internal/content/initiatives', locale);
  } catch {
    initiatives = [];
  }

  let others: PublicServiceSummary[] = [];
  try {
    others = (await getContent<PublicServiceSummary[]>('/api/internal/content/services', locale)).filter((s) => s.slug !== slug);
  } catch {
    others = [];
  }

  let contact: PublicContactConfig | null = null;
  try {
    contact = await getContent<PublicContactConfig>('/api/internal/content/contact-config', locale);
  } catch {
    contact = null;
  }

  const base = locale === 'ar' ? '' : '/en';
  // Locale-scoped API returns plain strings for localized fields (Phase 4 lesson).
  const TL = (value: { ar: string; en: string } | string | null | undefined): string => {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    return value[locale] ?? '';
  };
  const initiativeHeading =
    typeof svc.initiativeSection?.heading === 'object' && svc.initiativeSection?.heading !== null
      ? svc.initiativeSection.heading[locale]
      : typeof svc.initiativeSection?.heading === 'string'
        ? svc.initiativeSection.heading
        : locale === 'ar'
          ? 'مبادرة تقنية مفتوحة المصدر'
          : 'Open-source technical initiative';

  return (
    <>
      <header className="page-header">
        <div className="container page-header__inner">
          <nav aria-label={locale === 'ar' ? 'مسار التنقل' : 'Breadcrumb'}>
            <ol className="breadcrumbs">
              <li><a href={`${base}/`}>{locale === 'ar' ? 'الرئيسية' : 'Home'}</a></li>
              <li><a href={`${base}/services`}>{locale === 'ar' ? 'الخدمات' : 'Services'}</a></li>
              <li><span aria-current="page">{svc.title}</span></li>
            </ol>
          </nav>
          <h1>{svc.heroHeadline}</h1>
          {svc.heroSubhead && <p>{svc.heroSubhead}</p>}
          <p style={{ marginTop: 'var(--sp-5)' }}>
            <a href={`${base}/contact?service=${svc.slug}`} className="btn btn--primary btn--lg">
              {locale === 'ar' ? 'اطلب استشارة' : 'Request a consultation'}
            </a>
          </p>
        </div>
      </header>

      <section className="section" style={{ paddingTop: 'var(--sp-6)' }} aria-label={locale === 'ar' ? 'نظرة عامة' : 'Overview'}>
        <div className="container">
          <RichText data={svc.overview} className="prose" />
        </div>
      </section>

      {svc.deliverables.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }} aria-label={locale === 'ar' ? 'ما نسلّمه' : 'What you get'}>
          <div className="container">
            <h2>{locale === 'ar' ? 'ما نسلّمه' : 'What you get'}</h2>
            <ul className="deliverables">
              {svc.deliverables.map((d) => (
                <li key={d.title}>
                  <span className="deliverables__check"><Icon name="check" size={18} /></span>
                  <div>
                    <h3>{d.title}</h3>
                    {d.description && <p>{d.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {svc.capabilities.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }} aria-label={locale === 'ar' ? 'القدرات' : 'Capabilities'}>
          <div className="container">
            <h2>{locale === 'ar' ? 'القدرات' : 'Capabilities'}</h2>
            <ul className="chip-row">
              {svc.capabilities.map((c) => (
                <li key={c} className="chip">{c}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {svc.processSteps.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }} aria-label={locale === 'ar' ? 'خطوات العمل' : 'Process'}>
          <div className="container">
            <h2>{locale === 'ar' ? 'كيف نعمل' : 'How we work'}</h2>
            <ol className="timeline">
              {svc.processSteps.map((s, i) => (
                <li key={s.title}>
                  <span className="timeline__num bidi">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{s.title}</h3>
                    {s.description && <p>{s.description}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {svc.faqs.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }} aria-label={locale === 'ar' ? 'أسئلة شائعة' : 'FAQ'}>
          <div className="container">
            <h2>{locale === 'ar' ? 'أسئلة شائعة' : 'Frequently asked questions'}</h2>
            <div className="faq">
              {svc.faqs.map((f) => (
                <details key={f.question}>
                  <summary>{f.question}</summary>
                  <div>{f.answer}</div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {svc.initiativeSection?.enabled === true && initiatives.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }} aria-label={initiativeHeading}>
          <div className="container">
            <h2 style={{ fontSize: 'var(--fs-h3)' }}>{initiativeHeading}</h2>
            {initiatives.map((i) => (
              <InitiativeCard key={i.title.en} initiative={i} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }} aria-label={locale === 'ar' ? 'خدمات أخرى' : 'Other services'}>
          <div className="container">
            <h2 style={{ fontSize: 'var(--fs-h3)' }}>{locale === 'ar' ? 'خدمات أخرى' : 'Other services'}</h2>
            <div className="grid grid--2">
              {others.map((s) => (
                <a key={s.slug} href={`${base}/services/${s.slug}`} className="card">
                  <h3>{TL(s.title)}</h3>
                  <p>{TL(s.summary)}</p>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand
        locale={locale}
        heading={locale === 'ar' ? 'ابدأ من جلسة استكشاف قصيرة.' : 'Start with a short discovery session.'}
        body={locale === 'ar' ? 'نناقش احتياجك، ونوضح النطاق والخيارات — بلا التزام.' : 'We discuss your need and lay out scope and options — no commitment.'}
        ctaLabel={locale === 'ar' ? 'اطلب استشارة' : 'Request a consultation'}
        email={contact?.channels.emailMain || undefined}
        phone={contact?.channels.phone || undefined}
      />
    </>
  );
}
