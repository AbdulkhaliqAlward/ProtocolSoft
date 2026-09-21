'use client';

/** Page-level error boundary (§11): bilingual honest panel + retry. Never
 *  exposes stack traces or internals. */
import { useEffect } from 'react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Client-side log only — no internals rendered to the page.
    console.error('[page-error]', error.digest ?? '');
  }, [error]);

  const isEn = typeof window !== 'undefined' && window.location.pathname.startsWith('/en');
  return (
    <div className="container error-panel">
      <h1>{isEn ? 'Something went wrong' : 'حدث خطأ ما'}</h1>
      <p className="secondary">
        {isEn
          ? 'The page failed to load. You can retry — if it keeps failing, our contact channels are below.'
          : 'تعذّر تحميل الصفحة. يمكنك إعادة المحاولة — وإن تكرر الأمر فقنوات التواصل متاحة لك.'}
      </p>
      <div className="empty-state__actions" style={{ marginTop: 'var(--sp-6)' }}>
        <button type="button" className="btn btn--primary" onClick={reset}>
          {isEn ? 'Try again' : 'إعادة المحاولة'}
        </button>
        <a href={isEn ? '/en/contact' : '/contact'} className="btn btn--secondary">
          {isEn ? 'Contact us' : 'تواصل معنا'}
        </a>
      </div>
    </div>
  );
}
