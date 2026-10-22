'use client';
/**
 * Sidebar panel replacing the read-only `publishedLocales` field: shows which
 * languages are live, and gives editors the per-language publish / unpublish
 * and preview actions (POST /api/publish/... and /api/internal/preview/issue).
 * All rules stay on the server (Arabic first, completeness, legal and
 * readiness gates); this panel only explains the server's answer in words.
 * It speaks the admin's language (Arabic or English). Styles: custom.scss.
 */
import { useDocumentInfo, useField, useTranslation } from '@payloadcms/ui';
import { useState } from 'react';

type Locale = 'ar' | 'en';
type Lang = 'ar' | 'en';

const COPY = {
  ar: {
    title: 'النشر حسب اللغة',
    intro: 'احفظ تعديلاتك أولاً. تُنشر العربية قبل الإنجليزية، ولا يظهر على الموقع إلا ما نُشر هنا. لتحديث نسخة منشورة اضغط «نشر التغييرات» أعلى الصفحة.',
    saveFirst: 'احفظ المستند أولاً، ثم تظهر هنا أزرار المعاينة والنشر لكل لغة.',
    names: { ar: 'العربية', en: 'الإنجليزية' },
    live: 'منشورة على الموقع',
    notLive: 'غير منشورة',
    preview: 'معاينة',
    publish: 'نشر',
    unpublish: 'إلغاء النشر',
    published: (n: string) => `نُشرت النسخة ${n}. يجري تحديث الصفحة…`,
    unpublished: (n: string) => `أُلغي نشر النسخة ${n}. يجري تحديث الصفحة…`,
    previewFailed: 'تعذّر إنشاء رابط المعاينة. احفظ المسودة ثم حاول مرة أخرى.',
    sep: '، ',
    errors: {
      incomplete_locale: 'لا يمكن النشر قبل تعبئة هذه الحقول بهذه اللغة: ',
      validation_failed: 'لم يُنشر المحتوى لأن هذه الحقول ناقصة أو غير صحيحة بهذه اللغة. عبّئها واحفظ ثم انشر: ',
      requires_arabic_published: 'انشر النسخة العربية أولاً، ثم الإنجليزية.',
      legal_publish_requires_super_admin: 'نشر الصفحات القانونية متاح لمدير النظام فقط.',
      legal_review_required: 'سجّل المراجعة القانونية أولاً: املأ «المراجِع القانوني» و«تاريخ المراجعة القانونية» واحفظ، ثم انشر.',
      public_readiness_gate_failed: 'لم يجتز المحتوى شروط الجاهزية للنشر: ',
      forbidden: 'ليست لديك صلاحية النشر.',
      default: 'تعذّر تنفيذ الطلب. حدّث الصفحة وحاول مرة أخرى. رمز الخطأ: ',
    },
  },
  en: {
    title: 'Publish per language',
    intro: 'Save your changes first. Arabic is published before English, and only languages published here appear on the site. To update a live version, use “Publish changes” at the top.',
    saveFirst: 'Save the document first; preview and publish buttons for each language then appear here.',
    names: { ar: 'Arabic', en: 'English' },
    live: 'Live on the site',
    notLive: 'Not published',
    preview: 'Preview',
    publish: 'Publish',
    unpublish: 'Unpublish',
    published: (n: string) => `${n} version published. Refreshing…`,
    unpublished: (n: string) => `${n} version unpublished. Refreshing…`,
    previewFailed: 'Could not create a preview link. Save the draft and try again.',
    sep: ', ',
    errors: {
      incomplete_locale: 'Fill these fields in this language before publishing: ',
      validation_failed: 'Not published: these fields are missing or invalid in this language. Fill them, save, then publish: ',
      requires_arabic_published: 'Publish the Arabic version first, then English.',
      legal_publish_requires_super_admin: 'Only the system admin can publish legal pages.',
      legal_review_required: 'Record the legal review first (reviewer and review date), save, then publish.',
      public_readiness_gate_failed: 'The content does not pass the publishing checks yet: ',
      forbidden: 'You do not have permission to publish.',
      default: 'The request failed. Refresh the page and try again. Error code: ',
    },
  },
} as const;

type ErrorBody = { error?: string; missing?: string[]; failingChecks?: string[]; detail?: string; status?: number };

export const PublishPanel = ({ path }: { path: string }) => {
  const { id, collectionSlug } = useDocumentInfo();
  const { value } = useField<string[]>({ path });
  const { i18n } = useTranslation();
  const lang: Lang = i18n.language === 'en' ? 'en' : 'ar';
  const c = COPY[lang];
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const live = (Array.isArray(value) ? value : []) as Locale[];

  const explain = (body: ErrorBody): string => {
    const e = c.errors;
    switch (body.error) {
      case 'incomplete_locale':
      case 'validation_failed':
        return e[body.error] + (body.missing ?? []).join(c.sep);
      case 'public_readiness_gate_failed':
        return e.public_readiness_gate_failed + (body.failingChecks ?? []).join(c.sep);
      case 'requires_arabic_published':
      case 'legal_publish_requires_super_admin':
      case 'legal_review_required':
      case 'forbidden':
        return e[body.error];
      default:
        // Unexpected answer: show the status and server reason so it can be reported.
        return e.default + [body.status, body.error, body.detail].filter(Boolean).join(' · ');
    }
  };

  if (!id) return <p className="ps-publish__note" dir={lang === 'ar' ? 'rtl' : 'ltr'}>{c.saveFirst}</p>;

  const setStatus = async (action: 'publish' | 'unpublish', locale: Locale): Promise<void> => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/publish/${collectionSlug}/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action, locale }),
      });
      const body = (await res.json().catch(() => ({}))) as ErrorBody;
      if (!res.ok) {
        setMessage({ ok: false, text: explain({ ...body, status: res.status }) });
        return;
      }
      setMessage({ ok: true, text: action === 'publish' ? c.published(c.names[locale]) : c.unpublished(c.names[locale]) });
      window.setTimeout(() => window.location.reload(), 900);
    } finally {
      setBusy(false);
    }
  };

  const preview = async (locale: Locale): Promise<void> => {
    // Open the tab synchronously (popup blockers), then point it at the preview.
    const tab = window.open('', '_blank');
    setMessage(null);
    const res = await fetch('/api/internal/preview/issue', {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ collection: collectionSlug, docId: id, locale }),
    });
    const body = (await res.json().catch(() => ({}))) as { url?: string };
    if (!res.ok || !body.url) {
      tab?.close();
      setMessage({ ok: false, text: c.previewFailed });
      return;
    }
    if (tab) tab.location.href = body.url;
    else window.location.href = body.url;
  };

  return (
    <section className="ps-publish" dir={lang === 'ar' ? 'rtl' : 'ltr'} aria-label={c.title}>
      <h3 className="ps-publish__title">{c.title}</h3>
      <p className="ps-publish__note">{c.intro}</p>
      {(['ar', 'en'] as const).map((locale) => {
        const isLive = live.includes(locale);
        return (
          <div key={locale} className="ps-publish__row">
            <div className="ps-publish__state">
              <span className="ps-publish__lang">{c.names[locale]}</span>
              <span className={`ps-publish__pill${isLive ? ' ps-publish__pill--live' : ''}`}>{isLive ? c.live : c.notLive}</span>
            </div>
            <div className="ps-publish__actions">
              <button type="button" className="ps-publish__btn" disabled={busy} onClick={() => void preview(locale)}>{c.preview}</button>
              {isLive ? (
                <button type="button" className="ps-publish__btn" disabled={busy} onClick={() => void setStatus('unpublish', locale)}>{c.unpublish}</button>
              ) : (
                <button type="button" className="ps-publish__btn ps-publish__btn--primary" disabled={busy} onClick={() => void setStatus('publish', locale)}>{c.publish}</button>
              )}
            </div>
          </div>
        );
      })}
      {message && (
        <p role="status" className={`ps-publish__msg${message.ok ? ' ps-publish__msg--ok' : ' ps-publish__msg--err'}`}>{message.text}</p>
      )}
    </section>
  );
};
