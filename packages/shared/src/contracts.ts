/**
 * Internal Public Content API contracts (Phase 2 §6, Option A).
 * The web service holds NO PostgreSQL credentials; it consumes only these endpoints
 * over the private Docker network, authenticated with purpose-specific keys.
 *
 * Endpoint groups & key enforcement (Phase 2 §6.1/§6.2 — keys are NOT interchangeable):
 *   content  : GET  /api/internal/content/*        -> WEB_TO_CMS_CONTENT_READ_KEY
 *   leads    : POST /api/internal/leads            -> WEB_TO_CMS_LEAD_SUBMIT_KEY
 *   preview  : GET  /api/internal/preview/*        -> one-time preview code ONLY (no service key)
 *   backup   : (admin-session endpoints, not service keys) + BACKUP_REPORT_KEY for job reporting
 *   revalidate: POST /api/web-internal/revalidate  -> CMS_TO_WEB_REVALIDATE_KEY (lives on the WEB service)
 */
import type { Locale } from './locales.js';

export const INTERNAL_KEY_HEADER = 'x-internal-key';

export type InternalKeyGroup = 'content' | 'leads' | 'revalidate' | 'backup-report';

/** Complete allowed-endpoint list — anything not listed must 404 (Phase 2 §6.2).
 *  Payload custom endpoints don't support path params: single-doc reads use ?slug=. */
export const INTERNAL_ENDPOINTS = {
  health: '/api/internal/health',
  siteSettings: '/api/internal/content/site-settings',
  socialLinks: '/api/internal/content/social-links',
  navigation: '/api/internal/content/navigation',
  theme: '/api/internal/content/theme',
  homepage: '/api/internal/content/homepage',
  services: '/api/internal/content/services',
  serviceBySlug: '/api/internal/content/services?slug={slug}',
  caseStudies: '/api/internal/content/case-studies',
  caseStudyBySlug: '/api/internal/content/case-studies?slug={slug}',
  initiatives: '/api/internal/content/initiatives',
  team: '/api/internal/content/team',
  pageBySlug: '/api/internal/content/pages?slug={slug}',
  redirects: '/api/internal/content/redirects',
  seo: '/api/internal/content/seo',
  contactConfig: '/api/internal/content/contact-config',
  mediaById: '/api/internal/content/media?id={id}',
  leadSubmit: '/api/internal/leads',
  previewIssue: '/api/internal/preview/issue',
  previewExchange: '/api/internal/preview/exchange',
  backupStatus: '/api/internal/backup/status',
  backupSchedule: '/api/internal/backup/schedule',
  backupRequestManual: '/api/internal/backup/request-manual',
  backupReport: '/api/internal/backup/report',
  publishLocale: '/api/publish/{collection}/{id}',
} as const;

/** Envelope for every internal response (Phase 2 §6.1). fallbackUsed is ALWAYS false. */
export interface InternalEnvelope<T> {
  locale: Locale;
  fallbackUsed: false;
  data: T;
}

/* ── Public-safe data shapes (stripped per Phase 2 §6.3/§6.4) ── */

export interface PublicSiteSettings {
  companyName: { ar: string; en: string };
  tagline: { ar: string; en: string };
  emailMain: string;
  emailSales?: string;
  emailSupport?: string;
  phone?: string;
  addressLine?: { ar: string; en: string };
  city?: string;
  country?: string;
  workingHours?: { ar: string; en: string };
  footerCopyright: { ar: string; en: string };
}

export interface PublicSocialLink {
  platform: string;
  label?: { ar: string; en: string };
  url: string;
}

export interface PublicNavItem {
  label: { ar: string; en: string };
  target: string;
}

/**
 * Public-safe theme settings (Phase 5 visual revision). Controlled variants
 * ONLY — the approved semantic token sets live in code; the CMS can never
 * publish raw hex colors that could break contrast or brand consistency.
 */
export interface PublicThemeTokens {
  /** Approved preset id; resolves to the fixed light+dark token sets in code. */
  colorPreset: 'ink_stone_v1';
  defaultMode: 'dark' | 'light' | 'system';
  buttonStyle: 'filled' | 'outline' | 'soft';
  borderRadius: 'sm' | 'md' | 'lg' | 'full';
  animationsEnabled: boolean;
}

export interface PublicServiceSummary {
  slug: string;
  title: { ar: string; en: string };
  summary: { ar: string; en: string };
  icon?: string;
  sortOrder: number;
}

export interface PublicInitiativeCard {
  title: { ar: string; en: string };
  /** Mandatory status label (Phase 2 §5.2.3): «قيد التطوير» / "In Development". */
  statusLabel: { ar: 'قيد التطوير'; en: 'In Development' };
  status: 'in_development' | 'available' | 'archived';
  shortDescription: { ar: string; en: string };
  /** Links/visuals/roadmap are NEVER included unless status=available AND per-link approval (D2). */
  links: never;
}

/**
 * Contact configuration — the ONLY public-safe subset of form/site settings (Phase 2 §6.8).
 * Never: recipients, rate limits, auto-responder, retention, secrets, admin settings.
 */
export interface PublicContactConfig {
  confirmationMessage: { ar: string; en: string };
  channels: {
    emailMain: string;
    emailSales?: string;
    emailSupport?: string;
    phone?: string;
    whatsapp: { status: 'configured' | 'unconfigured'; url?: string };
    workingHours?: { ar: string; en: string };
    addressLine?: { ar: string; en: string };
    mapsUrl?: string;
  };
}

/** Lead submission payload (web -> cms internal; Phase 2 §7). */
export interface LeadSubmission {
  fullName: string;
  company?: string;
  email: string;
  phone?: string;
  serviceInterest: 'custom_software' | 'digital_products' | 'cybersecurity' | 'general'; // no EDR option (D2)
  message: string;
  sourceLocale: Locale;
  pagePath: string;
  /** HMAC-SHA256 of the client IP using LEAD_IP_HASH_SECRET (raw IP never stored). */
  ipHash: string;
  userAgent?: string;
  /** Honeypot must be absent/empty — non-empty => silent reject. */
  honeypot?: string;
  consent: true;
  idempotencyKey: string;
}

export interface LeadSubmissionResult {
  referenceCode: string;
}

export interface RevalidateRequest {
  tags: string[];
}

/** Preview code binding (Phase 2 §6.7) — issued by cms, verified by web, exchanged once. */
export interface PreviewCodeClaims {
  collection: string;
  docId: number | string;
  slug?: string;
  locale: Locale;
  /** Exact revision snapshot being previewed. */
  revisionId?: number | string;
  issuingAdminId: number;
  aud: 'web-preview';
  exp: number;
  jti: string;
}

export interface PreviewExchangeResult {
  collection: string;
  locale: Locale;
  /** Draft snapshot data (only the bound document, only the bound locale). */
  snapshot: Record<string, unknown>;
}
