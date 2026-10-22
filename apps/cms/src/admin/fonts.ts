/**
 * Admin typefaces, the same families as the public site: Readex Pro for
 * headings and the brand name, IBM Plex Sans Arabic / IBM Plex Sans for the
 * interface. next/font serves them first-party (no runtime Google request).
 * They are exposed as CSS custom properties through ADMIN_FONT_CSS, which the
 * admin layout injects (Payload owns the <html> element, so no className).
 */
import { IBM_Plex_Sans, IBM_Plex_Sans_Arabic, Readex_Pro } from 'next/font/google';

const readex = Readex_Pro({ subsets: ['arabic', 'latin'], weight: 'variable', display: 'swap' });
const plexArabic = IBM_Plex_Sans_Arabic({ subsets: ['arabic'], weight: ['400', '500', '600'], display: 'swap' });
const plexSans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], display: 'swap' });

export const ADMIN_FONT_CSS = `:root{--ps-font-display:${readex.style.fontFamily},"Segoe UI",Tahoma,sans-serif;--font-body:${plexSans.style.fontFamily},${plexArabic.style.fontFamily},"Segoe UI",Tahoma,system-ui,sans-serif}html[lang="ar"]{--font-body:${plexArabic.style.fontFamily},${plexSans.style.fontFamily},"Segoe UI",Tahoma,system-ui,sans-serif}`;
