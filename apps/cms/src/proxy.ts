/**
 * The admin speaks Arabic unless the user has chosen otherwise. Payload reads
 * the language from the `payload-lng` cookie, then from the browser's
 * Accept-Language. Without this, an English browser gets an English admin.
 * Once the user switches language (top-bar toggle or account page) the
 * cookie exists and is left alone.
 */
import { NextResponse, type NextRequest } from 'next/server';

const COOKIE = 'payload-lng';
const DEFAULT_LANGUAGE = 'ar';

export function proxy(req: NextRequest): NextResponse {
  if (req.cookies.has(COOKIE)) return NextResponse.next();

  // Apply to this request too, so the very first page renders in Arabic.
  const headers = new Headers(req.headers);
  const existing = headers.get('cookie');
  headers.set('cookie', existing ? `${existing}; ${COOKIE}=${DEFAULT_LANGUAGE}` : `${COOKIE}=${DEFAULT_LANGUAGE}`);
  const res = NextResponse.next({ request: { headers } });
  res.cookies.set(COOKIE, DEFAULT_LANGUAGE, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
  return res;
}

export const config = { matcher: ['/admin/:path*'] };
