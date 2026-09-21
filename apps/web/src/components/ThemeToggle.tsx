'use client';

/**
 * Light/Dark theme toggle (Phase 5 visual rebuild §14).
 * - Selection flow: stored explicit choice → OS preference → Light (bootstrap
 *   script in the root layout pins `data-theme` pre-paint; no flash).
 * - Persisted as `protocol-soft-theme` in localStorage — the ONLY client-side
 *   preference storage in this app (non-sensitive theme choice; no lead or
 *   content data may ever live here).
 * - Accessibility: the accessible name describes the CURRENT ACTION ("Switch
 *   to dark theme" / "التبديل إلى المظهر الداكن"), which also announces the
 *   current state; the visible label + icon show the active theme. Works with
 *   mouse, touch, and keyboard; respects reduced motion (no animated swap).
 * - While no explicit choice is stored, live OS preference changes are
 *   followed; once the user toggles, their explicit choice wins.
 */
import { useCallback, useEffect, useState } from 'react';

import type { Locale } from '@protocol-soft/shared';

export const THEME_STORAGE_KEY = 'protocol-soft-theme';

const readStored = (): 'light' | 'dark' | null => {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
};

const apply = (theme: 'light' | 'dark'): void => {
  document.documentElement.setAttribute('data-theme', theme);
};

export const ThemeToggle = ({ locale }: { locale: Locale }) => {
  // Post-mount state only: the pre-hydration markup is identical on server and
  // client, so the externally-set data-theme never causes a hydration mismatch.
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.getAttribute('data-theme') === 'dark');
    setReady(true);
    // Follow live OS changes only while the user has made no explicit choice.
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemChange = (e: MediaQueryListEvent): void => {
      if (readStored() == null) {
        apply(e.matches ? 'dark' : 'light');
        setDark(e.matches);
      }
    };
    media.addEventListener('change', onSystemChange);
    return () => media.removeEventListener('change', onSystemChange);
  }, []);

  const toggle = useCallback((): void => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* storage unavailable (private mode): theme still applies for the session */
    }
    setDark(next === 'dark');
  }, []);

  // Visible label shows the ACTIVE theme; the accessible name (set once the
  // real state is known) describes the action the button performs.
  const label = locale === 'ar' ? (dark ? 'داكن' : 'فاتح') : dark ? 'Dark' : 'Light';
  const actionLabel = ready
    ? locale === 'ar'
      ? dark ? 'التبديل إلى المظهر الفاتح' : 'التبديل إلى المظهر الداكن'
      : dark ? 'Switch to light theme' : 'Switch to dark theme'
    : undefined;

  return (
    <button
      type="button"
      className="theme-toggle"
      data-mode={ready && dark ? 'dark' : undefined}
      onClick={toggle}
      aria-label={actionLabel}
      title={actionLabel}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {dark ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" focusable="false">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" focusable="false">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        )}
      </span>
      <span className="theme-toggle__label">{label}</span>
    </button>
  );
};
