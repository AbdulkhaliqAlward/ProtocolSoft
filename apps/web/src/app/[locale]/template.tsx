'use client';

/**
 * Route template: re-mounts on every navigation inside a locale, so the page
 * content eases in after a client navigation. The first load is left alone:
 * server render and hydration both omit the attribute (no mismatch, and the
 * hero/LCP paints immediately). The flag lives on window, never in module
 * state, because module state would leak across requests on the server.
 */
import { useEffect, type ReactNode } from 'react';

declare global {
  interface Window { __psHydrated?: boolean }
}

export default function RouteTemplate({ children }: { children: ReactNode }) {
  const animate = typeof window !== 'undefined' && window.__psHydrated === true;
  useEffect(() => {
    window.__psHydrated = true;
  }, []);
  return (
    <div className="route" data-enter={animate || undefined}>
      {children}
    </div>
  );
}
