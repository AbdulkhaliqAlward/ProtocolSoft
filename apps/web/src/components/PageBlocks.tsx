/**
 * Pages-collection block renderer. Each block becomes a full-width section on
 * the shared rail (heading in the 4-column rail, content in the 8-column
 * field), numbered in order, so CMS pages read like the rest of the site.
 * mediaText images flow through the gated /api/media proxy (D-1), which 404s
 * for anything not publicly deliverable.
 */
import type { ReactNode } from 'react';

import type { Locale } from '@protocol-soft/shared';

import { RichText } from './RichText';
import { Faq, Section, clause } from './sections';

type Block = Record<string, unknown>;
const str = (v: unknown): string => (typeof v === 'string' ? v : '');

export const PageBlocks = ({ blocks, locale, fallbackHeading }: { blocks: unknown; locale: Locale; fallbackHeading: string }) => {
  if (!Array.isArray(blocks)) return null;
  const ar = locale === 'ar';
  const out: ReactNode[] = [];
  let n = 0;
  for (const [i, raw] of (blocks as Block[]).entries()) {
    switch (raw.blockType) {
      case 'contentRichText':
        out.push(
          <Section key={i} no={clause(++n)} title={str(raw.heading) || fallbackHeading}>
            <RichText data={raw.content} className="prose" />
          </Section>,
        );
        break;
      case 'featureGrid': {
        const items = (Array.isArray(raw.items) ? raw.items : []) as Array<{ title?: string; description?: string }>;
        if (items.length === 0) break;
        out.push(
          <Section key={i} no={clause(++n)} title={str(raw.heading) || (ar ? 'مبادئنا' : 'Our principles')}>
            <ul className="principles" role="list">
              {items.filter((it) => it.title).map((it) => (
                <li key={it.title}>
                  <h3>{it.title}</h3>
                  {it.description && <p>{it.description}</p>}
                </li>
              ))}
            </ul>
          </Section>,
        );
        break;
      }
      case 'faqAccordion': {
        const faqs = ((Array.isArray(raw.faqs) ? raw.faqs : []) as Array<{ question?: string; answer?: string }>)
          .filter((f): f is { question: string; answer: string } => Boolean(f.question && f.answer));
        if (faqs.length === 0) break;
        out.push(
          <Section key={i} no={clause(++n)} title={str(raw.heading) || (ar ? 'أسئلة شائعة' : 'Common questions')}>
            <Faq items={faqs} locale={locale} />
          </Section>,
        );
        break;
      }
      case 'ctaBanner':
        out.push(
          <section key={i} className="cta-band" aria-label={str(raw.heading)}>
            <div className="container">
              <div className="cta-band__inner">
                <div>
                  <h2>{str(raw.heading)}</h2>
                  {str(raw.body) && <p>{str(raw.body)}</p>}
                </div>
                {str(raw.ctaLabel) && (
                  <div className="cta-band__actions">
                    <a href={str(raw.ctaTarget) || '#'} className="btn btn--primary btn--lg">{str(raw.ctaLabel)}</a>
                  </div>
                )}
              </div>
            </div>
          </section>,
        );
        break;
      case 'mediaText': {
        const img = raw.image as { id?: number } | number | null | undefined;
        const imgId = img != null && typeof img === 'object' ? img.id : img;
        out.push(
          <Section key={i} no={clause(++n)} title={str(raw.heading) || fallbackHeading}>
            <div className="media-text">
              {imgId != null && (
                // Gated proxy: private/unscreened media 404s and renders nothing sensitive.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/api/media/${imgId}`} alt="" loading="lazy" decoding="async" />
              )}
              <RichText data={raw.text} className="prose" />
            </div>
          </Section>,
        );
        break;
      }
      default:
        break;
    }
  }
  return <>{out}</>;
};
