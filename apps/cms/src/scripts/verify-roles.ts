/**
 * Role/access verification (Phase 4 acceptance): derives the effective
 * capability matrix from the SAME access functions the server enforces,
 * including field-level rules and the backup-control restriction (BD1).
 * Output: PASS/FAIL per cell — no DB required (pure function verification).
 */
import { hasCapability, ROLES, type AdminCapability, type Role } from '@protocol-soft/shared';

import { requireCapability, roleOf, type AdminUser } from '../access/roles.js';

const CAPABILITY_LABELS: Record<AdminCapability, string> = {
  users_manage: 'users & roles',
  users_directory_read: 'user directory (read)',
  settings_manage: 'site/seo/form settings',
  theme_manage: 'theme settings',
  navigation_manage: 'navigation',
  content_edit: 'content edit/drafts',
  content_publish: 'content publish',
  media_upload: 'media upload/edit',
  media_delete: 'media delete/archive',
  leads_manage: 'leads manage',
  leads_export: 'leads CSV export',
  audit_read: 'audit logs (read)',
  backup_control: 'backup & recovery controls',
};

const syntheticUser = (role: Role, active = true): AdminUser => ({ id: 1, role, active, name: role, email: `${role}@verify.local`, collection: 'users' });

const checkGate = (roles: readonly Role[], capability: AdminCapability): boolean => {
  const gate = requireCapability(capability);
  // requireCapability grants if ANY listed role matches — verify each listed role passes,
  // and (spot check) that a non-listed role is denied.
  const allPass = roles.every((r) => gate({ req: { user: syntheticUser(r) } } as never) === true);
  const otherRoles = ROLES.filter((r) => !roles.includes(r));
  const othersDenied = otherRoles.every((r) => gate({ req: { user: syntheticUser(r) } } as never) === false);
  return allPass && othersDenied;
};

const roleFieldRules = (): boolean[] => {
  // users.role: writable ONLY by super_admin; directory-readable by the three listed roles.
  const user = (r: Role | null) => ({ req: { user: r ? syntheticUser(r) : null } }) as never;
  const superOnly = requireCapability('users_manage');
  const dirRead = requireCapability('users_directory_read');
  return [
    superOnly(user('super_admin')) === true,
    superOnly(user('content_manager')) === false,
    superOnly(user('editor')) === false,
    superOnly(user('sales_manager')) === false,
    dirRead(user('super_admin')) === true,
    dirRead(user('sales_manager')) === true,
    dirRead(user('editor')) === false,
    dirRead(user(null)) === false,
    // roleOf rejects unauthenticated + inactive
    roleOf(null) === null,
    roleOf(syntheticUser('super_admin', false)) === null,
  ];
};

const run = (): void => {
  console.log('\n=== Role/Access verification (server-enforced matrix) ===\n');
  const header = ['capability'.padEnd(32), ...ROLES.map((r) => r.padEnd(17))].join('');
  console.log(header);
  console.log('-'.repeat(header.length));

  let failures = 0;
  // Re-derive from the shared matrix (the source the CMS uses):
  const matrix: Record<AdminCapability, readonly Role[]> = {
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
    backup_control: ['super_admin'],
  };

  for (const [capability, allowed] of Object.entries(matrix) as [AdminCapability, readonly Role[]][]) {
    const ok = checkGate(allowed, capability);
    if (!ok) failures += 1;
    const cells = ROLES.map((r) => (allowed.includes(r) ? '✔'.padEnd(14) : '—'.padEnd(17))).join('');
    console.log(`${CAPABILITY_LABELS[capability].padEnd(32)}${cells} ${ok ? 'OK' : 'FAIL'}`);
  }

  console.log('\n=== Field-level rules (users.role, roleOf guards) ===');
  const fieldResults = roleFieldRules();
  fieldResults.forEach((ok, i) => {
    if (!ok) failures += 1;
    console.log(`rule ${String(i + 1).padStart(2)}: ${ok ? 'OK' : 'FAIL'}`);
  });

  console.log(`\nRESULT: ${failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`}\n`);
  process.exit(failures === 0 ? 0 : 1);
};

run();
