# Phase 4 — Focused Verification & Corrections (Final)

Date: 2026-09-16 · Scope: the four items requested by Protocol Soft for Phase 4 approval, plus the two final security requirements (preview query-string prohibition; Payload direct-REST isolation) and the retained verifications (PAYLOAD_SECRET production fail-fast; rate-limit launch blocker).
Status: **all items verified or documented; automated suites green (public isolation + direct REST 72/72, preview security 38/38, production headers ALL PASS, PAYLOAD_SECRET fail-fast verified).** Phase 5 not started — awaiting approval.

---

## 1. Homepage draft/public-content contradiction — RESOLVED

**Clarification (exact behavior):** the earlier report conflated two facts.

- Seeded content collections (`services`, `case-studies`, `technical-initiatives`, `team-members`, `pages`) are **all DRAFT** — verified in the DB (`services`: 3 docs, all `_status: 'draft'`).
- The public web homepage reads the `Homepage` **global** through a publish gate: `findGlobal({ draft: false })`, which returns only the last **published** version. Because no published version has ever existed, the public homepage renders an **empty shell** — the isolation suite asserts exactly this: `homepage published:false` and `headline: null` over the wire.
- What the earlier report observed as "rendered seeded Arabic content" was the **admin panel / draft context**, never the public path. Today the public homepage does **not** render any seeded draft content; every seeded string visible publicly (e.g. site settings chrome) comes from non-draft globals/settings that are intended public.

**Invariant enforced and machine-checked:** public web + all Public Content API endpoints return **published-only**. Draft, archived, hidden, unapproved, placeholder, private-media, internal-note, lead, user, audit, and backup data are never returned publicly (see §2). Draft content is reachable **only** through the authenticated preview-code flow (§3).

---

## 2. Public-data isolation + direct Payload REST isolation — automated verification 72/72 GREEN

Script: `apps/cms/src/scripts/verify-public-isolation.ts`
Run: `npx tsx --env-file-if-exists=.env src/scripts/verify-public-isolation.ts` (CMS + web dev servers up, Postgres in Docker).

| # | Category | Checks | Result |
|---|----------|--------|--------|
| 1–13 | Public GETs (site-settings, contact-config, social-links, navigation, theme, services, case-studies, initiatives, team, pages, redirects, seo, homepage) | HTTP 200, published-only shape | ✔ |
| 14–20 | Draft omission | services/case-studies/initiatives/team return **0 draft docs**; draft legal page → **404**; social-links/redirects → 0 | ✔ |
| 21–24 | Leak markers | no `[PLACEHOLDER]`, no sink e-mail, no legal-company fields, no unexpected keys (registry whitelist **exact match**) | ✔ |
| 25–31 | Sensitive endpoints unauthenticated / service-key-only | `/internal/leads` 401/403; `/internal/preview/issue` 401/403; `/internal/preview/exchange` 400/401/403 (**400 by design** — the code itself is the credential, so a body-less probe is a bad request, not an auth oracle); `/internal/backup/*` (status/schedule/request-manual/report) 401/403 | ✔ |
| 32–34 | Lead pipeline | submit via leads key → **201**; row persisted in DB; **PII absent from every public response** | ✔ |
| 35–70 | **Direct Payload REST isolation (final item 2)** — unauthenticated probes of every collection and global REST path | all 13 collections (users, leads, audit-logs, backup-records, preview-codes, media, services, case-studies, technical-initiatives, team-members, pages, social-links, redirects) → **403, no body exposure**; all 7 globals (site/theme/navigation/homepage/seo/form/backup-settings) → **403**; draft-read variants (`?draft=true&fallbackLocale=null`, `where-_status_equals=draft`, `/services/3?draft=true`) → rejected; unauthenticated **mutations**: create service, publish via PATCH `_status`, user role change, create user, delete lead, backup-settings control → **all 403** | ✔ |
| 71 | **GraphQL disabled** | `POST /api/graphql` and `GET /api/graphql` → **404** (`config.graphQL.disable: true`) | ✔ |
| 72 | **Private media static route** | upload static file serving runs the collection `read` access via Payload `checkFileAccess` (`requireCapability('content_edit')`) — unauthenticated file probe → never 200 (404 for unknown file; access check precedes existence) | ✔ |
| — | DB truth | seeded services exist and are ALL draft (proves omission is the publish filter); audit rows exist | ✔ |
| 37–39* | Homepage global | public homepage returns `published:false`, `headline: null` — the empty-shell proof for §1 | ✔ |

**REST isolation verdict:** every Payload REST path (collections, globals, uploads, auth) is gated behind the admin session + RBAC capability model — unauthenticated reads and ALL mutation classes (create/update/delete/publish/role-change/backup-control/preview-issue) are rejected. **The approved Internal Public Content API registry (`/api/internal/content/*`) remains the sole public-content interface**, and its whitelist is structurally asserted (§4 of the suite). GraphQL cannot become a surface (404 — disabled).

**Result: 72 passed, 0 failed.** The suite is idempotent (timestamped idempotency key) and re-runnable.

---

## 3. Preview-code security — automated verification 38/38 GREEN (+ production headers ALL PASS)

Script: `apps/cms/src/scripts/verify-preview-security.ts` (dev servers) and `apps/web/scripts/verify-preview-prod-headers.mjs` (production build).

### 3.1 Corrections applied this session (root causes found and fixed)

1. **Atomic single-use redemption was broken — `totalDocs` never exists.** The exchange handler checked `claim.totalDocs !== 1` on a Payload bulk `update`, but Payload 3.89's bulk update returns only `{ docs, errors }` — so **every** exchange was rejected with `used-or-expired` *after* the code had already been consumed (fail-closed, but unusable). Moreover Payload's `update`/`updateMany` are *find-then-update-by-id* and are **not atomic** against concurrent redemption.
   **Fix** (`apps/cms/src/endpoints/internal/preview.ts`): a single conditional SQL statement claims the code —
   `UPDATE preview_codes SET used = TRUE, used_at = now() WHERE jti_hash = $1 AND used = FALSE AND expires_at > now() RETURNING id`
   Postgres row-level locking guarantees **exactly one concurrent winner**; losers re-evaluate the WHERE against the committed row and match nothing. Verified: 6 concurrent exchanges → **exactly 1 × 200 / 5 × 403**.
2. **`/preview` page crashed at render** — `PreviewBridge` used `useState` in a server component. **Fix:** added `'use client'` (file is fully interactive).
3. **Exchange `Referrer-Policy` was overridden** — `next.config.mjs` global `/:path*` entry (`strict-origin-when-cross-origin`) **overwrites** route-handler headers of the same name. **Fix:** dedicated `/api/preview/:path*` header block (`no-referrer`, `private, no-store`, `noindex`), kept alongside the in-code headers as defense in depth.
4. **Snapshot locale check was comparing the wrong sides** (`title.ar` vs `title.ar`) and assumed `{ar,en}` objects; locale-scoped fetches return **plain strings**. **Fix:** each exchange snapshot is now compared against the CMS draft fetched in the same locale — ar and en values differ and match their own locale (no cross-locale leak).
5. **Local `.env` PEM quoting** — unquoted multiline keys broke `createPrivateKey` under `next dev` (`@next/env` expands `\n` only in double-quoted values). **Fix:** keys double-quoted, files normalized to LF. Local dev config only — real keys are provisioned server-side and never committed (`.gitignore` covers `**/.env*`).
6. **Web production build failed** — root tsconfig `moduleResolution: NodeNext` vs the web app's extensionless `@/` imports. **Fix:** web tsconfig overrides to `module: esnext` / `moduleResolution: bundler` (the Next standard); CMS stays NodeNext. `drizzle-orm` added as a declared CMS dependency.

### 3.2 Verified properties (38/38)

- **Issuance** requires an authenticated, **active**, privileged admin session (`super_admin`/`content_manager`/`editor`); service keys, no session, and bogus cookies → 403 (auth precedes validation).
- **Claims binding**: `aud=web-preview`, TTL **900 s** (≤ 15 min ceiling, enforced at signing **and** at both verify layers with 5 s skew tolerance), bound to `collection`/`docId`/`locale`/`issuingAdminId` (+ optional `revisionId`).
- **At rest**: only `sha256(jti)` is stored — raw jti/token absent from the row; audit trail logs issuance **without** the code.
- **Forged codes**: garbage → 403 `malformed`; tampered body → 403 `bad-signature` **verified locally at the web service** (no CMS call, code not consumed).
- **Same-origin guard**: cross-site `Origin` → 403 **without consuming the code**; the code remains redeemable afterwards (200).
- **Exchange response**: `Cache-Control: private, no-store, max-age=0, must-revalidate`, `Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex, nofollow`; returns **only** the bound snapshot (collection/locale/id of the issued doc; localized strings for the bound locale); never echoes the code.
- **Single-use**: replay → 403 `used-or-expired`. **Atomicity**: 6 concurrent exchanges → exactly 1 winner (§3.1.1).
- **Locale binding**: an `en` code returns the `en` snapshot (`locale=en`, localized values match the en draft, differ from ar — no cross-locale leak).
- **`/preview` page**: `Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex`; page HTML carries no code material. Cache-Control in `next dev` is **forced by Next** to `no-store, must-revalidate` (documented in-suite); the exact production value was verified against a real `next build` + `next start` (`verify-preview-prod-headers.mjs`) — **ALL PASS** on both `/preview` and `/api/preview/exchange`: `private, no-store, max-age=0, must-revalidate` / `no-referrer` / `noindex`.
- **Log hygiene**: the code travels only in the URL **fragment** (`/preview#code=…` — fragments are never sent to any server) and POST bodies; `history.replaceState` cleans the URL after exchange. Log scan across all known dev/payload log files: **0 application hits** (the only occurrences are Next's DEV-only request logger echoing the URLs of the suite's own rejection probes; production Next does not log request lines). In production the admin→web link stays fragment-based, so application, proxy (Caddy), and Cloudflare logs cannot contain codes.

### 3.3 Query-string code prohibition (final item 1) — fragment-only transport enforced

The approved preview transport is **URL fragment only** (`/preview#code=…`). Legacy query-string links (`/preview?code=…`) are **never issued, accepted, migrated, redirected-into, or redeemed** — a query value may already have been logged by the app, proxy, or Cloudflare before any redirect occurs.

Changes applied:
1. **CMS issues fragment-only URLs** — already true; now machine-asserted (`urlPath === /preview#code=<code>` and no `?code=`).
2. **`/preview` page no longer migrates legacy `?code=` links** (`apps/web/src/app/preview/page.tsx`): the previous "move query code into fragment" path was **removed**; the client reads the code from `location.hash` only, and a query-string `code` renders the generic invalid message without ever being read, exchanged, or echoed.
3. **Generic redirect at the edge of the app** (`apps/web/src/middleware.ts`): `GET /preview?code=…` → **307 redirect to clean `/preview`** — the code is never read, transformed, or echoed (the redirect target contains no code).
4. **Exchange API rejects query-string codes** (`apps/web/src/app/api/preview/exchange/route.ts`): any request whose URL contains `?code=` → **400 invalid_request** before same-origin/body parsing — never redeemed, never echoed (defense against someone stuffing a stolen code into a URL).

Automated verification (part of the 38-check suite):
- CMS issues fragment-only URL (no `?code=`) ✔
- `POST /api/preview/exchange?code=<valid code>` (with valid body) → **400**; body does **not** echo the code ✔
- The query-string attempt did **not** consume the code — a subsequent fragment-flow exchange of the same code → **200** ✔
- `GET /preview?code=…` → **307 → `/preview`** (generic response; no migration, no exchange) ✔
- Post-redirect page echoes no code material ✔
- No application log contains the code (dev request-logger lines documented as Next-dev-only; production Next does not log request lines) ✔
- Fragment-only success: a fresh code exchanged via the approved POST-body flow → **200 snapshot** ✔

Proxy/CDN log configuration: Caddy access logging is **not enabled** in `Caddyfile` (no `log` directive → no access logs written by the proxy). Cloudflare-side, fragments never reach the edge at all; query-string codes cannot exist in normal traffic because the CMS never issues them and legacy links are rejected before redemption. If Cloudflare Logpush/Telemetry is ever enabled, it must exclude or truncate `url.query` for preview paths — recorded with the Cloudflare launch tasks (§4.2).

---

## 4. Production admin-origin security — checklist

### 4.1 Verified locally (code + config, this machine)

| # | Control | Evidence |
|---|---------|----------|
| A1 | **No direct public host port for CMS/admin** | `docker-compose.production.yml`: `cms` service has **no `ports:`** (networks `app,data` only). Only Caddy publishes **80/443**. PostgreSQL: no host port. |
| A2 | **Public proxy never serves the admin hostname** | `Caddyfile`: `admin.protosoftdev.com { respond 421 }` — explicit block; only `protosoftdev.com`/`www` are proxied to `web:3000`. |
| A3 | **Admin reachable only via Cloudflare Tunnel** | `cloudflared` runs **outbound-only** (`tunnel run --token`, networks `app`), targets `cms:3001` privately; tunnel token is server-side env, never in Git. |
| A4 | **Admin surface hardening** | Payload admin `robots: noindex, nofollow`; GraphQL **disabled**; admin access requires an admin role (`admin: requireAnyAdmin`); no public user registration. |
| A5 | **Production cookies** | `users.auth.cookies`: `secure: process.env.NODE_ENV === 'production'` → **Secure** in prod; Payload **always** sets `HttpOnly` (verified in `payload/dist/auth/cookies.js`); **SameSite=Lax** (supports the Cloudflare Access flow). Token expiry **8 h** absolute. |
| A6 | **Brute-force controls at DB layer** | `maxLoginAttempts: 10`, `lockTime: 5 min` (persistent in Postgres — survives restarts and is shared across instances). |
| A7 | **CSRF/origin posture** | Admin UI and its API share the **same origin** (`admin.protosoftdev.com`) → no cross-origin CSRF surface; Payload `csrf` whitelist stays empty; SameSite=Lax blocks cross-site cookie-bearing POSTs; sensitive custom endpoints require session + role/capability or a server-side service key; destructive routes (`users.delete`, audit update/delete, preview exchange by key) return `false`. |
| A8 | **Secret hygiene** | No secrets/keys/passwords/tokens committed; `.gitignore` covers `.env*` at every level; keys enter via production compose env only; no UI read/write path for any credential (verify:no-db audit). |

### 4.2 Blocked on Protocol Soft's Cloudflare account setup (cannot be verified from this machine)

| # | Item | Owner |
|---|------|-------|
| B1 | Cloudflare **Access application** for `admin.protosoftdev.com` with **MFA** (IdP/email OTP policy) — deny-by-default | Protocol Soft (Cloudflare Zero Trust) |
| B2 | **Tunnel** creation + token provisioning (`CLOUDFLARE_TUNNEL_TOKEN`), public DNS hostname routed through the tunnel only | Protocol Soft |
| B3 | **Edge WAF rate-limiting rules** (login paths, contact submissions) — referenced by the Caddyfile as the edge layer | Protocol Soft |
| B4 | Post-deploy **origin reachability test**: server IP / alternate hostnames must NOT reach the CMS; only the Access-authenticated admin hostname resolves | Protocol Soft + deployment session |
| B5 | HSTS preload / TLS posture at the edge (certs terminate at Cloudflare) | Protocol Soft |
| B6 | If Cloudflare Logpush/Telemetry is ever enabled: exclude or truncate `url.query` for preview paths (query-string codes are prohibited at the app layer; fragments never reach the edge at all) | Protocol Soft |

These are **launch-day tasks on the live server**, not code defects. Local verification of A1–A8 is complete.

---

## 5. Production rate-limit readiness — honest status

**Mechanism today (application layer):**
- **Admin login** (`apps/cms/src/app/(payload)/api/[...slug]/route.ts`): per-Node-process **in-memory Map**, key `IP` pre-check then `IP:email` composite; 10-minute window; progressive backoff 5 fails → 1 min, 8 → 5 min, 10 → 15 min; success clears the entry; `429` + `Retry-After`. Body is read once and replayed to Payload on a fresh `Request` (fixes a hang where a cloned stream never flushed).
- **Lead submission** (`/internal/leads`): server-side honeypot silent-reject + per-`ipHash` throttle (60 s window, in-memory) + audit event; raw IPs never stored (hashed with `LEAD_IP_HASH_SECRET`).
- **DB layer (production-grade already):** account lockout after 10 failed logins, 5-minute lock — persistent in Postgres, shared, survives restarts.

**Limitations (must be stated):** both in-memory limiters are **development-only primitives**: state is **lost on restart**, **not shared across multiple web/CMS instances**, and entries are unbounded until overwritten. Behind single-instance Docker deployments they function, but they do not meet the multi-instance/restart-resilience bar on their own.

**Production replacement (required before public launch):**
1. **Primary layer (edge):** Cloudflare WAF rate-limiting rules on `/api/users/login` and the contact/leads path (B3 above) — shared, restart-proof, instance-agnostic.
2. **Application layer (Phase 8 hardening, already scoped in code comments):** replace both Maps with a shared store (Redis `INCR`+`EXPIRE`, or a DB-backed counter table) keeping the same window/backoff semantics; add stale-entry eviction.
3. Until (1) or (2) is live, **the in-memory limiter is a defense-in-depth layer only** — and because the admin sits behind Cloudflare Access+MFA (B1), the login limiter's exposure is second-order. The **leads** limiter is the one that faces the open internet on launch day.

**Recorded as a production-launch blocker** (see §7) — either edge rules (B3) or the shared-store replacement must be in place before the public site goes live.

---

## 6. Revised Phase 4 acceptance checklist

| Item | Status |
|------|--------|
| Public web + Public Content API return **published-only** (machine-checked) | ✅ (isolation suite, 72/72 total) |
| **Direct Payload REST/GraphQL is not a public content surface** — all 13 collections + 7 globals reject unauthenticated reads; all mutation classes rejected; GraphQL 404-disabled; internal registry = sole public-content interface | ✅ |
| Draft reachable only via authenticated preview flow | ✅ (preview suite, 38/38) |
| **Preview transport is fragment-only**: `?code=` never issued, migrated, redeemed, or echoed (400 at exchange, 307 generic redirect at page, code not consumed, log scan clean) | ✅ |
| Preview codes: ≤ 15 min TTL, single-use, atomic redemption (1-of-6 concurrency proof) | ✅ |
| Preview codes bound to collection/doc/locale/revision/admin/audience; jti hashed at rest; audit without code | ✅ |
| Codes never in application/proxy/Cloudflare logs (fragment transport; log scan 0 application hits; prod headers verified on real build) | ✅ |
| Exchange + `/preview`: `private, no-store`, `no-referrer`, `noindex` (dev **and** production build) | ✅ |
| **PAYLOAD_SECRET production fail-fast** (hard throw under `NODE_ENV=production` when missing; verified) | ✅ |
| Admin-origin security verified locally (no CMS port, 421 on public proxy, tunnel-only, cookies Secure/HttpOnly/Lax, lockout, same-origin CSRF posture) | ✅ (A1–A8) |
| Cloudflare Access+MFA+tunnel live verification | ⛔ Blocked on account setup (B1–B6) — launch-day task |
| Rate limiting production-grade | ⚠️ **Launch blocker retained**: DB lockout ✅; app-layer in-memory ⚠️ → Cloudflare WAF rules and/or shared Redis/DB-backed limiter required before public launch |
| No secrets in Git; no credential UI paths; backups disabled by default; no one-click restore | ✅ (standing constraints held) |
| No public placeholder/test data; empties hidden | ✅ (checked in isolation suite) |
| Public site **not** launched; case study **not** published; final legal pages **not** published | ✅ (awaiting explicit confirmation) |

## 7. Remaining launch blockers (before public launch — not before Phase 5)

1. **Cloudflare setup + live origin test** (B1–B6): Access+MFA app, tunnel, DNS, edge rate-limit rules, IP/alt-hostname reachability test on the live server; if Logpush/Telemetry is enabled, exclude `url.query` for preview paths.
2. **Rate-limit production layer**: edge WAF rules live **or** Redis/DB-backed replacement of the two in-memory limiters (leads limiter is the internet-facing one). **Retained as a launch blocker** until either is enabled.
3. **Production DB migrations**: `push` is dev-only (`NODE_ENV !== 'production'`); generate and rehearse `payload migrate` against a staging copy of the production schema before first deploy.
4. **Pre-launch hardening minor** (same deploy session): pass `sharp` into the media pipeline to silence the resize warning and enable production image sizing. *(PAYLOAD_SECRET fail-fast was previously listed here — now implemented and verified, see §6.)*
5. **Content gates (unchanged, by instruction)**: no public launch, no case-study publish, no final legal-pages publish without Protocol Soft confirmation; backups stay disabled until an encrypted off-server destination is approved and a restore test completes (BD1).

---

## 8. PAYLOAD_SECRET production fail-fast — VERIFIED

`apps/cms/src/payload.config.ts` now throws at config load when `NODE_ENV=production` and `PAYLOAD_SECRET` is absent — no development fallback is possible in production. The dev fallback string remains for `NODE_ENV=development` convenience only.

Verification: booting the config with `NODE_ENV=production` and the variable deleted fails immediately with
`PAYLOAD_SECRET is required in production — refusing to start with a development fallback.`
The dev server boots normally with the variable present (restart re-verified after the change).

---
*Phase 5 has not been started. Awaiting Protocol Soft approval of Phase 4.*
