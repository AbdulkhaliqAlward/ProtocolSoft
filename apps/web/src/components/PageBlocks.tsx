/** Pages-collection block renderer (Phase 2 §5.2.5 blocks → public markup).
 *  mediaText images flow through the gated /api/media proxy (D-1) and render
 *  only when the media is publicly deliverable — the proxy 404s otherwise. */
import type { ReactNode } from 'react';

import type { Locale } from '@protocol-soft/shared';

import { RichText } from './RichText';

type Block = Record<string, unknown>;

const FaqAccordion = ({ faqs }: { faqs: Array<{ question?: string; answer?: string }> }) => (
  <div className="faq">
    {faqs.filter((f) => f.question && f.answer).map((f, i) => (
      <details key={i}>
        <summary>{f.question}</summary>
        <div>{f.answer}</div>
      </details>
    ))}
  </div>
);

export const PageBlocks = ({ blocks, locale }: { blocks: unknown; locale: Locale }) => {
  if (!Array.isArray(blocks)) return null;
  const out: ReactNode[] = [];
  for (const [i, raw] of (blocks as Block[]).entries()) {
    switch (raw.blockType) {
      case 'contentRichText':
        out.push(<RichText key={i} data={raw.content} className="prose" />);
        break;
      case 'featureGrid': {
        const items = (Array.isArray(raw.items) ? raw.items : []) as Array<{ title?: string; description?: string }>;
        out.push(
          <section key={i} className="section--tight" style={{ marginTop: 'var(--sp-7)' }}>
            {typeof raw.heading === 'string' && raw.heading && <h2>{raw.heading}</h2>}
            <div className="grid grid--3">
              {items.filter((it) => it.title).map((it, j) => (
                <div key={j} className="card card--feature">
                  <h3>{it.title}</h3>
                  {it.description && <p>{it.description}</p>}
                </div>
              ))}
            </div>
          </section>,
        );
        break;
      }
      case 'faqAccordion': {
        const faqs = (Array.isArray(raw.faqs) ? raw.faqs : []) as Array<{ question?: string; answer?: string }>;
        if (faqs.length > 0) {
          out.push(
            <section key={i} style={{ marginTop: 'var(--sp-7)' }} aria-label={locale === 'ar' ? 'أسئلة شائعة' : 'FAQ'}>
              <FaqAccordion faqs={faqs} />
            </section>,
          );
        }
        break;
      }
      case 'ctaBanner':
        out.push(
          <div key={i} className="cta-band" style={{ marginTop: 'var(--sp-8)' }}>
            <div className="container cta-band__inner">
              <h2>{String(raw.heading ?? '')}</h2>
              {typeof raw.body === 'string' && raw.body && <p>{raw.body}</p>}
              {typeof raw.ctaLabel === 'string' && raw.ctaLabel && (
                <div className="cta-band__actions">
                  <a href={typeof raw.ctaTarget === 'string' ? raw.ctaTarget : '#'} className="btn btn--primary btn--lg">{raw.ctaLabel}</a>
                </div>
              )}
            </div>
          </div>,
        );
        break;
      case 'mediaText': {
        const img = raw.image as { id?: number } | number | null | undefined;
        const imgId = img != null && typeof img === 'object' ? img.id : img;
        out.push(
          <div key={i} className="grid grid--2" style={{ marginTop: 'var(--sp-7)', alignItems: 'center' }}>
            {imgId != null ? (
              // Gated proxy: private/unscreened media 404s and renders nothing sensitive.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/api/media/${imgId}`} alt="" loading="lazy" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', maxWidth: '100%' }} />
            ) : null}
            <RichText data={raw.text} className="prose" />
          </div>,
        );
        break;
      }
      default:
        break;
    }
  }
  return <>{out}</>;
};
