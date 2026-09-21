/** Contact (§16.6, D-5): form + direct channels panel. Channels render only when
 *  real values exist (§6.9); WhatsApp is always visually present via the WA1
 *  availability state — never a dummy number. ?service= preselects the service
 *  tile; unknown values fall back to General. */
import type { Metadata } from 'next';

import { getContent } from '@/lib/internalApi';
import { pageMetadata } from '@/lib/pageMeta';
import { ContactForm, type ServiceInterest } from '@/components/ContactForm';
import { WhatsAppCta } from '@/components/WhatsAppCta';
import { Icon } from '@/components/ui';
import type { Locale, PublicContactConfig } from '@protocol-soft/shared';

const SERVICE_BY_SLUG: Record<string, ServiceInterest> = {
  'custom-software': 'custom_software',
  'digital-products': 'digital_products',
  cybersecurity: 'cybersecurity',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = locale === 'en' ? 'en' : 'ar';
  return pageMetadata(l, l === 'en' ? 'Contact Us' : 'تواصل معنا', l === 'en' ? 'Start a conversation with Protocol Soft.' : 'ابدأ حواراً مع بروتوكول سوفت.', '/contact');
}

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = localeParam === 'en' ? 'en' : 'ar';
  const sp = await searchParams;
  const serviceParam = typeof sp.service === 'string' ? sp.service : undefined;
  const initialService = (serviceParam && SERVICE_BY_SLUG[serviceParam]) || 'general';

  let contact: PublicContactConfig | null = null;
  try {
    contact = await getContent<PublicContactConfig>('/api/internal/content/contact-config', locale);
  } catch {
    contact = null;
  }

  const c = contact?.channels;
  const emailMain = c?.emailMain ?? '';
  const emailSales = c?.emailSales ?? '';
  const emailSupport = c?.emailSupport ?? '';
  const phone = c?.phone ?? '';
  const workingHours = contact ? [c?.workingHours?.ar, c?.workingHours?.en].filter(Boolean) : [];
  const address = contact ? [c?.addressLine?.[locale]].filter((x): x is string => Boolean(x && x.trim())) : [];

  const T = (ar: string, en: string): string => (locale === 'ar' ? ar : en);

  return (
    <>
      <header className="page-header">
        <div className="container page-header__inner">
          <h1>{T('تواصل معنا', 'Contact Us')}</h1>
          <p>
            {T(
              'نرد عادة خلال يوم عمل. أخبرنا عن نظامك أو فكرتك، وسنقترح الخطوة التالية بوضوح.',
              'We usually reply within one business day. Tell us about your system or idea and we will suggest the next step clearly.',
            )}
          </p>
        </div>
      </header>

      <section className="section" style={{ paddingTop: 0 }} aria-label={T('نموذج التواصل', 'Contact form')}>
        {/* Balanced editorial split (Phase 5 visual revision): the form keeps a
            readable measure and the direct-channels panel feels like an equal
            column, not an afterthought. Collapses below 1024px. */}
        <div className="container contact-split">
          <div>
            <ContactForm
              locale={locale}
              confirmationMessage={contact?.confirmationMessage?.[locale] ?? T('تم استلام طلبك بنجاح.', 'Your request has been received.')}
              initialService={initialService}
              directChannels={{ email: emailMain || undefined, phone: phone || undefined }}
            />
          </div>

          <aside aria-label={T('قنوات التواصل المباشرة', 'Direct contact channels')}>
            <div className="card contact-split__aside">
              <h2 style={{ fontSize: 'var(--fs-h3)' }}>{T('قنوات مباشرة', 'Direct channels')}</h2>
              <ul className="channel-list">
                {emailMain && (
                  <li>
                    <span className="channel-label">{T('البريد الإلكتروني', 'Email')}</span>
                    <a href={`mailto:${emailMain}`} className="bidi">{emailMain}</a>
                  </li>
                )}
                {emailSales && emailSales !== emailMain && (
                  <li>
                    <span className="channel-label">{T('المبيعات', 'Sales')}</span>
                    <a href={`mailto:${emailSales}`} className="bidi">{emailSales}</a>
                  </li>
                )}
                {emailSupport && emailSupport !== emailMain && (
                  <li>
                    <span className="channel-label">{T('الدعم', 'Support')}</span>
                    <a href={`mailto:${emailSupport}`} className="bidi">{emailSupport}</a>
                  </li>
                )}
                {phone && (
                  <li>
                    <span className="channel-label">{T('الهاتف', 'Phone')}</span>
                    <a href={`tel:${phone}`} className="bidi">{phone}</a>
                  </li>
                )}
              </ul>
              {contact && (
                <div style={{ marginTop: 'var(--sp-5)' }}>
                  <WhatsAppCta whatsapp={c!.whatsapp} locale={locale} />
                </div>
              )}
              {address.length > 0 && (
                <p className="secondary" style={{ marginTop: 'var(--sp-5)', marginBottom: 0, display: 'flex', gap: 8 }}>
                  <span style={{ color: 'var(--color-text-muted)', flex: 'none' }}><Icon name="server" size={18} /></span>
                  <span>{address.join('، ')}</span>
                </p>
              )}
              {workingHours.length > 0 && (
                <p className="secondary" style={{ marginTop: 'var(--sp-3)', marginBottom: 0, display: 'flex', gap: 8 }}>
                  <span style={{ color: 'var(--color-text-muted)', flex: 'none' }}><Icon name="clock" size={18} /></span>
                  <span>{locale === 'ar' ? c?.workingHours?.ar : c?.workingHours?.en}</span>
                </p>
              )}
              {/* Honest process preview — approved wording only, no invented
                  promises: it reuses the reply-time and discovery-session copy
                  already published on this site. */}
              <div style={{ marginTop: 'var(--sp-6)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--sp-5)' }}>
                <h2 style={{ fontSize: 'var(--fs-h3)' }}>{T('بعد الإرسال', 'After you send')}</h2>
                <ol className="steps" style={{ gap: 'var(--sp-4)' }}>
                  <li className="step" style={{ paddingTop: 'var(--sp-3)' }}>
                    <h3 style={{ fontSize: 'var(--fs-body-sm)', fontWeight: 600 }}>{T('نقرأ طلبك', 'We read your request')}</h3>
                    <p>{T('يصل طلبك إلى الفريق مباشرة، دون قوائم انتظار آلية.', 'Your request reaches the team directly — no automated queues.')}</p>
                  </li>
                  <li className="step" style={{ paddingTop: 'var(--sp-3)' }}>
                    <h3 style={{ fontSize: 'var(--fs-body-sm)', fontWeight: 600 }}>{T('نرد خلال يوم عمل', 'We reply within a business day')}</h3>
                    <p>{T('ردّ أولي واضح: إن كنا الأنسب لمطلبك أم لا.', 'A clear first reply: whether we are the right fit or not.')}</p>
                  </li>
                  <li className="step" style={{ paddingTop: 'var(--sp-3)' }}>
                    <h3 style={{ fontSize: 'var(--fs-body-sm)', fontWeight: 600 }}>{T('جلسة استكشاف قصيرة', 'A short discovery session')}</h3>
                    <p>{T('نناقش احتياجك ونوضح النطاق والخيارات — بلا التزام.', 'We discuss your need and lay out scope and options — no commitment.')}</p>
                  </li>
                </ol>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
