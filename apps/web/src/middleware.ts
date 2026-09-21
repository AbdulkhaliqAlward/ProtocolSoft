/**
 * Locale routing (Phase 1 §7): Arabic is the default at `/` (no prefix); the
 * complete English site lives under /en. Non-/en paths are internally rewritten
 * to /ar/... so URLs stay clean. Injects x-locale for the root layout.
 * /preview, /api, and assets bypass (preview defaults to LTR chrome).
 */
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_FILE = /\.(svg|png|jpg|jpeg|webp|ico|txt|xml|json|woff2?)$/i;

export function middleware(request: NextRequest) {
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

  const locale = pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'ar';

  if (locale === 'en') {
    const headers = new Headers(request.headers);
    headers.set('x-locale', 'en');
    return NextResponse.next({ request: { headers } });
  }

  if (pathname === '/ar' || pathname.startsWith('/ar/')) {
    const headers = new Headers(request.headers);
    headers.set('x-locale', 'ar');
    return NextResponse.next({ request: { headers } });
  }

  // Rewrite default locale (ar) internally: URL stays prefix-free.
  const url = request.nextUrl.clone();
  url.pathname = `/ar${pathname === '/' ? '' : pathname}`;
  const headers = new Headers(request.headers);
  headers.set('x-locale', 'ar');
  return NextResponse.rewrite(url, { request: { headers } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
