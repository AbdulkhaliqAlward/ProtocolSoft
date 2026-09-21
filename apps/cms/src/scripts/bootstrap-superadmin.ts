/**
 * First Super Admin bootstrap — run ONCE on the server with values from env:
 *   BOOTSTRAP_SUPERADMIN_EMAIL / _PASSWORD / _NAME
 * Values are never committed; remove them from the environment afterwards.
 */
import { getPayload } from 'payload';

import configPromise from '../payload.config.js';

const bootstrap = async (): Promise<void> => {
  const email = process.env.BOOTSTRAP_SUPERADMIN_EMAIL;
  const password = process.env.BOOTSTRAP_SUPERADMIN_PASSWORD;
  const name = process.env.BOOTSTRAP_SUPERADMIN_NAME ?? 'Protocol Soft Admin';

  if (!email || !password || password.length < 12) {
    console.error('BOOTSTRAP_SUPERADMIN_EMAIL and a ≥12-char BOOTSTRAP_SUPERADMIN_PASSWORD are required');
    process.exit(1);
  }

  const payload = await getPayload({ config: configPromise });
  const existing = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1, overrideAccess: true });

  if (existing.totalDocs > 0) {
    await payload.update({
      collection: 'users',
      id: existing.docs[0]!.id,
      data: { role: 'super_admin', name, active: true },
      overrideAccess: true,
      context: { skipAudit: true },
    } as never);
    console.log(`Super Admin refreshed: ${email}`);
  } else {
    await payload.create({
      collection: 'users',
      data: { email, password, name, role: 'super_admin', preferredAdminLocale: 'ar', active: true },
      overrideAccess: true,
      context: { skipAudit: true },
    } as never);
    console.log(`Super Admin created: ${email}`);
  }
  process.exit(0);
};

void bootstrap();
