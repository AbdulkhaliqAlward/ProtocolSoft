/**
 * Internal lead submission (Phase 2 §7): the ONLY write reachable from the web
 * service, authenticated with WEB_TO_CMS_LEAD_SUBMIT_KEY (lead group). Re-validates
 * everything server-side; honeypot silent-reject; per-ipHash rate limit; raw IPs
 * never stored. Notification email is environment-gated (§6.9) and never blocks.
 */
import { createHmac } from 'node:crypto';

import type { PayloadRequest } from 'payload';

import { isLocale, type LeadSubmission, type LeadSubmissionResult } from '@protocol-soft/shared';

import { guardInternalKey } from './guard.js';
import { writeAudit } from '../../utilities/audit.js';
import { sendLeadNotification } from '../../utilities/email.js';

/* CMS-side per-ipHash limiter (Phase 2 §6.6 — form-settings value; Redis-backed hardening later). */
const WINDOW_MS = 60_000;
const hits = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_PER_MIN = 30;

const rateLimited = (ipHash: string): boolean => {
  const now = Date.now();
  const entry = hits.get(ipHash);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    hits.set(ipHash, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_PER_MIN;
};

const REFERENCE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const nextReferenceCode = async (req: PayloadRequest): Promise<string> => {
  const res = await req.payload.count({ collection: 'leads', overrideAccess: true });
  const serial = String(res.totalDocs + 1).padStart(4, '0');
  const suffix = Array.from({ length: 3 }, () => REFERENCE_ALPHABET[Math.floor(Math.random() * REFERENCE_ALPHABET.length)]).join('');
  return `LF-${serial}${suffix}`;
};

export const leadsEndpoint = {
  path: '/internal/leads',
  method: 'post' as const,
  handler: async (req: PayloadRequest): Promise<Response> => {
    const denied = guardInternalKey(req, 'leads');
    if (denied) return denied;

    let body: LeadSubmission;
    try {
      body = (await req.json!()) as LeadSubmission;
    } catch {
      return Response.json({ error: 'invalid_json' }, { status: 400 });
    }

    // Honeypot: non-empty => silently accepted but discarded (never stored, never audited as lead).
    if (typeof body.honeypot === 'string' && body.honeypot.trim() !== '') {
      req.payload.logger.warn({ msg: 'lead honeypot triggered' });
      return Response.json({ referenceCode: 'LF-0000SINK' }, { status: 201 });
    }

    // Server-side re-validation (schema §5.3.3).
    const errors: string[] = [];
    if (!body.fullName || String(body.fullName).trim().length < 2 || String(body.fullName).length > 120) errors.push('fullName');
    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email))) errors.push('email');
    if (!body.message || String(body.message).trim().length < 10 || String(body.message).length > 2000) errors.push('message');
    if (!['custom_software', 'digital_products', 'cybersecurity', 'general'].includes(String(body.serviceInterest))) errors.push('serviceInterest');
    if (!isLocale(body.sourceLocale)) errors.push('sourceLocale');
    if (body.consent !== true) errors.push('consent');
    if (!body.idempotencyKey || String(body.idempotencyKey).length < 8) errors.push('idempotencyKey');
    if (errors.length > 0) return Response.json({ error: 'validation_failed', fields: errors }, { status: 422 });

    if (!body.ipHash || typeof body.ipHash !== 'string' || body.ipHash.length < 16) {
      return Response.json({ error: 'validation_failed', fields: ['ipHash'] }, { status: 422 });
    }
    if (rateLimited(body.ipHash)) {
      return Response.json({ error: 'rate_limited' }, { status: 429 });
    }

    const referenceCode = await nextReferenceCode(req);
    const created = await req.payload.create({
      collection: 'leads',
      overrideAccess: true,
      context: { skipAudit: true }, // audited explicitly below with lead_created
      data: {
        referenceCode,
        fullName: String(body.fullName).trim(),
        company: body.company ? String(body.company).trim().slice(0, 120) : undefined,
        email: String(body.email).toLowerCase().trim(),
        phone: body.phone ? String(body.phone).slice(0, 20) : undefined,
        serviceInterest: body.serviceInterest,
        message: String(body.message).trim(),
        sourceLocale: body.sourceLocale,
        pagePath: String(body.pagePath ?? '').slice(0, 300),
        consent: true,
        ipHash: body.ipHash,
        submittedAt: new Date().toISOString(),
        status: 'new',
      } as never,
    });

    await writeAudit(req, 'lead_created', { collection: 'leads', id: created.id, slug: referenceCode }, 'lead submitted via internal API');

    // Notification (async in spirit; environment-gated — §6.9). Failure never blocks the response.
    const formSettings = await req.payload.findGlobal({ slug: 'form-settings', overrideAccess: true });
    const recipients = ((formSettings as { notificationRecipients?: string[] }).notificationRecipients ?? []) as string[];
    void sendLeadNotification(recipients, {
      referenceCode,
      fullName: String(body.fullName).trim(),
      company: body.company ? String(body.company) : undefined,
      email: String(body.email),
      phone: body.phone ? String(body.phone) : undefined,
      serviceInterest: String(body.serviceInterest),
      message: String(body.message),
      sourceLocale: body.sourceLocale,
      pagePath: String(body.pagePath ?? ''),
    }).then((result) => {
      req.payload.logger.info({ msg: 'lead notification processed', referenceCode, ...result });
    });

    const result: LeadSubmissionResult = { referenceCode };
    return Response.json(result, { status: 201 });
  },
};

/** Shared HMAC helper — the WEB service uses the identical algorithm (LEAD_IP_HASH_SECRET). */
export const computeIpHash = (ip: string, secret: string): string =>
  createHmac('sha256', secret).update(ip).digest('hex').slice(0, 32);
