/**
 * Theme system verification (Phase 5 visual rebuild §17B). Drives the real
 * bootstrap + toggle through headless Chrome via CDP:
 *   1. explicit Light preference persists (reload + cross-route + locale switch)
 *   2. explicit Dark preference persists (reload + cross-route + locale switch)
 *   3. system Light behavior with no stored preference
 *   4. system Dark behavior with no stored preference
 *   5. Light fallback when the system preference cannot be read
 *   6. no incorrect-theme flash (bootstrap pins data-theme before first paint)
 *   7. reduced-motion behavior (entrance effects disabled, functional
 *      color transitions removed)
 * Run with the web dev server up:  node ./scripts/verify-theme.mjs [webBase]
 */
import { Cdp, sleep } from './cdp.mjs';

const WEB = process.argv[2] ?? `http://localhost:${process.env.WEB_PORT ?? '3000'}`;

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

const main = async () => {
  console.log(`\n== Theme verification (web ${WEB}) ==\n`);
  const cdp = await Cdp.launch(9223);
  // Wait until the toggle is hydrated (its accessible name is set post-mount).
  const waitHydrated = async () => {
    for (let i = 0; i < 40; i++) {
      const ready = await cdp.eval(`document.querySelector('.theme-toggle')?.getAttribute('aria-label') != null`);
      if (ready) return;
      await sleep(250);
    }
    throw new Error('theme toggle never hydrated');
  };
  try {
    await cdp.newTababoutBlank();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    /* ── 3+4. System preference, no stored choice ── */
    await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
    await cdp.goto(`${WEB}/`);
    let t = await cdp.eval(`document.documentElement.getAttribute('data-theme')`);
    check('no stored choice + system dark -> dark theme applied', t === 'dark', `data-theme=${t}`);

    await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
    await cdp.goto(`${WEB}/`);
    t = await cdp.eval(`document.documentElement.getAttribute('data-theme')`);
    check('no stored choice + system light -> light theme applied', t === 'light', `data-theme=${t}`);
    const stored = await cdp.eval(`localStorage.getItem('protocol-soft-theme')`);
    check('system-following does not write a stored preference', stored == null, `stored=${stored}`);

    /* ── 5. Light fallback when the system preference cannot be read ── */
    await cdp.eval(`window.matchMedia = undefined;`); // bootstrap try/catch must fall back to light
    await cdp.goto(`${WEB}/`);
    t = await cdp.eval(`document.documentElement.getAttribute('data-theme')`);
    check('unreadable system preference -> Light fallback', t === 'light', `data-theme=${t}`);

    /* ── 1. Explicit light preference: set via the REAL toggle, then persist ── */
    await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
    await cdp.goto(`${WEB}/`);
    await waitHydrated();
    await cdp.eval(`document.querySelector('.theme-toggle').click()`);
    t = await cdp.eval(`document.documentElement.getAttribute('data-theme')`);
    const s = await cdp.eval(`localStorage.getItem('protocol-soft-theme')`);
    check('toggle from system-dark -> explicit light stored', t === 'light' && s === 'light', `theme=${t} stored=${s}`);
    // Accessible name describes the action (switch back to dark)
    const toggleName = await cdp.eval(`document.querySelector('.theme-toggle').getAttribute('aria-label')`);
    check('toggle accessible name announces the ACTION (AR)', toggleName === 'التبديل إلى المظهر الداكن', `aria-label=${toggleName}`);

    await cdp.goto(`${WEB}/services`);
    t = await cdp.eval(`document.documentElement.getAttribute('data-theme')`);
    check('light preference survives route navigation', t === 'light', `data-theme=${t}`);
    await cdp.goto(`${WEB}/en/about`);
    t = await cdp.eval(`document.documentElement.getAttribute('data-theme')`);
    check('light preference survives locale switch (AR->EN)', t === 'light', `data-theme=${t}`);

    /* ── 2. Explicit dark preference ── */
    await waitHydrated();
    await cdp.eval(`document.querySelector('.theme-toggle').click()`);
    t = await cdp.eval(`document.documentElement.getAttribute('data-theme')`);
    const s2 = await cdp.eval(`localStorage.getItem('protocol-soft-theme')`);
    check('EN toggle -> explicit dark stored', t === 'dark' && s2 === 'dark', `theme=${t} stored=${s2}`);
    const toggleNameEn = await cdp.eval(`document.querySelector('.theme-toggle').getAttribute('aria-label')`);
    check('toggle accessible name announces the ACTION (EN)', toggleNameEn === 'Switch to light theme', `aria-label=${toggleNameEn}`);
    await cdp.goto(`${WEB}/`);
    t = await cdp.eval(`document.documentElement.getAttribute('data-theme')`);
    check('dark preference survives locale switch (EN->AR)', t === 'dark', `data-theme=${t}`);

    /* Live OS change is IGNORED once an explicit choice exists */
    await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
    await sleep(400);
    t = await cdp.eval(`document.documentElement.getAttribute('data-theme')`);
    check('explicit choice wins over live OS preference change', t === 'dark', `data-theme=${t}`);

    /* ── 6. No incorrect-theme flash ── */
    const html = await (await fetch(`${WEB}/`)).text();
    const bodyStart = html.indexOf('<body>');
    const firstScript = html.indexOf('<script>', bodyStart);
    const scriptEnd = html.indexOf('</script>', firstScript);
    const bootstrap = html.slice(firstScript, scriptEnd);
    const preScript = html.slice(bodyStart + 6, firstScript);
    check('theme bootstrap is the first script in <body>, behind only hidden dev markers',
      firstScript >= 0 && preScript.trim().startsWith('<div hidden="') && preScript.replace(/<div hidden="">.*?<\/div>/g, '').trim() === '',
      `pre=${JSON.stringify(preScript.slice(0, 60))}`);
    check('bootstrap reads stored choice before OS preference', bootstrap.includes("localStorage.getItem(k)") && bootstrap.indexOf('protocol-soft-theme') < bootstrap.indexOf('prefers-color-scheme'));
    check('bootstrap catches storage failure -> light', bootstrap.includes("catch(e){document.documentElement.setAttribute('data-theme','light')"));

    /* Early-DOM check: data-theme is already pinned at the earliest poll moment.
       The early-poll script is injected BEFORE the next navigation so it runs
       before the page's own bootstrap. */
    await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
    await cdp.goto(`${WEB}/`);
    await cdp.eval(`localStorage.setItem('protocol-soft-theme','dark')`);
    const pollScript = await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `window.__themePoll=[];const iv=setInterval(()=>{const v=document.documentElement&&document.documentElement.getAttribute('data-theme');if(v)window.__themePoll.push(v);},1);addEventListener('DOMContentLoaded',()=>clearInterval(iv));`,
    });
    await cdp.goto(`${WEB}/`);
    const poll = await cdp.eval(`window.__themePoll`);
    const sawAnyEarly = Array.isArray(poll) && poll.length > 0;
    const sawDarkEarly = Array.isArray(poll) && poll.length > 0 && poll.every((v) => v === 'dark');
    check('data-theme is dark at every early poll (no light flash)', sawAnyEarly && sawDarkEarly, `poll=${JSON.stringify(poll?.slice(0, 8))}`);
    await cdp.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: pollScript.identifier });

    /* ── 7. Reduced motion ── */
    await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }, { name: 'prefers-color-scheme', value: 'light' }] });
    await cdp.goto(`${WEB}/services`);
    const rm = await cdp.eval(`(() => {
      const reveal = document.querySelector('[data-reveal]');
      const cs = getComputedStyle(reveal);
      const bodyCs = getComputedStyle(document.body);
      return {
        scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
        revealOpacity: cs.opacity,
        revealTransition: cs.transitionDuration,
        bodyTransition: bodyCs.transitionDuration,
        revealVisible: reveal.getBoundingClientRect().height > 0,
      };
    })()`);
    check('reduced motion: scroll-behavior forced to auto', rm.scrollBehavior === 'auto', rm.scrollBehavior);
    check('reduced motion: entrance effect disabled (content immediately visible)', Number(rm.revealOpacity) === 1 && rm.revealVisible, `opacity=${rm.revealOpacity}`);
    check('reduced motion: transition durations ~0', parseFloat(rm.revealTransition) < 0.001 && parseFloat(rm.bodyTransition) < 0.001, `reveal=${rm.revealTransition} body=${rm.bodyTransition}`);

    /* Without reduced motion the entrance is JS-gated and reveals on intersection */
    await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
    await cdp.goto(`${WEB}/services`);
    const mot = await cdp.eval(`(() => {
      const reveal = document.querySelector('[data-reveal]');
      return {
        htmlHasJs: document.documentElement.classList.contains('js'),
        initialOpacity: getComputedStyle(reveal).opacity,
        isVisibleClass: reveal.classList.contains('is-visible'),
      };
    })()`);
    check('JS present: entrance effect armed (html.js)', mot.htmlHasJs === true);
    // The services page renders only ONE [data-reveal] group (the services list)
    // and it sits below the fold until scroll. The first paint must hide it (the
    // whole point of JS-gated entrance); scrolling into view must reveal it.
    check('entrance hides content pre-scroll (opacity < 1)', Number(mot.initialOpacity) < 1, `opacity=${mot.initialOpacity}`);
    // Scroll the reveal into view and confirm the observer adds .is-visible.
    await cdp.eval(`document.querySelector('[data-reveal]').scrollIntoView({ block: 'center' })`);
    for (let i = 0; i < 20; i++) {
      const v = await cdp.eval(`document.querySelector('[data-reveal]').classList.contains('is-visible')`);
      if (v) break;
      await sleep(150);
    }
    const revealed = await cdp.eval(`document.querySelector('[data-reveal]').classList.contains('is-visible')`);
    check('entrance reveals once via observer (section in view gets .is-visible)', revealed === true, `visible=${revealed}`);

    await cdp.close();
  } catch (e) {
    await cdp.close();
    console.error('SUITE ERROR:', e.message);
    failed++;
  }

  console.log(`\n== RESULT: ${passed} passed, ${failed} failed ==\n`);
  process.exit(failed === 0 ? 0 : 1);
};

void main();
