/** Initiative card (§8.3, D2): compact dashed card signaling non-commercial
 *  status. Renders ONLY approved wording + the mandatory In-Development badge.
 *  No CTA, no links, no metrics — structurally impossible by design. */
import type { Locale, PublicInitiativeCard } from '@protocol-soft/shared';

const TL = (value: { ar: string; en: string } | string | null | undefined, locale: Locale): string => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return value[locale] ?? '';
};

export const InitiativeCard = ({ initiative, locale }: { initiative: PublicInitiativeCard; locale: Locale }) => (
  <article className="card card--initiative">
    <p className="kicker" style={{ marginBottom: 8 }}>
      {locale === 'ar' ? 'مبادرة مفتوحة المصدر' : 'Open-source initiative'}
    </p>
    <h3 style={{ marginBottom: 8 }}>{TL(initiative.title, locale)}</h3>
    <p style={{ marginBottom: 8 }}>
      <span className="badge badge--info">{TL(initiative.statusLabel, locale)}</span>
    </p>
    <p className="secondary" style={{ fontSize: 'var(--fs-body-sm)', margin: 0 }}>{TL(initiative.shortDescription, locale)}</p>
  </article>
);
