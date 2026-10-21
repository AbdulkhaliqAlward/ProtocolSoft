/**
 * Lists every "NEEDS CONFIRMATION" marker on the public site, page by page,
 * with the line it belongs to: the checklist of facts Protocol Soft still has
 * to confirm before launch. Crawls the sitemap of a running web server.
 *
 *   node scripts/list-confirmations.mjs [base=http://localhost:3000]
 * Exit code 1 when any marker remains (usable as a launch gate).
 */
const base = process.argv[2] ?? 'http://localhost:3000';

const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);

const text = (html) => html
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")
  .replace(/\s+/g, ' ').trim();

let total = 0;
for (const path of urls) {
  const html = (await (await fetch(`${base}${path}`)).text()).replace(/<script[\s\S]*?<\/script>/g, '');
  const hits = [];
  const re = /NEEDS CONFIRMATION/g;
  let m;
  while ((m = re.exec(html))) {
    // The flagged line is the nearest enclosing list item, fact row or paragraph.
    const start = Math.max(...['<li', '<dd', '<p', '<summary'].map((t) => html.lastIndexOf(t, m.index)));
    const ends = ['</li>', '</dd>', '</p>', '</summary>'].map((t) => html.indexOf(t, m.index)).filter((i) => i > 0);
    const line = text(html.slice(start, Math.min(...ends))).replace(/\[?⚠️\s*NEEDS CONFIRMATION:?\s*/u, ' → ').replace(/\]\s*$/, '').replace(/\s→\s*$/, '');
    hits.push(line);
  }
  if (hits.length) {
    total += hits.length;
    console.log(`\n${path}  (${hits.length})`);
    for (const h of hits) console.log(`  - ${h}`);
  }
}
console.log(`\n${total} item(s) need confirmation across ${urls.length} pages.`);
process.exit(total > 0 ? 1 : 0);
