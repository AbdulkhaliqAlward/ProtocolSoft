/**
 * Backup control endpoints (Phase 2 §2.3/§5.1.7 + BD1, v1.5 defaults).
 * - status / schedule / request-manual: admin-session + Super Admin ONLY.
 * - report: backup job -> BACKUP_REPORT_KEY (records results; runner dormant).
 * The dashboard control plane NEVER exposes or edits encryption keys, PostgreSQL
 * credentials, R2/storage credentials, bucket details, or server paths — only a
 * non-sensitive destination status label. No restore concept exists here.
 */
import type { PayloadRequest } from 'payload';

import { guardInternalKey } from './guard.js';
import { writeAudit } from '../../utilities/audit.js';
import { sanitizeErrorSummary } from '../../utilities/sanitize.js';

const DISABLE_WORDS = new Set(['DISABLE', 'تعطيل']);

const requireSuperAdmin = (req: PayloadRequest): Response | null => {
  const user = req.user as { role?: string; active?: boolean } | undefined;
  if (!user || user.active === false || user.role !== 'super_admin') {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }
  return null;
};

type BackupSettingsDoc = {
  scheduleEnabled: boolean;
  schedule: { frequency: string; time: string };
  destinationStatus: 'not_configured' | 'configured';
  manualRequestAt?: string | null;
};

const statusPayload = async (req: PayloadRequest) => {
  const settings = (await req.payload.findGlobal({ slug: 'backup-settings', overrideAccess: true })) as unknown as BackupSettingsDoc;
  const latest = await req.payload.find({
    collection: 'backup-records',
    sort: '-startedAt',
    limit: 10,
    overrideAccess: true,
    pagination: false,
  });
  const success = latest.docs.find((d) => d.status === 'success' || d.status === 'verified');
  const failed = latest.docs.find((d) => d.status === 'failed');
  const verified = latest.docs.find((d) => d.status === 'verified' || d.verificationStatus === 'passed');
  const running = latest.docs.find((d) => d.status === 'running' || d.status === 'requested');
  return {
    state: failed && (!running || startedAfter(running, failed)) ? 'failed' : running ? 'running' : settings.scheduleEnabled ? 'enabled' : 'disabled',
    scheduleEnabled: settings.scheduleEnabled,
    schedule: settings.scheduleEnabled ? settings.schedule : null,
    nextScheduled: settings.scheduleEnabled ? nextScheduledTime(settings.schedule) : null,
    destinationStatus: settings.destinationStatus, // non-sensitive label only
    lastSuccessfulBackup: success ? { at: success.finishedAt ?? success.startedAt, type: success.type } : null,
    lastVerification: verified ? { status: 'passed', at: verified.verificationCheckedAt ?? verified.finishedAt } : null,
    lastFailure: failed
      ? { at: failed.finishedAt ?? failed.startedAt, summary: failed.errorSummary ?? null } // sanitized at write time
      : null,
    retentionTarget: { daily: 30, monthly: 12 }, // confirmed v1.5 (informational)
    restoreNotice: 'restore is performed via an authorized operational procedure outside the dashboard',
  };
};

const startedAfter = (a: { startedAt?: string | null }, b: { startedAt?: string | null }): boolean =>
  new Date(a.startedAt ?? 0).getTime() > new Date(b.startedAt ?? 0).getTime();

const nextScheduledTime = (schedule: { time: string } | null): string | null => {
  if (!schedule?.time) return null;
  const [h, m] = schedule.time.split(':').map(Number);
  const next = new Date();
  next.setHours(h ?? 3, m ?? 0, 0, 0);
  if (next.getTime() <= Date.now()) next.setDate(next.getDate() + 1);
  return next.toISOString();
};

export const backupEndpoints = [
  {
    path: '/internal/backup/status',
    method: 'get' as const,
    handler: async (req: PayloadRequest): Promise<Response> => {
      const denied = requireSuperAdmin(req);
      if (denied) return denied;
      return Response.json(await statusPayload(req));
    },
  },
  {
    path: '/internal/backup/schedule',
    method: 'post' as const,
    handler: async (req: PayloadRequest): Promise<Response> => {
      const denied = requireSuperAdmin(req);
      if (denied) return denied;
      const body = (await req.json!().catch(() => ({}))) as {
        enabled?: boolean;
        time?: string;
        confirm?: boolean;
        confirmationWord?: string;
      };

      if (body.enabled === false) {
        // Disabling requires a bilingual warning + TYPED confirmation (BD1).
        if (!body.confirmationWord || !DISABLE_WORDS.has(body.confirmationWord.trim().toUpperCase())) {
          return Response.json({ error: 'typed_confirmation_required', acceptedWords: ['DISABLE', 'تعطيل'] }, { status: 422 });
        }
        const prev = (await req.payload.findGlobal({ slug: 'backup-settings', overrideAccess: true })) as unknown as BackupSettingsDoc;
        await req.payload.updateGlobal({
          slug: 'backup-settings',
          overrideAccess: true,
          context: { skipAudit: true },
          data: { scheduleEnabled: false } as never,
        });
        await writeAudit(req, 'backup_schedule_changed', { collection: 'backup-settings' }, `schedule disabled (was: ${prev.scheduleEnabled}) by ${String(req.user?.email ?? '?')}`);
        return Response.json(await statusPayload(req));
      }

      if (body.enabled === true) {
        // Enabling requires explicit confirmation (modal shows schedule + last verification, BD1).
        if (body.confirm !== true) {
          return Response.json({ error: 'confirmation_required' }, { status: 422 });
        }
        if (process.env.BACKUP_ENCRYPTION_PUBLIC_KEY == null || process.env.BACKUP_SPOOL_DIR == null) {
          return Response.json({ error: 'backup_runtime_not_configured' }, { status: 503 });
        }
        const time = /^\d{2}:\d{2}$/.test(String(body.time ?? '')) ? String(body.time) : '03:00';
        await req.payload.updateGlobal({
          slug: 'backup-settings',
          overrideAccess: true,
          context: { skipAudit: true },
          data: { scheduleEnabled: true, schedule: { frequency: 'daily', time } } as never,
        });
        await writeAudit(req, 'backup_schedule_changed', { collection: 'backup-settings' }, `schedule enabled: daily @ ${time} (server time)`);
        return Response.json(await statusPayload(req));
      }

      return Response.json({ error: 'invalid_request' }, { status: 400 });
    },
  },
  {
    path: '/internal/backup/request-manual',
    method: 'post' as const,
    handler: async (req: PayloadRequest): Promise<Response> => {
      const denied = requireSuperAdmin(req);
      if (denied) return denied;
      const settings = (await req.payload.findGlobal({ slug: 'backup-settings', overrideAccess: true })) as unknown as BackupSettingsDoc;
      const now = new Date().toISOString();
      const record = await req.payload.create({
        collection: 'backup-records',
        overrideAccess: true,
        context: { systemWrite: true },
        data: {
          type: 'manual',
          status: 'requested', // runner picks this up when enabled; dormant by default (BD1)
          startedAt: now,
          verificationStatus: 'not_checked',
          triggeredBy: req.user?.id as number,
        } as never,
      });
      await req.payload.updateGlobal({
        slug: 'backup-settings',
        overrideAccess: true,
        context: { skipAudit: true },
        data: { manualRequestAt: now } as never,
      });
      await writeAudit(req, 'backup_requested', { collection: 'backup-records', id: record.id }, `manual backup requested by ${String(req.user?.email ?? '?')}`);
      return Response.json({ ok: true, recordId: record.id, runnerEnabled: process.env.BACKUP_RUNNER_ENABLED === 'true' });
    },
  },
  {
    path: '/internal/backup/report',
    method: 'post' as const,
    handler: async (req: PayloadRequest): Promise<Response> => {
      // Backup job reporting — BACKUP_REPORT_KEY only. Non-sensitive fields only.
      const denied = guardInternalKey(req, 'backup-report');
      if (denied) return denied;
      const body = (await req.json!().catch(() => ({}))) as {
        recordId?: number | string;
        type?: 'scheduled' | 'manual';
        status?: 'running' | 'success' | 'failed' | 'verification_required' | 'verified';
        startedAt?: string;
        finishedAt?: string;
        durationMs?: number;
        verificationStatus?: 'not_checked' | 'passed' | 'failed';
        verificationCheckedAt?: string;
        errorSummary?: string;
      };
      if (!body.type || !body.status || !body.startedAt) {
        return Response.json({ error: 'invalid_request' }, { status: 400 });
      }
      const startedAt = new Date(body.startedAt);
      const finishedAt = body.finishedAt ? new Date(body.finishedAt) : null;
      const durationMs = body.durationMs ?? (finishedAt ? finishedAt.getTime() - startedAt.getTime() : null);

      const data = {
        type: body.type,
        status: body.status,
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt ? finishedAt.toISOString() : undefined,
        durationMs: durationMs ?? undefined,
        verificationStatus: body.verificationStatus ?? 'not_checked',
        verificationCheckedAt: body.verificationCheckedAt,
        errorSummary: body.errorSummary ? sanitizeErrorSummary(body.errorSummary) : undefined,
      } as never;

      const record =
        body.recordId != null
          ? await req.payload.update({ collection: 'backup-records', id: body.recordId, overrideAccess: true, context: { systemWrite: true }, data })
          : await req.payload.create({ collection: 'backup-records', overrideAccess: true, context: { systemWrite: true }, data });

      // Audit per outcome (BD1): completed/failed/verified/verification_required.
      const eventType =
        body.status === 'success'
          ? 'backup_completed'
          : body.status === 'failed'
            ? 'backup_failed'
            : body.status === 'verified'
              ? 'backup_verified'
              : 'backup_verification_required';
      await writeAudit(req, eventType, { collection: 'backup-records', id: record.id }, `type=${body.type} status=${body.status}`);

      return Response.json({ ok: true, recordId: record.id });
    },
  },
];
