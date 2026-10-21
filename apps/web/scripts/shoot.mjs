/**
 * Design review captures: full-page screenshots of routes at chosen widths and
 * themes, written to an output folder. Reveal animations are forced visible so
 * every section appears in the capture.
 *
 *   node scripts/shoot.mjs <outDir> <route>[,<route>...] [widths=1440,390] [themes=light,dark] [base]
 *   e.g. node scripts/shoot.mjs ../../tmp/shots /,/en/services 1440,390 light
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { Cdp, sleep } from './cdp.mjs';

const [outDir, routesArg, widthsArg = '1440,390', themesArg = 'light,dark', base = 'http://localhost:3000'] = process.argv.slice(2);
if (!outDir || !routesArg) {
  console.error('usage: node scripts/shoot.mjs <outDir> <routes> [widths] [themes] [base]');
  process.exit(2);
}
mkdirSync(outDir, { recursive: true });

const cdp = await Cdp.launch(9231);
await cdp.newTababoutBlank();
await cdp.send('Page.enable');
await cdp.send('Runtime.enable');

for (const theme of themesArg.split(',')) {
  for (const width of widthsArg.split(',').map(Number)) {
    for (const route of routesArg.split(',')) {
      const mobile = width < 768;
      await cdp.send('Emulation.setDeviceMetricsOverride', { width, height: mobile ? 844 : 900, mobile, deviceScaleFactor: 1 });
      await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: theme }] });
      await cdp.goto(`${base}${route}`);
      await cdp.eval(`localStorage.setItem('protocol-soft-theme', '${theme}'); document.documentElement.setAttribute('data-theme', '${theme}'); document.documentElement.classList.add('reveal-done'); document.fonts.ready.then(() => true)`);
      await sleep(400);
      const height = await cdp.eval('Math.ceil(document.documentElement.scrollHeight)');
      const shot = await cdp.send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true,
        clip: { x: 0, y: 0, width, height: Math.min(height, 12000), scale: 1 },
      });
      const name = `${route.replace(/^\/$/, 'home').replace(/^\//, '').replace(/[/?#=&]/g, '_') || 'home'}-${width}-${theme}.png`;
      writeFileSync(join(outDir, name), Buffer.from(shot.data, 'base64'));
      const overflow = await cdp.eval('document.documentElement.scrollWidth > window.innerWidth');
      console.log(`${name}  ${width}x${height}${overflow ? '  ⚠ horizontal overflow' : ''}`);
    }
  }
}
await cdp.close();
