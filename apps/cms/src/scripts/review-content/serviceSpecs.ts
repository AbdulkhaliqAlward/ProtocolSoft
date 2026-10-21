/**
 * Spec-sheet content for the three services (LOCAL REVIEW copy, AR + EN):
 * engagement facts, what is NOT included, the process as an exchange (what we
 * need from you / what you receive) and capabilities grouped by stage.
 *
 * Every "not included" line and every fact that depends on company practice
 * (durations, response times, team set-up) carries needsConfirmation: true,
 * which renders a visible NEEDS CONFIRMATION tag until Protocol Soft reviews it
 * in the CMS. Nothing here states a number, client, certification or year.
 */
export interface Fact { label: string; value: string; needsConfirmation?: boolean }
export interface Step { clientProvides: string; weDeliver: string }
export interface CapabilityGroup { stage: string; title: string; items: Array<{ label: string }> }
export interface LocaleSpec {
  engagementFacts: Fact[];
  notIncluded: Array<{ item: string; needsConfirmation: boolean }>;
  /** Same order as the service's processSteps. */
  exchange: Step[];
  capabilityGroups: CapabilityGroup[];
  extraFaqs?: Array<{ question: string; answer: string }>;
}

const tbc = (item: string) => ({ item, needsConfirmation: true });

export const SERVICE_SPECS: Record<string, { ar: LocaleSpec; en: LocaleSpec }> = {
  'custom-software': {
    ar: {
      engagementFacts: [
        { label: 'نوع الارتباط', value: 'مشروع بمراحل تسليم مكتوبة' },
        { label: 'المدة المعتادة', value: 'تُحدد بعد جلسة الاستكشاف', needsConfirmation: true },
        { label: 'ما تستلمه', value: 'نظام عامل، الشيفرة المصدرية، والتوثيق' },
        { label: 'لغة النظام', value: 'العربية والإنجليزية' },
      ],
      notIncluded: [
        tbc('شراء التراخيص أو الخوادم نيابةً عنك؛ نوصي بها ونساعدك في إعدادها.'),
        tbc('إدخال البيانات القديمة يدوياً؛ نبني أدوات الترحيل ونشرف عليها.'),
        tbc('تطوير مزايا خارج النطاق المكتوب دون اتفاق على مرحلة جديدة.'),
        tbc('الدعم التشغيلي على مدار الساعة ما لم يُتفق عليه في عقد دعم منفصل.'),
      ],
      exchange: [
        { clientProvides: 'وقت مع أصحاب العملية الفعليين ووصف للأنظمة الحالية.', weDeliver: 'توثيق سير العمل ونطاق مكتوب بمراحل.' },
        { clientProvides: 'مراجعة النماذج والموافقة على التصميم.', weDeliver: 'بنية تقنية ونماذج واجهات قابلة للتنفيذ.' },
        { clientProvides: 'ملاحظات على كل مرحلة خلال أيام من تسليمها.', weDeliver: 'إصدارات قابلة للتجربة مع اختبارات آلية.' },
        { clientProvides: 'بيئة اختبار وصلاحيات الوصول اللازمة.', weDeliver: 'مراجعة أمنية ونتائج الاختبارات.' },
        { clientProvides: 'فريق يستلم التدريب ويتولى التشغيل اليومي.', weDeliver: 'إطلاق، تدريب، وتوثيق تشغيلي يبقى لديك.' },
      ],
      capabilityGroups: [
        { stage: 'A · قبل', title: 'نفهم العملية', items: [{ label: 'تحليل ودراسة العمليات' }, { label: 'تحديد النطاق والمراحل' }] },
        { stage: 'B · أثناء', title: 'نبني بجودة', items: [{ label: 'تكامل مع الأنظمة القائمة' }, { label: 'واجهات عربية وإنجليزية' }, { label: 'اختبارات آلية' }] },
        { stage: 'C · بعد', title: 'نشغّل ونطوّر', items: [{ label: 'تسليم تدريجي' }, { label: 'دعم وتشغيل' }, { label: 'تطوير المراحل اللاحقة' }] },
      ],
      extraFaqs: [
        { question: 'من يملك الشيفرة المصدرية؟', answer: 'تُسلَّم لك الشيفرة المصدرية والتوثيق مع كل مرحلة وفق ما ينص عليه العقد. [⚠️ NEEDS CONFIRMATION: شروط الملكية الفكرية في عقودكم]' },
      ],
    },
    en: {
      engagementFacts: [
        { label: 'Engagement', value: 'A project with written delivery phases' },
        { label: 'Typical duration', value: 'Set after the discovery session', needsConfirmation: true },
        { label: 'You receive', value: 'A working system, source code and documentation' },
        { label: 'Interface languages', value: 'Arabic and English' },
      ],
      notIncluded: [
        tbc('Buying licences or servers on your behalf; we recommend them and help set them up.'),
        tbc('Manual entry of legacy data; we build and supervise the migration tools.'),
        tbc('Features outside the written scope without agreeing a new phase.'),
        tbc('Round-the-clock operational support unless agreed in a separate support contract.'),
      ],
      exchange: [
        { clientProvides: 'Time with the people who run the process and a description of current systems.', weDeliver: 'Documented workflows and a written, phased scope.' },
        { clientProvides: 'Review of prototypes and design sign-off.', weDeliver: 'Technical architecture and implementation-ready interface designs.' },
        { clientProvides: 'Feedback on each phase within days of delivery.', weDeliver: 'Testable releases with automated tests.' },
        { clientProvides: 'A test environment and the access we need.', weDeliver: 'A security review and the test results.' },
        { clientProvides: 'A team to take the training and own daily operation.', weDeliver: 'Launch, training and operational documentation you keep.' },
      ],
      capabilityGroups: [
        { stage: 'A · Before', title: 'Understand the process', items: [{ label: 'Process analysis' }, { label: 'Scope and phase planning' }] },
        { stage: 'B · During', title: 'Build it well', items: [{ label: 'Integration with existing systems' }, { label: 'Arabic and English interfaces' }, { label: 'Automated testing' }] },
        { stage: 'C · After', title: 'Run and improve', items: [{ label: 'Phased delivery' }, { label: 'Support and operations' }, { label: 'Follow-up phases' }] },
      ],
      extraFaqs: [
        { question: 'Who owns the source code?', answer: 'Source code and documentation are handed over with each phase as set out in the contract. [⚠️ NEEDS CONFIRMATION: IP terms in your contracts]' },
      ],
    },
  },

  'digital-products': {
    ar: {
      engagementFacts: [
        { label: 'نوع الارتباط', value: 'من تعريف المنتج إلى الإطلاق والتحسين' },
        { label: 'النسخة الأولى', value: 'نطاق صغير قابل للقياس' },
        { label: 'المدة المعتادة للنسخة الأولى', value: 'تُحدد بعد ورشة التعريف', needsConfirmation: true },
        { label: 'المنصات', value: 'ويب وجوال حسب حاجة المنتج', needsConfirmation: true },
      ],
      notIncluded: [
        tbc('التسويق وحملات اكتساب المستخدمين بعد الإطلاق.'),
        tbc('إنتاج المحتوى التسويقي والتصوير.'),
        tbc('رسوم متاجر التطبيقات وبوابات الدفع والخدمات السحابية.'),
        tbc('ضمان أرقام نمو أو عدد مستخدمين محدد.'),
      ],
      exchange: [
        { clientProvides: 'الفكرة، الجمهور المستهدف، وأي بحث أو بيانات متوفرة.', weDeliver: 'تعريف المنتج ونطاق النسخة الأولى.' },
        { clientProvides: 'قرارات سريعة على رحلات المستخدم والنماذج.', weDeliver: 'تصميم تجربة وواجهات جاهزة للتنفيذ.' },
        { clientProvides: 'مراجعة كل دورة تطوير قصيرة.', weDeliver: 'إصدارات قابلة للتجربة على أجهزة حقيقية.' },
        { clientProvides: 'سياسات الخصوصية والحسابات اللازمة للإطلاق.', weDeliver: 'اختبارات قبل الإطلاق وحماية بيانات المستخدمين.' },
        { clientProvides: 'وصول لبيانات الاستخدام بعد الإطلاق.', weDeliver: 'إطلاق مقيس وخطة تحسين مرتبة بالأولوية.' },
      ],
      capabilityGroups: [
        { stage: 'A · قبل', title: 'نعرّف المنتج', items: [{ label: 'تعريف المنتج والنسخة الأولى' }, { label: 'تصميم تجربة ثنائية اللغة' }] },
        { stage: 'B · أثناء', title: 'نبني المنصة', items: [{ label: 'منصات قابلة للتوسع' }, { label: 'لوحات تشغيل داخلية' }, { label: 'تكاملات الدفع والإشعارات' }] },
        { stage: 'C · بعد', title: 'نقيس ونحسّن', items: [{ label: 'قياس الاستخدام' }, { label: 'تطوير مستمر' }] },
      ],
    },
    en: {
      engagementFacts: [
        { label: 'Engagement', value: 'From product definition to launch and improvement' },
        { label: 'First release', value: 'A small, measurable scope' },
        { label: 'Typical time to first release', value: 'Set after the definition workshop', needsConfirmation: true },
        { label: 'Platforms', value: 'Web and mobile, as the product needs', needsConfirmation: true },
      ],
      notIncluded: [
        tbc('Marketing and user-acquisition campaigns after launch.'),
        tbc('Marketing content production and photography.'),
        tbc('App-store, payment-gateway and cloud service fees.'),
        tbc('Guaranteed growth figures or user numbers.'),
      ],
      exchange: [
        { clientProvides: 'The idea, the target audience and any research or data you have.', weDeliver: 'A product definition and the first-release scope.' },
        { clientProvides: 'Quick decisions on user journeys and prototypes.', weDeliver: 'Experience and interface design ready to build.' },
        { clientProvides: 'A review of each short development cycle.', weDeliver: 'Releases you can try on real devices.' },
        { clientProvides: 'Privacy policies and the accounts needed to launch.', weDeliver: 'Pre-launch testing and user-data protection.' },
        { clientProvides: 'Access to usage data after launch.', weDeliver: 'A measured launch and a prioritised improvement plan.' },
      ],
      capabilityGroups: [
        { stage: 'A · Before', title: 'Define the product', items: [{ label: 'Product definition and first release' }, { label: 'Bilingual experience design' }] },
        { stage: 'B · During', title: 'Build the platform', items: [{ label: 'Scalable platforms' }, { label: 'Internal operations dashboards' }, { label: 'Payment and notification integrations' }] },
        { stage: 'C · After', title: 'Measure and improve', items: [{ label: 'Usage measurement' }, { label: 'Continuous development' }] },
      ],
    },
  },

  cybersecurity: {
    ar: {
      engagementFacts: [
        { label: 'نوع الارتباط', value: 'تقييم ثم خطة معالجة' },
        { label: 'المدة المعتادة للتقييم', value: 'تُحدد حسب حجم البيئة', needsConfirmation: true },
        { label: 'ما تستلمه', value: 'تقرير بالأولويات وخطة عمل' },
        { label: 'لغة التقرير', value: 'العربية والإنجليزية' },
      ],
      notIncluded: [
        tbc('أي اختبار هجومي دون تفويض مكتوب ونطاق متفق عليه.'),
        tbc('وعود بحماية مطلقة من جميع التهديدات.'),
        tbc('تشغيل مركز مراقبة أمنية على مدار الساعة.'),
        tbc('شهادات امتثال رسمية؛ نساعدك في الاستعداد لها.'),
      ],
      exchange: [
        { clientProvides: 'وصف للأنظمة وصلاحيات الوصول اللازمة.', weDeliver: 'نطاق مكتوب وخطة زمنية.' },
        { clientProvides: 'جهة اتصال تقنية للأسئلة.', weDeliver: 'تقرير بالنتائج مرتب حسب الأثر والأولوية.' },
        { clientProvides: 'موافقة على التغييرات ونوافذ التنفيذ.', weDeliver: 'ضوابط مطبقة وموثقة.' },
        { clientProvides: 'وقت قصير لمراجعة النتائج.', weDeliver: 'نتائج التحقق وما تبقى للمعالجة.' },
        { clientProvides: 'تحديثات عن أي تغيير في الأنظمة.', weDeliver: 'مراجعة دورية وتوصيات محدثة.' },
      ],
      capabilityGroups: [
        { stage: 'A · قبل', title: 'نفهم ونقيّم', items: [{ label: 'تقييم أمني دفاعي' }, { label: 'مراجعة البنية والتصميم' }] },
        { stage: 'B · أثناء', title: 'نحصّن ونبني', items: [{ label: 'إدارة الهويات والصلاحيات' }, { label: 'تحصين البنية والتهيئة الآمنة' }] },
        { stage: 'C · بعد', title: 'نراقب ونستجيب', items: [{ label: 'مراقبة السجلات والتنبيهات' }, { label: 'الاستجابة للحوادث' }, { label: 'توعية وتدريب الفرق' }] },
      ],
    },
    en: {
      engagementFacts: [
        { label: 'Engagement', value: 'Assessment, then a remediation plan' },
        { label: 'Typical assessment duration', value: 'Depends on the size of the environment', needsConfirmation: true },
        { label: 'You receive', value: 'A prioritised report and an action plan' },
        { label: 'Report language', value: 'Arabic and English' },
      ],
      notIncluded: [
        tbc('Any offensive testing without written authorisation and an agreed scope.'),
        tbc('Promises of absolute protection against every threat.'),
        tbc('Running a round-the-clock security operations centre.'),
        tbc('Formal compliance certification; we help you prepare for it.'),
      ],
      exchange: [
        { clientProvides: 'A description of your systems and the access we need.', weDeliver: 'A written scope and timeline.' },
        { clientProvides: 'A technical contact for questions.', weDeliver: 'A findings report ranked by impact and priority.' },
        { clientProvides: 'Approval of changes and maintenance windows.', weDeliver: 'Controls applied and documented.' },
        { clientProvides: 'A little time to review the results.', weDeliver: 'Verification results and what remains to fix.' },
        { clientProvides: 'Updates about any change to your systems.', weDeliver: 'Periodic reviews and updated recommendations.' },
      ],
      capabilityGroups: [
        { stage: 'A · Before', title: 'Understand and assess', items: [{ label: 'Defensive security assessment' }, { label: 'Architecture and design review' }] },
        { stage: 'B · During', title: 'Harden and build', items: [{ label: 'Identity and access management' }, { label: 'Infrastructure hardening' }] },
        { stage: 'C · After', title: 'Monitor and respond', items: [{ label: 'Log monitoring and alerting' }, { label: 'Incident response' }, { label: 'Team awareness and training' }] },
      ],
    },
  },
};

/** General questions for the homepage (shown before getting in touch). */
// Answers that depend on company practice carry an inline [⚠️ NEEDS CONFIRMATION: …]
// marker naming exactly what to confirm, so the per-item flag stays off here.
export const HOME_FAQS = {
  ar: [
    { question: 'كيف نبدأ العمل معكم؟', answer: 'ترسل لنا وصفاً مختصراً عبر نموذج التواصل، ثم نرتب جلسة استكشاف نفهم فيها التحدي ونقترح نقطة البداية المناسبة ونطاقاً مكتوباً.', needsConfirmation: false },
    { question: 'كم تستغرق الردود على الطلبات؟', answer: 'نرد على كل طلب خلال مدة محددة من أيام العمل. [⚠️ NEEDS CONFIRMATION: مدة الرد]', needsConfirmation: false },
    { question: 'هل توقعون اتفاقية عدم إفصاح قبل مناقشة المشروع؟', answer: 'نعم عند الحاجة، قبل مشاركة أي تفاصيل حساسة. [⚠️ NEEDS CONFIRMATION]', needsConfirmation: false },
    { question: 'هل تعملون مع شركات خارج المملكة؟', answer: 'نخدم السعودية ودول الخليج، ونعمل بالعربية والإنجليزية. [⚠️ NEEDS CONFIRMATION: نطاق الأسواق]', needsConfirmation: false },
  ],
  en: [
    { question: 'How do we start working together?', answer: 'Send a short description through the contact form. We then arrange a discovery session to understand the challenge, suggest where to start and agree a written scope.', needsConfirmation: false },
    { question: 'How quickly do you reply to requests?', answer: 'We reply to every request within a set number of working days. [⚠️ NEEDS CONFIRMATION: reply time]', needsConfirmation: false },
    { question: 'Will you sign an NDA before discussing a project?', answer: 'Yes when needed, before any sensitive details are shared. [⚠️ NEEDS CONFIRMATION]', needsConfirmation: false },
    { question: 'Do you work with companies outside Saudi Arabia?', answer: 'We serve Saudi Arabia and the GCC, in Arabic and English. [⚠️ NEEDS CONFIRMATION: markets served]', needsConfirmation: false },
  ],
};
