/**
 * Admin wording, applied once to the whole config (see `adminLabels`):
 *  - Labels, group names and descriptions written as "عربي / English" become
 *    { ar, en } so the admin shows ONE language, matching the admin language.
 *  - Fields without a label get one from FIELD_LABELS by field name, so the
 *    Arabic admin never shows raw names such as "heroSubhead".
 * Schema files keep their existing bilingual strings; nothing else changes.
 */
import type { Config, Field } from 'payload';

type L = { ar: string; en: string };
const l = (ar: string, en: string): L => ({ ar, en });

/** Field name -> label. Shared names (title, summary…) read well everywhere. */
const FIELD_LABELS: Record<string, L> = {
  // Common
  title: l('العنوان', 'Title'),
  slug: l('المعرّف في الرابط', 'URL slug'),
  summary: l('الملخص', 'Summary'),
  description: l('الوصف', 'Description'),
  heading: l('العنوان', 'Heading'),
  body: l('النص', 'Body'),
  content: l('المحتوى', 'Content'),
  items: l('العناصر', 'Items'),
  item: l('البند', 'Item'),
  label: l('التسمية', 'Label'),
  value: l('القيمة', 'Value'),
  question: l('السؤال', 'Question'),
  answer: l('الإجابة', 'Answer'),
  faqs: l('الأسئلة الشائعة', 'FAQs'),
  sortOrder: l('الترتيب', 'Sort order'),
  visible: l('ظاهر على الموقع', 'Visible on site'),
  enabled: l('مفعّل', 'Enabled'),
  active: l('نشط', 'Active'),
  featured: l('مميز', 'Featured'),
  icon: l('الأيقونة', 'Icon'),
  image: l('الصورة', 'Image'),
  layout: l('ترتيب الصورة', 'Image position'),
  url: l('الرابط', 'URL'),
  target: l('الوجهة', 'Target'),
  status: l('الحالة', 'Status'),
  name: l('الاسم', 'Name'),
  email: l('البريد الإلكتروني', 'Email'),
  phone: l('رقم الهاتف', 'Phone'),
  company: l('الجهة', 'Company'),
  message: l('الرسالة', 'Message'),
  notes: l('ملاحظات داخلية', 'Internal notes'),
  author: l('الكاتب', 'Author'),
  createdAt: l('تاريخ الإنشاء', 'Created'),
  blocks: l('أقسام الصفحة', 'Page sections'),
  seo: l('محركات البحث', 'Search engines'),
  noindex: l('إخفاء من محركات البحث', 'Hide from search engines'),
  ogImage: l('صورة المشاركة', 'Sharing image'),
  publishedLocales: l('اللغات المنشورة', 'Published languages'),
  archivedAt: l('تاريخ الأرشفة', 'Archived at'),
  tags: l('وسوم', 'Tags'),
  category: l('التصنيف', 'Category'),
  caption: l('التعليق', 'Caption'),
  altText: l('النص البديل للصورة', 'Alt text'),
  visibility: l('الظهور', 'Visibility'),

  // Site settings
  companyName: l('اسم الشركة', 'Company name'),
  legalCompanyName: l('الاسم النظامي', 'Registered legal name'),
  commercialRegistration: l('رقم السجل التجاري', 'Commercial registration no.'),
  tagline: l('السطر التعريفي', 'Tagline'),
  emailMain: l('البريد الرئيسي', 'Main email'),
  emailSales: l('بريد المبيعات', 'Sales email'),
  emailSupport: l('بريد الدعم', 'Support email'),
  whatsappNumber: l('رقم واتساب', 'WhatsApp number'),
  addressLine: l('العنوان', 'Address'),
  city: l('المدينة', 'City'),
  country: l('الدولة', 'Country'),
  workingHours: l('ساعات العمل', 'Working hours'),
  googleMapsUrl: l('رابط خرائط Google', 'Google Maps link'),
  seoDomain: l('النطاق المعروض', 'Displayed domain'),
  footerCopyright: l('سطر حقوق النشر', 'Copyright line'),
  logoDark: l('الشعار (للخلفيات الداكنة)', 'Logo (dark backgrounds)'),
  logoLight: l('الشعار (للخلفيات الفاتحة)', 'Logo (light backgrounds)'),
  favicon: l('أيقونة المتصفح', 'Favicon'),
  defaultOgImage: l('صورة المشاركة الافتراضية', 'Default sharing image'),

  // Form settings
  notificationRecipients: l('مستلمو إشعارات الطلبات', 'Lead notification recipients'),
  confirmationMessage: l('رسالة التأكيد بعد الإرسال', 'Confirmation message'),
  rateLimits: l('حدود الإرسال', 'Rate limits'),
  perIpPerHour: l('لكل زائر في الساعة', 'Per visitor per hour'),
  perIpPerDay: l('لكل زائر في اليوم', 'Per visitor per day'),
  perServicePerMinute: l('للخدمة في الدقيقة', 'Per service per minute'),
  autoResponderEnabled: l('رد آلي للزائر', 'Auto-reply to visitor'),
  retentionMonths: l('مدة الاحتفاظ بالطلبات (بالأشهر)', 'Lead retention (months)'),

  // Homepage
  hero: l('الواجهة الرئيسية', 'Hero'),
  kicker: l('السطر الصغير فوق العنوان', 'Kicker'),
  headline: l('العنوان الرئيسي', 'Headline'),
  subheadline: l('الفقرة تحت العنوان', 'Subheadline'),
  primaryCtaLabel: l('نص الزر الأساسي', 'Primary button label'),
  secondaryCtaLabel: l('نص الزر الثانوي', 'Secondary button label'),
  secondaryCtaTarget: l('وجهة الزر الثانوي', 'Secondary button target'),
  backgroundPattern: l('نقش الخلفية', 'Background pattern'),
  sections: l('أقسام الصفحة', 'Sections'),
  valueStatementEnabled: l('إظهار الفقرة التعريفية', 'Show value statement'),
  valueStatement: l('الفقرة التعريفية (لماذا نحن)', 'Value statement'),
  differentiators: l('ما يميزنا', 'Differentiators'),
  servicesOverviewEnabled: l('إظهار قسم الخدمات', 'Show services section'),
  servicesHeading: l('عنوان قسم الخدمات', 'Services heading'),
  whyEnabled: l('إظهار بنود «لماذا نحن» الإضافية', 'Show extra “why us” items'),
  whyItems: l('بنود «لماذا نحن» الإضافية', 'Extra “why us” items'),
  methodologyEnabled: l('إظهار «طريقة عملنا»', 'Show methodology'),
  methodologySteps: l('خطوات طريقة العمل', 'Methodology steps'),
  promise: l('ما تعنيه الخطوة', 'Step promise'),
  featuredProject: l('المشروع المميز', 'Featured project'),
  project: l('المشروع', 'Project'),
  fallbackMode: l('عند عدم وجود مشروع', 'When no project'),
  neutralAlternative: l('النص البديل', 'Neutral alternative'),
  technicalInitiatives: l('المبادرات التقنية', 'Technical initiatives'),
  secureByDesignEnabled: l('إظهار «الأمان من اليوم الأول»', 'Show “secure by design”'),
  secureByDesign: l('نص «الأمان من اليوم الأول»', '“Secure by design” text'),
  faqEnabled: l('إظهار الأسئلة الشائعة', 'Show FAQs'),
  finalCta: l('الدعوة الختامية', 'Final call to action'),
  ctaLabel: l('نص الزر', 'Button label'),
  ctaTarget: l('وجهة الزر', 'Button target'),

  // Services
  heroHeadline: l('عنوان أعلى الصفحة', 'Hero headline'),
  heroSubhead: l('فقرة أعلى الصفحة', 'Hero subheading'),
  overview: l('نظرة عامة', 'Overview'),
  deliverables: l('ما يشمله العمل', 'Deliverables'),
  engagementFacts: l('بطاقة حقائق الارتباط', 'Engagement facts'),
  notIncluded: l('ما لا يشمله العمل', 'Not included'),
  capabilityGroups: l('القدرات حسب المرحلة', 'Capabilities by stage'),
  stage: l('المرحلة', 'Stage'),
  capabilities: l('القدرات (قائمة بسيطة)', 'Capabilities (simple list)'),
  processSteps: l('خطوات العمل', 'Process steps'),
  clientProvides: l('ما نحتاجه منك', 'What we need from you'),
  weDeliver: l('ما تستلمه', 'What you receive'),
  initiativeSection: l('بطاقة المبادرة التقنية', 'Initiative card'),
  timeline: l('الجدول الزمني', 'Timeline'),

  // Pages
  inNav: l('يظهر في القائمة', 'Show in menu'),
  legalReviewRequired: l('تتطلب مراجعة قانونية', 'Legal review required'),
  contentOrigin: l('مصدر النص', 'Content origin'),
  legalReviewedBy: l('المراجِع القانوني', 'Legal reviewer'),
  legalReviewedAt: l('تاريخ المراجعة القانونية', 'Legal review date'),
  legalApprovalRef: l('مرجع الموافقة', 'Approval reference'),

  // Team, social
  jobTitle: l('المسمى الوظيفي', 'Job title'),
  bio: l('نبذة', 'Bio'),
  photo: l('الصورة', 'Photo'),
  linkedinUrl: l('رابط لينكدإن', 'LinkedIn URL'),
  platform: l('المنصة', 'Platform'),

  // Leads
  referenceCode: l('الرقم المرجعي', 'Reference code'),
  fullName: l('الاسم الكامل', 'Full name'),
  serviceInterest: l('الخدمة المطلوبة', 'Service of interest'),
  sourceLocale: l('لغة الصفحة', 'Page language'),
  pagePath: l('الصفحة المرسَل منها', 'Sent from page'),
  consent: l('الموافقة على الخصوصية', 'Privacy consent'),
  ipHash: l('بصمة الزائر المشفّرة', 'Hashed visitor fingerprint'),
  submittedAt: l('تاريخ الإرسال', 'Submitted at'),
  assignedTo: l('المسؤول', 'Assigned to'),

  // Users
  role: l('الدور', 'Role'),
  preferredAdminLocale: l('لغة لوحة التحكم', 'Admin language'),

  // Case studies / initiatives (gated, not public at launch)
  projectType: l('نوع المشروع', 'Project type'),
  challenge: l('التحدي', 'Challenge'),
  solution: l('الحل', 'Solution'),
  outcomes: l('النتائج', 'Outcomes'),
  technologies: l('التقنيات', 'Technologies'),
  screenshots: l('لقطات الشاشة', 'Screenshots'),
  coverImage: l('صورة الغلاف', 'Cover image'),
  client: l('العميل', 'Client'),
  shortDescription: l('وصف مختصر', 'Short description'),
  roadmap: l('خارطة الطريق', 'Roadmap'),
  placements: l('أماكن الظهور', 'Placements'),
  links: l('الروابط', 'Links'),
};

const BLOCK_LABELS: Record<string, { singular: L; plural: L }> = {
  contentRichText: { singular: l('نص', 'Text'), plural: l('نصوص', 'Text sections') },
  featureGrid: { singular: l('بطاقات', 'Cards'), plural: l('بطاقات', 'Card grids') },
  faqAccordion: { singular: l('أسئلة شائعة', 'FAQ'), plural: l('أسئلة شائعة', 'FAQs') },
  ctaBanner: { singular: l('دعوة للتواصل', 'Call to action'), plural: l('دعوات للتواصل', 'Calls to action') },
  mediaText: { singular: l('صورة ونص', 'Image and text'), plural: l('صور ونصوص', 'Image and text') },
};

/** Collections declared without labels (system ones). */
const COLLECTION_LABELS: Record<string, { singular: L; plural: L }> = {
  users: { singular: l('مستخدم', 'User'), plural: l('المستخدمون', 'Users') },
  'audit-logs': { singular: l('سجل تدقيق', 'Audit log'), plural: l('سجل التدقيق', 'Audit logs') },
  'backup-records': { singular: l('نسخة احتياطية', 'Backup record'), plural: l('سجل النسخ الاحتياطية', 'Backup records') },
  'preview-codes': { singular: l('رمز معاينة', 'Preview code'), plural: l('رموز المعاينة', 'Preview codes') },
};

const ARABIC = /[؀-ۿ]/;

/** "عربي / English" -> { ar, en }; anything else is returned unchanged. */
const split = (value: unknown): unknown => {
  if (typeof value !== 'string') return value;
  let i = value.lastIndexOf(' / ');
  while (i > 0) {
    const ar = value.slice(0, i).trim();
    const en = value.slice(i + 3).trim();
    if (ARABIC.test(ar) && !ARABIC.test(en) && en.length > 0) return { ar, en };
    i = value.lastIndexOf(' / ', i - 1);
  }
  return value;
};

const relabelFields = (fields: Field[]): Field[] =>
  fields.map((field) => {
    const f = { ...field } as Record<string, unknown>;
    const name = typeof f.name === 'string' ? f.name : undefined;
    if (f.label === undefined && name && FIELD_LABELS[name]) f.label = FIELD_LABELS[name];
    else f.label = split(f.label);
    if (f.admin && typeof f.admin === 'object') {
      const admin = { ...(f.admin as Record<string, unknown>) };
      admin.description = split(admin.description);
      f.admin = admin;
    }
    if (Array.isArray(f.fields)) f.fields = relabelFields(f.fields as Field[]);
    if (Array.isArray(f.tabs)) {
      f.tabs = (f.tabs as Array<Record<string, unknown>>).map((tab) => {
        const tabName = typeof tab.name === 'string' ? tab.name : undefined;
        const tabLabel = tab.label === undefined && tabName && FIELD_LABELS[tabName] ? FIELD_LABELS[tabName] : split(tab.label);
        return { ...tab, label: tabLabel, fields: relabelFields(tab.fields as Field[]) };
      });
    }
    if (Array.isArray(f.blocks)) {
      f.blocks = (f.blocks as Array<Record<string, unknown>>).map((block) => ({
        ...block,
        labels: block.labels ?? BLOCK_LABELS[String(block.slug)],
        fields: relabelFields(block.fields as Field[]),
      }));
    }
    if (Array.isArray(f.options)) {
      f.options = (f.options as unknown[]).map((o) => (o && typeof o === 'object' ? { ...(o as object), label: split((o as { label?: unknown }).label) } : o));
    }
    return f as unknown as Field;
  });

const relabelAdmin = (admin: unknown): unknown => {
  if (!admin || typeof admin !== 'object') return admin;
  const a = { ...(admin as Record<string, unknown>) };
  a.group = split(a.group);
  a.description = split(a.description);
  return a;
};

/** The publish panel (rendered by publishedLocales) leads the sidebar. */
const publishPanelFirst = (fields: Field[]): Field[] => {
  const i = fields.findIndex((f) => (f as { name?: string }).name === 'publishedLocales');
  return i <= 0 ? fields : [fields[i]!, ...fields.slice(0, i), ...fields.slice(i + 1)];
};

/** Payload plugin: one-language admin wording, Arabic labels for every field. */
export const adminLabels = (config: Config): Config => ({
  ...config,
  collections: (config.collections ?? []).map((c) => {
    const labels = c.labels as { singular?: unknown; plural?: unknown } | undefined;
    return {
      ...c,
      labels: labels ? { singular: split(labels.singular), plural: split(labels.plural) } : COLLECTION_LABELS[c.slug],
      admin: relabelAdmin(c.admin),
      fields: relabelFields(publishPanelFirst(c.fields)),
    } as typeof c;
  }),
  globals: (config.globals ?? []).map((g) => ({
    ...g,
    label: split(g.label),
    admin: relabelAdmin(g.admin),
    fields: relabelFields(g.fields),
  }) as typeof g),
});
