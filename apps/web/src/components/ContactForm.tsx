'use client';

/**
 * Contact form (Phase 3 §16.6 + D-5). Required: full name, work email, service
 * interest (4 tiles — NO EDR option), message, privacy consent. Optional: phone,
 * company name. Localized guidance warns against submitting passwords, API keys,
 * or confidential secrets. Honeypot is visually hidden. Success replaces the form
 * with the confirmation panel (reference code in mono); nothing is stored
 * client-side. Direct channels repeat on failure (CMS-down path).
 */
import { useMemo, useRef, useState } from 'react';

import type { Locale, PublicContactConfig } from '@protocol-soft/shared';

import { localePath } from './siteChrome';

export type ServiceInterest = 'custom_software' | 'digital_products' | 'cybersecurity' | 'general';

export const SERVICE_OPTIONS: Array<{ value: ServiceInterest; ar: string; en: string }> = [
  { value: 'custom_software', ar: 'تطوير أنظمة مخصصة', en: 'Custom Systems Development' },
  { value: 'digital_products', ar: 'منتجات ومنصات رقمية', en: 'Digital Products & Platforms' },
  { value: 'cybersecurity', ar: 'خدمات الأمن السيبراني', en: 'Cybersecurity Services' },
  { value: 'general', ar: 'استفسار عام', en: 'General Inquiry' },
];

type FormState = {
  fullName: string;
  company: string;
  email: string;
  phone: string;
  serviceInterest: ServiceInterest;
  message: string;
  consent: boolean;
  honeypot: string;
};

type Props = {
  locale: Locale;
  confirmationMessage: string;
  initialService?: ServiceInterest;
  directChannels?: { email?: string; phone?: string };
};

const T = (locale: Locale, ar: string, en: string): string => (locale === 'ar' ? ar : en);

export const ContactForm = ({ locale, confirmationMessage, initialService = 'general', directChannels }: Props) => {
  const [form, setForm] = useState<FormState>({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    serviceInterest: initialService,
    message: '',
    consent: false,
    honeypot: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [reference, setReference] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  // One idempotency key per mounted form instance; "send another" remounts it.
  const idempotencyKey = useMemo(() => (globalThis.crypto?.randomUUID?.() ?? `k-${Date.now()}-${Math.random()}`), []);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]): void => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (form.fullName.trim().length < 2) next.fullName = T(locale, 'يرجى إدخال الاسم الكامل.', 'Please enter your full name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = T(locale, 'يرجى إدخال بريد إلكتروني صحيح.', 'Please enter a valid email address.');
    if (form.message.trim().length < 10) next.message = T(locale, 'يرجى كتابة 10 أحرف على الأقل.', 'Please write at least 10 characters.');
    if (form.message.length > 2000) next.message = T(locale, 'الحد الأقصى 2000 حرف.', 'Maximum 2000 characters.');
    if (!form.consent) next.consent = T(locale, 'يلزم الموافقة على سياسة الخصوصية.', 'Privacy policy consent is required.');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (status === 'sending') return;
    if (!validate()) {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], input[name="consent"]')?.focus();
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          company: form.company.trim() || undefined,
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          serviceInterest: form.serviceInterest,
          message: form.message.trim(),
          sourceLocale: locale,
          pagePath: window.location.pathname,
          honeypot: form.honeypot,
          consent: form.consent,
          idempotencyKey,
        }),
      });
      if (res.status === 201) {
        const data = (await res.json()) as { referenceCode?: string };
        setReference(data.referenceCode ?? '');
        setStatus('success');
        return;
      }
      if (res.status === 422 || res.status === 429) {
        setStatus('error');
        return;
      }
      setStatus('error');
    } catch {
      setStatus('error');
    }
  };

  const labels = {
    fullName: T(locale, 'الاسم الكامل', 'Full name'),
    company: T(locale, 'اسم الشركة (اختياري)', 'Company name (optional)'),
    email: T(locale, 'البريد الإلكتروني للعمل', 'Work email'),
    phone: T(locale, 'رقم الهاتف (اختياري)', 'Phone (optional)'),
    service: T(locale, 'مجال الاهتمام', 'Service interest'),
    message: T(locale, 'رسالتك', 'Your message'),
    consent: T(locale, 'أوافق على سياسة الخصوصية', 'I agree to the Privacy Policy'),
    submit: T(locale, 'إرسال الطلب', 'Send request'),
    sending: T(locale, 'جارٍ الإرسال…', 'Sending…'),
    secrets: T(locale, 'يرجى عدم إرسال كلمات مرور أو مفاتيح API أو أسرار عمل سرية عبر هذا النموذج.', 'Please do not submit passwords, API keys, or confidential secrets through this form.'),
    errorTitle: T(locale, 'تعذّر إرسال الطلب', 'Your request could not be sent'),
    errorBody: T(locale, 'حدث خطأ أثناء الإرسال. يمكنك المحاولة مرة أخرى أو استخدام قنوات التواصل المباشرة.', 'Something went wrong while sending. You can try again or use the direct contact channels.'),
    retry: T(locale, 'المحاولة مجدداً', 'Try again'),
    successTitle: T(locale, 'تم استلام طلبك', 'Your request has been received'),
    reference: T(locale, 'رقم الطلب المرجعي', 'Reference code'),
    another: T(locale, 'إرسال طلب آخر', 'Send another request'),
    rateLimited: T(locale, 'تم استلام عدة طلبات من جهازك خلال وقت قصير. يرجى المحاولة بعد قليل.', 'Several requests were received from your device in a short time. Please try again shortly.'),
  };

  if (status === 'success') {
    return (
      <div className="form-banner form-banner--success" role="status">
        <h2>{labels.successTitle}</h2>
        <p>{confirmationMessage}</p>
        {reference && (
          <p>
            {labels.reference}: <strong className="mono bidi">{reference}</strong>
          </p>
        )}
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => {
            setStatus('idle');
            setReference('');
            setForm({ fullName: '', company: '', email: '', phone: '', serviceInterest: 'general', message: '', consent: false, honeypot: '' });
          }}
        >
          {labels.another}
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate>
      {status === 'error' && (
        <div className="form-banner form-banner--error" role="alert">
          <h3>{labels.errorTitle}</h3>
          <p>{form.message && errors.message == null ? labels.errorBody : labels.errorBody}</p>
          <ul className="channel-list" style={{ marginBottom: 12 }}>
            {directChannels?.email && <li><a href={`mailto:${directChannels.email}`} className="bidi">{directChannels.email}</a></li>}
            {directChannels?.phone && <li><a href={`tel:${directChannels.phone}`} className="bidi">{directChannels.phone}</a></li>}
          </ul>
          <button type="button" className="btn btn--secondary" onClick={() => setStatus('idle')}>{labels.retry}</button>
        </div>
      )}

      {/* Honeypot — hidden from humans and AT; bots filling it get silently sunk. */}
      <div className="field field--hp" aria-hidden="true">
        <label htmlFor="cf-website">Website</label>
        <input id="cf-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={form.honeypot} onChange={(e) => set('honeypot', e.target.value)} />
      </div>

      <div className="field">
        <label htmlFor="cf-name">{labels.fullName} <span className="field__req" aria-hidden="true">*</span></label>
        <input id="cf-name" name="fullName" className="input" type="text" required autoComplete="name" value={form.fullName}
          onChange={(e) => set('fullName', e.target.value)} aria-invalid={errors.fullName ? true : undefined} aria-describedby={errors.fullName ? 'cf-name-err' : undefined} />
        {errors.fullName && <span className="field__error" id="cf-name-err">{errors.fullName}</span>}
      </div>

      <div className="field">
        <label htmlFor="cf-email">{labels.email} <span className="field__req" aria-hidden="true">*</span></label>
        <input id="cf-email" name="email" className="input" type="email" required autoComplete="email" dir="ltr" value={form.email}
          onChange={(e) => set('email', e.target.value)} aria-invalid={errors.email ? true : undefined} aria-describedby={errors.email ? 'cf-email-err' : undefined} />
        {errors.email && <span className="field__error" id="cf-email-err">{errors.email}</span>}
      </div>

      <div className="field" role="radiogroup" aria-labelledby="cf-service-label">
        <span className="field__legend" id="cf-service-label">{labels.service} <span className="field__req" aria-hidden="true">*</span></span>
        <ul className="choice-row">
          {SERVICE_OPTIONS.map((opt) => (
            <li key={opt.value}>
              <label className="choice">
                <input type="radio" name="serviceInterest" value={opt.value} checked={form.serviceInterest === opt.value}
                  onChange={() => set('serviceInterest', opt.value)} />
                <span>{locale === 'ar' ? opt.ar : opt.en}</span>
                {/* Selection cue beyond the radio circle (never color alone) */}
                <span className="choice__tick" aria-hidden="true">✓</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="field">
        <label htmlFor="cf-message">{labels.message} <span className="field__req" aria-hidden="true">*</span></label>
        <textarea id="cf-message" name="message" className="textarea" required maxLength={2000} value={form.message}
          onChange={(e) => set('message', e.target.value)} aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? 'cf-message-err' : 'cf-message-helper'} />
        <span className="field__helper" id="cf-message-helper">
          <span className="bidi">{form.message.length}/2000</span> — {labels.secrets}
        </span>
        {errors.message && <span className="field__error" id="cf-message-err">{errors.message}</span>}
      </div>

      <div className="form-cols">
        <div className="field">
          <label htmlFor="cf-phone">{labels.phone}</label>
          <input id="cf-phone" name="phone" className="input" type="tel" autoComplete="tel" dir="ltr" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="cf-company">{labels.company}</label>
          <input id="cf-company" name="company" className="input" type="text" autoComplete="organization" value={form.company} onChange={(e) => set('company', e.target.value)} />
        </div>
      </div>

      <div className="field">
        <div className="checkbox-row">
          <input id="cf-consent" name="consent" type="checkbox" required checked={form.consent}
            onChange={(e) => set('consent', e.target.checked)} aria-invalid={errors.consent ? true : undefined} aria-describedby={errors.consent ? 'cf-consent-err' : undefined} />
          <label htmlFor="cf-consent">
            {labels.consent} (<a href={localePath(locale, '/privacy')} className="inline-link">{T(locale, 'سياسة الخصوصية', 'Privacy Policy')}</a>)
          </label>
        </div>
        {errors.consent && <span className="field__error" id="cf-consent-err">{errors.consent}</span>}
      </div>

      <button type="submit" className="btn btn--primary btn--lg" disabled={status === 'sending'} aria-busy={status === 'sending'}>
        {status === 'sending' ? labels.sending : labels.submit}
      </button>
    </form>
  );
};
