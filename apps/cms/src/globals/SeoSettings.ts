/** SEO settings (Phase 2 §5.1.5): templates valid in both languages; sitemap covers the public domain only. */
import type { GlobalConfig } from 'payload';

import { requireCapability } from '../access/roles.js';
import { auditGlobalChange } from '../utilities/audit.js';
import { revalidateGlobal } from '../utilities/revalidate.js';

export const SeoSettings: GlobalConfig = {
  slug: 'seo-settings',
  label: 'إعدادات SEO / SEO Settings',
  admin: { group: 'الإعدادات / Settings' },
  access: { read: requireCapability('content_edit'), update: requireCapability('settings_manage') },
  hooks: { afterChange: [auditGlobalChange('settings_changed'), revalidateGlobal('seo-settings')] },
  fields: [
    {
      name: 'titleTemplate',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Valid: "%s | بروتوكول سوفت" / "%s | Protocol Soft"' },
    },
    { name: 'defaultDescription', type: 'textarea', localized: true, maxLength: 160 },
    { name: 'defaultOgImage', type: 'upload', relationTo: 'media' },
    {
      name: 'canonicalDomain',
      type: 'text',
      required: true,
      defaultValue: 'https://protosoftdev.com',
      admin: { description: 'display-only; DNS/SSL stay with registrar/hosting (Phase 1 §10.9)' },
    },
    {
      name: 'sitemapIncludes',
      type: 'select',
      hasMany: true,
      defaultValue: ['home', 'services', 'case-studies', 'pages'],
      options: ['home', 'services', 'case-studies', 'pages', 'team'].map((value) => ({ label: value, value })),
      admin: { description: 'public domain only — admin.protosoftdev.com is NEVER sitemapped or indexed' },
    },
  ],
};
