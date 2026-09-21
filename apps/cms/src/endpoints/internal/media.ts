/**
 * Public media delivery (Phase 5 D-1, approved): the ONLY path by which media
 * bytes leave the CMS. Strictly gated, generic-404 on every rejection (no
 * existence disclosure), and returns image BYTES ONLY — no filename, no server
 * paths, no dimensions/metadata, no owner info, no alt text (alt text travels
 * with the referencing content through /internal/content/*).
 *
 * Gate (all must pass, else generic 404):
 *   1. media doc exists;
 *   2. visibility === 'public';
 *   3. safe raster type (image/jpeg | image/png | image/webp); SVG only for the
 *      logos category (sanitized at upload per Phase 2 §12); PDFs NEVER;
 *   4. project screenshots additionally require sensitivityScreening=approved
 *      (CS1) — same rule the Public Readiness Gate enforces for case studies.
 *
 * Caching: only eligible public assets ever reach a response, so a public
 * cache header is safe here (D-1 "caching only for eligible public assets").
 */
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

import type { PayloadRequest } from 'payload';

import { guardInternalKey } from './guard.js';

const SAFE_RASTER = new Set(['image/jpeg', 'image/png', 'image/webp']);

const SIZE_VARIANTS = new Set(['thumb', 'card', 'hero']);

const notFound = (): Response => Response.json({ error: 'not_found' }, { status: 404 });

export const mediaEndpoint = {
  path: '/internal/content/media',
  method: 'get' as const,
  handler: async (req: PayloadRequest): Promise<Response> => {
    const denied = guardInternalKey(req, 'content');
    if (denied) return denied;

    const id = String(req.query.id ?? '');
    if (!/^\d+$/.test(id)) return notFound();
    const sizeParam = typeof req.query.size === 'string' ? req.query.size : '';
    if (sizeParam && !SIZE_VARIANTS.has(sizeParam)) return notFound();

    let doc: Record<string, unknown> | null = null;
    try {
      doc = (await req.payload.findByID({ collection: 'media', id: Number(id), depth: 0, overrideAccess: true })) as unknown as Record<string, unknown>;
    } catch {
      return notFound();
    }
    if (!doc) return notFound();

    const reject = (reason: string): Response => {
      req.payload.logger.warn({ msg: 'public media request rejected', mediaId: id, reason });
      return notFound();
    };

    if (doc.visibility !== 'public') return reject('not-public');

    const category = String(doc.category ?? 'content');
    const mimeType = String(doc.mimeType ?? '');

    // Safe types only: raster images; SVG restricted to sanitized logos; PDF never.
    const svgAllowed = mimeType === 'image/svg+xml' && category === 'logos';
    if (!SAFE_RASTER.has(mimeType) && !svgAllowed) return reject('unsafe-or-disallowed-type');

    // Project screenshots: screening gate (CS1) on top of public visibility.
    if (category === 'projects') {
      const screening = doc.sensitivityScreening as { status?: string } | undefined;
      if (screening?.status !== 'approved') return reject('screenshot-not-screened-approved');
    }

    // Resolve the file (size variant or original); block any path escape.
    const variant =
      sizeParam && doc.sizes && typeof doc.sizes === 'object'
        ? ((doc.sizes as Record<string, { filename?: string; mimeType?: string }>)[sizeParam] ?? null)
        : null;
    const filename = String(variant?.filename ?? doc.filename ?? '');
    if (!filename || filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
      return reject('bad-filename');
    }

    const staticDir = process.env.MEDIA_STATIC_DIR ?? 'media';
    const baseDir = path.isAbsolute(staticDir) ? staticDir : path.join(process.cwd(), staticDir);
    const filePath = path.join(baseDir, filename);
    if (!filePath.startsWith(baseDir + path.sep) && filePath !== baseDir) return reject('path-escape');

    let bytes: Buffer;
    try {
      [bytes] = await Promise.all([readFile(filePath), stat(filePath)]);
    } catch {
      return reject('file-missing');
    }

    const etag = `"${createHash('sha1').update(bytes).digest('hex')}"`;
    if (req.headers.get('if-none-match') === etag) return new Response(null, { status: 304 });

    return new Response(new Uint8Array(bytes), {
      status: 200,
      headers: {
        'content-type': variant?.mimeType ?? mimeType,
        'content-length': String(bytes.length),
        // Reached only by eligible public assets → public caching is safe (D-1).
        'cache-control': 'public, max-age=86400, stale-while-revalidate=604800',
        etag,
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline',
        'content-security-policy': "default-src 'none'; sandbox",
        'referrer-policy': 'no-referrer',
      },
    });
  },
};
