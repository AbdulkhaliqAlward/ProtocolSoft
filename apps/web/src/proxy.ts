/**
 * Proxy (Next 16 name for middleware). Locale routing (Phase 1 §7): Arabic is
 * the default at `/` (no prefix); the complete English site lives under /en.
 * Other paths are rewritten internally to /ar/... so Arabic URLs stay clean,
 * and the [locale] root layout sets lang/dir from the segment.
 * /preview, /api, and static files bypass.
 */
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_FILE = /\.(svg|png|jpg|jpeg|webp|ico|txt|xml|json|webmanifest|woff2?)$/i;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Preview codes are FRAGMENT-ONLY (/preview#code=…). A legacy /preview?code=…
  // link is rejected generically: redirect to the clean path WITHOUT reading,
  // migrating, or echoing the value — query strings reach servers/proxies/CDNs
  // and may already be logged, so the code is never redeemed or transformed.
  if (pathname === '/preview' && request.nextUrl.searchParams.has('code')) {
    return NextResponse.redirect(new URL('/preview', request.url), 307);
  }

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/preview' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // English lives under /en. Arabic lives under /ar internally only: a request
  // that arrives at /ar/... is redirected to the clean URL (one URL per page).
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return NextResponse.next();
  }
  if (pathname === '/ar' || pathname.startsWith('/ar/')) {
    const clean = request.nextUrl.clone();
    clean.pathname = pathname.slice(3) || '/';
    return NextResponse.redirect(clean, 308);
  }
  const url = request.nextUrl.clone();
  url.pathname = `/ar${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
