/**
 * WhatsApp link, rendered only when an official number is configured in the
 * CMS (callers pass the configured wa.me URL). No placeholder or "not yet
 * available" state is ever shown on the public site.
 */
export const WhatsAppCta = ({ url, locale }: { url: string; locale: 'ar' | 'en' }) => (
  <a href={url} target="_blank" rel="noopener noreferrer" className="wa-cta">
    {locale === 'ar' ? 'واتساب' : 'WhatsApp'}
  </a>
);
