# Protocol Soft — Phase 3: Design System & UI/UX Design

- Company: Protocol Soft / بروتوكول سوفت
- Document version: 1.2 · Date: 2026-09-13 · Status: **Awaiting client approval**
- Depends on: `docs/PHASE_1_STRATEGY.md` v1.3 (approved) · `docs/PHASE_2_CMS_ARCHITECTURE.md` v1.3 (approved)
- Scope of this phase: visual direction, design system, and page-level UX/hi-fi textual specifications only. No production code, no Docker files, no migrations, no database changes, no deploy files. (Design tokens defined here become CSS variables in Phase 4; nothing in this document is an implementation file.)

## Version History

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-09-13 | Initial Phase 3 document: design principles and visual direction, full design system (color, typography, spacing/grid/breakpoints, iconography, public + admin components, states, RTL/LTR rules, motion, accessibility, responsive behavior), page-by-page UX and hi-fi textual specifications for 8 public and 6 admin surfaces using the approved hero messages, plus design rationale, complete design-token table, component inventory, accessibility checklist, content/asset requirements, acceptance checklist, and open design decisions. |
| 1.1 | 2026-09-13 | Pre-approval corrections: **Backup & Recovery admin screen** added (§16.16) implementing the confirmed operational-control model (BD1) — status states Disabled/Enabled/Running/Failed/Verification Required, Super-Admin-only schedule enable/disable with bilingual typed confirmations, manual backup request, health/history with sanitized non-sensitive summaries, persistent failure warning with action guidance, empty state, no restore button, no secret exposure; backup status badges added to the shared badge set (§9.2); dashboard warning integrated (§16.9); **Development & Production Data Policy** added (§22.1) — labeled test data confined to dev/staging, production never renders dummy contact values/[PLACEHOLDER]/test data, unconfigured public contact fields hidden, WhatsApp hidden until a real number exists, test data unable to trigger real notifications; decision register (BD1, DP1) and open decisions updated — backup destination demoted to an operational decision (Cloudflare R2 preferred, not launch-blocking while backups remain disabled). |
| 1.2 | 2026-09-13 | Approved decision updates applied: legal-page **draft templates** (LD1 — persistent «مسودة نموذجية» admin badge, Super Admin `contentOrigin = final` gate; Super Admin publishing gate unchanged); delivery-platform case study confirmed to **product-screenshots-only public scope** with the **screenshot review gate** reflected in the media library (CS1, §16.13) and identity-free case-study cards; **WhatsApp availability-state CTA** (WA1) across footer, CTA bands, and contact page — always visually present, localized availability message when unconfigured, never dummy numbers, active link once the official number is entered; **operational defaults confirmed per security best practices** (OD1 — 30-min idle / 8h absolute / 8h Cloudflare Access session / 24-month audit retention / last-50-or-90-day versions / backups: daily encrypted off-server, monthly integrity verification, quarterly restore exercise, 30 daily + 12 monthly retention, launch guidance requiring restore-tested backups before relying on production); register, badge set, checklists, and open decisions updated. |

## 0. Decision Register (carried into and honored by this design)

| # | Confirmed input | Where it lands in Phase 3 |
|---|---|---|
| D1–D11 | Phase 1 decisions (Option A API, EDR positioning, hero messages, case-study placeholders — superseded by CS1, no certifications, team hidden, WhatsApp placeholder — superseded by WA1, Plausible, legal gating — extended by LD1, blog extensibility, Cloudflare edge) | §2, §16 (page specs) |
| OD1 | Phase 2 v1.5 **confirmed operational defaults (security best practices)**: admin idle **30 min** · absolute session **8h** · Cloudflare Access session **8h** · audit retention **24 months** · lead retention 12 months then archive/delete per policy · version retention last 50 **or 90 days, whichever first** · preview codes ≤ 15 min single-use · key rotation 90 days or on suspected compromise · backups (once enabled): encrypted off-server **daily**, **monthly integrity verification**, **quarterly restore exercise**, retention **30 daily + 12 monthly**; backups stay disabled by default but launch guidance requires them configured, enabled, and restore-tested before real leads or important production content are relied upon | §16.10–16.14, §16.16; Phase 2 §16 |
| OD2 | Phase 2 v1.3 carried implementation requirement (Technical Foundation / Admin Build): preview codes never exposed in reverse-proxy, application, analytics, or Cloudflare access logs; preview responses use `Referrer-Policy: no-referrer` + `no-store`; after a successful one-time exchange, redirect to a clean preview URL without the code | §16.17 preview screen spec; logged as a Phase 4 build requirement |
| OD3 | Still-open launch decisions: legal copy owner · case-study written client approval · official WhatsApp number · future EDR dedicated domain. *(Operational, not launch-blocking: off-server encrypted backup provider — Cloudflare R2 preferred, not implemented; backups stay disabled until a Super Admin enables them.)* | §22 (content/asset requirements), §24 (open decisions) |
| BD1 | **Backup & Recovery operational-control model (confirmed, Phase 2 v1.4 §2.3):** automated backups disabled by default; Super Admin-only schedule enable/disable (bilingual typed confirmations), manual backup requests, health/history; dashboard never exposes or edits encryption keys, PostgreSQL/storage credentials, bucket details, or server paths; encrypted + off-server mandatory once enabled; restore = separate controlled operational procedure (explicit authorization), never a UI action; full audit coverage; persistent failure warning on the Super Admin dashboard | §16.16 (screen), §9.2 (badges), §16.9 (dashboard warning); Phase 2 §2.3/§5.1.7/§5.3.7 |
| DP1 | **Development & production data policy:** dev/staging may use clearly labeled fake/test data; production never renders dummy contact values, fake client details, `[PLACEHOLDER]`, or test data; unconfigured public contact fields are hidden; contact details editable via Site Settings per Phase 2 permissions; WhatsApp hidden until a real number exists; test data can never trigger real email/WhatsApp/notification delivery | §22.1; reflected in §8.6, §16.6, §16.9 |
| LD1 | **Legal pages:** Protocol Soft requested initial editable **draft templates** for Privacy Policy and Terms of Use — seeded in Phase 9, persistently badged «مسودة نموذجية / Draft template» in the admin until Super Admin sets `contentOrigin = final` together with the legal-review fields; Super Admin legal-review and publishing gate unchanged | §16.15 (legal editor), §16.7 (public template unchanged); Phase 2 §5.2.5 |
| CS1 | **Delivery-platform case study — confirmed public scope: product screenshots only** (after the screenshot review gate). Client name, logo, testimonials, commercial metrics, revenue/growth claims, sensitive architecture details, and unapproved technologies are never published. **Screenshot review gate:** every screenshot screened for personal data · customer/order data · contact data · credentials/keys · private dashboards · other sensitive info before publication | §16.13 (screening UI), §16.5 (identity-free cards); Phase 2 §5.2.2/§6.3 |
| WA1 | **WhatsApp availability-state CTA:** visually present in the public UI and editable through Site Settings; dev/staging may use a clearly marked test value; production-unconfigured state renders a localized non-deceptive availability message directing users to the contact form and email — never a dummy, arbitrary, or unsafe number; the official number activates the link without code changes | §8.6, §8.7, §16.1, §16.6; Phase 2 §6.8/§6.9 |

**Locked hero messages (D3, used verbatim in §16.1):**
- Arabic: «نبني أنظمة رقمية موثوقة، ونحميها لتعمل بثقة.»
- English: "Build smarter. Operate securely."

---

## 1. Purpose & Design Goals

This document is the single source of visual and interaction truth for both products (public website at `protosoftdev.com`, admin at `admin.protosoftdev.com`). It exists so that:

1. Phase 4+ builds are mechanical — every color, size, spacing value, and component behavior is decided here, once.
2. Arabic-first RTL is the design default, not a mirrored afterthought; the English LTR experience is its equal, not a translation.
3. The brand reads as **calm, credible, technical, enterprise-grade** — the design equivalent of the voice rules in Phase 1 §3.
4. Theming stays inside the approved token allowlist (Phase 2 §11); nothing in the component library depends on colors or styles that admins can change freely.

Success criteria for this design: a first-time Saudi SMB owner understands the three services and how to start within 30 seconds on a phone; an enterprise evaluator finds engineering credibility (methodology, case study, security posture) within two clicks; an admin completes "publish Arabic service page" without training.

## 2. Design Principles (brand personality → design rules)

| Principle | Concrete design rule |
|---|---|
| **Calm** | Low-chrome dark navy foundation; one accent used sparingly (primary blue for actions, cyan for emphasis moments only); no decorative noise; max 2 font sizes per component |
| **Credible** | Real structure over decoration: visible methodology, actual deliverable lists, honest status labels («قيد التطوير» / "In Development"); no stock-photo people, no fake dashboards, no metrics |
| **Technical** | Product/system-oriented visuals: abstract node-and-line motifs, blueprint-style grids, realistic (but non-functional, non-deceptive) UI mockups of Protocol Soft's own work; monospace accents for technical labels (slugs, versions, reference codes) |
| **Enterprise-grade** | Strict 8px-grid alignment; consistent component anatomy; measured whitespace (section padding 96/64px desktop, 64/40px mobile); restrained elevation (borders over shadows) |
| **Arabic-first** | Every layout composed RTL-first; typography tuned for Arabic (line-height, no letter-spacing, optical size); Arabic copy never squeezed into English-shaped boxes |
| **Precise, not flashy** | Motion is functional (feedback, orientation) — 150–250ms, small distances, once; no parallax, no autoplay loops, no scroll-hijacking |
| **Honest states** | Empty, loading, and error states are designed for every surface (bilingual), never faked with dummy data |

**Prohibited visual elements (hard rules, both languages, public + admin):** hooded-hacker imagery · binary/matrix code backgrounds · green "terminal" aesthetics · fake dashboards with invented charts · fake client logos or testimonials · fabricated metrics/counters · excessive gradients (one subtle permitted exception: §3.3 hero wash) · excessive glassmorphism (blur panels only for sticky nav, max 8px blur, always with solid fallback) · stock photography of models · emoji as UI icons · decorative animations that replay on every scroll.

## 3. Visual Direction

### 3.1 Foundation
Dark navy is the default site mode (theme `defaultMode: dark`, client-adjustable within tokens). Light mode is a first-class equal. Both are token-driven; every component is specified once against semantic tokens (`surface`, `on-surface`, `border`, `primary`…) — never raw hexes — so a theme change is safe by construction.

### 3.2 Imagery & illustration
- **Abstract technical motifs (approved):** thin-line node-and-connection diagrams (system/integration metaphors), blueprint grid overlays at ≤ 4% opacity, isometric server/pipeline illustrations in brand colors only. All generated as SVG, currentColor/token-aware.
- **Product-UI visuals (approved):** simplified, clearly stylized renderings of Protocol Soft's own project UIs (e.g., the delivery-operations dashboard) using real component styles — **only after client approval** for the case study; until then §3.4 applies.
- **Photography (discouraged):** none at launch. If later supplied by Protocol Soft (office/team), it must pass: real company context, no models, treated with a navy duotone overlay for consistency.
- **Never:** anything from the prohibited list in §2.

### 3.3 Background treatment
Public pages sit on `bg-dark` (#071426) with optional **subtle pattern layer**: one of three predefined, CMS-selectable hero backgrounds — (a) blueprint grid, (b) node constellation (thin 1px lines, ≤ 6 nodes), (c) radial glow. All render at ≤ 8% opacity, static (no animation), decorative (`aria-hidden`, skipped by screen readers). This is the only gradient permitted: a single radial wash behind the hero (`primary` at 10% → transparent), same direction both languages.

### 3.4 Placeholder-safe visuals (pre-approval case study)
Until client approval, any case-study slot renders a **brand-pattern cover**: navy surface, blueprint grid, abstract delivery-route motif (lines + nodes, no text, no UI), bilingual label "دراسة حالة — قريباً بموافقة العميل" / "Case study — pending client approval" is **not** shown publicly (the Public Readiness Gate keeps it hidden); the branded cover is used only in approved internal previews. Homepage fallback per Phase 2: section hidden or neutral alternative.

## 4. Color System

### 4.1 Brand core (locked values from Phase 1/2)

| Token | Value | Role |
|---|---|---|
| `color-navy` | #071426 | Page background, dark mode |
| `color-navy-surface` | #0B1220 | Cards, panels, raised surfaces |
| `color-primary` | #2563EB | Actions, links, active states |
| `color-accent` | #22D3EE | Emphasis moments only (status dots, key highlights, focus glow on dark) |
| `color-light` | #F8FAFC | Light-mode background; text on dark |

### 4.2 Extended scales (new in this phase, derived & contrast-validated)
- **Primary ramp:** `primary-50` #EFF6FF · `100` #DBEAFE · `200` #BFDBFE · `300` #93C5FD · `400` #60A5FA · `500` #2563EB (core) · `600` #1D4ED8 · `700` #1E40AF · `800` #1E3A8A · `900` #172554. Dark-mode buttons use 500/600; light-mode text/links use 600/700 for AA on light.
- **Cyan ramp:** `accent-100` #CFFAFE · `300` #67E8F9 · `400` #22D3EE (core) · `600` #0891B2 · `700` #0E7490. Cyan is **never** body text on light backgrounds (fails contrast) — decorative/large text on dark, or 700 on light.
- **Neutral ramp (slate-based):** `neutral-0` #FFFFFF · `50` #F8FAFC · `100` #F1F5F9 · `200` #E2E8F0 · `300` #CBD5E1 · `400` #94A3B8 · `500` #64748B · `600` #475569 · `700` #334155 · `800` #1E293B · `900` #0F172A · `950` #020617.
- **Semantic:** success `#10B981` (dark: `#34D399` text) · warning `#F59E0B` (`#FBBF24`) · danger `#EF4444` (`#F87171`) · info = `primary-400`. Each with a defined on-color and bg-tint token (§19).
- **Dark-mode text:** primary text `#F8FAFC`, secondary `#CBD5E1`, muted `#94A3B8`. **Light-mode text:** primary `#0F172A`, secondary `#334155`, muted `#64748B`. All pairs ≥ 4.5:1 on their backgrounds.

### 4.3 Usage rules
- One primary action per view. Cyan appears at most twice per viewport (e.g., a status dot + one highlight underline).
- Semantic colors never mix with brand accents in the same component.
- Borders: dark mode `neutral-800` (#1E293B, the Phase 2 `borderSubtle`), light mode `neutral-200`. Inputs use one step stronger for their resting border.
- Charts/diagrams (if ever needed): primary + cyan + neutral-500 only, labeled directly (no color-only meaning).

## 5. Typography

### 5.1 Families
- **Arabic:** IBM Plex Sans Arabic (primary) · Cairo → Tajawal (fallbacks) · system Arabic stack last. Loaded via `font-display: swap`, Arabic subset preloaded.
- **Latin/English:** Inter (primary) · IBM Plex Sans (fallback).
- **Technical/mono accents:** IBM Plex Mono (reference codes, slugs, versions, env names) — admin + technical labels only.
- One family stack per language; mixed-script lines use the Arabic stack (it contains Latin glyphs) with `font-feature-settings` left at default.

### 5.2 Scale (px / rem, mobile → desktop where differing)

| Token | Size | Weight | Line-height | Use |
|---|---|---|---|---|
| `display` | 40→60 | 700 | 1.25 (AR 1.35) | Hero headline only |
| `h1` | 32→44 | 700 | 1.3 (AR 1.4) | Page titles |
| `h2` | 24→32 | 600 | 1.35 (AR 1.45) | Section titles |
| `h3` | 20→24 | 600 | 1.4 | Card/feature titles |
| `body-lg` | 18 | 400 | 1.7 (AR 1.8) | Lead paragraphs |
| `body` | 16 | 400 | 1.65 (AR 1.75) | Default body |
| `body-sm` | 14 | 400 | 1.6 | Secondary UI, table cells |
| `caption` | 12.5 | 500 | 1.5 | Labels, meta, badges |
| `overline` | 12 | 600, +2% tracking (Latin only) | 1.4 | Section eyebrows (Latin only — see 5.4) |

### 5.3 Arabic typography rules (non-negotiable)
1. **No letter-spacing on Arabic text** — ever (it breaks letter connections). Latin-only elements (overlines, mono labels) may track.
2. Arabic line-height runs +0.1 over Latin at every level (table above) for diacritic clearance.
3. **Western numerals (0–9)** in both languages; dates Gregorian; no Arabic-Indic digits.
4. Punctuation: Arabic sentences use Arabic comma «،» and question mark «؟»; numbers/units keep Latin format.
5. Mixed Arabic + Latin fragments (e.g., "EDR", "SaaS") are wrapped in bidi isolation so punctuation never jumps sides.
6. Bold in Arabic = 600–700 of the same family; never synthetic bolding of Cairo fallback.
7. Headline line-breaks are authored per language (no automatic wrapping acceptance) — approved breaks are part of content entry (Phase 2 §8).

### 5.4 Type conventions
- Overline eyebrows exist only in English ("SERVICES", "METHODOLOGY"); Arabic sections use a short bold kicker phrase instead (e.g., «خدماتنا») — same visual slot, no tracking.
- Links in body text: primary-400 (dark) / primary-700 (light), underlined; never color-only.
- `body-lg` is reserved for one lead paragraph per section — not for body copy.

## 6. Layout System

### 6.1 Spacing scale (4px base)
`space-1` 4 · `2` 8 · `3` 12 · `4` 16 · `5` 24 · `6` 32 · `8` 48 · `10` 64 · `12` 96 · `16` 128. Component-internal gaps: 8/12/16. Component-to-component: 24/32. Section padding: 96 desktop / 64 tablet / 40 mobile (top+bottom each). Related-item rhythm: 24.

### 6.2 Grid & containers
- **Container:** max-width 1200px, inline padding 24 (mobile) / 32 (tablet+). Wide variant 1360px for admin tables only.
- **Public grid:** 12-column; mobile 4-col (360–767), tablet 8-col (768–1023), desktop 12-col (1024+). Common splits: cards 1/2/3/4-up by breakpoint (§15); content+sidebar 8/4.
- **Text measure:** prose max 65ch Latin / ~55 Arabic words per line — implemented as max-width 680px prose container.
- **Admin grid:** fixed sidebar 264px (collapsible to 72px icon rail), content max 1360px, 16px gutters, tables full-width with sticky header.
- **Vertical rhythm:** sections separated by `space-12` (desktop) with a hairline divider optional (border-top `border-subtle`) — never both shadow and divider.

### 6.3 Radius, borders, elevation

| Token | Value | Use |
|---|---|---|
| `radius-sm` | 6px | Inputs, badges, small buttons |
| `radius-md` | 10px | Buttons, cards (default) |
| `radius-lg` | 16px | Panels, modals, media frames |
| `radius-full` | 999px | Pills, avatars, status dots |

Elevation is **border-first**: surfaces separate via `border-subtle` + background shift (`navy` → `navy-surface`); real shadows only for floating layers (dropdown, modal, toast): `0 8px 24px rgba(2,6,23,.4)` dark / `0 8px 24px rgba(15,23,42,.12)` light. No layered/glow shadows except the 2px focus ring.

## 7. Iconography
- **Library:** Lucide (open-source, MIT, stroke-based) — 1.5px stroke, 20px UI / 24px feature size, `currentColor` only. RTL: directional icons (arrows, chevrons, back) flip via CSS; non-directional never flip.
- Feature icons (services, methodology) use a consistent Lucide subset at 24px inside a 48px `radius-lg` tile (`primary-500/10` tint bg, primary icon) — no multicolor icons anywhere.
- Social icons: brand glyphs at 20px, `neutral-400` resting → `neutral-200` hover.
- Every icon-only control has `aria-label` (localized).

## 8. Core Components — Public

### 8.1 Buttons
| Variant | Resting | Hover | Use |
|---|---|---|---|
| Primary | bg `primary-500`, text #FFF, `radius-md`, padding 12/24, weight 600 | bg `primary-600`, translateY(-1px) allowed | One per view («ابدأ مشروعك» / "Start a Project") |
| Secondary | transparent, 1px `border-strong`, text `on-surface` | bg `neutral-800/50` (dark) · `neutral-100` (light) | Alternate actions, hero secondary |
| Soft | bg `primary-500/12`, text `primary-300/600` | bg 18% | Tertiary/in-card CTAs |
| Ghost | text-only + underline on hover | — | Inline utility |
| Danger | bg `danger`, text #FFF | `danger` darker | Admin destructive only |
Sizes: sm 8/16 + 14px text (admin), md 12/24 + 16px, lg 14/32 + 16px (hero). Disabled: 40% opacity + `cursor: not-allowed` + no hover. Focus: 2px ring `accent-300` offset 2px (dark) / `primary-500` (light). Loading: 16px spinner replaces icon, label retained, `aria-busy`. Buttons never rely on color alone (variant text/shape differs).

### 8.2 Links & text CTAs
Inline link (§5.4) · arrow-link («اعرف المزيد ←» / "Learn more →", arrow flips RTL) with 4px arrow shift on hover · nav links 15px/500 with 2px animated underline (start-aligned, `primary-400`).

### 8.3 Cards
- **Service card:** `navy-surface`, `radius-lg`, 1px `border-subtle`, padding 24; icon tile (48px) top-start; h3 title; 2-line summary (clamped); arrow-link. Hover: border → `primary-500/60`, translateY(-2px), 180ms. Focusable as a whole (`a` wrapping, focus ring on card). Equal height per row; RTL: icon/content align start = right.
- **Case-study card:** cover 16:9 (`radius-lg`, branded-pattern fallback §3.4), client-name slot renders only when approval allows — otherwise nothing (never placeholder text); title h3; summary; "Read case study" arrow-link.
- **Initiative card (EDR — cybersecurity page):** compact variant, 1px dashed `border-subtle` to signal non-commercial status visually; `caption` overrow "مبادرة مفتوحة المصدر" / "Open-source initiative"; title; status badge **«قيد التطوير» / "In Development"** (§9.2); 2-line description = approved wording only; **no CTA, no links, no metrics**.
- **Feature/value card:** icon tile + h3 + body-sm, transparent bg, top hairline accent on hover.

### 8.4 Forms & inputs
- Anatomy: label (14/500, above, always visible — no placeholder-as-label) · control · helper (13, muted) · error (13, danger, icon + text, replaces helper).
- Text/input: height 44px, `radius-sm`, 1px `neutral-700` border (dark) resting → `primary-400` focus + 2px ring; bg `navy-surface`; light mode mirrors. Error state: `danger` border + message + `aria-invalid` + `aria-describedby`.
- Textarea: min-height 120px, auto-grow to 320px, char counter (0/2000) bottom-end, counts in Western numerals both languages.
- Select: native styled to match (custom chevron, RTL flips). Radio: 20px, 2px ring on focus. Checkbox (consent): 20px, required error if unchecked.
- Honeypot field: visually hidden (`position:absolute; left:-9999px`), `tabindex="-1"`, `aria-hidden`, `autocomplete="off"` — never rendered as a visible trap.
- Required marks: Arabic «*» start-aligned after label; English "*" before label (reading-order correct).
- Server-side error summary (top of form, focus-targeted, list of anchors) + inline errors — bilingual, never English-only.

### 8.5 Navigation (header)
- **Desktop:** container row — logo (start) · nav center-start · [language switch · CTA button] end. Height 72px. Sticky with `backdrop-blur(8px)` + `navy 85%` bg + bottom hairline (solid fallback color for no-blur support).
- Services dropdown: opens on click/hover-intent; panel `radius-lg`, lists 3 services with icon + title + 1-line desc; keyboard: Enter opens, arrows navigate, Esc closes; RTL panel opens start-aligned.
- **Mobile (≤ 767):** 64px bar — logo · [lang · hamburger]. Drawer slides from start (right in AR, left in EN), full-height, 32px padding, nav items 18px with 16px gaps, CTA pinned bottom, contact channels listed, focus-trapped, Esc + overlay-click close, body scroll locked.
- Active page indicator: 2px underline + `primary-400` text.
- **No admin link anywhere** (Phase 1 isolation rule).
- Language switcher: pill «EN» / "عربي" — always shows the *other* language; preserves current path (Phase 1 §7).

### 8.6 Footer
4-column desktop → stacked accordion mobile: (1) brand: logo, 2-line description, social icon row; (2) Services (3 links); (3) Company: About, Case Studies, Contact; (4) Contact: email(s), phone, WhatsApp (**always visually present** — active link when configured; localized availability-message state when not, WA1), address/city, working hours. Bottom bar: © {year} + legal name · Privacy · Terms links. BG `#020617` (one step darker than page), top hairline. Bilingual per locale.

### 8.7 CTA band
Full-width section, `navy-surface` bg, blueprint-pattern ≤ 6%, centered stack: h2, one-line body, primary button lg + secondary "direct channels" row (email · phone · WhatsApp-if-real, icon buttons with labels). Mobile stacks vertically, buttons full-width.

## 9. Data Display — Badges, Tables, Lists

### 9.1 Badge anatomy
Pill (`radius-full`), 12.5/600, padding 2/10, tint-bg + tint-text + optional 6px leading dot: success `success/12 bg + success-text` · warning · danger · info/primary · neutral. Never the sole carrier of meaning (paired with text).

### 9.2 Status badge set (shared vocabulary public + admin)
| Status | AR | EN | Style |
|---|---|---|---|
| Published/منشور | منشور | Published | success |
| Draft/مسودة | مسودة | Draft | neutral |
| Incomplete/غير مكتمل | غير مكتمل | Incomplete | warning |
| In Development/قيد التطوير | قيد التطوير | In Development | info (pulse dot ≤ 2s, static under reduced-motion) |
| Pending approval | بانتظار الموافقة | Pending approval | warning |
| New (lead) | جديد | New | primary |
| Won/Lost/… | pipeline colors §16.14 | | |
| Backup: Disabled/Enabled/Running/Failed/Verification required | معطّلة / مفعّلة / قيد التنفيذ / فشلت / التحقق مطلوب | Disabled / Enabled / Running / Failed / Verification required | neutral / success / info / danger / warning |
| Screening: Unscreened/Pending/Approved/Rejected | لم يُفحص / قيد الفحص / مقبول / مرفوض | Unscreened / Pending / Approved / Rejected | neutral / warning / success / danger |

### 9.3 Tables (admin)
Sticky header (`navy-surface`), row height 48px, `body-sm`, zebra off / hover `neutral-800/40`, first column sticky on wide tables, numeric columns end-aligned (same physical side both languages), sort headers = buttons with direction-aware arrow, row actions end-aligned (icon buttons + overflow menu), selection checkbox column, empty/loading/error per §11. Mobile: tables collapse to stacked cards (label:value pairs) below 768 — no horizontal scroll for primary admin tables.

## 10. Admin Dashboard Components
- **Shell:** sidebar 264px (RTL: docked start = right) with grouped nav (§16.9), active item `primary-500/12` bg + start-edge 3px bar; collapsible icon rail (persisted). Topbar 64px: breadcrumb, global search (⌘K palette — collections + actions), language pill, "view site" external icon-link, user menu (name, role badge, admin-locale switch, logout).
- **Toolbar:** title + count · primary action (e.g., "+ خدمة جديدة") · filter chips · search · view toggle. Sticky under topbar.
- **List rows:** 56px, title + meta line (slug mono, dates), status badges AR/EN columns per Phase 2 W2, chevron end.
- **Editor chrome:** locale tabs (AR default first, EN with per-locale status dot), autosave indicator ("تم الحفظ ١٢:٠٤" / "Saved 12:04"), per-locale publish bar (§16.10), version drawer (list + diff + restore), sticky sub-header on scroll.
- **Field components:** text/textarea/richtext (toolbar: bold, lists, link, heading — no color/font pickers), select, relational picker (searchable modal, recent items), media picker (library modal w/ preview + alt-text required prompt), array/group repeaters (collapsed rows, drag handles, add/end), readonly computed (contrast report), locked-field style (grayed + lock icon + tooltip "Super Admin only" — enforced server-side regardless).
- **Feedback:** toasts (top-start inline with edge, 4s, dismissible, `role=status`), inline banners (info/warning/danger, `role=alert`), confirmation modal for destructive actions (typed confirmation for delete/publish-legal), empty states §11, skeleton loaders (§11), diff viewer (word-level, AR/EN aware, additions success-tint / removals danger-tint).
- **Charts:** none in v1 admin overview (counts + lists only) — no fabricated analytics.

## 11. Empty, Loading & Error States (every surface, both languages)
- **Empty:** centered, 48px line icon, 1-line title, 1-line guidance, primary action if applicable. Presets from Phase 2 §9.4 (leads, initiatives, team-hidden, missing-EN with "copy Arabic" action, media, audit). Never fake rows.
- **Loading:** skeletons matching final layout (no spinners for >300ms areas); buttons show inline spinners; route-level: top 2px progress bar; table: 5 skeleton rows; editor: full-form skeleton ≤ 800ms then content.
- **Error:** inline field errors (forms) · page-level bilingual panel (icon, title, what happened, retry button, contact channels fallback for lead failures per Phase 2 §7.5) · 404/403/500 admin pages with role-aware "back to dashboard" · API-down banner (dismiss-persistent) with retry.
- All states localized in both languages regardless of admin locale (content locale drives public, admin locale drives admin).

## 12. RTL/LTR System (implementation-agnostic rules)
1. Direction = document-level `dir` attribute per locale; **no** per-element direction overrides except bidi-isolated Latin fragments.
2. Spacing/margins/padding use **logical properties** (start/end, inline-start…) — zero physical left/right in components.
3. Flex/grid default direction follows `dir`; explicit order only where reading order demands.
4. Icons: directional flip (arrows, chevrons, back, external-link arrow stays — convention), non-directional don't; carousels/timelines reverse; progress bars fill start→end per direction.
5. Numerals stay Western; phone numbers, emails, URLs, codes are LTR islands (bidi isolate + `unicode-bidi: plaintext`).
6. Tables: text columns read RTL; numeric/end-action columns pin to the physical end; sort arrows mirror.
7. Form validation icons lead the text on the start side.
8. Shadows/transforms mirror (translateX signs); blur/opacity don't change.
9. The language switch flips `dir` + font stack together in one transition; form state and scroll restore.
10. QA gate: every component screenshot twice (AR/EN) in Phase 10 — a component missing either direction fails.

## 13. Motion Rules
- **Durations:** micro (hover/focus/press) 120–180ms; enter/exit 200–250ms; drawer/modal 250ms + 16px slide; page-level none. Easing: `ease-out` standard, `ease-in-out` for exits.
- **Distance:** ≤ 16px translate; opacity as the primary channel.
- **Allowed patterns:** hover lifts (2px), underline growth, badge dot pulse (In Development only), skeleton shimmer (1.2s loop), drawer/modal slide-fade, toast slide-in, accordion height auto (max 250ms), scroll-reveal **once** (8px up + fade, 240ms, IntersectionObserver, above-the-fold content exempt).
- **Prohibited:** parallax, autoplay loops, marquee, cursor effects, scroll-hijack, staggered cascades > 3 items, background animation.
- `prefers-reduced-motion: reduce` → all transforms off, opacity-only ≤ 120ms, pulse/shimmer static.
- Motion never blocks input; all interactions respond to first paint within 100ms (perceived).

## 14. Accessibility Rules (WCAG 2.1 AA baseline — full checklist §21)
Contrast per §4.2/§11.2 (theme Apply hard-blocks failures — Phase 2 §11.2) · visible 2px focus ring on every interactive element (never `outline: none` alone) · keyboard-complete: nav, dropdowns, drawers, modals (focus trap + return), tables, editors · skip-to-content link (public) · landmarks (`header/nav/main/footer`, admin `complementary`) · one `h1` per page, strict order · touch targets ≥ 44×44 (mobile 48 preferred) · form errors programmatically associated · images require bilingual alt (Phase 2 §12) — decorative SVG `aria-hidden` · status communicated by text + ARIA (`aria-live=polite` for toasts/autosave) · language attributes `lang`/`dir` per locale · no time-limited interactions except logout (warned) · reduced-motion honored (§13).

## 15. Responsive Behavior
| Breakpoint | Width | Layout rules |
|---|---|---|
| xs | 360–479 | Single column; 4-col grid; nav = drawer; cards 1-up; buttons full-width in CTA/forms; hero 40px |
| sm | 480–639 | 2-up compact cards allowed; type scale +2 steps |
| md | 768–1023 | 8-col grid; nav drawer still (tablet) or condensed bar at ≥ 800; cards 2-up; footer 2-col; tables ≥ this width |
| lg | 1024–1279 | 12-col; full desktop nav; cards 3-up; footer 4-col; admin sidebar visible |
| xl | 1280–1535 | Containers centered; cards 3–4-up; hero 60px |
| 2xl | 1536+ | Same as xl, wider gutters — no stretched full-bleed content |

Rules: mobile-first CSS · images `sizes`/`srcset` from Phase 2 media variants · touch targets grow on coarse pointers · sticky elements re-evaluate per breakpoint (mobile header shrinks to 64px) · no hover-dependent information (hover = enhancement only) · orientation-safe (no landscape-locked layouts) · container queries allowed for card internals (future-proof), breakpoints govern page layout.

## 16. Page-by-Page UX Structure & Hi-Fi Specifications

> Format per page: purpose → structure (top→bottom) → key component specs → states/edge cases → AR/EN notes. Desktop described; responsive deltas per §15.

### 16.1 Public — Homepage `/`
**Purpose:** position the brand, route to 3 services + case study, convert to consultation. Converts on: primary CTA → `/contact`, WhatsApp, email.

Structure (sections toggleable/reorderable per Phase 2 §5.1.4; hero + final CTA anchored):
1. **Hero** (100vh cap, min 560px): bg = `navy` + hero pattern (§3.3) + single radial wash. Center-start stack (max 720px): overrow/kicker («بروتوكول سوفت — هندسة البرمجيات والأمن السيبراني» / "Protocol Soft — Software Engineering & Cybersecurity"); **display headline, locked**: «نبني أنظمة رقمية موثوقة، ونحميها لتعمل بثقة.» / "Build smarter. Operate securely." (authored line-break: AR breaks after «موثوقة،»); subheadline `body-lg` naming the three services (AR: «تطوير الأنظمة المخصصة، بناء المنتجات والمنصات الرقمية، وخدمات الأمن السيبراني — لفرق تعمل بوضوح وتنمو بثقة.»; EN: "Custom software, digital products and platforms, and cybersecurity services — for teams that run with clarity and grow with confidence."); CTA row: primary lg «ابدأ مشروعك» → `/contact` + secondary "تعرّف على خدماتنا" / "Explore our services" (arrow-link) → `/services`. Below CTAs: quiet trust row (text-only, no logos): «شريك تقني طويل الأمد · الأمان من اليوم الأول · تواصل bilingual» style three micro-points with icons. Scroll cue: thin 1px line + chevron, subtle.
2. **Value statement**: h2 + `body-lg` lead + 3 differentiator cards (icon tile, h3, 2-line body): engineering depth / secure-by-design / long-term partnership.
3. **Services overview**: h2 + intro; 3 service cards (§8.3) equal-height; card CTA arrow-links to service pages.
4. **Why Protocol Soft**: 4–6 items in 3-col grid (icon + h3 + body-sm).
5. **Methodology**: horizontal 5-step track (Discovery → Design → Build → Secure & Test → Launch & Support) — numbered nodes on a connecting line (line direction follows `dir`), each: step number (mono), h3, 1-line promise. Mobile: vertical timeline.
6. **Featured project** — **fallback-aware**: if a gate-passing project exists: case-study card lg (cover left 7-col, content 5-col: overrow "دراسة حالة / CASE STUDY", h2 title, summary, 3 capability chips, arrow-link). **If none (launch state):** renders `fallbackMode` = hidden section (next section flows up, spacing preserved) **or** approved neutral alternative: a "capabilities band" — 4 compact capability tiles + CTA to `/case-studies`. No empty card, no placeholder text, ever.
7. **Technical initiatives** — **disabled at launch (D2)**; when enabled later: 1 compact initiative card (§8.3) + the approved one-line wording, no CTAs.
8. **Secure-by-design**: split panel — text side (h2, body, bullet list of 4 practices, CTA soft → `/services/cybersecurity`) + visual side (abstract node-diagram SVG, token-colored).
9. **Final CTA band** (§8.7): h2 «جاهزون للاستماع إلى تحديك التقني.» / "Ready to talk about your technical challenge?", body, primary CTA, direct-channel row (WhatsApp: active when configured, availability-message state otherwise — WA1).
10. **Footer** (§8.6).

States/edges: hero image-free (fast LCP — bg pattern is CSS/SVG); all sections skeleton-free (SSR content); anchors `#services`, `#methodology` for drawer shortcuts. AR/EN: layout mirrors; headline breaks authored per language; trust row micro-points re-ordered by importance per locale.

### 16.2 Public — Services Overview `/services`
Purpose: orient + route to the right service. Structure: page header (h1 «خدماتنا» / "Our Services", 1-line intro) → 3 large service panels (alternating direction: icon-content-CTA rows, each full-width `navy-surface` panel with 48px padding, h2 = service title, 2-line summary, deliverable chips (4 max), primary-ish soft CTA «استكشف الخدمة») → methodology strip (compact 5 steps) → CTA band. Edge: exactly 3 cards from CMS (auto); if a service is unpublished, panel omitted (never stub). AR/EN mirrored.

### 16.3 Public — Service Page (template) `/services/{slug}`
Purpose: convert service-specific intent. Structure:
1. **Service hero**: breadcrumb (الرئيسية / الخدمات / {service}), h1, heroSubhead, CTA row (primary «اطلب استشارة» → `/contact?service={slug}` pre-selecting the service in the form) — bg pattern same family.
2. **Overview** prose (680px measure, from `overview` richtext).
3. **Deliverables** ("ما نسلّمه / What you get"): 2-col grid of deliverable rows (check icon + title + 1-line desc).
4. **Capabilities**: chip cloud grouped by theme (from `capabilities[]`).
5. **Process**: vertical 4–6 step timeline (numbered, connecting line start-aligned).
6. **FAQ** (if any): accordion (one open at a time, height-animated 200ms, chevron rotates, `aria-expanded`).
7. **Related projects** (if gate-passing relations exist): 2 case-study cards; **if none: section omitted** — never placeholders.
8. **Initiative card — cybersecurity page only** (`initiativeSection.enabled`, D2): dashed-border compact card (§8.3) after FAQ, titled «مبادرة تقنية مفتوحة المصدر» / "Open-source technical initiative", EDR title + «قيد التطوير / In Development» badge + approved 2-line wording; **no CTA/link**.
9. **Final CTA band** + footer.
Edge cases: unpublished service → 404; SEO fields per-locale; other two services listed in a "next" strip above footer. AR/EN mirrored; FAQ accordions independent per locale.

### 16.4 Public — About `/about`
Structure: page header (h1 «من نحن» / "About Us") → narrative prose (story, positioning: partner not vendor — 680px) → values grid (4 value cards) → **methodology summary** (5 steps, compact) → **team section — hidden by default (D6)**: renders zero markup when `visible=false` (no empty heading); when enabled: grid of member cards (photo 1:1 `radius-lg`, name, jobTitle, LinkedIn icon-link only if provided) → CTA band. Edge: no fake team count, no "meet the team" heading while hidden.

### 16.5 Public — Case Studies `/case-studies`
Structure: header (h1 «المشاريع» / "Case Studies", 1-line intro: honest scope note — "أعمال عملاء ومبادرات تقنية — نعرض ما يُسمح بنشره فقط" / "Client work and technical initiatives — we publish only what we're approved to share") → filter row (type chips: All / Client Projects / [future types]; language-neutral counts) → grid of case-study cards (2-col desktop; card §8.3) → empty-state (if zero gate-passing projects: bilingual empty panel "لا توجد مشاريع منشورة بعد" / "No published case studies yet" + CTA to services — **expected launch state for list** if delivery-platform not yet approved) → CTA band. Detail pages route 404 publicly until the Public Readiness Gate passes (Phase 2 §6.3). When EDR ever becomes "Available", its future detail page renders under this template — not in scope today (D2).

### 16.6 Public — Contact `/contact`
Purpose: the conversion endpoint. Structure: header (h1 «تواصل معنا» / "Contact Us", 1-line reassurance: response-time expectation phrased honestly, e.g., «نرد عادة خلال يوم عمل» / "We usually reply within one business day") → 2-col layout: **form (7-col)** + **direct channels panel (5-col)**.
Form fields (Phase 2 §5.3.3, service preselect via `?service=`): fullName* · company · email* · phone · serviceInterest* (radio-group styled as 4 selectable tiles: تطوير أنظمة مخصصة / منتجات ومنصات رقمية / أمن سيبراني / استفسار عام — **no EDR option**) · message* (textarea, 0/2000) · consent* checkbox with link to `/privacy` · honeypot (§8.4) · submit primary lg («إرسال الطلب» / "Send request").
Direct panel: cards for email(s) (mailto links), phone (tel), WhatsApp (**always rendered** — active `wa.me` link when configured; unconfigured state = visually present but inert with the localized availability message «واتساب غير متاح حالياً — يرجى استخدام نموذج التواصل أو البريد الإلكتروني» / "WhatsApp is not yet available — please use the contact form or email"; never routes to a dummy, arbitrary, or unsafe number — WA1), working hours, address/Maps link.
States: client validation inline; submit → loading (button spinner, form locked); success → **replaces form** with bilingual confirmation panel (check icon, `confirmationMessage` from contact-config, reference code in mono, "send another" ghost) — no page reload dependency; failure (CMS down) → danger banner with direct channels repeated (from contact-config) + retry — **nothing stored client-side** (Phase 2 §7). RTL: labels/tiles mirror; tiles selectable via keyboard.

### 16.7 Public — Privacy `/privacy` & Terms `/terms`
Legal-page template: narrow prose (680px), h1 + last-updated date (from CMS), richtext blocks, in-page mini-TOC (h2 links, start-aligned) when > 4 sections. `legalReviewRequired` banner is **admin-only** (never public). These pages carry zero marketing components — no CTA band; footer only. Content locale renders only its published locale (Phase 2 per-locale gating).

### 16.8 Public — 404
Centered on navy + pattern: oversized "404" (display, `primary-500/25`), h1 «الصفحة غير موجودة» / "Page not found", 1-line apology (honest, no joke), actions: primary «العودة للرئيسية» + secondary links (Services, Case Studies, Contact). Same template serves other errors (403/500 swap title/body). Both languages by path locale; unknown locale → Arabic.

### 16.9 Admin — Dashboard Overview `/` (admin)
**Purpose:** role-aware daily cockpit. Layout: admin shell (§10) → greeting row (name + today + admin-locale) → **stat cards** (4-up, compact): طلبات جديدة / New leads (count + "last 7 days"), مسوداتي / My drafts, ترجمة إنجليزية ناقصة / Missing EN translations, آخر نشر / Last publish (relative time) — **counts only, no charts** → **two-column work areas**: (start) "بحاجة إلى انتباه / Needs attention" list (unpublished-AR drafts past 7 days, failing Public-Readiness checks on case studies, legal pages pending Super-Admin sign-off, and — **Super Admin only** — a persistent backup-failure warning until cleared, BD1/§16.16 — each row: entity link + badge + reason); (end) "آخر النشاطات / Recent activity" (last 8 audit events the role may see: actor, action badge, entity, relative time) → quick-actions row (role-filtered buttons: + service, + project, open leads, media). States: all empty states §11; sales manager lands here → leads-first variant (stat cards: New / Contacted today / Won this month + recent leads table preview). Values never fabricated; zeros are fine.

### 16.10 Admin — Service Editor `/services/{id}`
Layout: editor chrome (§10) — top bar: back, title (h1 = AR title), status badges (AR/EN dots per W2), version drawer button, preview button (AR/EN split), locale tabs **AR default-active**. Body (max 880px): SEO-critical fields first (slug mono w/ lock hint "يُولَّد من العنوان" / auto-from-title with edit), title*, heroHeadline*, summary* (0/200), icon select; groups as collapsible sections with item counts: Overview (richtext) · Deliverables (repeater: title+desc) · Capabilities (tag input) · Process (repeater) · FAQ (repeater) · Related projects (rel picker, gate-filtered) · **Initiative section** (cybersecurity only: enabled toggle + heading AR/EN + persistent info note: "يعرض بطاقة المبادرة بالصياغة المعتمدة فقط — لا حقول تسويقية هنا" / "Renders the initiative card with approved wording only — no marketing fields here") · SEO group (title 0/60 + SERP snippet preview per locale, description 0/160, ogImage picker, noindex toggle).
**Per-locale publish bar** (sticky bottom): locale-completeness meter ("اكتملت العربية ✓" / "Arabic complete ✓" or "ينقص: ملخص، تسليمات" / "Missing: summary, deliverables"), buttons: [معاينة] [نشر العربية] — EN button shows locked state with tooltip «يتطلب نشر العربية واكتمال الإنجليزية» / "Requires Arabic published + EN complete" until satisfied (server-enforced; UI is honest mirror). Autosave pill in top bar; leaving-with-changes guard (modal, bilingual). Roles: Editor sees identical screen minus publish bar (draft-save + preview only — server-enforced).

### 16.11 Admin — Homepage Section Manager
Layout: **section list = the page**. Vertical list of the 9 sections as draggable rows (handle, order #, section icon + title, per-locale status dots, enabled toggle, expand chevron). Drag to reorder (keyboard: space lifts, arrows move, live region announces position; persisted per Phase 2 `order`). Expanded row → inline mini-editor for that section's fields (localized tabs per section: heading/body/CTAs/images) — no separate route; changes autosave to the `homepage` global draft. Pinned rows: hero + final CTA (reorder disabled, lock icon, tooltip "مثبّتان / Anchored"). Right rail (desktop): **live homepage preview card** — scaled static thumbnail of section order + enabled state, updates as toggles flip (no full iframe; SSR thumbnail per section type). Publish bar (global-level): draft → preview (§16.16 flow) → publish per locale; version history access. Edge: technicalInitiatives row carries the "disabled at launch" state + D2 note; featuredProject row shows gate status of its referenced project inline («يجتاز بوابة الجاهزية ✓ / failing: placeholder scan ✗»).

### 16.12 Admin — Theme Settings
Implements Phase 2 §11 exactly. Layout: split — **start: token form** (draft state banner "تعديلات غير مطبقة / Unapplied changes"), **end: live preview panel** (sticky): mini hero mock + buttons row + service card + status badges, rendering with draft tokens instantly.
Token form (allowlist only): color fields (hex input + native picker + swatch) for the 8 color tokens · buttonStyle segmented control (filled/outline/soft with mini-render) · radius segmented (sm/md/lg/full showing corner samples) · animationsEnabled switch · defaultMode radio. Each labeled with token name (mono) + role description.
**Contrast panel** (under form): 6 required pairs listed with computed ratio + pass/fail icon; any failing pair → Apply disabled + inline suggestion ("جرّب #1D4ED8" / "Try #1D4ED8" — suggestion only). **Actions:** Apply (confirmation modal showing diff summary → audit + revalidate) · Reset per-token (icon) · Reset all (typed confirm) · Version history drawer (token diffs, restore). Editor role: read-only + banner.

### 16.13 Admin — Media Library
Layout: toolbar (upload button, search, category filter chips, visibility filter, view toggle grid/list) → grid of media cards (thumb 4:3 contain, name, category chip, visibility badge [عام/خاص], alt-status dots AR/EN — missing = warning dot per Phase 2 §12) → detail drawer on select: large preview (SVG files render sanitized; PDF icon), file meta (type, size, dimensions, uploaded date/by), **bilingual alt text fields** (required-for-public warning if empty), caption AR/EN, category select, tags input, visibility toggle (documents/screenshots default private + explanation), **sensitivity screening** (project screenshots — mandatory before public display, CS1: checklist — personal data · customer/order data · contact data · credentials/keys · private dashboards · other sensitive info — status «لم يُفحص / قيد الفحص / مقبول / مرفوض» (`unscreened / pending / approved / rejected`), reviewer + time recorded automatically, notes field; only `approved` assets count toward the Public Readiness Gate; audited), usage list ("مستخدم في: الخدمات ×2، الرئيسية" / "Used in: Services ×2, Homepage" — from reference check), actions: replace (keeps references, versioned), archive (if referenced — delete disabled with tooltip), delete (only unreferenced; typed confirm; audited). Upload: drag-drop zone + picker, multi-file, per-file progress, validation errors inline (type/size per §12), SVG sanitize pass/fail shown. Private assets: lock chip + "لا يظهر في الموقع / Not served publicly".

### 16.14 Admin — Leads Pipeline `/leads`
Default view **table** (Phase 2 W4): columns Reference (mono), Name, Company, Service (chip), Locale (ar/en chip), Status (badge), Assigned (avatar/initials), Submitted (relative date); row click → detail drawer. Filters: status multi-select, service, locale, assigned-to, date range; search across name/email/company/reference; saved-filter chips (New / Mine / Unassigned).
**Detail drawer (60% width):** header (reference + status stepper) → contact block (name, company, email mailto, phone tel/WhatsApp-if-real, service, locale, page path, submitted time, consent ✓) → message panel (full text, word-wrap) → **status stepper** (7 states horizontal, click to transition, confirm on Won/Lost) → assignment select (users directory) → **internal notes** (add box 0/2000, list with author+time, admin-only badge) → footer: archive, export-single? no — export lives in toolbar.
**Pipeline board toggle** (Kanban, optional view): 7 status columns, drag card to transition (confirm on terminal states), WIP counts per column — no fabricated totals.
**Toolbar:** export CSV (role-gated, confirmation modal: "سيتم تصدير {n} سجل — تُسجَّل العملية" / "{n} rows will be exported — this is audited" → audited per Phase 2), notification recipients shortcut (form-settings, Super Admin/CM only). Empty state per Phase 2 §9.4; real-time: new-lead toast + count badge (polling ≤ 60s — no fake realtime).

### 16.15 Admin — Supporting screens (summary spec)
Users & Roles: table (name, email, role badge, status, last-login) + invite/edit drawer (role select field-locked to Super Admin), disable flow with typed confirm; no self-role-change, no self-disable. Audit Log viewer: filterable table (event type, actor, entity, time; expandable sanitized summary row), export disabled (read-only view), 12-month window noted. Legal pages editor: §16.10 editor + persistent "يتطلب مراجعة قانونية" banner + **«مسودة نموذجية / Draft template» badge with the full draft-template notice until Super Admin switches `contentOrigin` to `final` (LD1)** + Super-Admin-only review fields (reviewer, date, approvalRef) + publish button visible only to Super Admin.

### 16.16 Admin — Backup & Recovery (Super Admin only)
Implements the Phase 2 §2.3 control model (BD1). **Role gate:** the screen, its sidebar entry, and its API are Super Admin-only (server-enforced); other roles never see the nav item — UI hiding mirrors server rules. The UI renders **no secret-bearing field for any role, including Super Admin** — secrets do not exist in any API response.

Layout: admin shell → status panel → actions row → history table.

**Status panel (top):** large status badge — Disabled «معطّلة» / Enabled «مفعّلة» / Running «قيد التنفيذ» / Failed «فشلت» / Verification required «التحقق مطلوب» (§9.2) — plus a key-facts grid:
- Last successful backup (relative + absolute time, or "—" / «—»)
- Last verification (status + time)
- Next scheduled backup (rendered **only when enabled**)
- Destination status: non-sensitive label only (`configured / not configured`) — **no provider, bucket, path, keys, or credentials are ever rendered or editable**

**Actions row:**
- **[تفعيل الجدولة / Enable schedule]** (when disabled) → confirmation modal (bilingual) showing the selected schedule **and** the last known successful verification state; confirm → audited `backup_schedule_changed`.
- **[تعطيل / Disable]** (when enabled) → bilingual **warning modal + typed confirmation** (typing the Arabic or English phrase for "disable"); warning states that the site will no longer have automated backups; confirm → audited.
- **[نسخة احتياطية الآن / Back up now]** (manual request) → button enters loading "قيد التنفيذ / Running"; disabled while a run is active; audited `backup_requested`.
- **No restore button exists anywhere in the UI.** A muted info note instead: «تتم الاستعادة عبر إجراء تشغيلي مُصرَّح به خارج لوحة التحكم» / "Restore is performed via an authorized operational procedure outside the dashboard" (Phase 2 §2.3).

**Health/history table:** newest-first rows — start/end timestamps, duration, type (scheduled/manual), result badge, verification status/time, and a **non-sensitive error summary** (server-sanitized: no paths, hosts, credentials, stack traces), truncated with expandable detail. Filter by result; export: none.

**States:**
- **Empty:** «لم يتم تشغيل نسخة احتياطية بعد» / "No backup has run yet" + schedule-enable CTA — shown when `backup-records` is empty.
- **Running:** live row + inline spinner, 60s polling, `aria-live=polite` status announcements.
- **Failed:** danger banner pinned above the table with clear action guidance (check destination status → request a manual retry → consult the operational runbook); persists (also on the dashboard, §16.9) until a successful/verified backup clears it.
- **Verification required:** warning banner + re-check action.

**Accessibility & RTL:** RTL-first layout mirrored for EN; full keyboard path (status → actions → history), focus-trapped modals with focus return, badges pair text + icon (never color-only), contrast per §18 tokens, `prefers-reduced-motion` static. **Server-enforced boundary:** schedule/enable/disable/manual-request endpoints accept Super Admin sessions only; every action audited (Phase 2 §13).

### 16.17 Admin — Preview flow surfaces
Implements Phase 2 §6.7 + this phase's carried requirement (OD2). **Issue:** Preview button (editor/section manager) → 150ms spinner → new tab to `/preview?code=…`. **Render (web):** full-page draft render + non-intrusive preview frame bar (fixed bottom-start, `navy-surface`): "معاينة مسودة — {locale} — {countdown mm:ss}" / "Draft preview — {locale} — {mm:ss}" + Close. Response headers: `noindex`, `Cache-Control: private, no-store`, `Referrer-Policy: no-referrer`; **the code never appears in proxy/app/analytics/Cloudflare logs** (path-only logging after exchange; OD2). After successful exchange, URL is replaced with the clean `/preview/{tokenless}` form. Countdown expiry → inline renewal panel (button re-issues via admin session if still open, else login). Invalid/used code → bilingual panel (honest: "انتهت صلاحية رمز المعاينة أو استُخدم مسبقاً" / "This preview code has expired or was already used") + close. Preview pages are never sitemapped, never linked publicly, never cached.

## 17. Design Rationale (why this system)
1. **Dark-first because security companies are judged on composure** — navy reads as controlled and technical; light mode exists for completeness and accessibility preference, both token-driven so neither is second-class.
2. **One accent, used rarely** — cyan's scarcity is what makes it signal "technical precision"; overuse would read as generic SaaS.
3. **Typography carries the brand** — with no fake metrics/logos allowed, credibility must come from typographic rhythm, spacing discipline, and honest structure; IBM Plex Sans Arabic was chosen because it renders enterprise-clean at UI sizes and pairs natively with Inter/IBM Plex.
4. **RTL-first is a trust signal** — Saudi decision-makers notice immediately whether the Arabic experience is native; composing RTL-first and mirroring to English guarantees both are real.
5. **Borders over shadows** — flatter, faster to render, easier to theme, and matches the "precise engineering" personality better than soft SaaS shadows.
6. **Motion budget** — a short allowlist keeps the site feeling engineered rather than decorated; everything else is deliberately still.
7. **Status vocabulary shared across public and admin** — «قيد التطوير / In Development» looks the same everywhere, reinforcing the honesty rule at every touchpoint.
8. **Admin reuses public tokens/components** — one design system to maintain, and the CMS theming rules (Phase 2 §11) can never break admin UI.
9. **No charts anywhere at launch** — with no verified data, the only honest dashboard is no dashboard.
10. **Fallbacks are designed, not accidental** — featured-project, initiative, team, and case-study emptiness are each a specified state, so the Public Readiness Gate (Phase 2) can hold without the site looking unfinished.

## 18. Design-Token Table (canonical; becomes CSS variables in Phase 4)

| Group | Token | Value | Notes |
|---|---|---|---|
| Brand | `color-navy` / `color-navy-surface` / `color-primary` / `color-accent` / `color-light` | #071426 / #0B1220 / #2563EB / #22D3EE / #F8FAFC | Locked core (Phase 1/2) |
| Ramps | `primary-50…900`, `accent-100…700`, `neutral-0…950` | §4.2 | Full hex tables |
| Semantic | `success/warning/danger/info` + `-text` + `-bg` variants | §4.2 | AA-validated pairs |
| Text | `text-primary/secondary/muted` × dark/light | §4.2 | ≥ 4.5:1 on their bg |
| Border | `border-subtle` / `border-strong` | #1E293B / #334155 (dark) · #E2E8F0 / #CBD5E1 (light) | |
| Font | `font-ar` / `font-latin` / `font-mono` | IBM Plex Sans Arabic (+Cairo, Tajawal) / Inter (+IBM Plex Sans) / IBM Plex Mono | swap, subsets |
| Type | `display…overline` | §5.2 | sizes, weights, line-heights (AR +0.1) |
| Space | `space-1…16` | 4…128 | 4px base |
| Radius | `radius-sm/md/lg/full` | 6/10/16/999 | theme-selectable set (md default) |
| Elevation | `shadow-overlay` dark/light | §6.3 | borders-first elsewhere |
| Motion | `dur-micro/enter/exit`, `ease-out/in-out` | 150/240/200ms | reduced-motion collapse |
| Z | `sticky/drawer/modal/toast` | 100/200/300/400 | documented ladder |
| Breakpoints | `xs…2xl` | 360/480/768/1024/1280/1536 | |
| Container | `container`, `container-wide`, `prose` | 1200/1360/680px | |

Theme-editable subset (admin): exactly the Phase 2 §5.1.2 allowlist (8 colors, buttonStyle, radius set, animations, defaultMode) — this table's other tokens are code-owned.

## 19. Component Inventory

| # | Component | Variant/States | Used in |
|---|---|---|---|
| 1 | Button | primary/secondary/soft/ghost/danger × sm/md/lg × hover/focus/disabled/loading | all |
| 2 | Link (inline, arrow, nav) | + hover/focus/active | all |
| 3 | Header/nav + dropdown + mobile drawer | sticky/blur; open/closed; keyboard | public |
| 4 | Footer | 4-col/stacked | public |
| 5 | Service card | hover/focus; RTL mirrored | home, services |
| 6 | Case-study card | with/without client identity (gate-driven) | home, case-studies, service |
| 7 | Initiative card | dashed, status badge, no-CTA | cybersecurity, (home disabled) |
| 8 | Feature/value card | grid item | home, about |
| 9 | CTA band | + direct-channel row | public pages |
| 10 | Badge (status set §9.2) | tinted pill + dot | all |
| 11 | Input/textarea/select/checkbox/radio + honeypot | rest/focus/error/disabled + char counter | contact, admin |
| 12 | Accordion (FAQ) | open/close, a11y | service, admin |
| 13 | Timeline/steps | horizontal/vertical | home, about, service |
| 14 | Pattern/hero background | 3 pattern variants | hero, CTA, 404 |
| 15 | Breadcrumb | truncation | service, admin |
| 16 | Form error summary + inline error | focus-targeted | contact, admin |
| 17 | Confirmation panel (form success) | + reference code | contact |
| 18 | Empty state (7 presets) | + action | public, admin |
| 19 | Skeleton (block/row/card) | shimmer | admin, slow views |
| 20 | Toast / banner / confirm modal / typed-confirm | roles | admin |
| 21 | Admin shell (sidebar, topbar, command palette) | collapsed rail | admin |
| 22 | Data table (+ mobile card collapse) | sort/filter/select | admin |
| 23 | List row / section row (drag) | reorder, toggle | admin |
| 24 | Editor chrome (locale tabs, publish bar, autosave) | per-locale states | admin |
| 25 | Repeater/array field | add/remove/reorder/collapse | admin |
| 26 | Media card + detail drawer | upload/validate/usage | admin |
| 27 | Relational picker modal | search, gate-filtered | admin |
| 28 | Diff viewer / version drawer | word-level, AR-aware | admin |
| 29 | Status stepper (leads) + Kanban board | transitions | admin |
| 30 | Contrast panel (theme) | pass/fail + suggestion | admin |
| 31 | Live preview card (homepage manager) | thumbnail | admin |
| 32 | Preview frame bar (web preview) | countdown/expired | preview |
| 33 | Backup & Recovery console (status panel, typed-confirm modals, history) | 5 status states · failure banner · empty state | admin (Super Admin only) |

## 20. Responsive Rules (summary)
Mobile-first; breakpoints §15; nav drawer ≤ 1023; cards 1/2/3/4-up by width; CTA/forms full-width buttons on xs; footer accordion on mobile; tables collapse to cards < 768 (admin); hero type 40→60px; section padding 40→96; sticky header 64→72px; touch targets ≥ 44 (48 coarse); hover-only info never hides content; images served from Phase 2 variants with `srcset/sizes`; admin sidebar → icon rail < 1280, overlay drawer < 1024; direction-aware spacing throughout (§12).

## 21. Accessibility Checklist (Phase 10 QA gate — every page, both languages)
☐ Contrast ≥ 4.5:1 text / 3:1 large text & UI boundaries (theme-validated) ☐ Complete keyboard operability incl. dropdowns, drawers, modals, repeaters, Kanban ☐ Visible 2px focus ring, correct order, no traps without escape ☐ Skip-link (public) + landmarks + one h1/page + logical heading order ☐ Form labels always visible; errors in `aria-describedby`; error summaries focus-targeted ☐ `aria-live` for toasts, autosave, lead notifications ☐ Status never color-only (badge text + dot) ☐ Bilingual alt text present or asset flagged ☐ Decorative SVG/patterns `aria-hidden` ☐ `lang`+`dir` correct per locale; bidi-isolated Latin islands ☐ Touch targets ≥ 44px ☐ Reduced-motion honored (§13) ☐ Focus visible after route changes (public) & drawer closes (admin) ☐ 44px+ hit slop on icon buttons ☐ Timeouts (preview countdown, sessions) communicated with renewal paths ☐ Screen-reader pass (VoiceOver/NVDA) on: home, contact, service editor, leads.

## 22. Content & Asset Requirements (feeding Phase 9 entry)

From Protocol Soft (already partly listed in Phase 1 §14 — design-specific additions): **logo files** (SVG + PNG, light & dark variants — the system reserves exact slots; see §24 open decisions) · favicon + OG image (1200×630 default, template mock available in Phase 4) · hero pattern choice (3 options, §24) · approved abstract-visual style confirmation (node/blueprint motifs) · service summaries/deliverables/process copy AR+EN (Phase 1 voice rules) · FAQ content per service · about-page narrative + values copy · team content + professional photos (if/when enabled) · case-study assets post-approval (screenshots min 1600px wide, 16:9-safe) · EDR initiative: approved wording confirmed as-is (Phase 2 §0) · legal pages: initial **draft templates** to be written in Phase 9 (final reviewer / external counsel pending — LD1) · WhatsApp number (CTA shows the availability message until provided — WA1).

### 22.1 Development & production data policy (DP1)

- **Development/staging** may use clearly labeled fake/test contact data, test leads, and demo content (`@example.com` fixtures, visible "TEST" markers in seed sets); test data is never copied to production.
- **Production public pages must never expose** dummy contact values, fake client details, `[PLACEHOLDER]`, or test data — enforced for case studies by the Public Readiness Gate (Phase 2 §5.2.2) and for contact fields by the rule below.
- In production, **empty/unconfigured public contact fields are hidden**, never rendered with dummy values: Site Settings emptiness omits the field from the footer, contact page, CTA bands, and `contact-config` (Phase 2 §6.8/§6.9).
- Official public email, phone, WhatsApp, address, working hours, social links, and other company contact details remain editable through Site Settings by authorized roles, subject to Phase 2 §2.2 permissions.
- **WhatsApp availability state (WA1):** the CTA is always visually present; in production-unconfigured state it renders the localized availability message directing users to the contact form and email — never a dummy, arbitrary, or unsafe number; dev/staging may use a clearly marked test value; the official number activates the link without code changes (footer, contact page, CTA bands, lead drawer).
- **Test data can never trigger real delivery:** transactional email is env-gated off outside production (dev/staging use captured/dropped sinks with recipients redirected to a sink address); the system has no outbound WhatsApp sending (link-out only).

## 23. Phase 3 Acceptance Checklist
- ✔ Single file delivered: `docs/PHASE_3_DESIGN_SYSTEM_UI_UX.md` — no production code, Docker files, migrations, DB changes, or deploy files
- ✔ Complete visual direction: Arabic-first RTL system with equal English LTR; calm/credible/technical/enterprise style; prohibited-imagery rules explicit
- ✔ Full design system: color (core + ramps + semantic, AA-validated), typography (with Arabic-specific rules), spacing/grid/breakpoints, radius/elevation, iconography, all public + admin components, states, RTL/LTR rules, motion allowlist, accessibility rules, responsive behavior
- ✔ Page-by-page UX + hi-fi textual specs for 8 public + 6 admin surfaces (+2 supporting summaries)
- ✔ Approved hero messages used verbatim (D3); EDR renders only as the separated «قيد التطوير / In Development» card (no CTAs/links); homepage initiatives section disabled at launch; featured-project fallback honored (no placeholders ever public); team hidden by default; legal pages carry the admin-only review banner
- ✔ Theme controls confined to the approved token allowlist; contrast Apply-block carried into the Theme screen spec
- ✔ Closing sections: design rationale, canonical design-token table, 32-item component inventory, responsive rules, accessibility checklist, content/asset requirements
- ✔ Phase 2 carry-forwards honored: confirmed operational defaults shown in relevant admin specs (§16.10–16.14); preview surfaces (§16.17) implement OD2 (log hygiene, `no-referrer`, `no-store`, clean-URL redirect); Backup & Recovery screen (§16.16) implements BD1
- ✔ **Backup & Recovery admin screen (§16.16):** 5 status states, Super-Admin-only schedule enable/disable with bilingual typed confirmations, manual backup request, health/history with sanitized non-sensitive summaries, persistent failure warning with action guidance, empty/failure states, no restore button, no secret exposure, full keyboard/focus/contrast/RTL behavior
- ✔ **Development & production data policy (§22.1):** labeled test data confined to dev/staging; production hides unconfigured contact fields and never renders `[PLACEHOLDER]` or fake details; test data can never trigger real notifications
- ✔ **Approved decisions applied:** legal-page draft templates with the Super Admin `contentOrigin` gate (LD1, §16.15); case-study screenshots-only scope + screenshot review gate UI (CS1, §16.13, §9.2 badges); WhatsApp availability-state CTA everywhere (WA1); confirmed operational defaults reflected in admin specs (OD1)
- ☐ **Client approval to proceed to Phase 4 (Foundation & Infrastructure Build)**

## 24. Genuine Unresolved Design Decisions (only items needing Protocol Soft's choice)
1. **Logo assets** — supply SVG+PNG (light/dark) or commission logo refinement as part of Phase 4 design prep; the system reserves all four slots.
2. **Hero background pattern** — choose one of: (a) blueprint grid, (b) node constellation, (c) radial glow (comps provided in Phase 4 for final pick).
3. **Abstract-visual style** — approve the node-and-line/blueprint motif direction (§3.2) as the house illustration style, or request an alternative direction before any visuals are produced.
4. **Default site mode** — dark proposed (theme default); confirm or choose light/system.
5. **Icon library** — Lucide proposed (MIT, stroke-consistent); confirm or substitute.
6. **Favicon & OG image design** — approve a wordmark-based favicon + abstract-pattern OG template (produced in Phase 4) vs. supplied company assets.
7. *(Carried, not design-blocking)* — final legal reviewer / external counsel for the draft templates (initial templates requested, LD1) · official WhatsApp number (availability-message CTA until provided, WA1) · future EDR domain. *(Operational, not launch-blocking: off-server encrypted backup provider — Cloudflare R2 preferred, not implemented; backups remain disabled until a Super Admin enables them, though launch guidance requires them enabled and restore-tested before relying on production.)*

---

*End of Phase 3 (v1.2). Next phase upon approval: **Phase 4 — Foundation & Infrastructure Build** (repo, Next.js + Payload two-service split, Dockerfiles + local Compose, PostgreSQL with least-privilege roles, auth + RBAC, cloudflared wiring, structured logging, health checks — per Phase 1 §13 / Phase 2 carry-forwards incl. OD2). Stopping here for Protocol Soft's approval.*
