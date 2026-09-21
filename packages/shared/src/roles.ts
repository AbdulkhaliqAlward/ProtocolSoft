/**
 * Server-side role model — single source of truth (Phase 2 §2).
 * Roles are enforced in Payload access functions on the CMS; the web service
 * has no role concept at all (it reads only the Internal Public Content API).
 */

export const ROLES = ['super_admin', 'content_manager', 'editor', 'sales_manager'] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, { ar: string; en: string }> = {
  super_admin: { ar: 'مدير النظام', en: 'Super Admin' },
  content_manager: { ar: 'مدير المحتوى', en: 'Content Manager' },
  editor: { ar: 'محرر', en: 'Editor' },
  sales_manager: { ar: 'مدير طلبات التواصل', en: 'Sales / Leads Manager' },
};

/** Collections/globals a role may READ in the admin. Publish/write rules are narrower (see ACCESS matrix). */
export type AdminCapability =
  | 'users_manage'
  | 'users_directory_read'
  | 'settings_manage'
  | 'theme_manage'
  | 'navigation_manage'
  | 'content_edit'
  | 'content_publish'
  | 'media_upload'
  | 'media_delete'
  | 'leads_manage'
  | 'leads_export'
  | 'audit_read'
  | 'backup_control';

/**
 * Server-enforced capability matrix (Phase 2 §2.2, updated for backup controls BD1).
 * The CMS re-derives every access check from this matrix — UI hiding is cosmetic only.
 */
export const CAPABILITIES: Record<AdminCapability, readonly Role[]> = {
  users_manage: ['super_admin'],
  users_directory_read: ['super_admin', 'content_manager', 'sales_manager'],
  settings_manage: ['super_admin', 'content_manager'],
  theme_manage: ['super_admin', 'content_manager'],
  navigation_manage: ['super_admin', 'content_manager'],
  content_edit: ['super_admin', 'content_manager', 'editor'],
  content_publish: ['super_admin', 'content_manager'],
  media_upload: ['super_admin', 'content_manager', 'editor'],
  media_delete: ['super_admin', 'content_manager'],
  leads_manage: ['super_admin', 'sales_manager'],
  leads_export: ['super_admin', 'sales_manager'],
  audit_read: ['super_admin', 'content_manager'],
  // BD1: backup controls are visible/actionable for Super Admin ONLY.
  backup_control: ['super_admin'],
};

export const hasCapability = (role: Role | null | undefined, capability: AdminCapability): boolean =>
  role != null && CAPABILITIES[capability].includes(role);
