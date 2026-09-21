/**
 * Cache-revalidation push (Phase 2 §6.5): on publish/unpublish/apply, the CMS calls
 * the web service's /api/web-internal/revalidate with CMS_TO_WEB_REVALIDATE_KEY over
 * the private Docker network. Failures are logged, never blocking.
 */
import type { CollectionAfterChangeHook, GlobalAfterChangeHook } from 'payload';

const tagsFor = (slug: string, doc?: Record<string, unknown>): string[] => {
  const tags = [slug];
  if (doc?.slug) tags.push(`${slug}:${String(doc.slug)}`);
  return tags;
};

const pushRevalidation = async (tags: string[]): Promise<void> => {
  const url = process.env.WEB_INTERNAL_URL;
  const key = process.env.CMS_TO_WEB_REVALIDATE_KEY;
  if (!url || !key) return; // not configured (e.g., local scripts) — skip silently
  try {
    await fetch(`${url}/api/web-internal/revalidate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-internal-key': key },
      body: JSON.stringify({ tags }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // non-blocking by design (Phase 2 §6.5)
  }
};

export const revalidateOnPublish =
  (slug: string): CollectionAfterChangeHook =>
  async ({ doc, previousDoc }) => {
    const publishedNow = doc._status === 'published' && (!previousDoc || previousDoc._status !== 'published');
    const unpublished = doc._status !== 'published' && previousDoc?._status === 'published';
    const updatedWhilePublished = doc._status === 'published' && previousDoc?._status === 'published';
    if (publishedNow || unpublished || updatedWhilePublished) {
      await pushRevalidation(tagsFor(slug, doc));
    }
    return doc;
  };

export const revalidateGlobal =
  (slug: string): GlobalAfterChangeHook =>
  async ({ doc }) => {
    await pushRevalidation(tagsFor(slug));
    return doc;
  };
