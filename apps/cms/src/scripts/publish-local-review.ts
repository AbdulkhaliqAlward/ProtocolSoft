/**
 * LOCAL-REVIEW PUBLISH (local development only).
 *
 * Publishes, in the local development database only, the final copy for:
 *   - the three services (copy below + review-content/serviceSpecs.ts);
 *   - the homepage global (seeded copy + the homepage FAQs);
 *   - the about page;
 *   - the privacy policy (review-content/privacy.ts), marked as NOT reviewed
 *     by legal counsel. Production publishing goes through the legal gate.
 *
 * It never publishes: terms of use, the case study, the EDR initiative, team
 * members, social links, or any contact data.
 *
 * Hard guard: refuses to run in production. Idempotent.
 * Run:  npm run publish:local-review -w @protocol-soft/cms
 *
 * With --drafts-only (npm run content:load-drafts) it writes the same copy as
 * drafts and publishes nothing; that mode is allowed in production, where the
 * editors then review and publish each item from the admin.
 */
import { getPayload } from 'payload';

import configPromise from '../payload.config';

import { PRIVACY } from './review-content/privacy';
import { HOME_FAQS, SERVICE_SPECS } from './review-content/serviceSpecs';

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

/* Final service copy (AR + EN). The spec-sheet parts live in review-content/serviceSpecs.ts.
   Roles: heroHeadline = the promise; heroSubhead = who it is for and the
   outcome; summary = the one-line card used on the home page and service
   lists; overview = the problem and our approach; deliverables = what you keep;
   process descriptions = the activity of each step. */
const SERVICES: ServiceCopy[] = [
  {
    slug: 'custom-software',
    icon: 'code',
    ar: {
      heroHeadline: 'أنظمة مخصصة تُبنى حول عملياتك، لا العكس.',
      heroSubhead: 'حين لا تناسب الأنظمة الجاهزة طريقة عملك، نبني نظاماً يناسبها اليوم، ويتّسع لنموّها غداً.',
      summary: 'أنظمة داخلية وبوابات وربط بين الأنظمة القائمة، مصممة حول طريقة عمل فريقك.',
      overview: [
        'كل جهة لها طريقة عمل خاصة بها، وكثير من الأنظمة الجاهزة يفرض على الفريق أن يتكيّف معه: خطوات زائدة، وجداول جانبية، وبيانات تُدخل مرتين. نبدأ من الجهة المقابلة: نفهم كيف يجري العمل فعلاً، ثم نصمم النظام ليخدمه.',
        'ولأن النظام سيعيش سنوات، نهتم بما لا يظهر في العرض الأول: بنية يسهل البناء عليها، واختبارات تحمي كل تعديل لاحق، وربط محكم مع ما تستخدمه اليوم.',
      ],
      deliverables: [
        { title: 'النظام العامل', description: 'واجهات مبنية على نظام تصميم موحد، تعمل على الحاسب والجوال.' },
        { title: 'الشيفرة المصدرية واختباراتها', description: 'شيفرة موثقة، مع اختبارات آلية تحمي النظام عند كل تعديل.' },
        { title: 'الوثائق', description: 'وثائق البنية والتشغيل والصيانة، مكتوبة لمن سيعمل على النظام بعدنا.' },
        { title: 'تدريب فريقك', description: 'جلسات عملية لمن سيستخدم النظام ومن سيديره.' },
      ],
      capabilities: ['ورش عمل مع أصحاب العملية', 'ربط الأنظمة عبر واجهات برمجية', 'الأدوار والصلاحيات', 'التقارير ولوحات المتابعة', 'ترحيل البيانات', 'مراقبة الأداء'],
      processSteps: [
        { title: 'الاستكشاف', description: 'نتتبع العملية خطوة بخطوة مع فريقك، لنعرف أين تتعطل.' },
        { title: 'التصميم', description: 'نحوّل ما فهمناه إلى بنية تقنية ونماذج واجهات تجرّبها قبل كتابة الشيفرة.' },
        { title: 'البناء', description: 'ننفّذ على مراحل قصيرة، وننهي كل مرحلة بشيء يعمل.' },
        { title: 'الأمن والاختبار', description: 'نراجع الأمان، ونختبر الأداء والحالات الحرجة قبل وصول النظام إلى المستخدمين.' },
        { title: 'الإطلاق والدعم', description: 'ننقل النظام إلى التشغيل الفعلي بخطة واضحة، ونتابع بدايته معك.' },
      ],
      faqs: [
        { question: 'هل تتعاملون مع أنظمة جاهزة أم تطوير مخصص فقط؟', answer: 'ندرس حالتك أولاً؛ إن كان نظام جاهز يكفيك وأقل تكلفة على المدى الطويل أوصينا به بصراحة. نبني نظاماً مخصصاً حين تحتاج عملياتك ما لا توفره الأنظمة الجاهزة.' },
      ],
      seoDescription: 'تطوير أنظمة برمجية مخصصة حول طريقة عمل فريقك: أنظمة داخلية وبوابات وربط بين الأنظمة، بمراحل تسليم مكتوبة.',
    },
    en: {
      heroHeadline: 'Custom systems built around your operations — not the other way around.',
      heroSubhead: 'When off-the-shelf tools do not fit how you work, we build a system that fits it today and has room to grow tomorrow.',
      summary: 'Internal systems, portals and connections between existing tools, designed around how your team works.',
      overview: [
        'Every organisation works in its own way, and many ready-made systems make the team adapt to them: extra steps, side spreadsheets, data entered twice. We start from the other end: we learn how the work really runs, then design the system to serve it.',
        'Because the system will live for years, we care about what a first demo does not show: an architecture that is easy to build on, tests that protect every later change, and solid connections to the tools you already use.',
      ],
      deliverables: [
        { title: 'The working system', description: 'Interfaces on a unified design system, working on desktop and mobile.' },
        { title: 'Source code and its tests', description: 'Documented code, with automated tests that protect the system through every change.' },
        { title: 'Documentation', description: 'Architecture, operations and maintenance documents, written for whoever works on the system after us.' },
        { title: 'Training for your team', description: 'Hands-on sessions for the people who will use the system and those who will run it.' },
      ],
      capabilities: ['Workshops with process owners', 'System integration through APIs', 'Roles and permissions', 'Reports and dashboards', 'Data migration', 'Performance monitoring'],
      processSteps: [
        { title: 'Discovery', description: 'We trace the process step by step with your team to find where it breaks.' },
        { title: 'Design', description: 'We turn what we learned into an architecture and interface prototypes you can try before any code is written.' },
        { title: 'Build', description: 'Short phases, each finishing with something that works.' },
        { title: 'Secure & Test', description: 'Security review, plus performance and edge-case testing, before the system reaches users.' },
        { title: 'Launch & Support', description: 'A planned move into live operation, and we follow its first days with you.' },
      ],
      faqs: [
        { question: 'Do you work with off-the-shelf systems or custom development only?', answer: 'We study your case first; if a ready-made system is enough and cheaper over time, we will say so plainly. We build custom when your operations need what ready-made systems cannot provide.' },
      ],
      seoDescription: 'Custom software built around how your team works: internal systems, portals and system integration, with written delivery phases.',
    },
  },
  {
    slug: 'digital-products',
    icon: 'layers',
    ar: {
      heroHeadline: 'منتجات ومنصات رقمية تُطلق بثقة وتنمو بوضوح.',
      heroSubhead: 'من فكرة على الورق إلى منتج يستخدمه عملاؤك فعلاً، ويتحسّن مع كل دورة تطوير.',
      summary: 'تطبيقات ومنصات لعملائك، من تعريف المنتج إلى الإطلاق والتحسين بناءً على الاستخدام.',
      overview: [
        'المنتج الناجح لا يبدأ بقائمة مزايا طويلة، بل بمشكلة واضحة وجمهور محدد. نعمل معك على تحديدهما قبل التنفيذ، ثم نختار أصغر نسخة تكفي لاختبار الفكرة مع مستخدمين حقيقيين.',
        'بعد الإطلاق تصبح البيانات هي الدليل: ما الذي يستخدمه الناس؟ وأين يتوقفون؟ نقرأ ذلك معك، ونبني الخطوة التالية على ما يحدث فعلاً لا على ما نتوقعه.',
      ],
      deliverables: [
        { title: 'المنتج المنشور', description: 'متاح لمستخدميك على المنصة التي تناسبهم.' },
        { title: 'لوحة التشغيل الداخلية', description: 'لإدارة المستخدمين والمحتوى والطلبات دون الرجوع إلينا.' },
        { title: 'أدوات القياس', description: 'قياس الاستخدام منذ يوم الإطلاق، وتقارير تقرؤها بسهولة.' },
        { title: 'ملفات التصميم', description: 'الواجهات ونظام التصميم، جاهزة لأي تطوير لاحق.' },
      ],
      capabilities: ['مقابلات المستخدمين', 'تطبيقات الويب والجوال', 'الحسابات وتسجيل الدخول', 'تكاملات الدفع والإشعارات', 'تحليلات الاستخدام', 'تجربة التحسينات'],
      processSteps: [
        { title: 'الاستكشاف', description: 'نختبر الفكرة: لمن هي، وما المشكلة التي تحلها.' },
        { title: 'التصميم', description: 'نرسم رحلة المستخدم، ونختبر النماذج قبل البناء.' },
        { title: 'البناء', description: 'دورات تطوير قصيرة، تنتهي كل منها بشيء يمكن تجربته.' },
        { title: 'الأمن والاختبار', description: 'نحمي بيانات المستخدمين، ونختبر المنتج على الأجهزة والحالات الحرجة.' },
        { title: 'الإطلاق والدعم', description: 'نطلق المنتج، ونراقب أيامه الأولى عن قرب.' },
      ],
      faqs: [
        { question: 'هل تعملون مع شركات ناشئة في مرحلة الفكرة؟', answer: 'نعم. نبدأ بجلسات تعريف المنتج لتقدير جدوى الفكرة ونطاق نسخة أولى واقعية، قبل أي التزام بالتطوير.' },
      ],
      seoDescription: 'بناء المنتجات والمنصات الرقمية لعملائك: تعريف المنتج، وتصميم التجربة، والبناء، والإطلاق، والتحسين بناءً على الاستخدام.',
    },
    en: {
      heroHeadline: 'Digital products and platforms launched with confidence, grown with clarity.',
      heroSubhead: 'From an idea on paper to a product your customers actually use, and that improves with every development cycle.',
      summary: 'Apps and platforms for your customers, from product definition to launch and usage-led improvement.',
      overview: [
        'A successful product does not start with a long feature list, but with a clear problem and a defined audience. We pin both down with you before building, then choose the smallest release that can test the idea with real users.',
        'After launch, the data becomes the evidence: what do people use, and where do they stop? We read it with you and base the next step on what is happening, not on what we expected.',
      ],
      deliverables: [
        { title: 'The published product', description: 'Live for your users, on the platform that suits them.' },
        { title: 'An internal back office', description: 'To manage users, content and orders without coming back to us.' },
        { title: 'Measurement tools', description: 'Usage measurement from launch day, with reports that are easy to read.' },
        { title: 'Design files', description: 'The interfaces and design system, ready for any later development.' },
      ],
      capabilities: ['User interviews', 'Web and mobile apps', 'Accounts and sign-in', 'Payment and notification integrations', 'Usage analytics', 'Testing improvements'],
      processSteps: [
        { title: 'Discovery', description: 'We test the idea: who it is for, and the problem it solves.' },
        { title: 'Design', description: 'We map the user journey and test prototypes before building.' },
        { title: 'Build', description: 'Short development cycles, each ending in something you can try.' },
        { title: 'Secure & Test', description: 'We protect user data and test the product across devices and edge cases.' },
        { title: 'Launch & Support', description: 'We launch the product and watch its first days closely.' },
      ],
      faqs: [
        { question: 'Do you work with early-stage founders?', answer: 'Yes. We start with product-definition sessions to gauge the idea and a realistic first-release scope, before any development commitment.' },
      ],
      seoDescription: 'Digital products and platforms for your customers: product definition, experience design, build, launch and usage-led improvement.',
    },
  },
  {
    slug: 'cybersecurity',
    icon: 'shield',
    ar: {
      heroHeadline: 'أمن يُبنى مع النظام، لا يُضاف إليه لاحقاً.',
      heroSubhead: 'نقيّم وضعك الأمني، ونعالج الأولويات، ونجهّز فريقك للتعامل مع الحوادث بثقة.',
      summary: 'تقييم أمني دفاعي، وتحصين للأنظمة، وجاهزية للاستجابة للحوادث.',
      overview: [
        'معظم المخاطر في البيئات الحقيقية لا تأتي من هجمات معقدة، بل من صلاحيات زائدة، وإعدادات افتراضية لم تُراجَع، وسجلات لا يقرؤها أحد. نبدأ بما يصنع الفرق الأكبر في بيئتك تحديداً.',
        'نكتب النتائج بلغة يفهمها الفريق التقني والإدارة معاً: ما المشكلة، وما أثرها، وما الإجراء المقترح لكل نقطة. بلا تهويل، وبلا توصيات عامة يصعب تطبيقها.',
      ],
      deliverables: [
        { title: 'تقرير التقييم الأمني', description: 'صورة كاملة لوضعك الأمني، مع إجراء محدد لكل نقطة.' },
        { title: 'تطبيق المعالجات', description: 'الصلاحيات، والإعدادات الآمنة، وتأمين التكاملات، بالترتيب الأهم أولاً.' },
        { title: 'المراقبة والتنبيهات', description: 'سجلات وتنبيهات تكشف النشاط غير المعتاد مبكراً.' },
        { title: 'خطة الاستجابة للحوادث', description: 'أدوار واضحة وخطوات مكتوبة، وتمرين عملي لفريقك.' },
      ],
      capabilities: ['مراجعة البنية والتصميم', 'نمذجة التهديدات', 'إدارة الهويات والصلاحيات', 'تحصين الخوادم والسحابة', 'تحليل السجلات', 'التعامل مع الحوادث'],
      processSteps: [
        { title: 'الاستكشاف', description: 'نفهم أنظمتك وبياناتك، وما يهمّ عملك أن يبقى متاحاً.' },
        { title: 'التقييم', description: 'نراجع البنية والإعدادات والصلاحيات وفق منهجية منظمة.' },
        { title: 'التحصين', description: 'نطبّق المعالجات بالترتيب الذي يقلل المخاطر أسرع.' },
        { title: 'التحقق', description: 'نختبر أن كل معالجة تعمل كما ينبغي.' },
        { title: 'المتابعة', description: 'نعود إلى الوضع الأمني دورياً، ومع كل تغيير مهم في أنظمتك.' },
      ],
      faqs: [
        { question: 'هل تقدمون اختبارات اختراق؟', answer: 'نركز على الخدمات الدفاعية. أي اختبار هجومي يتم فقط بتفويض مكتوب ونطاق متفق عليه مسبقاً، ونساعدك في تحديد نطاقه ومتابعة معالجة نتائجه.' },
        { question: 'من أين نبدأ إن لم يكن لدينا أي توثيق أمني؟', answer: 'من جرد بسيط: ما الأنظمة لديك، ومن يصل إليها. هذا وحده يكشف عادةً أهم ما يحتاج معالجة، ونبني عليه خطة واقعية.' },
      ],
      seoDescription: 'خدمات أمن سيبراني دفاعية: تقييم أمني بلغة واضحة، وتحصين للأنظمة، ومراقبة، وجاهزية للاستجابة للحوادث.',
    },
    en: {
      heroHeadline: 'Security built with the system — not bolted on later.',
      heroSubhead: 'We assess your security, fix what matters first, and prepare your team to handle incidents with confidence.',
      summary: 'Defensive security assessment, system hardening, and incident-response readiness.',
      overview: [
        'Most risk in real environments does not come from sophisticated attacks, but from excess permissions, default settings nobody reviewed, and logs nobody reads. We start with what makes the biggest difference in your environment specifically.',
        'We write findings in language your technical team and management can both follow: what the issue is, its impact, and the action we propose for each. No scaremongering, and no generic advice that is hard to apply.',
      ],
      deliverables: [
        { title: 'Security assessment report', description: 'A full picture of your security, with a specific action for each finding.' },
        { title: 'Fixes applied', description: 'Permissions, secure settings and integration security, most important first.' },
        { title: 'Monitoring and alerting', description: 'Logs and alerts that surface unusual activity early.' },
        { title: 'Incident response plan', description: 'Clear roles, written steps, and a practical exercise for your team.' },
      ],
      capabilities: ['Architecture and design review', 'Threat modelling', 'Identity and access management', 'Server and cloud hardening', 'Log analysis', 'Incident handling'],
      processSteps: [
        { title: 'Discovery', description: 'We learn your systems, your data, and what your business needs to keep available.' },
        { title: 'Assessment', description: 'We review architecture, settings and permissions using a structured method.' },
        { title: 'Hardening', description: 'We apply fixes in the order that reduces risk fastest.' },
        { title: 'Verification', description: 'We test that each fix works as intended.' },
        { title: 'Follow-up', description: 'We revisit your security periodically, and after every significant change to your systems.' },
      ],
      faqs: [
        { question: 'Do you offer penetration testing?', answer: 'We focus on defensive services. Any offensive testing happens only with written authorisation and a scope agreed in advance, and we help you define that scope and follow up on the fixes.' },
        { question: 'Where do we start with no security documentation at all?', answer: 'With a simple inventory: what systems you have and who can reach them. That alone usually reveals what most needs fixing, and we build a realistic plan on it.' },
      ],
      seoDescription: 'Defensive cybersecurity: plain-language security assessment, system hardening, monitoring and incident-response readiness.',
    },
  },
];

const ABOUT_AR = {
  title: 'من نحن',
  blocks: [
    {
      blockType: 'contentRichText' as const,
      heading: 'بروتوكول سوفت باختصار',
      content: lexical(
        [
          'بدأت بروتوكول سوفت من قناعة بسيطة: البرمجيات الجيدة تُبنى حول طريقة عمل الناس، لا حول قوالب جاهزة، وحمايتها جزء من بنائها لا مرحلة تأتي بعده.',
          'نقدّم خدماتنا بالعربية والإنجليزية، في ثلاثة مسارات: الأنظمة المخصصة، والمنتجات والمنصات الرقمية، والأمن السيبراني الدفاعي.',
        ],
        'rtl',
      ),
    },
    {
      blockType: 'featureGrid' as const,
      heading: 'كيف نتصرف في كل مشروع',
      items: [
        { title: 'نستمع قبل أن نقترح', description: 'نبدأ بأسئلة عن عملك وأهدافه، لا بعرض جاهز نحاول أن نطابقه عليك.' },
        { title: 'نكتب ما نتفق عليه', description: 'القرارات والتغييرات موثقة أولاً بأول، فيعرف الجميع ما اتُّفق عليه ولماذا.' },
        { title: 'نشرح الخيارات بوضوح', description: 'لكل قرار تقني بدائل وتكلفة؛ نعرضها عليك بلغة مفهومة لتختار وأنت مطّلع.' },
        { title: 'نسلّم ما يبقى لك', description: 'الشيفرة والوثائق والمعرفة تنتقل إلى فريقك، فلا تبقى معتمداً علينا.' },
      ],
    },
  ],
};

const ABOUT_EN = {
  title: 'About Us',
  blocks: [
    {
      blockType: 'contentRichText' as const,
      heading: 'Protocol Soft in brief',
      content: lexical(
        [
          'Protocol Soft started from a simple conviction: good software is built around how people work, not around templates, and protecting it is part of building it, not a stage that comes after.',
          'We deliver in Arabic and English, across three tracks: custom systems, digital products and platforms, and defensive cybersecurity.',
        ],
        'ltr',
      ),
    },
    {
      blockType: 'featureGrid' as const,
      heading: 'How we behave on every project',
      items: [
        { title: 'We listen before we propose', description: 'We start with questions about your work and goals, not with a ready-made offer to fit you into.' },
        { title: 'We write down what we agree', description: 'Decisions and changes are documented as we go, so everyone knows what was agreed and why.' },
        { title: 'We explain the options', description: 'Every technical decision has alternatives and a cost; we lay them out plainly so you choose with full sight.' },
        { title: 'We hand over what you keep', description: 'Code, documentation and know-how pass to your team, so you are never dependent on us.' },
      ],
    },
  ],
};

/** --drafts-only: write the same copy as DRAFTS and publish nothing. Safe in
 *  any environment, including production: editors then review each item and
 *  publish it from the admin's "publish per language" panel. */
const DRAFTS_ONLY = process.argv.includes('--drafts-only');

const publish = async (): Promise<void> => {
  if (!DRAFTS_ONLY) guard();
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
    const spec = SERVICE_SPECS[copy.slug];
    if (!spec) throw new Error(`no spec-sheet content for ${copy.slug}`);
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
          processSteps: c.processSteps.map((step, i) => ({ ...step, ...(spec[locale].exchange[i] ?? {}) })),
          faqs: [...c.faqs, ...(spec[locale].extraFaqs ?? [])],
          engagementFacts: spec[locale].engagementFacts,
          notIncluded: spec[locale].notIncluded,
          capabilityGroups: spec[locale].capabilityGroups,
          seo: { description: c.seoDescription },
        } as never,
      });
    }
    if (DRAFTS_ONLY) {
      console.log(`draft written: service ${copy.slug} (ar+en)`);
      continue;
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
    data.sections = { ...((data.sections ?? {}) as Record<string, unknown>), faqEnabled: true, faqs: HOME_FAQS[locale] };
    if (DRAFTS_ONLY) {
      delete data._status;
      await payload.updateGlobal({ slug: 'homepage', data: data as never, draft: true, locale, overrideAccess: true, context: { skipAudit: true } } as never);
      console.log(`draft written: homepage FAQs (${locale})`);
      continue;
    }
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
    if (DRAFTS_ONLY) console.log('draft written: about page (ar+en)');
    else await payload.update({
      collection: 'pages',
      id: about.id,
      draft: true,
      overrideAccess: true,
      context: { skipAudit: true },
      data: { _status: 'published', publishedLocales: ['ar', 'en'] } as never,
    });
    if (!DRAFTS_ONLY) console.log('published about page (ar+en) — LOCAL REVIEW ONLY');
  }

  /* ── 4. Privacy policy: local review copy of the legal text. The legal gate
         still applies in production (Super Admin + recorded legal review);
         here the review fields say plainly that counsel has not reviewed it. ── */
  const privacyRes = await payload.find({ collection: 'pages', where: { slug: { equals: 'privacy' } }, limit: 1, draft: true, overrideAccess: true });
  const privacy = privacyRes.docs[0];
  if (!privacy) {
    console.warn('privacy page not found — run the seed first');
  } else {
    for (const locale of ['ar', 'en'] as const) {
      await payload.update({
        collection: 'pages',
        id: privacy.id,
        draft: true,
        locale,
        overrideAccess: true,
        context: { skipAudit: true },
        data: { title: PRIVACY[locale].title, blocks: PRIVACY[locale].blocks, seo: { description: PRIVACY[locale].seoDescription } } as never,
      });
    }
    if (DRAFTS_ONLY) console.log('draft written: privacy page (ar+en) — publish only after legal review');
    else await payload.update({
      collection: 'pages',
      id: privacy.id,
      draft: true,
      overrideAccess: true,
      context: { skipAudit: true },
      data: {
        _status: 'published',
        publishedLocales: ['ar', 'en'],
        legalReviewedBy: 'LOCAL REVIEW ONLY — not reviewed by legal counsel',
        legalReviewedAt: new Date().toISOString(),
      } as never,
    });
    if (!DRAFTS_ONLY) console.log('published privacy page (ar+en) — LOCAL REVIEW ONLY, legal review still required for production');
  }

  if (DRAFTS_ONLY) {
    console.log('\nDrafts written. Nothing was published: review and publish each item in the admin.');
    process.exit(0);
  }

  /* ── Explicit non-publishing confirmation ── */
  console.log('NOT published: terms of use, case study, EDR initiative, team, social links, real contact data.');

  const check = async (): Promise<void> => {
    const svc = await payload.find({ collection: 'services', where: { _status: { equals: 'published' } }, limit: 10, overrideAccess: true });
    const pages = await payload.find({ collection: 'pages', where: { _status: { equals: 'published' } }, limit: 10, overrideAccess: true });
    const terms = pages.docs.filter((p) => String(p.slug) === 'terms');
    console.log(`state: published services=${svc.totalDocs}, published pages=${pages.totalDocs}, published terms (must be 0)=${terms.length}`);
    if (terms.length > 0) throw new Error('TERMS PAGE PUBLISHED — it has no reviewed text yet');
  };
  await check();
  console.log('\nLocal review publish complete. This data state is LOCAL ONLY — never commit, export to staging, or copy to production.');
  process.exit(0);
};

void publish();
