import { getPayload } from 'payload';

import configPromise from '../payload.config.js';

const t0 = Date.now();
const payload = await getPayload({ config: configPromise });
console.log('init', ((Date.now() - t0) / 1000).toFixed(1) + 's');
try {
  const r = await payload.login({ collection: 'users', data: { email: 'admin@protocolsoft.local', password: 'LocalDev#SuperAdmin12' }, overrideAccess: true });
  console.log('LOGIN OK', r.user?.email, 'token?', typeof r.token === 'string', 'total', ((Date.now() - t0) / 1000).toFixed(1) + 's');
} catch (e) {
  console.error('LOGIN FAILED', ((Date.now() - t0) / 1000).toFixed(1) + 's', (e as Error).message ?? e);
}
process.exit(0);
