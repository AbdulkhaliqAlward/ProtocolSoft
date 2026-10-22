/** Contact: the form (7 columns) and a sticky aside (what happens next, and
 *  direct channels). Every channel renders only once a real value exists in
 *  the CMS; until then the form is the only channel shown. ?service= preselects the service tile; unknown values fall
 *  back to General. Operational promises awaiting confirmation are tagged. */
import type { Metadata } from 'next';

import type { Locale, PublicContactConfig } from '@protocol-soft/shared';

import { ContactForm } from '@/components/ContactForm';
import { PageHero } from '@/components/sections';
import { localePath } from '@/components/siteChrome';
import { Spark } from '@/components/Spark';
import { WhatsAppCta } from '@/components/WhatsAppCta';
import { getOptional } from '@/lib/internalApi';
import { pageMetadata } from '@/lib/pageMeta';


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

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale: Locale = localeParam === 'en' ? 'en' : 'ar';
  const ar = locale === 'ar';
  const T = (a: string, e: string): string => (ar ? a : e);

  const contact = await getOptional<PublicContactConfig>('/api/internal/content/contact-config', locale);

  const c = contact?.channels;
  const emailMain = c?.emailMain ?? '';
  const emailSales = c?.emailSales ?? '';
  const emailSupport = c?.emailSupport ?? '';
  const phone = c?.phone ?? '';
  const hours = (ar ? c?.workingHours?.ar : c?.workingHours?.en) ?? '';
  const address = c?.addressLine?.[locale] ?? '';
  const whatsapp = c?.whatsapp.status === 'configured' && c.whatsapp.url ? c.whatsapp : null;
  // Shown only once at least one real channel exists in the CMS; until then the form is the only channel.
  const hasChannels = Boolean(emailMain || phone || emailSales || emailSupport || hours || address || whatsapp);

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
              directChannels={{ email: emailMain || undefined, phone: phone || undefined }}
            />
          </div>

          <aside className="contact-layout__aside" aria-label={T('معلومات التواصل', 'Contact information')}>
            <div className="contact-card">
              <h2><Spark size="sm" />{T('بعد الإرسال', 'After you send')}</h2>
              <ol className="next-steps">
                <li><span>{T('يصل طلبك مباشرة إلى فريقنا، ويقرؤه شخص مختص بمجال طلبك.', 'Your request goes straight to our team and is read by someone who works in that area.')}</span></li>
                <li><span>{T('نرد عليك بإجابة واضحة: هل نحن الجهة المناسبة لطلبك، وما الخطوة التالية.', 'We reply with a clear answer: whether we are the right fit for your request, and what comes next.')}</span></li>
                <li><span>{T('إن كان طلبك مناسباً لنا، نرتب جلسة استكشاف قصيرة ونوضح النطاق والخيارات قبل أي التزام.', 'If it is a fit, we arrange a short discovery session and set out the scope and options before any commitment.')}</span></li>
              </ol>
            </div>

            {hasChannels && (
              <div className="contact-card">
                <h2><Spark size="sm" />{T('قنوات مباشرة', 'Direct channels')}</h2>
                <ul className="channel-list">
                  {emailMain && <li><span className="channel-label">{T('البريد الإلكتروني', 'Email')}</span><a href={`mailto:${emailMain}`} className="bidi">{emailMain}</a></li>}
                  {emailSales && emailSales !== emailMain && <li><span className="channel-label">{T('المبيعات', 'Sales')}</span><a href={`mailto:${emailSales}`} className="bidi">{emailSales}</a></li>}
                  {emailSupport && emailSupport !== emailMain && <li><span className="channel-label">{T('الدعم', 'Support')}</span><a href={`mailto:${emailSupport}`} className="bidi">{emailSupport}</a></li>}
                  {phone && <li><span className="channel-label">{T('الهاتف', 'Phone')}</span><a href={`tel:${phone}`} className="bidi">{phone}</a></li>}
                  {address && <li><span className="channel-label">{T('العنوان', 'Address')}</span><span>{address}</span></li>}
                  {hours && <li><span className="channel-label">{T('ساعات العمل', 'Working hours')}</span><span>{hours}</span></li>}
                </ul>
                {whatsapp && <WhatsAppCta url={whatsapp.url!} locale={locale} />}
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
