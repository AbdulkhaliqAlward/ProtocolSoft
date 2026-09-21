/**
 * Per-locale publishing (Phase 2 §3/§8): server-side validation of locale
 * completeness, then mutation of `publishedLocales` (a system-managed field).
 * Arabic-first: EN cannot publish before AR is published. Case studies must pass
 * the Public Readiness Gate; legal pages must have Super Admin review recorded.
 */
import type { PayloadRequest } from 'payload';

import { isLocale, type Locale } from '@protocol-soft/shared';

import { roleOf } from '../access/roles.js';
import { missingForLocale, missingStructural } from '../utilities/completeness.js';
import { evaluatePublicReadiness } from '../utilities/publicReadiness.js';
import { writeAudit } from '../utilities/audit.js';

const PUBLISHABLE: Record<string, { arabicFirst: boolean; readinessGate: boolean; legalGate: boolean }> = {
  services: { arabicFirst: true, readinessGate: false, legalGate: false },
  'case-studies': { arabicFirst: true, readinessGate: true, legalGate: false },
  'technical-initiatives': { arabicFirst: true, readinessGate: false, legalGate: false },
  'team-members': { arabicFirst: true, readinessGate: false, legalGate: false },
  pages: { arabicFirst: true, readinessGate: false, legalGate: true },
};

export const publishEndpoints = [
  {
    path: '/publish/{collection}/{id}',
    method: 'post' as const,
    handler: async (req: PayloadRequest): Promise<Response> => {
      // Admin-session endpoints (Cloudflare Access -> Payload session -> RBAC).
      const role = roleOf(req.user);
      if (!role || !['super_admin', 'content_manager'].includes(role)) {
        return Response.json({ error: 'forbidden' }, { status: 403 });
      }

      const segments = (req.routeParams ?? {}) as { collection?: string; id?: string };
      const collection = segments.collection ?? '';
      const id = segments.id ?? '';
      const rule = PUBLISHABLE[collection];
      if (!rule) return Response.json({ error: 'unknown_collection' }, { status: 404 });

      const body = (await req.json!().catch(() => ({}))) as { action?: 'publish' | 'unpublish'; locale?: string };
      const action = body.action === 'unpublish' ? 'unpublish' : 'publish';
      if (!isLocale(body.locale)) return Response.json({ error: 'invalid locale' }, { status: 400 });
      const locale = body.locale as Locale;

      const doc = (await req.payload.findByID({ collection: collection as never, id, draft: true, overrideAccess: true })) as unknown as Record<string, unknown>;
      if (!doc) return Response.json({ error: 'not_found' }, { status: 404 });

      const current = ((doc.publishedLocales as Locale[] | undefined) ?? []) as Locale[];

      if (action === 'publish') {
        // Arabic-first gate (§8.1).
        if (locale === 'en' && rule.arabicFirst && !current.includes('ar')) {
          return Response.json({ error: 'requires_arabic_published' }, { status: 422 });
        }
        // Per-locale completeness validation (§3.6).
        const missing = [...missingStructural(collection, doc), ...missingForLocale(collection, doc, locale)];
        if (missing.length > 0) {
          return Response.json({ error: 'incomplete_locale', missing }, { status: 422 });
        }
        // Public Readiness Gate — hard requirement for case studies (§5.2.2).
        if (rule.readinessGate) {
          const coverId =
            doc.coverImage != null && typeof doc.coverImage === 'object' ? (doc.coverImage as { id: number }).id : (doc.coverImage as number | undefined);
          const mediaIds: (number | string)[] = [];
          if (coverId != null) mediaIds.push(coverId);
          for (const s of (doc.screenshots as unknown[] | undefined) ?? []) {
            const sid = s != null && typeof s === 'object' ? (s as { id: number }).id : (s as number);
            if (sid != null) mediaIds.push(sid);
          }
          const mediaRes = mediaIds.length
            ? await req.payload.find({ collection: 'media', where: { id: { in: mediaIds.map(String) } }, limit: mediaIds.length, overrideAccess: true, pagination: false })
            : { docs: [] as Array<{ id: number; visibility: string; sensitivityScreening?: { status?: string } }> };
          const mediaById = new Map(mediaRes.docs.map((m) => [m.id, { visibility: m.visibility as 'public' | 'private', sensitivityScreening: m.sensitivityScreening as { status?: string } | null | undefined }]));
          const gate = evaluatePublicReadiness(doc, [locale], { mediaById });
          if (!gate.passes) {
            return Response.json({ error: 'public_readiness_gate_failed', failingChecks: gate.failingChecks }, { status: 422 });
          }
        }
        // Legal two-key gate: Super Admin-only review + publish (§5.2.5, LD1).
        if (rule.legalGate && doc.legalReviewRequired) {
          if (role !== 'super_admin') return Response.json({ error: 'legal_publish_requires_super_admin' }, { status: 403 });
          if (!doc.legalReviewedBy || !doc.legalReviewedAt) {
            return Response.json({ error: 'legal_review_required' }, { status: 422 });
          }
        }

        const next = Array.from(new Set([...current, locale]));
        const updated = await req.payload.update({
          collection: collection as never,
          id,
          draft: true,
          overrideAccess: true,
          data: { publishedLocales: next, _status: 'published' } as never,
          context: { skipAudit: true },
        });
        await writeAudit(req, 'publish', { collection, id, locale }, `locale published: ${locale}`);
        return Response.json({ ok: true, publishedLocales: (updated as unknown as { publishedLocales: Locale[] }).publishedLocales });
      }

      // Unpublish works per locale (§8.3).
      const next = current.filter((l) => l !== locale);
      await req.payload.update({ collection: collection as never, id, draft: true, overrideAccess: true, data: { publishedLocales: next } as never, context: { skipAudit: true } });
      await writeAudit(req, 'unpublish', { collection, id, locale }, `locale unpublished: ${locale}`);
      return Response.json({ ok: true, publishedLocales: next });
    },
  },
];
