/**
 * Legal document layout (privacy, terms): a contents list beside the text on
 * wide screens, collapsible above it on phones, and one clause shown at a
 * time (LegalReader). Built from the page's rich-text blocks: each block's
 * heading is a clause.
 */
import type { Locale } from '@protocol-soft/shared';

import { LegalReader } from './LegalReader';
import { RichText } from './RichText';

type Block = { blockType?: string; heading?: string | null; content?: unknown };

/** The clauses of a legal page, or null when its blocks are not all headed text. */
export const legalClauses = (blocks: unknown): Array<{ heading: string; content: unknown }> | null => {
  if (!Array.isArray(blocks) || blocks.length === 0) return null;
  const list = blocks as Block[];
  if (!list.every((b) => b.blockType === 'contentRichText' && typeof b.heading === 'string' && b.heading.trim())) return null;
  return list.map((b) => ({ heading: String(b.heading), content: b.content }));
};

export const LegalDocument = ({ clauses, locale }: { clauses: Array<{ heading: string; content: unknown }>; locale: Locale }) => {
  const items = clauses.map((c, i) => ({ id: `clause-${i + 1}`, no: String(i + 1).padStart(2, '0'), label: c.heading }));
  return (
    <section className="section legal" aria-label={locale === 'ar' ? 'نص الوثيقة' : 'Document text'}>
      <div className="container">
        <LegalReader
          locale={locale}
          items={items}
          clauses={clauses.map((c, i) => (
            <article key={items[i]!.id} id={items[i]!.id} className="legal__clause" aria-labelledby={`${items[i]!.id}-title`}>
              <span className="legal__no" aria-hidden="true">{items[i]!.no}</span>
              <div className="legal__content">
                <h2 id={`${items[i]!.id}-title`}>{c.heading}</h2>
                <RichText data={c.content} className="prose legal__text" />
              </div>
            </article>
          ))}
        />
      </div>
    </section>
  );
};
