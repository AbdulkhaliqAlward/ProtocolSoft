/**
 * Internal Public Content API — content read group (Phase 2 §6.2/§6.3).
 * Every response is filtered to published + locale-published + visible entities.
 * The envelope ALWAYS sets fallbackUsed: false (no silent fallback, §6.3).
 *
 * Forbidden data (§6.4) — drafts, revisions, leads, users, audit logs, private
 * media, form settings, CMS config — is structurally unreachable: handlers only
 * project explicit whitelisted fields.
 *
 * Payload custom endpoints don't support path params, so single-document reads
 * use ?slug= (contract in packages/shared/src/contracts.ts).
 */
import type { PayloadRequest } from 'payload';

import { isLocale, type Locale, type PublicContactConfig, type PublicInitiativeCard } from '@protocol-soft/shared';

import { guardInternalKey, ok } from './guard.js';
import { evaluatePublicReadiness } from '../../utilities/publicReadiness.js';

type Doc = Record<string, unknown>;

const localizedOf = (value: unknown, locale: Locale): unknown =>
  value != null && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>)[locale] : value;

const idOf = (value: unknown): number | string | null => {
  if (value == null) return null;
  if (typeof value === 'number' || typeof value === 'string') return value;
  if (typeof value === 'object' && 'id' in (value as object)) return (value as { id: number | string }).id;
  return null;
};

/** Load media visibility/screening map for readiness + stripping decisions. */
const loadMediaMap = async (req: PayloadRequest, ids: (number | string)[]) => {
  const map = new Map<number | string, { visibility: 'public' | 'private'; sensitivityScreening?: { status?: string } | null }>();
  if (ids.length === 0) return map;
  const res = await req.payload.find({
    collection: 'media',
    where: { id: { in: ids.map(String) } },
    limit: ids.length,
    overrideAccess: true,
    pagination: false,
  });
  for (const m of res.docs) {
    map.set(m.id, {
      visibility: (m.visibility as 'public' | 'private') ?? 'public',
      sensitivityScreening: (m as { sensitivityScreening?: { status?: string } }).sensitivityScreening ?? null,
    });
  }
  return map;
};

const gateFor = async (req: PayloadRequest, doc: Doc, intended: Locale[]) => {
  const mediaIds: (number | string)[] = [];
  const coverId = idOf(doc.coverImage);
  if (coverId) mediaIds.push(coverId);
  for (const s of (doc.screenshots as unknown[] | undefined) ?? []) {
    const sid = idOf(s);
    if (sid) mediaIds.push(sid);
  }
  const mediaById = await loadMediaMap(req, mediaIds);
  return { gate: evaluatePublicReadiness(doc, intended, { mediaById }), mediaById };
};

const publishedWhere = { _status: { equals: 'published' } } as const;

/** Project doc -> public-safe shape (identity stripped unless approved+visible; CS1/§6.3). */
const projectPublic = async (req: PayloadRequest, doc: Doc, locale: Locale): Promise<Doc | null> => {
  const publishedLocales = (doc.publishedLocales as Locale[] | undefined) ?? [];
  if (!publishedLocales.includes(locale)) return null;
  const { gate, mediaById } = await gateFor(req, doc, [locale]);
  if (!gate.passes) return null; // readiness re-check (defense in depth)

  const client = doc.client as Doc | undefined;
  const approved = client?.approvalStatus === 'approved_restricted' || client?.approvalStatus === 'approved_full';

  // Screenshots: public-visibility + screening-approved ONLY (CS1/§6.3)
  const screenshots: unknown[] = [];
  for (const s of (doc.screenshots as unknown[] | undefined) ?? []) {
    const sid = idOf(s);
    if (sid == null) continue;
    const media = mediaById.get(sid);
    if (media && media.visibility === 'public' && media.sensitivityScreening?.status === 'approved') screenshots.push(s);
  }

  return {
    slug: doc.slug,
    projectType: doc.projectType,
    title: localizedOf(doc.title, locale),
    summary: localizedOf(doc.summary, locale),
    challenge: localizedOf(doc.challenge, locale),
    solution: localizedOf(doc.solution, locale),
    capabilities: (doc.capabilities as unknown[] | undefined)?.map((c) => localizedOf(c, locale)) ?? [],
    coverImage: doc.coverImage ?? null,
    screenshots,
    // identity: only with approval + explicit visibility flag; never [PLACEHOLDER] (CS1)
    client: approved
      ? {
          approved: true,
          name: client?.nameVisible ? localizedOf(client.name, locale) ?? client.name : null,
          logo: client?.logoVisible ? client.logo : null,
        }
      : { approved: false },
    timeline: doc.timeline ?? null,
  };
};

export const contentEndpoints = [
  {
    path: '/internal/health',
    method: 'get' as const,
    handler: async (): Promise<Response> => Response.json({ ok: true, service: 'cms', time: new Date().toISOString() }),
  },

  /* ── site settings (public subset) ── */
  {
    path: '/internal/content/site-settings',
    method: 'get' as const,
    handler: async (req: PayloadRequest): Promise<Response> => {
      const denied = guardInternalKey(req, 'content');
      if (denied) return denied;
      // locale 'all' so every localized field arrives as {ar,en}; localizedOf picks per side
      const s = (await req.payload.findGlobal({ slug: 'site-settings', overrideAccess: true, locale: 'all' })) as unknown as Doc;
      return ok({
        companyName: { ar: localizedOf(s.companyName, 'ar'), en: localizedOf(s.companyName, 'en') },
        tagline: { ar: localizedOf(s.tagline, 'ar'), en: localizedOf(s.tagline, 'en') },
        emailMain: s.emailMain ?? null,
        emailSales: s.emailSales ?? null,
        emailSupport: s.emailSupport ?? null,
        phone: s.phone ?? null,
        addressLine: { ar: localizedOf(s.addressLine, 'ar'), en: localizedOf(s.addressLine, 'en') },
        city: s.city ?? null,
        country: s.country ?? null,
        workingHours: { ar: localizedOf(s.workingHours, 'ar'), en: localizedOf(s.workingHours, 'en') },
        footerCopyright: { ar: localizedOf(s.footerCopyright, 'ar'), en: localizedOf(s.footerCopyright, 'en') },
      });
    },
  },

  /* ── contact-config: the ONLY public-safe subset of form/site settings (§6.8) ── */
  {
    path: '/internal/content/contact-config',
    method: 'get' as const,
    handler: async (req: PayloadRequest): Promise<Response> => {
      const denied = guardInternalKey(req, 'content');
      if (denied) return denied;
      const locale = req.query.locale;
      if (!isLocale(locale)) return Response.json({ error: 'invalid locale' }, { status: 400 });
      const s = (await req.payload.findGlobal({ slug: 'site-settings', overrideAccess: true, locale: 'all' })) as unknown as Doc;
      const f = (await req.payload.findGlobal({ slug: 'form-settings', overrideAccess: true, locale: 'all' })) as unknown as Doc;
      const whatsappRaw = typeof s.whatsappNumber === 'string' ? s.whatsappNumber.replace(/[^0-9]/g, '') : '';
      const whatsappDigitsValid = whatsappRaw.length >= 9 && whatsappRaw.length <= 15;
      // Dev/staging test values are allowed (§6.9) but the state contract is the same.
      const data: PublicContactConfig = {
        confirmationMessage: {
          ar: String(localizedOf(f.confirmationMessage, 'ar') ?? ''),
          en: String(localizedOf(f.confirmationMessage, 'en') ?? ''),
        },
        channels: {
          emailMain: (s.emailMain as string) ?? '',
          emailSales: (s.emailSales as string) ?? undefined,
          emailSupport: (s.emailSupport as string) ?? undefined,
          phone: (s.phone as string) ?? undefined,
          whatsapp: whatsappDigitsValid
            ? { status: 'configured', url: `https://wa.me/${whatsappRaw}` }
            : { status: 'unconfigured' },
          workingHours: { ar: String(localizedOf(s.workingHours, 'ar') ?? ''), en: String(localizedOf(s.workingHours, 'en') ?? '') },
          addressLine: { ar: String(localizedOf(s.addressLine, 'ar') ?? ''), en: String(localizedOf(s.addressLine, 'en') ?? '') },
          mapsUrl: (s.googleMapsUrl as string) ?? undefined,
        },
      };
      return ok(data, locale);
    },
  },

  {
    path: '/internal/content/social-links',
    method: 'get' as const,
    handler: async (req: PayloadRequest): Promise<Response> => {
      const denied = guardInternalKey(req, 'content');
      if (denied) return denied;
      const res = await req.payload.find({
        collection: 'social-links',
        where: { visible: { equals: true } },
        sort: 'sortOrder',
        overrideAccess: true,
        pagination: false,
      });
      return ok(res.docs.map((d) => ({ platform: d.platform, label: d.label ?? null, url: d.url })));
    },
  },

  {
    path: '/internal/content/navigation',
    method: 'get' as const,
    handler: async (req: PayloadRequest): Promise<Response> => {
      const denied = guardInternalKey(req, 'content');
      if (denied) return denied;
      const locale = req.query.locale;
      if (!isLocale(locale)) return Response.json({ error: 'invalid locale' }, { status: 400 });
      const nav = (await req.payload.findGlobal({ slug: 'navigation', overrideAccess: true, locale, fallbackLocale: false })) as unknown as Doc;
      return ok(
        {
          headerItems: ((nav.headerItems as Doc[] | undefined) ?? [])
            .filter((i) => i.visible !== false)
            .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0))
            .map((i) => ({ label: i.label, target: i.target })),
          headerCta: nav.headerCta ? { label: (nav.headerCta as Doc).label, target: (nav.headerCta as Doc).target } : null,
          footerColumns: ((nav.footerColumns as Doc[] | undefined) ?? []).map((c) => ({ title: c.title, links: c.links ?? [] })),
        },
        locale,
      );
    },
  },

  {
    path: '/internal/content/theme',
    method: 'get' as const,
    handler: async (req: PayloadRequest): Promise<Response> => {
      const denied = guardInternalKey(req, 'content');
      if (denied) return denied;
      // Controlled variants ONLY (Phase 5 visual revision): the approved semantic
      // token sets live in code; no raw hex values are exposed or stored here.
      const t = (await req.payload.findGlobal({ slug: 'theme-settings', overrideAccess: true })) as unknown as Doc;
      const mode = t.defaultMode;
      const preset = t.colorPreset;
      const style = t.buttonStyle;
      const radius = t.borderRadius;
      return ok(
        {
          colorPreset: preset === 'ink_stone_v1' ? preset : 'ink_stone_v1',
          defaultMode: mode === 'light' || mode === 'dark' ? mode : 'system',
          buttonStyle: style === 'outline' || style === 'soft' ? style : 'filled',
          borderRadius: radius === 'sm' || radius === 'lg' || radius === 'full' ? radius : 'md',
          animationsEnabled: t.animationsEnabled !== false,
        },
      );
    },
  },

  {
    path: '/internal/content/services',
    method: 'get' as const,
    handler: async (req: PayloadRequest): Promise<Response> => {
      const denied = guardInternalKey(req, 'content');
      if (denied) return denied;
      const locale = req.query.locale;
      if (!isLocale(locale)) return Response.json({ error: 'invalid locale' }, { status: 400 });
      const slug = typeof req.query.slug === 'string' ? req.query.slug : undefined;

      if (slug) {
        const res = await req.payload.find({
          collection: 'services',
          where: { and: [publishedWhere, { slug: { equals: slug } }] },
          locale,
          fallbackLocale: false,
          limit: 1,
          overrideAccess: true,
        });
        const d = res.docs[0];
        if (!d || !((d.publishedLocales as Locale[] | undefined) ?? []).includes(locale) || d.archivedAt) {
          return Response.json({ error: 'not_found' }, { status: 404 });
        }
        return ok(
          {
            slug: d.slug,
            title: d.title,
            heroHeadline: d.heroHeadline,
            heroSubhead: d.heroSubhead ?? null,
            icon: d.icon ?? null,
            summary: d.summary,
            overview: d.overview,
            deliverables: d.deliverables ?? [],
            capabilities: d.capabilities ?? [],
            processSteps: d.processSteps ?? [],
            faqs: d.faqs ?? [],
            initiativeSection: d.initiativeSection ?? { enabled: false }, // copy comes from the initiative record (D2)
            seo: d.seo ?? null,
          },
          locale,
        );
      }

      const res = await req.payload.find({
        collection: 'services',
        where: publishedWhere,
        locale,
        fallbackLocale: false,
        sort: 'sortOrder',
        overrideAccess: true,
        pagination: false,
      });
      const data = res.docs
        .filter((d) => ((d.publishedLocales as Locale[] | undefined) ?? []).includes(locale) && !d.archivedAt)
        .map((d) => ({ slug: d.slug, title: d.title, summary: d.summary, icon: d.icon ?? null, sortOrder: d.sortOrder }));
      return ok(data, locale);
    },
  },

  {
    path: '/internal/content/case-studies',
    method: 'get' as const,
    handler: async (req: PayloadRequest): Promise<Response> => {
      const denied = guardInternalKey(req, 'content');
      if (denied) return denied;
      const locale = req.query.locale;
      if (!isLocale(locale)) return Response.json({ error: 'invalid locale' }, { status: 400 });
      const slug = typeof req.query.slug === 'string' ? req.query.slug : undefined;
      const where = slug ? { and: [publishedWhere, { slug: { equals: slug } }] } : publishedWhere;

      const res = await req.payload.find({
        collection: 'case-studies',
        where,
        locale,
        fallbackLocale: false,
        sort: 'sortOrder',
        overrideAccess: true,
        pagination: false,
      });

      if (slug) {
        const doc = res.docs[0];
        if (!doc) return Response.json({ error: 'not_found' }, { status: 404 });
        const pub = await projectPublic(req, doc as unknown as Doc, locale);
        if (!pub) return Response.json({ error: 'not_found' }, { status: 404 }); // gate/404 contract (§6.3)
        return ok(pub, locale);
      }

      const data: Doc[] = [];
      for (const doc of res.docs) {
        const pub = await projectPublic(req, doc as unknown as Doc, locale);
        if (pub) data.push(pub);
      }
      return ok(data, locale);
    },
  },

  {
    path: '/internal/content/initiatives',
    method: 'get' as const,
    handler: async (req: PayloadRequest): Promise<Response> => {
      const denied = guardInternalKey(req, 'content');
      if (denied) return denied;
      const locale = req.query.locale;
      if (!isLocale(locale)) return Response.json({ error: 'invalid locale' }, { status: 400 });
      const res = await req.payload.find({
        collection: 'technical-initiatives',
        where: publishedWhere,
        locale,
        fallbackLocale: false,
        overrideAccess: true,
        pagination: false,
      });
      // Card-safe fields ONLY (D2): title + status label + shortDescription.
      const data: PublicInitiativeCard[] = res.docs
        .filter((d) => ((d.publishedLocales as Locale[] | undefined) ?? []).includes(locale) && d.status !== 'archived')
        .map((d) => ({
          title: { ar: String(d.title), en: String(d.title) },
          statusLabel: { ar: 'قيد التطوير', en: 'In Development' } as const,
          status: d.status as PublicInitiativeCard['status'],
          shortDescription: { ar: String(d.shortDescription), en: String(d.shortDescription) },
          links: [] as never, // links/visuals/roadmap NEVER included (D2)
        }));
      return ok(data, locale);
    },
  },

  {
    path: '/internal/content/team',
    method: 'get' as const,
    handler: async (req: PayloadRequest): Promise<Response> => {
      const denied = guardInternalKey(req, 'content');
      if (denied) return denied;
      const locale = req.query.locale;
      if (!isLocale(locale)) return Response.json({ error: 'invalid locale' }, { status: 400 });
      const res = await req.payload.find({
        collection: 'team-members',
        where: { and: [publishedWhere, { visible: { equals: true } }] },
        locale,
        fallbackLocale: false,
        sort: 'sortOrder',
        overrideAccess: true,
        pagination: false,
      });
      const data = res.docs
        .filter((d) => ((d.publishedLocales as Locale[] | undefined) ?? []).includes(locale))
        .map((d) => ({ name: d.name, jobTitle: d.jobTitle, bio: d.bio ?? null, photo: d.photo ?? null, linkedinUrl: d.linkedinUrl ?? null }));
      return ok(data, locale);
    },
  },

  {
    path: '/internal/content/pages',
    method: 'get' as const,
    handler: async (req: PayloadRequest): Promise<Response> => {
      const denied = guardInternalKey(req, 'content');
      if (denied) return denied;
      const locale = req.query.locale;
      const slug = typeof req.query.slug === 'string' ? req.query.slug : undefined;
      if (!isLocale(locale) || !slug) return Response.json({ error: 'invalid locale or slug' }, { status: 400 });
      const res = await req.payload.find({
        collection: 'pages',
        where: { and: [publishedWhere, { slug: { equals: slug } }] },
        locale,
        fallbackLocale: false,
        limit: 1,
        overrideAccess: true,
      });
      const page = res.docs[0];
      if (!page || !((page.publishedLocales as Locale[] | undefined) ?? []).includes(locale)) {
        return Response.json({ error: 'not_found' }, { status: 404 });
      }
      return ok({ slug: page.slug, title: page.title, blocks: page.blocks, seo: page.seo ?? null }, locale);
    },
  },

  {
    path: '/internal/content/redirects',
    method: 'get' as const,
    handler: async (req: PayloadRequest): Promise<Response> => {
      const denied = guardInternalKey(req, 'content');
      if (denied) return denied;
      const res = await req.payload.find({
        collection: 'redirects',
        where: { active: { equals: true } },
        overrideAccess: true,
        pagination: false,
      });
      return ok(res.docs.map((d) => ({ from: d.from, to: d.to, statusCode: d.statusCode })));
    },
  },

  {
    path: '/internal/content/seo',
    method: 'get' as const,
    handler: async (req: PayloadRequest): Promise<Response> => {
      const denied = guardInternalKey(req, 'content');
      if (denied) return denied;
      const locale = req.query.locale;
      if (!isLocale(locale)) return Response.json({ error: 'invalid locale' }, { status: 400 });
      const s = (await req.payload.findGlobal({ slug: 'seo-settings', overrideAccess: true, locale, fallbackLocale: false })) as unknown as Doc;
      return ok(
        {
          titleTemplate: localizedOf(s.titleTemplate, locale),
          defaultDescription: localizedOf(s.defaultDescription, locale),
          defaultOgImage: s.defaultOgImage ?? null,
          canonicalDomain: s.canonicalDomain,
          sitemapIncludes: s.sitemapIncludes ?? [],
        },
        locale,
      );
    },
  },

  {
    path: '/internal/content/homepage',
    method: 'get' as const,
    handler: async (req: PayloadRequest): Promise<Response> => {
      const denied = guardInternalKey(req, 'content');
      if (denied) return denied;
      const locale = req.query.locale;
      if (!isLocale(locale)) return Response.json({ error: 'invalid locale' }, { status: 400 });
      // Published snapshot ONLY (the global has drafts enabled); a never-published
      // or draft-only homepage resolves to an empty global → sections disabled,
      // web renders its own approved fallback copy (D3).
      const h = (await req.payload.findGlobal({ slug: 'homepage', overrideAccess: true, locale, fallbackLocale: false, draft: false })) as unknown as Doc | null;
      const hero = (h?.hero ?? {}) as Doc;
      const s = (h?.sections ?? {}) as Doc;
      const fp = (s.featuredProject ?? {}) as Doc;
      const ti = (s.technicalInitiatives ?? {}) as Doc;
      const fc = (h?.finalCta ?? {}) as Doc;
      const published = h != null && (h._status as string | undefined) !== 'draft';
      if (!published) {
        return ok({
          published: false,
          hero: { enabled: false, kicker: null, headline: null, subheadline: null, primaryCtaLabel: null, secondaryCtaLabel: null, secondaryCtaTarget: null, backgroundPattern: null },
          sections: {
            valueStatementEnabled: false,
            valueStatement: null,
            differentiators: [],
            servicesOverviewEnabled: false,
            servicesHeading: null,
            whyEnabled: false,
            whyItems: [],
            methodologyEnabled: false,
            methodologySteps: [],
            featuredProject: { enabled: false, heading: null, project: null, fallbackMode: 'hide_section', neutralAlternative: null },
            technicalInitiatives: { enabled: false, heading: null },
            secureByDesignEnabled: false,
            secureByDesign: null,
          },
          finalCta: { enabled: false, heading: null, body: null, ctaLabel: null, ctaTarget: null },
        }, locale);
      }

      // Featured project: included ONLY when it passes the readiness gate (Phase 2 v1.3).
      let featured: Doc | null = null;
      const projectId = idOf(fp.project);
      if (projectId != null && fp.enabled !== false) {
        const res = await req.payload.find({
          collection: 'case-studies',
          where: { and: [publishedWhere, { id: { equals: projectId } }] },
          locale,
          fallbackLocale: false,
          limit: 1,
          overrideAccess: true,
        });
        const doc = res.docs[0];
        if (doc) featured = await projectPublic(req, doc as unknown as Doc, locale); // null => fallback mode
      }

      // Initiative cards (card-safe fields only; section disabled at launch, D2).
      let initiatives: PublicInitiativeCard[] = [];
      if (ti.enabled === true) {
        const res = await req.payload.find({
          collection: 'technical-initiatives',
          where: publishedWhere,
          locale,
          fallbackLocale: false,
          overrideAccess: true,
          pagination: false,
        });
        initiatives = res.docs
          .filter((d) => ((d.publishedLocales as Locale[] | undefined) ?? []).includes(locale) && d.status !== 'archived')
          .map((d) => ({
            title: { ar: String(d.title), en: String(d.title) },
            statusLabel: { ar: 'قيد التطوير', en: 'In Development' } as const,
            status: d.status as PublicInitiativeCard['status'],
            shortDescription: { ar: String(d.shortDescription), en: String(d.shortDescription) },
            links: [] as never,
          }));
      }

      return ok(
        {
          published: true,
          hero: {
            enabled: hero.enabled !== false,
            kicker: hero.kicker ?? null,
            headline: hero.headline ?? null,
            subheadline: hero.subheadline ?? null,
            primaryCtaLabel: hero.primaryCtaLabel ?? null,
            secondaryCtaLabel: hero.secondaryCtaLabel ?? null,
            secondaryCtaTarget: hero.secondaryCtaTarget ?? null,
            backgroundPattern: hero.backgroundPattern ?? 'blueprint_grid',
          },
          sections: {
            valueStatementEnabled: s.valueStatementEnabled !== false,
            valueStatement: s.valueStatement ?? null,
            differentiators: (s.differentiators as Doc[] | undefined) ?? [],
            servicesOverviewEnabled: s.servicesOverviewEnabled !== false,
            servicesHeading: s.servicesHeading ?? null,
            whyEnabled: s.whyEnabled !== false,
            whyItems: (s.whyItems as Doc[] | undefined) ?? [],
            methodologyEnabled: s.methodologyEnabled !== false,
            methodologySteps: (s.methodologySteps as Doc[] | undefined) ?? [],
            featuredProject: {
              enabled: fp.enabled !== false,
              heading: fp.heading ?? null,
              project: featured,
              fallbackMode: fp.fallbackMode ?? 'hide_section',
              neutralAlternative: fp.neutralAlternative ?? null,
            },
            technicalInitiatives: { enabled: ti.enabled === true, heading: ti.heading ?? null, initiatives },
            secureByDesignEnabled: s.secureByDesignEnabled !== false,
            secureByDesign: s.secureByDesign ?? null,
          },
          finalCta: {
            enabled: fc.enabled !== false,
            heading: fc.heading ?? null,
            body: fc.body ?? null,
            ctaLabel: fc.ctaLabel ?? null,
            ctaTarget: fc.ctaTarget ?? null,
          },
        },
        locale,
      );
    },
  },
];
