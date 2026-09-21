/**
 * Web-internal revalidation endpoint (Phase 2 §6.5): called by the CMS on
 * publish/unpublish/apply. Accepts ONLY CMS_TO_WEB_REVALIDATE_KEY (revalidate
 * group — keys are not interchangeable; §6.1). Private Docker network only.
 */
import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

import type { RevalidateRequest } from '@protocol-soft/shared';

const timingSafeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  const expected = process.env.CMS_TO_WEB_REVALIDATE_KEY;
  const presented = request.headers.get('x-internal-key') ?? '';
  if (!expected || !presented || !timingSafeEqual(presented, expected)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const body = (await request.json().catch(() => ({}))) as Partial<RevalidateRequest>;
  const tags = Array.isArray(body.tags) ? body.tags.filter((t): t is string => typeof t === 'string').slice(0, 50) : [];
  for (const tag of tags) {
    revalidateTag(tag);
  }
  return NextResponse.json({ ok: true, revalidated: tags.length });
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: 'method_not_allowed' }, { status: 405 });
}
