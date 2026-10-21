/** Initiative card (D2): a dashed card that signals non-commercial status.
 *  Renders ONLY approved wording plus the mandatory In-Development badge.
 *  No CTA, no links, no metrics — structurally impossible by design. */
import type { Locale, PublicInitiativeCard } from '@protocol-soft/shared';

const TL = (value: { ar: string; en: string } | string | null | undefined, locale: Locale): string => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return value[locale] ?? '';
};

export const InitiativeCard = ({ initiative, locale }: { initiative: PublicInitiativeCard; locale: Locale }) => (
  <article className="card card--dashed">
    <span className="eyebrow">{locale === 'ar' ? 'مبادرة مفتوحة المصدر' : 'Open-source initiative'}</span>
    <h3>{TL(initiative.title, locale)}</h3>
    <span className="badge" style={{ justifySelf: 'start' }}>{TL(initiative.statusLabel, locale)}</span>
    <p>{TL(initiative.shortDescription, locale)}</p>
  </article>
);
