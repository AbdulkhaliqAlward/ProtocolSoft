'use client';
/**
 * Top-bar controls (admin.components.actions): language (ع / EN) and
 * appearance (light / dark), so neither hides in the account page. Both use
 * Payload's own state: switchLanguage stores the payload-lng cookie and
 * setTheme the payload-theme preference.
 */
import { useTheme, useTranslation } from '@payloadcms/ui';

export const HeaderToggles = () => {
  const { i18n, switchLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();
  const ar = i18n.language !== 'en';
  const dark = theme === 'dark';

  return (
    <div className="ps-toggles">
      <button
        type="button"
        className="ps-toggle"
        onClick={() => void switchLanguage?.(ar ? 'en' : 'ar')}
        aria-label={ar ? 'Switch the admin to English' : 'التبديل إلى العربية'}
        title={ar ? 'English' : 'العربية'}
      >
        <span lang={ar ? 'en' : 'ar'}>{ar ? 'EN' : 'ع'}</span>
      </button>
      <button
        type="button"
        className="ps-toggle"
        onClick={() => setTheme(dark ? 'light' : 'dark')}
        aria-label={dark ? (ar ? 'الوضع الفاتح' : 'Light mode') : ar ? 'الوضع الداكن' : 'Dark mode'}
        title={dark ? (ar ? 'الوضع الفاتح' : 'Light mode') : ar ? 'الوضع الداكن' : 'Dark mode'}
      >
        {dark ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4.5" />
            <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
          </svg>
        )}
      </button>
    </div>
  );
};
