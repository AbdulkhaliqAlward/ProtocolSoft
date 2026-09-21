/** Social links (Phase 2 §5.3.5): platform, URL, visibility, ordering. */
import type { CollectionConfig } from 'payload';

import { requireCapability } from '../access/roles.js';
import { auditAfterChange } from '../utilities/audit.js';

export const SocialLinks: CollectionConfig = {
  slug: 'social-links',
  labels: { singular: 'رابط اجتماعي / Social link', plural: 'روابط التواصل / Social Links' },
  admin: { group: 'المحتوى / Content', useAsTitle: 'platform', defaultColumns: ['platform', 'url', 'visible', 'sortOrder'] },
  access: {
    read: requireCapability('content_edit'),
    create: requireCapability('settings_manage'),
    update: requireCapability('settings_manage'),
    delete: requireCapability('settings_manage'),
  },
  fields: [
    {
      name: 'platform',
      type: 'select',
      required: true,
      options: ['linkedin', 'x', 'instagram', 'facebook', 'youtube', 'whatsapp', 'github', 'other'].map((value) => ({ label: value, value })),
    },
    { name: 'label', type: 'text', localized: true },
    { name: 'url', type: 'text', required: true, validate: (value: unknown) => (typeof value === 'string' && value.startsWith('https://') ? true : 'must be an https:// URL') },
    { name: 'visible', type: 'checkbox', defaultValue: true },
    { name: 'sortOrder', type: 'number', required: true, defaultValue: 100 },
  ],
  hooks: { afterChange: [auditAfterChange()] },
  timestamps: true,
};
