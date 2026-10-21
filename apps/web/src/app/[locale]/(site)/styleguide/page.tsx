/**
 * Living styleguide (development only): every token and component of the
 * design system rendered in the current locale and theme. Returns 404 in
 * production builds and is never indexed or listed in the sitemap.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import type { Locale } from '@protocol-soft/shared';

import { Spark } from '@/components/Spark';

export const metadata: Metadata = { title: 'Styleguide', robots: { index: false, follow: false } };

const SWATCHES = [
  ['--bg', 'Page ground'],
  ['--surface', 'Cards, inputs, menus'],
  ['--surface-sunken', 'Bands, hover'],
  ['--text', 'Text, primary'],
  ['--text-muted', 'Secondary text'],
  ['--line', 'Hairlines'],
  ['--line-strong', 'Control borders'],
  ['--plate', 'Purple plates'],
] as const;

const RADII = [
  ['--r-xs', '6 · marks'],
  ['--r-sm', '10 · inputs'],
  ['--r-md', '14 · buttons'],
  ['--r-lg', '22 · cards'],
  ['--r-xl', '32 · plates'],
] as const;

export default async function StyleguidePage({ params }: { params: Promise<{ locale: string }> }) {
  if (process.env.NODE_ENV === 'production') notFound();
  const { locale: l } = await params;
  const locale: Locale = l === 'en' ? 'en' : 'ar';
  const ar = locale === 'ar';
  const t = (a: string, e: string): string => (ar ? a : e);

  return (
    <>
      <section className="section">
        <div className="container rail">
          <div className="rail__head">
            <span className="clause-no">00</span>
            <h1>{t('نظام التصميم', 'Design system')}</h1>
            <p>{t('كل رمز ومكوّن في الاتجاه المعتمد، بالعربية والإنجليزية وفي المظهرين.', 'Every token and component of the approved direction, in both languages and both themes.')}</p>
          </div>
          <div className="rail__body">
            <div className="cards" style={{ ['--card-min' as string]: '150px' }}>
              {SWATCHES.map(([token, label]) => (
                <div key={token} className="card" style={{ padding: 8, gap: 8 }}>
                  <div style={{ height: 72, borderRadius: 'calc(var(--r-lg) - 8px)', background: `var(${token})`, border: '1px solid var(--line)' }} />
                  <div style={{ padding: '0 8px 8px' }}>
                    <span className="clause-no">{token}</span>
                    <p>{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container rail">
          <div className="rail__head">
            <span className="clause-no">01</span>
            <h2>{t('الخطوط', 'Type')}</h2>
          </div>
          <div className="rail__body stack" style={{ ['--stack' as string]: 'var(--s-5)' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-display)', lineHeight: 'var(--lh-display)', fontWeight: 500 }}>
              {t('أمنٌ يُبنى مع النظام، لا يُضاف بعده.', 'Security built with the system, not added after.')}
            </p>
            <h1>{t('عنوان الصفحة', 'Page title')}</h1>
            <h2>{t('عنوان القسم', 'Section heading')}</h2>
            <h3>{t('عنوان البطاقة', 'Card heading')}</h3>
            <p className="lead">{t('نوضح وضعك الأمني الحالي بلغة واضحة، ونرتب ما يجب معالجته أولاً.', 'We explain your current security posture in plain language and rank what to fix first.')}</p>
            <p>{t('نبدأ بفهم طريقة العمل والتحديات الفعلية، ثم نصمم حلاً مناسباً بدلاً من فرض قالب جاهز. ونوضح نطاق العمل وما سيتم تسليمه قبل أن نبدأ، حتى لا تكون هناك مفاجآت لاحقاً.', 'We start with how your business actually works, then design a solution that fits it instead of forcing a template. We define scope and deliverables before we start, so there are no surprises later.')}</p>
            <p className="muted" style={{ fontSize: 'var(--fs-small)' }}>{t('نص ثانوي صغير.', 'Small secondary text.')}</p>
            <span className="clause-no">03.2 · REF LF-2026-0042</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container rail">
          <div className="rail__head">
            <span className="clause-no">02</span>
            <h2>{t('الأزرار', 'Buttons')}</h2>
          </div>
          <div className="rail__body stack" style={{ ['--stack' as string]: 'var(--s-5)' }}>
            <div className="cluster">
              <a className="btn btn--primary btn--lg" href="#">{t('ابدأ مشروعك', 'Start a project')}</a>
              <a className="btn btn--secondary btn--lg" href="#">{t('تعرّف على الخدمات', 'Explore services')}</a>
              <a className="btn btn--text btn--lg" href="#">{t('التفاصيل', 'Details')} <span className="btn__arrow" aria-hidden="true">→</span></a>
            </div>
            <div className="cluster">
              <button className="btn btn--primary" type="button">{t('ابدأ مشروعك', 'Start a project')}</button>
              <button className="btn btn--secondary" type="button">{t('ثانوي', 'Secondary')}</button>
              <button className="btn btn--primary" type="button" disabled>{t('معطّل', 'Disabled')}</button>
              <button className="btn btn--primary" type="button" aria-busy="true"><Spark />{t('جارٍ الإرسال', 'Sending')}</button>
            </div>
            <div className="cluster">
              <button className="btn btn--primary btn--sm" type="button">{t('صغير', 'Small')}</button>
              <button className="btn btn--secondary btn--sm" type="button">{t('صغير', 'Small')}</button>
              <button className="icon-btn" type="button" aria-label={t('القائمة', 'Menu')}>
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container rail">
          <div className="rail__head">
            <span className="clause-no">03</span>
            <h2>{t('الأشكال', 'Shape')}</h2>
          </div>
          <div className="rail__body">
            <div className="cards" style={{ ['--card-min' as string]: '120px' }}>
              {RADII.map(([token, label]) => (
                <div key={token} className="stack" style={{ ['--stack' as string]: 'var(--s-2)' }}>
                  <div style={{ height: 80, borderRadius: `var(${token})`, background: 'var(--surface-sunken)', border: '1.5px solid var(--text)' }} />
                  <span className="clause-no">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="plate rail">
            <div className="rail__head">
              <span className="clause-no">04</span>
              <h2>{t('لوح بنفسجي', 'Purple plate')}</h2>
              <p>{t('السطح المميز للهوية: نص كريمي وانحناء واسع.', 'The signature surface: cream type, generous curve.')}</p>
              <div className="cluster" style={{ marginTop: 'var(--s-4)' }}>
                <a className="btn btn--inverse" href="#">{t('اطلب تقييماً', 'Request an assessment')}</a>
                <a className="btn btn--outline-inverse" href="#">{t('ما الذي يشمله؟', "What's included?")}</a>
              </div>
            </div>
            <dl className="facts rail__body">
              <div><dt>{t('نوع الارتباط', 'Engagement')}</dt><dd>{t('تقييم ثم خطة معالجة', 'Assessment, then a remediation plan')}</dd></div>
              <div><dt>{t('المدة المعتادة', 'Typical duration')}</dt><dd><span className="tbc">⚠️ NEEDS CONFIRMATION</span></dd></div>
              <div><dt>{t('لغة التسليم', 'Delivered in')}</dt><dd>{t('العربية والإنجليزية', 'Arabic and English')}</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container rail">
          <div className="rail__head">
            <span className="clause-no">05</span>
            <h2>{t('كتل المواصفات', 'Spec blocks')}</h2>
          </div>
          <div className="rail__body stack" style={{ ['--stack' as string]: 'var(--s-6)' }}>
            <div className="scope">
              <div className="scope__card scope__card--in">
                <h3><span className="mark mark--in"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.2 5 8.6l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></span>{t('يشمل', 'Included')}</h3>
                <ul className="scope__list"><li><span />{t('مراجعة الهويات والصلاحيات.', 'Identity and access review.')}</li><li><span />{t('تقرير بالأولويات.', 'A prioritised report.')}</li></ul>
              </div>
              <div className="scope__card scope__card--out">
                <h3><span className="mark mark--out"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 3l6 6M9 3 3 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></span>{t('لا يشمل', 'Not included')}</h3>
                <ul className="scope__list"><li><span />{t('اختبارات هجومية دون تفويض مكتوب.', 'Offensive testing without written authorisation.')}</li></ul>
              </div>
            </div>
            <div className="faq">
              <details open>
                <summary>{t('هل تجرون اختبارات اختراق؟', 'Do you run penetration tests?')}<span className="faq__icon" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></span></summary>
                <p>{t('نركز على التقييم الدفاعي. أي اختبار هجومي يتم بتفويض مكتوب فقط.', 'We focus on defensive assessment. Any offensive test needs written authorisation.')}</p>
              </details>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container rail">
          <div className="rail__head">
            <span className="clause-no">06</span>
            <h2>{t('النماذج', 'Forms')}</h2>
          </div>
          <form className="rail__body" action="#">
            <div className="form-cols">
              <div className="field"><label htmlFor="sg-name">{t('الاسم الكامل', 'Full name')} <span className="field__req" aria-hidden="true">*</span></label><input id="sg-name" className="input" /></div>
              <div className="field"><label htmlFor="sg-email">{t('البريد الإلكتروني', 'Email')}</label><input id="sg-email" className="input" dir="ltr" aria-invalid="true" aria-describedby="sg-email-err" defaultValue="name@" /><span className="field__error" id="sg-email-err">{t('أدخل بريداً إلكترونياً صحيحاً.', 'Enter a valid email address.')}</span></div>
            </div>
            <div className="field" role="radiogroup" aria-labelledby="sg-svc">
              <span className="field__legend" id="sg-svc">{t('مجال الاهتمام', 'Service interest')}</span>
              <ul className="choice-row">
                <li><label className="choice"><input type="radio" name="sg" defaultChecked /><span>{t('الأمن السيبراني', 'Cybersecurity')}</span><span className="choice__tick" aria-hidden="true">✓</span></label></li>
                <li><label className="choice"><input type="radio" name="sg" /><span>{t('الأنظمة المخصصة', 'Custom systems')}</span><span className="choice__tick" aria-hidden="true">✓</span></label></li>
              </ul>
            </div>
            <div className="field"><div className="checkbox-row"><input id="sg-c" type="checkbox" defaultChecked /><label htmlFor="sg-c">{t('أوافق على سياسة الخصوصية', 'I agree to the Privacy Policy')}</label></div></div>
            <div className="form-banner form-banner--error" role="alert"><h3>{t('تعذّر إرسال الطلب', 'Your request could not be sent')}</h3><p>{t('حاول مرة أخرى.', 'Please try again.')}</p></div>
          </form>
        </div>
      </section>
    </>
  );
}
