'use client';
/**
 * One-clause-at-a-time reader for legal documents. The contents list selects
 * the clause shown; previous / next buttons step through them. The selection
 * lives in the URL hash (#clause-N), so a clause can be linked to and the back
 * button works. The server renders every clause (first one visible); printing
 * and no-JS visitors get the whole document.
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

import type { Locale } from '@protocol-soft/shared';

type Item = { id: string; no: string; label: string };

const indexFromHash = (items: Item[]): number => {
  const id = typeof window === 'undefined' ? '' : window.location.hash.slice(1);
  const i = items.findIndex((it) => it.id === id);
  return i >= 0 ? i : 0;
};

export const LegalReader = ({ locale, items, clauses }: { locale: Locale; items: Item[]; clauses: ReactNode[] }) => {
  const ar = locale === 'ar';
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Follow the hash: first load, back/forward, and in-page links.
  useEffect(() => {
    const sync = (): void => setActive(indexFromHash(items));
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [items]);

  const select = useCallback((i: number) => {
    setActive(i);
    setOpen(false);
    window.history.pushState(null, '', `#${items[i]!.id}`);
    // Bring the start of the clause into view if the reader has scrolled past it.
    const top = bodyRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0 || top > window.innerHeight * 0.6) {
      bodyRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }, [items]);

  const prev = active > 0 ? items[active - 1] : null;
  const next = active < items.length - 1 ? items[active + 1] : null;

  return (
    <div className="legal__grid">
      <nav className="legal__toc" aria-labelledby="legal-toc-title" data-open={open || undefined}>
        <button type="button" className="legal__toc-toggle" aria-expanded={open} aria-controls="legal-toc-list" onClick={() => setOpen((v) => !v)}>
          <span id="legal-toc-title">{ar ? 'محتويات الوثيقة' : 'Contents'}</span>
          <span className="legal__toc-current">{items[active]!.no} · {items[active]!.label}</span>
          <span className="legal__toc-count">{ar ? `${items.length} بنداً` : `${items.length} sections`}</span>
          <svg className="legal__toc-chev" width="12" height="12" viewBox="0 0 10 10" aria-hidden="true" focusable="false">
            <path d="M1.5 3.5 5 7l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <ol id="legal-toc-list" className="legal__toc-list" role="list">
          {items.map((it, i) => (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                aria-current={i === active ? 'true' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  select(i);
                }}
              >
                <span className="legal__toc-no">{it.no}</span>
                <span>{it.label}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="legal__body" ref={bodyRef} aria-live="polite">
        {clauses.map((clause, i) => (
          <div key={items[i]!.id} className="legal__panel" hidden={i !== active}>
            {clause}
          </div>
        ))}
        <div className="legal__pager">
          {prev ? (
            <button type="button" className="legal__step legal__step--prev" onClick={() => select(active - 1)}>
              <span className="legal__step-dir"><span className="btn__arrow" aria-hidden="true">←</span> {ar ? 'البند السابق' : 'Previous'}</span>
              <span className="legal__step-title">{prev.label}</span>
            </button>
          ) : <span />}
          {next ? (
            <button type="button" className="legal__step legal__step--next" onClick={() => select(active + 1)}>
              <span className="legal__step-dir">{ar ? 'البند التالي' : 'Next'} <span className="btn__arrow" aria-hidden="true">→</span></span>
              <span className="legal__step-title">{next.label}</span>
            </button>
          ) : <span />}
        </div>
      </div>
      <noscript>
        <style>{'.legal__panel[hidden]{display:block!important}.legal__pager{display:none}'}</style>
      </noscript>
    </div>
  );
};
