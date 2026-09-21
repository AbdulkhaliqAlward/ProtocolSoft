/** Localization model (Phase 2 §3): Arabic-first, no silent fallback on public reads. */

export const LOCALES = ['ar', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'ar';

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value);

/** dir attribute per locale (public site + admin). */
export const LOCALE_DIR: Record<Locale, 'rtl' | 'ltr'> = { ar: 'rtl', en: 'ltr' };

/** publishedLocales is a custom array field on localized content entities.
 *  Publish actions append/remove locales server-side after completeness validation. */
export type PublishedLocales = Locale[];

export const localeIsPublished = (
  publishedLocales: PublishedLocales | null | undefined,
  locale: Locale,
): boolean => Array.isArray(publishedLocales) && publishedLocales.includes(locale);

/**
 * Internal-API behavior contract (Phase 2 §3, §6.1): a read for a locale that is
 * not in publishedLocales returns 404 for that content — no silent fallback to Arabic.
 */
export const NO_FALLBACK_ON_PUBLIC_READS = true;
