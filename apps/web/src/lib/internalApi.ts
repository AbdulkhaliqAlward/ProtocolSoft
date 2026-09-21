/**
 * Internal Public Content API client (Phase 2 §6, Option A) — the ONLY data path
 * for the web service. No database credentials exist anywhere in this app.
 * Purpose-specific keys; no silent fallback; 404 = content genuinely unavailable.
 *
 * React.cache() wraps getContent so that identical calls within the same server
 * render pass (e.g. layout.tsx + page.tsx both reading site-settings) are
 * deduplicated automatically. The underlying fetch still uses cache:'no-store'
 * — React.cache is per-request memoization, not HTTP caching.
 */
import { cache } from 'react';
import { createHmac } from 'node:crypto';

import type { InternalEnvelope } from '@protocol-soft/shared';

const CMS_URL = () => process.env.CMS_INTERNAL_URL ?? 'http://localhost:3001';

const keyFor = (group: 'content' | 'leads'): string | undefined =>
  group === 'content' ? process.env.WEB_TO_CMS_CONTENT_READ_KEY : process.env.WEB_TO_CMS_LEAD_SUBMIT_KEY;

export class InternalApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'InternalApiError';
  }
}

const request = async (
  group: 'content' | 'leads',
  path: string,
  init?: RequestInit & { locale?: string; params?: Record<string, string> },
): Promise<unknown> => {
  const key = keyFor(group);
  if (!key) throw new InternalApiError(503, `internal key for "${group}" not configured`);
  const url = new URL(path, CMS_URL());
  if (init?.locale) {
    url.searchParams.set('locale', init.locale);
  }
  for (const [k, v] of Object.entries(init?.params ?? {})) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url, {
    ...init,
    headers: {
      'content-type': 'application/json',
      'x-internal-key': key,
      ...(init?.headers ?? {}),
    },
    signal: AbortSignal.timeout(10_000),
    cache: 'no-store', // ISR/tag-based caching is layered in Phase 6; foundation reads fresh
  });
  if (!res.ok) throw new InternalApiError(res.status, `internal API ${res.status} for ${path}`);
  return res.json();
};

/** Deduplicated content read: React.cache ensures the same (path, locale, params)
 *  within one server render is fetched only once — no duplicate HTTP calls from
 *  layout + page requesting the same data. */
const _getContent = async <T>(path: string, locale: string, params?: Record<string, string>): Promise<T> => {
  const envelope = (await request('content', path, { locale, params })) as InternalEnvelope<T>;
  // Contract invariant: no silent fallback (Phase 2 §6.1/§6.3)
  if (envelope.fallbackUsed !== false) throw new InternalApiError(502, 'internal API fallback contract violated');
  return envelope.data;
};

export const getContent = cache(_getContent) as typeof _getContent;

export const postLead = async (body: unknown): Promise<{ referenceCode: string }> =>
  (await request('leads', '/api/internal/leads', { method: 'POST', body: JSON.stringify(body) })) as { referenceCode: string };

/** Web-side lead ipHash — identical algorithm to the cms helper (LEAD_IP_HASH_SECRET shared). */
export const computeIpHash = (ip: string): string => {
  const secret = process.env.LEAD_IP_HASH_SECRET ?? '';
  return createHmac('sha256', secret).update(ip).digest('hex').slice(0, 32);
};

