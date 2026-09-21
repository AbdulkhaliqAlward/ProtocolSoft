# Phase 5 — Public Website Build & Local Verification (Acceptance Record)

**Status:** Implementation complete — local development only. Awaiting Protocol Soft review/approval. No staging, production, Cloudflare, backups, or real data were touched.

**Date:** 2026-09-16 · **Environments:** web dev server `http://localhost:3000` · CMS dev server `http://localhost:3001`

---

## 0. Decisions honored (D-1 … D-7)

| Decision | Implementation | Verified by |
|---|---|---|
| **D-1** Screening-gated public media delivery | `GET /api/internal/content/media?id={id}` (CMS) + `GET /api/media/[id]` (web proxy). Gate chain: internal key guard → digits-only id → `visibility=public` → safe-type allowlist (jpeg/png/webp; SVG **only** `category=logos`, sanitized at upload) → PDFs never → `category=projects` additionally requires `sensitivityScreening=approved` → filename path-escape checks. Bytes-only response, no paths/metadata/owner info, generic 404 for every rejection (no existence disclosure), public cache-control + ETag/304, `nosniff`, `inline`, CSP `sandbox`, `no-referrer`. | `verify-media-delivery` 33/33 |
| **D-2** Local-only publish of seed content | `apps/cms/src/scripts/publish-local-review.ts` — production-env refuse guard; publishes 3 services + homepage + about **in the local dev database only**; legal templates, case study, EDR, team, social links untouched. Published-only public API behavior maintained. No SQL dumps / data snapshots committed; the script is code, not a data state. | `verify-public-isolation` 75/75 + DB truth checks |
| **D-3** Approved launch navigation | AR: الخدمات \| من نحن \| تواصل معنا \| English — EN: Services \| About \| Contact \| العربية. No Case Studies / Blog / Team / EDR item. | `verify-public-pages` exact-nav checks (both locales) |
| **D-4** No public /case-studies page | No route exists; `/case-studies` → 404 in both locales. CMS collection, screenshot review gate, and public-readiness gate remain fully intact for the future. | HTTP checks + `evaluatePublicReadiness` still wired into publish endpoint |
| **D-5** Contact form | Required: full name, work email, service interest, message, privacy consent. Optional: phone, company. Service values exactly: Custom Systems Development / Digital Products & Platforms / Cybersecurity Services / General Inquiry — **no EDR** (rejected server-side 422). Localized secrets guidance. Notifications: sink-only (LF-0000SINK honeypot + dev lead sink); no real recipient, no outbound email. | `verify-public-pages` form + lead checks |
| **D-6** Design system & hero options | Full Phase 3 design system implemented (tokens, components, layouts, neutral surfaces, all non-hero components). Temp text brand "بروتوكول سوفت / Protocol Soft" + temp favicon/OG, clearly replaceable. Hero = neutral Option A placeholder-quality treatment; **three options documented in §4 for review before final hero implementation**. | Screenshots §5 |
| **D-7** Email adapter sink-only locally | Resend provisioning deferred to staging; local adapter writes to sink only — no possible delivery to real inboxes. | Code review + no RESEND key in env |

Standing Phase 1–4 constraints preserved: no secrets in Git, no UI read/write path for keys/DB/storage/bucket/server paths, backups disabled (BD1), no restore UI, §6.9 empties hidden, PAYLOAD_SECRET production fail-fast, internal endpoints key-guarded (timing-safe), rate limiting production layer still a launch blocker.

---

## 1. Rendered local routes

### Arabic (default, no prefix) — `http://localhost:3000`
| Route | State | Notes |
|---|---|---|
| `/` | 200 published | Neutral hero, services grid, why, methodology, secure-by-design, CTA band |
| `/services` | 200 published | 3 alternating panels with localized titles |
| `/services/custom-software` | 200 published | Overview, deliverables, capabilities, process, FAQ, CTA |
| `/services/digital-products` | 200 published | Same template |
| `/services/cybersecurity` | 200 published | Defensive-services wording only, no EDR claims |
| `/about` | 200 published | Rich text + feature grid from CMS |
| `/contact` | 200 | Form (D-5) + direct-channels aside (hidden when empty) |
| `/privacy`, `/terms` | **404** | Legal remain drafts — true 404, no shell flush |
| `/case-studies` | **404** | D-4 |
| `/xyz` (unknown) | **404** | Bilingual §16.8 page |

### English — `http://localhost:3000/en`
Same set: `/en`, `/en/services`, `/en/services/custom-software`, `/en/services/digital-products`, `/en/services/cybersecurity`, `/en/about`, `/en/contact` → 200; drafts and unknowns → 404.

Canonical + `hreflang` alternates (ar ↔ en) render on every public page; `lang`/`dir` correct per locale; RTL uses logical CSS properties only.

---

## 2. Test results

| Suite | Command | Result |
|---|---|---|
| Public isolation (registry, published-state, DB truth) | `npm run verify:public-isolation` (cms) | **75/75 pass** |
| Media delivery gate (D-1 full matrix) | `npm run verify:media` (cms) | **33/33 pass** |
| Preview/public-content API | preview suite (cms) | **38/38 pass** |
| Rendered public pages + form E2E | `node scripts/verify-public-pages.mjs` (web) | **68/68 pass** |
| Web build hygiene (no DB/deps leakage) | `npm run verify:no-db` (web) | pass |
| Web typecheck | `npm run typecheck` (web) | clean |
| CMS typecheck | — | **pre-existing** errors only (`verify-roles.ts` AccessArgs, `audit.ts` collectionID) — not introduced by Phase 5 |

### Key verified behaviors inside the suites
- **Media gate matrix:** public raster 200 · private 404 · unscreened project screenshot 404 · screened-approved project screenshot 200 · PDF 404 · non-logo SVG **rejected at upload** (hook) · logo SVG 200 · guard 403 without/with-bad key · param hardening · PNG magic bytes (not JSON, no path/metadata leakage) · `nosniff` · ETag 304 · web proxy passes images only, generic 404 otherwise, never exposes key/CMS URL.
- **Lead pipeline:** valid POST `/api/contact` → 201 + reference code; `service_interest=edr` → 422; honeypot filled → 201 silent sink (LF-0000SINK); per-IP 10/min dev rate limit; HMAC `ipHash` (LEAD_IP_HASH_SECRET); no PII in logs; idempotency key required.
- **Publishing state (DB truth):** exactly 3 services published (ar+en), homepage + about published (real copy, no placeholders), case study = draft, legal = drafts, legal published count = 0.
- **404 semantics:** route-level loading boundary removed so `notFound()` yields true 404 status (tradeoff noted in §6).

---

## 3. Local-dev-only guarantees

- Production refuse-guard inside `publish-local-review.ts` (`NODE_ENV`/`DEPLOYMENT_ENV` checks) — script cannot publish outside local dev.
- Published seed exists **only** in the local dev database; nothing committed as a data state; nothing copied to staging/production (none exist).
- All internal endpoints require `x-internal-key` (timing-safe compare) — direct CMS REST remains closed to the public (verified 403).
- Email/lead notifications: development sink only. No Resend account, no real recipient, no outbound capability locally.
- No real client data, no EDR content published, no legal templates published, no public placeholder/test data rendered (§6.9 empties hidden).

---

## 4. Hero — three visual options for review (D-6)

The currently rendered hero is **Option A**, implemented at neutral placeholder quality so every route is reviewable now. The final hero treatment will be implemented **only after** Protocol Soft selects an option.

### Option A — "Blueprint Neutral" *(implemented now)*
- **Look:** dark navy surface, subtle blueprint-grid pattern, single soft radial accent wash (mirrored per direction), text-forward stack: kicker → large headline → subheadline → primary + secondary CTA → small trust row.
- **Rationale:** zero dependence on logo or imagery; safest against over-promising; reads professional in both RTL and LTR with zero directional risk; fastest to finalize.
- **Effort to finalize:** none beyond polish (it is the current baseline).
- **Risk:** least distinctive of the three.

### Option B — "Split Editorial"
- **Look:** two-column hero — text column keeps the A stack; the second column holds a framed abstract visual panel (pure-CSS schematic/terminal-style illustration, e.g. a stylized architecture diagram or code panel). No real product screenshots, no client imagery.
- **Rationale:** adds a strong visual anchor and "engineering studio" feel without any fake product claims; the panel is abstract so it never misrepresents work.
- **Effort:** one new CSS/SVG component + responsive collapse (panel hides or stacks on mobile).
- **Risk:** the abstract panel must be art-directed carefully in both locales to avoid looking decorative-generic.

### Option C — "Gradient Aurora"
- **Look:** boldest brand-forward treatment: layered brand-blue/teal gradient glows over the dark surface, larger type scale, optional very subtle slow ambient motion (fully disabled under `prefers-reduced-motion`), optional faint grid overlay retained for continuity.
- **Rationale:** most memorable first impression; strongest brand presence once the final logo lands.
- **Effort:** gradient system + motion tokens + reduced-motion variants.
- **Risk:** furthest from the "neutral surfaces" instruction — selected only if Protocol Soft explicitly wants bolder branding; must be checked for text contrast in both locales.

**Review method:** on selection, the chosen option is implemented as the real hero and re-verified (both locales, screenshots). Options B/C can be built behind a temporary query-flag preview locally before commit if desired.

---

## 5. Screenshot index — `docs/screenshots/phase5/`

Viewport-only captures (IAB fullPage stitching was unreliable with the sticky header; all captures visually reviewed correct).

| File | Route |
|---|---|
| `ar-home.png` | `/` |
| `ar-services.png` | `/services` |
| `ar-service-custom.png` | `/services/custom-software` |
| `ar-service-cyber.png` | `/services/cybersecurity` |
| `ar-about.png` | `/about` |
| `ar-contact.png` | `/contact` |
| `en-home.png` | `/en` |
| `en-services.png` | `/en/services` |
| `en-service-custom.png` | `/en/services/custom-software` |
| `en-service-cyber.png` | `/en/services/cybersecurity` |
| `en-about.png` | `/en/about` |
| `en-contact.png` | `/en/contact` |
| `404-ar.png` | `/xyz` |
| `404-en.png` | `/en/xyz` |

---

## 6. Acceptance checklist

| # | Item | Status |
|---|---|---|
| 1 | D-1 media endpoint implemented, gate matrix proven (33/33) | ✅ |
| 2 | D-2 3 services + homepage + about published **locally only**; legal/case-study/EDR untouched; published-only API behavior | ✅ |
| 3 | D-3 exact approved navigation both locales; no forbidden items | ✅ |
| 4 | D-4 no public case-studies route (404); gates intact in CMS | ✅ |
| 5 | D-5 form fields/validation/EDR-rejection/honeypot/sink-only/consent/secrets guidance | ✅ |
| 6 | D-6 design system + all non-hero components + temp brand/favicon; 3 hero options provided (§4) | ✅ |
| 7 | D-7 email sink-only locally; Resend deferred to staging | ✅ |
| 8 | All 14 public routes render correctly in ar+en with correct `lang`/`dir`/canonical/hreflang | ✅ |
| 9 | True 404s for drafts/unknowns; bilingual 404 page | ✅ |
| 10 | Suites: isolation 75/75 · media 33/33 · preview 38/38 · public-pages 68/68 · no-db pass · web typecheck clean | ✅ |
| 11 | No secrets committed; internal endpoints key-guarded; no sensitive UI paths | ✅ |
| 12 | Nothing deployed/published outside local dev; backups untouched; no real data | ✅ |
| 13 | Screenshots for review captured (both locales) | ✅ |

### Known limitations (documented, accepted for Phase 5)
- **404 status tradeoff:** removing the route-level loading boundary (required for true 404 status) means the first paint of *slow* dynamic pages no longer shows a Suspense shell; all current pages render fast locally.
- **CMS typecheck** has two pre-existing errors from Phase 4 scripts (not Phase 5 code).
- Hero is the neutral Option A until a final option is selected (D-6 process).
- Temp favicon/OG image ("P" monogram) intentionally replaceable.

---

## 7. Stop point

Phase 5 is complete per the approved plan and constraints. **Work stops here pending Protocol Soft approval** — specifically: (a) acceptance of this checklist, (b) hero option selection, and (c) authorization for any next phase (staging, Resend, backups, legal finalization, case studies, or launch). No further action will be taken until then.
