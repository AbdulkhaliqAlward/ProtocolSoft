/* Payload API routes (admin + internal endpoints) with login rate limiting (Phase 2 §10.7).
   The admin domain sits behind Cloudflare Access + MFA; this adds the inner layer. */
import { REST_DELETE, REST_GET, REST_OPTIONS, REST_PATCH, REST_POST, REST_PUT } from '@payloadcms/next/routes';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

/** Payload REST handler shape — matches @payloadcms/next/routes exports */
type PayloadRouteArgs = { params: Promise<{ slug?: string[] }> };
type PayloadRouteHandler = (request: Request, args: PayloadRouteArgs) => Promise<Response>;

/* ── Login rate limiting: progressive backoff per email+IP (in-memory; Redis in Phase 8 hardening) ── */
const WINDOW_MS = 10 * 60_000;
type Attempt = { fails: number; windowStart: number; blockedUntil: number };
const attempts = new Map<string, Attempt>();

const attemptKey = (request: Request): string => {
  const ip =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'local';
  return ip;
};

const throttleResponse = (retryAfterSeconds: number): Response =>
  Response.json(
    { message: 'Too many login attempts. Try again later.' },
    { status: 429, headers: { 'retry-after': String(retryAfterSeconds) } },
  );

const withLoginRateLimit = (handler: PayloadRouteHandler): PayloadRouteHandler => {
  return async (request: Request, args: PayloadRouteArgs): Promise<Response> => {
    const url = new URL(request.url);
    const isLogin = url.pathname.endsWith('/users/login') && request.method === 'POST';
    if (!isLogin) return handler(request, args);

    const key = attemptKey(request);
    const now = Date.now();
    const entry = attempts.get(key);
    if (entry && entry.blockedUntil > now) {
      return throttleResponse(Math.ceil((entry.blockedUntil - now) / 1000));
    }

    // Read the body exactly ONCE and hand the handler a fresh Request.
    // request.clone() + handler-read leaves a half-open tee stream that Next
    // cannot drain — the login response then never flushes to the client.
    const rawBody = await request.text();
    let email = '';
    try {
      email = String((JSON.parse(rawBody) as { email?: string }).email ?? '').toLowerCase();
    } catch {
      /* unparseable body — IP-only key still applies */
    }
    const replay = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: rawBody,
      duplex: 'half',
    } as RequestInit);
    const payloadResponse = await handler(replay, args);

    if (payloadResponse.status === 401 || payloadResponse.status === 422) {
      const composite = `${key}:${email}`;
      const e = attempts.get(composite) ?? { fails: 0, windowStart: now, blockedUntil: 0 };
      if (now - e.windowStart > WINDOW_MS) {
        e.fails = 0;
        e.windowStart = now;
      }
      e.fails += 1;
      // Progressive backoff: 5 fails -> 1 min, 8 -> 5 min, 10 -> 15 min
      const blockMinutes = e.fails >= 10 ? 15 : e.fails >= 8 ? 5 : e.fails >= 5 ? 1 : 0;
      e.blockedUntil = blockMinutes > 0 ? now + blockMinutes * 60_000 : 0;
      attempts.set(composite, e);
      attempts.set(key, e);

      try {
        const payload = await getPayload({ config: configPromise });
        payload.logger.warn({ msg: 'login failure (rate-limited tracking)', prefix: 'auth' });
      } catch {
        /* logging best-effort */
      }
    } else if (payloadResponse.status === 200) {
      attempts.delete(key);
    }

    return payloadResponse;
  };
};

export const GET = withLoginRateLimit(REST_GET(configPromise));
export const POST = withLoginRateLimit(REST_POST(configPromise));
export const DELETE = withLoginRateLimit(REST_DELETE(configPromise));
export const PATCH = withLoginRateLimit(REST_PATCH(configPromise));
export const PUT = withLoginRateLimit(REST_PUT(configPromise));
export const OPTIONS = withLoginRateLimit(REST_OPTIONS(configPromise));
