/**
 * Audit logs (Phase 2 §13): system-written only (hooks + internal endpoints via
 * overrideAccess). Read: Super Admin (full) / Content Manager (read).
 * Retention 24 months (confirmed default) — purge job lands with Phase 8 ops tooling.
 */
import type { CollectionConfig } from 'payload';

import { requireCapability, systemWriteOnly } from '../access/roles.js';

export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  admin: {
    group: 'النظام / System',
    defaultColumns: ['eventTime', 'eventType', 'actorLabel', 'entityCollection', 'changesSummary'],
    description: 'سجل تدقيق للعمليات الحساسة — يُكتب تلقائياً فقط / Audit trail — system-written only',
  },
  access: {
    create: systemWriteOnly, // system hooks only (Local API overrideAccess)
    read: requireCapability('audit_read'),
    update: () => false,
    delete: () => false, // retention purge is a controlled ops procedure
  },
  fields: [
    { name: 'eventTime', type: 'date', required: true, admin: { date: { displayFormat: 'yyyy-MM-dd HH:mm:ss' } } },
    { name: 'actor', type: 'relationship', relationTo: 'users', index: true },
    { name: 'actorLabel', type: 'text', admin: { readOnly: true } }, // email/label — no raw IPs
    {
      name: 'eventType',
      type: 'select',
      required: true,
      index: true,
      options: [
        'login_success', 'login_failure', 'logout', 'password_reset_requested', 'password_reset_completed',
        'user_created', 'user_updated', 'user_disabled', 'role_changed',
        'draft_saved', 'publish', 'unpublish', 'revert',
        'settings_changed', 'theme_changed', 'theme_reset',
        'media_uploaded', 'media_deleted', 'media_archived', 'media_screening_changed',
        'lead_created', 'lead_status_changed', 'lead_exported',
        'backup_schedule_changed', 'backup_requested', 'backup_completed', 'backup_failed',
        'backup_verification_required', 'backup_verified', 'backup_config_changed',
        'legal_content_confirmed', 'break_glass_used',
      ].map((value) => ({ label: value, value })),
    },
    { name: 'entityCollection', type: 'text' },
    { name: 'entityId', type: 'text' },
    { name: 'entitySlug', type: 'text' },
    { name: 'entityLocale', type: 'text' },
    {
      name: 'changesSummary',
      type: 'textarea',
      admin: { description: 'ملخص مطهر — لا أسرار ولا عناوين IP / sanitized — no secrets, no raw IPs' },
    },
  ],
  timestamps: false,
};
