import type { Metadata } from 'next';
import { headers } from 'next/headers';
import React from 'react';

import { LOCALE_DIR, type Locale } from '@protocol-soft/shared';

import './globals.css';

export const metadata: Metadata = {
  robots: { index: true, follow: true },
};

/**
 * Pre-paint theme bootstrap (Phase 5 visual revision): stored explicit choice →
 * OS preference → Light. Runs as the first body child so `data-theme` is pinned
 * before any content paints (no flash of incorrect theme). The only client-side
 * storage this touches is the non-sensitive theme preference. Without JS, no
 * attribute is set and the CSS system-preference media query applies the OS
 * choice (Light fallback). Also pins the `js` class that gates the scroll-
 * entrance motion so content is never hidden when JS is unavailable.
 */
const themeBootstrap = `(function(){try{var k='protocol-soft-theme';var s=localStorage.getItem(k);var t;if(s==='light'||s==='dark'){t=s;}else if(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches){t='dark';}else{t='light';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}document.documentElement.classList.add('js');})();`;

/** Root layout: html attrs derive from the middleware-injected locale (ar default at `/`). */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = ((await headers()).get('x-locale') ?? 'ar') as Locale;
  const dir = LOCALE_DIR[locale] ?? 'rtl';
  return (
    // suppressHydrationWarning: the bootstrap script may set data-theme before
    // hydration (same pattern as next-themes; React never manages this attr).
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        {children}
      </body>
    </html>
  );
}
