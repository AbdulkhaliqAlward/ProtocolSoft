/**
 * <html>/<body> shell shared by the root layouts ([locale] for the public
 * site, /preview for draft previews). Fonts, global CSS and the pre-paint
 * theme bootstrap live here so both roots behave identically.
 */
import type { ReactNode } from 'react';

import { fontVariables } from '@/app/fonts';

import '@/app/globals.css';

/**
 * Pre-paint theme bootstrap: stored explicit choice → OS preference → Light.
 * Runs as the first body child so `data-theme` is pinned before any content
 * paints (no flash of the wrong theme). It touches only the non-sensitive theme
 * preference. Without JS no attribute is set and the CSS media query applies
 * the OS choice. Also adds the `js` class that arms the entrance motion, so
 * content is never hidden when JS is unavailable.
 */
const themeBootstrap = `(function(){try{var k='protocol-soft-theme';var s=localStorage.getItem(k);var t;if(s==='light'||s==='dark'){t=s;}else if(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches){t='dark';}else{t='light';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}document.documentElement.classList.add('js');})();`;

export const DocumentShell = ({ lang, dir, children }: { lang: string; dir: 'rtl' | 'ltr'; children: ReactNode }) => (
  // suppressHydrationWarning: the bootstrap sets data-theme and the js class
  // before hydration (same pattern as next-themes; React never manages them).
  // data-scroll-behavior: Next turns smooth scrolling off while it resets
  // the scroll position on navigation (otherwise the reset animates).
  <html lang={lang} dir={dir} className={fontVariables} data-scroll-behavior="smooth" suppressHydrationWarning>
    <body>
      <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      {children}
    </body>
  </html>
);
