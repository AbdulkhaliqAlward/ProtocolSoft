/**
 * Generic pages (Phase 2 §5.2.5): about / privacy / terms.
 * Legal pages carry the two-key gate (Super Admin-only review sign-off + publish)
 * and the confirmed draft-template labeling (LD1) until Protocol Soft finalizes.
 */
import type { CollectionConfig } from 'payload';

import { requireCapability, requireCapabilityForField } from '../access/roles.js';
import { auditAfterChange } from '../utilities/audit.js';
import { revalidateOnPublish } from '../utilities/revalidate.js';

const LEGAL_SLUGS = ['privacy', 'terms'];

const contentAccess = {
  read: requireCapability('content_edit'),
  create: requireCapability('content_edit'),
  update: requireCapability('content_edit'),
  delete: requireCapability('content_publish'), // pages deletion is a publishing-level action
  readVersions: requireCapability('content_edit'),
  restoreVersion: requireCapability('content_edit'),
};

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'صفحة / Page', plural: 'الصفحات / Pages' },
  admin: {
    group: 'المحتوى / Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status'],
  },
  access: contentAccess,
  versions: { drafts: { autosave: { interval: 1500 } }, maxPerDoc: 50 },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        const d = data as Record<string, unknown> | undefined;
        if (d && LEGAL_SLUGS.includes(String(d.slug))) {
          d.legalReviewRequired = true;
          if (d.contentOrigin == null) d.contentOrigin = 'draft_template';
        }
        return d;
      },
    ],
    afterChange: [auditAfterChange(), revalidateOnPublish('pages')],
  },
  fields: [
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'blocks',
      type: 'blocks',
      required: true,
      localized: true,
      minRows: 1,
      blocks: [
        {
          slug: 'contentRichText',
          fields: [{ name: 'content', type: 'richText', required: true }],
        },
        {
          slug: 'featureGrid',
          fields: [
            { name: 'heading', type: 'text' },
            {
              name: 'items',
              type: 'array',
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'description', type: 'text' },
              ],
            },
          ],
        },
        {
          slug: 'faqAccordion',
          fields: [
            {
              name: 'faqs',
              type: 'array',
              fields: [
                { name: 'question', type: 'text', required: true },
                { name: 'answer', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          slug: 'ctaBanner',
          fields: [
            { name: 'heading', type: 'text', required: true },
            { name: 'body', type: 'text' },
            { name: 'ctaLabel', type: 'text' },
            { name: 'ctaTarget', type: 'text' },
          ],
        },
        {
          slug: 'mediaText',
          fields: [
            { name: 'image', type: 'upload', relationTo: 'media', required: true },
            { name: 'text', type: 'richText' },
            { name: 'layout', type: 'select', defaultValue: 'image_start', options: [{ label: 'image start', value: 'image_start' }, { label: 'image end', value: 'image_end' }] },
          ],
        },
      ],
    },
    { name: 'inNav', type: 'checkbox', defaultValue: false },
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
    {
      name: 'legalReviewRequired',
      type: 'checkbox',
      defaultValue: false,
      access: { update: () => false, create: () => false }, // auto-set for privacy/terms
      admin: { readOnly: true, position: 'sidebar', description: 'تُضبط تلقائياً لصفحات privacy/terms' },
    },
    {
      name: 'contentOrigin',
      type: 'select',
      defaultValue: 'draft_template',
      admin: { position: 'sidebar', description: 'draft_template = مسودة نموذجية تنتظر مراجعة Protocol Soft النهائية' },
      options: [
        { label: 'Draft template (مسودة نموذجية)', value: 'draft_template' },
        { label: 'Final (نهائي)', value: 'final' },
      ],
      access: { update: requireCapabilityForField('users_manage'), create: requireCapabilityForField('users_manage') }, // Super Admin only (LD1)
    },
    {
      name: 'legalReviewedBy',
      type: 'text',
      access: { update: requireCapabilityForField('users_manage'), create: requireCapabilityForField('users_manage') }, // Super Admin only
      admin: { position: 'sidebar', readOnly: false },
    },
    { name: 'legalReviewedAt', type: 'date', access: { update: requireCapabilityForField('users_manage'), create: requireCapabilityForField('users_manage') }, admin: { position: 'sidebar' } },
    {
      name: 'legalApprovalRef',
      type: 'text',
      access: { update: requireCapabilityForField('users_manage'), create: requireCapabilityForField('users_manage') },
      admin: { position: 'sidebar', description: 'مرجع مستند/تذكرة/مراجع خارجي / internal doc, ticket, or external reviewer reference' },
    },
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

export const isLegalPage = (slug: string): boolean => LEGAL_SLUGS.includes(slug);
