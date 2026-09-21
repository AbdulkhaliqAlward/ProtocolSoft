/**
 * LOCAL-REVIEW PUBLISH (Phase 5 D-2 — approved for LOCAL DEVELOPMENT ONLY).
 *
 * Publishes, in the local development database ONLY:
 *   - the three seeded service drafts, after filling neutral review copy
 *     (required fields cannot publish as [PLACEHOLDER]/empty — §6.9);
 *   - the minimum homepage content (the drafted homepage global);
 *   - the minimum about page content.
 *
 * It NEVER publishes: legal templates (privacy/terms), the case study, EDR
 * initiative content, team members, social links, or any real contact data.
 * Published local seed content is NOT a production-ready data state: it must
 * never be committed, exported to staging, or copied to production.
 *
 * Hard guards: refuses to run outside local development. Idempotent.
 * Run:  npx tsx --env-file-if-exists=.env src/scripts/publish-local-review.ts
 */
import { getPayload } from 'payload';

import configPromise from '../payload.config.js';

const guard = (): void => {
  if (process.env.NODE_ENV === 'production' || process.env.DEPLOYMENT_ENV === 'production') {
    console.error('REFUSED: publish-local-review runs in LOCAL DEVELOPMENT only.');
    process.exit(1);
  }
};

const lexical = (paragraphs: string[], direction: 'rtl' | 'ltr') => ({
  root: {
    type: 'root' as const,
    direction,
    children: paragraphs.map((text) => ({
      type: 'paragraph' as const,
      children: [{ type: 'text' as const, detail: 0, format: 0, mode: 'normal' as const, style: '', text, version: 1 }],
    })),
  },
});

interface ServiceCopy {
  slug: string;
  icon: string;
  ar: {
    heroHeadline: string;
    heroSubhead: string;
    summary: string;
    overview: string[];
    deliverables: Array<{ title: string; description: string }>;
    capabilities: string[];
    processSteps: Array<{ title: string; description: string }>;
    faqs: Array<{ question: string; answer: string }>;
    seoDescription: string;
  };
  en: {
    heroHeadline: string;
    heroSubhead: string;
    summary: string;
    overview: string[];
    deliverables: Array<{ title: string; description: string }>;
    capabilities: string[];
    processSteps: Array<{ title: string; description: string }>;
    faqs: Array<{ question: string; answer: string }>;
    seoDescription: string;
  };
}

/* Neutral review copy (design-review content, not Phase 9 final copy). */
const SERVICES: ServiceCopy[] = [
  {
    slug: 'custom-software',
    icon: 'code',
    ar: {
      heroHeadline: 'أنظمة مخصصة تُبنى حول عملياتك، لا العكس.',
      heroSubhead: 'من الدراسة والتحليل إلى التشغيل والدعم — نبني نظاماً يناسب طريقة عمل فريقك اليوم ويتيح نموه غداً.',
      summary: 'نصمم ونطور أنظمة برمجية مخصصة تخدم عمليات عملك بدقة، مع جودة قابلة للصيانة والتطوير على المدى الطويل.',
      overview: [
        'كل عملية عمل لها تفاصيل لا تستوعبها الأنظمة الجاهزة. نبدأ بفهم سير العمل الفعلي داخل مؤسستك، ثم نصمم نظاماً يخدم هذه العملية بدقة — بدل إجبار فريقك على التكيف مع قالب جاهز.',
        'نبني الأنظمة بمعايير هندسية تضمن قابليتها للصيانة والتطوير: بنية واضحة، اختبارات آلية، وتوثيق يبقى مع النظام. كما نضع الأمان والتكامل مع أنظمتك القائمة ضمن التصميم من اليوم الأول.',
        'لا ينتهي عملنا عند الإطلاق: نرافقك في التشغيل والتوسع لاحقاً، ونوضح منذ البداية نطاق العمل وما يحتاج تطويراً في مراحل تالية.',
      ],
      deliverables: [
        { title: 'دراسة وتحليل العمليات', description: 'توثيق سير العمل والمتطلبات قبل كتابة أي سطر برمجي.' },
        { title: 'تصميم النظام والواجهات', description: 'بنية تقنية وواجهات عربية/إنجليزية مبنية على نظام تصميم موحد.' },
        { title: 'تطوير واختبارات آلية', description: 'تنفيذ مراحل مع اختبارات تمنع تراجع الجودة مع كل تعديل.' },
        { title: 'إطلاق ودعم وتوثيق', description: 'تشغيل آمن، تدريب الفريق، وتوثيق تشغيلي يبقى لديك.' },
      ],
      capabilities: ['تحليل ودراسة العمليات', 'تكامل مع الأنظمة القائمة', 'واجهات عربية RTL / إنجليزية LTR', 'اختبارات آلية', 'تسليم تدريجي', 'دعم وتشغيل'],
      processSteps: [
        { title: 'الاستكشاف', description: 'نبدأ بفهم طريقة العمل والتحديات الفعلية.' },
        { title: 'التصميم', description: 'نصمم حلاً مناسباً بدلاً من فرض قالب جاهز.' },
        { title: 'البناء', description: 'تنفيذ بجودة قابلة للصيانة والتطوير.' },
        { title: 'الأمن والاختبار', description: 'نأخذ الأمان في الاعتبار منذ بداية البناء.' },
        { title: 'الإطلاق والدعم', description: 'نوضح نطاق العمل وما يحتاج تطويراً لاحقاً.' },
      ],
      faqs: [
        { question: 'هل تتعاملون مع أنظمة جاهزة أم تطوير مخصص فقط؟', answer: 'ندرس حالتك أولاً؛ إن كان النظام الجاهز أنسب وأقل تكلفة على المدى الطويل أوصينا به بصراحة. التطوير المخصص هو خيارنا عندما تحتاج عملياتك شيئاً لا توفره الأنظمة الجاهزة.' },
        { question: 'كيف تُحدد مدة التنفيذ والتكلفة؟', answer: 'بعد جلسة الاستكشاف نقدم نطاقاً واضحاً بمراحل تسليم محددة، لكل مرحلة مخرجات مكتوبة قبل البدء.' },
      ],
      seoDescription: 'تطوير أنظمة برمجية مخصصة تخدم عمليات عملك بدقة: دراسة وتحليل، تصميم وتطوير، اختبارات وإطلاق ودعم.',
    },
    en: {
      heroHeadline: 'Custom systems built around your operations — not the other way around.',
      heroSubhead: 'From discovery to launch and support, we build software that fits how your team works today and can grow with it tomorrow.',
      summary: 'We design and build custom software that fits how your business actually works, with maintainable quality for the long term.',
      overview: [
        'Every operation has details that off-the-shelf systems cannot absorb. We start by understanding how work actually flows through your organization, then design a system that serves that process precisely — instead of forcing your team into a prebuilt template.',
        'We build to engineering standards that keep systems maintainable: a clear architecture, automated tests, and documentation that stays with the system. Security and integration with your existing tools are part of the design from day one.',
        'Our work does not end at launch: we stay with you through operation and later growth, with the scope and follow-up phases defined honestly from the start.',
      ],
      deliverables: [
        { title: 'Process study & analysis', description: 'Documented workflows and requirements before any code is written.' },
        { title: 'System & interface design', description: 'Technical architecture and AR/EN interfaces on a unified design system.' },
        { title: 'Implementation with automated tests', description: 'Phased delivery with tests that prevent quality regressions.' },
        { title: 'Launch, support & documentation', description: 'Safe rollout, team training, and operational docs you keep.' },
      ],
      capabilities: ['Process analysis', 'Integration with existing systems', 'Arabic RTL / English LTR interfaces', 'Automated testing', 'Phased delivery', 'Support & operations'],
      processSteps: [
        { title: 'Discovery', description: 'We start by understanding how the business works.' },
        { title: 'Design', description: 'A fitting solution instead of a prebuilt template.' },
        { title: 'Build', description: 'Maintainable, improvable implementation.' },
        { title: 'Secure & Test', description: 'Security considered from the beginning of the build.' },
        { title: 'Launch & Support', description: 'Clear scope and honest follow-up phases.' },
      ],
      faqs: [
        { question: 'Do you work with off-the-shelf systems or custom development only?', answer: 'We study your case first. If an off-the-shelf system is the better and cheaper long-term fit, we will say so honestly. Custom development is our choice when your operations need what ready-made systems cannot provide.' },
        { question: 'How are timeline and cost defined?', answer: 'After a discovery session we provide a clearly scoped, phased plan with written deliverables for every phase before it starts.' },
      ],
      seoDescription: 'Custom software development built around your operations: process analysis, design, implementation with tests, launch and support.',
    },
  },
  {
    slug: 'digital-products',
    icon: 'layers',
    ar: {
      heroHeadline: 'منتجات ومنصات رقمية تُطلق بثقة وتنمو بوضوح.',
      heroSubhead: 'نحوّل الفكرة إلى منتج قابل للاستخدام: تصميم، بناء، إطلاق، ثم قياس وتحسين مستمر.',
      summary: 'نرافقك من الفكرة إلى منصة رقمية عاملة: تصميم المنتج، بناء المنصة، الإطلاق، ثم التطوير المستمر بناءً على الاستخدام الفعلي.',
      overview: [
        'المنتج الرقمي الناجح ليس مجرد تطبيق يعمل، بل منتج يفهم مستخدميه ويتطور معهم. نعمل معك على تحديد الجمهور الحقيقي والمشكلة الأساسية قبل أي تنفيذ، ثم نبني نسخة أولى صغيرة قابلة للقياس.',
        'نبني المنصات على أساس تقني يتحمل النمو: بنية قابلة للتوسع، لوحات تشغيل داخلية واضحة، وتجربة استخدام عربية/إنجليزية مبنية على نظام تصميم موحد.',
        'بعد الإطلاق نقرأ الاستخدام الفعلي معك: ما الذي يعمل؟ ما الذي يحتاج تحسيناً؟ ثم نرتب التطوير القادم على أساس بيانات لا تخمين.',
      ],
      deliverables: [
        { title: 'تحديد المنتج والنطاق', description: 'جمهور واضح، مشكلة أساسية، ونسخة أولى قابلة للقياس.' },
        { title: 'تصميم تجربة الاستخدام', description: 'رحلات مستخدم وواجهات عربية/إنجليزية جاهزة للتنفيذ.' },
        { title: 'بناء المنصة', description: 'تطوير كامل مع لوحات تشغيل داخلية وتكاملات الدفع والإشعارات عند الحاجة.' },
        { title: 'إطلاق وتحسين مستمر', description: 'قياس الاستخدام الفعلي وخطة تحسين مرتبة بالأولوية.' },
      ],
      capabilities: ['تعريف المنتج وMVP', 'تصميم UX/UI ثنائي اللغة', 'بناء منصات قابلة للتوسع', 'تكاملات دفع وإشعارات', 'قياس وتحليلات استخدام', 'تطوير مستمر'],
      processSteps: [
        { title: 'الاستكشاف', description: 'نحدد الجمهور والمشكلة ونسخة الإطلاق الأولى.' },
        { title: 'التصميم', description: 'تصميم تجربة وواجهات قابلة للتنفيذ مباشرة.' },
        { title: 'البناء', description: 'بناء المنتج بمراحل قصيرة قابلة للمراجعة.' },
        { title: 'الأمن والاختبار', description: 'حماية بيانات المستخدمين واختبارات قبل الإطلاق.' },
        { title: 'الإطلاق والدعم', description: 'إطلاق مقيس، ثم تحسين مبني على بيانات الاستخدام.' },
      ],
      faqs: [
        { question: 'هل تعملون مع شركات ناشئة في مرحلة الفكرة؟', answer: 'نعم. نبدأ بجلسات تحديد المنتج لتقييم الجدوى ونطاق نسخة أولى واقعية قبل أي التزام تطويري.' },
        { question: 'ماذا يحدث بعد الإطلاق؟', answer: 'نقيس الاستخدام الفعلي معك ونرتب خطة التحسين بالأولوية — التطوير بعد الإطلاق جزء أصيل من نموذج عملنا.' },
      ],
      seoDescription: 'بناء المنتجات والمنصات الرقمية من الفكرة إلى الإطلاق: تعريف المنتج، تصميم التجربة، البناء، ثم التحسين المستمر.',
    },
    en: {
      heroHeadline: 'Digital products and platforms launched with confidence, grown with clarity.',
      heroSubhead: 'We turn the idea into a usable product: design, build, launch, then measure and improve continuously.',
      summary: 'From idea to a working platform: product design, platform build, launch, and continuous improvement driven by real usage.',
      overview: [
        'A successful digital product is not just software that runs — it understands its users and evolves with them. We work with you to define the real audience and the core problem before any implementation, then build a small, measurable first release.',
        'Platforms are built on foundations that tolerate growth: scalable architecture, clear internal operations dashboards, and an Arabic/English experience built on a unified design system.',
        'After launch we read real usage with you: what works, what needs improvement, and we rank the next development round based on data rather than guesswork.',
      ],
      deliverables: [
        { title: 'Product & scope definition', description: 'A clear audience, core problem, and a measurable first release.' },
        { title: 'Experience design', description: 'User journeys and AR/EN interfaces ready for implementation.' },
        { title: 'Platform build', description: 'Full implementation with internal ops dashboards and payment/notification integrations when needed.' },
        { title: 'Launch & continuous improvement', description: 'Real usage measurement and a prioritized improvement plan.' },
      ],
      capabilities: ['Product definition & MVP', 'Bilingual UX/UI design', 'Scalable platform engineering', 'Payment & notification integrations', 'Usage analytics', 'Continuous development'],
      processSteps: [
        { title: 'Discovery', description: 'We define the audience, the problem, and the first release.' },
        { title: 'Design', description: 'Experience and interface design ready for direct implementation.' },
        { title: 'Build', description: 'Short, reviewable delivery phases.' },
        { title: 'Secure & Test', description: 'User-data protection and pre-launch testing.' },
        { title: 'Launch & Support', description: 'A measured launch, then data-driven improvement.' },
      ],
      faqs: [
        { question: 'Do you work with early-stage founders?', answer: 'Yes. We start with product-definition sessions to assess feasibility and a realistic first-release scope before any development commitment.' },
        { question: 'What happens after launch?', answer: 'We measure real usage with you and prioritize the improvement plan — post-launch development is a core part of how we work.' },
      ],
      seoDescription: 'Digital product & platform development from idea to launch: product definition, experience design, build, and continuous improvement.',
    },
  },
  {
    slug: 'cybersecurity',
    icon: 'shield',
    ar: {
      heroHeadline: 'أمن يُبنى مع النظام، لا يُضاف إليه لاحقاً.',
      heroSubhead: 'تقييم، تحصين، واستجابة — خدمات أمن سيبراني دفاعية تحمي أنظمتك وبيانات عملك.',
      summary: 'خدمات أمن سيبراني دفاعية: تقييم الوضع الأمني، تحصين الأنظمة والبنية، وبناء الجاهزية للاستجابة للحوادث.',
      overview: [
        'الحماية تصبح أصعب وأكثر تكلفة عندما تؤجل إلى ما بعد الإطلاق. لذلك نضع الأمن ضمن التصميم منذ البداية: مراجعة البنية، إدارة الهويات والصلاحيات، وتأمين خطوط التكامل.',
        'نقدم خدمات تقييم دفاعية توضح وضعك الأمني الحالي بلغة واضحة: أين الثغرات؟ ما أولوية معالجتها؟ وما الإجراء العملي لكل نقطة؟ بلا مبالغات تقنية ولا عروض مبهمة.',
        'الهدف ليس تقريراً يُحفظ في درج، بل حالة أمنية أفضل يمكن قياسها: ضوابط مطبقة، سجلات مراقبة، وخطة استجابة يعرف فريقك كيف يتعامل معها فعلياً.',
      ],
      deliverables: [
        { title: 'تقييم الوضع الأمني', description: 'مسح منظم للثغرات والمخاطر مع أولويات معالجة واضحة.' },
        { title: 'تحصين الأنظمة والبنية', description: 'ضوابط تشغيلية: صلاحيات، تهيئة آمنة، وتأمين التكاملات.' },
        { title: 'المراقبة والسجلات', description: 'إعداد سجلات وتنبيهات تسمح برصد الأنشطة غير الطبيعية.' },
        { title: 'الجاهزية للاستجابة', description: 'خطة استجابة للحوادث وتدريب عملي لفريقك.' },
      ],
      capabilities: ['تقييم أمني دفاعي', 'إدارة الهويات والصلاحيات', 'تحصين البنية والتهيئة الآمنة', 'مراقبة السجلات والتنبيهات', 'الاستجابة للحوادث', 'توعية وتدريب الفرق'],
      processSteps: [
        { title: 'الاستكشاف', description: 'فهم بنيتك وأنظمتك وسياق مخاطر عملك.' },
        { title: 'التقييم', description: 'مسح منظم يعطي أولويات معالجة واضحة.' },
        { title: 'التحصين', description: 'تطبيق الضوابط الأمنية حسب الأولوية.' },
        { title: 'التحقق', description: 'اختبارات تثبت أن الضوابط تعمل فعلاً.' },
        { title: 'المتابعة', description: 'مراقبة ومراجعات دورية تحافظ على الحالة الأمنية.' },
      ],
      faqs: [
        { question: 'هل تقدمون اختبارات اختراق؟', answer: 'نركز على الخدمات الدفاعية: التقييم والتحصين والمراقبة والاستجابة. اختبارات الاختراق الخارجية تُنفَّذ عبر مختبرين معتمدين بالتنسيق الكامل معك — ونساعدك في تجهيز نطاقها ومتابعة معالجة نتائجها.' },
        { question: 'من أين نبدأ إن لم يكن لدينا أي وضع أمني موثق؟', answer: 'من تقييم أساسي: جرد الأنظمة والصلاحيات، مراجعة التهيئة، ثم معالجة الأولويات القصوى أولاً بخطة زمنية واقعية.' },
      ],
      seoDescription: 'خدمات أمن سيبراني دفاعية: تقييم الوضع الأمني، تحصين الأنظمة والبنية، المراقبة، والجاهزية للاستجابة للحوادث.',
    },
    en: {
      heroHeadline: 'Security built with the system — not bolted on later.',
      heroSubhead: 'Assessment, hardening, and response — defensive cybersecurity services that protect your systems and business data.',
      summary: 'Defensive cybersecurity services: security posture assessment, system and infrastructure hardening, and incident-response readiness.',
      overview: [
        'Protection becomes harder and more expensive when it is postponed until after launch. That is why security is part of the design from the beginning: architecture review, identity and access management, and secured integration points.',
        'Our defensive assessments explain your current security posture in plain language: where the gaps are, what priority each one deserves, and the practical action for each finding — no technical scaremongering, no vague offers.',
        'The goal is not a report that sits in a drawer, but a measurable security state: applied controls, monitored logs, and a response plan your team actually knows how to use.',
      ],
      deliverables: [
        { title: 'Security posture assessment', description: 'A systematic scan of gaps and risks with clear remediation priorities.' },
        { title: 'System & infrastructure hardening', description: 'Operational controls: access, secure configuration, and integration security.' },
        { title: 'Monitoring & logging', description: 'Logs and alerting that make abnormal activity visible.' },
        { title: 'Response readiness', description: 'An incident-response plan and practical training for your team.' },
      ],
      capabilities: ['Defensive security assessment', 'Identity & access management', 'Infrastructure hardening', 'Log monitoring & alerting', 'Incident response', 'Team awareness & training'],
      processSteps: [
        { title: 'Discovery', description: 'Understanding your infrastructure, systems, and risk context.' },
        { title: 'Assessment', description: 'A systematic scan that yields clear remediation priorities.' },
        { title: 'Hardening', description: 'Applying security controls in priority order.' },
        { title: 'Verification', description: 'Testing that proves the controls actually work.' },
        { title: 'Follow-up', description: 'Monitoring and periodic reviews that keep the posture healthy.' },
      ],
      faqs: [
        { question: 'Do you offer penetration testing?', answer: 'We focus on defensive services: assessment, hardening, monitoring, and response. External penetration testing is performed by certified testers with your full coordination — we help you scope it and follow up on remediating its findings.' },
        { question: 'Where do we start with no documented security posture?', answer: 'With a baseline assessment: inventory systems and access, review configurations, then remediate the highest priorities first with a realistic timeline.' },
      ],
      seoDescription: 'Defensive cybersecurity services: security posture assessment, system and infrastructure hardening, monitoring, and incident-response readiness.',
    },
  },
];

const ABOUT_AR = {
  title: 'من نحن',
  blocks: [
    {
      blockType: 'contentRichText' as const,
      content: lexical(
        [
          'بروتوكول سوفت شركة هندسة برمجيات وأمن سيبراني. نبني أنظمة رقمية موثوقة، ونحميها لتعمل بثقة — لفرق تعمل بوضوح وتنمو بثقة.',
          'نؤمن أن البرمجيات الجيدة تُبنى حول طريقة عمل الناس الفعلية، لا حول قوالب جاهزة. لذلك نبدأ كل مشروع بالاستماع والفهم: ما العملية الحقيقية؟ أين الألم؟ ما الذي يجب أن يبقى بسيطاً؟',
          'نرى أنفسنا شريكاً تقنياً طويل الأمد، لا مجرد مورّد: نبني، نحمي، ثم نبقى للتشغيل والتطوير بعد الإطلاق.',
        ],
        'rtl',
      ),
    },
    {
      blockType: 'featureGrid' as const,
      heading: 'مبادئ عملنا',
      items: [
        { title: 'عمق هندسي', description: 'أنظمة قابلة للتطوير مع الوقت: بنية واضحة، اختبارات آلية، وتوثيق يبقى.' },
        { title: 'الأمان من اليوم الأول', description: 'الحماية جزء من البناء منذ البداية، لا إضافة لاحقة.' },
        { title: 'وضوح النطاق', description: 'نطاق عمل مكتوب ومراحل تسليم واضحة — بلا مفاجآت.' },
        { title: 'شراكة طويلة الأمد', description: 'نرافق النمو والتشغيل بعد الإطلاق، ونبني علاقة تستمر.' },
      ],
    },
  ],
};

const ABOUT_EN = {
  title: 'About Us',
  blocks: [
    {
      blockType: 'contentRichText' as const,
      content: lexical(
        [
          'Protocol Soft is a software engineering and cybersecurity company. We build reliable digital systems and protect them to run with confidence — for teams that work with clarity and grow with confidence.',
          'We believe good software is built around how people actually work, not around prebuilt templates. So every project starts with listening and understanding: what is the real process? Where does it hurt? What must stay simple?',
          'We see ourselves as a long-term technology partner, not just a vendor: we build, we secure, and then we stay for operations and growth after launch.',
        ],
        'ltr',
      ),
    },
    {
      blockType: 'featureGrid' as const,
      heading: 'How we work',
      items: [
        { title: 'Engineering depth', description: 'Systems you can improve over time: clear architecture, automated tests, lasting documentation.' },
        { title: 'Secure by design', description: 'Protection is part of the build from the start — not an afterthought.' },
        { title: 'Honest scope', description: 'Written scope and clear delivery phases — no surprises.' },
        { title: 'Long-term partnership', description: 'We stay for growth and operations after launch.' },
      ],
    },
  ],
};

const publish = async (): Promise<void> => {
  guard();
  const payload = await getPayload({ config: configPromise });

  /* ── 1. Services: fill review copy per locale, then publish (same mutation as
         the per-locale publish endpoint: _status published + publishedLocales). ── */
  for (const copy of SERVICES) {
    const res = await payload.find({ collection: 'services', where: { slug: { equals: copy.slug } }, limit: 1, draft: true, overrideAccess: true });
    const svc = res.docs[0];
    if (!svc) {
      console.warn(`service "${copy.slug}" not found — run the seed first; skipping`);
      continue;
    }
    for (const locale of ['ar', 'en'] as const) {
      const c = copy[locale];
      await payload.update({
        collection: 'services',
        id: svc.id,
        draft: true,
        locale,
        overrideAccess: true,
        context: { skipAudit: true },
        data: {
          icon: copy.icon,
          heroHeadline: c.heroHeadline,
          heroSubhead: c.heroSubhead,
          summary: c.summary,
          overview: lexical(c.overview, locale === 'ar' ? 'rtl' : 'ltr'),
          deliverables: c.deliverables,
          capabilities: c.capabilities,
          processSteps: c.processSteps,
          faqs: c.faqs,
          seo: { description: c.seoDescription },
        } as never,
      });
    }
    await payload.update({
      collection: 'services',
      id: svc.id,
      draft: true,
      overrideAccess: true,
      context: { skipAudit: true },
      data: { _status: 'published', publishedLocales: ['ar', 'en'] } as never,
    });
    console.log(`published service: ${copy.slug} (ar+en) — LOCAL REVIEW ONLY`);
  }

  /* ── 2. Homepage global: publish the drafted homepage content ──
         Per-locale read + publish: this Payload version drops localized array
         rows (differentiators etc.) when a global is read/written with
         locale:'all' — the same quirk the seed works around. */
  for (const locale of ['ar', 'en'] as const) {
    const homeDraft = (await payload.findGlobal({ slug: 'homepage', draft: true, locale, overrideAccess: true })) as unknown as Record<string, unknown> | null;
    if (!homeDraft) {
      console.log('homepage global missing — run the seed first');
      continue;
    }
    const data = { ...homeDraft };
    for (const k of ['id', 'globalType', 'createdAt', 'updatedAt'] as const) delete data[k];
    // Globals with versions.drafts publish by saving the draft content with an
    // explicit published status (the local API's draft flag alone is not enough).
    await payload.updateGlobal({
      slug: 'homepage',
      data: { ...data, _status: 'published' } as never,
      draft: false,
      locale,
      overrideAccess: true,
      context: { skipAudit: true },
    } as never);
    const verify = (await payload.findGlobal({ slug: 'homepage', draft: false, locale, overrideAccess: true })) as unknown as Record<string, unknown> | null;
    if ((verify?._status as string | undefined) !== 'published') throw new Error(`homepage global failed to publish (${locale})`);
    const sections = (verify?.sections ?? {}) as Record<string, unknown>;
    console.log(`published homepage global (${locale}) — differentiators=${Array.isArray(sections.differentiators) ? sections.differentiators.length : 'n/a'}, methodologySteps=${Array.isArray(sections.methodologySteps) ? sections.methodologySteps.length : 'n/a'} — LOCAL REVIEW ONLY`);
  }

  /* ── 3. About page: fill minimal content per locale, then publish ── */
  const aboutRes = await payload.find({ collection: 'pages', where: { slug: { equals: 'about' } }, limit: 1, draft: true, overrideAccess: true });
  const about = aboutRes.docs[0];
  if (!about) {
    console.warn('about page not found — run the seed first');
  } else {
    for (const [locale, content] of [['ar', ABOUT_AR], ['en', ABOUT_EN]] as const) {
      await payload.update({
        collection: 'pages',
        id: about.id,
        draft: true,
        locale,
        overrideAccess: true,
        context: { skipAudit: true },
        data: { title: content.title, blocks: content.blocks } as never,
      });
    }
    await payload.update({
      collection: 'pages',
      id: about.id,
      draft: true,
      overrideAccess: true,
      context: { skipAudit: true },
      data: { _status: 'published', publishedLocales: ['ar', 'en'] } as never,
    });
    console.log('published about page (ar+en) — LOCAL REVIEW ONLY');
  }

  /* ── Explicit non-publishing confirmation (D-2 negative space) ── */
  console.log('NOT published (by decision D-2): legal templates (privacy/terms), case study, EDR initiative, team, social links, real contact data.');

  const check = async (): Promise<void> => {
    const svc = await payload.find({ collection: 'services', where: { _status: { equals: 'published' } }, limit: 10, overrideAccess: true });
    const pages = await payload.find({ collection: 'pages', where: { _status: { equals: 'published' } }, limit: 10, overrideAccess: true });
    const legal = pages.docs.filter((p) => ['privacy', 'terms'].includes(String(p.slug)));
    console.log(`state: published services=${svc.totalDocs}, published pages=${pages.totalDocs}, published legal (must be 0)=${legal.length}`);
    if (legal.length > 0) throw new Error('LEGAL PAGE PUBLISHED — this must never happen under D-2');
  };
  await check();
  console.log('\nLocal review publish complete. This data state is LOCAL ONLY — never commit, export to staging, or copy to production.');
  process.exit(0);
};

void publish();
