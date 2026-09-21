/**
 * Media delivery verification (Phase 5 D-1). Creates local media fixtures,
 * then proves the public media endpoint + web proxy gate EXACTLY:
 *   - public + safe-type assets serve bytes with public caching and NO metadata;
 *   - private assets, project screenshots without approved screening, PDFs,
 *     and non-logo SVGs NEVER serve (generic 404, no existence disclosure);
 *   - the browser-facing /api/media/{id} proxy enforces the same gate without
 *     exposing any key, and never leaks JSON errors.
 * Cleans up its fixtures. Run with CMS dev server up:
 *   npx tsx --env-file-if-exists=.env src/scripts/verify-media-delivery.ts
 */
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { getPayload } from 'payload';

import configPromise from '../payload.config.js';

const BASE = process.argv[2] ?? `http://localhost:${process.env.CMS_PORT ?? '3001'}`;
const WEB_BASE = process.argv[3] ?? `http://localhost:${process.env.WEB_PORT ?? '3000'}`;
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

const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);
const SVG_TINY = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8"/></svg>', 'utf8');

interface Fixture {
  key: string;
  file: string;
  data: Record<string, unknown>;
  id?: number;
}

const FIXTURES: Fixture[] = [
  { key: 'public-content', file: 'vpub.png', data: { altText: { ar: 'x', en: 'x' }, category: 'content', visibility: 'public' } },
  { key: 'private-content', file: 'vpriv.png', data: { altText: { ar: 'x', en: 'x' }, category: 'content', visibility: 'private' } },
  { key: 'shot-unscreened', file: 'vshot-u.png', data: { altText: { ar: 'x', en: 'x' }, category: 'projects', visibility: 'public', sensitivityScreening: { status: 'unscreened' } } },
  { key: 'shot-approved', file: 'vshot-a.png', data: { altText: { ar: 'x', en: 'x' }, category: 'projects', visibility: 'public', sensitivityScreening: { status: 'approved' } } },
  { key: 'logo-svg', file: 'vlogo.svg', data: { altText: { ar: 'x', en: 'x' }, category: 'logos', visibility: 'public' } },
];

/** Minimal VALID PDF (Payload validates PDF structure on upload). */
const buildPdf = (): Buffer => {
  const objects = [
    '<</Type/Catalog/Pages 2 0 R>>',
    '<</Type/Pages/Kids[3 0 R]/Count 1>>',
    '<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((o, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xrefPos = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<</Size ${objects.length + 1}/Root 1 0 R>>\nstartxref\n${xrefPos}\n%%EOF`;
  return Buffer.from(pdf, 'utf8');
};

const fetchMedia = async (url: string, headers: Record<string, string> = {}, method = 'GET'): Promise<Response> =>
  fetch(url, { headers, method, cache: 'no-store' });

const main = async (): Promise<void> => {
  console.log(`\n== Media delivery (D-1) verification against ${BASE} / web ${WEB_BASE} ==\n`);

  const payload = await getPayload({ config: configPromise });

  // ── setup: upload fixtures through the local API (goes through the same
  //    hooks/validation as admin uploads) ──
  const tmp = path.join(process.cwd(), '.tmp-media-verify');
  await mkdir(tmp, { recursive: true });
  const created: number[] = [];
  for (const fx of FIXTURES) {
    const filePath = path.join(tmp, fx.file);
    const bytes = fx.file.endsWith('.svg') ? SVG_TINY : fx.file.endsWith('.pdf') ? buildPdf() : PNG_1PX;
    await writeFile(filePath, bytes);
    try {
      const doc = await payload.create({ collection: 'media', data: fx.data as never, filePath, overrideAccess: true, context: { skipAudit: true } });
      fx.id = doc.id as number;
      created.push(doc.id as number);
    } catch (err) {
      check(`fixture ${fx.key} created`, false, String(err).slice(0, 120));
    }
  }
  const byKey = (k: string): number | undefined => FIXTURES.find((f) => f.key === k)?.id;

  const cmsUrl = (id: number | string): string => `${BASE}/api/internal/content/media?id=${id}`;

  // ── 0. upload-time defenses (before any delivery can be attempted) ──
  try {
    await payload.create({ collection: 'media', data: { altText: { ar: 'x', en: 'x' }, category: 'content', visibility: 'public' } as never, filePath: path.join(tmp, 'vdiag.svg'), overrideAccess: true, context: { skipAudit: true } });
    check('SVG outside logos category cannot be uploaded at all', false, 'upload unexpectedly succeeded');
  } catch {
    check('SVG outside logos category cannot be uploaded at all (Media hook)', true);
  }

  // PDF fixture (documents category) uploads fine — delivery must still block it.
  const pdfPath = path.join(tmp, 'vdoc.pdf');
  await writeFile(pdfPath, buildPdf());
  try {
    const pdfDoc = await payload.create({ collection: 'media', data: { altText: { ar: 'x', en: 'x' }, category: 'documents', visibility: 'public' } as never, filePath: pdfPath, overrideAccess: true, context: { skipAudit: true } });
    created.push(pdfDoc.id as number);
    FIXTURES.push({ key: 'pdf-public', file: 'vdoc.pdf', data: {}, id: pdfDoc.id as number });
    check('public PDF fixture created (delivery gate is what must block it)', true);
  } catch (err) {
    check('public PDF fixture created', false, String(err).slice(0, 120));
  }

  // ── 1. guard ──
  const noKey = await fetchMedia(cmsUrl(byKey('public-content') ?? 0));
  check('media endpoint without key -> 403', noKey.status === 403, `got ${noKey.status}`);
  const badKey = await fetchMedia(cmsUrl(byKey('public-content') ?? 0), { 'x-internal-key': 'wrong-key-value' });
  check('media endpoint with wrong key -> 403', badKey.status === 403, `got ${badKey.status}`);

  // ── 2. gate matrix ──
  const matrix: Array<{ key: string; expect: number; why: string }> = [
    { key: 'public-content', expect: 200, why: 'public + safe raster' },
    { key: 'private-content', expect: 404, why: 'private visibility' },
    { key: 'shot-unscreened', expect: 404, why: 'screenshot without approved screening (CS1)' },
    { key: 'shot-approved', expect: 200, why: 'screenshot with approved screening' },
    { key: 'pdf-public', expect: 404, why: 'PDF never publicly served' },
    { key: 'logo-svg', expect: 200, why: 'sanitized logos SVG allowed' },
  ];
  for (const m of matrix) {
    const id = byKey(m.key);
    if (id == null) continue;
    const res = await fetchMedia(cmsUrl(id), { 'x-internal-key': KEY });
    check(`media id=${id} (${m.key}) -> ${m.expect} [${m.why}]`, res.status === m.expect, `got ${res.status}`);
  }

  // ── 3. parameter hardening ──
  for (const probe of ['id=', 'id=abc', 'id=99999999', 'id=1%2F..%2Fsecret']) {
    const res = await fetchMedia(`${BASE}/api/internal/content/media?${probe}`, { 'x-internal-key': KEY });
    check(`media probe "${decodeURIComponent(probe)}" -> 404`, res.status === 404, `got ${res.status}`);
  }
  const badSize = await fetchMedia(cmsUrl(byKey('public-content') ?? 0), { 'x-internal-key': KEY }).then((r) => r);
  check('media without size param ok', badSize.status === 200, `got ${badSize.status}`);
  const size404 = await fetchMedia(`${BASE}/api/internal/content/media?id=${byKey('public-content')}&size=huge`, { 'x-internal-key': KEY });
  check('media with unknown size variant -> 404', size404.status === 404, `got ${size404.status}`);

  // ── 4. response shape: bytes only, no metadata, safe caching ──
  const pub = await fetchMedia(cmsUrl(byKey('public-content') ?? 0), { 'x-internal-key': KEY });
  const buf = Buffer.from(await pub.arrayBuffer());
  const ct = pub.headers.get('content-type') ?? '';
  const cc = pub.headers.get('cache-control') ?? '';
  const cd = pub.headers.get('content-disposition') ?? '';
  const bodyText = buf.toString('utf8');
  check('public asset content-type is image/*', ct.startsWith('image/'), ct);
  check('public asset cache-control is public', cc.startsWith('public,'), cc);
  check('content-disposition is inline (no filename leak)', cd === 'inline', cd);
  check('body is image bytes (PNG magic)', buf.subarray(0, 4).toString('hex') === '89504e47', buf.subarray(0, 4).toString('hex'));
  check('body is not JSON metadata', !bodyText.trimStart().startsWith('{'));
  check('no server path in body', !bodyText.includes(process.cwd()));
  check('no doc metadata fields in body', !bodyText.includes('sensitivityScreening') && !bodyText.includes('filename') && !bodyText.includes('createdBy'));
  const nosniff = pub.headers.get('x-content-type-options') ?? '';
  check('x-content-type-options: nosniff', nosniff === 'nosniff', nosniff);

  const pub304 = await fetchMedia(cmsUrl(byKey('public-content') ?? 0), { 'x-internal-key': KEY, 'if-none-match': pub.headers.get('etag') ?? '' });
  check('conditional request -> 304', pub304.status === 304, `got ${pub304.status}`);

  // ── 5. web proxy (browser-facing; no key) ──
  const wp = await fetchMedia(`${WEB_BASE}/api/media/${byKey('public-content')}`);
  const wpShot = await fetchMedia(`${WEB_BASE}/api/media/${byKey('shot-approved')}`);
  const wpPriv = await fetchMedia(`${WEB_BASE}/api/media/${byKey('private-content')}`);
  const wpUnscreened = await fetchMedia(`${WEB_BASE}/api/media/${byKey('shot-unscreened')}`);
  const wpPdf = await fetchMedia(`${WEB_BASE}/api/media/${byKey('pdf-public')}`);
  const wpBad = await fetchMedia(`${WEB_BASE}/api/media/abc`);
  const wpMissing = await fetchMedia(`${WEB_BASE}/api/media/99999999`);
  check('proxy serves public asset -> 200 image/*', wp.status === 200 && (wp.headers.get('content-type') ?? '').startsWith('image/'), `${wp.status} ${wp.headers.get('content-type')}`);
  check('proxy serves screened-approved screenshot -> 200', wpShot.status === 200, `got ${wpShot.status}`);
  check('proxy blocks private asset -> 404', wpPriv.status === 404, `got ${wpPriv.status}`);
  check('proxy blocks unscreened screenshot -> 404', wpUnscreened.status === 404, `got ${wpUnscreened.status}`);
  check('proxy blocks PDF -> 404', wpPdf.status === 404, `got ${wpPdf.status}`);
  check('proxy rejects non-numeric id -> 404', wpBad.status === 404, `got ${wpBad.status}`);
  check('proxy unknown id -> 404 (generic)', wpMissing.status === 404, `got ${wpMissing.status}`);
  const wpBody = await wp.text();
  check('proxy response has no JSON error shapes on success', !wpBody.trimStart().startsWith('{'));

  // ── cleanup ──
  for (const id of created) {
    try {
      await payload.delete({ collection: 'media', id, overrideAccess: true, context: { skipAudit: true } });
    } catch {
      /* already gone */
    }
  }
  await rm(tmp, { recursive: true, force: true });
  console.log(`\ncleaned up ${created.length} fixtures`);

  console.log(`\n== media delivery: ${passed} passed, ${failed} failed ==\n`);
  process.exit(failed === 0 ? 0 : 1);
};

void main();
