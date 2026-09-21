/**
 * WhatsApp CTA (WA1 confirmed behavior): ALWAYS visually present.
 * - configured  -> active wa.me link
 * - unconfigured (production) -> inert button + localized non-deceptive availability
 *   message directing to the contact form and email; NEVER a dummy/arbitrary number.
 * Dev/staging may use a clearly marked test value (handled by the cms contact-config).
 */
import type { PublicContactConfig } from '@protocol-soft/shared';

export const WhatsAppCta = ({
  whatsapp,
  locale,
}: {
  whatsapp: PublicContactConfig['channels']['whatsapp'];
  locale: 'ar' | 'en';
}) => {
  const label = locale === 'ar' ? 'واتساب' : 'WhatsApp';
  if (whatsapp.status === 'configured' && whatsapp.url) {
    return (
      <a href={whatsapp.url} target="_blank" rel="noopener noreferrer" className="wa-cta wa-cta--active">
        {label}
      </a>
    );
  }
  return (
    <span className="wa-cta wa-cta--unavailable" aria-disabled="true">
      {label}
      <small>
        {locale === 'ar'
          ? 'غير متاح حالياً — يرجى استخدام نموذج التواصل أو البريد الإلكتروني'
          : 'Not yet available — please use the contact form or email'}
      </small>
    </span>
  );
};
