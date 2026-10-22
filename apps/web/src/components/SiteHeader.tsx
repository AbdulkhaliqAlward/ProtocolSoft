'use client';

/**
 * Site header (direction B). Logo mark + typeset name, then Home · Services
 * (menu of the published services) · About · Contact. Language and theme sit
 * together in one quiet utilities pill; one primary call to action at the end.
 *
 * - Sticky with a constant height (nothing resizes, so the page never jumps);
 *   after a short scroll it gains a soft shadow.
 * - Services menu: disclosure button (click / Enter / Space), also opens on
 *   hover for fine pointers; Escape, outside click and leaving focus close it.
 * - Below 1024px the nav becomes a full-height sheet: Services expands inline,
 *   the CTA and utilities move inside, focus moves in on open and back to the
 *   toggle on close, Escape closes, page scroll is locked while open.
 */
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import type { Locale, PublicServiceSummary } from '@protocol-soft/shared';

import { LogoMark } from './LogoMark';
import { BRAND, barePath, localePath, PRIMARY_NAV, switchHref } from './siteChrome';
import { ThemeToggle } from './ThemeToggle';

const T = (value: { ar: string; en: string } | string | null | undefined, locale: Locale): string => {
  if (value == null) return '';
  return typeof value === 'string' ? value : (value[locale] ?? '');
};

const Chevron = () => (
  <svg className="site-nav__chev" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" focusable="false">
    <path d="M1.5 3.5 5 7l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Line icons for the services menu, keyed by the service's CMS icon field. */
const ServiceIcon = ({ name }: { name?: string }) => {
  const paths: Record<string, string> = {
    code: 'M8 7 3 12l5 5M16 7l5 5-5 5M13.5 4l-3 16',
    layers: 'M12 3 2.5 8 12 13l9.5-5L12 3ZM2.5 12.5 12 17.5l9.5-5M2.5 17 12 22l9.5-5',
    shield: 'M12 2.5 4 5.5v6c0 5 3.4 8.8 8 10 4.6-1.2 8-5 8-10v-6l-8-3ZM8.5 12l2.5 2.5 4.5-5',
  };
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={paths[name ?? ''] ?? paths.code} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const SiteHeader = ({
  locale,
  ctaLabel,
  services,
}: {
  locale: Locale;
  ctaLabel: string;
  services: PublicServiceSummary[];
}) => {
  const ar = locale === 'ar';
  const pathname = usePathname() ?? '/';
  const current = barePath(pathname);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const hoverTimer = useRef<number | undefined>(undefined);
  const menuId = useId();

  const isActive = (path: string): boolean => (path === '/' ? current === '/' : current === path || current.startsWith(`${path}/`));

  // Close everything on navigation, and re-read the scroll position once the
  // router has reset it (that reset does not always fire a scroll event).
  useEffect(() => {
    setSheetOpen(false);
    setMenuOpen(false);
    const raf = window.requestAnimationFrame(() => setScrolled(window.scrollY > 8));
    return () => window.cancelAnimationFrame(raf);
  }, [pathname]);

  // Shadow once the page has scrolled; height never changes (no layout shift).
  useEffect(() => {
    let frame = 0;
    const update = (): void => {
      frame = 0;
      setScrolled(window.scrollY > 8);
    };
    const onScroll = (): void => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  // Sheet: lock page scroll, move focus in, Escape closes.
  useEffect(() => {
    if (!sheetOpen) return undefined;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    const raf = requestAnimationFrame(() => navRef.current?.querySelector<HTMLElement>('a, button')?.focus());
    return () => {
      root.style.overflow = previous;
      cancelAnimationFrame(raf);
    };
  }, [sheetOpen]);

  // Escape / outside click close the menu and the sheet.
  useEffect(() => {
    if (!menuOpen && !sheetOpen) return undefined;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key !== 'Escape') return;
      if (menuOpen) {
        setMenuOpen(false);
        triggerRef.current?.focus();
      } else {
        setSheetOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent): void => {
      if (!headerRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
        setSheetOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
    };
  }, [menuOpen, sheetOpen]);

  // Hover intent for fine pointers on desktop; touch and keyboard use the button.
  const canHover = (): boolean => window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)').matches;
  const hoverOpen = useCallback(() => {
    if (!canHover()) return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setMenuOpen(true), 90);
  }, []);
  const hoverClose = useCallback(() => {
    if (!canHover()) return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setMenuOpen(false), 180);
  }, []);
  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  const onMenuBlur = (e: React.FocusEvent<HTMLLIElement>): void => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null) && canHover()) setMenuOpen(false);
  };

  const lang = (
    <a href={switchHref(locale, pathname)} className="lang-switch" lang={ar ? 'en' : 'ar'} hrefLang={ar ? 'en' : 'ar'}>
      {ar ? 'English' : 'العربية'}
    </a>
  );

  return (
    <header ref={headerRef} className="site-header" data-scrolled={scrolled || undefined} data-sheet={sheetOpen || undefined}>
      <div className="container site-header__inner">
        <Link href={localePath(locale, '/')} className="brand" aria-label={ar ? `${BRAND.name.ar} — الصفحة الرئيسية` : `${BRAND.name.en} — home`}>
          <LogoMark className="brand__mark" size={44} />
          <span className="brand__name" lang={locale}>{BRAND.name[locale]}</span>
        </Link>

        <nav id="primary-nav" ref={navRef} className="site-nav" aria-label={ar ? 'التنقل الرئيسي' : 'Primary'}>
          <ul className="site-nav__list" role="list">
            {PRIMARY_NAV.map((item) =>
              item.key === 'services' && services.length > 0 ? (
                <li key={item.key} className="site-nav__menu" onPointerEnter={hoverOpen} onPointerLeave={hoverClose} onBlur={onMenuBlur}>
                  <button
                    ref={triggerRef}
                    type="button"
                    className="site-nav__link site-nav__trigger"
                    aria-expanded={menuOpen}
                    aria-controls={menuId}
                    data-active={isActive(item.path) || undefined}
                    onClick={() => setMenuOpen((v) => !v)}
                  >
                    {item.label[locale]}
                    <Chevron />
                  </button>
                  {/* A compact card under the trigger: names only; each
                      service's description lives on its own page. */}
                  <div id={menuId} className="mega" data-open={menuOpen || undefined}>
                    <ul className="mega__list" role="list">
                      {services.map((s) => {
                        const href = localePath(locale, `/services/${s.slug}`);
                        return (
                          <li key={s.slug}>
                            <Link href={href} className="mega__item" aria-current={current === `/services/${s.slug}` ? 'page' : undefined}>
                              <span className="mega__icon"><ServiceIcon name={s.icon} /></span>
                              <span className="mega__title">{T(s.title, locale)}</span>
                              <span className="btn__arrow mega__arrow" aria-hidden="true">→</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                    <Link href={localePath(locale, '/services')} className="mega__all" aria-current={current === '/services' ? 'page' : undefined}>
                      {ar ? 'كل الخدمات' : 'All services'} <span className="btn__arrow" aria-hidden="true">→</span>
                    </Link>
                  </div>
                </li>
              ) : (
                <li key={item.key}>
                  <Link href={localePath(locale, item.path)} className="site-nav__link" aria-current={isActive(item.path) ? 'page' : undefined}>
                    {item.label[locale]}
                  </Link>
                </li>
              ),
            )}
          </ul>
          <div className="site-nav__sheet-foot">
            <Link href={localePath(locale, '/contact')} className="btn btn--primary btn--lg btn--block">{ctaLabel}</Link>
            <div className="utils" role="group" aria-label={ar ? 'اللغة والمظهر' : 'Language and theme'}>
              {lang}
              <span className="utils__sep" aria-hidden="true" />
              <ThemeToggle locale={locale} showLabel />
            </div>
          </div>
        </nav>

        <div className="site-header__end">
          <div className="utils utils--header" role="group" aria-label={ar ? 'اللغة والمظهر' : 'Language and theme'}>
            {lang}
            <span className="utils__sep" aria-hidden="true" />
            <ThemeToggle locale={locale} />
          </div>
          <Link href={localePath(locale, '/contact')} className="btn btn--primary btn--sm site-header__cta">{ctaLabel}</Link>
          <button
            type="button"
            ref={toggleRef}
            className="nav-toggle icon-btn"
            aria-expanded={sheetOpen}
            aria-controls="primary-nav"
            onClick={() => setSheetOpen((v) => !v)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
              {sheetOpen ? (
                <path d="M4 4l10 10M14 4 4 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              ) : (
                <path d="M3 5h12M3 9h12M3 13h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              )}
            </svg>
            <span className="visually-hidden">{ar ? (sheetOpen ? 'إغلاق القائمة' : 'فتح القائمة') : sheetOpen ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
