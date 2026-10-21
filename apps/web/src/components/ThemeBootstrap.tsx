'use client';

/**
 * Pre-paint theme: stored explicit choice → OS preference → Light; also adds
 * the `js` class that arms the entrance motion.
 *
 * Normal loads: the <script> comes in the server HTML and runs before the body
 * paints (no flash of the wrong theme); React only hydrates it, never creates
 * it. When React renders the whole document in the browser instead (Next 16
 * does this for 404s), creating a <script> would warn and never execute, so
 * this renders nothing and applies the theme in a layout effect (before paint).
 */
import { useLayoutEffect, useSyncExternalStore } from 'react';

/** Self-contained: serialised into the inline script below. */
function applyTheme(): void {
  try {
    const stored = localStorage.getItem('protocol-soft-theme');
    const theme = stored === 'light' || stored === 'dark'
      ? stored
      : window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch {
    document.documentElement.setAttribute('data-theme', 'light');
  }
  document.documentElement.classList.add('js');
}

const inline = `(${applyTheme.toString()})();`;
const noop = (): (() => void) => () => {};

export const ThemeBootstrap = () => {
  // true on the server and while hydrating; false for a browser-only render.
  const fromServer = useSyncExternalStore(noop, () => false, () => true);
  useLayoutEffect(() => {
    if (!document.documentElement.hasAttribute('data-theme')) applyTheme();
  }, []);
  return fromServer ? <script dangerouslySetInnerHTML={{ __html: inline }} /> : null;
};
