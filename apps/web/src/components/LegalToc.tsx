'use client';
/**
 * Table of contents for a legal document. Wide screens: always open, sticky,
 * and the clause being read is highlighted. Phones: a button that opens the
 * list, which closes again after a clause is chosen.
 */
import { useEffect, useState } from 'react';

import type { Locale } from '@protocol-soft/shared';

export const LegalToc = ({ locale, items }: { locale: Locale; items: Array<{ id: string; no: string; label: string }> }) => {
  const ar = locale === 'ar';
  const [active, setActive] = useState(items[0]?.id ?? '');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const targets = items.map((it) => document.getElementById(it.id)).filter((el): el is HTMLElement => el != null);
    if (!('IntersectionObserver' in window) || targets.length === 0) return undefined;
    // A clause is "current" once its top passes the upper third of the screen.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-25% 0px -65% 0px' },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className="legal__toc" aria-labelledby="legal-toc-title" data-open={open || undefined}>
      <button type="button" className="legal__toc-toggle" aria-expanded={open} aria-controls="legal-toc-list" onClick={() => setOpen((v) => !v)}>
        <span id="legal-toc-title">{ar ? 'محتويات الوثيقة' : 'Contents'}</span>
        <span className="legal__toc-count">{ar ? `${items.length} بنداً` : `${items.length} sections`}</span>
        <svg className="legal__toc-chev" width="12" height="12" viewBox="0 0 10 10" aria-hidden="true" focusable="false">
          <path d="M1.5 3.5 5 7l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <ol id="legal-toc-list" className="legal__toc-list" role="list">
        {items.map((it) => (
          <li key={it.id}>
            <a href={`#${it.id}`} aria-current={active === it.id ? 'location' : undefined} onClick={() => setOpen(false)}>
              <span className="legal__toc-no">{it.no}</span>
              <span>{it.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
};
