/**
 * Typeface system (direction B, softened). next/font downloads the files at
 * build time and serves them first-party from /_next/static — no runtime
 * request to Google. Only the subsets and weights the design uses are pulled:
 *
 *   Readex Pro            display + interface, Arabic and Latin (variable wght)
 *   IBM Plex Sans Arabic  Arabic reading text, 400 and 600
 *   IBM Plex Sans         Latin reading text (variable wght)
 *   IBM Plex Mono         clause numbers and references only, 500
 *
 * Loading strategy (measured, see the performance commit): every font that
 * swaps in after first paint relays out the whole page, and on a slow
 * connection five late swaps cost ~750 ms of layout on a mid-range phone.
 * So only the headline face swaps (it must show in its own face; preloaded);
 * the reading and number faces use display "optional": if not ready almost
 * immediately, that view keeps the system face with no swap, and the font is
 * cached for the next page. Plex Arabic 400 is preloaded so it is almost
 * always ready on Arabic pages.
 *
 * Each exposes a CSS variable consumed by the --font-* tokens in
 * styles/tokens.css. All four are SIL Open Font License 1.1.
 */
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Sans_Arabic, Readex_Pro } from 'next/font/google';

export const readex = Readex_Pro({
  subsets: ['arabic', 'latin'],
  weight: 'variable',
  display: 'swap',
  variable: '--ff-readex',
  fallback: ['Segoe UI', 'Tahoma', 'system-ui', 'sans-serif'],
});

export const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '600'],
  display: 'optional',
  variable: '--ff-plex-ar',
  fallback: ['Segoe UI', 'Tahoma', 'Geeza Pro', 'system-ui', 'sans-serif'],
});

export const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: 'variable',
  display: 'optional',
  preload: false,
  variable: '--ff-plex',
  fallback: ['Segoe UI', 'system-ui', 'sans-serif'],
});

export const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['500'],
  display: 'optional',
  preload: false,
  variable: '--ff-mono',
  fallback: ['ui-monospace', 'Consolas', 'monospace'],
});

export const fontVariables = [readex.variable, plexArabic.variable, plexSans.variable, plexMono.variable].join(' ');
