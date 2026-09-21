/**
 * Contact submission proxy (Phase 5, §7/§16.6): the ONLY way a browser lead
 * reaches the CMS. Server-side validation mirrors the CMS contract, the raw IP
 * is HMAC-hashed (never stored raw — Phase 2 §7), rate limiting is per-IP in
 * memory (dev-only layer; production limiter remains a documented launch
 * blocker), and NO request/response PII is logged — failures log a code only.
 */
import { NextResponse } from 'next/server';

import { computeIpHash, postLead } from '@/lib/internalApi';
import type { ServiceInterest } from '@/components/ContactForm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SERVICE_VALUES: ServiceInterest[] = ['custom_software', 'digital_products', 'cybersecurity', 'general'];
const MESSAGE_MAX = 2000;

/* Dev-layer limiter (mirrors the CMS-side per-ipHash limiter; Phase 2 §6.6). */
const WINDOW_MS = 60_000;
const hits = new Map<string, { count: number; windowStart: number }>();
const rateLimited = (ip: string): boolean => {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    hits.set(ip, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  return entry.count > 10;
};

const clientIp = (request: Request): string => {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'local-dev';
  return request.headers.get('x-real-ip') ?? 'local-dev';
};

interface ContactBody {
  fullName?: unknown;
  company?: unknown;
  email?: unknown;
  phone?: unknown;
  serviceInterest?: unknown;
  message?: unknown;
  sourceLocale?: unknown;
  pagePath?: unknown;
  honeypot?: unknown;
  consent?: unknown;
  idempotencyKey?: unknown;
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  // Honeypot filled → silently accept-but-discard, mirroring the CMS behavior.
  if (typeof body.honeypot === 'string' && body.honeypot.trim() !== '') {
    return NextResponse.json({ referenceCode: 'LF-0000SINK' }, { status: 201 });
  }

  const ip = clientIp(request);
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const errors: string[] = [];
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const serviceInterest = typeof body.serviceInterest === 'string' ? (body.serviceInterest as ServiceInterest) : undefined;
  if (fullName.length < 2 || fullName.length > 120) errors.push('fullName');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('email');
  if (message.length < 10 || message.length > MESSAGE_MAX) errors.push('message');
  if (!serviceInterest || !SERVICE_VALUES.includes(serviceInterest)) errors.push('serviceInterest');
  if (body.consent !== true) errors.push('consent');
  if (body.sourceLocale !== 'ar' && body.sourceLocale !== 'en') errors.push('sourceLocale');
  if (typeof body.idempotencyKey !== 'string' || body.idempotencyKey.length < 8) errors.push('idempotencyKey');
  if (errors.length > 0) {
    return NextResponse.json({ error: 'validation_failed', fields: errors }, { status: 422 });
  }

  try {
    const result = await postLead({
      fullName,
      company: typeof body.company === 'string' && body.company.trim() ? body.company.trim().slice(0, 120) : undefined,
      email,
      phone: typeof body.phone === 'string' && body.phone.trim() ? body.phone.trim().slice(0, 20) : undefined,
      serviceInterest,
      message,
      sourceLocale: body.sourceLocale === 'en' ? 'en' : 'ar',
      pagePath: typeof body.pagePath === 'string' ? body.pagePath.slice(0, 300) : '',
      ipHash: computeIpHash(ip),
      honeypot: typeof body.honeypot === 'string' ? body.honeypot : undefined,
      consent: true,
      idempotencyKey: String(body.idempotencyKey),
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message.includes('429')) {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
    }
    // No PII in logs — the failure reason only.
    console.error('[contact] upstream rejected', { reason: err instanceof Error ? err.message.split(' for ')[0] : 'unknown' });
    return NextResponse.json({ error: 'submission_failed' }, { status: 502 });
  }
}
