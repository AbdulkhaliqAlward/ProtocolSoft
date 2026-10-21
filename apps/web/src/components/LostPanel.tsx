'use client';

/** 404 content (shared by [locale]/not-found and the global 404): a purple
 *  plate with a plain apology and the places people usually want. Not-found
 *  routes receive no params, so the path decides the language. */
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Spark } from './Spark';

export const isEnglishPath = (pathname: string): boolean => pathname === '/en' || pathname.startsWith('/en/');

export const LostPanel = () => {
  const ar = !isEnglishPath(usePathname() ?? '/');
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
                  <Link href={l.href}><span>{l.label}</span><Spark size="sm" /></Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
};
