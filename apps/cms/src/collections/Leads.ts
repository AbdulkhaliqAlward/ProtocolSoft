/**
 * Leads (Phase 2 §5.3.3 + §7): created ONLY through the internal lead endpoint
 * (validated, honeypot, rate-limited, ipHash — raw IPs never stored). Internal
 * notes are admin-only and never leave the CMS.
 */
import type { CollectionConfig } from 'payload';

import { requireCapability, roleOf } from '../access/roles.js';
import { hasCapability } from '@protocol-soft/shared';
import { writeAudit } from '../utilities/audit.js';

const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost', 'archived'] as const;

export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'طلب تواصل / Lead', plural: 'طلبات التواصل / Leads' },
  admin: {
    group: 'طلبات التواصل / Leads',
    useAsTitle: 'referenceCode',
    defaultColumns: ['referenceCode', 'fullName', 'serviceInterest', 'sourceLocale', 'status', 'assignedTo', 'submittedAt'],
  },
  access: {
    create: () => false, // internal endpoint only (overrideAccess)
    read: requireCapability('leads_manage'),
    update: requireCapability('leads_manage'),
    delete: requireCapability('users_manage'), // prefer archive status; delete = Super Admin only
    admin: ({ req }) => Boolean(hasCapability(roleOf(req.user), 'leads_manage')),
  },
  fields: [
    { name: 'referenceCode', type: 'text', required: true, unique: true, index: true, admin: { readOnly: true } },
    { name: 'fullName', type: 'text', required: true, maxLength: 120 },
    { name: 'company', type: 'text', maxLength: 120 },
    { name: 'email', type: 'email', required: true, index: true },
    { name: 'phone', type: 'text' },
    {
      name: 'serviceInterest',
      type: 'select',
      required: true,
      // NO EDR option (D2) — the initiative is not an available service.
      options: [
        { label: 'تطوير أنظمة مخصصة / Custom Software', value: 'custom_software' },
        { label: 'منتجات ومنصات رقمية / Digital Products', value: 'digital_products' },
        { label: 'أمن سيبراني / Cybersecurity', value: 'cybersecurity' },
        { label: 'استفسار عام / General', value: 'general' },
      ],
    },
    { name: 'message', type: 'textarea', required: true, maxLength: 2000 },
    { name: 'sourceLocale', type: 'select', required: true, options: [{ label: 'ar', value: 'ar' }, { label: 'en', value: 'en' }] },
    { name: 'pagePath', type: 'text' },
    { name: 'consent', type: 'checkbox', required: true, defaultValue: true },
    {
      name: 'ipHash',
      type: 'text',
      index: true,
      admin: { description: 'HMAC of IP — abuse analytics only; raw IP never stored' },
    },
    { name: 'submittedAt', type: 'date', required: true, defaultValue: () => new Date(), index: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      index: true,
      options: LEAD_STATUSES.map((value) => ({ label: value, value })),
    },
    { name: 'assignedTo', type: 'relationship', relationTo: 'users', index: true },
    {
      name: 'notes',
      type: 'array',
      admin: { description: 'ملاحظات داخلية — لا تُغادر النظام أبداً / internal only — never leaves the CMS' },
      fields: [
        { name: 'body', type: 'textarea', required: true, maxLength: 2000 },
        { name: 'author', type: 'relationship', relationTo: 'users' },
        { name: 'createdAt', type: 'date', defaultValue: () => new Date() },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        // Status-transition auditing (Phase 2 §7.6).
        if (originalDoc && data.status && data.status !== originalDoc.status) {
          await writeAudit(req, 'lead_status_changed', { collection: 'leads', id: originalDoc.id }, `status: ${originalDoc.status} → ${data.status}`);
        }
        return data;
      },
    ],
  },
  timestamps: false,
};
