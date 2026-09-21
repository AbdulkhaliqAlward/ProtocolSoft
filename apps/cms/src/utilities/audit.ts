/**
 * Audit-log foundation (Phase 2 §13). System-written via Local API (overrideAccess),
 * sanitized summaries — never secrets, tokens, raw IPs, or full PII dumps.
 */
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook, PayloadRequest } from 'payload';

export type AuditEventType =
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'password_reset_requested'
  | 'password_reset_completed'
  | 'user_created'
  | 'user_updated'
  | 'user_disabled'
  | 'role_changed'
  | 'draft_saved'
  | 'publish'
  | 'unpublish'
  | 'revert'
  | 'settings_changed'
  | 'theme_changed'
  | 'theme_reset'
  | 'media_uploaded'
  | 'media_deleted'
  | 'media_archived'
  | 'media_screening_changed'
  | 'lead_created'
  | 'lead_status_changed'
  | 'lead_exported'
  | 'backup_schedule_changed'
  | 'backup_requested'
  | 'backup_completed'
  | 'backup_failed'
  | 'backup_verification_required'
  | 'backup_verified'
  | 'backup_config_changed'
  | 'legal_content_confirmed'
  | 'break_glass_used';

/** Redacted field names — summaries carry paths + ids only, never values. */
const VALUELESS_FIELDS = new Set(['password', 'hash', 'resetToken', 'token', 'secret', 'ipHash', 'backupEncryptionKey']);

const diffSummary = (before: Record<string, unknown> | null, after: Record<string, unknown>): string => {
  const changed: string[] = [];
  const keys = new Set([...Object.keys(after), ...Object.keys(before ?? {})]);
  for (const key of keys) {
    const b = JSON.stringify(before?.[key]);
    const a = JSON.stringify(after[key]);
    if (b !== a) changed.push(VALUELESS_FIELDS.has(key) ? `${key}=<redacted>` : key);
  }
  return changed.slice(0, 40).join(', ') || 'no field-level changes';
};

export const writeAudit = async (
  req: PayloadRequest,
  eventType: AuditEventType,
  entity: { collection?: string; id?: number | string; slug?: string; locale?: string },
  changesSummary: string,
): Promise<void> => {
  try {
    await req.payload.create({
      collection: 'audit-logs',
      overrideAccess: true,
      context: { systemWrite: true },
      // Forward the caller's req so the audit insert JOINS the caller's
      // transaction when one exists. Without this, a nested audit write opens a
      // second transaction whose FK check on audit-logs.actor -> users blocks on
      // the caller's uncommitted users-row lock (e.g. login's
      // resetLoginAttempts) — an application-level deadlock Postgres cannot see.
      req,
      data: {
        eventTime: new Date().toISOString(),
        actor: typeof req.user?.id === 'number' || typeof req.user?.id === 'string' ? req.user.id : undefined,
        actorLabel: req.user ? String(req.user.email ?? req.user.id) : 'system',
        eventType,
        entityCollection: entity.collection,
        entityId: entity.id != null ? String(entity.id) : undefined,
        entitySlug: entity.slug,
        entityLocale: entity.locale,
        changesSummary: changesSummary.slice(0, 1000),
      } as never,
    });
  } catch (err) {
    // Audit must never break the primary operation; log for ops visibility.
    req.payload.logger.error({ err, msg: 'audit write failed' });
  }
};

/** Collection-level afterChange audit for content entities. */
export const auditAfterChange =
  (eventTypeForPublish?: 'publish'): CollectionAfterChangeHook =>
  async ({ doc, previousDoc, req, operation, collection }) => {
    if (req.context?.skipAudit) return doc;
    const summary = diffSummary(previousDoc ?? null, doc as Record<string, unknown>);
    const isPublish = Boolean(previousDoc) && previousDoc?._status === 'draft' && doc._status === 'published';
    await writeAudit(
      req,
      isPublish && eventTypeForPublish ? eventTypeForPublish : 'draft_saved',
      { collection: collection?.slug, id: doc.id, slug: (doc as { slug?: string }).slug },
      operation === 'create' ? `create: ${summary}` : summary,
    );
    return doc;
  };

export const auditAfterDelete: CollectionAfterDeleteHook = async ({ doc, req, collection }) => {
  await writeAudit(req, 'media_deleted', { collection: collection?.slug ?? '', id: doc.id }, 'document deleted');
  return doc;
};

/** Global-level audit (site/theme/seo/form/navigation/homepage/backup settings). */
export const auditGlobalChange =
  (eventType: AuditEventType): GlobalAfterChangeHook =>
  async ({ doc, previousDoc, req, global: globalConfig }) => {
    if (req.context?.skipAudit) return doc;
    await writeAudit(
      req,
      eventType,
      { collection: 'global', slug: globalConfig?.slug ?? String((doc as Record<string, unknown>).globalType ?? '') },
      diffSummary(previousDoc ?? null, doc as Record<string, unknown>),
    );
    return doc;
  };
