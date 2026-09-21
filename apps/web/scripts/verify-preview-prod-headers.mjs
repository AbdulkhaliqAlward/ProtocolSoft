/**
 * Production header verification for the preview surfaces (Phase 4 acceptance, item 2).
 *
 * `next dev` forces Cache-Control `no-store, must-revalidate` on every page, so the
 * configured `private, no-store` value can only be proven against a PRODUCTION
 * build (`next build` + `next start`). Run this against the production server:
 *
 *   BASE_URL=http://localhost:3002 node scripts/verify-preview-prod-headers.mjs
 *
 * Asserts on BOTH /preview (page) and /api/preview/exchange (route handler):
 *   Cache-Control: private, no-store, max-age=0, must-revalidate
 *   Referrer-Policy: no-referrer
 *   X-Robots-Tag: noindex
 */
const BASE = process.env.BASE_URL ?? 'http://localhost:3002';
const EXPECTED_CC = 'private, no-store, max-age=0, must-revalidate';

let failed = 0;
const check = (name, ok, detail = '') => {
  if (!ok) failed++;
  console.log(`  ${ok ? '✔' : '✘'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const assertHeaders = (label, headers) => {
  const cc = headers.get('cache-control') ?? '';
  const rp = headers.get('referrer-policy') ?? '';
  const xr = headers.get('x-robots-tag') ?? '';
  check(`${label} Cache-Control: ${EXPECTED_CC}`, cc === EXPECTED_CC, cc || '(missing)');
  check(`${label} Referrer-Policy: no-referrer`, rp === 'no-referrer', rp || '(missing)');
  check(`${label} X-Robots-Tag: noindex`, xr.includes('noindex'), xr || '(missing)');
};

const main = async () => {
  console.log(`\n== Production preview headers (base=${BASE}) ==\n`);

  const page = await fetch(`${BASE}/preview`, { cache: 'no-store' });
  check('/preview reachable', page.status === 200, `got ${page.status}`);
  assertHeaders('GET /preview', page.headers);
  const body = await page.text();
  check('/preview no code material in HTML', !/code=/.test(body.replace(/<[^>]*>/g, '')));

  // The exchange route: an invalid request still must carry the security headers
  // (config headers apply to route handlers as well).
  const exchange = await fetch(`${BASE}/api/preview/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'prod-header-probe-not-a-code' }),
    cache: 'no-store',
  });
  check('exchange rejects invalid code', [400, 403].includes(exchange.status), `got ${exchange.status}`);
  assertHeaders('POST /api/preview/exchange', exchange.headers);

  console.log(`\n== RESULT: ${failed === 0 ? 'ALL PASS' : `${failed} failed`} ==\n`);
  process.exit(failed === 0 ? 0 : 1);
};

main().catch((err) => {
  console.error('verification crashed:', err.message);
  process.exit(1);
});
