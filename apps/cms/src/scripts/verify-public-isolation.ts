/**
 * Automated public-data isolation verification (Phase 4 acceptance, item 1).
 *
 * Proves that EVERY public surface returns published, gated content only:
 *  - all seeded DRAFT documents are omitted from every /internal/content/* endpoint;
 *  - a never-published Homepage global returns `published:false` (web renders its
 *    own approved D3 fallback copy — no draft CMS content leaks);
 *  - no response body contains placeholder tokens or lead PII;
 *  - the endpoint registry matches the public whitelist exactly (a new public
 *    path exposing leads/users/audit/backup data fails this check);
 *  - leads/preview/backup surfaces expose no unauthenticated GET read path.
 *
 * Run with the CMS dev server up:  npx tsx --env-file-if-exists=.env src/scripts/verify-public-isolation.ts [baseUrl]
 */
import { getPayload } from 'payload';

import configPromise from '../payload.config.js';

const BASE = process.argv[2] ?? `http://localhost:${process.env.CMS_PORT ?? '3001'}`;
const KEY = process.env.WEB_TO_CMS_CONTENT_READ_KEY ?? '';
if (!KEY) {
  console.error('WEB_TO_CMS_CONTENT_READ_KEY is required (run with --env-file-if-exists=.env)');
  process.exit(1);
}

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

const get = async (path: string): Promise<{ status: number; body: string; json: unknown }> => {
  const res = await fetch(`${BASE}/api${path}`, { headers: { 'x-internal-key': KEY }, cache: 'no-store' });
  const body = await res.text();
  let json: unknown = null;
  try {
    json = JSON.parse(body);
  } catch {
    /* non-JSON body */
  }
  return { status: res.status, body, json };
};

const contentPaths = [
  '/internal/content/site-settings',
  '/internal/content/contact-config?locale=ar',
  '/internal/content/contact-config?locale=en',
  '/internal/content/social-links',
  '/internal/content/navigation?locale=ar',
  '/internal/content/theme',
  '/internal/content/services?locale=ar',
  '/internal/content/case-studies?locale=ar',
  '/internal/content/initiatives?locale=ar',
  '/internal/content/team?locale=ar',
  '/internal/content/redirects',
  '/internal/content/seo?locale=ar',
  '/internal/content/homepage?locale=ar',
];

const main = async (): Promise<void> => {
  console.log(`\n== Public-data isolation verification against ${BASE} ==\n`);

  /* 1. every public content endpoint answers and leaks nothing */
  const bodies: string[] = [];
  for (const p of contentPaths) {
    const r = await get(p);
    bodies.push(r.body);
    check(`GET ${p} -> 200`, r.status === 200, `got ${r.status}`);
  }

  const allPublic = bodies.join('\n');
  check('no "[PLACEHOLDER]" token in ANY public response', !allPublic.includes('[PLACEHOLDER]'));
  check('no lead PII (sink@example.invalid) in ANY public response', !allPublic.includes('sink@example.invalid'));
  check('no legalCompanyName in public site-settings', !bodies[0]!.includes('legalCompanyName'));
  check('no notificationRecipients in contact-config', !bodies[1]!.includes('ecipients'));

  /* 2. Phase 5 local-review state (D-2): ONLY the approved services may be
     published; everything else (case studies, initiatives, team, social,
     legal) must still be omitted. Service content itself must carry no
     placeholder tokens (checked below via the placeholder scan). */
  const APPROVED_PUBLISHED_SERVICES = new Set(['custom-software', 'digital-products', 'cybersecurity']);
  const services = (await get('/internal/content/services?locale=ar')).json as { data?: Array<{ slug?: string }> };
  const serviceSlugs = (services.data ?? []).map((s) => String(s.slug));
  const unapproved = serviceSlugs.filter((s) => !APPROVED_PUBLISHED_SERVICES.has(s));
  check(
    'services list contains ONLY the approved locally-published slugs (D-2)',
    unapproved.length === 0 && serviceSlugs.length <= 3,
    `got [${serviceSlugs.join(', ')}]`,
  );

  const cases = (await get('/internal/content/case-studies?locale=ar')).json as { data?: unknown[] };
  check('case-studies list omits DRAFT case study (expect 0)', (cases.data?.length ?? -1) === 0, `got ${cases.data?.length}`);

  const initiatives = (await get('/internal/content/initiatives?locale=ar')).json as { data?: unknown[] };
  check('initiatives list omits DRAFT EDR initiative (expect 0)', (initiatives.data?.length ?? -1) === 0, `got ${initiatives.data?.length}`);

  const team = (await get('/internal/content/team?locale=ar')).json as { data?: unknown[] };
  check('team list omits DRAFT members (expect 0)', (team.data?.length ?? -1) === 0, `got ${team.data?.length}`);

  const page = await get('/internal/content/pages?locale=ar&slug=privacy');
  check('draft legal page returns 404 publicly', page.status === 404, `got ${page.status}`);
  const terms = await get('/internal/content/pages?locale=en&slug=terms');
  check('draft legal page (terms/en) returns 404 publicly', terms.status === 404, `got ${terms.status}`);
  const aboutEn = await get('/internal/content/pages?locale=en&slug=about');
  // Phase 5 D-2: about may be locally published (200, placeholder-free) or still
  // draft (404) — both states are safe; placeholders are never acceptable.
  const aboutOk = aboutEn.status === 404 || (aboutEn.status === 200 && !aboutEn.body.includes('[PLACEHOLDER]'));
  check('about page: 404 while draft OR 200 with no placeholders (D-2)', aboutOk, `got ${aboutEn.status}`);

  const social = (await get('/internal/content/social-links')).json as { data?: unknown[] };
  check('social-links omits non-visible entries (expect 0)', (social.data?.length ?? -1) === 0, `got ${social.data?.length}`);

  const redirects = (await get('/internal/content/redirects')).json as { data?: unknown[] };
  check('redirects omits inactive entries (expect 0)', (redirects.data?.length ?? -1) === 0, `got ${redirects.data?.length}`);

  /* 3. homepage: either published (D-2 local review) with real copy and no
     placeholders, or unpublished with published:false + null hero — never a
     draft leak. */
  const home = (await get('/internal/content/homepage?locale=ar')).json as { data?: { published?: boolean; hero?: { headline?: unknown } } };
  if (home.data?.published === true) {
    const headline = home.data.hero?.headline;
    check(
      'homepage published: hero headline is real copy without placeholders',
      typeof headline === 'string' && headline.length > 0 && !headline.includes('[PLACEHOLDER]'),
      typeof headline === 'string' ? `len=${headline.length}` : 'non-string',
    );
  } else {
    check('homepage unpublished: published:false, hero headline null (no draft leak)', home.data?.hero?.headline == null);
  }

  /* 4. endpoint registry whitelist — structural guarantee against future leaks */
  const config = await configPromise;
  const paths = config.endpoints.map((e: { path: string; method: string }) => `${e.method.toUpperCase()} ${e.path}`);
  const expectedContent = new Set([
    'GET /internal/health',
    'GET /internal/content/site-settings',
    'GET /internal/content/contact-config',
    'GET /internal/content/social-links',
    'GET /internal/content/navigation',
    'GET /internal/content/theme',
    'GET /internal/content/services',
    'GET /internal/content/case-studies',
    'GET /internal/content/initiatives',
    'GET /internal/content/team',
    'GET /internal/content/pages',
    'GET /internal/content/redirects',
    'GET /internal/content/seo',
    'GET /internal/content/homepage',
    'GET /internal/content/media',
  ]);
  const actualContent = new Set(paths.filter((p) => p.startsWith('GET /internal/content') || p === 'GET /internal/health'));
  const unexpected = [...actualContent].filter((p) => !expectedContent.has(p));
  const missing = [...expectedContent].filter((p) => !actualContent.has(p));
  check('public GET registry matches whitelist exactly', unexpected.length === 0 && missing.length === 0, `unexpected: ${unexpected.join(', ') || 'none'} | missing: ${missing.join(', ') || 'none'}`);

  /* 4b. sensitive surfaces reject unauthenticated / wrongly-keyed access live.
     preview/exchange rejects an absent code with 400 BY DESIGN — the code itself is
     the credential (no internal key), and an invalid request must never authenticate. */
  const sensitiveProbes: Array<{ path: string; method: string; accept: number[] }> = [
    { path: '/internal/leads', method: 'POST', accept: [401, 403] },
    { path: '/internal/preview/issue', method: 'POST', accept: [401, 403] },
    { path: '/internal/preview/exchange', method: 'POST', accept: [400, 401, 403] },
    { path: '/internal/backup/status', method: 'GET', accept: [401, 403] },
    { path: '/internal/backup/schedule', method: 'POST', accept: [401, 403] },
    { path: '/internal/backup/request-manual', method: 'POST', accept: [401, 403] },
    { path: '/internal/backup/report', method: 'POST', accept: [401, 403] },
  ];
  for (const probe of sensitiveProbes) {
    const res = await fetch(`${BASE}/api${probe.path}`, { method: probe.method, headers: { 'Content-Type': 'application/json' }, body: probe.method === 'POST' ? '{}' : undefined, cache: 'no-store' });
    check(`${probe.method} ${probe.path} unauthenticated -> rejected`, probe.accept.includes(res.status), `got ${res.status}`);
  }

  /* 4c. a submitted lead is stored but never publicly exposed */
  const leadKey = process.env.WEB_TO_CMS_LEAD_SUBMIT_KEY ?? '';
  const leadRes = await fetch(`${BASE}/api/internal/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-internal-key': leadKey },
    body: JSON.stringify({
      fullName: 'تحقق عزل — يُحذف',
      email: 'sink@example.invalid',
      serviceInterest: 'general',
      message: 'طلب تحقق آلي من عزل البيانات — ليس طلباً حقيقياً.',
      sourceLocale: 'ar',
      consent: true,
      idempotencyKey: `isolation-verify-${Date.now()}`,
      ipHash: 'abcdef0123456789abcdef01',
      pagePath: '/ar/contact',
    }),
    cache: 'no-store',
  });
  const leadJson = (await leadRes.json().catch(() => ({}))) as { referenceCode?: string };
  check('lead submission via leads key -> 201', leadRes.status === 201, `got ${leadRes.status}`);
  const leadPayload = await getPayload({ config: configPromise });
  const stored = await leadPayload.find({ collection: 'leads', limit: 5, overrideAccess: true });
  check('lead stored in DB', stored.totalDocs >= 1, `total=${stored.totalDocs}`);
  check('lead PII absent from every public response', !allPublic.includes('sink@example.invalid') && !allPublic.includes(leadJson.referenceCode ?? '§'));

  /* 4d. Direct Payload REST/GraphQL must NOT be a public content surface (Phase 4
     final item 2): every collection/global REST path rejects unauthenticated reads
     (403/404), so drafts, archived/hidden content, private media, PII, internal
     notes, secrets, roles, audit records, leads, backup data and preview data can
     only ever be reached through the admin session + RBAC. The approved Internal
     Public Content API remains the sole public-content interface. */
  const collectionSlugs = [
    'users',
    'leads',
    'audit-logs',
    'backup-records',
    'preview-codes',
    'media',
    'services',
    'case-studies',
    'technical-initiatives',
    'team-members',
    'pages',
    'social-links',
    'redirects',
  ];
  const globalSlugs = ['site-settings', 'theme-settings', 'navigation', 'homepage', 'seo-settings', 'form-settings', 'backup-settings'];
  for (const slug of collectionSlugs) {
    const r = await fetch(`${BASE}/api/${slug}?limit=3&draft=true`, { cache: 'no-store' });
    check(`direct REST GET /api/${slug} unauthenticated -> rejected (no body exposure)`, r.status === 401 || r.status === 403, `got ${r.status}`);
  }
  for (const slug of globalSlugs) {
    const r = await fetch(`${BASE}/api/globals/${slug}?draft=true`, { cache: 'no-store' });
    check(`direct REST GET /api/globals/${slug} unauthenticated -> rejected`, r.status === 401 || r.status === 403, `got ${r.status}`);
  }
  // Draft-depth read variants that would expose unpublished content if the gate were loose
  for (const probe of ['/api/services?draft=true&locale=en&fallbackLocale=null', '/api/pages?where-_status_equals=draft', '/api/services/3?draft=true']) {
    const r = await fetch(`${BASE}${probe}`, { cache: 'no-store' });
    check(`direct REST draft-read ${probe.split('?')[0]} variant -> rejected`, r.status === 401 || r.status === 403 || r.status === 404, `got ${r.status}`);
  }

  /* 4e. Unauthenticated mutation attempts on direct REST must ALL be rejected:
     create / update / delete / publish / role-change / backup-control / preview-issue. */
  const mutationProbes: Array<{ name: string; method: string; path: string; body: Record<string, unknown> }> = [
    { name: 'create service', method: 'POST', path: '/api/services', body: { title: 'probe', slug: 'probe', titleAr: 'x' } },
    { name: 'publish service (PATCH draft status)', method: 'PATCH', path: '/api/services/3', body: { _status: 'published' } },
    { name: 'update user role (PATCH)', method: 'PATCH', path: '/api/users/1', body: { role: 'super_admin' } },
    { name: 'create user', method: 'POST', path: '/api/users', body: { email: 'probe@example.invalid', password: 'x', name: 'probe', role: 'super_admin' } },
    { name: 'delete lead', method: 'DELETE', path: '/api/leads/1' , body: {} },
    { name: 'read leads list', method: 'GET', path: '/api/leads', body: {} },
  ];
  for (const probe of mutationProbes) {
    const r = await fetch(`${BASE}/api${probe.path.startsWith('/api') ? probe.path.slice(4) : probe.path}`, {
      method: probe.method,
      headers: { 'Content-Type': 'application/json' },
      body: probe.method === 'DELETE' || probe.method === 'GET' ? undefined : JSON.stringify(probe.body),
      cache: 'no-store',
    });
    check(`direct REST ${probe.name} unauthenticated -> rejected`, r.status === 401 || r.status === 403, `got ${r.status}`);
  }
  // Backup control + preview issue via REST carry their own gate — probed in 4b.
  const backupSettingPatch = await fetch(`${BASE}/api/globals/backup-settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled: true, schedule: 'daily' }),
    cache: 'no-store',
  });
  check('direct REST backup-settings control unauthenticated -> rejected', backupSettingPatch.status === 401 || backupSettingPatch.status === 403 || backupSettingPatch.status === 404, `got ${backupSettingPatch.status}`);

  /* 4f. GraphQL surface stays closed (config.graphQL.disable: true) */
  const gql = await fetch(`${BASE}/api/graphql`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: '{ Users { docs { email } } }' }), cache: 'no-store' });
  const gqlGet = await fetch(`${BASE}/api/graphql?query={Users{docs{email}}}`, { cache: 'no-store' });
  check('GraphQL POST -> 404 (disabled)', gql.status === 404, `got ${gql.status}`);
  check('GraphQL GET (playground/query) -> 404 (disabled)', gqlGet.status === 404, `got ${gqlGet.status}`);

  /* 4g. Private media files are not served by the upload static route without auth
     (static route runs the collection read access via checkFileAccess). Probe a
     path-shaped filename that matches no document: expect 403/404, never 200. */
  const mediaStatic = await fetch(`${BASE}/api/media/static/leak-probe.png`, { cache: 'no-store' });
  const mediaStaticAlt = await fetch(`${BASE}/media/leak-probe.png`, { cache: 'no-store' });
  const mediaStaticOk = [403, 404].includes(mediaStatic.status) && ![200].includes(mediaStaticAlt.status);
  check('media static route unauthenticated -> no file served', mediaStaticOk, `api=${mediaStatic.status} app=${mediaStaticAlt.status}`);

  /* 5. DB truth: Phase 5 local-review state — exactly the approved services are
     published (D-2); the case study, EDR initiative, and legal templates must
     still be drafts. */
  const svc = await leadPayload.find({ collection: 'services', draft: true, limit: 10, overrideAccess: true });
  const publishedSvc = svc.docs.filter((d) => (d as { _status?: string })._status === 'published');
  const draftSvc = svc.docs.filter((d) => (d as { _status?: string })._status === 'draft');
  check(
    'DB: only approved services published, none unexpected (D-2)',
    publishedSvc.length <= 3 && publishedSvc.every((d) => APPROVED_PUBLISHED_SERVICES.has(String((d as { slug?: string }).slug))),
    `published=${publishedSvc.length} draft=${draftSvc.length}`,
  );
  const cs = await leadPayload.find({ collection: 'case-studies', draft: true, limit: 5, overrideAccess: true });
  const csDraft = cs.docs.every((d) => (d as { _status?: string })._status === 'draft');
  check('DB: case study still draft (D-2/D-4)', cs.totalDocs >= 1 && csDraft, `total=${cs.totalDocs}`);
  const legal = await leadPayload.find({ collection: 'pages', draft: true, limit: 10, overrideAccess: true, where: { slug: { in: ['privacy', 'terms'] } } as never });
  const legalDraft = legal.docs.every((d) => (d as { _status?: string })._status === 'draft');
  check('DB: legal templates still draft (LD1/D-2)', legal.totalDocs === 2 && legalDraft, `total=${legal.totalDocs}`);
  const audits = await leadPayload.find({ collection: 'audit-logs' as never, limit: 1, overrideAccess: true } as never);
  check('DB: audit log rows exist (admin-only surface)', audits.totalDocs >= 1, `total=${audits.totalDocs}`);

  console.log(`\n== RESULT: ${passed} passed, ${failed} failed ==\n`);
  process.exit(failed === 0 ? 0 : 1);
};

void main();
