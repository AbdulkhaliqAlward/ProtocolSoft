/**
 * Technical Initiatives (Phase 2 §5.2.3 + D2): the EDR open-source initiative
 * lives here — under active development, NOT a service, NOT a product.
 * Public exposure is limited to: title + status label «قيد التطوير / In Development»
 * + shortDescription (the approved wording). Links/visuals/roadmap are NEVER
 * included in public output unless status = available AND per-link approval.
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

export const TechnicalInitiatives: CollectionConfig = {
  slug: 'technical-initiatives',
  labels: { singular: 'مبادرة تقنية / Initiative', plural: 'المبادرات التقنية / Technical Initiatives' },
  admin: {
    group: 'المحتوى / Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'placements.cybersecurityCard', 'placements.homepageSection', '_status'],
    description:
      'إدارة المبادرات الداخلية (EDR) — لا صفحات تفصيلية عامة عند الإطلاق / internal initiatives — no public detail pages at launch (D2)',
  },
  access: contentAccess,
  versions: { drafts: { autosave: { interval: 1500 } }, maxPerDoc: 50 },
  hooks: { afterChange: [auditAfterChange(), revalidateOnPublish('technical-initiatives')] },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Open Source Initiative', value: 'open_source' },
        { label: 'Technical Initiative', value: 'technical' },
        { label: 'R&D', value: 'rnd' },
      ],
    },
    {
      name: 'status',
      dbName: 'initiative_status', // avoid clashing with the drafts _status column's enum_technical_initiatives_status
      type: 'select',
      required: true,
      defaultValue: 'in_development',
      index: true,
      admin: { description: 'التسمية الإلزامية عند in_development: «قيد التطوير» / "In Development"' },
      options: [
        { label: 'In Development (قيد التطوير)', value: 'in_development' },
        { label: 'Available (متاح)', value: 'available' },
        { label: 'Archived (مؤرشف)', value: 'archived' },
      ],
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      required: true,
      localized: true,
      maxLength: 400,
      admin: { description: 'الصياغة المعتمدة فقط عند الإطلاق / approved wording only at launch' },
    },
    {
      name: 'placements',
      type: 'group',
      fields: [
        { name: 'cybersecurityCard', type: 'checkbox', label: 'بطاقة صفحة الأمن السيبراني', defaultValue: true },
        { name: 'homepageSection', type: 'checkbox', label: 'قسم المبادرات بالصفحة الرئيسية', defaultValue: false },
      ],
    },
    {
      name: 'links',
      type: 'group',
      admin: { description: 'لا تُنشر إلا عند available + موافقة صريحة لكل رابط / published only when available AND per-link approval' },
      fields: [
        { name: 'github', type: 'text' },
        { name: 'githubApproved', type: 'checkbox', defaultValue: false },
        { name: 'docs', type: 'text' },
        { name: 'docsApproved', type: 'checkbox', defaultValue: false },
        { name: 'website', type: 'text' },
        { name: 'websiteApproved', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'visuals',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: { description: 'لا تُنشر — معطلة افتراضياً (D2) / never published — gated off (D2)' },
    },
    {
      name: 'roadmap',
      type: 'richText',
      admin: { description: 'محمي — يُنشر فقط بموافقة صريحة / reserved — published only with explicit approval' },
    },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    {
      name: 'publishedLocales',
      type: 'select',
      hasMany: true,
      options: [{ label: 'ar', value: 'ar' }, { label: 'en', value: 'en' }],
      access: { update: () => false, create: () => false },
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
  timestamps: true,
};
