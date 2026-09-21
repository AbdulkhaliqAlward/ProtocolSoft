/**
 * Media proxy (Phase 5 D-1): the ONLY browser-facing route for media bytes.
 * The CMS gates delivery (public visibility + safe types + screenshot screening);
 * this proxy adds the internal-key handshake server-side so no key, CMS URL, or
 * gate detail ever reaches the browser. Any upstream rejection maps to a generic
 * 404 — no existence disclosure, no metadata pass-through.
 */
import { internalCmsUrl } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return new Response(null, { status: 404 });

  const key = process.env.WEB_TO_CMS_CONTENT_READ_KEY;
  if (!key) return new Response(null, { status: 404 });

  try {
    const res = await fetch(`${internalCmsUrl()}/api/internal/content/media?id=${id}`, {
      headers: { 'x-internal-key': key },
      signal: AbortSignal.timeout(10_000),
      cache: 'no-store',
    });
    if (!res.ok || !res.body) return new Response(null, { status: 404 });

    const headers = new Headers();
    const type = res.headers.get('content-type');
    const cache = res.headers.get('cache-control');
    const etag = res.headers.get('etag');
    if (type?.startsWith('image/')) headers.set('content-type', type);
    else return new Response(null, { status: 404 }); // bytes only for safe image types
    if (cache) headers.set('cache-control', cache);
    if (etag) headers.set('etag', etag);
    headers.set('x-content-type-options', 'nosniff');
    headers.set('content-disposition', 'inline');
    return new Response(res.body, { status: 200, headers });
  } catch {
    return new Response(null, { status: 404 });
  }
}
