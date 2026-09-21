/**
 * Preview-code signing (Phase 2 §6.7). Asymmetric: the CMS signs one-time preview
 * codes with PREVIEW_SIGNING_PRIVATE_KEY (Ed25519); the web service verifies with
 * PREVIEW_VERIFY_PUBLIC_KEY and can never mint codes. The private key never leaves
 * the cms service. Codes are bound to collection/document/locale/revision/admin,
 * audience `web-preview`, max lifetime 15 minutes, single-use (jti stored hashed).
 */
import { createHash, createPrivateKey, createPublicKey, generateKeyPairSync, randomUUID, sign, verify } from 'node:crypto';

import type { Locale, PreviewCodeClaims } from '@protocol-soft/shared';

export const PREVIEW_AUD = 'web-preview' as const;
export const PREVIEW_MAX_TTL_SECONDS = 15 * 60; // hard ceiling — §6.7

const b64url = (buf: Buffer): string => buf.toString('base64url');

export interface PreviewCode {
  token: string;
  jti: string;
  jtiHash: string;
  expiresAt: Date;
  claims: PreviewCodeClaims;
}

export const signPreviewCode = (input: {
  collection: string;
  docId: number | string;
  slug?: string;
  locale: Locale;
  revisionId?: number | string;
  issuingAdminId: number;
}): PreviewCode => {
  const privateKeyPem = process.env.PREVIEW_SIGNING_PRIVATE_KEY;
  if (!privateKeyPem) throw new Error('PREVIEW_SIGNING_PRIVATE_KEY is not configured');
  const privateKey = createPrivateKey(privateKeyPem);

  const jti = randomUUID();
  const exp = Math.floor(Date.now() / 1000) + PREVIEW_MAX_TTL_SECONDS;
  const claims: PreviewCodeClaims = {
    collection: input.collection,
    docId: input.docId,
    slug: input.slug,
    locale: input.locale,
    revisionId: input.revisionId,
    issuingAdminId: input.issuingAdminId,
    aud: PREVIEW_AUD,
    exp,
    jti,
  };

  const header = b64url(Buffer.from(JSON.stringify({ alg: 'EdDSA', typ: 'JWT' })));
  const body = b64url(Buffer.from(JSON.stringify(claims)));
  const signature = sign(null, Buffer.from(`${header}.${body}`), privateKey);

  return {
    token: `${header}.${body}.${b64url(signature)}`,
    jti,
    jtiHash: createHash('sha256').update(jti).digest('hex'),
    expiresAt: new Date(exp * 1000),
    claims,
  };
};

export interface VerifyResult {
  ok: boolean;
  claims?: PreviewCodeClaims;
  jtiHash?: string;
  reason?: string;
}

export const verifyPreviewCode = (token: string, publicKeyPem?: string): VerifyResult => {
  const keyPem = publicKeyPem ?? process.env.PREVIEW_VERIFY_PUBLIC_KEY ?? process.env.PREVIEW_SIGNING_PRIVATE_KEY;
  if (!keyPem) return { ok: false, reason: 'no-verification-key' };
  try {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) return { ok: false, reason: 'malformed' };
    const publicKey = createPublicKey(keyPem);
    const valid = verify(null, Buffer.from(`${header}.${body}`), publicKey, Buffer.from(signature, 'base64url'));
    if (!valid) return { ok: false, reason: 'bad-signature' };
    const claims = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as PreviewCodeClaims;
    if (claims.aud !== PREVIEW_AUD) return { ok: false, reason: 'bad-audience' };
    if (typeof claims.exp !== 'number' || claims.exp * 1000 < Date.now()) return { ok: false, reason: 'expired' };
    if (claims.exp * 1000 - Date.now() > PREVIEW_MAX_TTL_SECONDS * 1000 + 5000) return { ok: false, reason: 'ttl-exceeds-ceiling' };
    return { ok: true, claims, jtiHash: createHash('sha256').update(claims.jti).digest('hex') };
  } catch {
    return { ok: false, reason: 'verification-error' };
  }
};

/** Test-vector helper used by scripts/generate-preview-keys.ts and local setup. */
export const generateKeyPairPem = (): { privateKeyPem: string; publicKeyPem: string } => {
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  return {
    privateKeyPem: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
    publicKeyPem: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
  };
};
