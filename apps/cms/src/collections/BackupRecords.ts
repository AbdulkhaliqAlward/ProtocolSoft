/**
 * Backup records (Phase 2 §5.3.7 + BD1): system-written results of backup runs
 * (scheduled/manual). Non-sensitive fields ONLY — error summaries sanitized of
 * paths, hosts, credentials, and stack traces. Read: Super Admin only.
 * No restore concept exists anywhere in this collection.
 */
import type { CollectionConfig } from 'payload';

import { requireCapability, systemWriteOnly } from '../access/roles.js';

export const BackupRecords: CollectionConfig = {
  slug: 'backup-records',
  admin: {
    group: 'النظام / System',
    description: 'سجل النسخ الاحتياطية — نتائج فقط، بلا مفاتيح أو مسارات / backup results only — no keys or paths',
    defaultColumns: ['startedAt', 'type', 'status', 'verificationStatus', 'durationMs'],
  },
  access: {
    create: systemWriteOnly, // via backup report endpoint (BACKUP_REPORT_KEY) / Local API
    read: requireCapability('backup_control'),
    update: systemWriteOnly,
    delete: systemWriteOnly, // retention job only (30 daily + 12 monthly target)
  },
  fields: [
    { name: 'type', type: 'select', required: true, options: [{ label: 'scheduled', value: 'scheduled' }, { label: 'manual', value: 'manual' }] },
    {
      name: 'status',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'requested', value: 'requested' },
        { label: 'running', value: 'running' },
        { label: 'success', value: 'success' },
        { label: 'failed', value: 'failed' },
        { label: 'verification_required', value: 'verification_required' },
        { label: 'verified', value: 'verified' },
      ],
    },
    { name: 'startedAt', type: 'date', required: true, index: true },
    { name: 'finishedAt', type: 'date' },
    { name: 'durationMs', type: 'number' },
    { name: 'verificationStatus', type: 'select', options: [{ label: 'not_checked', value: 'not_checked' }, { label: 'passed', value: 'passed' }, { label: 'failed', value: 'failed' }], defaultValue: 'not_checked' },
    { name: 'verificationCheckedAt', type: 'date' },
    { name: 'triggeredBy', type: 'relationship', relationTo: 'users' },
    {
      name: 'errorSummary',
      type: 'textarea',
      admin: { description: 'ملخص مطهر فقط — بلا مسارات أو بيانات اعتماد / sanitized, non-sensitive only' },
    },
  ],
  timestamps: false,
};
