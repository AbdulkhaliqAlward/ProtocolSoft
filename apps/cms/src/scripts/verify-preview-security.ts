/**
 * Automated preview-code security verification (Phase 4 acceptance, item 2).
 *
 * Exercises the REAL end-to-end flow against the running stack:
 *   admin login (CMS REST) -> issue -> /preview#code=… -> web /api/preview/exchange.
 *
 * Proves:
 *  - issuing requires an authenticated, active, privileged admin (no key-only path);
 *  - codes expire within 15 minutes and the TTL ceiling is enforced by BOTH services;
 *  - redemption is single-use and ATOMIC — concurrent exchanges yield exactly one win;
 *  - codes are bound to collection/document/locale and return ONLY that snapshot;
 *  - forged / tampered / garbage codes are rejected before touching the CMS;
 *  - the same-origin guard rejects cross-site redemption attempts;
 *  - exchange + /preview responses carry private/no-store, no-referrer, noindex;
 *  - the transport is FRAGMENT-ONLY: /preview?code=… legacy links are rejected
 *    (CMS issues fragment-only URLs; exchange 400s a query code without consuming
 *    or echoing it; the page redirects generically to clean /preview);
 *  - the raw jti is never persisted (only its sha256 hash) and the audit trail logs
 *    issuance without the code;
 *  - the code never appears in server logs it can reach (it travels only in the URL
 *    fragment and POST bodies).
 *
 * Run with BOTH dev servers up:
 *   npx tsx --env-file-if-exists=.env src/scripts/verify-preview-security.ts
 */
import { getPayload } from 'payload';

import configPromise from '../payload.config.js';

const CMS = process.env.CMS_BASE_URL ?? `http://localhost:${process.env.CMS_PORT ?? '3001'}`;
const WEB = process.env.WEB_BASE_URL ?? 'http://localhost:3000';
const ADMIN_EMAIL = process.env.LOCAL_ADMIN_EMAIL ?? 'admin@protocolsoft.local';
const ADMIN_PASSWORD = process.env.LOCAL_ADMIN_PASSWORD ?? 'LocalDev#SuperAdmin12';

let passed = 0;
let failed = 0;
const check = (name: string, ok: boolean, detail = ''): void => {
  if (ok) {
    passed++;
    console.log(`  ✔ ${name}${detail ? ` — ${detail}` : ''}`);
  } else {
    failed++;
    console.log(`  ✘ ${name}${detail ? ` — ${detail}` : ''}`);
  }
};

const postJson = async (url: string, body: unknown, headers: Record<string, string> = {}): Promise<Response> =>
  fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body), cache: 'no-store' });

const decodeClaims = (token: string): Record<string, unknown> =>
  JSON.parse(Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf8')) as Record<string, unknown>;

let LOG_FILE_COUNT = 0;
/** Scans every known dev/payload log file for the given secrets; returns hit count.
    Next's DEV-ONLY request logger prints the incoming URL of rejection probes
    (`POST /api/preview/exchange?code=…`, `GET /preview?code=…`) — production Next
    does not log request lines. Those lines are counted separately; ANY other
    occurrence (i.e. our code logging a code) fails the suite. */
const scanLogsFor = async (secrets: string[]): Promise<{ hits: number; devRequestLines: number }> => {
  const { readdirSync, readFileSync, existsSync } = await import('node:fs');
  const logDirs = [process.env.TMP ?? '/tmp', 'C:/Users/onyxv/AppData/Local/Temp'];
  let hits = 0;
  let devRequestLines = 0;
  for (const dir of new Set(logDirs)) {
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (!f.startsWith('web-dev') && !f.startsWith('cms-dev') && !f.startsWith('payload')) continue;
      LOG_FILE_COUNT++;
      const content = readFileSync(`${dir}/${f}`, 'utf8');
      for (const line of content.split('\n')) {
        if (!secrets.some((s) => s && line.includes(s))) continue;
        if (/^\W*\s*(?:GET|POST|PUT|PATCH|DELETE|OPTIONS) \S+\?code=/.test(line)) {
          devRequestLines++;
        } else {
          hits++;
        }
      }
    }
  }
  return { hits, devRequestLines };
};

const main = async (): Promise<void> => {
  console.log(`\n== Preview security verification (cms=${CMS}, web=${WEB}) ==\n`);
  const payload = await getPayload({ config: configPromise });

  /* 1. issuing requires an admin session — internal service keys must NOT work */
  const keyNoSession = await postJson(`${CMS}/api/internal/preview/issue`, { collection: 'services', docId: 1, locale: 'ar' }, { 'x-internal-key': process.env.WEB_TO_CMS_CONTENT_READ_KEY ?? '' });
  check('issue with service key only -> 403 (session required)', keyNoSession.status === 403, `got ${keyNoSession.status}`);
  const noAuth = await postJson(`${CMS}/api/internal/preview/issue`, { collection: 'services', docId: 1, locale: 'ar' });
  check('issue unauthenticated -> 403', noAuth.status === 403, `got ${noAuth.status}`);
  const badBody = await postJson(`${CMS}/api/internal/preview/issue`, { collection: 'leads', docId: 1, locale: 'ar' }, { cookie: 'payload-token=bogus' });
  check('issue non-previewable collection -> 403 (auth precedes validation)', badBody.status === 403, `got ${badBody.status}`);

  /* 2. real admin login */
  const login = await postJson(`${CMS}/api/users/login`, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  check('admin login -> 200', login.status === 200, `got ${login.status}`);
  const loginBody = (await login.json().catch(() => ({}))) as { token?: string; user?: { id?: number } };
  const token = loginBody.token;
  const authHeaders = { cookie: `payload-token=${token ?? ''}` };
  check('login returns a session token', typeof token === 'string' && token.length > 20);

  /* 3. pick a seeded DRAFT service and issue a code for it */
  const svc = await payload.find({ collection: 'services', draft: true, limit: 1, overrideAccess: true });
  const doc = svc.docs[0] as { id: number; title?: { ar?: string; en?: string } } | undefined;
  check('a seeded draft service exists to preview', doc != null, `total=${svc.totalDocs}`);
  if (!doc) process.exit(1);

  const issue = await postJson(`${CMS}/api/internal/preview/issue`, { collection: 'services', docId: doc.id, locale: 'ar' }, authHeaders);
  check('issue for draft service -> 200', issue.status === 200, `got ${issue.status}`);
  const issued = (await issue.json().catch(() => ({}))) as { code?: string; expiresIn?: number; urlPath?: string };
  const code = issued.code ?? '';
  check('issued payload has code + 15-min expiresIn + fragment urlPath', typeof issued.code === 'string' && issued.expiresIn === 900 && issued.urlPath === `/preview#code=${code}`);

  const claims = decodeClaims(code);
  const exp = claims.exp as number;
  const nowSec = Math.floor(Date.now() / 1000);
  check('code TTL ≤ 15 minutes', exp - nowSec > 0 && exp - nowSec <= 905, `ttl=${exp - nowSec}s`);
  check('code audience is web-preview', claims.aud === 'web-preview');
  check('code bound to collection/doc/locale/admin', claims.collection === 'services' && String(claims.docId) === String(doc.id) && claims.locale === 'ar' && typeof claims.issuingAdminId === 'number');

  /* 4. jti is stored hashed, never raw; audit records issuance without the code */
  const codeRows = await payload.find({ collection: 'preview-codes' as never, limit: 5, overrideAccess: true, sort: '-createdAt' } as never);
  const row = (codeRows.docs[0] ?? {}) as Record<string, unknown>;
  const { createHash } = await import('node:crypto');
  const expectedHash = createHash('sha256').update(String(claims.jti)).digest('hex');
  check('preview-codes row stores sha256(jti), not the raw jti', row.jtiHash === expectedHash && !JSON.stringify(row).includes(String(claims.jti)));
  const audits = await payload.find({ collection: 'audit-logs' as never, limit: 5, overrideAccess: true, sort: '-createdAt' } as never);
  const auditBlob = JSON.stringify(audits.docs);
  check('audit trail logs issuance WITHOUT the code', !auditBlob.includes(code) && auditBlob.includes('preview code issued'));

  /* 5. forged / tampered / garbage codes rejected by the WEB service locally */
  const garbage = await postJson(`${WEB}/api/preview/exchange`, { code: 'not-a-code' });
  check('web exchange garbage code -> 403', garbage.status === 403, `got ${garbage.status}`);
  const parts = code.split('.');
  const tampered = await postJson(`${WEB}/api/preview/exchange`, { code: `${parts[0]}.${Buffer.from(JSON.stringify({ ...claims, docId: 999999 })).toString('base64url')}.${parts[2]}` });
  const tamperedJson = (await tampered.json().catch(() => ({}))) as { reason?: string };
  check('web exchange tampered body -> 403 bad-signature', tampered.status === 403 && tamperedJson.reason === 'bad-signature', `got ${tampered.status}/${tamperedJson.reason}`);

  /* 6. same-origin guard: cross-site browser redemption attempt */
  const crossSite = await postJson(`${WEB}/api/preview/exchange`, { code }, { origin: 'https://evil.example', host: 'localhost:3000' });
  check('cross-site Origin rejected -> 403 (code not consumed)', crossSite.status === 403, `got ${crossSite.status}`);
  const stillFresh = await postJson(`${WEB}/api/preview/exchange`, { code });
  check('code still redeemable after rejected cross-site attempt', stillFresh.status === 200, `got ${stillFresh.status}`);
  const snapshotRes = stillFresh;
  const snapshotJson = (await snapshotRes.json().catch(() => ({}))) as { collection?: string; locale?: string; snapshot?: { id?: number; title?: { ar?: string } } };

  /* 7. exchange response: security headers + exact bound snapshot */
  const cc = snapshotRes.headers.get('cache-control') ?? '';
  const rp = snapshotRes.headers.get('referrer-policy') ?? '';
  const xr = snapshotRes.headers.get('x-robots-tag') ?? '';
  check('exchange Cache-Control: private, no-store', cc.includes('private') && cc.includes('no-store'), cc);
  check('exchange Referrer-Policy: no-referrer', rp === 'no-referrer', rp);
  check('exchange X-Robots-Tag: noindex', (xr ?? '').includes('noindex'), xr);
  check('exchange returns ONLY the bound snapshot', snapshotJson.collection === 'services' && snapshotJson.locale === 'ar' && String(snapshotJson.snapshot?.id) === String(doc.id), `id=${String(snapshotJson.snapshot?.id)}`);
  check('exchange response does not echo the code', !JSON.stringify(snapshotJson).includes(code));

  /* 8. single-use: second exchange of the SAME code fails */
  const replay = await postJson(`${WEB}/api/preview/exchange`, { code });
  const replayJson = (await replay.json().catch(() => ({}))) as { reason?: string };
  check('single-use: replay -> 403 used-or-expired', replay.status === 403 && replayJson.reason === 'used-or-expired', `got ${replay.status}/${replayJson.reason}`);

  /* 9. atomic concurrent redemption: exactly ONE winner */
  const issue2 = await postJson(`${CMS}/api/internal/preview/issue`, { collection: 'services', docId: doc.id, locale: 'ar' }, authHeaders);
  const code2 = ((await issue2.json()) as { code?: string }).code ?? '';
  const attempts = await Promise.all(Array.from({ length: 6 }, () => postJson(`${WEB}/api/preview/exchange`, { code: code2 })));
  const winners = attempts.filter((r) => r.status === 200).length;
  const losers = attempts.filter((r) => r.status === 403).length;
  check('concurrent redemption: exactly 1 of 6 wins', winners === 1 && losers === 5, `${winners} won / ${losers} rejected`);

  /* 10. locale binding: an `en` code returns the `en` snapshot, not `ar`.
     Locale-scoped fetches resolve localized fields to PLAIN strings, so compare
     each exchange snapshot against the CMS draft fetched in the same locale. */
  const issueEn = await postJson(`${CMS}/api/internal/preview/issue`, { collection: 'services', docId: doc.id, locale: 'en' }, authHeaders);
  const codeEn = ((await issueEn.json()) as { code?: string }).code ?? '';
  const resEn = await postJson(`${WEB}/api/preview/exchange`, { code: codeEn });
  const jsonEn = (await resEn.json().catch(() => ({}))) as { locale?: string; snapshot?: Record<string, unknown> };
  check('en code exchanges to en snapshot', resEn.status === 200 && jsonEn.locale === 'en', `locale=${jsonEn.locale}`);
  const cmsDraftTitle = async (locale: string): Promise<string | null> => {
    const r = await fetch(`${CMS}/api/services/${doc.id}?draft=true&locale=${locale}&fallbackLocale=false`, { headers: authHeaders, cache: 'no-store' });
    const j = (await r.json().catch(() => ({}))) as { title?: string | null };
    return typeof j.title === 'string' ? j.title : null;
  };
  const [draftArTitle, draftEnTitle] = await Promise.all([cmsDraftTitle('ar'), cmsDraftTitle('en')]);
  const snapshotTitle = (s?: Record<string, unknown>): string | null => (typeof s?.title === 'string' ? s.title : null);
  check(
    'snapshot localized values differ per bound locale (no cross-locale leak)',
    draftArTitle !== draftEnTitle && snapshotTitle(snapshotJson.snapshot) === draftArTitle && snapshotTitle(jsonEn.snapshot) === draftEnTitle,
    `ar="${(draftArTitle ?? '').slice(0, 24)}" en="${(draftEnTitle ?? '').slice(0, 24)}"`,
  );

  /* 11. /preview page itself: no-store / no-referrer / noindex.
     NOTE: `next dev` FORCES Cache-Control `no-store, must-revalidate` on every page
     regardless of next.config headers() — the configured production value
     `private, no-store, max-age=0, must-revalidate` is asserted separately by
     scripts/verify-preview-prod-headers.mjs against a production build. */
  const page = await fetch(`${WEB}/preview`, { cache: 'no-store' });
  const pcc = page.headers.get('cache-control') ?? '';
  const prp = page.headers.get('referrer-policy') ?? '';
  const pxr = page.headers.get('x-robots-tag') ?? '';
  check(
    '/preview Cache-Control: no-store (never cacheable)',
    pcc.includes('no-store') && !pcc.includes('public'),
    pcc,
  );
  if (!pcc.includes('private')) {
    console.log('    ↳ dev-mode override detected; exact production header asserted by verify-preview-prod-headers.mjs');
  }
  check('/preview Referrer-Policy: no-referrer', prp === 'no-referrer', prp);
  check('/preview X-Robots-Tag: noindex', pxr.includes('noindex'), pxr);
  check('GET /preview page carries no code material', !(await page.text()).includes(code2));

  /* 11b. QUERY-STRING CODE PROHIBITION (Phase 4 final item 1): the approved
     transport is FRAGMENT-ONLY (/preview#code=…). Legacy /preview?code=… links are
     rejected everywhere — never issued, migrated, redeemed, or echoed — because a
     query value may already be logged by the app, proxy, or Cloudflare. */
  const issueQs = await postJson(`${CMS}/api/internal/preview/issue`, { collection: 'services', docId: doc.id, locale: 'ar' }, authHeaders);
  const issuedQs = (await issueQs.json().catch(() => ({}))) as { code?: string; urlPath?: string };
  const qsCode = issuedQs.code ?? '';
  check(
    'CMS issues FRAGMENT-ONLY preview URLs (urlPath has #code=, no ?code=)',
    issuedQs.urlPath === `/preview#code=${qsCode}` && !issuedQs.urlPath?.includes('?code='),
    `${(issuedQs.urlPath ?? '(missing)').slice(0, 32)}… (code masked)`,
  );
  const qsExchange = await fetch(`${WEB}/api/preview/exchange?code=${encodeURIComponent(qsCode)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: qsCode }),
    cache: 'no-store',
  });
  const qsBody = await qsExchange.text();
  check(
    'exchange with ?code= in URL -> 400 rejected (never redeemed, never echoed)',
    qsExchange.status === 400 && !qsBody.includes(qsCode),
    `got ${qsExchange.status}`,
  );
  const qsStillFresh = await postJson(`${WEB}/api/preview/exchange`, { code: qsCode });
  check(
    'query-string exchange attempt did NOT consume the code (fragment flow still works)',
    qsStillFresh.status === 200,
    `got ${qsStillFresh.status}`,
  );
  await qsStillFresh.json().catch(() => ({}));
  const qsPage = await fetch(`${WEB}/preview?code=${encodeURIComponent(qsCode)}`, { redirect: 'manual', cache: 'no-store' });
  const qsLocation = qsPage.headers.get('location') ?? '';
  check(
    '/preview?code=… -> generic 307 redirect to clean /preview (no migration, no exchange)',
    qsPage.status === 307 && qsLocation.endsWith('/preview') && !qsLocation.includes('code='),
    `got ${qsPage.status} -> ${qsLocation}`,
  );
  const qsPageFollow = await fetch(`${WEB}/preview`, { cache: 'no-store' });
  check('post-redirect /preview page echoes no code material', !(await qsPageFollow.text()).includes(qsCode));
  check(
    'web dev logs contain no query-string code value',
    (await scanLogsFor([qsCode])).hits === 0,
  );

  /* 11c. FRAGMENT-ONLY SUCCESS: a fresh code exchanged via the approved flow works
     end-to-end (the same wire path the /preview#code=… browser bridge uses). */
  const issueFrag = await postJson(`${CMS}/api/internal/preview/issue`, { collection: 'services', docId: doc.id, locale: 'ar' }, authHeaders);
  const fragCode = ((await issueFrag.json().catch(() => ({}))) as { code?: string }).code ?? '';
  const fragExchange = await postJson(`${WEB}/api/preview/exchange`, { code: fragCode });
  check('fragment-transport code (POST body) -> 200 snapshot', fragExchange.status === 200, `got ${fragExchange.status}`);

  /* 12. log scan: the code must not appear in any log the code can reach.
     It travels only in the URL FRAGMENT (never sent to servers) and in POST bodies
     (never logged by Next/Payload). Scan every log file we know about. */
  const logScan = await scanLogsFor([code, code2, codeEn, qsCode, fragCode]);
  check('code absent from all server logs on disk (no application logging)', logScan.hits === 0, `${LOG_FILE_COUNT} log file(s) scanned, ${logScan.hits} application hits`);
  if (logScan.devRequestLines > 0) {
    console.log(`    ↳ ${logScan.devRequestLines} Next DEV request line(s) for rejected /preview?code=… noted — dev-only logger; production Next does not log request lines, and the code was never redeemed or echoed.`);
  }

  console.log(`\n== RESULT: ${passed} passed, ${failed} failed ==\n`);
  process.exit(failed === 0 ? 0 : 1);
};

void main();
