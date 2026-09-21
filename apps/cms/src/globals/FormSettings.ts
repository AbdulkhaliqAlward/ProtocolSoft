/**
 * Form settings (Phase 2 §5.1.6): confidential — recipients, rate limits,
 * auto-responder, retention NEVER leave the CMS. The only public-safe subset
 * (confirmationMessage + public channels) is served via /internal/content/contact-config.
 */
import type { GlobalConfig } from 'payload';

import { requireCapability } from '../access/roles.js';
import { auditGlobalChange } from '../utilities/audit.js';

export const FormSettings: GlobalConfig = {
  slug: 'form-settings',
  label: 'إعدادات النماذج / Form Settings',
  admin: { group: 'الإعدادات / Settings' },
  access: { read: requireCapability('settings_manage'), update: requireCapability('settings_manage') },
  hooks: { afterChange: [auditGlobalChange('settings_changed')] },
  fields: [
    {
      name: 'notificationRecipients',
      type: 'json',
      admin: { description: 'للاستخدام الداخلي فقط — لا يُعرض عاماً أبداً / internal only — never exposed publicly. JSON array of email strings.' },
    },
    { name: 'confirmationMessage', type: 'textarea', required: true, localized: true },
    {
      name: 'rateLimits',
      type: 'group',
      admin: { description: 'CMS-side enforcement; the web service uses its own env-configured limits (§6.6)' },
      fields: [
        { name: 'perIpPerHour', type: 'number', required: true, defaultValue: 5 },
        { name: 'perIpPerDay', type: 'number', required: true, defaultValue: 20 },
        { name: 'perServicePerMinute', type: 'number', required: true, defaultValue: 30 },
      ],
    },
    { name: 'autoResponderEnabled', type: 'checkbox', defaultValue: false, admin: { description: 'enabled only after deliverability is verified' } },
    { name: 'retentionMonths', type: 'number', required: true, defaultValue: 12, admin: { description: 'confirmed: 12 months, then archive/delete per policy' } },
  ],
};
