/**
 * Services (Phase 2 §5.2.1): the three confirmed commercial services.
 * Drafts/versions + per-locale publishing via publishedLocales (server-validated).
 */
import type { CollectionConfig } from 'payload';

import { requireCapability } from '../access/roles.js';
import { auditAfterChange } from '../utilities/audit.js';
import { revalidateOnPublish } from '../utilities/revalidate.js';

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
    { name: 'capabilities', type: 'text', hasMany: true, localized: true },
    {
      name: 'processSteps',
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
