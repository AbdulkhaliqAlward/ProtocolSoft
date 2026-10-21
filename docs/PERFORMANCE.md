# Performance — measurements and decisions

All numbers come from production builds (`next build` + `next start`) on the local stack, with the CMS also in production mode. Lighthouse 12.8.2, mobile preset; "simulated" is the standard Lighthouse score (Lantern, slow 4G + 4× CPU); "applied" uses real DevTools throttling. Scores move ±3–5 between runs.

## Before / after

| | Before (Next 15, dynamic pages) | After |
|---|---|---|
| Rendering | every page `ƒ` dynamic, rendered on each request | every page `●` static/ISR, cached per CMS tag |
| Server response (TTFB, warm) | 60–125 ms | **5–12 ms** (cache HIT) |
| Lighthouse Performance (simulated) | 82–85 | **85–91** |
| First Contentful Paint (simulated) | 2.1–2.9 s | **1.2 s** |
| Largest Contentful Paint (simulated) | 3.1–3.9 s | 3.1–3.7 s |
| LCP, observed unthrottled | — | **0.57 s** (headline paints with the first frame) |
| Total Blocking Time (simulated) | 130–290 ms | 80–240 ms |
| CLS | 0–0.001 | 0 |
| Accessibility / Best Practices / SEO | 100 / 100 / 100 | 100 / 100 / 100 |
| Font files on first view | 7 static files (~330 KB incl. Inter on Arabic pages) | 1 preloaded headline face (2 subsets) + reading faces as `optional` |
| Layout work on slow 4G (4× CPU) | — | 908 ms → **530 ms** after the font strategy |

## What changed and why

1. **Static/ISR pages.** The locale now comes from the URL segment (`app/[locale]` is the root layout) instead of request headers, which had forced every page to be dynamic. CMS reads are cached with tags (`services`, `pages`, `homepage`, `site-settings`, …) and a 1-hour safety refresh; the CMS publish webhook expires the tags immediately (verified: HIT → MISS → HIT after a publish).
2. **Outages never get cached.** Only a CMS 404 ("not published") becomes an empty section (`getOptional`); any other failure throws, so Next keeps serving the last good page.
3. **Fonts.** `next/font` self-hosts at build time. Measured: each late font swap relays out the whole page (≈750 ms of layout on slow 4G). Only the headline face (Readex Pro) swaps and is preloaded; IBM Plex Sans Arabic / Sans / Mono use `display: optional` — no swap, cached for the next view.
4. **Motion cost.** Section entrances are armed once by `MotionInit` (marks parts with `.rv`), so CSS uses cheap single-class selectors; on-screen sections are never hidden; 0 KB animation library.
5. **Contact page** reads `?service=` in the browser, so the page itself stays static.
6. **One URL per page:** `/ar/...` redirects (308) to the clean Arabic URL.

## What remains (honest)

- **Simulated LCP ~3.4 s.** Unthrottled, the headline paints with the first frame (0.57 s). Lighthouse's model on slow 4G counts every request that starts before LCP — mainly the React/Next runtime (~120 KB) and the headline font. Reaching a consistent 90+ would need either `display: optional` for the headline face too (brand face could be missing on a slow first visit) or a lighter runtime; both are trade-offs for Protocol Soft to decide.
- **Applied-throttling TBT** stays high (~1.2–2.8 s on a 4×-slowed CPU) from hydration plus the headline font swap. Real mid-range phones sit between the simulated and applied numbers.
- **Next 16.4.2 renders `notFound()` content in the browser:** the 404 status and noindex are correct in the server response, and the branded 404 appears once JS runs (reproduced in a bare three-file Next app; re-check on the next Next.js release).

## Dev mode

Dev was slow mostly because of webpack. Next 16 uses Turbopack: dev server ready in ~1 s, first compile of a route 0.4–1.8 s, then 0.3–0.5 s. The CMS admin compiles on first visit per route; keep the CMS dev server running between sessions.
