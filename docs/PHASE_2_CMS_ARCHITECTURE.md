# Protocol Soft — Phase 2: CMS Architecture, Data Model & Admin Dashboard Information Architecture

- Company: Protocol Soft / بروتوكول سوفت
- Document version: 1.5 · Date: 2026-09-13 · Status: **Awaiting client approval**
- Depends on: `docs/PHASE_1_STRATEGY.md` v1.3 (approved)
- Scope of this phase: architecture and data-model design only. No UI screens, no implementation code, no Docker files, no database migrations, no deploy files.

## Version History

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-09-13 | Initial Phase 2 document: field-level Payload schema (11 collections, 6 globals), Internal Public Content API (Option A) boundaries, secure lead flow, Arabic-first bilingual workflow with per-language publishing, admin dashboard IA with textual wireframes, theme token system, media rules, server-side role matrix, audit event catalog, extensibility notes, acceptance checklist. |
| 1.1 | 2026-09-13 | Pre-approval corrections: all dates corrected to 2026-09-13; PostgreSQL credential model clarified (public web: none; CMS: the only application-runtime service with read/write credentials; migration job: separate DDL-only credentials for controlled deploys; backup job: separate read-only credentials for encrypted backups; PostgreSQL private with no published port); client-side lead queueing removed — contact-form PII is never stored in browser storage, and the CMS-outage path shows a bilingual error plus Site-Settings direct channels; web-service secrets separated by purpose (`INTERNAL_CONTENT_API_KEY`, `LEAD_IP_HASH_SECRET`, `PREVIEW_TOKEN_SECRET`); legal review sign-off (`legalReviewedBy/At`) and legal-page publication restricted to Super Admin, with optional `legalApprovalRef`; SEO `titleTemplate` examples corrected; Payload REST/GraphQL wording corrected to "locked down from public access" (admin panel unaffected) with the public site using only the Internal Public Content API. |
| 1.2 | 2026-09-13 | Final consistency & security corrections: SEO `titleTemplate` table cells fixed (unescaped pipes were breaking the markdown table) to exactly `%s \| بروتوكول سوفت` / `%s \| Protocol Soft`; preview tokens switched from a shared symmetric secret to **asymmetric signing** (cms-only `PREVIEW_SIGNING_PRIVATE_KEY` issues; web-only `PREVIEW_VERIFY_PUBLIC_KEY` verifies; ≤ 15-minute tokens bound to collection, document, locale, draft/revision context, and issuing admin — §6.7); the single internal API key split into **directional, least-privilege keys** (`WEB_TO_CMS_CONTENT_READ_KEY`, `WEB_TO_CMS_LEAD_SUBMIT_KEY`, `CMS_TO_WEB_REVALIDATE_KEY`) with per-endpoint-group enforcement and no interchangeability (§1.1, §6.1); form-settings contradiction resolved with the public-safe `GET /internal/content/contact-config` endpoint (§6.8) and the lead flow updated to consume only that subset; new §16 Operational Defaults section created and all former §17 references repaired; decision-register section references corrected (D2→§5.2.3, D3→§5.1.4, D4→§5.2.2, D6→§5.2.4, D8→§14.2, D9→§5.2.5, D10→§14.1); audit/media cross-references fixed; final internal-reference consistency pass. |
| 1.3 | 2026-09-13 | Final architecture clarifications: **Public Readiness Gate** added (§5.2.2) — `[PLACEHOLDER]` values can never render publicly; the delivery-platform case study stays excluded from public rendering until the server-enforced gate passes (AR completeness, EN completeness if intended public, approved public cover, placeholder-free public fields, client-approval rules); the client-gating fallback changed from "[PLACEHOLDER] treatment" to a neutral non-identifying label; homepage `featuredProject` no longer defaults to the delivery platform — with no gate-passing project the homepage renders cleanly without the section or an approved neutral alternative; **preview flow finalized as a one-time code exchange** (§6.7) — cms issues a signed, single-use code bound to collection/document/locale/revision/admin/audience (≤ 15 min), the browser carries only the code, the web verifies the signature with its public key and obtains the exact draft snapshot from the cms via a private-network exchange, URL cleaned after exchange; **Operational Defaults (§16) updated** — "silence = defaults accepted" removed, all defaults require explicit confirmation before production launch (sessions 4h idle / 12h absolute, audit 12 months, leads 12 months then archive/delete per approved policy, versions last 50, preview codes ≤ 15 min one-time, key rotation every 90 days or on suspected compromise). |
| 1.4 | 2026-09-13 | Backup & Recovery operational-control model added (§2.3, §5.1.7 `backup-settings`, §5.3.7 `backup-records`): automated backups **disabled by default**; Super Admin-only schedule enable/disable (bilingual typed confirmations), manual backup requests, and health/history; dashboard controls never expose or allow editing of encryption keys, PostgreSQL/storage credentials, bucket details, or server paths; encrypted off-server mandatory once enabled; restore documented as a separate controlled operational procedure requiring explicit authorization — never a one-click UI action; persistent Super-Admin dashboard warning on failed backups; backup audit events added (§13); backup destination demoted to a non-launch-blocking operational decision (Cloudflare R2 preferred) because backups remain disabled until a Super Admin enables them; Development & production data policy added (§6.9): labeled test data confined to dev/staging, production hides unconfigured contact fields, test data can never trigger real email/WhatsApp/notification delivery. |
| 1.5 | 2026-09-13 | Approved decision updates applied: **legal pages** — Protocol Soft requested initial editable draft templates for Privacy Policy and Terms of Use (§5.2.5 `contentOrigin` draft-template labeling with persistent admin badge; Super Admin legal-review and publishing gate unchanged); **delivery-platform case study** — confirmed public scope is **product screenshots only**; client name, logo, testimonials, commercial metrics, revenue/growth claims, sensitive architecture details, and unapproved technologies are never published; **screenshot review gate** added (mandatory sensitivity screening per media asset: personal data, customer/order data, contact data, credentials/keys, private dashboards, other sensitive info — `sensitivityScreening` on media §5.3.2, gate check 6, audit `media_screening_changed`); **WhatsApp availability-state CTA** — visually present in production regardless of configuration; unconfigured state shows a localized non-deceptive availability message directing to the contact form and email, never a dummy number; dev/staging may use clearly marked test values; official number activates the link without code changes (§5.1.1, §6.8, §6.9); **operational defaults confirmed per security best practices** (§16): admin idle 30 min, absolute 8h, Cloudflare Access session 8h, audit retention 24 months, versions last 50 **or 90 days whichever first**, and once backups are enabled — encrypted off-server daily backups, monthly integrity verification, quarterly restore exercise, retention 30 daily + 12 monthly, with launch guidance requiring backups configured, enabled, and restore-tested before real leads or important production content are relied upon. |

---

## 0. Decision Register (Phase 1 approvals carried into this design)

| # | Confirmed decision | Where it lands in Phase 2 |
|---|---|---|
| D1 | Public data access = **Option A: Internal Public Content API**; web service holds **no PostgreSQL credentials** | §6 (API design), §1 (service boundaries) |
| D2 | EDR = small, separated open-source initiative card on the **Cybersecurity Services page**; homepage "Technical Initiatives" section exists but **disabled at launch**; new approved baseline wording (supersedes the Phase 1 §10.4 wording); no sales CTAs / product claims / links / roadmap / screenshots until approved | §5.2.3 `technical-initiatives`, §5.2.1 `services` placement toggle, §5.1.4 `homepage` |
| D3 | Hero message locked: «نبني أنظمة رقمية موثوقة، ونحميها لتعمل بثقة.» / "Build smarter. Operate securely." | §5.1.4 `homepage.hero` seed content |
| D4 | Delivery-platform case study — **confirmed public scope: product screenshots only** (after the screenshot review gate); client name, logo, testimonials, commercial metrics, revenue/growth claims, sensitive architecture details, and unapproved technologies are **never published** | §5.2.2 gating + screenshot review gate + Public Readiness Gate, §6.3 stripping |
| D5 | No certifications/partnerships displayed at launch | No field is seeded; `site-settings` has no claims block |
| D6 | Team collection built; public team section **hidden by default** | §5.2.4 `team-members` (`visible` default false) |
| D7 | WhatsApp = `[PLACEHOLDER]` in staging, editable in Global Site Settings | §5.1 `site-settings.whatsappNumber` |
| D8 | Analytics: **self-hosted Plausible** — designed for, not implemented in this phase | §14.2 |
| D9 | Privacy Policy & Terms of Use = editable CMS pages, **flagged as requiring legal review before publishing** | §5.2.5 `pages` (`legalReviewRequired` gate) |
| D10 | Blog/Insights out of scope; architecture must be extensible without restructuring | §14.1 |
| D11 | Cloudflare = DNS/security edge (Access + Tunnel); everything else self-hosted on Protocol Soft's server | §1 (context); operational detail per Phase 1 §11.5 |

**Approved EDR baseline wording (v2 — the authoritative version, supersedes Phase 1 §10.4):**
- Arabic: «نعمل على تطوير مبادرة EDR مفتوحة المصدر للرصد والاستجابة على الأجهزة الطرفية. المشروع لا يزال قيد التطوير، وسنشارك تفاصيله عند جاهزيته للاستخدام العام.»
- English: "We are developing an open-source EDR initiative for endpoint visibility and response. The project is still under active development, and more details will be shared when it is ready for public use."

## 1. System Architecture Recap (design context)

Confirmed in Phase 1 (Option A): two containerized services from one codebase —

- **web service** — public Next.js site at `https://protosoftdev.com` (AR) and `/en` (EN). It has **no PostgreSQL credentials** and no Payload admin routes. Its only server-side secrets are the three purpose-specific secrets in §1.1 — none ever exposed to the browser. All content arrives through the Internal Public Content API (§6) over the private Docker network.
- **cms service** — Payload CMS admin panel + API, reachable only at `https://admin.protosoftdev.com` through Cloudflare Access (MFA, deny-by-default) → Cloudflare Tunnel (outbound-only `cloudflared`). The only **application runtime service** with read/write PostgreSQL credentials (`cms_readwrite`).
- **PostgreSQL credential model (separated by purpose):**
  - Public web service: **no PostgreSQL credentials**.
  - CMS/admin runtime service: the only application runtime service with read/write credentials.
  - Migration job: separate **DDL-only** credentials, used only during controlled deployments.
  - Backup job: separate **read-only** credentials, used only for encrypted backups — scheduled/requested via the dashboard control model (§2.3), whose UI never exposes these credentials.
  - PostgreSQL itself stays private on the Docker network — **no published public port**.
- **Payload API exposure:** Payload's REST and GraphQL APIs are **restricted/locked down from public access — not fully disabled** (the admin panel depends on them). Admin API operations remain available only through the Cloudflare Access-protected admin domain, Payload authentication, and server-side RBAC. The public website never touches Payload REST/GraphQL — it consumes only the separate Internal Public Content API (§6), protected by network isolation + a service key.

### 1.1 Server-side secrets inventory (separated by purpose)

**Public web service holds:**

| Secret | Single purpose | Exposure rules |
|---|---|---|
| `WEB_TO_CMS_CONTENT_READ_KEY` | Authenticates web → cms **published public-content reads only** (§6.2 content group) | Server-side env only; outside source control; never sent to the browser |
| `WEB_TO_CMS_LEAD_SUBMIT_KEY` | Authenticates **`POST /internal/leads` only** (§7) | Same |
| `LEAD_IP_HASH_SECRET` | HMAC key producing `ipHash` for lead submissions (§7) | Same |
| `PREVIEW_VERIFY_PUBLIC_KEY` | **Verifies** (never issues) cms-signed one-time preview codes (§6.7) | Same — a public key; powerless to mint codes |

**CMS/admin service holds:**

| Secret | Single purpose | Exposure rules |
|---|---|---|
| `WEB_TO_CMS_CONTENT_READ_KEY` + `WEB_TO_CMS_LEAD_SUBMIT_KEY` | Server-side verification of the two web→cms keys (constant-time compare; per-endpoint-group enforcement, §6.1) | Server-side env only; outside source control; never browser-exposed |
| `CMS_TO_WEB_REVALIDATE_KEY` | Authenticates cms → web **cache-revalidation calls only** (`POST /web-internal/revalidate`, §6.5) | Same |
| `PREVIEW_SIGNING_PRIVATE_KEY` | **Signs/issues** one-time preview codes — the cms is the only service allowed to sign them (§6.7) | Same; the private key never leaves the cms service |
| Email provider API key | Lead notification email (§7) | Same |

The web service holds **no PostgreSQL credentials of any kind**. Keys are **not interchangeable** — each is accepted only by its designated endpoint group (§6.2) — support rotation via a `<KEY>_PREVIOUS` overlap window, and all secrets remain outside source control and never reach the browser.

## 2. Roles & Server-Side Permission Model

Roles are stored on the user record and **enforced server-side on every operation** (Payload access functions; UI hiding is cosmetic only). Field-level access restricts sensitive fields (e.g., only Super Admin may write `role`).

### 2.1 Role definitions

| Role | Purpose | Summary |
|---|---|---|
| **Super Admin** (`super_admin`) | Full system control | Everything, incl. users, roles, audit logs, break-glass management |
| **Content Manager** (`content_manager`) | Content operations | All content, media, navigation, theme, SEO, forms; **not** users/roles |
| **Editor** (`editor`) | Drafting only | Create/edit drafts in both languages; no publish, no settings, no leads |
| **Sales / Leads Manager** (`sales_manager`) | Lead pipeline | Leads only (+ minimal user directory read for assignment) |

### 2.2 Capability matrix (server-enforced)

| Capability | Super Admin | Content Manager | Editor | Sales Mgr |
|---|---|---|---|---|
| Users & roles: create/update/disable | ✔ | — | — | — |
| Read user directory (names/roles for assignment) | ✔ | ✔ | — | ✔ |
| Site Settings, SEO Settings, Form Settings | ✔ | ✔ | — | — |
| Theme Settings (draft + Apply) | ✔ | ✔ | read-only | — |
| Navigation | ✔ | ✔ | — | — |
| Homepage / Services / Projects / Initiatives / Team / Pages | ✔ (publish) | ✔ (publish) | drafts only | — |
| Per-language publish / unpublish actions | ✔ | ✔ | — | — |
| Media: upload, edit metadata | ✔ | ✔ | ✔ (own uploads) | — |
| Media: sensitivity screening (screenshots) | ✔ | ✔ | — | — |
| Media: delete / archive | ✔ | ✔ | — | — |
| Leads: read, manage, assign, status, notes | ✔ | — | — | ✔ |
| Leads: CSV export (audited) | ✔ | — | — | ✔ |
| Audit logs | ✔ (full) | read | — | — |
| Backup & Recovery (schedule, manual request, history) | ✔ | — | — | — |
| Redirects | ✔ | ✔ | — | — |
| Revert to revision | ✔ | ✔ | — (propose) | — |

Additional server-side rules:
- **No shared accounts** — one account per person; accounts disableable, never deleted (audit trail), replaced by `active=false`.
- **No public registration** — the `users` create operation is Super Admin only.
- **Legal pages** — Content Managers may prepare and edit Privacy/Terms drafts, but marking legal review complete (`legalReviewedBy/At`) and publishing legal pages are **Super Admin only** (§5.2.5).
- Every state change above emits an audit event (§13).

### 2.3 Backup & Recovery — operational-control model (confirmed)

**Confirmed requirement:** automated backups are **disabled by default**. The dashboard controls scheduling and requests **only** — it never exposes or allows editing of backup encryption keys, PostgreSQL credentials, Cloudflare R2/storage credentials, bucket details, server paths, or any other server secret.

- **Enable/disable schedule — Super Admin only.** Enabling requires a bilingual confirmation modal showing the selected schedule and the last known successful verification state; disabling requires a bilingual warning plus **typed confirmation**. Both are audit-logged.
- **Manual backup request — Super Admin only** («نسخة احتياطية الآن» / "Back up now"); the request is queued, executed by the server-side backup job, and audited.
- **Health & history — Super Admin only:** record list (type, timestamps, duration, result, verification status/time, **non-sensitive sanitized error summary**). No restore action exists in the UI.
- **Persistent failure warning:** the latest failed backup pins a persistent warning on the Super Admin dashboard ("Needs attention") until a successful backup or verified recovery check clears it.
- **Destination:** remains an operational decision (Cloudflare R2 is the preferred candidate — not implemented, not final). Once backups are enabled, data **must be encrypted and stored off-server**. The dashboard shows only a non-sensitive destination status (`configured / not configured`) — never provider, bucket, path, or credential details.
- **Restore is not a dashboard action.** Restore is documented as a separate controlled operational procedure (authorized server access, runbook, operator identity and timing logged), consistent with the break-glass discipline (Phase 1 §11.5).
- **Secrets boundary:** backup encryption keys, DB credentials, and storage credentials live only in server-side environment/secrets; the backup-control UI and API have **no read path** to them. Roles other than Super Admin have no access to backup controls, destinations, or logs (§2.2); any non-sensitive status summary for other roles requires explicit future approval.

## 3. Localization Model (foundation for every entity)

- Locales: `ar` (default, RTL) and `en` (LTR). `ar` is required first: an entity's Arabic version must be complete and published before the English version can publish (Arabic-first workflow).
- **Localized fields** hold separate values per locale (title, body, SEO copy, labels…). **Structural fields** are shared (slug, ordering, toggles, relations, statuses).
- **Completeness rules:** each localized entity defines a *required-fields-per-locale* list (documented per collection in §5). A locale is `complete` when all required fields for that locale are non-empty.
- **Per-language publishing:** a custom `publishedLocales` field (values: `ar`, `en`) is writable **only** through the "Publish Arabic" / "Publish English" actions, which validate locale completeness server-side. Payload's native `_status` (draft/published) means "published in at least one locale". Unpublish works per locale too.
- **No silent fallback:** public reads serve the requested locale only if it is in `publishedLocales`; otherwise the web service gets a 404 for that content and renders the localized 404 page. `hreflang` pairs are generated only for locales in `publishedLocales`.
- Admin UI shows AR/EN status per document and per field group (§9, §10).

## 4. Entity Map & Relations

```
site-settings ─── media (logo set, favicon, default OG image)
social-links ──── (standalone, ordered list)
navigation ────── pages, services (menu targets)
homepage ──────── services (cards) · case-studies (featured) ·
                  technical-initiatives (optional card) · media
services ──────── case-studies (related) · media (icon/imagery)
case-studies ──── media (cover, screenshots)
technical-initiatives ── media (visuals — publish-gated)
team-members ──── media (photo)
pages ─────────── media (inline)
leads ─────────── users (assignedTo; note authors)
audit-logs ────── users (actor) — system-written
redirects ─────── (standalone)
theme-settings / seo-settings / form-settings ── globals
```

All content relations validate referential integrity (cannot publish content referencing archived media). Media reference-checking prevents deleting assets in use (§13).

---

## 5. Data Model — Field-Level Definitions

Conventions used below:
- **Loc**: `AR/EN` = localized field (separate value per locale; per-locale required unless noted) · `—` = shared field.
- **Req**: required (for the locale's completeness check when localized).
- Validation shorthand: `slug` = `^[a-z0-9]+(?:-[a-z0-9]+)*$`; `email` = RFC-5322; `url` = https-only; `hex` = `^#[0-9a-fA-F]{6}$`; `phone` = `^\+?[0-9\s\-()]{7,20}$`.
- Every collection below: **drafts + versions enabled** (unless noted), **per-language publishing** (§3), **audit events** (§13), and **no public access of any kind** — reads happen only through the Internal API (§6) with the filters in §6.3.

### 5.1 Globals

#### 5.1.1 `site-settings` (Global Settings)
*Access:* read — all admin roles; update — Super Admin, Content Manager. Audit: `settings_changed` (diff summary). Versions: yes (restore previous settings).

| Field | Type | Loc | Req | Validation / notes |
|---|---|---|---|---|
| companyName | text | AR/EN | both | |
| legalCompanyName | text | AR/EN | ar | Legal registered name |
| description | textarea | AR/EN | both | ≤ 300 chars; used in SEO/OG |
| tagline | text | AR/EN | ar | |
| emailMain / emailSales / emailSupport | email | — | main | |
| phone | text | — | — | `phone` |
| whatsappNumber | text | — | — | `phone`; dev/staging may use a clearly marked test value; **empty in production = the public CTA renders in the availability-message state** (§6.8, §6.9) (D7) |
| addressLine | text | AR/EN | — | |
| city / country | text | — | — | |
| workingHours | textarea | AR/EN | — | |
| googleMapsUrl | text | — | — | `url` |
| seoDomain | text | — | ✔ | Fixed default `protosoftdev.com`; hostname validation; display-only (real DNS/DNS/SSL outside the dashboard) |
| footerCopyright | text | AR/EN | both | Supports `{year}` token |
| logoDark / logoLight (SVG+PNG), favicon, defaultOgImage | upload → media | — | logoDark, favicon | Must reference **public** media of matching category (`logos` / `og-images`) |

#### 5.1.2 `theme-settings` (Brand & Visual Tokens)
*Access:* update — Super Admin, Content Manager (draft + Apply); Editor read-only. Full behavior in §11. Audit: `theme_changed`, `theme_reset` (with before/after token diff). Versions: yes (token history = "theme history", admin-visible only).

| Field | Type | Loc | Default | Constraints |
|---|---|---|---|---|
| primaryColor | color | — | `#2563EB` | `hex`; contrast-validated |
| accentColor | color | — | `#22D3EE` | `hex`; contrast-validated |
| darkBackground | color | — | `#071426` | `hex` |
| surfaceDark | color | — | `#0B1220` | `hex` |
| lightBackground | color | — | `#F8FAFC` | `hex` |
| textOnDark / textOnLight | color | — | `#F8FAFC` / `#0F172A` | `hex`; contrast-validated |
| borderSubtle | color | — | `#1E293B` | `hex` |
| buttonStyle | select | — | `filled` | `filled · outline · soft` |
| borderRadius | select | — | `md` | `sm(6) · md(10) · lg(16) · full` — scale only, no arbitrary px |
| animationsEnabled | boolean | — | `true` | |
| defaultMode | select | — | `dark` | `dark · light · system` |
| contrastReport | readonly computed | — | — | Generated pair results (§11.2); visible in admin, never public |

#### 5.1.3 `navigation`
*Access:* Super Admin, Content Manager. Audit: `settings_changed` (scope: navigation).

| Field | Type | Loc | Notes |
|---|---|---|---|
| header.items[] | group array | labels AR/EN | {label (AR/EN, req), target (select: home/about/services overview/case studies/contact/service:<slug>/custom URL), customUrl (`url`, required iff custom), sortOrder, visible} |
| header.cta | group | AR/EN | {label (default «ابدأ مشروعك» / "Start a Project"), target} — the single nav CTA |
| footer.columns[] | group array | titles AR/EN | {title, links[] {label, target/customUrl}, sortOrder} |
| footer.notes | — | — | Legal links and social icons are auto-injected from `pages` (privacy/terms) and `social-links` — not manually duplicated |

Constraint: services dropdown lists the **three** services only; validation rejects menu items targeting disabled/unpublished targets at publish time.

#### 5.1.4 `homepage`
*Access:* Super Admin, Content Manager (publish); Editor drafts. Versions: yes. Per-language publishing: yes. All copy AR/EN; every section has `enabled` + `order` (hero and final CTA anchored first/last).

| Section (group) | Key fields (all copy localized) | Launch defaults |
|---|---|---|
| hero | headline (seed: D3 message), subheadline (names the three services), primaryCta → `/contact`, secondaryCta → services or case study, backgroundPattern (select from 3 predefined subtle patterns) | enabled |
| valueStatement | heading, body, differentiators[3] {title, description} | enabled |
| servicesOverview | heading, intro; cards **auto-derived** from published `services` (title + summary + icon) | enabled |
| whyProtocolSoft | heading, items[4–6] {title, description, icon select} | enabled |
| methodology | heading, steps[4–5] {title, promise} | enabled |
| featuredProject | heading, project (rel → case-studies; **default: none at launch** — must reference a project that passes the Public Readiness Gate, §5.2.2), display options, fallbackMode (hide section · approved neutral alternative block) | enabled — renders its fallback cleanly when no gate-passing project exists; never shows placeholders or empty cards |
| technicalInitiatives | heading, note — renders active initiatives as cards with status label **«قيد التطوير» / "In Development"**; no CTAs, no links | **disabled at launch (D2)**; homepage renders complete without it |
| secureByDesign | heading, body, cta → cybersecurity service | enabled |
| finalCta | heading, body, primaryCta; secondary channels auto-injected from site-settings (WhatsApp/phone) | enabled |

#### 5.1.5 `seo-settings`
*Access:* Super Admin, Content Manager.

| Field | Type | Loc | Notes |
|---|---|---|---|
| titleTemplate | text | AR/EN | Arabic: `%s \| بروتوكول سوفت` · English: `%s \| Protocol Soft` |
| defaultDescription | textarea | AR/EN | ≤ 160 chars |
| defaultOgImage | upload → media | — | |
| canonicalDomain | text | — | `https://protosoftdev.com` (display; matches site-settings) |
| sitemapIncludes | multiselect | — | home, services, case-studies, pages, team (auto when visible) — sitemap covers the public domain only; admin subdomain never included |
| hreflang | fixed-on | — | Always enabled; pairs generated from `publishedLocales` |

#### 5.1.6 `form-settings`
*Access:* Super Admin, Content Manager. Audit: `settings_changed` (scope: forms).

| Field | Type | Notes |
|---|---|---|
| notificationRecipients[] | email | Internal; **never exposed publicly** |
| confirmationMessage | textarea AR/EN | Shown after successful submission — published publicly **only** through the `contact-config` safe endpoint (§6.8); never the full form-settings object |
| rateLimits | group | {perIpPerHour: 5, perIpPerDay: 20, perServicePerMinute: 30} — proposed defaults, adjustable; **CMS-side enforcement** (the web service applies its own env-configured limits, §6.6); never exposed to the web service |
| autoResponderEnabled | boolean | default **false** (enable only after deliverability verified) |
| retentionMonths | number | Lead retention; default 24 (§16 Operational Defaults) |

**Public-safe subset rule:** only `confirmationMessage` and public contact channels from Site Settings are served publicly — exclusively via `GET /internal/content/contact-config` (§6.8). Recipients, rate-limit, auto-responder, and retention settings never leave the CMS.

#### 5.1.7 `backup-settings` (Operational control — Global)
*Access:* read/update — **Super Admin only** (server-enforced; other roles: no access). Audit: `backup_config_changed`. Versions: yes.

| Field | Type | Notes |
|---|---|---|
| scheduleEnabled | boolean | **default false (confirmed)** — backups never run until a Super Admin enables them |
| schedule | group | {frequency (proposed: daily), time (proposed: 03:00 server time — §16)}; changes audited |
| destinationStatus | readonly computed | Non-sensitive label only: `not_configured · configured` — **never** provider, bucket, path, keys, or credentials |
| lastVerification | readonly computed | Non-sensitive snapshot (status + time); consumed by the enable-confirmation modal |

### 5.2 Collections — Content

#### 5.2.1 `services`
*Access:* publish — Super Admin/Content Manager; drafts — Editor. Versions: yes. Indexes: **unique (slug)**; (`_status`), (`sortOrder`).

| Field | Type | Loc | Req | Validation / notes |
|---|---|---|---|---|
| slug | text | — | ✔ | `slug`; unique; seeds: `custom-software`, `digital-products`, `cybersecurity` |
| title | text | AR/EN | both | AR: تطوير الأنظمة المخصصة · تطوير المنتجات والمنصات الرقمية · خدمات وحلول الأمن السيبراني |
| heroHeadline / heroSubhead | text | AR/EN | headline both | |
| icon | select | — | — | From predefined icon set |
| summary | textarea | AR/EN | both | ≤ 200 chars; used in cards/homepage |
| overview | richtext | AR/EN | both | |
| deliverables[] | group array | AR/EN | ≥1 per locale | {title, description} |
| capabilities[] | text array | AR/EN | — | |
| processSteps[] | group array | AR/EN | ≥1 per locale | {title, description} |
| faqs[] | group array | AR/EN | — | {question, answer} |
| relatedProjects | rel → case-studies (many) | — | — | Filtered to published at render |
| initiativeSection | group | — | — | {enabled (default: **true only on `cybersecurity`** — D2), heading AR/EN} — renders the active technical-initiative card; copy comes from the initiative record, not from here |
| seo | group | AR/EN (title/description) | — | {title ≤ 60, description ≤ 160, ogImage → media, noindex} |
| sortOrder | number | — | ✔ | |
| archivedAt | date | — | — | Archive = hidden from admin lists (filterable) + public |

*Required-per-locale for completeness:* title, heroHeadline, summary, overview, ≥1 deliverable, ≥1 process step, seo.description.

#### 5.2.2 `case-studies` (Projects)
*Access:* as services. Versions: yes. Indexes: **unique (slug)**; (`featured`), (`projectType`).

| Field | Type | Loc | Req | Validation / notes |
|---|---|---|---|---|
| slug | text | — | ✔ | `slug`; unique; seed: `delivery-platform` |
| projectType | select | — | ✔ | `client_project · internal_product · open_source · rnd` |
| title | text | AR/EN | both | |
| summary | textarea | AR/EN | both | ≤ 200 chars (list cards) |
| challenge / solution / capabilities / outcomes | richtext | AR/EN | challenge+solution both | Outcomes content must stay `[PLACEHOLDER]` until client approval (D4) |
| technologies[] | text array | — | — | `[PLACEHOLDER]` until approval |
| coverImage | upload → media (public) | — | ✔ | |
| screenshots[] | upload → media | — | — | Category `projects`; **private + stripped from public API until approval** |
| client.name | text | — | — | `[PLACEHOLDER]` |
| client.logo | upload → media | — | — | |
| client.nameVisible / logoVisible | boolean | — | default false | |
| client.approvalStatus | select | — | ✔ | `pending · approved_restricted · approved_full` (default `pending`) |
| client.approvalDate / approvalRef | date / text | — | — | Set when approval exists |
| featured | boolean | — | ✔ | Exactly-one-featured advisory warning |
| timeline | group | — | — | {startDate, endDate} optional |
| seo | group | AR/EN | — | as services |
| sortOrder | number | — | ✔ | |

**Client-identifier gating (server-side, §6.3):** the Internal API includes `client.name`/`client.logo` in responses **only if** `approvalStatus ≠ pending` **and** the corresponding visibility flag is true. Otherwise it returns `client: {approved:false}` and the web renders a **neutral non-identifying label** (e.g., «عميل من القطاع الخاص» / "Private-sector client") — the literal `[PLACEHOLDER]` marker never reaches the browser. Screenshots, technologies, and outcome metrics follow the same rule: omitted entirely, never replaced by placeholder text.

**Confirmed public scope for the delivery-platform case study (client decision):** the only currently approved public material is **product screenshots** — after the screenshot review gate below. The following are **never published**: client name, client logo, testimonials, commercial metrics, revenue/growth claims, sensitive architecture details, and unapproved technologies. Server-side stripping (§6.3) enforces this regardless of admin-facing content, and any future scope expansion requires new written client approval.

**Screenshot review gate (mandatory, pre-publication).** Every screenshot intended for public display must pass a documented sensitivity screening before it can render publicly:

| Screened for | Requirement |
|---|---|
| Personal data | No names, faces, emails, or identifiers of any person |
| Customer/order data | No real customer records, order details, or transaction data |
| Contact data | No phone numbers, addresses, or messaging identifiers |
| Credentials & keys | No API keys, tokens, passwords, or connection strings |
| Private/internal dashboards | No admin views, internal tooling, or non-public metrics |
| Other sensitive info | Anything else Protocol Soft flags as non-publishable |

Screening state lives on the media asset — `sensitivityScreening` (`unscreened · pending · approved · rejected`, with reviewer, time, notes; §5.3.2) — and is audit-logged (`media_screening_changed`). The Public Readiness Gate refuses publication while any attached screenshot is not `approved`.

**Public Readiness Gate (server-enforced).** `[PLACEHOLDER]` values must never appear on the public website, so a case study is **excluded from all public rendering** until it passes the gate. `publicReadiness` is computed server-side, evaluated at per-locale publish time and re-checked by the Internal API filter (§6.3, invariant 7) as defense in depth. All checks must pass for the locale being published:

| # | Check | Rule |
|---|---|---|
| 1 | Arabic completeness | AR required-fields complete (per §3) |
| 2 | English completeness | EN required-fields complete **if the EN version is intended to be public**; otherwise EN simply stays out of `publishedLocales` |
| 3 | Approved public cover | `coverImage` exists, is a **public-visibility** media asset, and is either client-approved or an approved abstract/non-client-identifying visual (private screenshots never qualify as cover) |
| 4 | Placeholder scan | **No unresolved `[PLACEHOLDER]` value in any public-facing field of that locale** — title, summary, challenge, solution, capabilities, outcomes, technologies, client fields, and image alt texts; any match fails the gate |
| 5 | Client-approval rules | name, logo, screenshots, technologies, metrics, outcomes, and all other sensitive material respect the gating rules above — nothing beyond the approved scope is exposed |
| 6 | Screenshot review gate | every attached screenshot has `sensitivityScreening = approved` (§5.2.2); any unscreened or rejected asset keeps the gate closed |

While the gate fails, the delivery-platform case study stays draft/private in effect: list endpoints omit it, direct slug requests 404 publicly, and the admin shows exactly which check is failing. `technologies` remains `[PLACEHOLDER]` in the CMS until approval, so its gate stays closed by design.

#### 5.2.3 `technical-initiatives`
*Access:* as services. Versions: yes. Indexes: (`status`).

| Field | Type | Loc | Req | Notes |
|---|---|---|---|---|
| title | text | AR/EN | both | Seed: «مبادرة EDR مفتوحة المصدر» / "Open-Source EDR Initiative" |
| category | select | — | ✔ | `open_source · rnd · internal_tool` |
| status | select | — | ✔ | `in_development · available · archived`; default `in_development`; renders the mandatory status label **«قيد التطوير» / "In Development"** while `in_development` |
| shortDescription | textarea | AR/EN | both | Seed = the approved D2 wording (§0) |
| placements.cybersecurityCard | boolean | — | — | default **true** (D2 primary placement) |
| placements.homepageSection | boolean | — | — | default **false** (D2; section itself disabled at launch) |
| links.github / docs / website / community | group | — | — | Each: {url (`url`), approvedForPublish (bool, default false)} — **excluded from all public output unless `status = available` AND `approvedForPublish = true`** |
| visuals[] | upload → media | — | — | Publish-gated off by default (D2: no screenshots) |
| roadmap | richtext | — | — | Reserved; rendered only when explicitly approved |
| featured | boolean | — | — | |

*Public exposure at launch is intentionally limited to:* title, status label, shortDescription — nothing else (§6.3).

#### 5.2.4 `team-members`
*Access:* as services. Versions: yes. Indexes: (`visible`, `sortOrder`).

| Field | Type | Loc | Req | Notes |
|---|---|---|---|---|
| name | text | — | ✔ | Shared (names are not localized) |
| jobTitle | text | AR/EN | both | |
| bio | richtext | AR/EN | — | |
| photo | upload → media (category `team`) | — | for publish | |
| linkedinUrl | text | — | — | `url` |
| visible | boolean | — | ✔ | **default false (D6)** — public section renders nothing until content/photos exist |
| sortOrder | number | — | ✔ | |

#### 5.2.5 `pages` (About, Privacy, Terms, future static pages)
*Access:* as services; **legal pages additionally gated** (below). Versions: yes. Indexes: **unique (slug)**.

| Field | Type | Loc | Req | Notes |
|---|---|---|---|---|
| slug | text | — | ✔ | `slug`; unique; reserved seeds: `about`, `privacy`, `terms` |
| title | text | AR/EN | both | |
| blocks[] | blocks array | AR/EN | ≥1 per locale | Allowed blocks only: `contentRichText`, `featureGrid`, `faqAccordion`, `ctaBanner`, `mediaText` (constrained builder — no free-form layout) |
| legalReviewRequired | boolean (auto) | — | — | Auto-**true** for slugs `privacy`, `terms` (D9); cannot be unset on these |
| legalReviewedBy / legalReviewedAt | text / date | — | — | **Set by Super Admin only** (field-level access) after legal sign-off; Content Managers may prepare and edit drafts but cannot mark review complete or publish |
| legalApprovalRef | text | — | — | Optional reference to the internal document, ticket, or external legal reviewer authorizing the sign-off |
| inNav | boolean | — | — | about=true; privacy/terms auto in footer |
| seo | group | AR/EN | — | |

**Publish gate (two-key rule):** for legal pages, per-locale publish is **blocked server-side** until `legalReviewedBy/At` are set — and both setting those fields and publishing legal pages are **Super Admin-only operations** (server-enforced; Content Managers can prepare and edit the drafts only). The edit screen shows a persistent flag: «يتطلب مراجعة قانونية قبل النشر» / "Requires legal review before publishing", plus the read-only approval reference.

**Draft-template seeding (confirmed):** Protocol Soft has requested initial editable draft content for the Privacy Policy and Terms of Use. Phase 9 content entry seeds both pages with structured bilingual draft templates, persistently badged in the admin as «مسودة نموذجية — تتطلب مراجعة Protocol Soft النهائية ومراجعة قانونية حيث يلزم» / "Draft template — requires Protocol Soft final review and, where appropriate, legal review before publication". A new `contentOrigin` field (`draft_template` default for these slugs · `final`) is switched to `final` by **Super Admin only**, together with the legal-review fields; the two-key publish gate is unchanged and both transitions are audited.

### 5.3 Collections — System

#### 5.3.1 `users` (auth)
*Auth:* Payload authentication; HTTP-only, Secure, SameSite cookies; session expiration (proposed defaults in §16 — Operational Defaults); revocation on password change/reset; **login rate limiting** (progressive backoff per account+IP). No public registration. MFA: reserved hook point (Payload-native when enabled; Cloudflare Access already enforces MFA pre-login).

| Field | Type | Notes |
|---|---|---|
| email | email | unique (auth identity) |
| password | auth | Policy: ≥ 12 chars, mixed; server-validated; secure reset flow (time-limited, single-use token) |
| name | text | ✔ |
| role | select | `super_admin · content_manager · editor · sales_manager`; **writable by Super Admin only** (field-level access) |
| preferredAdminLocale | select | `ar (default) · en` — admin UI language |
| active | boolean | default true; disabling revokes sessions; accounts never deleted |

Indexes: unique email (native). Audit: `login_success`, `login_failure`, `password_reset_requested`, `password_reset_completed`, `user_created`, `user_updated`, `user_disabled`, `role_changed`.

#### 5.3.2 `media` (upload collection)
Detailed rules in §12. Definition summary: file + `altText` (AR/EN, required for public use), `caption` (AR/EN), `category` (`logos · og-images · team · projects · initiatives · content · documents`), `tags[]`, `visibility` (`public · private`, default `public` except categories `documents`/`projects` screenshots which default `private`), focal point, generated sizes, and `sensitivityScreening` group (`status: unscreened · pending · approved · rejected`, reviewedBy, reviewedAt, notes) — required for any publicly displayed project screenshot; changes audited as `media_screening_changed`.

#### 5.3.3 `leads`
*Access:* **create — internal API only** (§7); read/update — Super Admin + Sales Manager; delete — Super Admin (prefer archive status); notes admin-only. No public read of any kind. Indexes: (`status`, `submittedAt` desc), (`assignedTo`), (`email`), (`ipHash`).

| Field | Type | Notes |
|---|---|---|
| fullName | text | ✔ ≤ 120 |
| company | text | ≤ 120 |
| email | email | ✔ |
| phone | text | `phone`, optional |
| serviceInterest | select | `custom_software · digital_products · cybersecurity · general` (**no EDR option** — D2) |
| message | textarea | ✔ ≤ 2000 |
| sourceLocale | select | `ar · en` |
| pagePath | text | Origin page |
| consent | boolean | must be true |
| ipHash | text | HMAC of the submitter IP with `LEAD_IP_HASH_SECRET` (server-side key; abuse analytics only; raw IP never stored) |
| submittedAt | datetime | default now |
| status | select | `new · contacted · qualified · proposal_sent · won · lost · archived` (default `new`) |
| assignedTo | rel → users | |
| notes[] | group array | {author (auto), body ≤ 2000, createdAt} — internal only |
| referenceCode | readonly | Short public-facing code returned to the submitter |

#### 5.3.4 `audit-logs`
*Access:* read — Super Admin (full), Content Manager (read); write — **system only** (hooks); purge — retention job only. Indexes: (`eventTime` desc), (`eventType`), (`actor`). Retention: proposed 12 months (§16). Event catalog: §13.

| Field | Type | Notes |
|---|---|---|
| eventTime | datetime | |
| actor | rel → users or `system` / `public-api` | |
| eventType | select | §13 |
| entity | group | {collection, id, slug, locale} |
| changesSummary | textarea | Sanitized diff summary — **never secrets, tokens, or full PII dumps** |
| ipHash / userAgent | text | Where applicable |

#### 5.3.5 `social-links`
*Access:* Super Admin, Content Manager. Indexes: (`sortOrder`).

| Field | Type | Notes |
|---|---|---|
| platform | select | `linkedin · x · instagram · facebook · youtube · whatsapp · github · other` |
| label | text AR/EN | optional override |
| url | text | `url` ✔ |
| visible | boolean | default true |
| sortOrder | number | ✔ |

#### 5.3.6 `redirects`
*Access:* Super Admin, Content Manager. Indexes: **unique (from)**.

| Field | Type | Notes |
|---|---|---|
| from | text | path, leading `/` ✔ |
| to | text | path or `url` |
| statusCode | select | `301 · 302 · 307 · 308` |
| active | boolean | default true |

#### 5.3.7 `backup-records` (system-written)
*Access:* read — Super Admin only; write — system (backup job) only. Indexes: (`startedAt` desc), (`status`).

| Field | Type | Notes |
|---|---|---|
| type | select | `scheduled · manual` |
| status | select | `running · success · failed · verification_required · verified` |
| startedAt / finishedAt / duration | datetime / number | |
| verification | group | {status, checkedAt} |
| triggeredBy | rel → users or `system` | |
| errorSummary | text | **Sanitized, non-sensitive** — stripped of paths, hosts, credentials, and stack traces before storage |

---

## 6. Internal Public Content API (Option A — confirmed)

### 6.1 Transport & Authentication
- JSON-over-HTTP on the **private Docker network only** (cms internal port; never routed through the proxy or tunnel; the only client is the web service).
- Service-to-service auth: **three directional, least-privilege keys** (§1.1) sent as `x-internal-key` — `WEB_TO_CMS_CONTENT_READ_KEY` (published public-content reads only), `WEB_TO_CMS_LEAD_SUBMIT_KEY` (`POST /internal/leads` only), and `CMS_TO_WEB_REVALIDATE_KEY` (cms → web revalidation only). **Server-side endpoint-group enforcement:** each endpoint group accepts only its designated key — a content-read key presented to `/internal/leads`, a lead key presented to a content endpoint, or any service key presented to a preview endpoint is rejected (403 + structured log). Keys are never interchangeable, comparisons are constant-time, and rotation uses a `<KEY>_PREVIOUS` overlap window. Network-level restriction (web/cms containers only, private Docker network) is the outer layer; the keys are the inner layer. mTLS: optional future hardening.
- All responses: JSON envelope `{ "locale": "ar", "data": … }`; `fallbackUsed` is always `false` (no silent fallback, §3).
- Every request is logged (structured logging, request-id) server-side on the cms service.

### 6.2 Allowed endpoints (complete list — anything not listed returns 404)

| Endpoint | Method | Auth required | Purpose |
|---|---|---|---|
| `/internal/health` | GET | none (private network only) | Liveness/readiness probe |
| `/internal/content/site-settings` | GET | Content-read key | Public subset (§6.3) |
| `/internal/content/social-links` | GET | Content-read key | Visible, ordered |
| `/internal/content/navigation` | GET | Content-read key | Published nav for locale |
| `/internal/content/theme` | GET | Content-read key | Applied (public) theme tokens only |
| `/internal/content/homepage` | GET | Content-read key | Published homepage for locale |
| `/internal/content/services` · `/services/{slug}` | GET | Content-read key | Published services |
| `/internal/content/case-studies` · `/{slug}` | GET | Content-read key | Published projects (approval-stripped) |
| `/internal/content/initiatives` | GET | Content-read key | Active initiatives — **card-safe fields only** |
| `/internal/content/team` | GET | Content-read key | Visible members only |
| `/internal/content/pages/{slug}` | GET | Content-read key | Published pages |
| `/internal/content/redirects` | GET | Content-read key | Active redirects |
| `/internal/content/seo` | GET | Content-read key | Global SEO defaults |
| `/internal/content/contact-config` | GET | Content-read key | **Public-safe form/contact subset (§6.8)** |
| `/internal/leads` | POST | Lead-submit key | Lead submission (§7) — the only write; content-read key rejected |
| `/internal/preview/{collection}/{slug}` + `POST /internal/preview/exchange` | GET / POST | One-time preview code (§6.7) | Preview code validation and draft-snapshot exchange — **service keys are not accepted** |

`POST /web-internal/revalidate` lives on the **web service** (not part of this table) and accepts only `CMS_TO_WEB_REVALIDATE_KEY` (§6.5).

Query parameters: `locale` (`ar` default; unknown → 400), pagination for list endpoints, `placement=` filter for initiatives.

### 6.3 Filtering invariants (enforced in the cms, not the web)
Every read endpoint returns **only**:
1. `_status = published` **and** `publishedLocales` contains the requested locale;
2. entity-level visibility true (`visible`, not archived, section `enabled`);
3. `case-studies`: client name, logo, testimonials, commercial/revenue metrics, sensitive architecture details, unapproved technologies, and any screenshot without `sensitivityScreening = approved` are stripped per the confirmed scope and gating rules (§5.2.2);
4. `technical-initiatives`: title + statusLabel + shortDescription only, and only for placements enabled; **links, visuals, roadmap never included** unless `status = available` **and** `approvedForPublish = true` per link;
5. `team-members`: `visible = true` only;
6. `media` references: public-visibility assets only; private media is never addressable through this API.
7. `case-studies` additionally pass the **Public Readiness Gate** (§5.2.2) — gate-failing projects are excluded from every list and slug response regardless of admin publish state; homepage `featuredProject` references are validated against the same gate at render time.

### 6.4 Explicitly forbidden data (never returned, any endpoint, any parameter)
Drafts · revisions/version history · leads · users, roles, sessions · audit logs · internal lead notes · private media · **form settings entirely — recipients, rate-limit config, auto-responder and retention settings** (the only public-safe subset is the `contact-config` endpoint, §6.8) · CMS configuration or environment data · theme history/contrast reports · unpublished-locale content · EDR links/roadmap/visuals/technical details until approved (D2) · client-identifying case-study data under `pending` approval.

### 6.5 Caching, revalidation & performance
- Web renders with ISR (tag-based cache). Each API response declares cache tags (e.g., `services:cybersecurity:ar`, `homepage:ar`, `theme`) and short s-maxage with stale-while-revalidate.
- **On publish/unpublish/apply, the cms calls the web service's internal revalidation endpoint** (`POST /web-internal/revalidate`, authenticated with `CMS_TO_WEB_REVALIDATE_KEY`, private network) with the affected tags — content changes appear without redeploy.
- Preview traffic bypasses cache entirely (one-time preview codes, §6.7).
- ETag on GET responses; web sends If-None-Match; 304s keep internal traffic minimal.

### 6.6 Rate limits (proposed defaults — adjustable, alerting on breach)
- Content reads: 600 req/min per service (web is the sole client; this is burst headroom).
- Lead POST: enforced at web (per-IP: 5/hr, 20/day — **web-side env-configured**, deliberately independent of form-settings) **and** cms (per-ipHash: 30/min service-wide — from form-settings, §5.1.6).
- Preview: 60/min.
- Exceeding → 429 + structured log + alert; never blocks the admin panel (separate surface).

### 6.7 Preview architecture — final flow (one-time code exchange)

One complete, unambiguous flow. The **one-time code is the only browser-carried credential**; the draft snapshot itself travels only over the private Docker network. Asymmetric signing is kept **internally**: the cms signs, the **web service verifies** the signed data, and the snapshot is always fetched from the cms.

1. **Issue (cms):** an authenticated admin clicks **Preview** (§8.3). The cms signs a one-time preview code with `PREVIEW_SIGNING_PRIVATE_KEY` (asymmetric — e.g., Ed25519/ES256) carrying mandatory binding claims — collection, document id/slug, locale, exact draft/revision snapshot id, issuing admin, audience `web-preview`, `exp` ≤ **15 minutes** — plus a unique `jti`. The cms stores the `jti` server-side (hashed at rest) with `used = false`; single-use state lives only in the cms.
2. **Carry (browser):** the browser opens the public web preview URL with the code (`/preview?code=…`). The code is the only thing the browser ever receives; it grants no direct data access by itself.
3. **Verify (web):** the web service verifies the signature with `PREVIEW_VERIFY_PUBLIC_KEY` (the **web service is the verifier of signed data**) and checks `exp`, the `web-preview` audience, and that the requested collection/slug/locale match the code's claims exactly.
4. **Exchange (private network):** the web service calls `POST /internal/preview/exchange` on the cms over the private Docker network, presenting the code. The cms atomically consumes the `jti` (a second use fails) and returns **only the exact bound draft snapshot** — that document, that locale, that revision — nothing else.
5. **Render (web):** the single preview renders with `noindex`, `Cache-Control: private, no-store`, no public navigation link, and no normal-cache/ISR reuse. The URL is cleaned after the exchange where practical (`history.replaceState`) so the code does not linger in the address bar, browser history, or referrers.

**Guarantees:**
- A code expires within 15 minutes and is **invalid after first use**.
- No code grants access to any other document, locale, user, collection, or revision — binding claims are checked on both verify and exchange.
- Service keys are rejected on preview endpoints; the one-time code is their only credential.
- Drafts and unpublished-locale content are reachable **only** through this path; normal public-content endpoints never return drafts under any parameter (§6.3, §6.4).

### 6.8 Public-safe contact configuration (`GET /internal/content/contact-config?locale=ar|en`)

Form Settings (§5.1.6) is confidential; this narrowly scoped endpoint is the only way the public site receives anything from it.

**Returns (per locale):**
- Localized `confirmationMessage`
- Public contact channels derived from Site Settings: main/sales/support emails, phone, **WhatsApp state** (`configured` + URL, or `unconfigured`), working hours and address lines. The WhatsApp CTA stays visually present in both states; the `unconfigured` state renders a localized non-deceptive availability message (§6.9) — never a dummy number.
- Unconfigured public contact fields are **omitted** in production — never replaced with dummy values (§6.9).

**Never returns:** notification recipients · rate-limit configuration · auto-responder configuration · retention settings · secrets · administrative settings.

Cache tag `contact-config:{locale}`, revalidated when form-settings or site-settings publish (§6.5).

### 6.9 Development & production data policy

- **Development/staging** may use clearly labeled fake/test contact data, test leads, and demo content (`@example.com` fixtures, visible "TEST" markers in seed sets); test data is never copied to production.
- **Production public pages must never expose** dummy contact values, fake client details, `[PLACEHOLDER]`, or test data (the Public Readiness Gate enforces this for case studies; §6.8 enforces it for contact fields).
- In production, **empty/unconfigured public contact fields are hidden**, never rendered with dummy values — Site Settings emptiness omits the field from footer, contact page, CTA bands, and `contact-config`.
- Official public email, phone, WhatsApp, address, working hours, social links, and other contact details remain editable through Site Settings by authorized roles under Phase 2 permissions (§2.2).
- **WhatsApp availability-state rule:** the CTA remains **visually present** in the public UI and is configurable through Site Settings. If no valid WhatsApp number is configured in production, the CTA renders a localized non-deceptive availability message directing users to the contact form and email — it **never routes visitors to a dummy, arbitrary, or unsafe number**. Development/staging may use a clearly marked test value. Once Protocol Soft enters the official number, the same CTA becomes an active WhatsApp link **without code changes**.
- **Test data can never trigger real delivery:** transactional email is env-gated off outside production (dev/staging use captured/dropped sinks, recipients redirected to a sink address); the system has no outbound WhatsApp sending (link-out only).

---

## 7. Secure Lead Submission Flow

1. **Public form** (web, `/contact`): client-side validation + hidden honeypot field + optional time-trap (form must take ≥ 2s).
2. **Web server route** (never the browser) validates: schema (§5.3.3 fields, consent = true, message ≤ 2000), per-IP rate limit (**web-side env-configured limits**, §6.6 — form-settings never reaches the web service), then builds the internal payload: fields + `sourceLocale` + `pagePath` + `ipHash` (HMAC with the server-side `LEAD_IP_HASH_SECRET`) + truncated user-agent + a server-generated idempotency key. Sent with `WEB_TO_CMS_LEAD_SUBMIT_KEY`.
3. **CMS `/internal/leads`** re-validates everything server-side (schema, honeypot must be empty, rate limit by ipHash, service-interest enum), creates the Lead (`status: new`), emits `lead_created` audit event, enqueues the notification email to `form-settings.notificationRecipients` via the transactional provider (async — email failure never blocks the response; retried with backoff; API key lives in env only). **Delivery is environment-gated:** notifications are disabled by default outside production (§6.9), so test data can never trigger real email.
4. **Response 201** with `referenceCode`; the web shows the localized `confirmationMessage` plus public contact channels fetched from `GET /internal/content/contact-config` (§6.8 — safe subset only) alongside the reference code.
5. **CMS unavailable:** the web service returns a clear bilingual error state and displays the approved direct contact channels from Site Settings (email/phone); the visitor may retry later. **Contact-form data — names, emails, phone numbers, project messages — is never stored client-side**: not in localStorage, sessionStorage, cookies, or any client-side queue. A retry re-submits the form data fresh; the server-generated idempotency key only prevents duplicate writes if a retried request races the original.
6. **Admin pipeline:** Sales Manager works the lead (status transitions audited as `lead_status_changed`; assignment; notes). CSV export is server-generated, role-gated, and audited (`lead_exported`).
7. No auto-responder at launch (default off, D7-adjacent); enable later via form-settings after deliverability is verified.

---

## 8. Bilingual Arabic-First Workflow

### 8.1 Authoring order
Arabic first: an entity can only publish English **after Arabic is complete** (server-enforced: "Publish English" is unavailable until `publishedLocales` includes `ar`… Arabic completeness precedes). Editors may draft both languages simultaneously.

### 8.2 Translation completeness
- Per-document badges: `AR: منشور / مسودة / غير مكتمل` and `EN: …` on every list row and edit header.
- Per-field-group indicators inside the editor (field-level missing-translation highlighting when the other locale has content).
- Dashboard widget: "Missing English translations" listing unpublished-EN published-AR documents (the only actionable gap, by design).

### 8.3 Drafts, previews, publishing
1. Save draft (autosave, both locales independently editable) → document `_status: draft`.
2. **Preview**: the one-time code exchange flow (§6.7) — the cms signs a single-use preview code bound to collection, document, locale, revision snapshot, issuing admin, and the `web-preview` audience (≤ 15 minutes); the browser opens the web preview URL with the code; the web verifies it with its public key and pulls the exact draft snapshot from the cms over the private network; the preview renders `noindex`, uncached, watermark optional, and the URL is cleaned after the exchange.
3. **Publish Arabic** (validates AR completeness) → `publishedLocales += ar`; revalidation fires (`…:ar` tags).
4. **Publish English** (available only after AR is published; validates EN completeness) → `publishedLocales += en`; hreflang pair activates.
5. **Unpublish** works per locale (e.g., EN pulled for re-translation while AR stays live).

### 8.4 Revisions & recovery
- Every save (manual + autosave) creates a version; revisions retained (proposed: last 50 per entity — §16).
- Any version restorable (diff view before restore); restore emits `revert` audit event with the version timestamp.
- Globals (site-settings, navigation, homepage, theme, seo, form) versioned the same way — settings misfires are recoverable.

---

## 9. Admin Dashboard Information Architecture

### 9.1 Structure & navigation (sidebar, AR-first RTL; EN LTR switchable)
```
لوحة التحكم / Dashboard
المحتوى / Content
  الرئيسية (Homepage) · الخدمات (Services) · المشاريع (Projects)
  المبادرات التقنية (Technical Initiatives) · الصفحات (Pages) · الفريق (Team)
  القوائم (Navigation)
الوسائط / Media Library
طلبات التواصل / Leads            ← sales_manager lands here by default
الإعدادات / Settings
  إعدادات الموقع (Site) · الهوية البصرية (Theme) · SEO · النماذج (Forms) · التحويلات (Redirects)
المستخدمون والأدوار / Users & Roles      ← super_admin only
سجل التدقيق / Audit Logs                ← super_admin + content_manager (read)
```
Role-based menu trimming (sales sees only Leads; editor sees Content + Media).

### 9.2 Key screens
Dashboard home (role-aware), translation-status center, collection lists with AR/EN status columns, editors with locale tabs + per-locale publish bar, version/diff/restore view, leads table + detail, theme customizer, media library, audit log viewer, users & roles.

### 9.3 Core user flows
- **F1 — Publish a service (AR→EN):** Services → edit → AR tab complete → Preview (AR) → Publish Arabic → EN tab → translate → Preview (EN) → Publish English → revalidation automatic.
- **F2 — Case study with client approval:** create project → fill content → client fields `[PLACEHOLDER]`, approvalStatus `pending` → publish → on written approval: set status/flags/date → publish update → identifiers appear.
- **F3 — Manage the EDR card:** Technical Initiatives → EDR record → edit shortDescription (approved wording pre-seeded) → placements (cybersecurity card on, homepage off) → publish. Links/visuals/roadmap show locked-until-approved states.
- **F4 — Sales triage:** Leads (default view) → new lead → open → status → Contacted → assign → note → later Qualified → Proposal Sent → Won/Lost; export filtered CSV.
- **F5 — Theme change:** Theme → adjust token (live mini-preview updates instantly) → contrast check runs → Apply (blocked if any pair fails) → audit + revalidation; Reset-all returns to defaults (also audited).
- **F6 — Editor drafting:** Editor edits and Previews only; publish buttons are server-absent, not just hidden.
- **F7 — Legal page:** Content Manager edits the Privacy/Terms draft → "Requires legal review" banner persists → after sign-off, **Super Admin** sets reviewed-by/date (+ optional `legalApprovalRef`) → **Super Admin publishes**; neither step is available to Content Managers (server-enforced).

### 9.4 Empty states (bilingual, instructive, never fake)
- Leads: "لا توجد طلبات بعد — سيظهر هنا أول طلب من نموذج التواصل." + link to form settings.
- Initiatives: explains the module's purpose and the D2 constraints (no links/CTAs until approved).
- Team: "قسم الفريق مخفي افتراضياً — أضف أعضاء وفعّل الظهور عند الجاهزية." (hidden-by-default, D6).
- Missing EN: "النسخة الإنجليزية لم تبدأ بعد" + one-click "copy Arabic as starting point" (creates draft EN from AR — clearly marked untranslated).
- Media: upload CTA + rules summary; Audit: system-populated (never truly empty); 404/no-permission states in both languages.

### 9.5 RTL requirements (admin UI)
- RTL is the **default** direction (AR default locale); layout mirrors when EN selected — `dir` attribute drives everything; spacing uses logical properties (start/end), never left/right.
- Arabic font: IBM Plex Sans Arabic; Latin fallback Inter. Numerals: Western digits (0–9) for consistency; dates Gregorian, locale-formatted.
- Bidi isolation for Latin fragments inside Arabic text (slugs, URLs, codes) via Unicode isolation so punctuation doesn't jump.
- Directional icons (arrows, back) flip; non-directional icons don't. Tables sort/read RTL; toasts, modals, drawers direction-aware.
- Language switcher switches **admin chrome + content-editing locale together**, with a clear indicator of which content locale is being edited.

---

## 10. Low-Fidelity Textual Wireframes

### W1 — Dashboard home (Content Manager, AR RTL)
```
┌──────────────────────────────────────────────────────────────┐
│ [ب] بروتوكول سوفت   …   [AR|EN]   [معاينة الموقع]   [اسم المستخدم ▾] │
├────────────┬─────────────────────────────────────────────────┤
│ المحتوى    │  لوحة التحكم                                     │
│  الرئيسية▸ │  ┌───────────┐ ┌───────────┐ ┌───────────┐       │
│  الخدمات   │  │ طلبات جديدة│ │ مسودات    │ │ ترجمة EN  │       │
│  المشاريع  │  │     3     │ │     2     │ │ ناقصة: 1  │       │
│  المبادرات │  └───────────┘ └───────────┘ └───────────┘       │
│  الصفحات   │  آخر عمليات النشر                                │
│  الفريق    │  • خدمة الأمن السيبراني (AR) — قبل ساعتين         │
│  القوائم   │  • مشروع منصة التوصيل (AR) — أمس                 │
│ الوسائط    │  ينقص لإكمال الترجمة الإنجليزية                  │
│ الطلبات 3▸ │  • الخدمات → صفحة «من نحن» (EN غير منشورة)       │
│ الإعدادات  │                                                 │
└────────────┴─────────────────────────────────────────────────┘
```

### W2 — Services list (translation status columns)
```
| العنوان                    | AR        | EN        | الحالة  | ترتيب | إجراءات   |
|----------------------------|-----------|-----------|---------|-------|-----------|
| تطوير الأنظمة المخصصة      | ● منشور   | ● منشور   | live    | 1     | تعديل ⋯   |
| تطوير المنتجات والمنصات    | ● منشور   | ◐ مسودة   | live-ar | 2     | تعديل ⋯   |
| خدمات وحلول الأمن السيبراني| ● منشور   | ○ غير مكتمل| live-ar | 3     | تعديل ⋯   |
مفتاح: ● منشور · ◐ مسودة · ○ غير مكتمل/لم تبدأ
```

### W3 — Service editor (locale tabs + per-locale publish bar)
```
┌ تحرير: خدمات وحلول الأمن السيبراني ──────────────────────────┐
│ [نسخة عربية AR*] [English EN]        الحالة: منشور (AR فقط)   │
│ ─────────────────────────────────────────────────────────── │
│ العنوان*        [خدمات وحلول الأمن السيبراني          ]      │
│ عنوان الواجهة*  [                                  ]        │
│ الملخص*         [ textarea 0/200                       ]      │
│ نظرة عامة*      [ richtext ▸ مراجعات/إصدارات: 14 ]           │
│ … حقول المجموعات: التسليمات · القدرات · آلية العمل · الأسئلة │
│ ─────────────────────────────────────────────────────────── │
│ [معاينة AR] [نشر العربية ✓] [نشر الإنجليزية 🔒 يتطلب اكتمال EN]│
│ ⚠ قسم مبادرة تقنية مفعّل على هذه الصفحة (بطاقة EDR قيد التطوير)│
└──────────────────────────────────────────────────────────────┘
```

### W4 — Leads table (Sales Manager)
```
| المرجع | الاسم       | الشركة | الخدمة           | اللغة | الحالة      | المسؤول | التاريخ  |
|--------|-------------|--------|------------------|-------|-------------|---------|----------|
| LF-104 | …           | …      | الأنظمة المخصصة  | ar    | جديد ●      | —       | اليوم    |
| LF-103 | …           | …      | الأمن السيبراني  | en    | تم التواصل  | سارة    | أمس      |
[بحث] [فلترة: الحالة/الخدمة/اللغة/المسؤول] [تصدير CSV] (يُسجَّل في التدقيق)
```

### W5 — Lead detail
```
┌ طلب LF-104 ────────────────────────────────── الحالة: جديد ▾ ┐
│ الاسم/الشركة/البريد/الهاتف · الخدمة · الرسالة                  │
│ المصدر: /contact (ar) · 12:40 · رمز مرجعي                     │
│ ── ملاحظات داخلية ──                                          │
│ [أضف ملاحظة…]                                                 │
│ المسؤول: [تعيين ▾]      [أرشفة]      [سجل التغييرات: 2]        │
└───────────────────────────────────────────────────────────────┘
```

### W6 — Theme settings (tokens + live preview + contrast)
```
┌ الهوية البصرية ──────────────────────────────────────────────┐
│ الإعدادات (مسودة)          |  معاينة حية (بطاقة مصغرة)        │
│ اللون الأساسي [#2563EB] 🎨 |  ┌────────────────────────┐     │
│ لون التمييز   [#22D3EE] 🎨 |  │ عنوان تجريبي + زر      │     │
│ خلفية داكنة   [#071426] 🎨 |  │ [زر أساسي] [زر ثانوي]  │     │
│ …(قائمة الرموز المسموحة فقط) │  │ بطاقة خدمة تجريبية     │     │
│ نمط الأزرار [ممتلئ ▾]       |  └────────────────────────┘     │
│ الانحناء [متوسط ▾]          |  فحص التباين: ✓ 6 أزواج ناجحة   │
│ الحركات [✔]                 |  [تطبيق] [استعادة الافتراضي]    │
└──────────────────────────────────────────────────────────────┘
```

### W7 — Media library
```
[تحميل +] [بحث] [التصنيف: الكل ▾] [الظهور: عام/خاص ▾]
┌────┐ ┌────┐ ┌────┐ ┌────┐   كل بطاقة: صورة · الاسم
│ 🖼 │ │ 🖼 │ │ 🖼 │ │ 🔒 │   · التصنيف · [عام/خاص]
└────┘ └────┘ └────┘ └────┘   · بديل AR ✓ / EN ✗ ← تنبيه
تحذير الحذف: "الملف مستخدم في 3 محتويات — الأرشفة متاحة، الحذف ممنوع."
```

---

## 11. Theme Settings — Behavior Specification

### 11.1 Token philosophy
Only the §5.1.2 allowlist is editable. **Derived** styles (hover states, focus rings, surfaces, gradients, typography) are computed in code from the base tokens and are never editable — protecting the design system (per Phase 1 requirement: no uncontrolled per-element color editing).

### 11.2 Contrast validation (WCAG 2.1 AA)
Pairs checked on every Apply: textOnDark/darkBackground ≥ 4.5 · textOnLight/lightBackground ≥ 4.5 · white-on-primary ≥ 4.5 (button text) · primary-on-lightBackground ≥ 4.5 · primary & accent on darkBackground ≥ 3.0 (UI/large elements). **Apply is hard-blocked while any pair fails** — no override, at any role (accessibility is non-negotiable). A helper suggests the nearest passing value (suggestion only; never auto-applied).

### 11.3 Live preview, apply, reset
- Editing updates a sandboxed mini-preview (hero mock + buttons + card) instantly — draft tokens never touch the public site.
- **Apply** = publish: runs contrast validation → writes tokens → audit (`theme_changed`, before/after diff) → revalidation (`theme` tag) → public site updates.
- **Reset to defaults**: per-token or all; reset is itself a change requiring Apply; audited as `theme_reset`.
- Theme history = global version log, admin-visible only, restorable like any global.

---

## 12. Media Library Rules

- **Allowed types:** JPEG, PNG, WebP, SVG (restricted — see the SVG-safety rule below), PDF (category `documents`, always private — e.g., approval documents). Everything else rejected at upload.
- **Limits:** images ≤ 8 MB, PDF ≤ 20 MB; minimum dimensions for hero/OG categories (1200px wide).
- **Optimization:** WebP variants auto-generated at defined sizes (thumb 400, card 800, hero 1920); original capped; EXIF/metadata stripped.
- **Bilingual alt text:** `altText.ar` required for public use of an asset in Arabic pages; `altText.en` for English — public API marks assets with missing locale alt as `altIncomplete`, and the content completeness checker surfaces pages using them.
- **Public vs private:** private assets (default: `documents`, project screenshots pending approval) are stored outside the public media path, never returned by the Internal API, and served only to authenticated admins.
- **SVG safety:** SVGs accepted **only** for the `logos` category; run through a sanitization step on upload (strip `<script>`, event attributes, `foreignObject`, external references). If sanitization fails, upload rejected. SVGs served with `Content-Type: image/svg+xml`, `X-Content-Type-Options: nosniff`, and a restrictive CSP on the media path; never inlined into pages.
- **Deletion/replacement safety:** assets referenced by any content (published or draft) cannot be hard-deleted — the system offers **archive** (private + hidden from pickers). Deletion allowed only for unreferenced assets, Super Admin/Content Manager, always audited (`media_deleted`). Replacement updates in place while keeping prior version in the entity's version history (revert-safe).
- **Organization:** categories (fixed list), tags, search by name/alt/tags, filter by visibility.

---

## 13. Audit Event Catalog (system-written)

| Event | Trigger | Extra logged |
|---|---|---|
| `login_success` / `login_failure` | admin auth | ipHash, userAgent |
| `logout` | session end | |
| `password_reset_requested` / `password_reset_completed` | reset flow | |
| `user_created` / `user_updated` / `user_disabled` | users admin | target user |
| `role_changed` | role field write | old → new role |
| `draft_saved` | any content save | entity, locale |
| `publish` / `unpublish` | per-locale actions | entity, locale |
| `revert` | version restore | entity, restored version time |
| `settings_changed` | any global (site/nav/seo/form) | scope + diff summary |
| `theme_changed` / `theme_reset` | theme Apply/Reset | token diff |
| `media_uploaded` / `media_deleted` / `media_archived` | media ops | file name, category |
| `lead_created` | internal API create | referenceCode |
| `lead_status_changed` | pipeline transitions | old → new status |
| `lead_exported` | CSV export | filter scope, row count |
| `break_glass_used` | emergency admin access enabled | actor, reason, duration |
| `backup_schedule_changed` | backup schedule enabled/disabled/edited | old → new state, schedule values |
| `backup_requested` | manual backup requested | actor |
| `backup_completed` / `backup_failed` | backup job finished | record id, duration |
| `backup_verification_required` / `backup_verified` | verification outcome | record id |
| `backup_config_changed` | backup-settings updated | non-sensitive diff summary |
| `media_screening_changed` | screenshot sensitivity screening updated | asset id, old → new status, reviewer |
| `legal_content_confirmed` | legal page `contentOrigin` switched to `final` | page, locale, super admin |

All entries: actor, timestamp, entity pointer, sanitized summary. Never logged: secrets, session tokens, raw IPs, full message bodies.

## 14. Extensibility (future, zero-restructuring)

### 14.1 Blog / Insights (D10)
The patterns are deliberately generic: a future `posts` collection reuses localized fields + `publishedLocales` + SEO group + media relations + the shared block builder; the Internal API gains `/internal/content/posts` endpoints under the same rules; sitemap/hreflang generation is registry-driven per collection. Nothing in this schema needs restructuring — adding posts is additive.

### 14.2 Self-hosted Plausible (D8 — design only, no implementation this phase)
Reserved analytics loader in the web service (env-driven, off by default); domain `protosoftdev.com`; **never loaded on the admin subdomain**. Planned custom events: `lead_submit_success`, `whatsapp_click`, `email_click`, `cta_click`, `language_switch`. Cookieless — no consent banner required, consistent with the privacy posture. Implementation lands in Phase 6+.

---

## 15. Phase 2 Acceptance Checklist

- ✔ Single file delivered: `docs/PHASE_2_CMS_ARCHITECTURE.md` — no UI screens, code, Docker files, migrations, or deploy files
- ✔ Complete field-level Payload schema: 11 collections + 6 globals, with types, localization flags, required-field rules, validation, indexes, versions/drafts, and per-collection access
- ✔ All Phase 1 confirmed decisions (D1–D11) mapped and honored, including the new EDR baseline wording and launch placements
- ✔ Internal Public Content API fully specified: transport, service-to-service auth, complete allowed-endpoint list, filtering invariants, language behavior, explicit forbidden-data list, rate limits, caching/revalidation
- ✔ Web service holds no database credentials (Option A) — enforced by design
- ✔ Secrets separated by purpose **and direction** — `WEB_TO_CMS_CONTENT_READ_KEY`, `WEB_TO_CMS_LEAD_SUBMIT_KEY`, `CMS_TO_WEB_REVALIDATE_KEY`, `LEAD_IP_HASH_SECRET`, asymmetric preview keys (`PREVIEW_SIGNING_PRIVATE_KEY` cms-only, `PREVIEW_VERIFY_PUBLIC_KEY` web-only) — least-privilege, non-interchangeable, rotatable, server-side only, never in the browser; no contact-form PII stored client-side during CMS outages
- ✔ Preview finalized as a **one-time code exchange** (§6.7): cms-signed single-use codes (≤ 15 min) bound to collection/document/locale/revision/admin; the web verifies the signature and pulls the exact snapshot over the private network; drafts unreachable through normal content endpoints
- ✔ **Public Readiness Gate** (§5.2.2): `[PLACEHOLDER]` values can never render publicly; the delivery-platform case study stays excluded until the gate passes; homepage `featuredProject` defaults to none with a clean fallback (hide section or approved neutral alternative)
- ✔ Public-safe `GET /internal/content/contact-config` endpoint (§6.8); form-settings confidential data never leaves the cms; lead flow consumes the safe subset only
- ✔ New §16 Operational Defaults section; all former §17 references repaired; decision-register and audit/media cross-references corrected; final internal-reference consistency pass completed
- ✔ Legal pages: Super Admin-only review sign-off and publication (Content Managers draft only); optional `legalApprovalRef` field
- ✔ Secure lead flow defined end-to-end (validation, honeypot, double rate-limiting, idempotency, notifications, failure path, audit)
- ✔ Arabic-first bilingual workflow: completeness rules, per-language publish/unpublish gating, previews, drafts, revision recovery, no-fallback behavior
- ✔ Admin IA: structure, navigation, 7 user flows, empty states, RTL requirements, 7 low-fidelity textual wireframes
- ✔ Theme system: token allowlist only, contrast validation with hard block, live preview, apply/reset, audit, derived-style protection
- ✔ Media rules: public/private, upload validation, SVG safety, bilingual alt, optimization, deletion/replacement safety
- ✔ Server-side role matrix for all four roles, incl. field-level rules and "UI hiding is cosmetic" principle
- ✔ Audit catalog covering logins, publishing, settings, users, roles, theme, media, leads, break-glass
- ✔ Extensibility: blog additive-by-design; Plausible designed-not-implemented
- ✔ Backup & Recovery operational-control model (§2.3): disabled by default; Super Admin-only schedule/manual-request/history; no secrets, keys, paths, or bucket details in the dashboard; encrypted off-server once enabled; restore = controlled operational procedure, never a one-click UI action; full audit coverage; Development & production data policy (§6.9)
- ✔ Approved decisions applied: legal-page draft templates (Super Admin gate unchanged); delivery-platform public scope = **screenshots only** with the mandatory screenshot review gate (gate check 6); WhatsApp availability-state CTA (never dummy numbers); operational defaults confirmed per security best practices (§16)
- ☐ **Client approval to proceed to Phase 3 (Design System & UI Design)**

## 16. Operational Defaults (confirmed by Protocol Soft — security best practices)

Values below are the confirmed production-configuration baseline, re-verified as a Phase 11 launch gate.

| Default | Confirmed value | Where it applies |
|---|---|---|
| Admin application — idle timeout | **30 minutes** | cms service (env-configurable) |
| Admin application — absolute session lifetime | **8 hours** | cms service |
| Cloudflare Access session duration | **8 hours** | Access policy (Phase 1 §11.5) |
| Audit-log retention | **24 months** | `audit-logs` purge job |
| Lead retention | 12 months, then archive/delete per the approved retention policy | leads housekeeping |
| Content version retention | last **50 versions or 90 days, whichever limit is reached first** | all versioned collections/globals |
| Preview code lifetime | maximum 15 minutes, one-time use | §6.7 |
| Internal service-key rotation | every 90 days, or immediately on suspected compromise | §1.1, §6.1 |
| Backup schedule | **disabled by default**; once enabled: encrypted off-server **daily** backups · **monthly integrity verification** · **quarterly restore exercise** · retention target **30 daily + 12 monthly** backups | `backup-settings` (§2.3, §5.1.7) |
| Production-launch guidance | backups must be **configured, enabled, and restore-tested before real leads or important production content are relied upon** | §2.3; Phase 11 go-live checklist |
| Web-side lead rate limits | 5/hour, 20/day per IP | web service env (§6.6) |
| CMS-side lead rate limit | 30/min per ipHash, service-wide | form-settings (§5.1.6) |

## 17. Genuine Unresolved Decisions (only items needing Protocol Soft's input)

1. **Legal copy (partially resolved)** — Protocol Soft requested initial editable draft templates for the Privacy Policy and Terms of Use (seeds defined in §5.2.5; written in Phase 9). **Still open:** who performs the final review and whether external legal counsel is engaged (where appropriate).
2. **Case-study public scope — resolved:** product screenshots only, subject to the screenshot review gate (§5.2.2); any future expansion (name, logo, metrics, technologies) requires new written client approval.
3. **Operational defaults — resolved:** confirmed per §16 (security best practices); future changes follow the same explicit-confirmation path.
4. *(Carried, not launch-blocking)* — official WhatsApp number (CTA shows the availability message until provided, §6.9); **off-server encrypted backup provider (operational decision — Cloudflare R2 preferred, not implemented; backups stay disabled until a Super Admin enables them, §2.3 — but launch guidance requires backups enabled and restore-tested before relying on production)**; future EDR dedicated domain when status becomes "Available".

---

*End of Phase 2 (v1.5). Next phase upon approval: **Phase 3 — Design System & UI Design** (design tokens, component library, hi-fi key screens in Arabic RTL + English LTR). Stopping here for Protocol Soft's approval.*
