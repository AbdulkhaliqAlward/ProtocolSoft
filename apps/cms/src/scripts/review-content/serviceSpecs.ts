/**
 * Spec-sheet content for the three services (AR + EN): engagement facts, what
 * is NOT included, the process as an exchange (what we need from you / what
 * you receive), capabilities grouped by stage, and service-specific questions.
 *
 * Each section of a service page has one job, so nothing is said twice:
 *   overview      the problem and our approach (publish-local-review.ts)
 *   deliverables  the concrete outputs you keep        (publish-local-review.ts)
 *   exchange      what each step needs and produces
 *   capabilities  specific skills not named elsewhere on the page
 *   FAQs          questions the page does not already answer
 * No number, duration, client, certification or year is stated.
 */
export interface Fact { label: string; value: string }
export interface Step { clientProvides: string; weDeliver: string }
export interface CapabilityGroup { stage: string; title: string; items: Array<{ label: string }> }
export interface LocaleSpec {
  engagementFacts: Fact[];
  notIncluded: Array<{ item: string }>;
  /** Same order as the service's processSteps. */
  exchange: Step[];
  capabilityGroups: CapabilityGroup[];
  extraFaqs?: Array<{ question: string; answer: string }>;
}

const items = (...list: string[]) => list.map((item) => ({ item }));
const labels = (...list: string[]) => list.map((label) => ({ label }));

export const SERVICE_SPECS: Record<string, { ar: LocaleSpec; en: LocaleSpec }> = {
  'custom-software': {
    ar: {
      engagementFacts: [
        { label: 'نوع الارتباط', value: 'مشروع بمراحل تسليم مكتوبة' },
        { label: 'الجدول الزمني', value: 'خطة مكتوبة لكل مرحلة بعد جلسة الاستكشاف' },
        { label: 'ما يبقى لك', value: 'النظام وشيفرته المصدرية ووثائقه' },
        { label: 'لغات الواجهة', value: 'العربية والإنجليزية' },
      ],
      notIncluded: items(
        'شراء التراخيص أو الخوادم نيابةً عنك؛ نوصي بالمناسب منها ونساعدك في إعداده.',
        'إدخال البيانات القديمة يدوياً؛ نبني أدوات ترحيلها ونشرف على تشغيلها.',
        'استضافة النظام على حسابنا؛ يعمل في بيئتك أو لدى مزوّد تختاره.',
        'دعم تشغيلي على مدار الساعة، إلا ضمن اتفاقية دعم منفصلة.',
      ),
      exchange: [
        { clientProvides: 'وقت مع أصحاب العملية، ووصف للأنظمة الحالية.', weDeliver: 'خريطة سير العمل، ونطاق مكتوب مقسّم إلى مراحل.' },
        { clientProvides: 'ملاحظاتك على النماذج، واعتماد التصميم.', weDeliver: 'بنية تقنية معتمدة، ونماذج واجهات جاهزة للتنفيذ.' },
        { clientProvides: 'ملاحظات مجمّعة على كل إصدار في موعدها.', weDeliver: 'إصدار يعمل في نهاية كل مرحلة.' },
        { clientProvides: 'بيئة اختبار وصلاحيات الوصول اللازمة.', weDeliver: 'تقرير المراجعة الأمنية ونتائج الاختبارات.' },
        { clientProvides: 'فريق يتولى التشغيل اليومي بعد التدريب.', weDeliver: 'إطلاق مُدار، وخطة للمرحلة التالية.' },
      ],
      capabilityGroups: [
        { stage: 'A · قبل', title: 'نفهم العملية', items: labels('ورش عمل مع أصحاب العملية', 'ترتيب الأولويات وتقسيم المراحل') },
        { stage: 'B · أثناء', title: 'نبني بجودة', items: labels('ربط الأنظمة عبر واجهات برمجية (API)', 'الأدوار والصلاحيات', 'التقارير ولوحات المتابعة', 'ترحيل البيانات من الأنظمة القديمة') },
        { stage: 'C · بعد', title: 'نشغّل ونطوّر', items: labels('مراقبة الأداء والأعطال', 'تحسينات مستمرة حسب الأولوية') },
      ],
      extraFaqs: [
        { question: 'من يملك الشيفرة المصدرية؟', answer: 'نحدد ملكيتها وحقوق استخدامها في العقد قبل بدء العمل، وتنتقل إليك مع كل مرحلة مكتملة وفق ما اتفقنا عليه.' },
        { question: 'ماذا لو تغيّرت متطلباتنا أثناء المشروع؟', answer: 'هذا متوقع. نراجع الأولويات معك بعد كل إصدار، وأي إضافة جديدة نتفق عليها كمرحلة مستقلة بتكلفتها قبل تنفيذها.' },
      ],
    },
    en: {
      engagementFacts: [
        { label: 'Engagement', value: 'A project with written delivery phases' },
        { label: 'Timeline', value: 'A written plan for each phase after discovery' },
        { label: 'Yours to keep', value: 'The system, its source code and its documentation' },
        { label: 'Interface languages', value: 'Arabic and English' },
      ],
      notIncluded: items(
        'Buying licences or servers on your behalf; we recommend what fits and help you set it up.',
        'Manual entry of legacy data; we build the migration tools and supervise their run.',
        'Hosting the system on our account; it runs in your environment or with a provider you choose.',
        'Round-the-clock operational support, except under a separate support agreement.',
      ),
      exchange: [
        { clientProvides: 'Time with the people who own the process, and a description of current systems.', weDeliver: 'A workflow map and a written scope split into phases.' },
        { clientProvides: 'Your feedback on the prototypes, and design sign-off.', weDeliver: 'An approved technical architecture and build-ready interface designs.' },
        { clientProvides: 'Consolidated feedback on each release, on time.', weDeliver: 'A working release at the end of every phase.' },
        { clientProvides: 'A test environment and the access we need.', weDeliver: 'The security review report and test results.' },
        { clientProvides: 'A team that takes over daily operation after training.', weDeliver: 'A managed launch and a plan for the next phase.' },
      ],
      capabilityGroups: [
        { stage: 'A · Before', title: 'Understand the process', items: labels('Workshops with process owners', 'Prioritising and phasing') },
        { stage: 'B · During', title: 'Build it well', items: labels('System integration through APIs', 'Roles and permissions', 'Reports and dashboards', 'Data migration from legacy systems') },
        { stage: 'C · After', title: 'Run and improve', items: labels('Performance and error monitoring', 'Ongoing improvements by priority') },
      ],
      extraFaqs: [
        { question: 'Who owns the source code?', answer: 'Ownership and usage rights are set out in the contract before work starts, and the code passes to you with each completed phase, as agreed.' },
        { question: 'What if our requirements change mid-project?', answer: 'That is expected. We review priorities with you after each release, and anything new is agreed as a separate phase, with its cost, before we build it.' },
      ],
    },
  },

  'digital-products': {
    ar: {
      engagementFacts: [
        { label: 'نوع الارتباط', value: 'من تعريف المنتج إلى الإطلاق والتحسين' },
        { label: 'اللغات', value: 'العربية والإنجليزية' },
        { label: 'الجدول الزمني', value: 'يُحدَّد في ورشة تعريف المنتج، مع موعد مكتوب للنسخة الأولى' },
      ],
      notIncluded: items(
        'التسويق وحملات اكتساب المستخدمين بعد الإطلاق.',
        'إنتاج المحتوى التسويقي والتصوير.',
        'رسوم متاجر التطبيقات وبوابات الدفع والخدمات السحابية؛ تُدفع باسمك مباشرة.',
        'التعهد بأرقام نمو أو أعداد مستخدمين محددة؛ نلتزم بجودة المنتج وقياس أدائه بوضوح.',
      ),
      exchange: [
        { clientProvides: 'الفكرة، والجمهور، وأي بحث أو بيانات لديك.', weDeliver: 'وثيقة تعريف المنتج ونطاق النسخة الأولى.' },
        { clientProvides: 'قرارات سريعة على النماذج.', weDeliver: 'واجهات معتمدة جاهزة للتنفيذ.' },
        { clientProvides: 'مراجعة كل دورة تطوير.', weDeliver: 'إصدارات تجربها على أجهزة حقيقية.' },
        { clientProvides: 'سياسة الخصوصية والحسابات اللازمة للنشر.', weDeliver: 'نتائج الاختبار على الأجهزة، وإصلاح ما ظهر.' },
        { clientProvides: 'وصول إلى بيانات الاستخدام بعد الإطلاق.', weDeliver: 'تقرير الإطلاق الأول، وأولويات الدورة التالية.' },
      ],
      capabilityGroups: [
        { stage: 'A · قبل', title: 'نختبر الفكرة', items: labels('مقابلات المستخدمين', 'ترتيب المزايا حسب قيمتها') },
        { stage: 'B · أثناء', title: 'نبني المنتج', items: labels('تطبيقات الويب والجوال', 'الحسابات وتسجيل الدخول', 'تكاملات الدفع والإشعارات') },
        { stage: 'C · بعد', title: 'نقيس ونحسّن', items: labels('تحليلات الاستخدام', 'تجربة التحسينات قبل تعميمها') },
      ],
      extraFaqs: [
        { question: 'هل تبنون تطبيقات للجوال؟', answer: 'نعم، حسب ما يحتاجه المنتج: تطبيق ويب يعمل على كل الأجهزة، أو تطبيق في متاجر الجوال. نوصي بالأنسب لجمهورك ولمرحلة منتجك.' },
        { question: 'باسم من تُنشأ حسابات المنتج؟', answer: 'باسمك. حسابات المتاجر والخوادم وبوابات الدفع تُنشأ لجهتك من البداية، فيبقى المنتج وبياناته تحت تصرفك.' },
      ],
    },
    en: {
      engagementFacts: [
        { label: 'Engagement', value: 'From product definition to launch and improvement' },
        { label: 'Languages', value: 'Arabic and English' },
        { label: 'Timeline', value: 'Set in the definition workshop, with a written date for the first release' },
      ],
      notIncluded: items(
        'Marketing and user-acquisition campaigns after launch.',
        'Marketing content production and photography.',
        'App-store, payment-gateway and cloud fees; these are paid in your name directly.',
        'Commitments to specific growth figures or user numbers; we commit to product quality and clear measurement.',
      ),
      exchange: [
        { clientProvides: 'The idea, the audience, and any research or data you have.', weDeliver: 'A product definition document and the first-release scope.' },
        { clientProvides: 'Quick decisions on the prototypes.', weDeliver: 'Approved, build-ready interfaces.' },
        { clientProvides: 'A review of each development cycle.', weDeliver: 'Releases you can try on real devices.' },
        { clientProvides: 'The privacy policy and the accounts needed to publish.', weDeliver: 'Device test results, and fixes for what they found.' },
        { clientProvides: 'Access to usage data after launch.', weDeliver: 'A first launch report and the priorities for the next cycle.' },
      ],
      capabilityGroups: [
        { stage: 'A · Before', title: 'Test the idea', items: labels('User interviews', 'Ranking features by value') },
        { stage: 'B · During', title: 'Build the product', items: labels('Web and mobile apps', 'Accounts and sign-in', 'Payment and notification integrations') },
        { stage: 'C · After', title: 'Measure and improve', items: labels('Usage analytics', 'Testing improvements before rolling them out') },
      ],
      extraFaqs: [
        { question: 'Do you build mobile apps?', answer: 'Yes, depending on what the product needs: a web app that works on every device, or an app in the mobile stores. We recommend what fits your audience and your stage.' },
        { question: 'Whose name are the product accounts in?', answer: 'Yours. Store, server and payment-gateway accounts are created for your organisation from the start, so the product and its data stay under your control.' },
      ],
    },
  },

  cybersecurity: {
    ar: {
      engagementFacts: [
        { label: 'نوع الارتباط', value: 'تقييم، ثم خطة معالجة' },
        { label: 'الجدول الزمني', value: 'يُحدَّد بحسب حجم البيئة، ويُكتب في نطاق العمل' },
        { label: 'لغة التقارير', value: 'العربية والإنجليزية' },
      ],
      notIncluded: items(
        'شراء تراخيص الأدوات الأمنية نيابةً عنك؛ نوصي بما يناسب بيئتك.',
        'وعود بحماية مطلقة؛ نعمل على تقليل المخاطر بشكل يمكن قياسه.',
        'تشغيل مركز عمليات أمنية على مدار الساعة.',
        'إصدار شهادات امتثال رسمية؛ نجهّزك لمتطلباتها.',
      ),
      exchange: [
        { clientProvides: 'وصف للأنظمة، وصلاحيات الوصول اللازمة.', weDeliver: 'نطاق مكتوب وخطة زمنية للتقييم.' },
        { clientProvides: 'جهة اتصال تقنية للإجابة عن الأسئلة.', weDeliver: 'قائمة النتائج وأولويات معالجتها.' },
        { clientProvides: 'الموافقة على التغييرات ونوافذ التنفيذ.', weDeliver: 'سجل بكل تغيير طُبّق.' },
        { clientProvides: 'وقت قصير لمراجعة النتائج.', weDeliver: 'ما عولج، وما تبقى، وخطته.' },
        { clientProvides: 'إشعارنا بالتغييرات المهمة في أنظمتك.', weDeliver: 'توصيات محدثة بعد كل مراجعة.' },
      ],
      capabilityGroups: [
        { stage: 'A · قبل', title: 'نفهم ونقيّم', items: labels('مراجعة البنية والتصميم', 'نمذجة التهديدات') },
        { stage: 'B · أثناء', title: 'نحصّن', items: labels('إدارة الهويات والصلاحيات', 'تحصين الخوادم والبيئات السحابية', 'تأمين الواجهات البرمجية') },
        { stage: 'C · بعد', title: 'نراقب ونستجيب', items: labels('تحليل السجلات', 'التعامل مع الحوادث', 'توعية الفرق وتدريبها') },
      ],
      extraFaqs: [
        { question: 'هل تساعدوننا في الاستعداد لمتطلبات تنظيمية أو معايير أمنية؟', answer: 'نعم، أياً كان الإطار الذي تحتاج الالتزام به: ضوابط جهة تنظيمية، أو معياراً دولياً مثل ISO 27001. نقارن وضعك الحالي به، ونرتب الفجوات حسب الأولوية، ونساعدك في معالجتها وتوثيقها قبل أي تدقيق. أما التدقيق أو الاعتماد الرسمي فتتولاه الجهات المختصة.' },
      ],
    },
    en: {
      engagementFacts: [
        { label: 'Engagement', value: 'Assessment, then a remediation plan' },
        { label: 'Timeline', value: 'Set by the size of the environment and written into the scope' },
        { label: 'Report language', value: 'Arabic and English' },
      ],
      notIncluded: items(
        'Buying security tool licences on your behalf; we recommend what fits your environment.',
        'Promises of absolute protection; we reduce risk in ways you can measure.',
        'Running a round-the-clock security operations centre.',
        'Issuing formal compliance certificates; we prepare you for their requirements.',
      ),
      exchange: [
        { clientProvides: 'A description of your systems and the access we need.', weDeliver: 'A written scope and assessment timeline.' },
        { clientProvides: 'A technical contact to answer questions.', weDeliver: 'The list of findings and their remediation priorities.' },
        { clientProvides: 'Approval of changes and maintenance windows.', weDeliver: 'A log of every change applied.' },
        { clientProvides: 'A little time to review the results.', weDeliver: 'What was fixed, what remains, and its plan.' },
        { clientProvides: 'Notice of significant changes to your systems.', weDeliver: 'Updated recommendations after each review.' },
      ],
      capabilityGroups: [
        { stage: 'A · Before', title: 'Understand and assess', items: labels('Architecture and design review', 'Threat modelling') },
        { stage: 'B · During', title: 'Harden', items: labels('Identity and access management', 'Server and cloud hardening', 'API security') },
        { stage: 'C · After', title: 'Monitor and respond', items: labels('Log analysis', 'Incident handling', 'Team awareness and training') },
      ],
      extraFaqs: [
        { question: 'Can you help us prepare for regulatory requirements or security standards?', answer: 'Yes, whatever framework you need to meet: a regulator’s controls, or an international standard such as ISO 27001. We compare your current state with it, rank the gaps by priority, and help you fix and document them before any audit. The formal audit or certification itself is carried out by the competent bodies.' },
      ],
    },
  },
};

/** General questions for the homepage (shown before getting in touch). */
export const HOME_FAQS = {
  ar: [
    { question: 'كيف نبدأ العمل معكم؟', answer: 'أرسل وصفاً مختصراً للتحدي عبر نموذج التواصل. نبدأ من هناك بجلسة استكشاف نتفق في نهايتها على نطاق مكتوب ونقطة بداية واضحة.' },
    { question: 'ماذا يحدث بعد إرسال الطلب؟', answer: 'يقرأ طلبك مختص في مجاله، ويرد عليك برأي صريح: هل نحن الجهة المناسبة، وما الخطوة التي نقترحها.' },
    { question: 'كيف تُحدَّد التكلفة؟', answer: 'نسعّر كل مرحلة على حدة، مع مخرجاتها المكتوبة، فلا تدفع مقابل عمل لم يُعرَّف بعد.' },
    { question: 'هل يمكن توقيع اتفاقية عدم إفصاح؟', answer: 'نعم. اذكر ذلك في طلبك ونوقّعها قبل أن تشاركنا أي تفاصيل حساسة. ولا تحتاج إلى معلومات سرية في رسالتك الأولى.' },
  ],
  en: [
    { question: 'How do we start working together?', answer: 'Send a short description of the challenge through the contact form. We take it from there with a discovery session that ends in a written scope and a clear starting point.' },
    { question: 'What happens after I send a request?', answer: 'Someone who works in that area reads it and replies with an honest view: whether we are the right fit, and the next step we suggest.' },
    { question: 'How is the cost defined?', answer: 'Each phase is priced on its own, with its written outputs, so you never pay for work that has not been defined yet.' },
    { question: 'Can we sign an NDA?', answer: 'Yes. Mention it when you write to us, and we will sign it before you share anything sensitive. You do not need confidential details in your first message.' },
  ],
};
