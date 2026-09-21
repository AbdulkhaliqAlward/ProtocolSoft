/**
 * Team members (Phase 2 §5.2.4 + D6): full CMS capability built; the public team
 * section renders nothing while `visible` is false (default) — content + photos
 * are pending.
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

export const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  labels: { singular: 'عضو فريق / Member', plural: 'الفريق / Team' },
  admin: {
    group: 'المحتوى / Content',
    useAsTitle: 'name',
    defaultColumns: ['name', 'jobTitle', 'visible', 'sortOrder'],
    description: 'قسم الفريق مخفي افتراضياً حتى توفر المحتوى والصور / team section hidden by default until content is ready (D6)',
  },
  access: contentAccess,
  versions: { drafts: { autosave: { interval: 1500 } }, maxPerDoc: 50 },
  hooks: { afterChange: [auditAfterChange(), revalidateOnPublish('team-members')] },
  fields: [
    { name: 'name', type: 'text', required: true }, // names are not localized
    { name: 'jobTitle', type: 'text', required: true, localized: true },
    { name: 'bio', type: 'richText', localized: true },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      admin: { condition: () => true, description: 'صورة مهنية — تصنيف team / professional photo — category team' },
    },
    { name: 'linkedinUrl', type: 'text' },
    { name: 'visible', type: 'checkbox', required: true, defaultValue: false, admin: { position: 'sidebar' } },
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
