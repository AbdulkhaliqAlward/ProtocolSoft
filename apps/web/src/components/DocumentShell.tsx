/**
 * <html>/<body> shell shared by the root layouts ([locale] for the public
 * site, /preview for draft previews). Fonts, global CSS and the pre-paint
 * theme (ThemeBootstrap) live here so both roots behave identically.
 */
import type { ReactNode } from 'react';

import { fontVariables } from '@/app/fonts';

import { ThemeBootstrap } from './ThemeBootstrap';

import '@/app/globals.css';

export const DocumentShell = ({ lang, dir, children }: { lang: string; dir: 'rtl' | 'ltr'; children: ReactNode }) => (
  // suppressHydrationWarning: the bootstrap sets data-theme and the js class
  // before hydration (same pattern as next-themes; React never manages them).
  // data-scroll-behavior: Next turns smooth scrolling off while it resets
  // the scroll position on navigation (otherwise the reset animates).
  <html lang={lang} dir={dir} className={fontVariables} data-scroll-behavior="smooth" suppressHydrationWarning>
    <body>
      <ThemeBootstrap />
      {children}
    </body>
  </html>
);
