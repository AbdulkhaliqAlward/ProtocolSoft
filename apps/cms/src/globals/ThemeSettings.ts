/**
 * Theme settings (Phase 5 visual revision of Phase 2 §5.1.2 + §11).
 *
 * Token allowlist model, now enforced structurally: the approved semantic token
 * sets are fixed in code ("Professional Ink & Stone" light/dark, v1); the CMS
 * exposes ONLY controlled variants — no raw hex color editing is possible, so
 * contrast/brand consistency cannot be broken from the admin UI.
 * - colorPreset selects the approved token set (single approved set today; the
 *   list is extensible only via approved code changes).
 * - defaultMode feeds the public theme-selection flow: stored choice → OS
 *   preference → 'light' fallback (the web implements this flow; 'system'
 *   honors the OS preference first).
 * - buttonStyle / borderRadius / animationsEnabled remain controlled variants.
 *
 * Unchanged from Phase 2/4: role restriction (theme_manage), audit logging
 * (theme_changed), and revalidation webhook.
 */
import type { GlobalConfig } from 'payload';

import { requireCapability } from '../access/roles.js';
import { auditGlobalChange } from '../utilities/audit.js';
import { revalidateGlobal } from '../utilities/revalidate.js';

export const COLOR_PRESETS = ['ink_stone_v1'] as const;

export const ThemeSettings: GlobalConfig = {
  slug: 'theme-settings',
  label: 'الهوية البصرية / Theme Tokens',
  admin: { group: 'الإعدادات / Settings' },
  access: { read: requireCapability('content_edit'), update: requireCapability('theme_manage') },
  hooks: { afterChange: [auditGlobalChange('theme_changed'), revalidateGlobal('theme')] },
  fields: [
    {
      name: 'colorPreset',
      type: 'select',
      required: true,
      defaultValue: 'ink_stone_v1',
      label: 'مجموعة الألوان المعتمدة / Approved color preset',
      options: COLOR_PRESETS.map((value) => ({
        label: `${value} — Professional Ink & Stone (light + dark)`,
        value,
      })),
    },
    {
      name: 'defaultMode',
      type: 'select',
      required: true,
      defaultValue: 'system',
      label: 'الوضع الافتراضي / Default mode',
      options: [
        { label: 'system — يتبع تفضيل النظام (افتراضي فاتح)', value: 'system' },
        { label: 'light', value: 'light' },
        { label: 'dark', value: 'dark' },
      ],
    },
    { name: 'buttonStyle', type: 'select', required: true, defaultValue: 'filled', options: ['filled', 'outline', 'soft'].map((value) => ({ label: value, value })) },
    { name: 'borderRadius', type: 'select', required: true, defaultValue: 'md', options: ['sm', 'md', 'lg', 'full'].map((value) => ({ label: value, value })) },
    { name: 'animationsEnabled', type: 'checkbox', required: true, defaultValue: true },
  ],
};
