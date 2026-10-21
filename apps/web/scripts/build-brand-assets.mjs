/**
 * Brand asset generator. Source of truth: src/app/logo.svg (final vector, 2048
 * viewBox with generous empty margins). Every output reuses the original path
 * data unchanged; only the viewBox (tight crop) and the two brand fills change.
 *
 *   Purple #2E0661 = ink (outlines, letterforms)
 *   Cream  #FEF0E1 = fills inside the outlines (figure body, letter counters)
 *
 * The "reversed" variants swap the two colours, so they read correctly on the
 * brand purple (#2E0661) — the intended dark background.
 *
 * Crop boxes were measured with getBBox() on every path (no strokes, so the
 * geometric box is the painted box). Run: node scripts/build-brand-assets.mjs
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PURPLE = '#2E0661';
const CREAM = '#FEF0E1';

// Paths 0-7, 18-19, 27-35 form the icon; 8-17, 20-26 the "Protocol Soft" wordmark.
const ICON_PATHS = new Set([0, 1, 2, 3, 4, 5, 6, 7, 18, 19, 27, 28, 29, 30, 31, 32, 33, 34, 35]);

// Painted bounds (2048 space): full x 477.7–1578.0, y 347.9–1703.1;
// icon x 681.9–1364.9, y 347.9–1032.3. Padding: 8 units (~0.7% of width).
const FULL_VIEWBOX = '469.7 339.9 1116.3 1371.2';
const ICON_VIEWBOX = '673.4 340.1 700 700'; // square, centred on the icon bounds

const source = await readFile(path.join(root, 'src/app/logo.svg'), 'utf8');
const paths = source.match(/<path\b[^>]*\/?>(?:<\/path>)?/g) ?? [];
if (paths.length !== 36) throw new Error(`expected 36 paths in logo.svg, found ${paths.length}`);

const recolor = (p, reversed) => {
  if (!reversed) return p;
  return p.replace(/fill="(#2E0661|#FEF0E1)"/i, (_, c) => `fill="${c.toUpperCase() === PURPLE ? CREAM : PURPLE}"`);
};

const svg = ({ viewBox, iconOnly = false, reversed = false, title }) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="${title}">` +
  `<title>${title}</title>` +
  paths.filter((_, i) => !iconOnly || ICON_PATHS.has(i)).map((p) => recolor(p, reversed)).join('') +
  `</svg>\n`;

const NAME = 'Protocol Soft — بروتوكول سوفت';
const brandDir = path.join(root, 'public/brand');
await mkdir(brandDir, { recursive: true });

const outputs = {
  'logo.svg': svg({ viewBox: FULL_VIEWBOX, title: NAME }),
  'logo-reversed.svg': svg({ viewBox: FULL_VIEWBOX, reversed: true, title: NAME }),
  'logo-mark.svg': svg({ viewBox: ICON_VIEWBOX, iconOnly: true, title: NAME }),
  'logo-mark-reversed.svg': svg({ viewBox: ICON_VIEWBOX, iconOnly: true, reversed: true, title: NAME }),
};
for (const [file, content] of Object.entries(outputs)) await writeFile(path.join(brandDir, file), content);

/* App icons: the mark on a cream tile, so it stays legible in light and dark
   browser chrome. Inner padding keeps the gear/figure clear of OS masks. */
const tile = (size, padRatio) => {
  const inner = Math.round(size * (1 - padRatio * 2));
  const off = Math.round((size - inner) / 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    `<rect width="${size}" height="${size}" fill="${CREAM}"/>` +
    `<svg x="${off}" y="${off}" width="${inner}" height="${inner}" viewBox="${ICON_VIEWBOX}">` +
    paths.filter((_, i) => ICON_PATHS.has(i)).join('') +
    `</svg></svg>\n`;
};
const png = (svgText, file) => sharp(Buffer.from(svgText)).png({ compressionLevel: 9 }).toFile(file);

await writeFile(path.join(root, 'src/app/icon.svg'), tile(64, 0.06));
await png(tile(180, 0.12), path.join(root, 'src/app/apple-icon.png'));
await png(tile(192, 0.12), path.join(brandDir, 'icon-192.png'));
await png(tile(512, 0.12), path.join(brandDir, 'icon-512.png'));
// Maskable: Android may crop to a circle — keep the mark inside the 80% safe zone.
await png(tile(512, 0.2), path.join(brandDir, 'icon-maskable-512.png'));

/* Default Open Graph image (1200×630): cream field, full logo centred.
   Interim until the Phase 3 art direction defines a designed share card. */
const ogW = 1200, ogH = 630, logoH = 470;
const logoW = Math.round((logoH * 1116.3) / 1371.2);
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="${ogW}" height="${ogH}">` +
  `<rect width="${ogW}" height="${ogH}" fill="${CREAM}"/>` +
  `<svg x="${(ogW - logoW) / 2}" y="${(ogH - logoH) / 2}" width="${logoW}" height="${logoH}" viewBox="${FULL_VIEWBOX}">` +
  paths.join('') + `</svg></svg>`;
await png(og, path.join(root, 'src/app/opengraph-image.png'));

/* Theme-aware inline mark for the site chrome: the two brand fills become CSS
   variables (--mark-ink / --mark-paper), so one inline SVG serves the light
   header, the dark theme and the purple footer without extra requests. */
const markPaths = paths
  .filter((_, i) => ICON_PATHS.has(i))
  .map((p) => {
    const fill = /fill="#FEF0E1"/i.test(p) ? 'var(--mark-paper)' : 'var(--mark-ink)';
    const d = p.match(/\sd="([^"]+)"/)[1];
    return `    <path fill="${fill}" d="${d}" />`;
  })
  .join('\n');
await writeFile(
  path.join(root, 'src/components/LogoMark.tsx'),
  [
    '/* GENERATED by scripts/build-brand-assets.mjs from src/app/logo.svg — do not edit. */',
    'export const LogoMark = ({ size = 40, className }: { size?: number; className?: string }) => (',
    `  <svg className={className} width={size} height={size} viewBox="${ICON_VIEWBOX}" aria-hidden="true" focusable="false">`,
    markPaths,
    '  </svg>',
    ');',
    '',
  ].join('\n'),
);

console.log('brand assets written: public/brand/*, src/app/icon.svg, apple-icon.png, opengraph-image.png, src/components/LogoMark.tsx');
