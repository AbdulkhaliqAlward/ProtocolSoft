/**
 * Preview code exchange (web service, Phase 2 §6.7 + OD2).
 *
 * The one-time code travels in the POST body only — never in a URL/query string —
 * so it cannot appear in application, proxy, or Cloudflare access logs. The admin
 * panel issues links of the form /preview#code=…; the fragment never leaves the
 * browser. Here the web service verifies the CMS signature locally, then exchanges
 * the code with the CMS over the private network (atomic single-use redemption).
 * Responses are no-store/no-referrer/noindex.
 */
import { NextResponse, type NextRequest } from 'next/server';

import { exchangeCode, verifyCode } from '@/lib/preview';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  // The code is only ever valid in the POST body. If it appears in the URL query
  // (?code=…) the request is rejected without reading, redeeming, or echoing the
  // value — query strings reach servers/proxies/CDNs and may already be logged.
  if (new URL(request.url).searchParams.has('code')) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  // Same-origin only for browser callers (defense in depth against cross-site
  // redemption attempts); non-browser clients present no Origin and are still
  // gated by the signed one-time code itself.
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        return NextResponse.json({ error: 'forbidden' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
  }

  const body = (await request.json().catch(() => ({}))) as { code?: string };
  if (!body.code || typeof body.code !== 'string' || body.code.length > 4096) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  // Local signature check first — reject forged/garbage codes without touching the CMS.
  const verified = verifyCode(body.code);
  if (!verified.ok) {
    return NextResponse.json({ error: 'invalid_preview_code', reason: verified.reason }, { status: 403 });
  }

  try {
    const result = await exchangeCode(body.code);
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
        'Referrer-Policy': 'no-referrer',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  } catch {
    return NextResponse.json({ error: 'invalid_preview_code', reason: 'used-or-expired' }, { status: 403 });
  }
};
