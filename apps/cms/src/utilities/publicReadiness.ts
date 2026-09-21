/**
 * Public Readiness Gate (Phase 2 §5.2.2, v1.5). A case study is excluded from ALL
 * public rendering until every check passes. Evaluated server-side at publish time
 * and re-checked by the Internal API filter (defense in depth).
 *
 * Checks: AR completeness · EN completeness (if intended public) · approved public
 * cover · no unresolved [PLACEHOLDER] in public fields · client-approval rules ·
 * screenshot review gate (every attached screenshot screened_approved).
 */
import type { Locale } from '@protocol-soft/shared';

import { missingForLocale, missingStructural } from './completeness.js';

type Doc = Record<string, unknown>;

export const PLACEHOLDER_TOKEN = '[PLACEHOLDER]';

export interface GateResult {
  passes: boolean;
  failingChecks: string[];
}

const get = (doc: Doc, path: string): unknown =>
  path.split('.').reduce<unknown>((acc, segment) => (acc != null && typeof acc === 'object' ? (acc as Doc)[segment] : undefined), doc);

/** Public-facing fields scanned for unresolved placeholders (per locale). */
const PUBLIC_SCAN_FIELDS = [
  'title',
  'summary',
  'challenge',
  'solution',
  'capabilities',
  'outcomes',
  'technologies',
  'client.name',
] as const;

const localizedOf = (value: unknown, locale: Locale): unknown =>
  value != null && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>)[locale] : value;

const containsPlaceholder = (value: unknown): boolean => {
  if (typeof value === 'string') return value.toUpperCase().includes(PLACEHOLDER_TOKEN);
  if (Array.isArray(value)) return value.some(containsPlaceholder);
  if (value != null && typeof value === 'object') {
    const root = (value as { root?: { children?: unknown[] } }).root;
    if (root) return JSON.stringify(root).toUpperCase().includes(PLACEHOLDER_TOKEN);
  }
  return false;
};

const hasPublicMedia = (value: unknown): value is { id?: number | string } =>
  value != null && typeof value === 'object' && ('id' in (value as object) || typeof value === 'number');

export interface ReadinessContext {
  /** id → visibility for the media items referenced by this case study (from the CMS). */
  mediaById: Map<number | string, { visibility: 'public' | 'private'; sensitivityScreening?: { status?: string } | null }>;
}

export const evaluatePublicReadiness = (
  doc: Doc,
  intendedLocales: Locale[],
  ctx: ReadinessContext,
): GateResult => {
  const failing: string[] = [];
  const slug = String(doc.slug ?? '<unknown>');

  // 1+2. Per-locale completeness
  for (const locale of intendedLocales) {
    const missing = [...missingStructural('case-studies', doc), ...missingForLocale('case-studies', doc, locale)];
    if (missing.length > 0) failing.push(`completeness:${locale} (missing: ${missing.join(', ')})`);
  }

  // 3. Approved public cover: exists, public visibility
  if (!hasPublicMedia(doc.coverImage)) {
    failing.push('cover:missing');
  } else {
    const coverId = typeof doc.coverImage === 'object' ? (doc.coverImage as { id: number | string }).id : doc.coverImage;
    const cover = ctx.mediaById.get(coverId as number | string);
    if (!cover) failing.push('cover:unresolvable');
    else if (cover.visibility !== 'public') failing.push('cover:private-media');
  }

  // 4. Placeholder scan across public-facing fields (all intended locales)
  for (const locale of intendedLocales) {
    for (const field of PUBLIC_SCAN_FIELDS) {
      if (containsPlaceholder(localizedOf(get(doc, field), locale))) {
        failing.push(`placeholder:${locale}:${field}`);
      }
    }
  }
  if (containsPlaceholder(doc.technologies)) failing.push('placeholder:shared:technologies');

  // 5. Client-approval rules — pending approval strips identity (handled at API), but the
  //    gate additionally requires that visible identity flags are only set with approval.
  const approvalStatus = String((doc.client as Doc | undefined)?.approvalStatus ?? 'pending');
  const nameVisible = Boolean((doc.client as Doc | undefined)?.nameVisible);
  const logoVisible = Boolean((doc.client as Doc | undefined)?.logoVisible);
  if (approvalStatus === 'pending' && (nameVisible || logoVisible)) {
    failing.push('client-approval:visibility-requires-approval');
  }

  // 6. Screenshot review gate — every attached screenshot must be screened_approved
  const screenshots = Array.isArray(doc.screenshots) ? doc.screenshots : [];
  for (const shot of screenshots) {
    const id = hasPublicMedia(shot) ? ((shot as { id: number | string }).id ?? shot) : shot;
    const media = ctx.mediaById.get(id as number | string);
    if (!media) failing.push(`screenshot:${String(id)}:unresolvable`);
    else if (media.sensitivityScreening?.status !== 'approved') {
      failing.push(`screenshot:${String(id)}:${media.sensitivityScreening?.status ?? 'unscreened'}`);
    }
  }

  return { passes: failing.length === 0, failingChecks: failing };
};
