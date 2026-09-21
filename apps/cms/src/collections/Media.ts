/**
 * Media (Phase 2 §12): public/private visibility, bilingual alt text, categories,
 * SVG sanitization (logos only), and — from v1.5 — the screenshot sensitivity
 * screening that feeds the Public Readiness Gate (CS1).
 */
import type { CollectionConfig } from 'payload';

import { requireCapability } from '../access/roles.js';
import { auditAfterChange, auditAfterDelete, writeAudit } from '../utilities/audit.js';
import { sanitizeSvg } from '../utilities/sanitize.js';

const CATEGORIES = ['logos', 'og-images', 'team', 'projects', 'initiatives', 'content', 'documents'] as const;

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'ملف / Media', plural: 'الوسائط / Media Library' },
  admin: {
    group: 'الوسائط / Media',
    defaultColumns: ['filename', 'category', 'visibility', 'altText'],
  },
  access: {
    read: requireCapability('content_edit'), // admin reads; public delivery is a web-side concern
    create: requireCapability('media_upload'),
    update: requireCapability('media_upload'),
    delete: requireCapability('media_delete'), // reference-checked archive-first rule at UI level
  },
  upload: {
    staticDir: process.env.MEDIA_STATIC_DIR ?? 'media',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf'],
    imageSizes: [
      { name: 'thumb', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 800, height: 600, position: 'centre' },
      { name: 'hero', width: 1920, height: 1080, position: 'centre' },
    ],
    adminThumbnail: 'thumb',
    // PDFs and project screenshots default to private (handled in beforeValidate below)
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        const d = data as Record<string, unknown> | undefined;
        if (d) {
          const category = String(d.category ?? 'content');
          if (d.visibility == null) {
            d.visibility = category === 'documents' || category === 'projects' ? 'private' : 'public';
          }
        }
        return d;
      },
    ],
    beforeChange: [
      async ({ req, data }) => {
        const d = data as Record<string, unknown>;
        // SVG accepted ONLY for the logos category, sanitized before storage (Phase 2 §12).
        if (req.file && req.file.mimetype === 'image/svg+xml') {
          if (String(d?.category ?? '') !== 'logos') {
            throw new Error('SVG uploads are restricted to the logos category');
          }
          const sanitized = sanitizeSvg(req.file.data.toString('utf8'));
          req.file.data = Buffer.from(sanitized, 'utf8');
        }
        // Size ceilings: images ≤ 8 MB, PDF ≤ 20 MB (Phase 2 §12).
        if (req.file) {
          const isPdf = req.file.mimetype === 'application/pdf';
          const max = isPdf ? 20 * 1024 * 1024 : 8 * 1024 * 1024;
          if (req.file.size > max) throw new Error(`File exceeds the ${isPdf ? 20 : 8} MB limit`);
        }
        return data;
      },
    ],
    afterChange: [
      auditAfterChange(),
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          await writeAudit(req, 'media_uploaded', { collection: 'media', id: doc.id }, `upload: ${doc.filename} (${String(doc.category)})`);
        }
        return doc;
      },
    ],
    afterDelete: [auditAfterDelete],
  },
  fields: [
    {
      name: 'altText',
      type: 'group',
      fields: [
        { name: 'ar', type: 'text', label: 'نص بديل (عربي)', localized: false },
        { name: 'en', type: 'text', label: 'Alt text (English)', localized: false },
      ],
      label: 'Alt text (AR/EN)',
    },
    { name: 'caption', type: 'text', localized: true },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'content',
      options: CATEGORIES.map((value) => ({ label: value, value })),
    },
    { name: 'tags', type: 'text', hasMany: true },
    {
      name: 'visibility',
      type: 'select',
      required: true,
      defaultValue: 'public',
      admin: { description: 'خاص = لا يُخدم عبر الـ API العام / private = never served via the public internal API' },
      options: [
        { label: 'public', value: 'public' },
        { label: 'private', value: 'private' },
      ],
    },
    {
      name: 'sensitivityScreening',
      type: 'group',
      label: 'فحص الحساسية / Sensitivity screening (CS1)',
      admin: { description: 'إلزامي للقطات شاشة المشاريع قبل أي عرض عام / required for project screenshots before ANY public display' },
      fields: [
        {
          name: 'status',
          type: 'select',
          defaultValue: 'unscreened',
          options: [
            { label: 'unscreened (لم يُفحص)', value: 'unscreened' },
            { label: 'pending (قيد الفحص)', value: 'pending' },
            { label: 'approved (مقبول)', value: 'approved' },
            { label: 'rejected (مرفوض)', value: 'rejected' },
          ],
          index: true,
        },
        { name: 'reviewedBy', type: 'text', admin: { readOnly: false } },
        { name: 'reviewedAt', type: 'date' },
        { name: 'notes', type: 'textarea' },
      ],
    },
    { name: 'focalX', type: 'number', hidden: true },
    { name: 'focalY', type: 'number', hidden: true },
  ],
  timestamps: true,
};
