/** Contact: the form (7 columns) and a sticky aside (direct channels, what
 *  happens next). Channels render only when real values exist (§6.9);
 *  WhatsApp is always present via its honest availability state — never a
 *  dummy number. ?service= preselects the service tile; unknown values fall
 *  back to General. Operational promises awaiting confirmation are tagged. */
import type { Metadata } from 'next';

import type { Locale, PublicContactConfig } from '@protocol-soft/shared';

import { ContactForm, type ServiceInterest } from '@/components/ContactForm';
import { PageHero, Tbc } from '@/components/sections';
import { localePath } from '@/components/siteChrome';
import { Spark } from '@/components/Spark';
import { WhatsAppCta } from '@/components/WhatsAppCta';
import { getContent } from '@/lib/internalApi';
import { pageMetadata } from '@/lib/pageMeta';

const SERVICE_BY_SLUG: Record<string, ServiceInterest> = {
  'custom-software': 'custom_software',
  'digital-products': 'digital_products',
  cybersecurity: 'cybersecurity',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = locale === 'en' ? 'en' : 'ar';
  return pageMetadata(
    l,
    l === 'en' ? 'Contact us' : 'تواصل معنا',
    l === 'en' ? 'Tell Protocol Soft about your system or idea and we will suggest the next step.' : 'أخبر بروتوكول سوفت عن نظامك أو فكرتك، ونقترح الخطوة التالية.',
    '/contact',
  );
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
  const ar = locale === 'ar';
  const T = (a: string, e: string): string => (ar ? a : e);
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
  const hours = (ar ? c?.workingHours?.ar : c?.workingHours?.en) ?? '';
  const address = c?.addressLine?.[locale] ?? '';
  const hasChannels = Boolean(emailMain || phone || emailSales || emailSupport || hours || address);

  return (
    <>
      <PageHero
        title={T('تواصل معنا', 'Contact us')}
        lead={T('أخبرنا عن نظامك أو فكرتك في بضعة أسطر، وسنقترح الخطوة التالية بوضوح.', 'Tell us about your system or idea in a few lines, and we will suggest the next step clearly.')}
        crumbs={[{ label: T('الرئيسية', 'Home'), href: localePath(locale, '/') }, { label: T('تواصل معنا', 'Contact') }]}
      />

      <section className="section" aria-label={T('نموذج التواصل', 'Contact form')}>
        <div className="container contact-layout">
          <div className="contact-layout__form">
            <ContactForm
              locale={locale}
              confirmationMessage={contact?.confirmationMessage?.[locale] ?? T('تم استلام طلبك بنجاح.', 'Your request has been received.')}
              initialService={initialService}
              directChannels={{ email: emailMain || undefined, phone: phone || undefined }}
            />
          </div>

          <aside className="contact-layout__aside" aria-label={T('معلومات التواصل', 'Contact information')}>
            <div className="contact-card">
              <h2><Spark size="sm" />{T('بعد الإرسال', 'After you send')}</h2>
              <ol className="next-steps">
                <li><span>{T('يصل طلبك إلى الفريق ونقرأه.', 'Your request reaches the team and we read it.')}</span></li>
                <li><span>{T('نرد برد أولي واضح: هل نحن الأنسب لطلبك أم لا.', 'We send a clear first reply: whether we are the right fit or not.')} <Tbc /></span></li>
                <li><span>{T('نرتب جلسة استكشاف قصيرة ونوضح النطاق والخيارات قبل أي التزام.', 'We arrange a short discovery session and set out scope and options before any commitment.')}</span></li>
              </ol>
            </div>

            <div className="contact-card">
              <h2><Spark size="sm" />{T('قنوات مباشرة', 'Direct channels')}</h2>
              {hasChannels ? (
                <ul className="channel-list">
                  {emailMain && <li><span className="channel-label">{T('البريد الإلكتروني', 'Email')}</span><a href={`mailto:${emailMain}`} className="bidi">{emailMain}</a></li>}
                  {emailSales && emailSales !== emailMain && <li><span className="channel-label">{T('المبيعات', 'Sales')}</span><a href={`mailto:${emailSales}`} className="bidi">{emailSales}</a></li>}
                  {emailSupport && emailSupport !== emailMain && <li><span className="channel-label">{T('الدعم', 'Support')}</span><a href={`mailto:${emailSupport}`} className="bidi">{emailSupport}</a></li>}
                  {phone && <li><span className="channel-label">{T('الهاتف', 'Phone')}</span><a href={`tel:${phone}`} className="bidi">{phone}</a></li>}
                  {address && <li><span className="channel-label">{T('العنوان', 'Address')}</span><span>{address}</span></li>}
                  {hours && <li><span className="channel-label">{T('ساعات العمل', 'Working hours')}</span><span>{hours}</span></li>}
                </ul>
              ) : (
                <p>{T('البريد والهاتف وساعات العمل تُضاف قريباً؛ النموذج هو أسرع طريق للوصول إلينا الآن.', 'Email, phone and working hours are being added; the form is the quickest way to reach us for now.')}</p>
              )}
              {contact && <WhatsAppCta whatsapp={contact.channels.whatsapp} locale={locale} />}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
