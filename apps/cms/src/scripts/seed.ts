/**
 * Structural seed (Phase 4 scope): defaults + legal draft templates + the EDR
 * initiative with approved wording. NO real client/employee/lead/contact data.
 * Everything stays DRAFT — nothing is published by the seed.
 */
import { getPayload } from 'payload';

import configPromise from '../payload.config.js';

const seed = async (): Promise<void> => {
  const payload = await getPayload({ config: configPromise });

  /* Phase 5 visual rebuild: the generic slogan tagline was replaced by the
     approved bilingual positioning line (applies to existing local DBs too). */
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      description: {
        ar: 'شركة هندسة برمجيات وأمن سيبراني نبني أنظمة رقمية موثوقة ونحميها لتعمل بثقة.',
        en: 'A software engineering and cybersecurity company building reliable digital systems and protecting them to run with confidence.',
      },
      tagline: { ar: 'نبني أنظمة رقمية موثوقة، ونحميها لتعمل بثقة.', en: 'Trusted digital systems, built and protected to run with confidence.' },
    },
    overrideAccess: true,
    locale: 'all',
    context: { skipAudit: true },
  } as never);

  /* Globals defaults */
  const existingSite = await payload.findGlobal({ slug: 'site-settings' });
  if (!existingSite || !(existingSite as { emailMain?: string }).emailMain) {
    await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        companyName: { ar: 'بروتوكول سوفت', en: 'Protocol Soft' },
        legalCompanyName: { ar: '[PLACEHOLDER]', en: '[PLACEHOLDER]' }, // supplied by Protocol Soft later; never public
        description: {
          ar: 'شركة هندسة برمجيات وأمن سيبراني نبني أنظمة رقمية موثوقة ونحميها لتعمل بثقة.',
          en: 'A software engineering and cybersecurity company building reliable digital systems and protecting them to run with confidence.',
        },
        tagline: { ar: 'نبني أنظمة رقمية موثوقة، ونحميها لتعمل بثقة.', en: 'Trusted digital systems, built and protected to run with confidence.' },
        // emailMain intentionally left empty — official contact details come from Protocol Soft (§6.9)
        footerCopyright: { ar: '© {year} بروتوكول سوفت', en: '© {year} Protocol Soft' },
      },
      overrideAccess: true,
      locale: 'all',
      context: { skipAudit: true },
    } as never);
  }

  await payload.updateGlobal({
    slug: 'theme-settings',
    // Phase 5 visual revision: controlled variants only (no raw hex in the CMS).
    data: {
      colorPreset: 'purple_cream_v1',
      buttonStyle: 'filled',
      borderRadius: 'md',
      animationsEnabled: true,
      defaultMode: 'system',
    },
    overrideAccess: true,
    context: { skipAudit: true },
  } as never);

  await payload.updateGlobal(
    {
      slug: 'seo-settings',
      data: {
        titleTemplate: { ar: '%s | بروتوكول سوفت', en: '%s | Protocol Soft' },
        defaultDescription: {
          ar: 'تطوير الأنظمة المخصصة، بناء المنتجات والمنصات الرقمية، وخدمات الأمن السيبراني.',
          en: 'Custom software, digital products and platforms, and cybersecurity services.',
        },
        canonicalDomain: 'https://protosoftdev.com',
        sitemapIncludes: ['home', 'services', 'case-studies', 'pages'],
      },
      overrideAccess: true,
      locale: 'all',
      context: { skipAudit: true },
    } as never,
  );

  await payload.updateGlobal({
    slug: 'homepage',
    draft: true, // editorial copy stays DRAFT — publishing is an explicit admin action
    data: {
      hero: {
        enabled: true,
        backgroundPattern: 'none', // decorative background patterns retired (Phase 5 visual rebuild)
        secondaryCtaTarget: '/services',
      },
      sections: {
        valueStatementEnabled: true,
        servicesOverviewEnabled: true,
        servicesHeading: { ar: 'خدماتنا', en: 'Our Services' },
        whyEnabled: true,
        whyItems: [],
        methodologyEnabled: true,
        featuredProject: {
          enabled: true,
          heading: { ar: 'مشروع مميز', en: 'Featured Project' },
          project: null, // NO default — renders fallback (hide/neutral) until a gate-passing project exists
          fallbackMode: 'hide_section',
          neutralAlternative: null,
        },
        technicalInitiatives: {
          enabled: false, // D2: disabled at launch
          heading: { ar: 'مبادرات تقنية', en: 'Technical Initiatives' },
        },
        secureByDesignEnabled: true,
      },
      finalCta: {
        enabled: true,
        ctaLabel: { ar: 'ابدأ مشروعك', en: 'Start a Project' },
        ctaTarget: '/contact',
      },
    },
    overrideAccess: true,
    locale: 'all',
    context: { skipAudit: true },
  } as never);

  /* Localized copy is written PER LOCALE: this Payload version drops localized
     array rows written via locale:'all' (same class of bug as the pages blocks
     workaround below). Scalar/non-localized defaults are set by the update above. */
  const homepageCopy = {
    ar: {
      hero: {
        kicker: 'هندسة البرمجيات والأمن السيبراني',
        headline: 'نبني أنظمة رقمية موثوقة، ونحميها لتعمل بثقة.',
        subheadline: 'تطوير الأنظمة المخصصة، بناء المنتجات والمنصات الرقمية، وخدمات الأمن السيبراني — لفرق تعمل بوضوح وتنمو بثقة.',
        primaryCtaLabel: 'ابدأ مشروعك',
        secondaryCtaLabel: 'تعرّف على خدماتنا',
      },
      sections: {
        valueStatement: 'نحن شريك تقني طويل الأمد، لا مجرد مورّد — نبني ونعمل وندعم.',
        differentiators: [
          { title: 'عمق هندسي', description: 'أنظمة قابلة للتطوير مع الوقت.' },
          { title: 'الأمان من اليوم الأول', description: 'الحماية جزء من البناء، لا إضافة لاحقة.' },
          { title: 'شراكة طويلة الأمد', description: 'نرافق النمو والتشغيل بعد الإطلاق.' },
        ],
        methodologySteps: [
          { title: 'الاستكشاف', promise: 'نبدأ بفهم طريقة العمل والتحديات الفعلية.' },
          { title: 'التصميم', promise: 'نصمم حلاً مناسباً بدلاً من فرض قالب جاهز.' },
          { title: 'البناء', promise: 'تنفيذ بجودة قابلة للصيانة والتطوير.' },
          { title: 'الأمن والاختبار', promise: 'نأخذ الأمان في الاعتبار منذ بداية البناء.' },
          { title: 'الإطلاق والدعم', promise: 'نوضح نطاق العمل وما يحتاج تطويراً لاحقاً.' },
        ],
        secureByDesign: 'نأخذ الأمان في الاعتبار منذ بداية بناء النظام، لأن الحماية تصبح أصعب وأكثر تكلفة عندما تؤجل إلى ما بعد الإطلاق.',
      },
      finalCta: {
        heading: 'جاهزون للاستماع إلى تحديك التقني.',
        body: 'أخبرنا عن نظامك أو فكرتك، وسنوضح نطاق العمل وخطوات التنفيذ.',
      },
    },
    en: {
      hero: {
        kicker: 'Software Engineering & Cybersecurity',
        headline: 'Trusted digital systems, built and protected to run with confidence.',
        subheadline: 'Custom software, digital products and platforms, and cybersecurity services — for teams that run with clarity and grow with confidence.',
        primaryCtaLabel: 'Start a Project',
        secondaryCtaLabel: 'Explore our services',
      },
      sections: {
        valueStatement: 'A long-term technology partner, not just a vendor — we build, secure, and support.',
        differentiators: [
          { title: 'Engineering depth', description: 'Systems you can improve over time.' },
          { title: 'Secure by design', description: 'Protection is part of the build, not an afterthought.' },
          { title: 'Long-term partnership', description: 'We stay for growth and operations after launch.' },
        ],
        methodologySteps: [
          { title: 'Discovery', promise: 'We start by understanding how the business works.' },
          { title: 'Design', promise: 'A fitting solution instead of a prebuilt template.' },
          { title: 'Build', promise: 'Maintainable, improvable implementation.' },
          { title: 'Secure & Test', promise: 'Security considered from the beginning of the build.' },
          { title: 'Launch & Support', promise: 'Clear scope and honest follow-up phases.' },
        ],
        secureByDesign: 'We consider security from the beginning of the build, because protection is harder and more expensive to add after launch.',
      },
      finalCta: {
        heading: 'Ready to talk about your technical challenge?',
        body: 'Tell us about your system or idea and we will define the scope and the path.',
      },
    },
  } as const;
  for (const locale of ['ar', 'en'] as const) {
    await payload.updateGlobal({
      slug: 'homepage',
      draft: true,
      data: {
        hero: homepageCopy[locale].hero,
        sections: {
          valueStatement: homepageCopy[locale].sections.valueStatement,
          differentiators: homepageCopy[locale].sections.differentiators,
          methodologySteps: homepageCopy[locale].sections.methodologySteps,
          secureByDesign: homepageCopy[locale].sections.secureByDesign,
        },
        finalCta: homepageCopy[locale].finalCta,
      },
      overrideAccess: true,
      locale,
      context: { skipAudit: true },
    } as never);
  }

  await payload.updateGlobal(
    {
      slug: 'navigation',
      data: {
        headerItems: [
          { label: { ar: 'الرئيسية', en: 'Home' }, target: '/', sortOrder: 1, visible: true },
          { label: { ar: 'من نحن', en: 'About' }, target: '/about', sortOrder: 2, visible: true },
          { label: { ar: 'الخدمات', en: 'Services' }, target: '/services', sortOrder: 3, visible: true },
          { label: { ar: 'المشاريع', en: 'Case Studies' }, target: '/case-studies', sortOrder: 4, visible: true },
          { label: { ar: 'تواصل معنا', en: 'Contact' }, target: '/contact', sortOrder: 5, visible: true },
        ],
        headerCta: { label: { ar: 'ابدأ مشروعك', en: 'Start a Project' }, target: '/contact' },
        footerColumns: [],
      },
      overrideAccess: true,
      locale: 'all',
      context: { skipAudit: true },
    } as never,
  );

  await payload.updateGlobal(
    {
      slug: 'form-settings',
      data: {
        // notificationRecipients intentionally unset — official recipients come from Protocol Soft later
        confirmationMessage: {
          ar: 'تم استلام طلبك بنجاح. سنعود إليك خلال يوم عمل.',
          en: 'Your request has been received. We usually reply within one business day.',
        },
        rateLimits: { perIpPerHour: 5, perIpPerDay: 20, perServicePerMinute: 30 },
        autoResponderEnabled: false,
        retentionMonths: 12,
      },
      overrideAccess: true,
      locale: 'all',
      context: { skipAudit: true },
    } as never,
  );

  /* Backup settings: DISABLED by default (BD1) — nothing else to seed. */

  /* Three confirmed services (drafts, titles only — full copy is Phase 9 content entry) */
  const existingServices = await payload.find({ collection: 'services', limit: 1, overrideAccess: true });
  if (existingServices.totalDocs === 0) {
    const services = [
      { slug: 'custom-software', ar: 'تطوير الأنظمة المخصصة', en: 'Custom Software Development' },
      { slug: 'digital-products', ar: 'تطوير المنتجات والمنصات الرقمية', en: 'Digital Product & Platform Development' },
      { slug: 'cybersecurity', ar: 'خدمات وحلول الأمن السيبراني', en: 'Cybersecurity Services', initiativeSection: true },
    ];
    for (const [index, s] of services.entries()) {
      await payload.create({
        collection: 'services',
        draft: true,
        overrideAccess: true,
        context: { skipAudit: true },
        data: {
          slug: s.slug,
          title: { ar: s.ar, en: s.en },
          heroHeadline: { ar: '[PLACEHOLDER]', en: '[PLACEHOLDER]' }, // Phase 9 content entry
          summary: { ar: '', en: '' },
          overview: { ar: { root: { children: [] } }, en: { root: { children: [] } } },
          deliverables: [],
          processSteps: [],
          initiativeSection: { enabled: s.initiativeSection === true, heading: { ar: 'مبادرة تقنية مفتوحة المصدر', en: 'Open-source technical initiative' } },
          sortOrder: (index + 1) * 10,
          publishedLocales: [],
        } as never,
      });
    }
  }

  /* EDR technical initiative — approved wording, In Development, placements per D2 */
  const existingInitiatives = await payload.find({ collection: 'technical-initiatives', limit: 1, overrideAccess: true });
  if (existingInitiatives.totalDocs === 0) {
    await payload.create({
      collection: 'technical-initiatives',
      draft: true,
      overrideAccess: true,
      context: { skipAudit: true },
      data: {
        title: { ar: 'مبادرة EDR مفتوحة المصدر', en: 'Open-Source EDR Initiative' },
        category: 'open_source',
        status: 'in_development',
        shortDescription: {
          ar: 'نعمل على تطوير مبادرة EDR مفتوحة المصدر للرصد والاستجابة على الأجهزة الطرفية. المشروع لا يزال قيد التطوير، وسنشارك تفاصيله عند جاهزيته للاستخدام العام.',
          en: 'We are developing an open-source EDR initiative for endpoint visibility and response. The project is still under active development, and more details will be shared when it is ready for public use.',
        },
        placements: { cybersecurityCard: true, homepageSection: false },
        links: { github: null, githubApproved: false, docs: null, docsApproved: false, website: null, websiteApproved: false },
        roadmap: { root: { children: [] } },
        featured: false,
        publishedLocales: [],
      } as never,
    });
  }

  /* Delivery-platform case study — DRAFT, unpublished, placeholders intact (D4/CS1) */
  const existingCases = await payload.find({ collection: 'case-studies', limit: 1, overrideAccess: true });
  if (existingCases.totalDocs === 0) {
    await payload.create({
      collection: 'case-studies',
      draft: true,
      overrideAccess: true,
      context: { skipAudit: true },
      data: {
        slug: 'delivery-platform',
        projectType: 'client_project',
        title: { ar: 'منصة عمليات توصيل متكاملة', en: 'Integrated Delivery Operations Platform' },
        summary: { ar: '[PLACEHOLDER]', en: '[PLACEHOLDER]' },
        challenge: { ar: { root: { children: [] } }, en: { root: { children: [] } } },
        solution: { ar: { root: { children: [] } }, en: { root: { children: [] } } },
        outcomes: { ar: { root: { children: [] } }, en: { root: { children: [] } } },
        technologies: ['[PLACEHOLDER]'],
        screenshots: [], // pending assets + sensitivity screening (CS1)
        client: {
          name: '[PLACEHOLDER]',
          logo: null,
          nameVisible: false,
          logoVisible: false,
          approvalStatus: 'pending', // confirmed scope: screenshots only — future written approval required
          approvalDate: null,
          approvalRef: null,
        },
        featured: false,
        publishedLocales: [],
      } as never,
    });
  }

  /* Legal pages — DRAFT TEMPLATES (LD1): require Protocol Soft final review + legal review */
  const existingPages = await payload.find({ collection: 'pages', limit: 10, overrideAccess: true });
  if (existingPages.totalDocs === 0) {
    const legalDraft = (titleAr: string, titleEn: string, introAr: string, introEn: string) => ({
      blocks: [
        {
          blockType: 'contentRichText',
          content: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [{ type: 'text', text: `${introAr}\n\n${introEn}` }],
                },
              ],
              direction: 'ltr' as const,
            },
          },
        },
      ],
    });
    for (const p of [
      {
        slug: 'privacy',
        title: { ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
        introAr: 'مسودة أولية قابلة للتحرير — تتطلب مراجعة Protocol Soft النهائية ومراجعة قانونية قبل النشر.',
        introEn: 'Initial editable draft — requires Protocol Soft final review and legal review before publication.',
      },
      {
        slug: 'terms',
        title: { ar: 'شروط الاستخدام', en: 'Terms of Use' },
        introAr: 'مسودة أولية قابلة للتحرير — تتطلب مراجعة Protocol Soft النهائية ومراجعة قانونية قبل النشر.',
        introEn: 'Initial editable draft — requires Protocol Soft final review and legal review before publication.',
      },
    ]) {
      // localized blocks array: write per-locale (create ar, update en) — the
      // locale:'all' path does not attach block-row ids in this Payload version
      const blocks = legalDraft(p.title.ar, p.title.en, p.introAr, p.introEn).blocks;
      const created = await payload.create({
        collection: 'pages',
        draft: true,
        locale: 'ar',
        overrideAccess: true,
        context: { skipAudit: true },
        data: {
          slug: p.slug,
          title: p.title.ar,
          blocks,
          legalReviewRequired: true, // auto-enforced for privacy/terms
          contentOrigin: 'draft_template',
          publishedLocales: [],
        } as never,
      });
      await payload.update({
        collection: 'pages',
        id: created.id,
        draft: true,
        locale: 'en',
        overrideAccess: true,
        context: { skipAudit: true },
        data: {
          title: p.title.en,
          blocks,
        } as never,
      });
    }
    const aboutBlocks = [{ blockType: 'contentRichText' as const, content: { root: { children: [] } } }];
    const about = await payload.create({
      collection: 'pages',
      draft: true,
      locale: 'ar',
      overrideAccess: true,
      context: { skipAudit: true },
      data: {
        slug: 'about',
        title: 'من نحن',
        blocks: aboutBlocks,
        inNav: true,
        legalReviewRequired: false,
        contentOrigin: 'draft_template',
        publishedLocales: [],
      } as never,
    });
    await payload.update({
      collection: 'pages',
      id: about.id,
      draft: true,
      locale: 'en',
      overrideAccess: true,
      context: { skipAudit: true },
      data: {
        title: 'About Us',
        blocks: aboutBlocks,
      } as never,
    });
  }

  /* Social links: none seeded — real URLs from Protocol Soft later. */

  payload.logger.info('Seed complete: structural defaults + draft templates only. Nothing published. No real data.');
  process.exit(0);
};

void seed();
