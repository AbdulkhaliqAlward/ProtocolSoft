/**
 * Structural seed (Phase 4 scope): defaults + legal draft templates + the EDR
 * initiative with approved wording. NO real client/employee/lead/contact data.
 * Everything stays DRAFT — nothing is published by the seed.
 */
import { getPayload } from 'payload';

import configPromise from '../payload.config';

import { PRIVACY } from './review-content/privacy';

const seed = async (): Promise<void> => {
  const payload = await getPayload({ config: configPromise });

  /* Site identity copy, written PER LOCALE (locale:'all' leaves localized
     fields unchanged once they hold values, in this Payload version). */
  const siteCopy = {
    ar: {
      companyName: 'بروتوكول سوفت',
      description: 'شركة هندسة برمجيات وأمن سيبراني تبني الأنظمة الرقمية وتحميها.',
      tagline: 'هندسة تُكتب بوضوح، وتُسلَّم بأمانة.',
      footerCopyright: '© {year} بروتوكول سوفت',
    },
    en: {
      companyName: 'Protocol Soft',
      description: 'A software engineering and cybersecurity company that builds digital systems and protects them.',
      tagline: 'Engineering written clearly, delivered honestly.',
      footerCopyright: '© {year} Protocol Soft',
    },
  } as const;
  for (const locale of ['ar', 'en'] as const) {
    await payload.updateGlobal({ slug: 'site-settings', data: siteCopy[locale], overrideAccess: true, locale, context: { skipAudit: true } } as never);
  }

  /* Globals defaults */
  // emailMain and the other contact fields stay empty until Protocol Soft supplies them (§6.9).

  await payload.updateGlobal({
    slug: 'theme-settings',
    // Phase 5 visual revision: controlled variants only (no raw hex in the CMS).
    data: {
      colorPreset: 'ink_stone_v1',
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
        whyEnabled: true,
        methodologyEnabled: true,
        featuredProject: {
          enabled: true,
          project: null, // NO default — renders fallback (hide/neutral) until a gate-passing project exists
          fallbackMode: 'hide_section',
          neutralAlternative: null,
        },
        technicalInitiatives: {
          enabled: false, // D2: disabled at launch
        },
        secureByDesignEnabled: true,
      },
      finalCta: {
        enabled: true,
        ctaTarget: '/contact',
      },
    },
    overrideAccess: true,
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
        subheadline: 'فريق هندسي واحد يصمم أنظمتك ومنتجاتك الرقمية، ويبنيها، ويحميها.',
        primaryCtaLabel: 'تحدّث مع فريقنا',
        secondaryCtaLabel: 'تعرّف على خدماتنا',
      },
      sections: {
        servicesHeading: 'ثلاثة مسارات نعمل بها',
        featuredHeading: 'مشروع مميز',
        initiativesHeading: 'مبادرات تقنية',
        valueStatement: 'أربعة التزامات نطبّقها في كل مشروع، مهما كان حجمه.',
        differentiators: [
          { title: 'عمق هندسي', description: 'بنية واضحة واختبارات آلية وتوثيق، فيبقى النظام سهل التطوير بعد سنوات.' },
          { title: 'وضوح النطاق', description: 'نطاق ومراحل مكتوبة قبل البدء، فلا مفاجآت في التكلفة أو الموعد.' },
          { title: 'صراحة في التوصية', description: 'إن كان حل جاهز يكفيك، أو كان طلبك خارج تخصصنا، نقول لك ذلك.' },
        ],
        whyItems: [{ title: 'شراكة بعد الإطلاق', description: 'الفريق الذي بنى النظام يبقى معك في تشغيله ومراحله التالية.' }],
        methodologySteps: [
          { title: 'الاستكشاف', promise: 'نفهم طريقة العمل والتحدي الفعلي، ونكتب ما فهمناه لتراجعه.' },
          { title: 'التصميم', promise: 'نصمم الحل حول عملك، ونعرض عليك البنية والنماذج قبل البناء.' },
          { title: 'البناء', promise: 'نبني على مراحل قصيرة، وفي نهاية كل مرحلة إصدار تجربه بنفسك.' },
          { title: 'الأمن والاختبار', promise: 'نراجع الأمان ونختبر النظام قبل أن يصل إلى المستخدمين.' },
          { title: 'الإطلاق والدعم', promise: 'نطلق النظام، وندرّب فريقك على تشغيله.' },
        ],
        secureByDesign: 'نأخذ الأمان في الاعتبار منذ بداية بناء النظام، لأن الحماية تصبح أصعب وأكثر تكلفة عندما تؤجل إلى ما بعد الإطلاق.',
      },
      finalCta: {
        ctaLabel: 'احجز جلسة استكشاف',
        heading: 'جاهزون للاستماع إلى تحديك التقني.',
        body: 'حدّثنا عن نظامك أو فكرتك، ونقترح عليك نقطة بداية واقعية.',
      },
    },
    en: {
      hero: {
        kicker: 'Software Engineering & Cybersecurity',
        headline: 'Trusted digital systems, built and protected to run with confidence.',
        subheadline: 'One engineering team that designs, builds and protects your systems and digital products.',
        primaryCtaLabel: 'Talk to our team',
        secondaryCtaLabel: 'Explore our services',
      },
      sections: {
        servicesHeading: 'Three ways we work with you',
        featuredHeading: 'Featured Project',
        initiativesHeading: 'Technical Initiatives',
        valueStatement: 'Four commitments we keep on every project, whatever its size.',
        differentiators: [
          { title: 'Engineering depth', description: 'A clear architecture, automated tests and documentation, so the system stays easy to develop years later.' },
          { title: 'Clear scope', description: 'Scope and phases written before we start, so there are no surprises in cost or timing.' },
          { title: 'Honest recommendations', description: 'If a ready-made tool is enough, or your request is outside our field, we tell you.' },
        ],
        whyItems: [{ title: 'Partnership after launch', description: 'The team that built the system stays with you to run it and take it further.' }],
        methodologySteps: [
          { title: 'Discovery', promise: 'We learn how the work really runs and write down what we understood for you to review.' },
          { title: 'Design', promise: 'We design around your business and show you the architecture and prototypes before building.' },
          { title: 'Build', promise: 'Short phases, and a release you can try at the close of each.' },
          { title: 'Secure & Test', promise: 'Security review and testing before the system reaches users.' },
          { title: 'Launch & Support', promise: 'We launch the system and train your team to run it.' },
        ],
        secureByDesign: 'We consider security from the beginning of the build, because protection is harder and more expensive to add after launch.',
      },
      finalCta: {
        ctaLabel: 'Book a discovery session',
        heading: 'Ready to talk about your technical challenge?',
        body: 'Tell us about your system or idea, and we will suggest a realistic place to start.',
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
          servicesHeading: homepageCopy[locale].sections.servicesHeading,
          featuredProject: { heading: homepageCopy[locale].sections.featuredHeading },
          technicalInitiatives: { heading: homepageCopy[locale].sections.initiativesHeading },
          valueStatement: homepageCopy[locale].sections.valueStatement,
          differentiators: homepageCopy[locale].sections.differentiators,
          whyItems: homepageCopy[locale].sections.whyItems,
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
          { label: { ar: 'تواصل معنا', en: 'Contact' }, target: '/contact', sortOrder: 4, visible: true },
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
          ar: 'وصلنا طلبك، وسنرد عليك على بريدك الإلكتروني.',
          en: 'We have received your request, and we will reply to your email.',
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
        // {ar,en} objects need locale 'all' (runtime-supported, untyped for create — hence the cast), otherwise the object is stored as the ar string.
        locale: 'all',
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
      } as never);
    }
  }

  /* EDR technical initiative — approved wording, In Development, placements per D2 */
  const existingInitiatives = await payload.find({ collection: 'technical-initiatives', limit: 1, overrideAccess: true });
  if (existingInitiatives.totalDocs === 0) {
    await payload.create({
      collection: 'technical-initiatives',
      draft: true,
      overrideAccess: true,
      // {ar,en} objects need locale 'all' (runtime-supported, untyped for create — hence the cast), otherwise the object is stored as the ar string.
      locale: 'all',
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
    } as never);
  }

  /* Delivery-platform case study — DRAFT, unpublished, placeholders intact (D4/CS1) */
  const existingCases = await payload.find({ collection: 'case-studies', limit: 1, overrideAccess: true });
  if (existingCases.totalDocs === 0) {
    await payload.create({
      collection: 'case-studies',
      draft: true,
      overrideAccess: true,
      // {ar,en} objects need locale 'all' (runtime-supported, untyped for create — hence the cast), otherwise the object is stored as the ar string.
      locale: 'all',
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
    } as never);
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
      // Privacy starts from the drafted policy text; terms from a short draft note.
      const draft = legalDraft(p.title.ar, p.title.en, p.introAr, p.introEn).blocks;
      const blocks = p.slug === 'privacy' ? PRIVACY.ar.blocks : draft;
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
          blocks: p.slug === 'privacy' ? PRIVACY.en.blocks : draft,
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
