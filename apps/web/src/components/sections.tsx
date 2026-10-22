/**
 * Page building blocks shared by every page, so sections open the same way
 * everywhere: clause number, heading and lead in the 4-column rail; content in
 * the 8-column field. Spec-sheet blocks (scope, exchange, capabilities, FAQ)
 * render CMS content; a block whose content is empty renders nothing.
 */
import type { ReactNode } from 'react';
import Link from 'next/link';

import type { Locale } from '@protocol-soft/shared';

import { Spark } from './Spark';

/** Section number: two digits, Western numerals in both languages (approved). */
export const clause = (n: number | string): string => (typeof n === 'number' ? String(n).padStart(2, '0') : n);

export const SectionHead = ({ no, title, lead, as = 'h2', id, children }: {
  no?: string;
  title: string;
  lead?: string;
  as?: 'h1' | 'h2';
  id?: string;
  children?: ReactNode;
}) => {
  const Heading = as;
  return (
    <div className="rail__head">
      {no && <span className="clause-no">{no}</span>}
      <Heading id={id}>{title}</Heading>
      {lead && <p>{lead}</p>}
      {children}
    </div>
  );
};

/** Standard section: rail head + content field. */
export const Section = ({ no, title, lead, id, sticky, wide, band, flushTop, reveal = true, children, headExtra }: {
  no?: string;
  title: string;
  lead?: string;
  id?: string;
  sticky?: boolean;
  /** Heading above, content across the full container width. */
  wide?: boolean;
  band?: boolean;
  flushTop?: boolean;
  reveal?: boolean;
  children: ReactNode;
  headExtra?: ReactNode;
}) => {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section
      id={id}
      className={`section${band ? ' section--band' : ''}${flushTop ? ' section--flush-top' : ''}`}
      aria-labelledby={headingId}
      data-reveal={reveal || undefined}
    >
      <div className={`container rail${sticky ? ' rail--sticky' : ''}${wide ? ' rail--stacked' : ''}`}>
        <SectionHead no={no} title={title} lead={lead} id={headingId}>{headExtra}</SectionHead>
        <div className="rail__body">{children}</div>
      </div>
    </section>
  );
};

/** Page opener for inner pages (services index, about, contact, legal): the
 *  same full-width purple band as the home and service heroes, so every page
 *  starts the same way. */
export const PageHero = ({ no, title, lead, crumbs, aside, children }: {
  no?: string;
  title: string;
  lead?: string;
  crumbs?: Array<{ label: string; href?: string }>;
  aside?: ReactNode;
  children?: ReactNode;
}) => (
  <header className="page-hero plate plate--bleed">
    <div className="container rail">
      <div className="page-hero__main">
        {crumbs && crumbs.length > 0 && <Breadcrumbs items={crumbs} />}
        {no && <span className="clause-no">{no}</span>}
        <h1>{title}</h1>
        {lead && <p className="lead">{lead}</p>}
        {children}
      </div>
      {aside && <div className="page-hero__aside">{aside}</div>}
    </div>
  </header>
);

export const Breadcrumbs = ({ items }: { items: Array<{ label: string; href?: string }> }) => (
  <nav aria-label="Breadcrumb">
    <ol className="breadcrumbs">
      {items.map((it, i) => (
        <li key={`${it.label}-${i}`}>
          {it.href ? <Link href={it.href}>{it.label}</Link> : <span aria-current="page">{it.label}</span>}
          {i < items.length - 1 && <span className="breadcrumbs__sep" aria-hidden="true">/</span>}
        </li>
      ))}
    </ol>
  </nav>
);

const Check = () => (
  <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M2.5 6.2 5 8.6l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Cross = () => (
  <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M3 3l6 6M9 3 3 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
);

/** Included / not included, side by side. */
export const Scope = ({ locale, included, excluded }: {
  locale: Locale;
  included: Array<{ title: string; description?: string | null }>;
  excluded: Array<{ item: string }>;
}) => {
  const ar = locale === 'ar';
  return (
    <div className="scope">
      {included.length > 0 && (
        <div className="scope__card scope__card--in">
          <h3><span className="mark mark--in"><Check /></span>{ar ? 'يشمل' : 'Included'}</h3>
          <ul className="scope__list">
            {included.map((d) => (
              <li key={d.title}>
                <span aria-hidden="true" />
                <span><strong className="scope__title">{d.title}</strong>{d.description && <span className="scope__desc">{d.description}</span>}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {excluded.length > 0 && (
        <div className="scope__card scope__card--out">
          <h3><span className="mark mark--out"><Cross /></span>{ar ? 'لا يشمل' : 'Not included'}</h3>
          <ul className="scope__list">
            {excluded.map((x) => (
              <li key={x.item}>
                <span aria-hidden="true" />
                <span>{x.item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/** The process as an exchange: each step, what we need, what you receive. */
export const Exchange = ({ locale, steps }: {
  locale: Locale;
  steps: Array<{ title: string; description?: string | null; clientProvides?: string | null; weDeliver?: string | null }>;
}) => {
  const ar = locale === 'ar';
  const youLabel = ar ? 'منك' : 'You provide';
  const usLabel = ar ? 'منّا' : 'We deliver';
  const hasExchange = steps.some((s) => s.clientProvides || s.weDeliver);
  return (
    <ol className={`exchange${hasExchange ? '' : ' exchange--simple'}`} role="list">
      {hasExchange && (
        <li className="exchange__head" aria-hidden="true">
          <span />
          <span>{ar ? 'الخطوة' : 'Step'}</span>
          <span>{youLabel}</span>
          <span>{usLabel}</span>
        </li>
      )}
      {steps.map((s, i) => (
        <li key={s.title} className="exchange__row">
          <span className="exchange__no" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
          <div>
            <h3>{s.title}</h3>
            {s.description && <p>{s.description}</p>}
          </div>
          {hasExchange && (
            <>
              <div><span className="exchange__label">{youLabel}</span><p><span className="visually-hidden">{youLabel}: </span>{s.clientProvides}</p></div>
              <div><span className="exchange__label">{usLabel}</span><p><span className="visually-hidden">{usLabel}: </span>{s.weDeliver}</p></div>
            </>
          )}
        </li>
      ))}
    </ol>
  );
};

export const CapabilityGroups = ({ groups }: { groups: Array<{ stage: string; title: string; items?: Array<{ label: string }> | null }> }) => (
  <div className="caps">
    {groups.map((g) => (
      <div key={g.title} className="caps__group">
        <header>
          {g.stage && <span className="eyebrow">{g.stage}</span>}
          <h3>{g.title}</h3>
        </header>
        <ul className="caps__list" role="list">
          {(g.items ?? []).map((it) => (
            <li key={it.label}><Spark size="sm" />{it.label}</li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

export const Faq = ({ items }: { items: Array<{ question: string; answer: string }> }) => (
  <div className="faq">
    {items.map((f, i) => (
      <details key={f.question} open={i === 0}>
        <summary>
          <span>{f.question}</span>
          <span className="faq__icon" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 12 12" focusable="false"><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </span>
        </summary>
        <p>{f.answer}</p>
      </details>
    ))}
  </div>
);
