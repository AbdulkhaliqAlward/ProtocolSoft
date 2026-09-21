/**
 * Screenshot capture for Phase 5 visual rebuild §17D.
 * Captures all 20 required screenshots and stores them under
 * docs/screenshots/phase5-visual-rebuild/
 * Run with the web dev server up:  node ./scripts/capture-screenshots.mjs [webBase]
 */
import { Cdp, sleep } from './cdp.mjs';
import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const WEB = process.argv[2] ?? `http://localhost:${process.env.WEB_PORT ?? '3000'}`;
const OUT_DIR = join(process.cwd(), '..', '..', 'docs', 'screenshots', 'phase5-visual-rebuild');

if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

const main = async () => {
  console.log(`\n== Screenshot capture (web ${WEB}) ==\n`);
  console.log(`Output directory: ${OUT_DIR}\n`);

  const cdp = await Cdp.launch(9225);
  await cdp.newTababoutBlank();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  let captured = 0;
  let failed = 0;

  const capture = async (name, url, viewport, theme, extraSetup = null) => {
    try {
      await cdp.send('Emulation.setEmulatedMedia', {
        features: [
          { name: 'prefers-color-scheme', value: theme },
          { name: 'prefers-reduced-motion', value: 'no-preference' },
        ],
      });

      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: viewport.width,
        height: viewport.height,
        mobile: viewport.mobile,
        deviceScaleFactor: viewport.deviceScaleFactor ?? 1,
      });

      await cdp.goto(`${WEB}${url}`);

      // Wait for theme to apply
      await sleep(300);

      // If theme is dark, ensure it's applied (may need toggle if system is light)
      if (theme === 'dark') {
        const currentTheme = await cdp.eval(`document.documentElement.getAttribute('data-theme')`);
        if (currentTheme !== 'dark') {
          await cdp.eval(`localStorage.setItem('protocol-soft-theme', 'dark')`);
          await cdp.eval(`document.documentElement.setAttribute('data-theme', 'dark')`);
          await sleep(200);
        }
      } else {
        const currentTheme = await cdp.eval(`document.documentElement.getAttribute('data-theme')`);
        if (currentTheme !== 'light') {
          await cdp.eval(`localStorage.setItem('protocol-soft-theme', 'light')`);
          await cdp.eval(`document.documentElement.setAttribute('data-theme', 'light')`);
          await sleep(200);
        }
      }

      // Extra setup (e.g., open mobile nav)
      if (extraSetup) {
        await extraSetup(cdp);
        await sleep(300);
      }

      // Scroll to top for consistent captures
      await cdp.eval(`window.scrollTo(0, 0)`);
      await sleep(200);

      // Capture full page screenshot
      const screenshot = await cdp.send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true,
      });

      const { writeFileSync } = await import('node:fs');
      writeFileSync(join(OUT_DIR, `${name}.png`), Buffer.from(screenshot.data, 'base64'));

      console.log(`  ✔ ${name}.png (${viewport.width}x${viewport.height}, ${theme})`);
      captured++;
    } catch (e) {
      console.log(`  ✘ ${name}.png — ${e.message}`);
      failed++;
    }
  };

  const openMobileNav = async (cdp) => {
    // At tablet/mobile widths, the nav toggle should be visible
    await cdp.eval(`
      const toggle = document.querySelector('.nav-toggle');
      if (toggle && toggle.getAttribute('aria-expanded') === 'false') {
        toggle.click();
      }
    `);
    await sleep(300);
  };

  const viewportDesktop = { width: 1440, height: 900, mobile: false, deviceScaleFactor: 1 };
  const viewportTablet = { width: 768, height: 1024, mobile: false, deviceScaleFactor: 1 };
  const viewportMobile = { width: 375, height: 812, mobile: true, deviceScaleFactor: 2 };

  try {
    // 1. Arabic homepage — Light
    await capture('01-ar-home-light', '/', viewportDesktop, 'light');

    // 2. Arabic homepage — Dark
    await capture('02-ar-home-dark', '/', viewportDesktop, 'dark');

    // 3. English homepage — Light
    await capture('03-en-home-light', '/en', viewportDesktop, 'light');

    // 4. English homepage — Dark
    await capture('04-en-home-dark', '/en', viewportDesktop, 'dark');

    // 5. Arabic services — Light
    await capture('05-ar-services-light', '/services', viewportDesktop, 'light');

    // 6. Arabic services — Dark
    await capture('06-ar-services-dark', '/services', viewportDesktop, 'dark');

    // 7. English service detail (custom-software) — Light
    await capture('07-en-service-detail-light', '/en/services/custom-software', viewportDesktop, 'light');

    // 8. English service detail (custom-software) — Dark
    await capture('08-en-service-detail-dark', '/en/services/custom-software', viewportDesktop, 'dark');

    // 9. Arabic about — Light
    await capture('09-ar-about-light', '/about', viewportDesktop, 'light');

    // 10. Arabic about — Dark
    await capture('10-ar-about-dark', '/about', viewportDesktop, 'dark');

    // 11. English contact — Light
    await capture('11-en-contact-light', '/en/contact', viewportDesktop, 'light');

    // 12. English contact — Dark
    await capture('12-en-contact-dark', '/en/contact', viewportDesktop, 'dark');

    // 13. Arabic 404 — Light
    await capture('13-ar-404-light', '/xyz-not-a-page', viewportDesktop, 'light');

    // 14. English 404 — Dark
    await capture('14-en-404-dark', '/en/xyz-not-a-page', viewportDesktop, 'dark');

    // 15. Arabic mobile homepage — 375px Light
    await capture('15-ar-home-mobile-light', '/', viewportMobile, 'light');

    // 16. Arabic mobile homepage — 375px Dark
    await capture('16-ar-home-mobile-dark', '/', viewportMobile, 'dark');

    // 17. English mobile contact — 375px Light
    await capture('17-en-contact-mobile-light', '/en/contact', viewportMobile, 'light');

    // 18. English mobile contact — 375px Dark
    await capture('18-en-contact-mobile-dark', '/en/contact', viewportMobile, 'dark');

    // 19. Arabic tablet navigation open — 768px
    await capture('19-ar-nav-open-tablet', '/', viewportTablet, 'light', openMobileNav);

    // 20. English tablet navigation open — 768px
    await capture('20-en-nav-open-tablet', '/en', viewportTablet, 'light', openMobileNav);

  } catch (e) {
    console.error('SUITE ERROR:', e.message, e.stack);
    failed++;
  }

  await cdp.close();

  console.log(`\n== RESULT: ${captured} captured, ${failed} failed ==\n`);
  if (failed > 0) process.exit(1);
};

void main();