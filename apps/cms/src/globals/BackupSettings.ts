/**
 * Backup settings (Phase 2 §5.1.7 + BD1): the operational-control global.
 * Automated backups are DISABLED by default. Super Admin-only read/update
 * (server-enforced). The dashboard control plane never exposes or edits
 * encryption keys, PostgreSQL credentials, R2/storage credentials, bucket
 * details, or server paths — only a non-sensitive destination status label.
 * Restore does not exist anywhere in this model.
 */
import type { GlobalConfig } from 'payload';

import { requireCapability } from '../access/roles.js';
import { auditGlobalChange } from '../utilities/audit.js';

export const BackupSettings: GlobalConfig = {
  slug: 'backup-settings',
  label: 'النسخ الاحتياطي / Backup & Recovery',
  admin: {
    group: 'النظام / System',
    description:
      'التحكم بالجدولة والطلبات فقط — لا مفاتيح ولا مسارات ولا بيانات اعتماد في اللوحة أبداً / scheduling & requests only — never keys, paths, or credentials (BD1)',
  },
  access: {
    read: requireCapability('backup_control'), // Super Admin ONLY (BD1)
    update: requireCapability('backup_control'),
  },
  fields: [
    {
      name: 'scheduleEnabled',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      admin: { description: 'CONFIRMED: automated backups are disabled by default (BD1)' },
    },
    {
      name: 'schedule',
      type: 'group',
      fields: [
        { name: 'frequency', type: 'select', defaultValue: 'daily', required: true, options: [{ label: 'daily', value: 'daily' }] },
        { name: 'time', type: 'text', defaultValue: '03:00', admin: { description: 'server time HH:mm' } },
      ],
    },
    {
      name: 'destinationStatus',
      type: 'select',
      required: true,
      defaultValue: 'not_configured',
      admin: {
        readOnly: true,
        description: 'non-sensitive label ONLY — the provider/bucket/path/keys live in server env and are never rendered',
      },
      options: [
        { label: 'not_configured', value: 'not_configured' },
        { label: 'configured', value: 'configured' },
      ],
    },
    {
      name: 'retentionTarget',
      type: 'group',
      admin: { description: 'confirmed targets (informational; enforced by the runner)' },
      fields: [
        { name: 'dailyCopies', type: 'number', defaultValue: 30, admin: { readOnly: true } },
        { name: 'monthlyCopies', type: 'number', defaultValue: 12, admin: { readOnly: true } },
      ],
    },
    { name: 'manualRequestAt', type: 'date', admin: { readOnly: true, position: 'sidebar' } },
  ],
};
