/**
 * Server-side access helpers (Phase 2 §2). Every check derives from the shared
 * capability matrix — UI hiding is cosmetic only.
 */
import type { Access, FieldAccess } from 'payload';

import { hasCapability, type AdminCapability, type Role } from '@protocol-soft/shared';

export interface AdminUser {
  id: number | string;
  role?: Role | null;
  active?: boolean;
  name?: string;
  email?: string;
  /** Present on synthetic req objects used by the verification script. */
  collection?: string;
}

export const roleOf = (user: unknown): Role | null => {
  const u = user as AdminUser | undefined | null;
  if (!u || u.collection !== 'users') return null;
  if (u.active === false) return null;
  return (u.role ?? null) as Role | null;
};

/** Capability gate for collections/globals. */
export const requireCapability =
  (...capabilities: AdminCapability[]): Access =>
  ({ req }) =>
    hasCapability(roleOf(req.user), capabilities[0]!) || capabilities.some((c) => hasCapability(roleOf(req.user), c));

/** Convenience: any authenticated, active admin (rare — prefer explicit capabilities). */
export const requireAnyAdmin = ({ req }: { req: { user?: unknown } }): boolean => roleOf(req.user) !== null;

/** Field-level gate (e.g., users.role is writable by Super Admin only). */
export const requireCapabilityForField =
  (...capabilities: AdminCapability[]): FieldAccess =>
  ({ req }) =>
    capabilities.some((c) => hasCapability(roleOf(req.user), c));

/**
 * System-only write: nothing in the admin UI/API may create/update these
 * collections (audit-logs, preview-codes, backup-records). System writes go
 * through the Local API with overrideAccess: true.
 */
export const systemWriteOnly: Access = () => false;
