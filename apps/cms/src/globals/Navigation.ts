/** Navigation (Phase 2 §5.1.3): header items + single CTA + footer columns. */
import type { GlobalConfig } from 'payload';

import { requireCapability } from '../access/roles.js';
import { auditGlobalChange } from '../utilities/audit.js';
import { revalidateGlobal } from '../utilities/revalidate.js';

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'القوائم / Navigation',
  admin: { group: 'الإعدادات / Settings' },
  access: { read: requireCapability('content_edit'), update: requireCapability('navigation_manage') },
  hooks: { afterChange: [auditGlobalChange('settings_changed'), revalidateGlobal('navigation')] },
  fields: [
    {
      type: 'array',
      name: 'headerItems',
      label: 'عناصر القائمة / Header items',
      fields: [
        { name: 'label', type: 'text', required: true, localized: true },
        { name: 'target', type: 'text', required: true, admin: { description: 'path e.g. /services/cybersecurity' } },
        { name: 'sortOrder', type: 'number', defaultValue: 100 },
        { name: 'visible', type: 'checkbox', defaultValue: true },
      ],
    },
    {
      type: 'group',
      name: 'headerCta',
      label: 'زر CTA / Header CTA',
      fields: [
        { name: 'label', type: 'text', required: true, localized: true },
        { name: 'target', type: 'text', required: true, defaultValue: '/contact' },
      ],
    },
    {
      type: 'array',
      name: 'footerColumns',
      label: 'أعمدة التذييل / Footer columns',
      fields: [
        { name: 'title', type: 'text', required: true, localized: true },
        {
          type: 'array',
          name: 'links',
          fields: [
            { name: 'label', type: 'text', required: true, localized: true },
            { name: 'target', type: 'text', required: true },
            { name: 'sortOrder', type: 'number', defaultValue: 100 },
          ],
        },
        { name: 'sortOrder', type: 'number', defaultValue: 100 },
      ],
    },
  ],
};
