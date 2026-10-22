/**
 * Services (Phase 2 §5.2.1): the three confirmed commercial services.
 * Drafts/versions + per-locale publishing via publishedLocales (server-validated).
 */
import type { CollectionConfig } from 'payload';

import { requireCapability } from '../access/roles';
import { auditAfterChange } from '../utilities/audit';
import { revalidateOnPublish } from '../utilities/revalidate';

const contentAccess = {
  read: requireCapability('content_edit'),
  create: requireCapability('content_edit'),
  update: requireCapability('content_edit'),
  delete: requireCapability('content_edit'),
  readVersions: requireCapability('content_edit'),
  restoreVersion: requireCapability('content_edit'),
};

export const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'خدمة / Service', plural: 'الخدمات / Services' },
  admin: {
    group: 'المحتوى / Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'sortOrder', '_status'],
  },
  access: contentAccess,
  versions: { drafts: { autosave: { interval: 1500 } }, maxPerDoc: 50 },
  hooks: { afterChange: [auditAfterChange(), revalidateOnPublish('services')] },
  fields: [
    { name: 'slug', type: 'text', required: true, unique: true, index: true, admin: { description: 'latin-slug only: custom-software · digital-products · cybersecurity' } },
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'heroHeadline', type: 'text', required: true, localized: true },
    { name: 'heroSubhead', type: 'text', localized: true },
    {
      name: 'icon',
      type: 'select',
      options: ['code', 'layers', 'shield', 'gauge', 'workflow', 'server'].map((v) => ({ label: v, value: v })),
    },
    { name: 'summary', type: 'textarea', required: true, localized: true, maxLength: 200 },
    { name: 'overview', type: 'richText', required: true, localized: true },
    {
      name: 'deliverables',
      type: 'array',
      required: true,
      localized: true,
      minRows: 1,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
      ],
    },
    {
      name: 'engagementFacts',
      type: 'array',
      localized: true,
      maxRows: 5,
      admin: { description: 'حقائق الارتباط في رأس الصفحة (النوع، المدة، ما تستلمه…) / engagement facts shown in the hero (type, duration, what you receive…)' },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'value', type: 'text', required: true },
      ],
    },
    {
      name: 'notIncluded',
      type: 'array',
      localized: true,
      admin: { description: 'ما لا يشمله هذا الارتباط (يُعرض بجانب المخرجات؛ يُخفى القسم إن كان فارغاً) / what this engagement does not cover (hidden when empty)' },
      fields: [
        { name: 'item', type: 'text', required: true },
      ],
    },
    {
      name: 'capabilityGroups',
      type: 'array',
      localized: true,
      maxRows: 4,
      admin: { description: 'القدرات مجمّعة حسب المرحلة (قبل / أثناء / بعد) / capabilities grouped by stage' },
      fields: [
        { name: 'stage', type: 'text', required: true, admin: { description: 'e.g. قبل / Before' } },
        { name: 'title', type: 'text', required: true },
        { name: 'items', type: 'array', minRows: 1, fields: [{ name: 'label', type: 'text', required: true }] },
      ],
    },
    { name: 'capabilities', type: 'text', hasMany: true, localized: true, admin: { description: 'قائمة بسيطة تُستخدم فقط عند غياب المجموعات / flat list, used only when no capability groups exist' } },
    {
      name: 'processSteps',
      type: 'array',
      required: true,
      localized: true,
      minRows: 1,
      admin: { description: 'كل خطوة: ما نحتاجه منك وما تستلمه منا / each step: what we need from you, what you receive' },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'clientProvides', type: 'text', admin: { description: 'منك / you provide' } },
        { name: 'weDeliver', type: 'text', admin: { description: 'منّا / we deliver' } },
      ],
    },
    {
      name: 'faqs',
      type: 'array',
      localized: true,
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
    {
      name: 'relatedProjects',
      type: 'relationship',
      relationTo: 'case-studies',
      hasMany: true,
      admin: { description: 'يُقيَّد عامياً على المشاريع التي تجتاز بوابة الجاهزية / filtered to gate-passing projects at render' },
    },
    {
      name: 'initiativeSection',
      type: 'group',
      admin: { description: 'بطاقة مبادرة تقنية — تُعرض بالصياغة المعتمدة فقط / initiative card — approved wording only (D2)' },
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: false },
        { name: 'heading', type: 'text', localized: true },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', localized: true, maxLength: 60 },
        { name: 'description', type: 'textarea', localized: true, maxLength: 160 },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
        { name: 'noindex', type: 'checkbox', defaultValue: false },
      ],
    },
    { name: 'sortOrder', type: 'number', required: true, defaultValue: 100 },
    { name: 'archivedAt', type: 'date', admin: { position: 'sidebar' } },
    {
      name: 'publishedLocales',
      type: 'select',
      hasMany: true,
      options: [{ label: 'ar', value: 'ar' }, { label: 'en', value: 'en' }],
      access: { update: () => false, create: () => false }, // server-mutated only (publish endpoint)
      admin: { readOnly: true, position: 'sidebar', description: 'تُضبط عبر إجراء النشر لكل لغة / set via per-locale publish actions' },
    },
  ],
  timestamps: true,
};
