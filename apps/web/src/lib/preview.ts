/**
 * Preview verification (Phase 2 §6.7 + OD2): the web service VERIFIES cms-signed
 * one-time codes with PREVIEW_VERIFY_PUBLIC_KEY — it can never mint them. After
 * verification it exchanges the code with the cms over the private network for
 * the exact bound draft snapshot. The code travels once in the URL and is then
 * cleaned; responses are no-store/no-referrer/noindex (next.config headers).
 */
import { createHash, createPublicKey, verify } from 'node:crypto';

import type { PreviewCodeClaims, PreviewExchangeResult } from '@protocol-soft/shared';

import { internalCmsUrl } from './env.js';

const PREVIEW_AUD = 'web-preview';
const MAX_TTL_SECONDS = 15 * 60;

export interface LocalVerifyResult {
  ok: boolean;
  claims?: PreviewCodeClaims;
  reason?: string;
}

export const verifyCode = (token: string): LocalVerifyResult => {
  const pem = process.env.PREVIEW_VERIFY_PUBLIC_KEY;
  if (!pem) return { ok: false, reason: 'no-verification-key' };
  try {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) return { ok: false, reason: 'malformed' };
    const publicKey = createPublicKey(pem);
    const valid = verify(null, Buffer.from(`${header}.${body}`), publicKey, Buffer.from(signature, 'base64url'));
    if (!valid) return { ok: false, reason: 'bad-signature' };
    const claims = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as PreviewCodeClaims;
    if (claims.aud !== PREVIEW_AUD) return { ok: false, reason: 'bad-audience' };
    if (typeof claims.exp !== 'number' || claims.exp * 1000 < Date.now()) return { ok: false, reason: 'expired' };
    if (claims.exp * 1000 - Date.now() > MAX_TTL_SECONDS * 1000 + 5000) return { ok: false, reason: 'ttl-exceeds-ceiling' };
    return { ok: true, claims };
  } catch {
    return { ok: false, reason: 'verification-error' };
  }
};

/** Server-to-server exchange over the private Docker network (no service key; the code is the credential). */
export const exchangeCode = async (code: string): Promise<PreviewExchangeResult> => {
  const res = await fetch(`${internalCmsUrl()}/api/internal/preview/exchange`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ code }),
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`preview exchange failed: ${res.status}`);
  return (await res.json()) as PreviewExchangeResult;
};

export const sha256 = (input: string): string => createHash('sha256').update(input).digest('hex');
