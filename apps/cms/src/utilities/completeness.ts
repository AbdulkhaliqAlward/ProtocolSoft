/**
 * Per-locale completeness rules (Phase 2 §3, §5). A locale is complete when all
 * required fields for that locale are non-empty. Drives per-language publish gating.
 */
import type { Locale } from '@protocol-soft/shared';

type Doc = Record<string, unknown>;

const isFilled = (value: unknown): boolean => {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') {
    // Lexical richtext nodes
    const root = (value as { root?: { children?: unknown[] } }).root;
    if (root) return Array.isArray(root.children) && root.children.length > 0;
    return Object.keys(value).length > 0;
  }
  return true;
};

/** localized value getter: localized fields store { ar, en } objects on the doc. */
const localizedValue = (doc: Doc, field: string, locale: Locale): unknown => {
  const value = doc[field];
  if (value != null && typeof value === 'object' && !Array.isArray(value) && !(value as { root?: unknown }).root) {
    return (value as Record<string, unknown>)[locale];
  }
  return value;
};

export interface CompletenessRule {
  /** Top-level required field names (localized fields checked per locale). */
  fields: string[];
  /** Required minimum counts for array fields, keyed by field name. */
  minItems?: Record<string, number>;
}

export const COMPLETENESS: Record<string, CompletenessRule> = {
  services: {
    fields: ['title', 'heroHeadline', 'summary', 'overview', 'seo.description'],
    minItems: { deliverables: 1, processSteps: 1 },
  },
  'case-studies': {
    fields: ['title', 'summary', 'challenge', 'solution'],
    minItems: {},
  },
  'technical-initiatives': {
    fields: ['title', 'shortDescription'],
    minItems: {},
  },
  'team-members': {
    fields: ['jobTitle'],
    minItems: {},
  },
  pages: {
    fields: ['title', 'blocks'],
    minItems: { blocks: 1 },
  },
};

/** Shared structural fields (non-localized, must exist once for any publish). */
const STRUCTURAL_REQUIRED: Record<string, string[]> = {
  services: ['slug', 'sortOrder'],
  'case-studies': ['slug', 'projectType', 'client.approvalStatus', 'coverImage', 'sortOrder'],
  'technical-initiatives': ['category', 'status'],
  'team-members': ['name', 'visible', 'sortOrder'],
  pages: ['slug'],
};

const get = (doc: Doc, path: string): unknown =>
  path.split('.').reduce<unknown>((acc, segment) => (acc != null && typeof acc === 'object' ? (acc as Doc)[segment] : undefined), doc);

export const missingForLocale = (collectionSlug: string, doc: Doc, locale: Locale): string[] => {
  const rule = COMPLETENESS[collectionSlug];
  if (!rule) return [];
  const missing: string[] = [];
  for (const field of rule.fields) {
    if (!isFilled(localizedValue(doc, field, locale))) missing.push(field);
  }
  for (const [field, min] of Object.entries(rule.minItems ?? {})) {
    const arr = doc[field];
    if (!Array.isArray(arr) || arr.length < min) missing.push(`${field} (min ${min})`);
  }
  return missing;
};

export const missingStructural = (collectionSlug: string, doc: Doc): string[] => {
  const required = STRUCTURAL_REQUIRED[collectionSlug] ?? [];
  return required.filter((path) => !isFilled(get(doc, path)));
};
