/**
 * Internal API key guard (Phase 2 §6.1): least-privilege, directional, non-interchangeable.
 * Each endpoint group accepts ONLY its designated key; anything else -> 403 + structured log.
 */
import type { PayloadRequest } from 'payload';

import type { InternalKeyGroup } from '@protocol-soft/shared';

const KEY_ENV: Record<Exclude<InternalKeyGroup, never> & string, string | undefined> = {
  content: process.env.WEB_TO_CMS_CONTENT_READ_KEY,
  leads: process.env.WEB_TO_CMS_LEAD_SUBMIT_KEY,
  revalidate: process.env.CMS_TO_WEB_REVALIDATE_KEY,
  'backup-report': process.env.BACKUP_REPORT_KEY,
};

const timingSafeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

export const guardInternalKey = (req: PayloadRequest, group: keyof typeof KEY_ENV): Response | null => {
  const expected = KEY_ENV[group];
  if (!expected) {
    req.payload.logger.error({ msg: `internal key for group "${group}" is not configured` });
    return Response.json({ error: 'internal_key_not_configured' }, { status: 503 });
  }
  const presented = req.headers.get('x-internal-key') ?? '';
  if (!presented || !timingSafeEqual(presented, expected)) {
    req.payload.logger.warn({ msg: 'internal key rejected', group });
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }
  return null; // authorized
};

export const ok = <T,>(body: T, locale: string = 'ar', init?: ResponseInit): Response =>
  Response.json({ locale, fallbackUsed: false, data: body } satisfies { locale: string; fallbackUsed: false; data: T }, init);
