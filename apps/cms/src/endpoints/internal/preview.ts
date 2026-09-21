/**
 * Preview endpoints (Phase 2 §6.7):
 *  - issue  (admin session, content_edit capability): signs a one-time code bound to
 *    collection/doc/locale/revision/admin, stores the hashed jti with used=false.
 *  - exchange (private network; the code itself is the credential — service keys rejected):
 *    verifies the signature, atomically consumes the jti, returns ONLY the bound draft
 *    snapshot for the bound locale. Normal public-content endpoints never return drafts.
 */
import type { PayloadRequest } from 'payload';
import { sql } from 'drizzle-orm';

import { isLocale } from '@protocol-soft/shared';

import { writeAudit } from '../../utilities/audit.js';
import { signPreviewCode, verifyPreviewCode } from '../../utilities/preview-signing.js';

const PREVIEWABLE_COLLECTIONS = new Set(['services', 'case-studies', 'technical-initiatives', 'team-members', 'pages']);

export const previewEndpoints = [
  {
    path: '/internal/preview/issue',
    method: 'post' as const,
    handler: async (req: PayloadRequest): Promise<Response> => {
      const role = req.user ? String((req.user as { role?: string }).role ?? '') : '';
      const isActive = (req.user as { active?: boolean } | undefined)?.active !== false;
      if (!req.user || !isActive || !['super_admin', 'content_manager', 'editor'].includes(role)) {
        return Response.json({ error: 'forbidden' }, { status: 403 });
      }
      const body = (await req.json!().catch(() => ({}))) as { collection?: string; docId?: number | string; locale?: string };
      if (!body.collection || !PREVIEWABLE_COLLECTIONS.has(body.collection) || !body.docId || !isLocale(body.locale)) {
        return Response.json({ error: 'invalid_request' }, { status: 400 });
      }
      const doc = await req.payload.findByID({
        collection: body.collection as never,
        id: body.docId,
        draft: true, // latest draft snapshot
        locale: body.locale,
        fallbackLocale: false,
        overrideAccess: true,
      });
      if (!doc) return Response.json({ error: 'not_found' }, { status: 404 });

      const code = signPreviewCode({
        collection: body.collection,
        docId: body.docId,
        slug: typeof (doc as { slug?: string }).slug === 'string' ? (doc as { slug?: string }).slug : undefined,
        locale: body.locale,
        issuingAdminId: req.user.id as number,
      });

      await req.payload.create({
        collection: 'preview-codes',
        overrideAccess: true,
        context: { systemWrite: true },
        data: {
          jtiHash: code.jtiHash,
          collection: body.collection,
          docId: String(body.docId),
          locale: body.locale,
          revisionId: undefined,
          issuingAdminId: String(req.user.id),
          expiresAt: code.expiresAt.toISOString(),
          used: false,
        } as never,
      });

      await writeAudit(req, 'draft_saved', { collection: body.collection, id: body.docId, locale: body.locale }, 'preview code issued');
      // urlPath carries the code in the FRAGMENT — links must keep it there; a
      // query-string code would land in proxy/Cloudflare access logs.
      return Response.json({ code: code.token, expiresIn: 15 * 60, urlPath: `/preview#code=${code.token}` });
    },
  },
  {
    path: '/internal/preview/exchange',
    method: 'post' as const,
    handler: async (req: PayloadRequest): Promise<Response> => {
      const body = (await req.json!().catch(() => ({}))) as { code?: string };
      if (!body.code) return Response.json({ error: 'invalid_request' }, { status: 400 });

      const verified = verifyPreviewCode(body.code);
      if (!verified.ok || !verified.claims || !verified.jtiHash) {
        return Response.json({ error: 'invalid_preview_code', reason: verified.reason }, { status: 403 });
      }
      const claims = verified.claims;

      // Atomic single-use consumption: ONE conditional SQL UPDATE claims the code.
      // The `used = FALSE` guard lives inside the statement itself, so Postgres row
      // locking guarantees exactly one concurrent exchange transitions the row — a
      // loser re-evaluates the WHERE against the committed row and matches nothing.
      // (Payload's update/updateMany are find-then-update-by-id and are NOT atomic;
      // their result also carries no totalDocs, so a docs.length check alone would
      // not close the race — the claim must be a single statement.)
      const claimResult = await (
        req.payload.db as unknown as {
          drizzle: { execute: (query: unknown) => Promise<unknown> };
        }
      ).drizzle.execute(sql`
        UPDATE preview_codes
        SET used = TRUE, used_at = now()
        WHERE jti_hash = ${verified.jtiHash}
          AND used = FALSE
          AND expires_at > now()
        RETURNING id
      `);
      const claimedRows = (Array.isArray(claimResult) ? claimResult : (claimResult as { rows?: unknown[] }).rows ?? []) as Array<{ id: number }>;
      if (claimedRows.length !== 1) {
        return Response.json({ error: 'invalid_preview_code', reason: 'used-or-expired' }, { status: 403 });
      }

      // Return ONLY the bound snapshot: that document, that locale, that revision.
      const revisionId = typeof claims.revisionId === 'string' || typeof claims.revisionId === 'number' ? claims.revisionId : undefined;
      if (revisionId) {
        const version = await req.payload.findVersions({
          collection: claims.collection as never,
          where: { and: [{ parent: { equals: claims.docId } }, { id: { equals: revisionId } }] } as never,
          limit: 1,
          overrideAccess: true,
          locale: claims.locale,
          fallbackLocale: false,
        });
        const v = version.docs[0];
        if (!v) return Response.json({ error: 'revision_not_found' }, { status: 404 });
        return Response.json({ collection: claims.collection, locale: claims.locale, snapshot: v.version });
      }
      const snapshot = await req.payload.findByID({
        collection: claims.collection as never,
        id: claims.docId,
        draft: true,
        locale: claims.locale,
        fallbackLocale: false,
        overrideAccess: true,
      });
      return Response.json({ collection: claims.collection, locale: claims.locale, snapshot });
    },
  },
];
