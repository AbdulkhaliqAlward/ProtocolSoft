/**
 * Approved launch chrome (D-3): the primary navigation is the EXACT approved set —
 * nothing more. Case Studies, Blog, Team and a standalone EDR item are NOT in the
 * primary navigation (D-3/D-4). The language switch is part of the nav row.
 * Arabic is the default locale at unprefixed URLs; English lives under /en.
 */
import type { Locale } from '@protocol-soft/shared';

export interface NavItem {
  label: { ar: string; en: string };
  target: { ar: string; en: string };
}

/** D-3: الخدمات | من نحن | تواصل معنا — exactly three items. */
export const PRIMARY_NAV: NavItem[] = [
  { label: { ar: 'الخدمات', en: 'Services' }, target: { ar: '/services', en: '/en/services' } },
  { label: { ar: 'من نحن', en: 'About' }, target: { ar: '/about', en: '/en/about' } },
  { label: { ar: 'تواصل معنا', en: 'Contact' }, target: { ar: '/contact', en: '/en/contact' } },
];

export const localePath = (locale: Locale, path: string): string =>
  locale === 'en' ? `/en${path === '/' ? '' : path}` : path;

/** The other-locale URL for the switcher, preserving the current path (Phase 1 §7). */
export const switchHref = (locale: Locale, pathname: string): string => {
  const bare = locale === 'en' ? (pathname.replace(/^\/en/, '') || '/') : pathname;
  return locale === 'en' ? bare : `/en${bare === '/' ? '' : bare}`;
};

/** Temporary text-based brand treatment (D-6: no final logo supplied yet). */
export const BRAND = {
  name: { ar: 'بروتوكول سوفت', en: 'Protocol Soft' },
} as const;
