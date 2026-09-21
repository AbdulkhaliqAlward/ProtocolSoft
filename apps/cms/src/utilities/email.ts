/**
 * Transactional email (Phase 2 §7 + §6.9): lead notifications only.
 * Delivery is environment-gated — sending is enabled ONLY when
 * DEPLOYMENT_ENV=production AND a provider key exists; otherwise the message is
 * captured to a sink (logged + sink address returned) so test data can never
 * trigger real delivery.
 */
export interface LeadEmailPayload {
  referenceCode: string;
  fullName: string;
  company?: string;
  email: string;
  phone?: string;
  serviceInterest: string;
  message: string;
  sourceLocale: string;
  pagePath: string;
}

export interface EmailSendResult {
  sent: boolean;
  skippedReason?: string;
  sinkAddress?: string;
}

const renderBody = (lead: LeadEmailPayload): string =>
  [
    `New lead ${lead.referenceCode}`,
    `Name: ${lead.fullName}`,
    lead.company ? `Company: ${lead.company}` : null,
    `Email: ${lead.email}`,
    lead.phone ? `Phone: ${lead.phone}` : null,
    `Service interest: ${lead.serviceInterest}`,
    `Locale: ${lead.sourceLocale}`,
    `Page: ${lead.pagePath}`,
    '',
    lead.message,
  ]
    .filter(Boolean)
    .join('\n');

export const sendLeadNotification = async (recipients: string[], lead: LeadEmailPayload): Promise<EmailSendResult> => {
  const isProduction = process.env.DEPLOYMENT_ENV === 'production';
  const apiKey = process.env.RESEND_API_KEY;
  const sink = process.env.EMAIL_SINK_ADDRESS ?? 'notifications-sink@example.invalid';

  if (!isProduction || !apiKey || recipients.length === 0) {
    // Capture-to-sink mode (dev/staging or unconfigured): structured log only.
    console.info('[email:sink]', { sink, recipientsCount: recipients.length, referenceCode: lead.referenceCode });
    return { sent: false, skippedReason: isProduction ? 'provider-not-configured' : 'non-production-environment', sinkAddress: sink };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: 'Protocol Soft <notifications@protosoftdev.com>',
        to: recipients,
        subject: `طلب جديد ${lead.referenceCode} — ${lead.serviceInterest}`,
        text: renderBody(lead),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`provider status ${res.status}`);
    return { sent: true };
  } catch (err) {
    // Email failure must never block the lead response (Phase 2 §7); retried by provider-side ops.
    console.error('[email:send-failed]', { referenceCode: lead.referenceCode, err: String(err) });
    return { sent: false, skippedReason: 'provider-error', sinkAddress: sink };
  }
};
