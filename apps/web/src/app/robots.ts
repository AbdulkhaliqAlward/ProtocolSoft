import type { MetadataRoute } from 'next';

/** robots: public domain only. /preview and /api are never indexed; the admin
 *  subdomain is a separate service with its own noindex + edge policy. */
export default function robots(): MetadataRoute.Robots {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://protosoftdev.com';
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/preview', '/api'] }],
    sitemap: `${site}/sitemap.xml`,
  };
}
