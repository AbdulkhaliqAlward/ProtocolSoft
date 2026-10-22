/** Redirects (Phase 2 §5.3.6): launch safety net. */
import type { CollectionConfig } from 'payload';

import { requireCapability, roleOf } from '../access/roles';
import { auditAfterChange } from '../utilities/audit';

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  labels: { singular: 'تحويل / Redirect', plural: 'التحويلات / Redirects' },
  admin: { group: 'متقدم / Advanced', hidden: ({ user }) => roleOf(user) !== 'super_admin', useAsTitle: 'from', defaultColumns: ['from', 'to', 'statusCode', 'active'] },
  access: {
    read: requireCapability('content_edit'),
    create: requireCapability('settings_manage'),
    update: requireCapability('settings_manage'),
    delete: requireCapability('settings_manage'),
  },
  fields: [
    { name: 'from', type: 'text', required: true, unique: true, index: true, admin: { description: 'leading slash' } },
    { name: 'to', type: 'text', required: true },
    { name: 'statusCode', type: 'select', defaultValue: '301', options: ['301', '302', '307', '308'].map((value) => ({ label: value, value })) },
    { name: 'active', type: 'checkbox', defaultValue: true },
  ],
  hooks: { afterChange: [auditAfterChange()] },
  timestamps: true,
};
