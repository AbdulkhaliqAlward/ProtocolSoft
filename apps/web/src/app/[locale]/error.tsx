'use client';

/** Page-level error boundary: a plain, bilingual message with one retry and a
 *  way to reach us. Never exposes stack traces or internals. */
import { useEffect } from 'react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Client-side log only — no internals rendered to the page.
    console.error('[page-error]', error.digest ?? '');
  }, [error]);

  const isEn = typeof window !== 'undefined' && window.location.pathname.startsWith('/en');
  return (
    <section className="lost">
      <div className="container">
        <div className="error-panel" role="alert">
          <h1>{isEn ? 'This page did not load' : 'تعذّر تحميل الصفحة'}</h1>
          <p>
            {isEn
              ? 'Something went wrong on our side. Try again; if it keeps failing, the contact page still works.'
              : 'حدث خطأ من جهتنا. أعد المحاولة، وإن تكرر الأمر فصفحة التواصل تعمل.'}
          </p>
          <div className="empty-state__actions">
            <button type="button" className="btn btn--primary" onClick={reset}>{isEn ? 'Try again' : 'إعادة المحاولة'}</button>
            <a href={isEn ? '/en/contact' : '/contact'} className="btn btn--text">{isEn ? 'Contact us' : 'تواصل معنا'}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
