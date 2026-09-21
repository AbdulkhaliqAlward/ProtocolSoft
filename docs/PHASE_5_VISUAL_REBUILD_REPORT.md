# Phase 5 Visual Rebuild — Final Report

**Date:** 2026-09-18
**Environment:** Local development only (web: http://localhost:3000, cms: http://localhost:3001)
**Status:** Complete — ready for Protocol Soft visual review

---

## 1. Scope Confirmation

- ✅ **Local development only** — No deployment, staging, or production work performed.
- ✅ **No Cloudflare changes** — No DNS, Access, Tunnel, WAF, or email configuration.
- ✅ **No backup changes** — Backup settings/records remain disabled by default (BD1).
- ✅ **No real data** — No real phone numbers, WhatsApp links, client data, lead data, or email recipients added.
- ✅ **No outbound mail** — Email adapter remains sink-only (LF-0000SINK).
- ✅ **No legal pages published** — `/privacy` and `/terms` return 404 while draft (LD1/D-2).
- ✅ **No case studies published** — `/case-studies` returns 404 (D-4).
- ✅ **No EDR public exposure** — EDR remains rejected server-side; absent from navigation, services, contact form, and public CTAs (D-2/D-3/D-4).
- ✅ **Security boundaries preserved** — Public-content isolation, Payload isolation, preview security, RBAC, media screening, contact-form validation, rate-limit behavior, audit controls, secrets handling, and backup defaults all unchanged.
- ✅ **No Phase 6 work started** — This report concludes Phase 5.

---

## 2. Exact Files Changed

### Design System & Styles
| File | Purpose |
|------|---------|
| `apps/web/src/app/globals.css` | Complete "Trusted Ink & Stone" design tokens (Light/Dark), typography scale, spacing, motion, component styles (buttons, cards, forms, header, footer, hero, service panels, CTA band, etc.), RTL/LTR logical properties, reduced-motion support. |

### Theme System
| File | Purpose |
|------|---------|
| `apps/web/src/app/layout.tsx` | Root layout with pre-paint theme bootstrap script (stored choice → OS preference → Light), `js` class for motion gating, `suppressHydrationWarning` for theme attribute. |
| `apps/web/src/components/ThemeToggle.tsx` | Accessible theme toggle with localized action labels ("Switch to dark theme" / "التبديل إلى المظهر الداكن"), icon + visible label, persists to `localStorage` (`protocol-soft-theme`), respects reduced motion. |

### Header & Navigation
| File | Purpose |
|------|---------|
| `apps/web/src/components/SiteHeader.tsx` | Compact corporate header: text wordmark (no fake logo), D-3 navigation (AR: الخدمات \| من نحن \| تواصل معنا \| English; EN: Services \| About \| Contact \| العربية), CTA to Contact, theme toggle, mobile/tablet drawer (≤1023px) with focus management, Esc close, animated open/close. |
| `apps/web/src/components/siteChrome.ts` | Navigation constants (PRIMARY_NAV), localePath, switchHref, temporary BRAND wordmark. |

### Footer
| File | Purpose |
|------|---------|
| `apps/web/src/components/SiteFooter.tsx` | Purposeful dark section in both themes: brand + positioning statement, Services links (published only), Company links, Contact channels (hidden when empty), WhatsApp CTA (WA1 availability state), copyright, locale switch, conditional legal links (only when published). |

### Homepage
| File | Purpose |
|------|---------|
| `apps/web/src/app/[locale]/page.tsx` | Editorial hero (kicker, headline, subheadline, primary CTA, secondary link, copper rule, trust row), Value statement + differentiators (card--feature grid), Services overview (card grid from published services), Why items (card--feature), Methodology (copper-numbered steps), Secure by design (editorial section + soft CTA), Final CTA band. All sections data-driven with honest empty states. |

### Services Overview
| File | Purpose |
|------|---------|
| `apps/web/src/app/[locale]/services/page.tsx` | Page header (kicker + h1 + lead), Service panels (index \| body \| CTA grid at ≥768px, stacked <768px), CTA band. |

### Service Detail
| File | Purpose |
|------|---------|
| `apps/web/src/app/[locale]/services/[slug]/page.tsx` | Breadcrumb hero, Overview (RichText), Deliverables (check-list), Capabilities (chips), Process timeline (copper-numbered), FAQ (native details/summary), Initiative card (if enabled), Other services strip, CTA band. |

### About
| File | Purpose |
|------|---------|
| `apps/web/src/app/[locale]/about/page.tsx` | Page header, PageBlocks renderer for published content (rich text, feature grid, FAQ, CTA banner, mediaText), honest empty state when draft, CTA band. |

### Contact
| File | Purpose |
|------|---------|
| `apps/web/src/app/[locale]/contact/page.tsx` | Page header, balanced two-column split (form \| direct channels aside) collapsing <1024px, ContactForm with preselected service via `?service=`, WhatsApp CTA (WA1), address/working hours when configured, "After you send" process steps (approved copy only). |
| `apps/web/src/components/ContactForm.tsx` | Required fields (name, work email, service interest [4 options, no EDR], message, privacy consent), optional (phone, company), honeypot, validation, idempotency, loading/success/error states, secrets guidance, accessible choice tiles (border + tint + tick, never color alone). |

### Components & Utilities
| File | Purpose |
|------|---------|
| `apps/web/src/components/ui.tsx` | Icon (stroke=currentColor), SectionHeading, EmptyState, CtaBand. |
| `apps/web/src/components/MotionInit.tsx` | IntersectionObserver scroll-reveal for `[data-reveal]` (once, no re-animation, respects reduced-motion). |
| `apps/web/src/components/InitiativeCard.tsx` | Compact dashed card for In-Development initiative (badge, no CTA, no links). |
| `apps/web/src/components/RichText.tsx` | Minimal Lexical renderer (paragraphs, headings, lists, bold/italic/underline, links, bidi isolation). |
| `apps/web/src/components/WhatsAppCta.tsx` | WA1: active link when configured, unavailable state with localized message when not. |
| `apps/web/src/components/PageBlocks.tsx` | Blocks renderer for Pages collection (contentRichText, featureGrid, faqAccordion, ctaBanner, mediaText via gated proxy). |

### Error & Loading States
| File | Purpose |
|------|---------|
| `apps/web/src/app/[locale]/not-found.tsx` | Bilingual 404: oversized mono code, honest apology, actions (home, services, contact). |
| `apps/web/src/app/[locale]/error.tsx` | Client error boundary: bilingual panel, retry button, contact fallback. |
| `apps/web/src/app/globals.css` | `.loading-panel` (honest skeleton), `.empty-state`, `.error-panel`. |

### Verification Scripts (existing, run and passed)
| File | Purpose |
|------|---------|
| `apps/web/scripts/verify-public-pages.mjs` | 68 checks: locale routing, D-3 nav, D-4 absence, D-5 form, published-only gates, 404, SEO, lead path E2E, media proxy, CMS isolation. **68/68 passed**. |
| `apps/web/scripts/verify-theme.mjs` | 22 checks: system preference, explicit preference persistence, cross-route/locale, no-flash bootstrap, reduced motion. **22/22 passed**. |
| `apps/web/scripts/verify-rtl-ltr.mjs` | 23 checks: document direction, header layout, locale switch, mobile drawer contract, form labels/selection, bidi islands, footer alignment, service-card reading order, no horizontal scroll. **23/23 passed**. |
| `apps/web/scripts/verify-no-db.mjs` | Confirms web service has no DB credentials/imports. **Passed**. |
| `apps/web/scripts/capture-screenshots.mjs` | New script for §17D: captures all 20 required screenshots via CDP. **20/20 captured**. |

### Contrast Audit
| File | Purpose |
|------|---------|
| `docs/contrast-audit.mjs` | WCAG 2.1 AA audit of all token pairs (Light + Dark). **All measured pairs PASS**. |

---

## 3. Design Rebuild Explanation

### How the Empty/Placeholder Design Was Removed
- **Hero:** Replaced empty decorative blocks with editorial composition — kicker, strong headline, concise subheadline, primary CTA, optional secondary link, copper structural rule, trust-row with meaningful trust signals (partner, security, bilingual). No fake dashboards, grids, circles, or placeholder rectangles.
- **Services:** Replaced generic SaaS cards with editorial service panels — copper service number (IBM Plex Mono), generous description, clear CTA. Consistent grid at desktop (≥768px), stacked on mobile.
- **Header:** Replaced cramped/weak header with confident corporate bar — readable nav text (16px+), persistent underline active indicator (non-color-only), integrated theme toggle (not dominant), proper mobile/tablet drawer with focus management.
- **Dark Sections:** Footer and dark-theme hero are now purposeful, populated sections with strong contrast and meaningful content — not empty colored rectangles.
- **Arabic Typography:** Noto Sans Arabic at 18px body (17px min), 1.8 line-height, 700-weight headings with 1.35 line-height. No tiny/weak Arabic text.
- **Buttons:** Four-variant system (primary, secondary, soft, ghost) with modest 4px radius, 46px min-height, clear hover/active/focus/disabled states. No oversized pills.
- **Footer:** Complete 4-column grid (brand + positioning, Services, Company, Contact) with WhatsApp WA1 state, conditional legal links, locale switch, copyright. Collapses responsively.
- **Motion:** Subtle, purposeful — theme transitions (180ms), drawer animation, scroll-reveal (opacity + 14px translate, once), FAQ accordion, button press feedback. All disabled under `prefers-reduced-motion`.

### Homepage Changes
- Editorial hero with trust-row (no fake metrics)
- Value statement + differentiators grid (card--feature)
- Services overview from published data (card grid)
- Why items (card--feature) only when CMS supplies them
- Methodology steps with copper numbering
- Secure-by-design editorial section with soft CTA to cybersecurity
- Final CTA band with direct channels when configured

### Services Changes
- Service list: panels with [index \| body \| CTA] editorial layout, hover strengthens top rule
- Service detail: breadcrumb hero, RichText overview, deliverables, capabilities chips, timeline, FAQ accordion, related services strip

### Contact Page Changes
- Balanced two-column split (form \| channels aside) — channels column has equal visual weight
- Form: generous field spacing, 16px+ labels/inputs, accessible choice tiles (4 services, no EDR)
- Direct channels: only renders when real values exist (no empty placeholders)
- Process preview: "After you send" steps using approved copy only

### Header Changes
- Text wordmark only (BRAND.name from siteChrome.ts)
- Exact D-3 navigation (3 items + locale switch)
- Theme toggle with visible label + icon, accessible action name
- CTA to Contact (btn--primary)
- Mobile/tablet drawer (≤1023px) with focus management, Esc close, smooth animation

### Footer Changes
- Dark section in BOTH themes (not just dark mode)
- 4-column grid: brand/positioning, Services, Company, Contact
- WhatsApp CTA always visually present (WA1 availability state)
- Conditional legal links (only when published)
- Locale switch in footer bottom bar
- Responsive collapse (2-col tablet, 1-col mobile)

### Mobile Changes
- Header drawer at ≤1023px (not just ≤767px) — enables 768px nav-open screenshots
- All touch targets ≥44×44px
- Form collapses to single column, choice tiles full-width
- Service panels stack (index/body/CTA vertical)
- No horizontal scroll at 375px (verified)
- Arabic body 18px, English 17px — no critical text below 16px

### Inspiration from Aldikka (Quality Principles Only)
- **Content density with purpose:** Every section answers a visitor question (what we do, who for, what problem, what delivered, how to engage, why trust, what next).
- **Clear journey:** Hero → Value → Services → Methodology → Trust → CTA.
- **Decision-making information in cards:** Service panels show title + description + CTA, not generic "Learn more".
- **Rhythm and pacing:** Consistent section spacing (--sp-9), hairline dividers, copper rules for structure.
- **CTA placement:** Primary CTA in hero, secondary in hero, service panels, final band — intentional, not repetitive.
- **Real business feel:** No fake dashboards, metrics, testimonials, or placeholder imagery. Honest empty states when content unpublished.

---

## 4. Final Token Tables

### Light Theme (Exact §3.1 + Documented Derivations)

| Token | Value | Use |
|-------|-------|-----|
| `--color-bg` | `#F7F5F0` | Warm stone page background |
| `--color-surface` | `#FCFBF8` | Primary content surface |
| `--color-surface-raised` | `#FFFFFF` | Elevated cards/forms |
| `--color-text` | `#17232D` | Deep ink text |
| `--color-text-muted` | `#53616B` | Secondary readable text |
| `--color-primary` | `#24557A` | Muted ink blue (main interaction) |
| `--color-primary-hover` | `#193F5D` | |
| `--color-primary-active` | `#12334D` | |
| `--color-on-primary` | `#FFFFFF` | |
| `--color-secondary` | `#416D6C` | Quiet teal (limited) |
| `--color-secondary-hover` | `#315856` | |
| `--color-accent` | `#A46342` | Warm copper (editorial accent only) |
| `--color-accent-hover` | `#864B2F` | |
| `--color-border` | `#D5D4CE` | |
| `--color-border-strong` | `#AFB4B2` | |
| `--color-focus` | `#1B5A86` | |
| `--color-success` | `#246B4A` | |
| `--color-warning` | `#8A5A16` | |
| `--color-danger` | `#A63D3A` | |
| `--color-dark-section` | `#172C3C` | Deep ink (footer, dark hero) |
| `--color-on-dark` | `#F7F5F0` | |
| `--color-on-dark-muted` | `#C7D0D2` | |

**Documented Derivations (measured for WCAG):**
| Token | Value | Reason |
|-------|-------|--------|
| `--color-accent-text` | `#864B2F` | Copper darkened for small TEXT (≥4.5:1) |
| `--color-border-field` | `#64717B` | Interactive control borders (≥3:1 on stone) |
| `--color-accent-on-dark` | `#D9A182` | Copper inside dark section |
| `--color-focus-on-dark` | `#A9CFE8` | Focus ring inside dark section |
| `--color-surface-subtle` | `#EEF0EB` | Quiet tonal layer |

### Dark Theme (Exact §3.2 + Documented Derivations)

| Token | Value | Use |
|-------|-------|-----|
| `--color-bg` | `#121E28` | Deep slate/ink (not black) |
| `--color-surface` | `#192B37` | |
| `--color-surface-raised` | `#223845` | |
| `--color-text` | `#F2F0EA` | Warm off-white text |
| `--color-text-muted` | `#C1CBD0` | |
| `--color-primary` | `#9CC4DC` | Soft mineral blue |
| `--color-primary-hover` | `#C0DDEC` | |
| `--color-primary-active` | `#D5E8F2` | |
| `--color-on-primary` | `#132633` | |
| `--color-secondary` | `#9AC1BB` | Restrained teal |
| `--color-secondary-hover` | `#B9D9D4` | |
| `--color-accent` | `#D5A07A` | Muted warm copper |
| `--color-accent-hover` | `#E2B594` | |
| `--color-border` | `#38505C` | |
| `--color-border-strong` | `#526A75` | |
| `--color-focus` | `#B8DDF0` | |
| `--color-success` | `#8FC7A3` | |
| `--color-warning` | `#D9B46D` | |
| `--color-danger` | `#E89288` | |
| `--color-dark-section` | `#0F1A22` | Deeper ink (footer, dark hero) |
| `--color-on-dark` | `#F2F0EA` | |
| `--color-on-dark-muted` | `#C1CBD0` | |

**Documented Derivations (measured for WCAG):**
| Token | Value | Reason |
|-------|-------|--------|
| `--color-accent-text` | `#E2B594` | Copper text on dark (≥4.5:1) |
| `--color-border-field` | `#8C9DA6` | Interactive borders (≥3:1) |
| `--color-accent-on-dark` | `#D5A07A` | Copper graphic in dark section |
| `--color-focus-on-dark` | `#B8DDF0` | Focus ring in dark section |
| `--color-surface-subtle` | `#16242E` | Quiet tonal layer |

### Semantic Usage Rules (Enforced)
- **Warm stone** (`--color-bg`) = default light page background. Never pure white.
- **Ink blue** (`--color-primary`) = principal CTA, key links, active nav, focus, essential interactions.
- **Quiet teal** (`--color-secondary`) = secondary badges, small icons, metadata, supporting controls only.
- **Copper** (`--color-accent`/`--color-accent-text`) = editorial accent only (service numbers, kickers, small labels). Never main CTA.
- **Dark sections** = purposeful only (footer both themes, dark-theme hero). No large empty dark areas.
- **No gradients** except imperceptible tonal surface variation. No neon, glow, glassmorphism, blueprint grids, decorative geometry.
- **Every state** understandable without color alone (borders, icons, text, underlines).

### No Deviations from Approved Baselines
All tokens match §3.1/§3.2 exactly. Derivations documented and measured in contrast audit.

---

## 5. Typography Report

### Font Families (Self-Hosted, `/fonts/`, No Third-Party Requests)

| Family | Files | Weights | License | Source |
|--------|-------|---------|---------|--------|
| **Noto Sans Arabic** | `NotoSansArabic-arabic.woff2` | 400–700 (variable) | SIL OFL 1.1 | Google Fonts CSS API v2, arabic subset |
| **Source Sans 3** | `SourceSans3-latin.woff2`, `SourceSans3-latin-ext.woff2` | 400–700 (variable) | SIL OFL 1.1 | Google Fonts CSS API v2, latin + latin-ext subsets |
| **IBM Plex Mono** | `IBMPlexMono-Regular.woff2`, `IBMPlexMono-Medium.woff2` | 400, 500 | SIL OFL 1.1 | Google Fonts / IBM Plex GitHub |

**Font Loading Strategy:**
- `@font-face` with `font-display: swap` in globals.css
- Unicode-range subsetting for optimal loading
- Reliable system fallbacks declared (`Segoe UI`, `Tahoma`, `system-ui`)
- Preload not required (fonts served same-origin, small variable files)

### Hierarchy (Approved §4)

| Role | Desktop | Mobile | Weight | Line-Height | Font |
|------|---------|--------|--------|-------------|------|
| Hero title (AR) | `clamp(44px, 5vw, 68px)` | `clamp(34px, 10vw, 44px)` | 700 | 1.15–1.30 | Noto Sans Arabic |
| Hero title (EN) | `clamp(44px, 4.6vw, 64px)` | `clamp(34px, 10vw, 44px)` | 700 | 1.15 | Source Sans 3 |
| Page title (h1) | `clamp(36px, 4vw, 52px)` | ~38px | 700 | 1.20 (AR 1.35) | Per locale |
| Section title (h2) | `clamp(29px, 3vw, 40px)` | ~32px | 700 | 1.20 (AR 1.35) | Per locale |
| Card title (h3) | 22px | 22px | 600 | 1.20 | Per locale |
| Arabic body | 18px | 16px | 400 | 1.80 | Noto Sans Arabic |
| English body | 17px | 16px | 400 | 1.60 | Source Sans 3 |
| Supporting text | 15px | 15px | 400 | 1.60 | Per locale |
| Buttons/inputs | 16px | 16px | 600 | — | Per locale |
| Metadata/kickers | 14px | 14px | 500 | 1.60 | IBM Plex Mono |

**Arabic-Specific Rules:**
- Never uppercase Arabic
- No aggressive letter-spacing (kicker: 0.06em only on mono)
- Generous line-height (1.8 body)
- Bidi islands: `.bidi { unicode-bidi: plaintext }` for Latin fragments (emails, URLs, codes)

---

## 6. Theme System Report

### Precedence Flow
1. **Explicit user preference** — Stored in `localStorage` as `protocol-soft-theme` (`light`|`dark`).
2. **OS preference** — `window.matchMedia('(prefers-color-scheme: dark)')` when no stored choice.
3. **Light fallback** — If storage unavailable or OS preference unreadable.

### Persistence Mechanism
- Key: `protocol-soft-theme` (only client-side storage in the app)
- Written on toggle click via `localStorage.setItem()`
- Survives route navigation and locale switches (verified)
- Private-mode safe: try/catch, theme still applies for session

### No-Flash Strategy
- **Bootstrap script** in `layout.tsx` runs as first `<body>` child (inline `<script dangerouslySetInnerHTML>`)
- Reads stored choice → OS preference → Light, sets `documentElement.setAttribute('data-theme', ...)`
- Adds `html.js` class for motion gating
- `suppressHydrationWarning` on `<html>` (React never manages `data-theme`)
- **Verified:** Early-poll CDP check confirms `data-theme` pinned at every poll before paint (no light flash when dark stored).

### Toggle Accessibility
- **Visible label:** Shows active theme ("Light"/"Dark" / "فاتح"/"داكن")
- **Accessible name (aria-label):** Describes the ACTION — "Switch to dark theme" / "التبديل إلى المظهر الداكن" (when light), "Switch to light theme" / "التبديل إلى المظهر الفاتح" (when dark)
- **Icon + text** (not emoji-only)
- **Touch target:** 44×44px minimum
- **Keyboard operable:** Standard `<button>`, focus ring visible
- **RTL/LTR:** Works in both directions
- **Reduced motion:** No animated swap (instant color transition only)

### Reduced Motion Handling
- CSS `@media (prefers-reduced-motion: reduce)` disables:
  - `scroll-behavior: smooth` → `auto`
  - All entrance transitions (`[data-reveal]` opacity/transform)
  - Theme transitions (set to 0.01ms)
  - FAQ accordion animation
- JS `IntersectionObserver` bails early, adds `.is-visible` immediately
- **Verified:** CDP suite confirms all reduced-motion checks pass.

---

## 7. Animation Report

| Component | Interaction | Purpose | Duration/Easing | Reduced Motion |
|-----------|-------------|---------|-----------------|----------------|
| **Theme switch** | Color/background/border transition | Smooth theme change without flash | 180ms, `cubic-bezier(0.16, 1, 0.3, 1)` | Disabled (0.01ms) |
| **Mobile/tablet drawer** | Open/close (opacity + translateY) | Reveal navigation panel | 180ms, ease-out | Disabled (instant) |
| **Nav links (desktop)** | Underline scaleX(0→1) | Active/hover indication | 150ms, ease-out | Disabled |
| **Buttons** | Background/border/color + translateY(1px) active | Press feedback | 150ms, ease-out | Disabled |
| **Service panels** | Border-color strengthening (top rule) | Subtle hover affordance | 150ms, ease-out | Disabled |
| **Scroll reveal** `[data-reveal]` | Opacity 0→1 + translateY(14px→0) | Progressive disclosure of major sections | 260ms, ease-out, once per element | Disabled (opacity=1, no transform) |
| **FAQ accordion** | Content fade-in (opacity + translateY(-4px)) | Smooth disclosure | 180ms, ease-out | Disabled (instant) |
| **Choice tiles** | Border + tint + tick appear | Selected state (never color alone) | 150ms, ease-out | Disabled |

**Implementation:** Pure CSS transitions + `MotionInit` IntersectionObserver (no animation library). Content visible without JS (`.js` class gates hidden state).

---

## 8. Accessibility & Contrast Report

### Contrast Ratios (WCAG 2.1 AA) — All PASS

**Light Theme:** 25/25 measured pairs pass (min 4.5:1 text, 3:1 UI). Worst: Copper rule on bg 4.34:1 (≥3:1 non-text), Field border 4.60:1 (≥3:1).

**Dark Theme:** 25/25 measured pairs pass. Worst: Field border on raised 4.35:1 (≥3:1), Danger text on banner 4.65:1 (≥4.5:1).

**Derivations validated:** `--color-accent-text`, `--color-border-field`, `--color-accent-on-dark`, `--color-focus-on-dark` all measured against actual `color-mix()` backgrounds.

### Keyboard & Focus
- **Skip link** present (first focusable element)
- **Visible focus rings** on all interactive elements (2px outline, 2px offset)
- **Dark-section focus** uses `--color-focus-on-dark` (≥3:1 verified)
- **Full keyboard operability:** Header nav, mobile drawer, theme toggle, service links, contact form, choice tiles, FAQ accordion, footer links

### Screen Reader & ARIA
- **Semantic heading order:** h1 → h2 → h3 per page
- **Landmarks:** `<header>`, `<main id="main">`, `<footer>`, `<nav aria-label>`, `<aside aria-label>`
- **Form labels:** Always visible (`<label>`), placeholders never replace labels
- **Validation:** `aria-invalid`, `aria-describedby` linking errors/helpers, `role="alert"` on error banner
- **Status:** `role="status"` on success, `aria-live` via `role="alert"`/`status`
- **Icons:** `aria-hidden="true"` + `focusable="false"` (decorative), meaningful icons would have labels
- **Bidi isolation:** `.bidi { unicode-bidi: plaintext }` on emails, URLs, reference codes

### RTL/LTR Correctness (Verified by CDP Suite)
- **Document:** `lang="ar" dir="rtl"` / `lang="en" dir="ltr"` (middleware + root layout)
- **Header:** Brand at start edge (right in RTL, left in LTR), controls at end edge
- **Locale switch:** Preserves path, flips direction
- **Mobile drawer:** Slides from start edge, RTL-aware
- **Forms:** Email/phone inputs forced `dir="ltr"` for bidi-safe entry
- **Service panels:** Grid columns [index \| body \| CTA] reverse in RTL (index right, CTA left)
- **Footer:** Grid direction matches document (RTL/LTR)
- **Mixed content:** Latin fragments isolated via `.bidi`

### Responsive (Verified)
- **375px:** No horizontal overflow (AR home, EN contact)
- **768px:** Tablet nav-open captured, layout adapts
- **1024px+:** Full desktop layout
- **Container:** 1280px max, 32px/24px/16px padding (desktop/tablet/mobile)

### Known Accessibility Limitations
- **Legal pages unpublished** — 404 by design (LD1/D-2). When published, will need full accessibility review.
- **Case studies** — No public route in Phase 5 (D-4). Future phase will need detail-page accessibility.
- **Preview mode** — Fragment-only, noindex, no-referrer, no-store (unchanged from Phase 4).

---

## 9. Screenshots

All 20 required screenshots captured and stored under:
`docs/screenshots/phase5-visual-rebuild/`

| # | File | Route | Viewport | Theme |
|---|------|-------|----------|-------|
| 1 | `01-ar-home-light.png` | `/` | 1440×900 | Light |
| 2 | `02-ar-home-dark.png` | `/` | 1440×900 | Dark |
| 3 | `03-en-home-light.png` | `/en` | 1440×900 | Light |
| 4 | `04-en-home-dark.png` | `/en` | 1440×900 | Dark |
| 5 | `05-ar-services-light.png` | `/services` | 1440×900 | Light |
| 6 | `06-ar-services-dark.png` | `/services` | 1440×900 | Dark |
| 7 | `07-en-service-detail-light.png` | `/en/services/custom-software` | 1440×900 | Light |
| 8 | `08-en-service-detail-dark.png` | `/en/services/custom-software` | 1440×900 | Dark |
| 9 | `09-ar-about-light.png` | `/about` | 1440×900 | Light |
| 10 | `10-ar-about-dark.png` | `/about` | 1440×900 | Dark |
| 11 | `11-en-contact-light.png` | `/en/contact` | 1440×900 | Light |
| 12 | `12-en-contact-dark.png` | `/en/contact` | 1440×900 | Dark |
| 13 | `13-ar-404-light.png` | `/xyz-not-a-page` | 1440×900 | Light |
| 14 | `14-en-404-dark.png` | `/en/xyz-not-a-page` | 1440×900 | Dark |
| 15 | `15-ar-home-mobile-light.png` | `/` | 375×812 | Light |
| 16 | `16-ar-home-mobile-dark.png` | `/` | 375×812 | Dark |
| 17 | `17-en-contact-mobile-light.png` | `/en/contact` | 375×812 | Light |
| 18 | `18-en-contact-mobile-dark.png` | `/en/contact` | 375×812 | Dark |
| 19 | `19-ar-nav-open-tablet.png` | `/` | 768×1024 | Light (drawer open) |
| 20 | `20-en-nav-open-tablet.png` | `/en` | 768×1024 | Light (drawer open) |

**Before/After Context:** Prior rejected version had empty hero, generic cards, weak header, sparse footer, no motion, placeholder geometry. This rebuild replaces all with editorial content, purposeful structure, consistent panel system, complete footer, meaningful motion, and zero decorative placeholders.

---

## 10. Test Results

### Existing Security/Public-Data/Media/Preview/Contact Suites

| Suite | Command | Result |
|-------|---------|--------|
| Public isolation (registry, published-state, DB truth) | `npm run verify:public-isolation` (cms) | **75/75 passed** (from PHASE_5_VERIFICATION.md) |
| Media delivery gate (D-1 full matrix) | `npm run verify:media` (cms) | **33/33 passed** (from PHASE_5_VERIFICATION.md) |
| Preview/public-content API | preview suite (cms) | **38/38 passed** (from PHASE_5_VERIFICATION.md) |
| Rendered public pages + form E2E | `node scripts/verify-public-pages.mjs` (web) | **68/68 passed** ✅ |
| Web build hygiene (no DB/deps leakage) | `npm run verify:no-db` (web) | **Passed** ✅ |
| Web typecheck | `npm run typecheck` (web) | **Clean** ✅ |
| CMS typecheck | `npm run typecheck` (cms) | **Pre-existing errors only** (verify-roles.ts AccessArgs, audit.ts collectionID) — **not introduced by Phase 5** |

### New Theme Tests (verify-theme.mjs)
**22/22 passed** — Explicit Light/Dark persistence, system preference, Light fallback, cross-route/locale, no-flash bootstrap, reduced motion.

### RTL/LTR Tests (verify-rtl-ltr.mjs)
**23/23 passed** — Document direction, header layout, locale switch, mobile drawer contract, form labels/selection, bidi islands, footer alignment, service-card reading order, no horizontal scroll.

### Accessibility Checks
- **Contrast audit:** All pairs PASS (Light + Dark)
- **Keyboard/focus:** All interactive elements reachable, visible focus rings
- **Screen reader:** Semantic headings, landmarks, labels, ARIA live regions, bidi isolation
- **RTL/LTR:** All 23 CDP checks pass
- **Responsive:** No horizontal scroll at 375px, touch targets ≥44px

### Legacy vs. New Issues
- **Legacy (pre-existing):** CMS typecheck has 2 errors in `verify-roles.ts` and `audit.ts` from Phase 4 scripts — unrelated to visual rebuild.
- **New issues introduced by Phase 5:** **None**. All new verification suites pass.

---

## 11. Known Limitations

1. **Legal pages remain draft** — `/privacy` and `/terms` return 404 (LD1/D-2). Will need content entry and publication in a future phase before launch.
2. **Case studies unpublished** — `/case-studies` returns 404, no detail route exists (D-4). Gate-passing readiness logic exists in CMS but no public UI until Phase 7+.
3. **EDR initiative** — Remains draft, "In Development" badge only, no public CTA/claims (D-2). Internal code path preserved for future.
4. **No real contact data** — Contact channels (email, phone, WhatsApp, address, hours) hidden when empty per §6.9. Real values require CMS configuration at staging/production.
5. **No staging/production deployment** — This work is local-only. Production launch requires Cloudflare Access+MFA+tunnel (B1–B6), production rate-limit layer (WAF/Redis), encrypted backups + restore drill (BD1), DNS cutover (roadmap Phase 11).
6. **Hero background pattern** — `backgroundPattern: 'blueprint_grid'` in CMS but not visually rendered in current hero (text-led per approved direction). Available for future enhancement if approved.
7. **Preview fragment** — Remains noindex, no-referrer, no-store (unchanged).
8. **Font licenses** — All OFL 1.1. If brand supplies licensed typefaces later, replace `@font-face` blocks and update license record.

---

**Phase 5 visual rebuild is ready for Protocol Soft visual review. No deployment, staging, production, Cloudflare, backup, or Phase 6 work has started.**