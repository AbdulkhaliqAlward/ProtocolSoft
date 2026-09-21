/**
 * WCAG 2.1 contrast audit for the approved "Trusted Ink & Stone" token sets
 * (Phase 5 visual rebuild §3.1/§3.2 plus the documented derivations).
 * Values mirror apps/web/src/app/globals.css EXACTLY — if a token changes,
 * change it here too, otherwise the audit measures nothing real.
 *   node docs/contrast-audit.mjs
 */
const hexToRgb = (h) => {
  const s = h.replace('#', '');
  const n = parseInt(s.length === 3 ? s.split('').map((c) => c + c).join('') : s, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const lum = (hex) => {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};
// color-mix(in srgb, X p%, Y) approximation
const mix = (x, p, y) => {
  const [rx, gx, bx] = hexToRgb(x);
  const [ry, gy, by] = hexToRgb(y);
  const t = p / 100;
  const c = (a, b) => Math.round(a * t + b * (1 - t));
  return `#${[c(rx, ry), c(gx, gy), c(bx, by)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};

/* Exact §3.1 light set + derivations from globals.css :root */
const LIGHT = {
  bg: '#F7F5F0', surface: '#FCFBF8', raised: '#FFFFFF', subtle: '#EEF0EB',
  text: '#17232D', muted: '#53616B',
  primary: '#24557A', primaryHover: '#193F5D', primaryActive: '#12334D', onPrimary: '#FFFFFF',
  secondary: '#416D6C', secondaryHover: '#315856',
  accent: '#A46342', accentText: '#864B2F',
  border: '#D5D4CE', borderStrong: '#AFB4B2', borderField: '#64717B',
  focus: '#1B5A86',
  success: '#246B4A', warning: '#8A5A16', danger: '#A63D3A',
  darkSection: '#172C3C', onDark: '#F7F5F0', onDarkMuted: '#C7D0D2',
  accentOnDark: '#D9A182', focusOnDark: '#A9CFE8',
  badgeText: '#315856', // badge--info uses secondary-hover in the light theme
};
/* Exact §3.2 dark set + derivations from globals.css [data-theme="dark"] */
const DARK = {
  bg: '#121E28', surface: '#192B37', raised: '#223845', subtle: '#16242E',
  text: '#F2F0EA', muted: '#C1CBD0',
  primary: '#9CC4DC', primaryHover: '#C0DDEC', primaryActive: '#D5E8F2', onPrimary: '#132633',
  secondary: '#9AC1BB', secondaryHover: '#B9D9D4',
  accent: '#D5A07A', accentText: '#E2B594',
  border: '#38505C', borderStrong: '#526A75', borderField: '#8C9DA6',
  focus: '#B8DDF0',
  success: '#8FC7A3', warning: '#D9B46D', danger: '#E89288',
  darkSection: '#0F1A22', onDark: '#F2F0EA', onDarkMuted: '#C1CBD0',
  accentOnDark: '#D5A07A', focusOnDark: '#B8DDF0',
  badgeText: '#9AC1BB', // badge--info uses secondary in the dark theme
};

const cases = (t) => {
  const banner = (c) => mix(c, 7, t.raised);      // .form-banner backgrounds
  const badge = (c) => mix(c, 10, t.surface);     // .badge backgrounds
  const softBtn = mix(t.primary, 12, t.surface);  // .btn--soft background
  const choiceBg = mix(t.primary, 10, t.raised);  // .choice:checked background
  return [
    ['Body text on page background', t.text, t.bg, 4.5],
    ['Body text on content surface', t.text, t.surface, 4.5],
    ['Body text on raised surface (cards/forms)', t.text, t.raised, 4.5],
    ['Muted text on page background', t.muted, t.bg, 4.5],
    ['Muted text on content surface', t.muted, t.surface, 4.5],
    ['Muted text on raised surface', t.muted, t.raised, 4.5],
    ['Ink-blue link text on background', t.primary, t.bg, 4.5],
    ['Primary button text (default)', t.onPrimary, t.primary, 4.5],
    ['Primary button text (hover)', t.onPrimary, t.primaryHover, 4.5],
    ['Primary button text (active)', t.onPrimary, t.primaryActive, 4.5],
    ['Soft button text on its tint', t.primary, softBtn, 4.5],
    ['Copper kicker/numbering text on background', t.accentText, t.bg, 4.5],
    ['Copper kicker text on content surface', t.accentText, t.surface, 4.5],
    ['Copper graphic rule on background (non-text)', t.accent, t.bg, 3],
    ['Dark-section text (footer both themes, dark hero)', t.onDark, t.darkSection, 4.5],
    ['Dark-section muted text', t.onDarkMuted, t.darkSection, 4.5],
    ['Copper accent text on dark section', t.accentOnDark, t.darkSection, 4.5],
    ['Field border vs page background (interactive 3:1)', t.borderField, t.bg, 3],
    ['Field border vs raised surface (interactive 3:1)', t.borderField, t.raised, 3],
    ['Focus ring vs page background (3:1)', t.focus, t.bg, 3],
    ['Focus ring on dark section (3:1)', t.focusOnDark, t.darkSection, 3],
    ['Success text on success banner', t.success, banner(t.success), 4.5],
    ['Warning text on warning banner', t.warning, banner(t.warning), 4.5],
    ['Danger text on danger banner', t.danger, banner(t.danger), 4.5],
    ['Info badge text on badge tint', t.badgeText, badge(t.secondary), 4.5],
    ['Choice-tile text on checked tint', t.text, choiceBg, 4.5],
    ['Hairline divider vs background (non-informative decoration)', t.borderStrong, t.bg, 0],
  ];
};

let failures = 0;
for (const [name, t] of [['LIGHT THEME', LIGHT], ['DARK THEME', DARK]]) {
  console.log(`\n=== ${name} ===`);
  for (const [label, fg, bg, min] of cases(t)) {
    const r = ratio(fg, bg);
    const verdict = min === 0 ? 'n/a ' : r >= min ? 'PASS' : 'FAIL';
    if (min > 0 && r < min) failures++;
    console.log(`  ${verdict} ${r.toFixed(2).padStart(5)}  ${label}  (${fg} on ${bg}${min ? `, need ${min}` : ''})`);
  }
}
console.log('\nNotes: banner/badge/soft/choice backgrounds are the exact color-mix() values used in globals.css.');
console.log('The prefers-color-scheme no-JS block in globals.css mirrors the dark set (identical values).');
console.log(failures === 0 ? '\nRESULT: all measured pairs meet WCAG 2.1 AA.\n' : `\nRESULT: ${failures} pair(s) FAIL.\n`);
process.exit(failures === 0 ? 0 : 1);
