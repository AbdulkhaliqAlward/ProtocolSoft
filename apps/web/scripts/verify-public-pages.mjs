/**
 * Public pages verification (Phase 5 acceptance). Black-box checks against the
 * running web dev server: locale routing + dir/lang, the EXACT D-3 navigation,
 * D-4 route absence (no /case-studies), D-5 form fields (no EDR option, secrets
 * guidance, honeypot), published-only behavior (legal pages 404 while draft),
 * honest 404s, and the lead path end-to-end. Run with both dev servers up:
 *   node ./scripts/verify-public-pages.mjs [webBase] [cmsBase]
 */
const WEB = process.argv[2] ?? `http://localhost:${process.env.WEB_PORT ?? '3000'}`;
const CMS = process.argv[3] ?? `http://localhost:${process.env.CMS_PORT ?? '3001'}`;

let passed = 0;
let failed = 0;
const check = (name, ok, detail = '') => {
  if (ok) {
    passed++;
    console.log(`  ✔ ${name}${detail ? ` — ${detail}` : ''}`);
  } else {
    failed++;
    console.log(`  ✘ ${name}${detail ? ` — ${detail}` : ''}`);
  }
};

const get = async (path) => {
  const res = await fetch(`${WEB}${path}`, { cache: 'no-store' });
  const body = await res.text();
  return { status: res.status, body };
};

const NAV_AR = ['الخدمات', 'من نحن', 'تواصل معنا'];
const NAV_EN = ['Services', 'About', 'Contact'];
const FORBIDDEN_NAV = ['case-studies', 'المشاريع', 'Blog', 'المدونة', 'الفريق'];

const main = async () => {
  console.log(`\n== Public pages verification (web ${WEB}) ==\n`);

  /* ── 1. Arabic home (default locale, unprefixed) ── */
  const ar = await get('/');
  check('GET / -> 200', ar.status === 200);
  check('AR: html lang=ar dir=rtl', ar.body.includes('<html lang="ar" dir="rtl">'));
  for (const item of NAV_AR) check(`AR nav contains «${item}»`, ar.body.includes(`>${item}</a>`));
  check('AR nav language switch -> /en labeled English', ar.body.includes('href="/en"') && ar.body.includes('English'));
  check('AR hero headline present', ar.body.includes('نبني أنظمة رقمية موثوقة'));
  check('AR hero CTA -> /contact', ar.body.includes('href="/contact"'));
  check('AR services cards link to detail pages', ar.body.includes('/services/custom-software') && ar.body.includes('/services/digital-products') && ar.body.includes('/services/cybersecurity'));
  check('AR: no featured/case-study section (D-4)', !ar.body.includes('مشروع مميز'));

  /* ── 2. English home (/en) ── */
  const en = await get('/en');
  check('GET /en -> 200', en.status === 200);
  check('EN: html lang=en dir=ltr', en.body.includes('<html lang="en" dir="ltr">'));
  for (const item of NAV_EN) check(`EN nav contains "${item}"`, en.body.includes(`>${item}</a>`));
  check('EN nav language switch labeled العربية', en.body.includes('العربية'));
  check('EN hero headline present', en.body.includes('Trusted digital systems, built and protected'));
  check('EN services links under /en', en.body.includes('/en/services/custom-software'));

  /* ── 3. D-3: forbidden nav items appear NOWHERE in chrome ── */
  for (const f of FORBIDDEN_NAV) check(`no "${f}" nav/route anywhere on home`, !ar.body.includes(f) || !ar.body.includes('nav'));

  /* ── 4. No placeholder tokens or EDR product claims on any page ── */
  const pages = ['/services', '/about', '/contact'];
  for (const p of pages) {
    const r = await get(p);
    check(`GET ${p} -> 200`, r.status === 200, `got ${r.status}`);
    check(`${p}: no [PLACEHOLDER]`, !r.body.includes('[PLACEHOLDER]'));
    check(`${p}: no EDR product claims`, !r.body.includes('كشف ومنع التهديدات على الأجهزة الطرفية') && !/EDR (protects|detects)/.test(r.body));
  }

  /* ── 5. Services overview + detail ── */
  const svcs = await get('/services');
  check('services page has 3 panels', (svcs.body.match(/service-panel/g) ?? []).length >= 3);
  check('services panels render localized titles', svcs.body.includes('تطوير الأنظمة المخصصة') && svcs.body.includes('>خدماتنا<'));
  const svcsEn = await get('/en/services');
  check('EN services panels render titles', svcsEn.body.includes('Custom Systems Development') || svcsEn.body.includes('Custom Software'));
  const detail = await get('/services/cybersecurity');
  check('service detail: deliverables section', detail.body.includes('ما نسلّمه'));
  check('service detail: process timeline', detail.body.includes('كيف نعمل'));
  check('service detail: FAQ accordion', detail.body.includes('أسئلة شائعة'));
  check('service detail: CTA with service preselect', detail.body.includes('/contact?service=cybersecurity'));
  const unknown = await get('/services/not-a-service');
  check('unknown service slug -> 404', unknown.status === 404, `got ${unknown.status}`);

  /* ── 6. About (published locally per D-2) ── */
  const about = await get('/about');
  check('about renders published values grid', about.body.includes('مبادئ عملنا'));
  const aboutEn = await get('/en/about');
  check('EN about renders', aboutEn.body.includes('How we work'));

  /* ── 7. Contact page (D-5) ── */
  const contact = await get('/contact');
  check('contact: full name field', contact.body.includes('id="cf-name"'));
  check('contact: work email field', contact.body.includes('id="cf-email"'));
  check('contact: message textarea', contact.body.includes('id="cf-message"'));
  check('contact: consent checkbox with privacy link', contact.body.includes('id="cf-consent"') && contact.body.includes('/privacy'));
  check('contact: optional phone + company', contact.body.includes('id="cf-phone"') && contact.body.includes('id="cf-company"'));
  check('contact: exactly 4 service options', (contact.body.match(/value="(custom_software|digital_products|cybersecurity|general)"/g) ?? []).length === 4);
  check('contact: NO EDR option', !contact.body.includes('edr'));
  check('contact: secrets guidance present', contact.body.includes('كلمات مرور') && contact.body.includes('مفاتيح'));
  check('contact: honeypot hidden field', contact.body.includes('cf-website') && contact.body.includes('field--hp'));
  const contactEn = await get('/en/contact');
  check('EN contact: English guidance present', contactEn.body.includes('do not submit passwords'));
  const preselected = await get('/contact?service=custom-software');
  check('contact ?service= preselects the matching tile', /<input[^>]*name="serviceInterest"[^>]*checked=""[^>]*value="custom_software"/.test(preselected.body.replace(/\n/g, ' ')));
  const preBad = await get('/contact?service=edr');
  check('contact ?service=edr falls back to General (no EDR)', !/value="edr"/.test(preBad.body));

  /* ── 8. Published-only behavior (D-2/LD1/D-4) ── */
  const privacy = await get('/privacy');
  check('/privacy -> 404 while legal template is draft', privacy.status === 404, `got ${privacy.status}`);
  const terms = await get('/en/terms');
  check('/en/terms -> 404 while draft', terms.status === 404, `got ${terms.status}`);
  const cases = await get('/case-studies');
  check('/case-studies -> 404 (no public route, D-4)', cases.status === 404, `got ${cases.status}`);
  check('footer has NO legal links while draft', !ar.body.includes('href="/privacy"') && !en.body.includes('href="/en/privacy"'));

  /* ── 9. 404 page + locale fallback ── */
  const nf = await get('/xyz-not-a-page');
  check('unknown URL -> 404 with 404 page', nf.status === 404 && nf.body.includes('الصفحة غير موجودة'));
  const nfEn = await get('/en/xyz-not-a-page');
  check('unknown EN URL -> 404 (EN copy)', nfEn.status === 404 && nfEn.body.includes('Page not found'));

  /* ── 10. SEO metadata: canonical + hreflang alternates (React emits hrefLang) ── */
  check('AR home canonical = /', /rel="canonical"[^>]*href="\/"/.test(ar.body));
  check('AR home hreflang en -> /en', /rel="alternate"[^>]*hrefLang="en"[^>]*href="\/en"/.test(ar.body));
  check('EN home hreflang ar -> /', /rel="alternate"[^>]*hrefLang="ar"[^>]*href="\/"/.test(en.body));

  /* ── 11. Lead path end-to-end (web proxy -> CMS, D-5/D-7) ── */
  const lead = await fetch(`${WEB}/api/contact`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      fullName: 'تحقق صفحات عامة — يُحذف',
      email: 'sink@example.invalid',
      serviceInterest: 'digital_products',
      message: 'طلب تحقق آلي من مسار النموذج العام — ليس طلباً حقيقياً.',
      sourceLocale: 'ar',
      consent: true,
      idempotencyKey: `pages-verify-${Date.now()}`,
    }),
  });
  check('POST /api/contact valid -> 201 + reference', lead.status === 201, `got ${lead.status}`);
  const edr = await fetch(`${WEB}/api/contact`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ fullName: 'x', email: 'sink@example.invalid', serviceInterest: 'edr', message: 'probe probe probe probe', sourceLocale: 'ar', consent: true, idempotencyKey: `pages-verify-edr-${Date.now()}` }),
  });
  check('POST /api/contact EDR value -> 422 (never selectable)', edr.status === 422, `got ${edr.status}`);
  const hp = await fetch(`${WEB}/api/contact`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ fullName: 'Bot Bot', email: 'sink@example.invalid', serviceInterest: 'general', message: 'bot fills everything quickly here', sourceLocale: 'ar', consent: true, idempotencyKey: `pages-verify-hp-${Date.now()}`, honeypot: 'spam' }),
  });
  const hpJson = (await hp.json().catch(() => ({})));
  check('honeypot -> silent 201 sink (never stored as lead)', hp.status === 201 && hpJson.referenceCode === 'LF-0000SINK', `got ${hp.status}`);

  /* ── 12. Media proxy never exposes errors/metadata ── */
  const mediaBad = await fetch(`${WEB}/api/media/abc`);
  check('GET /api/media/abc -> 404 empty body', mediaBad.status === 404 && (await mediaBad.text()) === '');

  /* ── 13. CMS direct REST still closed (spot re-check from the web suite) ── */
  const direct = await fetch(`${CMS}/api/leads`, { cache: 'no-store' });
  check('CMS direct REST /api/leads unauthenticated -> rejected', [401, 403].includes(direct.status), `got ${direct.status}`);

  console.log(`\n== RESULT: ${passed} passed, ${failed} failed ==\n`);
  process.exit(failed === 0 ? 0 : 1);
};

void main();
