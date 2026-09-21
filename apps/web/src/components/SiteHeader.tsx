'use client';

/**
 * Site header (Phase 3 §8.5, rebuilt per the Phase 5 visual rebuild §6):
 * text wordmark only (no invented logo mark), the D-3 approved launch
 * navigation exactly — AR: الخدمات | من نحن | تواصل معنا | English — EN:
 * Services | About | Contact | العربية. No Case Studies, Blog, Team, or EDR
 * item (D-3/D-4). Mobile drawer slides from the start edge with focus
 * management (focus moves in on open, returns to the toggle on close, Esc
 * closes); the language switch preserves the path; the theme toggle sits in
 * the header end and persists across pages/locales.
 */
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

import type { Locale } from '@protocol-soft/shared';

import { BRAND, localePath, PRIMARY_NAV, switchHref } from './siteChrome';
import { ThemeToggle } from './ThemeToggle';

export const SiteHeader = ({ locale, ctaLabel }: { locale: Locale; ctaLabel: string }) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? '/';
  const toggleRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  // Close the drawer whenever navigation lands on a new path.
  useEffect(() => setOpen(false), [pathname]);
  // Focus management: first drawer link receives focus on open; the toggle
  // regains it on close (§13 navigation motion + §6 focus requirements).
  useEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => {
        drawerRef.current?.querySelector<HTMLElement>('a')?.focus();
      });
      return () => cancelAnimationFrame(raf);
    }
    return undefined;
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const active = (target: string): boolean =>
    pathname === target || pathname.startsWith(`${target}/`);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <a href={localePath(locale, '/')} className="brand">
          <span className="brand__name" lang={locale}>{BRAND.name[locale]}</span>
        </a>

        <nav
          id="primary-nav"
          ref={drawerRef}
          className={`site-nav${open ? ' site-nav--open' : ''}`}
          aria-label={locale === 'ar' ? 'التنقل الرئيسي' : 'Primary'}
        >
          {PRIMARY_NAV.map((item) => (
            <a
              key={item.target.en}
              href={item.target[locale]}
              aria-current={active(item.target[locale]) ? 'page' : undefined}
            >
              {item.label[locale]}
            </a>
          ))}
          <a href={switchHref(locale, pathname)} className="lang-switch" lang={locale === 'ar' ? 'en' : 'ar'}>
            {locale === 'ar' ? 'English' : 'العربية'}
          </a>
        </nav>

        <div className="site-header__end">
          <ThemeToggle locale={locale} />
          <a href={localePath(locale, '/contact')} className="btn btn--primary">{ctaLabel}</a>
          <button
            type="button"
            ref={toggleRef}
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="primary-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden="true">{open ? '✕' : '☰'}</span>
            <span className="visually-hidden">
              {locale === 'ar' ? (open ? 'إغلاق القائمة' : 'فتح القائمة') : open ? 'Close menu' : 'Open menu'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
