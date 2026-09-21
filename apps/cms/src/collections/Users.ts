/**
 * Users (Phase 2 §5.3.1): admin accounts only — no public registration.
 * Roles are enforced server-side; the `role` field is writable by Super Admin only.
 * Accounts are disabled (never deleted) to preserve the audit trail.
 */
import type { CollectionConfig } from 'payload';

import { requireAnyAdmin, requireCapability, requireCapabilityForField, roleOf, type AdminUser } from '../access/roles.js';
import { writeAudit } from '../utilities/audit.js';
import { ROLES } from '@protocol-soft/shared';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 8 * 60, // 8h absolute session ceiling (confirmed default; idle timeout handled at proxy/session refresh)
    maxLoginAttempts: 10,
    lockTime: 1000 * 60 * 5,
    useAPIKey: false,
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax', // admin lives on its own subdomain; lax supports Cloudflare Access flow
    },
  },
  admin: {
    useAsTitle: 'name',
    group: 'النظام / System',
    defaultColumns: ['name', 'email', 'role', 'active'],
  },
  access: {
    // No public registration; create/manage is Super Admin only.
    create: requireCapability('users_manage'),
    read: requireCapability('users_directory_read'),
    update: requireCapability('users_manage'),
    delete: () => false, // accounts are disabled, never deleted (audit trail)
    admin: requireAnyAdmin,
    unlock: requireCapability('users_manage'),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      saveToJWT: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: ROLES.map((r) => ({ label: r, value: r })),
      saveToJWT: true,
      access: {
        // Field-level rule (Phase 2 §2): only Super Admin may read/write the role field.
        read: requireCapabilityForField('users_directory_read'),
        update: requireCapabilityForField('users_manage'),
        create: requireCapabilityForField('users_manage'),
      },
    },
    {
      name: 'preferredAdminLocale',
      type: 'select',
      label: 'لغة لوحة التحكم / Admin locale',
      defaultValue: 'ar',
      options: [
        { label: 'العربية (RTL)', value: 'ar' },
        { label: 'English (LTR)', value: 'en' },
      ],
      saveToJWT: true,
    },
    {
      name: 'active',
      type: 'checkbox',
      label: 'نشط / Active',
      defaultValue: true,
      admin: { description: 'تعطيل الحساب يبطل الجلسات فوراً — الحسابات لا تُحذف / Disabling revokes sessions — accounts are never deleted' },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, req, operation }) => {
        // Role-change detection for the audit trail (before the write happens).
        if (operation === 'update' && originalDoc && data.role && data.role !== originalDoc.role) {
          await writeAudit(req, 'role_changed', { collection: 'users', id: originalDoc.id }, `role: ${originalDoc.role} → ${data.role}`);
        }
        if (operation === 'create') {
          await writeAudit(req, 'user_created', { collection: 'users' }, `create user (role: ${data.role ?? '?'})`);
        }
        if (operation === 'update' && data.active === false && (originalDoc as { active?: boolean } | undefined)?.active !== false) {
          await writeAudit(req, 'user_disabled', { collection: 'users', id: originalDoc?.id }, 'account disabled');
        }
        return data;
      },
    ],
    afterLogin: [
      async ({ user, req }) => {
        await writeAudit(req, 'login_success', { collection: 'users', id: user.id }, 'admin login');
        return user;
      },
    ],
    afterLogout: [
      async ({ req }) => {
        await writeAudit(req, 'logout', { collection: 'users' }, 'admin logout');
        return req.user as never;
      },
    ],
    afterForgotPassword: [
      async ({ args }) => {
        // Never log the token; record only that a reset was requested for an account hash.
        const req = (args as { req: Parameters<typeof writeAudit>[0] }).req;
        await writeAudit(req, 'password_reset_requested', { collection: 'users' }, 'password reset requested');
      },
    ],
    afterOperation: [
      async ({ operation, result, req }) => {
        if (operation === 'resetPassword' && result && typeof result === 'object' && 'user' in result && result.user) {
          const user = result.user as { id: number | string };
          await writeAudit(req, 'password_reset_completed', { collection: 'users', id: user.id }, 'password reset completed');
        }
        return result;
      },
    ],
  },
  timestamps: true,
};

export const userRole = (user: unknown): string | null => roleOf(user as AdminUser);
