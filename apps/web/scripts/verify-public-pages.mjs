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

// Approved navigation (Phase 3): Home, Services (menu of services), About, Contact.
const NAV_AR = ['الرئيسية', 'الخدمات', 'من نحن', 'تواصل معنا'];
const NAV_EN = ['Home', 'Services', 'About', 'Contact'];
const SERVICE_SLUGS = ['custom-software', 'digital-products', 'cybersecurity'];
/** The primary <nav> element's HTML only, so checks never match the footer or body. */
const primaryNav = (body) => {
  const start = body.indexOf('<nav id="primary-nav"');
  return start < 0 ? '' : body.slice(start, body.indexOf('</nav>', start));
};
const FORBIDDEN_NAV = ['case-studies', 'المشاريع', 'Blog', 'المدونة', 'الفريق'];

const main = async () => {
  console.log(`\n== Public pages verification (web ${WEB}) ==\n`);

  /* ── 1. Arabic home (default locale, unprefixed) ── */
  const ar = await get('/');
  check('GET / -> 200', ar.status === 200);
  check('AR: html lang=ar dir=rtl', /<html lang="ar" dir="rtl"[\s>]/.test(ar.body));
  const arNav = primaryNav(ar.body);
  check('AR primary nav present', arNav.length > 0);
  for (const item of NAV_AR) check(`AR nav contains «${item}»`, arNav.includes(`>${item}<`));
  check('AR nav: Services is a menu button listing the 3 services + all services',
    /<button[^>]*aria-expanded="false"[^>]*aria-controls=/.test(arNav) && SERVICE_SLUGS.every((s) => arNav.includes(`href="/services/${s}"`)) && arNav.includes('href="/services"'));
  check('AR nav language switch -> /en labeled English', ar.body.includes('href="/en"') && ar.body.includes('English'));
  check('AR hero headline present', ar.body.includes('نبني أنظمة رقمية موثوقة'));
  check('AR hero CTA -> /contact', ar.body.includes('href="/contact"'));
  check('AR services cards link to detail pages', ar.body.includes('/services/custom-software') && ar.body.includes('/services/digital-products') && ar.body.includes('/services/cybersecurity'));
  check('AR: no featured/case-study section (D-4)', !ar.body.includes('مشروع مميز'));

  /* ── 2. English home (/en) ── */
  const en = await get('/en');
  check('GET /en -> 200', en.status === 200);
  check('EN: html lang=en dir=ltr', /<html lang="en" dir="ltr"[\s>]/.test(en.body));
  const enNav = primaryNav(en.body);
  for (const item of NAV_EN) check(`EN nav contains "${item}"`, enNav.includes(`>${item}<`));
  check('EN nav: service menu links stay under /en', SERVICE_SLUGS.every((s) => enNav.includes(`href="/en/services/${s}"`)));
  check('EN nav language switch labeled العربية', en.body.includes('العربية'));
  check('EN hero headline present', en.body.includes('Trusted digital systems, built and protected'));
  check('EN services links under /en', en.body.includes('/en/services/custom-software'));

  /* ── 3. D-3: forbidden nav items appear NOWHERE in chrome ── */
  for (const f of FORBIDDEN_NAV) check(`no "${f}" in primary nav`, !arNav.includes(f) && !enNav.includes(f));

  /* ── 4. No placeholder tokens, confirmation tags or EDR product claims on any page ── */
  const UNFINISHED = ['[PLACEHOLDER]', 'NEEDS CONFIRMATION', 'بحاجة إلى تأكيد', 'class="tbc', 'wa-cta--unavailable'];
  const pages = ['/', '/en', '/services', '/en/services', '/about', '/en/about', '/contact', '/en/contact',
    ...SERVICE_SLUGS.flatMap((s) => [`/services/${s}`, `/en/services/${s}`])];
  for (const p of pages) {
    const r = await get(p);
    check(`GET ${p} -> 200`, r.status === 200, `got ${r.status}`);
    const found = UNFINISHED.filter((t) => r.body.includes(t));
    check(`${p}: no placeholder or confirmation tag`, found.length === 0, found.join(', '));
    check(`${p}: no EDR product claims`, !r.body.includes('كشف ومنع التهديدات على الأجهزة الطرفية') && !/EDR (protects|detects)/.test(r.body));
  }

  /* ── 5. Services overview + detail ── */
  const svcs = await get('/services');
  check('services page has 3 service panels', (svcs.body.match(/class="svc-panel"/g) ?? []).length >= 3);
  check('services panels render localized titles', svcs.body.includes('تطوير الأنظمة المخصصة') && svcs.body.includes('>خدماتنا<'));
  const svcsEn = await get('/en/services');
  check('EN services panels render titles', svcsEn.body.includes('Custom Systems Development') || svcsEn.body.includes('Custom Software'));
  const detail = await get('/services/cybersecurity');
  check('service detail: scope section with included and not-included lists', detail.body.includes('نطاق العمل') && detail.body.includes('يشمل') && detail.body.includes('لا يشمل'));
  check('service detail: process timeline', detail.body.includes('كيف نعمل'));
  check('service detail: FAQ accordion', detail.body.includes('أسئلة شائعة'));
  check('service detail: CTA with service preselect', detail.body.includes('/contact?service=cybersecurity'));
  const unknown = await get('/services/not-a-service');
  check('unknown service slug -> 404', unknown.status === 404, `got ${unknown.status}`);

  /* ── 6. About (published locally per D-2) ── */
  const about = await get('/about');
  check('about renders the published principles grid', about.body.includes('class="principles"'));
  const aboutEn = await get('/en/about');
  check('EN about renders the principles grid', aboutEn.body.includes('class="principles"'));

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
  // ?service= is applied in the browser (the page stays static and cached);
  // the browser suite (verify-rtl-ltr) checks the preselection itself.
  const preBad = await get('/contact?service=edr');
  check('contact ?service=edr: no EDR option exists', preBad.status === 200 && !/value="edr"/.test(preBad.body));

  /* ── 8. Published-only behavior (D-2/LD1/D-4) ── */
  // Privacy follows its publish state: published -> 200 + footer link; draft -> 404 + no link.
  const privacy = await get('/privacy');
  const privacyLive = privacy.status === 200;
  check('/privacy -> 200 when published, 404 while draft', [200, 404].includes(privacy.status), `got ${privacy.status}`);
  check('footer privacy link matches publish state', ar.body.includes('href="/privacy"') === privacyLive && en.body.includes('href="/en/privacy"') === privacyLive);
  if (privacyLive) {
    const found = UNFINISHED.filter((t) => privacy.body.includes(t));
    check('/privacy: no placeholder or confirmation tag', found.length === 0, found.join(', '));
    check('/privacy: no draft-template note', !privacy.body.includes('مسودة أولية'));
  }
  const terms = await get('/en/terms');
  check('/en/terms -> 404 while draft', terms.status === 404, `got ${terms.status}`);
  const cases = await get('/case-studies');
  check('/case-studies -> 404 (no public route, D-4)', cases.status === 404, `got ${cases.status}`);
  check('footer has NO terms link while draft', !ar.body.includes('href="/terms"') && !en.body.includes('href="/en/terms"'));

  /* ── 9. 404 page + locale fallback ── */
  // Next 16 renders notFound() content in the browser, so the server response
  // is checked for status + noindex; verify-rtl-ltr checks the rendered page.
  const nf = await get('/xyz-not-a-page');
  check('unknown URL -> 404 + noindex', nf.status === 404 && /<meta name="robots" content="noindex/.test(nf.body), `got ${nf.status}`);
  const nfEn = await get('/en/xyz-not-a-page');
  check('unknown EN URL -> 404 + noindex', nfEn.status === 404 && /<meta name="robots" content="noindex/.test(nfEn.body), `got ${nfEn.status}`);
  const deep = await get('/services/not-a-service/extra');
  check('deep unknown path -> 404', deep.status === 404, `got ${deep.status}`);
  const arPrefix = await fetch(`${WEB}/ar/services`, { redirect: 'manual' });
  check('/ar/... redirects to the clean Arabic URL (308)', arPrefix.status === 308 && (arPrefix.headers.get('location') ?? '').endsWith('/services'), `got ${arPrefix.status} ${arPrefix.headers.get('location')}`);

  /* ── 10. SEO metadata: canonical + hreflang alternates (React emits hrefLang) ── */
  // Absolute since metadataBase is set (origin = NEXT_PUBLIC_SITE_URL); the bare root has no trailing slash.
  check('AR home canonical = /', /rel="canonical"[^>]*href="(?:https?:\/\/[^"\/]+)?\/?"/.test(ar.body));
  check('AR home hreflang en -> /en', /rel="alternate"[^>]*hrefLang="en"[^>]*href="(?:https?:\/\/[^"\/]+)?\/en"/.test(ar.body));
  check('EN home hreflang ar -> /', /rel="alternate"[^>]*hrefLang="ar"[^>]*href="(?:https?:\/\/[^"\/]+)?\/?"/.test(en.body));

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
