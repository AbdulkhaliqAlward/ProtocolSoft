/** 404 (§16.8): oversized 404, honest apology, actions. Serves unknown URLs in
 *  both locales (unknown locale path → Arabic default). No Case Studies link
 *  (D-4). */
import type { Metadata } from 'next';
import { headers } from 'next/headers';

import type { Locale } from '@protocol-soft/shared';

export const metadata: Metadata = {
  title: '404',
  robots: { index: false, follow: false },
};

export default async function NotFound() {
  const locale: Locale = (await headers()).get('x-locale') === 'en' ? 'en' : 'ar';
  const base = locale === 'ar' ? '' : '/en';
  return (
    <div className="container error-panel">
      <div className="error-panel__code bidi" aria-hidden="true">404</div>
      <h1>{locale === 'ar' ? 'الصفحة غير موجودة' : 'Page not found'}</h1>
      <p className="secondary">
        {locale === 'ar'
          ? 'الرابط الذي فتحته غير موجود أو تغيّر عنوانه.'
          : 'The link you opened does not exist, or its address has changed.'}
      </p>
      <div className="empty-state__actions" style={{ marginTop: 'var(--sp-6)' }}>
        <a href={`${base}/`} className="btn btn--primary">{locale === 'ar' ? 'العودة للرئيسية' : 'Back to home'}</a>
        <a href={`${base}/services`} className="btn btn--secondary">{locale === 'ar' ? 'الخدمات' : 'Services'}</a>
        <a href={`${base}/contact`} className="btn btn--ghost">{locale === 'ar' ? 'تواصل معنا' : 'Contact'}</a>
      </div>
    </div>
  );
}
