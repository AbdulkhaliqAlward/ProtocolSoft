/**
 * Site chrome data. Primary navigation (approved order): Home, Services (menu
 * of the published services), About, Contact. Work / Case Studies stays hidden
 * at launch; the EDR initiative never appears in navigation.
 * Arabic is the default locale at unprefixed URLs; English lives under /en.
 */
import type { Locale } from '@protocol-soft/shared';

export interface NavItem {
  key: 'home' | 'services' | 'about' | 'contact';
  label: { ar: string; en: string };
  path: string;
}

export const PRIMARY_NAV: NavItem[] = [
  { key: 'home', label: { ar: 'الرئيسية', en: 'Home' }, path: '/' },
  { key: 'services', label: { ar: 'الخدمات', en: 'Services' }, path: '/services' },
  { key: 'about', label: { ar: 'من نحن', en: 'About' }, path: '/about' },
  { key: 'contact', label: { ar: 'تواصل معنا', en: 'Contact' }, path: '/contact' },
];

export const localePath = (locale: Locale, path: string): string =>
  locale === 'en' ? `/en${path === '/' ? '' : path}` : path;

/** Path without the /en prefix, for active-state matching. */
export const barePath = (pathname: string): string => pathname.replace(/^\/en(?=\/|$)/, '') || '/';

/** The other-locale URL for the switcher, preserving the current path (Phase 1 §7). */
export const switchHref = (locale: Locale, pathname: string): string => {
  const bare = barePath(pathname);
  return locale === 'en' ? bare : `/en${bare === '/' ? '' : bare}`;
};

/** Typeset name beside the logo mark (the logo's own wordmark is Latin and stacked). */
export const BRAND = {
  name: { ar: 'بروتوكول سوفت', en: 'Protocol Soft' },
} as const;
