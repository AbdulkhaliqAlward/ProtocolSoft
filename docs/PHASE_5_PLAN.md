# Phase 5 — Scope & Execution Plan (for Protocol Soft review)

Date: 2026-09-16 · Status: **PROPOSAL — no Phase 5 code has been written. Nothing in this plan launches, deploys, publishes, or touches production.**
Context: Phase 4 was approved as the local development foundation. Per the roadmap (Phase 1 §13), the CMS core originally planned as "Phase 5" was delivered and verified during build-Phase 4 (collections, globals, versions/preview, leads, audit logs, RBAC — 72/72 + 38/38 suites). The next build increment is therefore the roadmap's **Public Core**.

---

## 1. Phase 5 name and objective

**Phase 5 — Public Core: Complete Public Website Pages (AR + EN).**

Objective: replace the foundation homepage shell with the complete public page set — layout, header/footer, navigation, home, services overview + service template, about, contact (working lead form), case-studies list (empty-state), legal pages (published-only), 404 — in Arabic (default, RTL) and English (LTR), consuming **only** the approved Internal Public Content API (published-only), styled strictly with the approved Phase 3 design system, on the local development stack.

## 2. Exact deliverables (files/components/collections/APIs)

### 2.1 Web app — new pages (all under `apps/web/src/app/[locale]/`, per Phase 3 §16)

| Route | Phase 3 spec | Notes |
|---|---|---|
| `/` (rich homepage) | §16.1 | Rebuild existing shell: hero, services grid, CTA band, technical-initiatives section (In-Development card only), WhatsApp band |
| `/services` | §16.2 | Overview from published services |
| `/services/[slug]` | §16.3 | Service template: hero, deliverables, process steps, FAQs (accessible accordion), initiative section, related, CTA |
| `/about` | §16.4 | About narrative + values; team section renders only when published team content exists (empty-state otherwise) |
| `/case-studies` | §16.5 | List page with identity-free cards + readiness-gate empty state; **no detail route built in Phase 5** (roadmap Phase 7) |
| `/contact` | §16.6 | Working lead form (honeypot, consent, localized errors) + WhatsApp CTA + office info only if configured |
| `/privacy`, `/terms` | §16.7 | Render published Pages by slug; **404 while draft** (already enforced server-side); footer links render only when the page is published |
| `not-found.tsx` | §16.8 | Bilingual 404 |
| `loading.tsx` / `error.tsx` | §11 | Skeletons + bilingual error boundary |

### 2.2 Web app — new/modified components & libs

- **New components** (Phase 3 §8/§9 specs): `Header` (+ mobile drawer, locale switch), `Footer`, `Button`/`TextCta`, `Card` (+ service/team/initiative variants), `Badge`, `SectionHeading`, `FaqAccordion`, `CtaBand`, `ContactForm` (client), `EmptyState`, `LocaleSwitch`.
- **Modified:** `layout.tsx` (skip-link, landmarks, `lang`/`dir`, SEO metadata from SeoSettings: title template, descriptions, canonical + hreflang pairs, robots), `[locale]/page.tsx`, `lib/internalApi.ts` (typed fetchers per content type + revalidate-tag wiring for `/api/web-internal/revalidate`), `components/WhatsAppCta.tsx` (extend to full WA1 availability-state rules), `next.config.mjs` (assets only).
- **New API route:** `apps/web/src/app/api/contact/route.ts` — server-side proxy that forwards validated submissions to the CMS `/api/internal/leads` using the server-only leads key (key never reaches the browser), with the existing honeypot + consent + modest per-IP throttle.

### 2.3 CMS app — minimal, additive only

- All collections/globals/endpoints **already exist** (Phase 4-approved). **No new collections. No schema changes planned.**
- One possible addition (see Decision D-1): a public-media delivery endpoint in the internal registry (`GET /internal/media/[id]`) that streams **only** `visibility = public` assets and, for project screenshots, only `screening = approved` assets (CS1), with immutable caching. If declined, Phase 5 ships text-first pages using Phase 3 §3.4 placeholder-safe visuals.
- Lead email notifications (roadmap-5 residue): wire the Resend adapter behind `RESEND_API_KEY` with `EMAIL_SINK_ADDRESS` enforced in local dev (mail goes to the sink, never to a real inbox).

### 2.4 Not in scope (deferred)

Service **content entry** in full (roadmap Phase 9), case-study **detail** template + projects (roadmap Phase 7), admin custom views — dashboard/leads pipeline/theme customizer/navigation manager (roadmap Phase 8), QA & hardening phase (roadmap Phase 10), staging/production stacks (roadmap Phase 11).

## 3. What will be visible on the public website after Phase 5 (LOCAL DEVELOPMENT ONLY)

- Full public shell: header + navigation (from the Navigation global), footer (site settings + social links when published + WhatsApp availability CTA), AR default at `/`, EN at `/en`, 404 page.
- Homepage with real data shapes and graceful empty states wherever content is still draft (no placeholder tokens — §6.9).
- Services overview + service template rendering **only published** services; with everything seeded draft, they render the approved empty states.
- About, contact page with a working form that stores a lead via the internal API (email to the dev sink), case-studies list with gate empty-state, 404, loading/error states.
- Nothing is deployed anywhere — this exists only on `localhost` in the local compose stack.

## 4. What remains hidden / draft-only / disabled / non-public

| Item | Mechanism preserving its status |
|---|---|
| **Case study** | No detail route exists in Phase 5; list page shows the readiness-gate empty state (CS1 screening never bypassed); seeded case study stays `_status: draft`. |
| **Final legal pages** | Privacy/Terms remain draft templates (LD1): public routes return **404** while draft (server-enforced, suite-checked); footer legal links render **only** when a page is actually published by a Super Admin (`contentOrigin = final` gate untouched). |
| **Real contact details** | Contact-config values stay unconfigured in the seeds; the contact page shows the form + generic copy, and info blocks are **hidden when empty** (§6.9). No real address/phone/email is displayed. |
| **Real WhatsApp link** | WA1: CTA is always visually present but renders the localized **availability message** until the official number is configured — never a dummy number; no `wa.me` link rendered. |
| **Backups** | BackupSettings/records remain admin-only, Super Admin capability-gated, **disabled by default** (BD1); no public surface whatsoever; suites already assert `/internal/backup/*` rejects unauthenticated access. |
| **EDR product claims / sales CTAs** | D2 unchanged: EDR appears only as the «قيد التطوير / In Development» initiative card; its section defaults to disabled; no feature claims, no technical details, no links, no sales CTA. |

Additionally, all existing Phase 4 invariants hold unchanged: published-only public content, direct REST/GraphQL closed to the public, fragment-only preview, no secrets client-side.

## 5. Arabic RTL and English LTR — implementation & testing

- **Implementation:** `dir`/`lang` set per locale at the `[locale]/layout.tsx` root (`ar` → `rtl`, `en` → `ltr`); logical CSS properties only (`margin-inline`, `padding-inline`, `inset-inline-*`) via Tailwind logical utilities; Arabic typography rules from Phase 3 §5.3 (line-height, no uppercase transforms, Latin islands `dir="ltr"` with bidi isolation); icon/chevron direction flips; locale-aware number/date formatting; `LocaleSwitch` preserves the current path and is wired to hreflang alternates.
- **Testing:** every new page renders in **both** directions in local dev; an automated web render check (see §8) asserts `dir`/`lang` per route for both locales and hreflang pairs; manual RTL pass per Phase 3 §12 rule 10 — every component reviewed twice (AR/EN); mixed-content smoke (Arabic text with Latin service names/emails) verified for bidi isolation; screenshot comparison deferred to roadmap Phase 10 full QA.

## 6. Phase 3 design system & accessibility application

- **Design system:** Phase 3 tokens as CSS variables (color §4, typography §5, spacing 4px §6.1, radius/elevation §6.3, iconography §7); components implemented exactly to §8/§9 specs (button variants, card anatomy, badge vocabulary, form states incl. error/summary patterns, header §8.5, footer §8.6, CTA band §8.7); empty/loading/error states per §11 for every surface in both languages; motion per §13 (reduced-motion honored); responsive behavior per §15 (mobile-first grid).
- **Accessibility (WCAG 2.1 AA baseline, Phase 3 §14/§21):** contrast ≥ 4.5:1 (theme-validated tokens), full keyboard operability (menu, drawer, FAQ accordion, form), visible focus ring + skip-link, one `h1` per page + logical heading order, visible form labels with `aria-describedby` errors and focus-targeted summaries, `aria-live` for form status, status never color-only, touch targets ≥ 44px, decorative SVG `aria-hidden`, screen-reader smoke pass (NVDA or VoiceOver) on home + contact at minimum.

## 7. Security constraints Phase 5 must preserve (from approved Phases 1–4)

1. Published-only content: public pages consume **only** the internal registry endpoints; no new public data paths beyond the registry whitelist (structurally asserted by the isolation suite).
2. Direct Payload REST/GraphQL stays closed to the public; admin session + RBAC unchanged; admin origin untouched.
3. Secrets server-side only: the leads key and any email keys live in web service env, used exclusively inside the `/api/contact` server route — never bundled to the client.
4. Preview flow untouched: fragment-only transport, query-string `?code=` rejection, no-store/no-referrer/noindex — Phase 5 adds no preview changes.
5. Lead handling: PII only in the `leads` collection via the internal endpoint; honeypot + consent + `ipHash` (no raw IPs) preserved; no lead data in public responses (suite-checked).
6. Log hygiene: no code/token/PII logging; form content never logged verbatim.
7. Rate limiting: existing app-layer limiters unchanged; **the production rate-limit launch blocker remains open** (Cloudflare WAF and/or Redis/DB-backed) — Phase 5 does not close it.
8. PAYLOAD_SECRET production fail-fast and all .env/Git hygiene rules remain in force.

## 8. Test plan & acceptance checklist

**Automated (extend the two green suites + one new web render check):**
1. `verify-public-isolation.ts` — add: every new public route returns 200 with published-only/empty-state content and **zero** draft titles/strings (services/case-study/legal/team drafts absent from all HTML); draft legal page still 404s publicly; footer legal links absent while drafts; contact flow via `/api/contact` → 201 lead, PII absent from every public response; `/api/contact` rejects unauthenticated abuse patterns (honeypot → silent accept-and-discard, missing consent → 422).
2. New `apps/web/scripts/verify-public-pages.ts` — per route × locale: 200, `dir`/`lang` correct, hreflang pair present, nav/footer render, no code/token leakage, 404 page for unknown slugs.
3. Both existing suites must stay green (72/72, 38/38) — no regressions to preview/REST isolation.

**Manual (checklist, recorded in the phase verification doc):**
- Visual pass vs Phase 3 §16 specs for every page in AR + EN (desktop/tablet/mobile).
- RTL/LTR pass per §5; keyboard + focus pass; form error/summary pass; empty-state pass with all-draft content.
- Lead lifecycle: submit → stored → admin-visible → email lands in the dev sink; no PII anywhere public.

**Acceptance gate:** automated suites green + manual checklist complete + demo walkthrough of every page in both locales on `localhost` — then Phase 5 review by Protocol Soft.

## 9. Decisions Protocol Soft must make before implementation begins

| # | Decision | Recommendation |
|---|----------|----------------|
| D-1 | Public media delivery: add the screening-gated internal media endpoint (2.3), or ship Phase 5 text-first | **Add the endpoint** (CS1 gates enforced; unblocks design fidelity) |
| D-2 | Local publish of the three seeded service drafts + about/homepage content **for local design review only** (nothing deployed, fully reversible; legal/case-study/EDR remain draft regardless) | **Yes** — otherwise every page shows empty states |
| D-3 | Navigation IA for launch: Services, About, Contact (+ locale switch) only? | Confirm as proposed |
| D-4 | Case-studies list page in Phase 5 (empty-state) or deferred to Phase 7/9? | Ship the gated empty-state list now |
| D-5 | Contact form final field set + staging notification recipient (dev sink meanwhile) | Confirm field set; recipient at staging phase |
| D-6 | Hero pattern (3 options, Phase 3 §24) + logo/favicon/OG assets — supply files or approve defaults | Supply when available; defaults keep pages unblocked |
| D-7 | Lead email adapter: Resend account/key provisioned now or deferred to staging? | Key at staging; sink-only locally |

## 10. Local development vs staging vs production-launch

- **Local development (Phase 5 scope):** everything in §2–§8 on the local compose stack only. No deployment, no Cloudflare configuration, no backup enablement, no public publishing beyond D-2's reversible local action.
- **Staging work (later phase, per roadmap):** isolated staging stack on the server, staging review of the built pages, real recipient for lead notifications, real content entry (roadmap Phase 9), staging content review. **Phase 5 performs no staging work.**
- **Production-launch tasks (later phase, roadmap Phase 11 — untouched by Phase 5):** Cloudflare Access+MFA+tunnel + origin tests (B1–B6), production rate-limit layer (WAF/Redis), production DB migrations, `sharp` pipeline, encrypted off-server backups + restore drill (BD1), DNS cutover, launch checklist. All remain open blockers exactly as recorded in `PHASE_4_VERIFICATION.md` §7.

---

*Awaiting Protocol Soft approval or amendment of this plan. No Phase 5 implementation begins without written approval.*
