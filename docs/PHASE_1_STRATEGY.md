# Protocol Soft — Phase 1: Discovery, Strategy & Architecture

- Company: Protocol Soft / بروتوكول سوفت
- Document version: 1.3 · Date: 2026-09-13 · Status: **Awaiting client approval**
- Scope of this phase: planning, architecture, and roadmap only. No final UI screens, no implementation code, no Docker files, no database migrations.
- Confirmed domains: Public website `https://protosoftdev.com` (Arabic at `/`, English at `/en/`) · Admin dashboard `https://admin.protosoftdev.com` (separate subdomain, not a public path)

## Version History

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-09-13 | Initial Phase 1 strategy document (15 sections). |
| 1.1 | 2026-09-13 | Domain set to `protosoftdev.com`; EDR moved from service to open-source project under Projects/Case Studies; services reduced to three; added Brand Voice & Content Principles section; bilingual completeness and translation-status requirements added. |
| 1.2 | 2026-09-13 | Hosting decision applied: self-hosted on Protocol Soft's own server with Docker/Docker Compose/PostgreSQL/reverse proxy — all Vercel production assumptions removed. Admin dashboard isolated at `admin.protosoftdev.com` (no `/admin` public path) with container/network separation and layered-security requirements; pre-login access-protection options compared with a recommendation, final choice deferred to Protocol Soft. EDR repositioned again: no public project-detail page at launch (`/case-studies/open-source-edr` removed); presented only as a clearly separated «قيد التطوير» / "In Development" open-source technical initiative (homepage and/or Cybersecurity page), with future CMS controls to change status, visibility, and links, and a possible future dedicated website. Audit-log, backup/restore, health-check, and deployment-artifact requirements added. Dates corrected to 2026-09-13; no duplicate sections. |
| 1.3 | 2026-09-13 | Admin access protection decided in direction: **Cloudflare Access / Zero Trust with MFA + Payload CMS login + RBAC + audit logs + rate limiting** is the preferred architecture (deny-by-default, approved-identity policies, configurable sessions, immediate revocation, individual accounts, no shared logins). VPN-only removed as a recommended/preferred option; IP allowlisting demoted to optional supplementary control. Origin protection documented with **Cloudflare Tunnel** evaluation (recommended — no inbound port for the CMS) including Docker Compose and reverse-proxy integration, plus the Cloudflare-IP-allowlist + Authenticated Origin Pulls alternative and a break-glass procedure. Database-access separation model added: read-only public web role, write-capable CMS role, separate migration and backup roles, port 5432 never published, lead writes routed through the CMS internal API, secrets outside Git, encrypted off-server backups. Final technical corrections: broad SELECT-only public access rejected; data-access Options A (Internal Public Content API — recommended) and B (restricted PostgreSQL views) defined for Phase 2 selection; Cloudflare Tunnel confirmed as the preferred origin-protection method with a hardened break-glass procedure (authorized, temporary, logged, revoked after use); architecture diagram redrawn to distinguish public content access, CMS write access, lead submission flow, backup flow, internal-only CMS endpoints, and publicly exposed routes; internal version references aligned to 1.3. |

---

## 1. Project Understanding Summary

Protocol Soft (بروتوكول سوفت) is a software engineering and cybersecurity company serving Saudi Arabia and the GCC. This project delivers two separated, connected products:

1. **A premium bilingual public website** — Arabic-first (RTL) with a complete English (LTR) experience — at `https://protosoftdev.com`, positioning Protocol Soft as a long-term technology partner with **three commercial service pillars**: Custom Software Development (تطوير الأنظمة المخصصة), Digital Product & Platform Development (تطوير المنتجات والمنصات الرقمية), and Cybersecurity Services (خدمات وحلول الأمن السيبراني).
2. **A secure bilingual admin dashboard at `https://admin.protosoftdev.com`** — a full CMS in which every piece of public content is managed in both languages without code changes, plus a lead-management pipeline. The dashboard is isolated from the public site (separate subdomain, separate container/service, no public links to it, excluded from navigation, sitemap, and indexing). Access is **deny-by-default**, protected by **Cloudflare Access / Zero Trust with MFA before the CMS login**, followed by Payload authentication with individual accounts, API-enforced role-based access control, audit logs, and rate limiting (§11.5).

**Hosting (confirmed):** the complete production solution is self-hosted on Protocol Soft's own server — Docker + Docker Compose + PostgreSQL behind a reverse proxy (Nginx, Caddy, or Traefik). No Vercel or managed-platform assumption. Full requirements in §11.

**EDR (confirmed positioning):** Protocol Soft runs an open-source EDR initiative that is **under active development**. It is not a completed commercial service, not a standalone service page, and **not a full public project-detail page at launch**. It may appear only as a small, clearly separated «قيد التطوير» / "In Development" technical-initiative section or card, with no sales CTAs and no unapproved technical details. The CMS must later allow changing its status to "Available", controlling visibility, and adding links — including a possible future dedicated website (e.g., `edr.protosoftdev.com`). Details in §10.4.

Hard constraints that shape every later decision:

- **Content integrity:** no claims of certifications, partnerships, named clients, client logos, metrics, or numerical results unless verified and supplied by Protocol Soft.
- **EDR transparency rules:** approved wording only; no security, capability, performance, maturity, or enterprise-readiness claims unless later verified; no GitHub, documentation, roadmap, screenshots, or technical details unless explicitly approved.
- **The client delivery-platform case study** keeps client name, logo, screenshots, and outcomes as `[PLACEHOLDER]` until written client approval.
- **Bilingual completeness:** Arabic (primary, RTL) and English (complete, LTR) versions exist for every public page, service, project, SEO field, navigation item, form label, CTA, and important setting; each language publishes only when its content is complete; missing translations are flagged in the admin.
- **Security posture:** the reverse proxy is the only inbound entry point for the public site (ports 80/443); with the preferred Cloudflare Tunnel, the admin/CMS service publishes **no inbound port at all**. PostgreSQL, internal APIs, Redis (if used), container-management ports, and internal services are never publicly exposed; no secrets in frontend code or source control; the public website may access **only published public content** through the data-access model selected in Phase 2 (§11.6) — never drafts, leads, users, audit logs, revisions, private media, or administrative settings.
- Mobile-first, fully responsive, accessible, fast-loading, SEO-friendly.
- Theme customization only through controlled global design tokens; technical secrets never editable from the dashboard.

## 2. Brand & Positioning Summary

**Positioning statement:** For growing Saudi and GCC businesses, Protocol Soft is the technology partner that engineers reliable digital systems and protects them — combining custom software craftsmanship with security discipline in one team.

**Recommended primary messages (final wording to be confirmed — see Open Decisions):**
- Arabic hero: «نبني أنظمة رقمية موثوقة، ونحميها لتعمل بثقة.»
- English hero: "Build smarter. Operate securely."
- Alternates: «نحوّل التحديات التقنية إلى أنظمة آمنة وقابلة للنمو» / "Technology built for growth. Security built for confidence."

All public copy — including hero messages — is written under the voice rules in §3.

**Brand personality → execution rules:**

| Trait | Execution rule |
|---|---|
| Premium | Restraint: whitespace, refined typography, dark navy foundation, no visual noise |
| Trustworthy | Only verifiable claims; plain, precise language; real project visuals over stock clichés |
| Professional, enterprise-grade | Structured layouts, consistent grid, measured accent usage |
| Technically capable | Product UI mockups, architecture-style visuals, correct bilingual terminology; visible engineering craft (open-source work referenced only within approved status wording) |
| Confident, never arrogant | Benefit-led copy, no superlatives, no fear-selling in security content |
| Transparent | Clear distinction between services available now, completed client projects, and initiatives still in development |
| Clear to decision-makers | Every service page answers: what it is, what you get, how we work, how to start |

**Messaging pillars:** (1) engineering depth, (2) secure-by-design, (3) long-term partnership, (4) Saudi/GCC market understanding with bilingual delivery, (5) transparency — saying what is built, what is delivered, and what is still in development.

## 3. Brand Voice & Content Principles

### 3.1 Voice attributes
Honest · Specific · Calm · Clear · Technically credible · Professional · Human · Business-focused · Confident without arrogance · Balanced between marketing, trust, and factual accuracy.

### 3.2 Words and phrases to avoid

| Arabic | English |
|---|---|
| «نحن الأفضل» | "We are the best" |
| «حلول ثورية» | "Revolutionary solutions" |
| «خبرة لا تُضاهى» | "Unmatched expertise" |
| «حوّل مستقبلك» | "Transform your future" |
| «ابتكار عالمي المستوى» | "World-class innovation" |
| «حماية مضمونة» | "Guaranteed protection" |
| «نؤمّن كل شيء» | "We secure everything" |
| «قيادة المستقبل الرقمي» | "Leading the digital future" |
| «حلول قطعية/متطورة» (بلا سياق) | "Cutting-edge solutions" (without real context) |

Also prohibited: fear-based cybersecurity messaging, and empty statements that could apply to any technology company.

### 3.3 Arabic writing rules
- Arabic is the primary language; content is written naturally in Arabic, **not translated word-for-word from English**.
- Arabic typography, spacing, navigation, forms, icons, and layouts are designed specifically for RTL.
- Calm, direct, business-appropriate tone; short and clear sentences.

### 3.4 English writing rules
- English is a complete professional experience, not a partial translation.
- Natural business and technical language, LTR layout.

### 3.5 Content integrity rules
- Every marketing statement must be credible and explainable.
- Prefer concrete outcomes over vague adjectives; prefer short, direct sentences.
- No superlatives unless provable. No fear-based security messaging.
- No fabricated metrics, customer reviews, partners, certifications, project outcomes, or client logos.
- Clearly distinguish between: **services available now**, **completed client projects**, and **internal/open-source initiatives still under development**.
- Copy is original and written specifically for Protocol Soft — no generic template text.

### 3.6 Bilingual completeness rules (editorial + CMS enforcement)
- Every public page, service, project, SEO field, navigation item, form label, CTA, and important setting has Arabic and English versions.
- The admin dashboard shows clear **translation status** per language; missing translations are flagged.
- Arabic content must be complete before Arabic publishing; English content must be complete before English publishing (per-language publish gating).

### 3.7 Examples of preferred writing

Arabic:
- «نبني أنظمة تساعد الفرق على إدارة عملياتها بوضوح أكبر، وتمنح الأعمال أساساً تقنياً يمكن تطويره مع الوقت.»
- «نبدأ بفهم طريقة العمل والتحديات الفعلية، ثم نصمم حلاً مناسباً بدلاً من فرض قالب جاهز.»
- «نأخذ الأمان في الاعتبار منذ بداية بناء النظام، لأن الحماية تصبح أصعب وأكثر تكلفة عندما تؤجل إلى ما بعد الإطلاق.»
- «لا نعتمد على الوعود العامة؛ نوضح نطاق العمل، ما سيتم تسليمه، وما يحتاج إلى تطوير في مراحل لاحقة.»

English:
- "We build systems that help teams run operations with more clarity and give businesses a technical foundation they can improve over time."
- "We start by understanding how the business works and where the real constraints are, rather than forcing every project into a prebuilt template."
- "We consider security from the beginning of the build, because protection is harder and more expensive to add after launch."
- "We avoid broad promises. We define the scope, the deliverables, and what should be developed in later phases."

### 3.8 Examples of prohibited / exaggerated writing (do not use)
- "We are the best software company in Saudi Arabia." / «نحن أفضل شركة برمجيات في السعودية» — unprovable superlative.
- "Guaranteed 100% protection against all threats." / «حماية مضمونة ضد جميع التهديدات» — absolute security claim, prohibited.
- "Revolutionary, world-class innovation that transforms your future." — empty generic hype.
- Presenting the EDR initiative as "an available product", "enterprise-ready", or attaching sales CTAs to it — contradicts its actual status (open source, under active development).

## 4. Target Audience Analysis

| Segment | Profile | Primary need | Decision drivers | Content that converts |
|---|---|---|---|---|
| SMB owners / managers (KSA & GCC) | Arabic-first, often non-technical | Internal systems, customer portals, digitization | Trust, clear process, local understanding, partner-not-vendor | Arabic-first site, methodology, delivery-platform case study, easy WhatsApp/contact |
| Enterprise evaluators | Mixed business + technical staff | Custom platforms, security services | Credibility, engineering process, security posture, references | Case studies, secure-by-design section, honest "in development" transparency, complete English content |
| Startup founders | Bilingual, product-minded | MVP → product, speed with quality | Product thinking, UI/UX capability, process clarity | Digital products page, methodology, MVP framing |
| Operations / IT / security leads | Technical evaluators | ERP/CRM alternatives, integrations, monitoring, security posture | Technical depth, realistic scoping, transparency | Cybersecurity Services page (with the optional In-Development initiative card), consultation CTA |

Language behavior: Arabic is the primary commercial language; English must be complete and equally professional because enterprise and technical audiences frequently evaluate in English.

## 5. Website Goals & Conversion Goals

**Business goals:** (1) build trust and credibility; (2) communicate the three commercial service pillars clearly; (3) showcase real client projects and, within approved wording, technical initiatives; (4) convert visitors into consultation and project requests; (5) present Protocol Soft as a long-term technology partner; (6) serve Arabic-first users with a complete English experience.

**Conversion model:**

| Level | Conversion | Where measured |
|---|---|---|
| Primary (macro) | Consultation / project request form submitted | Contact page + all CTAs leading there |
| Secondary | WhatsApp click, email click, phone click | Header, footer, contact page, final CTA |
| Tertiary (micro) | Case study read; service detail viewed; language switch | Analytics events |
| Internal (admin) | Lead progresses through pipeline (New → Won) | Admin dashboard |

Measurement uses private, privacy-friendly analytics (consistent with the security positioning). Public pages never display vanity or fabricated numbers.

## 6. Recommended User Journeys

1. **SMB owner (Arabic):** arrives via search/referral to `https://protosoftdev.com/`, understands positioning in the hero, scans the services overview (three services), opens the Custom Software page, validates capability through the delivery-platform case study, requests a consultation (form or WhatsApp) with the service pre-selected. Target: ≤ 4 steps from landing to contact.
2. **Enterprise evaluator (English):** switches to English at `/en`, reads the case study and methodology for engineering credibility, opens Cybersecurity Services to assess security maturity (where the optional In-Development initiative card may reinforce practical security engineering), requests an assessment conversation.
3. **Startup founder:** lands on homepage or digital-products page, reads the MVP framing and process, starts a project discussion; secondary path via About.
4. **Operations / security lead:** enters via Cybersecurity Services page, checks scope and approach (no fear-selling, no fake guarantees), requests a consultation.
5. **Referral / direct visitor:** checks About and projects for legitimacy, then contacts.

**Admin-side journeys (detailed in Phase 2):** content manager publishes via draft → preview → publish with revision history and visible translation status; sales manager triages a new lead, assigns it, adds notes, exports a filtered CSV.

## 7. Information Architecture & Page Hierarchy

**Locale strategy:** Arabic is the default site at `https://protosoftdev.com/`; the complete English site lives at `https://protosoftdev.com/en/`. Shared English path slugs for maintainability and clean SEO, with `hreflang` linking each pair. The language switcher always jumps to the same page in the other language.

```
https://protosoftdev.com  (public website)
├── /                              Home (AR, RTL)
├── /about                         About Us
├── /services                      Services overview (3 services)
│   ├── /services/custom-software      تطوير الأنظمة المخصصة
│   ├── /services/digital-products     تطوير المنتجات والمنصات الرقمية
│   └── /services/cybersecurity        خدمات وحلول الأمن السيبراني
│       (may include the "In Development" EDR initiative card — clearly separated)
├── /case-studies                  Projects / Case Studies (client projects at launch)
│   └── /case-studies/delivery-platform
├── /contact                       Contact / request consultation
├── /privacy                       Privacy Policy
├── /terms                         Terms of Use
├── (unmatched)                    404 (localized)
└── /en/…                          Full English mirror (LTR)

https://admin.protosoftdev.com     Admin dashboard — separate subdomain/container,
                                   NOT linked from the public site, excluded from
                                   public navigation, sitemap, and indexing
```

**Excluded by decision:** `/services/edr` and `/en/services/edr` (EDR is not a service) **and** `/case-studies/open-source-edr` and `/en/case-studies/open-source-edr` (no EDR public project-detail page at launch). The public path `/admin` is not used — the dashboard lives on its own subdomain only.

**Header (AR):** الرئيسية | من نحن | الخدمات (dropdown: the three services only) | المشاريع | تواصل معنا — plus language switcher and primary CTA **«ابدأ مشروعك»**.
**Header (EN):** Home | About | Services (the three services) | Case Studies | Contact — CTA **Start a Project**.
**Footer:** company blurb, services links (three), projects links, quick links, contact details, social icons, legal links, copyright — all CMS-driven. No link to the admin dashboard anywhere on the public site; `robots.txt` and sitemap cover the public domain only.

## 8. Detailed Page List & Goal of Each Page

| # | Page | Route (shared slug) | Goal | Primary CTA |
|---|---|---|---|---|
| 1 | Home | `/` | Position the brand, route visitors to services and projects, drive consultation | ابدأ مشروعك / Start a Project |
| 2 | About Us | `/about` | Build trust: story, values, methodology summary, team | تواصل معنا |
| 3 | Services overview | `/services` | Present the three commercial pillars and guide visitors to the right service | Deep-link to service pages |
| 4 | Custom Software Development | `/services/custom-software` | Convert businesses needing internal systems, admin dashboards, portals, ERP/CRM, APIs, legacy modernization | Request consultation |
| 5 | Digital Product & Platform Development | `/services/digital-products` | Convert founders/companies needing web/mobile apps, SaaS, delivery platforms, MVPs, UI/UX | Start a project |
| 6 | Cybersecurity Services | `/services/cybersecurity` | Establish security credibility (secure-by-design, assessments, IAM, data protection, policies, monitoring/incident-readiness); generate assessment requests; may host the separated In-Development EDR card | Request assessment |
| 7 | Projects / Case Studies list | `/case-studies` | Prove capability through real client work (future project types supported by the template) | View project |
| 8 | Project detail (template) | `/case-studies/[slug]` | Client case studies: challenge → solution → capabilities → outcomes, client identifiers gated by approval flags; template supports Project Types for future internal/open-source work | Discuss a similar project |
| 9 | Contact / Request Consultation | `/contact` | Convert: structured form (name, company, email, phone, service, message) + direct channels (WhatsApp, email, phone) | Submit request |
| 10 | Privacy Policy | `/privacy` | Legal compliance and trust | — |
| 11 | Terms of Use | `/terms` | Legal clarity | — |
| 12 | 404 | any unmatched route | Recover the journey (search / key links) | Back to home |
| — | Admin dashboard | `https://admin.protosoftdev.com` | Internal content operations and lead management (bilingual, role-based, isolated) | — |

**Confirmed project detail page at launch:** `/case-studies/delivery-platform` + `/en/case-studies/delivery-platform` — Integrated Delivery Operations Platform (client project; client identifiers `[PLACEHOLDER]` until written approval).

## 9. Recommended Homepage Content Hierarchy

Sections 2–8 are toggleable and reorderable from the CMS (hero and final CTA anchored). **The homepage must look complete without any EDR content** — the initiative section renders gracefully whether enabled, disabled, or empty.

1. **Hero** — brand message (AR/EN, final wording per voice rules), one-line sub-copy naming the three services, dual CTA: «ابدأ مشروعك» + secondary link to services or projects; subtle technology-inspired background (no binary code, no hooded-hacker imagery).
2. **Value / trust statement** — the "technology partner, not just a vendor" narrative; three differentiators (engineering depth, secure-by-design, long-term partnership). No numbers, no fake logos.
3. **Services overview** — three cards linking to the three service pages. No EDR card here.
4. **Why Protocol Soft** — 4–6 value propositions (bilingual delivery, clear process, security built-in, business-first thinking, maintainable systems, local presence).
5. **Work methodology** — Discovery → Design → Build → Secure & Test → Launch & Support.
6. **Featured project** — the delivery-operations platform (client identifiers `[PLACEHOLDER]`-safe).
7. **Technical Initiatives / «قيد التطوير» (In Development)** — optional small, clearly separated section (or a card within the secure-by-design section, or on the Cybersecurity page — placement to be confirmed) presenting the open-source EDR initiative with the required status label **«قيد التطوير» / "In Development"** and approved wording (§10.4). No sales CTAs, no links, no technical details at launch.
8. **Secure-by-design section** — cybersecurity framing: protection as part of how software is built; links to Cybersecurity Services.
9. **Final CTA band** — consultation request plus WhatsApp/phone quick channels.
10. **Footer** — contact block, navigation, social links, legal links, copyright.

## 10. CMS & Admin Dashboard Scope Summary

The dashboard lives at `https://admin.protosoftdev.com` (separate subdomain and container; see §11). It must support Arabic RTL and English LTR interfaces.

### 10.1 Globals
Company settings (names AR/EN, legal name, description, tagline, main/sales/support email, phone, WhatsApp, address, city/country, working hours, Google Maps link, displayed SEO domain `protosoftdev.com`, copyright, logo set incl. light/dark + SVG/PNG, favicon, default social-sharing image); social links with visibility and ordering; brand/theme tokens (primary/secondary/accent, dark/light backgrounds, text and border colors, button style, border radius, animations on/off, default visual mode — with live preview, WCAG contrast validation, reset-to-default); navigation & footer (three-service dropdown, CTA selection); SEO defaults (canonical domain `https://protosoftdev.com`, sitemap scope = public site only); form settings (notification recipients, confirmation copy).

### 10.2 Collections
Services (the three confirmed services; add/edit/reorder/archive/publish/unpublish, bilingual content, hero, deliverables, capabilities, process, FAQs, related projects, SEO); Projects/Case Studies (client case studies at launch; Project Type field supports Client Project · Internal Product · Open Source Project · R&D Initiative for future use); **Technical Initiatives** (see 10.4); team members; media library (bilingual alt text, categories, search, optimized variants, previews); generic pages (about/privacy/terms); leads; redirects; users.

### 10.3 Project detail template
One template supports multiple project types via the **Project Type** field, with conditional sections: client projects show challenge/solution/outcomes with client name/logo visibility toggles and client-approval status. At launch only the delivery-platform client project is published; no EDR detail page exists (excluded by decision).

### 10.4 Technical Initiatives module (EDR lives here)
A dedicated module manages internal initiatives without public detail pages. The open-source EDR initiative is the first record, with:
- Initiative title in Arabic and English
- Category (Open Source Initiative / Technical Initiative / R&D)
- **Status: In Development (default at launch) · Available · Archived** — rendered with the required label **«قيد التطوير» / "In Development"**
- Description in Arabic and English
- Visibility toggle per placement (homepage section / Cybersecurity Services page / initiatives section)
- Links — GitHub URL, documentation URL, external website URL — **hidden and unpublished at launch**; each becomes available only when status changes to "Available" and Protocol Soft explicitly approves publishing
- Future-control requirement: when EDR matures, Protocol Soft can flip status to "Available", enable links (including a future dedicated EDR website such as `edr.protosoftdev.com`), and have the company website link to it — all without code changes
- Full draft / preview / publish workflow with revision history; per-language translation status

**Approved EDR wording (mandatory baseline at launch):**
- Arabic: «نعمل على تطوير مبادرة EDR مفتوحة المصدر للرصد والاستجابة على الأجهزة الطرفية. المشروع لا يزال قيد التطوير، وسننشر تفاصيله عندما يصبح جاهزاً للاستخدام العام.»
- English: "We are developing an open-source EDR initiative for endpoint visibility and response. The project is still under active development, and we will publish more details when it is ready for public use."

**Prohibited for the EDR initiative (anywhere public):** presenting it as an available product or service; sales CTAs for EDR; security, capability, performance, maturity, or enterprise-readiness claims unless later verified; publishing GitHub, documentation, roadmap, screenshots, or technical details unless Protocol Soft explicitly approves them.

### 10.5 Translation status & bilingual workflow
- Editors clearly see translation status (Arabic / English) per entity and per field group; missing translations are flagged.
- Per-language publish gating: Arabic content complete before Arabic publishing; English complete before English publishing.
- Drafts, preview before publishing, publish/unpublish workflow, and basic revision history on content entities.

### 10.6 Leads pipeline
Statuses New, Contacted, Qualified, Proposal Sent, Won, Lost, Archived; internal notes; assignment; search/filter; CSV export; secure email notifications.

### 10.7 Admin security requirements (layered, deny-by-default)

**Layer 1 — Cloudflare Access / Zero Trust (before the CMS login):**
- Protects `admin.protosoftdev.com` before any request reaches the Payload CMS login page.
- Deny-by-default: only approved team members, matched by approved identity/email policies, may access.
- MFA is required for every admin access.
- Access is revocable immediately when a team member leaves (remove them from the Access policy / identity provider).
- Session duration is configurable at the Access-policy level.

**Layer 2 — Payload CMS authentication (always required after Cloudflare Access):**
- Each authorized user has an individual account; **no shared admin accounts**.
- Strong password rules; secure password reset.
- HTTP-only, secure session cookies; session expiration and revocation.
- No public user registration.
- Role-based permissions enforced at API/server level (not only in the UI).

**Layer 3 — Audit logs & rate limiting:**
- Audit logs for: logins, publishing, changes to global settings, user changes, and role changes (including theme changes).
- Login rate limiting (plus proxy/edge rate limiting on sensitive routes).

### 10.8 Backups and recovery (admin/infrastructure level)
- Daily PostgreSQL backup; media backup; backups stored outside the production server where possible; documented restore process; health checks and restart policies (detailed in §11).

### 10.9 Explicitly out of scope
API keys, DB/hosting credentials, environment variables, deployment, DNS, SSL — never editable in the dashboard. The displayed domain and SEO canonical URL (`protosoftdev.com`) are manageable; actual domain registration, DNS records, SSL, and server configuration remain with the registrar and Protocol Soft's infrastructure.

### 10.10 Role × capability matrix

| Capability | Super Admin | Content Manager | Editor | Sales/Leads Mgr |
|---|---|---|---|---|
| Users, roles, system settings | ✔ | — | — | — |
| Global settings, theme, navigation | ✔ | ✔ | — | — |
| Homepage / services / projects / initiatives / pages | ✔ | ✔ | Drafts only | — |
| Publish / unpublish / archive | ✔ | ✔ | — | — |
| Media library | ✔ | ✔ | ✔ (upload/use) | — |
| SEO settings | ✔ | ✔ | — | — |
| Technical Initiatives (EDR status, visibility, links) | ✔ | ✔ | Drafts only | — |
| Leads: view, manage, assign, export | ✔ | — | — | ✔ |
| Audit logs | ✔ | View | — | — |

## 11. Recommended Technical Architecture

### 11.1 Platform decision
**Self-hosted on Protocol Soft's own server (confirmed).** The application is delivered as Docker containers orchestrated with Docker Compose, fronted by a reverse proxy, with PostgreSQL as the database. Production, staging, and local environments are separated. No Vercel or managed-platform dependency.

### 11.2 CMS choice
**Option A: Next.js + TypeScript + Tailwind CSS + Payload CMS (admin at `admin.protosoftdev.com`)**
**Option B: Next.js + TypeScript + Tailwind CSS + Supabase (Postgres, Auth, Storage) + fully custom admin dashboard**

| Criterion | A: Payload CMS | B: Supabase + custom admin |
|---|---|---|
| Bilingual content model | Field-level localization built in (Arabic default + English) | Custom schema (dual columns / JSONB) + custom admin UI |
| Translation status / per-language publishing | Localization UI built in; status flags via config | All custom-built |
| Drafts, preview, publish, revisions | Built-in versions, autosave, drafts, live preview | All custom-built |
| Role-based access | Built-in access functions, down to field level | Supabase RLS + custom role logic |
| Authentication | Built-in cookie sessions (self-hosted, HTTP-only) | Supabase Auth (cloud dependency, or heavy self-hosted stack) |
| Media library | Built-in uploads: image sizes, focal point, bilingual alt | Custom build on Supabase Storage |
| **Self-hosted Docker fit** | **Excellent: one Node service + PostgreSQL; no serverless constraints; MIT OSS** | Self-hosting the full Supabase stack is heavy (multiple services), or it stays a cloud SaaS — conflicting with the own-server requirement |
| Dashboard build effort | Low–moderate | High (~2–3× overall effort) |
| Long-term security surface | Small — maintained, patched CMS core | Large — custom admin is yours to secure forever |
| Type safety end-to-end | Generated types + Local API | Manual or codegen |
| Cost | Open source; own infra only | Supabase plan or large self-hosted footprint |

**Recommendation: Option A — Next.js + TypeScript + Tailwind CSS + Payload CMS 3.x on PostgreSQL, delivered as Docker containers.** Payload runs as a normal long-running Node service — ideal for self-hosting (no serverless constraints at all). The same codebase produces **two containerized services**: a **web service** (public site; admin routes disabled; no write access of any kind — it reads only published public content through the data-access model selected in Phase 2, §11.6) and a **CMS service** (Payload admin panel + API, reachable only via Cloudflare Access + Tunnel at `admin.protosoftdev.com`) — satisfying the container-separation requirement while keeping one codebase, one deployment unit, and end-to-end type safety.

### 11.3 Production architecture (Docker Compose, single server)

```
Internet
   │
   ▼  [6] Publicly exposed routes — ONLY these two hostnames, both via Cloudflare:
         protosoftdev.com (public website) · admin.protosoftdev.com (admin)
┌─────────────────────────────────────────────────────────────┐
│ CLOUDFLARE EDGE                                             │
│   public website → CDN/WAF, then origin (Cloudflare IPs     │
│   only accepted at the proxy)                               │
│   admin → Access / Zero Trust + MFA (deny-by-default)       │
└────────┬──────────────────────────────────────┬─────────────┘
   public HTTP(S)                        admin traffic
         │                              [2] via Cloudflare Tunnel:
         │                                  outbound-only cloudflared —
         ▼                                  the CMS has NO inbound port
┌──────────────────┐                        │
│ REVERSE PROXY    │              ┌─────────▼─────────┐
│ TLS · security   │              │ cloudflared       │
│ headers · rate   │              │ isolated Compose  │
│ limiting         │              │ service; tunnel   │
└────────┬─────────┘              │ token = server-   │
         │                        │ side secret only  │
         ▼                        └─────────┬─────────┘
┌──────────────────────────┐               │
│ WEB SERVICE              │     ┌─────────▼───────────────┐
│ public Next.js;          │     │ CMS SERVICE             │
│ no database credentials; │     │ Payload admin + API;    │
│ no admin routes          │     │ the ONLY service with   │
│                          │     │ write database access   │
│  [1] published content ──┼────►│ ┌─────────────────────┐ │
│      reads               │     │ │ [5] INTERNAL-ONLY  │ │
│                          │     │ │ CMS API (private   │ │
│  [3] lead submissions ───┼────►│ │ network only;      │ │
│      (validated,         │     │ │ restricted         │ │
│       honeypot, rate-    │     │ │ endpoints; s2s     │ │
│       limited)           │     │ │ auth; rate-limited;│ │
│                          │     │ │ published + public │ │
│  [1] cache revalidation ◄┼─────│ │ content ONLY —     │ │
│      (on publish)        │     │ │ never drafts,      │ │
└──────────────────────────┘     │ │ leads, users,      │ │
                                 │ │ audit, revisions,  │ │
                                 │ │ private media, or  │ │
                                 │ │ settings)          │ │
                                 │ └─────────────────────┘ │
                                 └─────────┬───────────────┘
                                           │ [2] cms write access
                                           │ (cms_readwrite; DDL only
                                           │  via deploy_migrations)
                                           ▼
                                 ┌──────────────────┐
                                 │ PostgreSQL       │
                                 │ private network; │
                                 │ 5432 NEVER       │
                                 │ published        │
                                 └────────┬─────────┘
                                          │ [4] backup flow
                                          │ (backup_readonly)
                                          ▼
                              encrypted DB + media backups
                                          │
                                          ▼
                              off-server backup storage

   Redis (if used) and container management ports: internal only.
   Environment separation: production · staging (isolated) · local (compose).
   Diagram shows Option A (recommended, §11.6). Under Option B the web service
   would instead hold a scoped read-only account limited to restricted
   PostgreSQL views of published public content — selected in Phase 2.
```

**Isolation rules:** with the preferred Cloudflare Tunnel, the CMS/admin service publishes no inbound port at all; the reverse proxy is the only inbound entry point (ports 80/443) and serves the public site. PostgreSQL, internal APIs, Redis, container-management ports, and internal services are never publicly exposed. Private Docker networks separate the edge/proxy tier, the application tier, and the data tier. The only database writer is the CMS service (`cms_readwrite`); migrations use a dedicated deploy role, backups use `backup_readonly`, and the public website's data access is deliberately limited to published public content by the option selected in Phase 2 (§11.6).

**Logical vs physical isolation (documented difference):**
- **Strong logical isolation (this project):** separate containers/services for web, CMS, and PostgreSQL; private networks; no published database ports; least-privilege DB users; proxy as sole entry. All services share one host kernel and hardware — a host-level compromise affects everything on the server.
- **Future physical isolation:** moving the CMS/admin (and optionally the database) to a separate server or VM isolates host resources, failure domains, and maintenance windows, at the cost of a second machine and inter-host firewall/VPN rules. The architecture above is designed so this migration is a deployment/compose change — **not an application rewrite**.

### 11.4 Self-hosting requirements (to be delivered during implementation)
- **Core:** Docker; Docker Compose; PostgreSQL; secure environment variables (`.env.example` committed without real secrets; real secrets only on the server, never in source control or frontend code); reverse proxy (Nginx, Caddy, or Traefik — technical selection in Phase 2, leaning Caddy for automatic HTTPS or Nginx for maximum ecosystem familiarity); HTTPS/SSL certificates; health checks; structured logging; production/staging/local environment separation.
- **Data:** scheduled database backup and documented restore; uploaded-media backup and restore; backups stored off-server where possible.
- **Docs & checklists:** deployment documentation; update and rollback procedures; recovery documentation; security hardening checklist; production launch checklist.
- **Artifacts:** `Dockerfile(s)`, `docker-compose.yml` / `docker-compose.production.yml`, `.env.example` (no real secrets), plus the documents above.

### 11.5 Admin access protection — preferred architecture (confirmed direction)

**Cloudflare Access / Zero Trust with MFA → Cloudflare Tunnel → Payload CMS login (individual accounts) → API-enforced role-based access control → audit logs → rate limiting.** VPN-only is **not** a recommended or preferred option (excluded by decision). IP allowlisting remains available only as an **optional supplementary control** (e.g., an additional restriction inside an Access policy), never the primary protection.

**Access flow (deny-by-default):**
1. A user requests `https://admin.protosoftdev.com`.
2. **Cloudflare Access** evaluates its policy before anything reaches the origin: deny-by-default; access granted only to approved team members via approved identity/email policies; **MFA required**; session duration configurable per policy; access **revocable immediately** when a team member leaves (remove them from the policy / identity provider).
3. An approved user reaches the **Payload CMS login** and authenticates with an **individual account** — no shared admin accounts, no public registration, strong password rules, secure password reset, HTTP-only secure session cookies with expiration and revocation.
4. **Role-based permissions** (Super Admin / Content Manager / Editor / Sales) are enforced at the API/server level on every operation.
5. **Audit logs** capture logins, publishing, global-settings changes, user changes, and role changes; **rate limiting** applies at the edge/proxy and on login attempts.

**Origin protection — preferred method confirmed: Cloudflare Tunnel.** The origin must reject or restrict direct attempts to reach `admin.protosoftdev.com` that bypass Cloudflare:

- **Preferred: Cloudflare Tunnel.** An outbound-only `cloudflared` container connects the CMS to Cloudflare, so the **CMS/admin container never publishes an inbound port to the internet** — bypass becomes structurally impossible rather than merely filtered.
  - *Docker Compose integration:* `cloudflared` runs as its own **isolated Compose service** on the same private Docker network as the `cms` service; the **tunnel token is stored only as a server-side secret/environment variable** (never in Git or frontend code); it forwards traffic to the `cms` service over the private network, and all connections are initiated outbound to Cloudflare.
  - *Reverse-proxy integration:* the tunnel can alternatively target the reverse proxy (which then routes to `cms` by hostname) if a single TLS/configuration point is preferred — both wirings are documented; direct tunnel → `cms` is simpler and preferred.
- **IP allowlisting is not the primary protection.** It may remain only as an optional supplementary restriction (e.g., an additional rule inside an Access policy, or at the proxy alongside the tunnel).
- **Break-glass access (documented procedure):** if Cloudflare is unavailable, admin access is restored through a procedure that **requires authorized server (SSH) access**, is **temporary**, is **logged** (the audit/system log records who enabled it, when, and why), and is **revoked immediately after use**. Payload accounts, RBAC, and audit logs remain effective throughout.
- The public-site origin is hardened in parallel (only Cloudflare IP ranges accepted at the proxy), so neither hostname is directly reachable.

### 11.6 Public website data access & database security model

**Why a plain read-only role is not enough.** A generic `SELECT`-only database role would still be able to read draft content, unpublished content, leads, user accounts, admin roles, audit logs, private media, internal notes, CMS configuration, theme history, revisions, and sensitive operational metadata. The public website must only ever access **explicitly approved, published, public-facing content**. Two candidate patterns are approved for comparison; **the final data-access model is not yet selected — it is decided in Phase 2**.

**Option A — Internal Public Content API (recommended):**
- The public website calls a limited internal CMS API over the private Docker network.
- The API exposes only published public content, filtered through Payload access-control rules.
- It never exposes drafts, leads, users, audit logs, revisions, private media, or administrative settings.
- Restricted endpoints, request validation, service-to-service authentication (internal token / network-level restriction), and rate limiting.

**Option B — Restricted Public Database Views:**
- The public website receives a read-only database account limited to explicit PostgreSQL views containing published public content only.
- The account has **no permissions** on Payload's original content tables, users table, leads table, audit tables, revision tables, media tables, or settings tables.
- Views return only records explicitly marked as published and public; the account cannot bypass publishing status, visibility settings, language gating, or private-media restrictions.

**Comparison:**

| Criterion | A: Internal Public Content API | B: Restricted DB Views |
|---|---|---|
| Security boundary | One enforced choke point — Payload access control decides published + public + language + visibility; the web tier holds no table-level access at all | SQL-level restriction is strong, but every rule (status, visibility, language, media privacy) must be re-implemented and maintained in views |
| Maintainability with Payload | Follows Payload's own schema, migrations, localization, and versioning — no parallel artifact to keep in sync | Views must mirror Payload's schema; every CMS migration risks breaking or silently widening a view |
| Preview & draft workflow | Unaffected — drafts and preview stay entirely inside the CMS service | Draft/version tables must be carefully excluded; preview needs separate handling |
| Arabic/English content | Language fallback and gating enforced by Payload localization in one place | Localized data layout must be reproduced correctly in every view |
| Failure mode if misconfigured | API layer can only return what access control allows; errors surface quickly | A missed filter or schema drift can leak unpublished rows with no application-layer backstop |
| Future scalability | API can gain caching, rate limits, observability; web tier scales horizontally with no DB credentials at all | Every new content type requires a new secured view and grants |
| Verdict | **Recommended for Phase 2** | Viable but higher long-term maintenance and drift risk |

**Recommendation:** **Option A — the Internal Public Content API** — as the more secure and maintainable option for this stack (Next.js public website, Payload CMS as a separate service, Docker Compose self-hosting, PostgreSQL, Arabic/English published content, preview and draft workflow, future scalability). Final selection and detailed design are confirmed in Phase 2.

**Hard invariants (either option):** the public website never has direct or indirect access to CMS write operations, CMS user management, leads, audit logs, private documents, drafts, revisions, environment variables, or administrative settings.

**Database roles:**

| Role | Used by | Permissions |
|---|---|---|
| Web content access *(per Phase 2 selection)* | public web service | Option A: **no database credentials at all** (content via the internal API) · Option B: read-only on restricted published-content views only |
| `cms_readwrite` | CMS/admin service | Read/write on the application schema (content, media, users, leads, audit) — the only writer |
| `deploy_migrations` | deployment job only | Schema changes (DDL) during controlled deploys |
| `backup_readonly` | backup job | Read-only dumps for encrypted, off-server backup |

- PostgreSQL runs **only on a private Docker network**; port 5432 is never published; no direct remote database access from the internet.
- **Lead submissions:** posted by the web service to the CMS internal API over the private network (validated, honeypot, rate-limited); the write is performed by the CMS under `cms_readwrite`. Cache revalidation on publish flows cms → web over the same private network.
- **Secrets:** no database credentials or real secrets in source control or frontend code; `.env.example` documents variable names without real values; real secrets live only on the server (environment variables / secrets store outside Git).
- **Backups:** database and media backups encrypted where practical and stored off-server where possible; documented and tested restore.

### 11.7 Stack summary
Next.js (App Router) + TypeScript strict · Tailwind CSS with CSS-variable tokens · Payload 3.x (two services from one codebase) · PostgreSQL (private container, pooled connections, least-privilege roles per §11.6) · Cloudflare Access with MFA + Cloudflare Tunnel (`cloudflared`) protecting `admin.protosoftdev.com` · S3-compatible or local volume media storage with backup (decided Phase 2) · transactional email via API (e.g., Resend; key in env only) · Sentry or equivalent self-hostable error tracking + privacy-friendly analytics (Plausible self-hosted fits the own-server posture) · reverse proxy with TLS, security headers, rate limiting on sensitive routes · canonical domain `https://protosoftdev.com` with `hreflang` pairs (e.g., `https://protosoftdev.com/services/cybersecurity` ↔ `https://protosoftdev.com/en/services/cybersecurity`); `admin.protosoftdev.com` excluded from the public sitemap and `noindex`.

## 12. Initial Content Model / Data Entities (conceptual — no migrations)

| # | Entity | Type | Key fields |
|---|---|---|---|
| 1 | User | Collection | Admin accounts; roles: super_admin, content_manager, editor, sales_manager; no public registration |
| 2 | Site Settings | Global | Names AR/EN, legal name, description, tagline, 3 emails, phone, WhatsApp, address, city/country, hours, Maps link, displayed SEO domain (`protosoftdev.com`), copyright, logo set, favicon, OG image |
| 3 | Social Link | Collection | Platform, URL, visibility, order |
| 4 | Theme Settings | Global | Token fields only + contrast validation + reset; changes audit-logged |
| 5 | Homepage | Global | Per-section bilingual copy, CTAs, images, enabled, order |
| 6 | Service | Collection | Slug, title AR/EN, hero, overview, deliverables[], capabilities[], process[], FAQs[], related projects, SEO, order, status — three confirmed services at launch |
| 7 | Project / Case Study | Collection | Slug, title AR/EN, projectType (Client Project · Internal Product · Open Source Project · R&D Initiative), description AR/EN, challenge/solution/outcomes, capabilities, technologies[], images, client name/logo visibility flags + client-approval status, featured flag, visibility, SEO, status |
| 8 | **Technical Initiative** | Collection | Title AR/EN, category (Open Source Initiative / Technical Initiative / R&D), **status (In Development · Available · Archived)**, description AR/EN, placement visibility (homepage / cybersecurity page / initiatives section), GitHub URL, documentation URL, external website URL (link fields hidden until status = Available + explicit approval), draft/preview/publish + revisions, translation status. **EDR is the first record; In Development at launch.** |
| 9 | Team Member | Collection | Name, title AR/EN, bio AR/EN, photo, LinkedIn, visibility, order |
| 10 | Media | Upload | Variants, alt AR/EN, category, tags, search |
| 11 | Page | Collection | Generic pages (about/privacy/terms), localized blocks |
| 12 | Navigation | Global | Header items (labels AR/EN, links, order — three-service dropdown), footer columns, CTA selection |
| 13 | Lead | Collection | Contact data, service interest, message, 7-state status, assigned user, notes[], timestamps |
| 14 | SEO Settings | Global | Title template, defaults, canonical domain, sitemap rules (public domain only) |
| 15 | Redirect | Collection | From → to (launch safety net; nice-to-have) |
| 16 | Form Settings | Global | Notification recipients, confirmation copy |

Arabic is the default required locale; versions/drafts/revisions on Services, Projects, Initiatives, Pages, Homepage, Team. Leads are create-only through a hardened public endpoint. Per-language publish gating applies to all localized entities (§3.6).

## 13. Phased Implementation Plan (planning → deployment)

| Phase | Focus | Exit gate |
|---|---|---|
| 0 | Discovery (complete) | ✔ |
| **1** | **Strategy & roadmap (this document, v1.3)** | **Client approval — we are here** |
| 2 | CMS architecture, data model, admin IA (field-level schema incl. Technical Initiatives, translation status, audit logs; workflows; admin sitemap/wireframes; infrastructure design: compose topology with cloudflared tunnel, reverse-proxy selection, Cloudflare Access policies, public-website data-access model selection — Option A vs B, §11.6 — and least-privilege database roles) | Approval |
| 3 | Design system & UI design (tokens, component library, hi-fi screens AR+EN, RTL-first) | Approval |
| 4 | Foundation & infrastructure build (repo, Next+Payload two-service split, Dockerfiles + local compose, PostgreSQL with least-privilege roles, auth+RBAC, cloudflared tunnel wiring, structured logging, health checks) | Local stack runs; RBAC works |
| 5 | CMS implementation (globals/collections incl. Technical Initiatives, media, versions/preview, translation status & gating, leads+email, audit logs) | CMS usable end-to-end |
| 6 | Public core (layout, header/footer, home, about, contact, legal, 404 — AR+EN) | Staging review |
| 7 | Services (3 pages) + projects list/detail (client template; project-type support) | Staging review |
| 8 | Admin custom views (dashboard, leads pipeline, theme customizer with live preview + contrast validation, navigation manager) | Acceptance |
| 9 | Content entry AR+EN (three services, delivery-platform case study with approvals, EDR initiative section with approved wording only, about/team) | Content sign-off |
| 10 | QA & hardening (bilingual/RTL, WCAG 2.1 AA, performance, SEO/hreflang for protosoftdev.com, security review incl. admin isolation verification, cross-browser) | Criticals closed |
| 11 | Production infrastructure & launch: production + staging compose stacks on the server, reverse proxy + TLS (apex, www, optional staging), Cloudflare Access policies (deny-by-default, MFA) + Cloudflare Tunnel for admin, origin-bypass protections verified, security headers + rate limiting, backup automation (encrypted, off-server) + **restore drill**, monitoring/alerting, deployment/rollback/recovery docs, security hardening checklist, production launch checklist, DNS cutover to `https://protosoftdev.com` | Live site |
| 12 | Post-launch (analytics review, fixes, admin training, handover docs incl. operations runbooks) | Handover accepted |

Phases 5–7 carry the heaviest build effort; Phase 9 is routinely underestimated — every page is written twice, naturally, in each language. Calendar estimates come at Phase 2 exit.

## 14. Required Information & Assets from Protocol Soft (before launch)

- **Infrastructure:** the production server (access/OS, resources); DNS control for `protosoftdev.com` to create A records on the apex and `www` (plus optional `staging` and future `edr`) — the `admin` hostname is served through the Cloudflare Tunnel rather than an origin A record; a **Cloudflare account hosting the `protosoftdev.com` zone** (required for Access and Tunnel), the Zero Trust plan choice, and the approved team-member identities/emails for the Access policy; SSL approach (Let's Encrypt via proxy, or provided certificates); an off-server backup destination (object storage or another machine); ability to set SPF/DKIM on `protosoftdev.com` for notification email.
- **Corporate/legal:** exact display names AR/EN; legal registered name; verified certifications/partnerships to claim — or explicit confirmation of "none"; whether registration details appear publicly.
- **Brand:** logos (SVG + PNG, light/dark), favicon, default social-sharing image, any brand guidelines.
- **Contact:** main/sales/support emails, phone, WhatsApp, address, city/country, working hours, Google Maps link, social URLs and ordering.
- **Delivery-platform case study:** scope confirmation, screenshots/product visuals, technologies, outcomes — plus **written client approval** defining exactly what may be shown.
- **Technical Initiative (EDR):** confirmation of placement (homepage section / Cybersecurity page card / both) and the approved wording; any future approval for GitHub/docs/roadmap/screenshots/website links (none assumed at launch).
- **Content decisions:** hero message choice, team members to publish, About narrative input.
- **Legal:** who drafts and legally owns the Privacy Policy and Terms of Use text.

## 15. Risks, Assumptions & Open Decisions

### 15.1 Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Self-hosted single server: hardware failure, patching burden, no auto-scaling | Downtime; operational load on Protocol Soft | Restart policies, health checks, monitoring/alerts, documented update/rollback/recovery, daily off-server backups with tested restore, architecture ready for physical isolation (second server/VM) without app rewrite |
| Admin subdomain exposed to the internet | Elevated attack surface on the CMS | Cloudflare Access deny-by-default with MFA (§11.5), origin tunnel (preferred method) so bypass attempts cannot reach the CMS, login rate limiting, audit logs, API-enforced RBAC, noindex + no public links |
| Cloudflare dependency for admin access (Access + Tunnel are the confirmed preferred architecture) | Admin unreachable during a Cloudflare outage or account issue | Documented break-glass procedure (temporary SSH port-forward to the cms container); Payload accounts, RBAC, and audit logs remain effective as inner layers; the public site stays reachable |
| Misconfigured database roles or accidental port publication | Security breach or broken publishing | Roles scripted and verified in Phase 4; launch checklist verifies the public website's data access is properly scoped and 5432 is unpublished; the tunnel removes inbound exposure for the CMS entirely |
| EDR initiative drifting into product marketing | Overstated claims; credibility and legal risk | Locked baseline wording (§10.4); link fields hidden until status "Available" + explicit approval; prohibited-phrase checklist in content review |
| Case-study client approval delayed | Featured homepage section incomplete at launch | Placeholder-safe design; publish without client identifiers until approved |
| Payload admin UI Arabic-RTL depth is not first-class out of the box | Admin polish below public-site polish | Custom translation dictionary + scoped RTL styling; acceptance criteria defined in Phase 2 |
| Theme customizer misuse | Brand/accessibility damage | Token-only editing, live contrast validation, reset, publish review, audit logs |
| Lead form spam | Noisy pipeline | Honeypot, server-side validation, proxy-level rate limiting |
| Admin scope creep | Timeline blowout | Phase gates; admin IA approved in Phase 2 before build |
| Bilingual content effort underestimated | Launch delay | Per-page AR+EN content matrix; translation-status visibility; review checkpoints |

### 15.2 Assumptions
Arabic default at `https://protosoftdev.com/`, English at `/en` (confirmed); self-hosted production on Protocol Soft's own server with Docker/Compose/PostgreSQL/reverse proxy (confirmed); DNS for `protosoftdev.com` hosted at Cloudflare, required for Cloudflare Access and Tunnel; the public-website data-access pattern (§11.6, Option A vs Option B) is selected in Phase 2, with Option A recommended; the three confirmed services are the complete launch set; EDR appears only as an In-Development initiative within approved wording, with no links or technical details at launch; no blog at launch; no e-commerce; reverse-proxy software and media-storage details selected technically in Phase 2; transactional email via third-party API on the `protosoftdev.com` domain; all real content supplied by Protocol Soft; no public user accounts; staging is an isolated stack (subdomain or access-restricted) on the same server or a second machine.

### 15.3 Open decisions (only items genuinely requiring Protocol Soft's approval)
1. **EDR placement at launch:** homepage "In Development / Technical Initiatives" section, a card on the Cybersecurity Services page, both, or neither — and confirmation of the suggested wording (§10.4).
2. **Hero message:** primary («نبني أنظمة رقمية موثوقة…» / "Build smarter. Operate securely.") or the alternates?
3. **Delivery-platform case study:** what does written client approval cover (name, logo, screenshots, outcomes)?
4. **Certifications/partnerships:** any to display, or confirm "none at launch"?
5. **Team section:** public at launch — and with how many members?
6. **WhatsApp number** for quick-contact CTAs?
7. **Analytics:** self-hosted Plausible (recommended, fits the own-server posture) vs GA4?
8. **Legal copy:** who drafts and legally owns the Privacy Policy and Terms of Use?
9. **Blog/insights** needed at launch? (not currently in scope)
10. *(Future, not launch-blocking)* When the EDR initiative becomes "Available": dedicated website at `edr.protosoftdev.com` or an independent domain?

## 16. Phase 1 Acceptance Checklist

- ✔ All Phase 1 sections delivered, including Brand Voice & Content Principles
- ✔ Self-hosted architecture documented (Docker, Compose, PostgreSQL, reverse proxy, private networks, port-exposure rules, backup/restore, health checks, logging, environment separation, deployment/rollback/recovery docs and checklists)
- ✔ Admin dashboard isolated at `https://admin.protosoftdev.com`; `/admin` public path removed; no public links, navigation entries, sitemap entries, or indexing for the dashboard
- ✔ Admin access protection decided: Cloudflare Access / Zero Trust with MFA → Cloudflare Tunnel → Payload login with individual accounts → API-enforced RBAC → audit logs → rate limiting, deny-by-default; VPN-only removed; IP allowlisting optional-supplementary only
- ✔ Cloudflare Tunnel confirmed as the preferred origin-protection method: outbound-only cloudflared, isolated Compose service, tunnel token as a server-side secret only, no inbound port for the CMS, break-glass procedure that is authorized, temporary, logged, and revoked after use
- ✔ Public-website data-access model corrected: broad SELECT-only access rejected; Option A (Internal Public Content API — recommended) vs Option B (restricted PostgreSQL views) documented for Phase 2 selection; drafts, leads, users, audit logs, revisions, private media, and administrative settings permanently outside the public website's reach
- ✔ CMS-only write access (`cms_readwrite`), separate migration and backup roles, port 5432 never published, lead writes via the CMS internal API, secrets outside Git, encrypted off-server backups
- ✔ Architecture diagram distinguishes the six required flows: public content access, CMS write access, lead submission, backup flow, internal-only CMS endpoints, publicly exposed routes
- ✔ Audit-log, session-security, MFA-readiness, and backup requirements documented
- ✔ EDR removed from service pages, services navigation, and project detail pages at launch; `/case-studies/open-source-edr` excluded; presented only as a «قيد التطوير» / "In Development" open-source initiative with approved wording, no sales CTAs, no unapproved links
- ✔ Future CMS controls for EDR documented (status change, visibility, links, future dedicated website)
- ✔ Services list remains the three confirmed commercial services (AR + EN names)
- ✔ Main navigation unchanged (AR + EN); Arabic primary at `https://protosoftdev.com/`, English at `/en/`
- ✔ Vercel assumptions fully removed; recommendation updated (Option A: Payload CMS on PostgreSQL, self-hosted Docker)
- ✔ Bilingual completeness, translation-status, and per-language publish gating documented
- ✔ No final UI screens, no implementation code, no Docker files, no database migrations produced
- ✔ Content-integrity and EDR transparency rules honored throughout
- ✔ Version history maintained with dates corrected to 2026-09-13; no duplicate sections
- ☐ **Client approval to proceed to Phase 2**

---

*End of Phase 1 (v1.3). Next phase upon approval: **Phase 2 — CMS Architecture, Data Model, and Admin Dashboard Information Architecture.***
