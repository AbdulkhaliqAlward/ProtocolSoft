/**
 * Projects / Case Studies (Phase 2 §5.2.2 + v1.5 confirmed scope):
 * - Public scope for the delivery-platform study = product screenshots ONLY
 *   (post screenshot-review gate). Client identity, testimonials, commercial
 *   metrics, revenue claims, sensitive architecture, unapproved technologies:
 *   never published.
 * - Project Type field supports Client Project · Internal Product · Open Source
 *   Project · R&D Initiative (future use; NO public EDR detail page — D2).
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

export const CaseStudies: CollectionConfig = {
  slug: 'case-studies',
  labels: { singular: 'مشروع / Project', plural: 'المشاريع / Projects' },
  admin: {
    group: 'المحتوى / Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'projectType', 'client.approvalStatus', 'featured', '_status'],
  },
  access: contentAccess,
  versions: { drafts: { autosave: { interval: 1500 } }, maxPerDoc: 50 },
  hooks: { afterChange: [auditAfterChange(), revalidateOnPublish('case-studies')] },
  fields: [
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'projectType',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Client Project', value: 'client_project' },
        { label: 'Internal Product', value: 'internal_product' },
        { label: 'Open Source Project', value: 'open_source' },
        { label: 'Research & Development Initiative', value: 'rnd' },
      ],
    },
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'summary', type: 'textarea', required: true, localized: true, maxLength: 200 },
    { name: 'challenge', type: 'richText', required: true, localized: true },
    { name: 'solution', type: 'richText', required: true, localized: true },
    { name: 'capabilities', type: 'text', hasMany: true, localized: true },
    {
      name: 'outcomes',
      type: 'richText',
      localized: true,
      admin: { description: 'يبقى [PLACEHOLDER] حتى موافقة العميل — البوابة تمنع النشر / stays [PLACEHOLDER] until client approval' },
    },
    {
      name: 'technologies',
      type: 'text',
      hasMany: true,
      admin: { description: '[PLACEHOLDER] حتى موافقة العميل — غير منشورة / [PLACEHOLDER] until client approval — never published' },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'صورة غلاف عامة معتمدة أو مرئية مجردة غير حاملية للهوية / approved public cover or abstract non-identifying visual' },
    },
    {
      name: 'screenshots',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description:
          'لقطات المنتج — يجب أن تكون مصنّفة سحابياً screened_approved قبل أي ظهور عام (بوابة الفحص) / product screenshots — must be sensitivity-screened before ANY public display',
      },
    },
    {
      name: 'client',
      type: 'group',
      fields: [
        { name: 'name', type: 'text', admin: { description: '[PLACEHOLDER] — لا يُنشر أبداً بموافقة pending' } },
        { name: 'logo', type: 'upload', relationTo: 'media' },
        { name: 'nameVisible', type: 'checkbox', defaultValue: false },
        { name: 'logoVisible', type: 'checkbox', defaultValue: false },
        {
          name: 'approvalStatus',
          type: 'select',
          required: true,
          defaultValue: 'pending',
          index: true,
          options: [
            { label: 'pending', value: 'pending' },
            { label: 'approved_restricted', value: 'approved_restricted' },
            { label: 'approved_full', value: 'approved_full' },
          ],
        },
        { name: 'approvalDate', type: 'date' },
        { name: 'approvalRef', type: 'text', admin: { description: 'مرجع الموافقة الخطية / written approval reference' } },
      ],
    },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { description: 'الصفحة الرئيسية تعرضه فقط إذا اجتاز بوابة الجاهزية' } },
    {
      name: 'timeline',
      type: 'group',
      fields: [
        { name: 'startDate', type: 'date' },
        { name: 'endDate', type: 'date' },
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
