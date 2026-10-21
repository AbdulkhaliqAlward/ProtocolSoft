/** 404: a purple plate with a plain apology and the places people usually
 *  want, as a list rather than a row of buttons. Serves unknown URLs in both
 *  locales (unknown locale path → Arabic default). */
import type { Metadata } from 'next';
import { headers } from 'next/headers';

import type { Locale } from '@protocol-soft/shared';

import { Spark } from '@/components/Spark';

export const metadata: Metadata = {
  title: '404',
  robots: { index: false, follow: false },
};

export default async function NotFound() {
  const locale: Locale = (await headers()).get('x-locale') === 'en' ? 'en' : 'ar';
  const ar = locale === 'ar';
  const base = ar ? '' : '/en';
  const links = [
    { href: `${base}/`, label: ar ? 'الصفحة الرئيسية' : 'Home page' },
    { href: `${base}/services`, label: ar ? 'خدماتنا' : 'Our services' },
    { href: `${base}/contact`, label: ar ? 'تواصل معنا' : 'Contact us' },
  ];
  return (
    <section className="lost">
      <div className="container">
        <div className="plate lost__plate">
          <div className="stack" style={{ ['--stack' as string]: 'var(--s-4)' }}>
            <span className="lost__code" aria-hidden="true">404</span>
            <h1>{ar ? 'الصفحة غير موجودة' : 'Page not found'}</h1>
            <p>{ar ? 'الرابط الذي فتحته غير موجود أو تغيّر عنوانه. هذه أماكن قد تبحث عنها:' : 'The link you opened does not exist, or its address has changed. You might be looking for one of these:'}</p>
          </div>
          <nav aria-label={ar ? 'روابط مفيدة' : 'Useful links'}>
            <ul className="lost__links" role="list">
              {links.map((l) => (
                <li key={l.href}>
                  <a href={l.href}><span>{l.label}</span><Spark size="sm" /></a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}
