/**
 * Layout verification: on every public page, at phone to wide-desktop widths,
 * in Arabic and English, nothing overlaps, nothing sticks out of the viewport,
 * and no text is cut off by its container.
 *
 *   - OVERLAP   two visible text/shape elements (not nested) share >2px x >2px
 *   - OUTSIDE   an element extends past the viewport edge
 *   - OVERFLOW  the page scrolls sideways
 *   - CLIPPED   a text element's content is wider than a clipping box
 *
 * Entrance motion is disabled (prefers-reduced-motion) so elements are
 * measured where they rest. Answers of closed FAQ items are skipped.
 * Run with the web server up:  node scripts/verify-layout.mjs [baseUrl]
 */
import { Cdp, sleep } from './cdp.mjs';

const WEB = process.argv[2] ?? `http://localhost:${process.env.WEB_PORT ?? '3000'}`;
const WIDTHS = [360, 390, 768, 1024, 1366, 1920];
const PAGES = [
  '/', '/services', '/services/custom-software', '/services/digital-products', '/services/cybersecurity',
  '/about', '/contact', '/privacy',
  '/en', '/en/services', '/en/services/cybersecurity', '/en/about', '/en/contact',
];

const AUDIT = `(() => {
  const hiddenIn = (e) => { const d = e.closest('details'); return d && !d.open && !e.closest('summary'); };
  const sel = 'main h1,main h2,main h3,main h4,main p,main a,main span,main li,main dt,main dd,main button,main svg,main img,main input,main textarea,main select,main label,footer h2,footer p,footer a,footer span,header a,header button';
  const els = [...document.querySelectorAll(sel)].filter((e) => {
    const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
    return r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && e.getClientRects().length && !hiddenIn(e) && !e.closest('[aria-hidden="true"]') && !e.closest('.visually-hidden');
  });
  const desc = (e) => e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className ? '.' + e.className.split(' ')[0] : '') + ' "' + (e.textContent || '').trim().slice(0, 24) + '"';
  const out = [];
  for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) {
    const a = els[i], b = els[j];
    if (a.contains(b) || b.contains(a)) continue;
    const r = a.getBoundingClientRect(), s = b.getBoundingClientRect();
    const ix = Math.min(r.right, s.right) - Math.max(r.left, s.left);
    const iy = Math.min(r.bottom, s.bottom) - Math.max(r.top, s.top);
    if (ix > 2 && iy > 2) out.push('OVERLAP ' + desc(a) + ' x ' + desc(b) + ' (' + Math.round(ix) + 'x' + Math.round(iy) + ' at y=' + Math.round(r.top + scrollY) + ')');
  }
  for (const e of els) { const r = e.getBoundingClientRect(); if (r.left < -1 || r.right > innerWidth + 1) out.push('OUTSIDE ' + desc(e)); }
  if (document.documentElement.scrollWidth > innerWidth) out.push('OVERFLOW page is ' + document.documentElement.scrollWidth + 'px wide');
  for (const e of els) { if (e.children.length === 0 && e.textContent.trim() && getComputedStyle(e).overflow !== 'visible' && e.scrollWidth > e.clientWidth + 2) out.push('CLIPPED ' + desc(e)); }
  return out;
})()`;

let failed = 0;
let checked = 0;
const cdp = await Cdp.launch(9231);
try {
  await cdp.newTababoutBlank();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  for (const width of WIDTHS) {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false }); // mobile:true would widen the viewport to fit overflowing content and hide it
    for (const path of PAGES) {
      await cdp.goto(`${WEB}${path}`);
      await cdp.eval('document.fonts.ready.then(() => true)');
      await sleep(150);
      const issues = await cdp.eval(AUDIT);
      checked++;
      if (issues.length) {
        failed++;
        console.log(`  ✘ ${path} @${width}px — ${issues.length} issue(s)`);
        for (const i of issues.slice(0, 8)) console.log(`      ${i}`);
      }
    }
  }
} finally {
  await cdp.close();
}
console.log(`\n== RESULT: ${checked - failed} clean, ${failed} with issues (${PAGES.length} pages × ${WIDTHS.length} widths) ==`);
process.exit(failed ? 1 : 0);
