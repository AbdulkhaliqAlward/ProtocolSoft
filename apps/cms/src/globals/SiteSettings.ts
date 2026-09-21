/** Site settings (Phase 2 §5.1.1). WhatsApp: configurable; empty in production => availability-state CTA (WA1). */
import type { GlobalConfig } from 'payload';

import { requireCapability } from '../access/roles.js';
import { auditGlobalChange } from '../utilities/audit.js';
import { revalidateGlobal } from '../utilities/revalidate.js';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'إعدادات الموقع / Site Settings',
  admin: { group: 'الإعدادات / Settings' },
  access: { read: requireCapability('content_edit'), update: requireCapability('settings_manage') },
  hooks: { afterChange: [auditGlobalChange('settings_changed'), revalidateGlobal('site-settings')] },
  fields: [
    { name: 'companyName', type: 'text', required: true, localized: true },
    { name: 'legalCompanyName', type: 'text', localized: true },
    { name: 'description', type: 'textarea', localized: true, maxLength: 300 },
    { name: 'tagline', type: 'text', localized: true },
    // Leave empty until Protocol Soft supplies the official address (§6.9); the
    // public contact-config exposes an explicit empty state (WA1-style) when unset.
    { name: 'emailMain', type: 'email' },
    { name: 'emailSales', type: 'email' },
    { name: 'emailSupport', type: 'email' },
    { name: 'phone', type: 'text' },
    {
      name: 'whatsappNumber',
      type: 'text',
      validate: (value: unknown) => (value == null || value === '' || /^\+?[0-9\s\-()]{7,20}$/.test(String(value)) ? true : 'invalid phone format'),
      admin: {
        description:
          'بصيغة دولية بدون رموز — يُترك فارغاً في الإنتاج حتى توفر القيمة الرسمية؛ الـ CTA يعرض رسالة التوفر بدلاً من التوجيه لرقم وهمي (WA1) / E.164-ish digits; leave EMPTY in production until the official number exists — the CTA then shows the availability message (WA1)',
      },
    },
    { name: 'addressLine', type: 'text', localized: true },
    { name: 'city', type: 'text' },
    { name: 'country', type: 'text' },
    { name: 'workingHours', type: 'textarea', localized: true },
    { name: 'googleMapsUrl', type: 'text' },
    {
      name: 'seoDomain',
      type: 'text',
      required: true,
      defaultValue: 'protosoftdev.com',
      admin: { description: 'display-only — real DNS/SSL stays with the registrar (Phase 1 §10.9)' },
    },
    { name: 'footerCopyright', type: 'text', required: true, localized: true, admin: { description: 'supports {year}' } },
    { name: 'logoDark', type: 'upload', relationTo: 'media' },
    { name: 'logoLight', type: 'upload', relationTo: 'media' },
    { name: 'favicon', type: 'upload', relationTo: 'media' },
    { name: 'defaultOgImage', type: 'upload', relationTo: 'media' },
  ],
};
