'use client';
/**
 * Sidebar panel replacing the read-only `publishedLocales` field: shows which
 * languages are live, and gives editors the per-language publish / unpublish
 * and preview actions (POST /api/publish/... and /api/internal/preview/issue).
 * All rules stay on the server (Arabic first, completeness, legal and
 * readiness gates); this panel only explains the server's answer in words.
 */
import { useDocumentInfo, useField } from '@payloadcms/ui';
import { useState } from 'react';

type Locale = 'ar' | 'en';
const NAMES: Record<Locale, string> = { ar: 'العربية', en: 'الإنجليزية' };

const explain = (body: { error?: string; missing?: string[]; failingChecks?: string[] }): string => {
  switch (body.error) {
    case 'incomplete_locale':
      return `لا يمكن النشر قبل تعبئة هذه الحقول بهذه اللغة: ${(body.missing ?? []).join('، ')}`;
    case 'requires_arabic_published':
      return 'انشر النسخة العربية أولاً، ثم الإنجليزية.';
    case 'legal_publish_requires_super_admin':
      return 'نشر الصفحات القانونية متاح لمدير النظام (Super Admin) فقط.';
    case 'legal_review_required':
      return 'سجّل المراجعة القانونية أولاً: املأ «legalReviewedBy» و«legalReviewedAt» في الشريط الجانبي واحفظ، ثم انشر.';
    case 'public_readiness_gate_failed':
      return `لم يجتز المحتوى شروط الجاهزية للنشر: ${(body.failingChecks ?? []).join('، ')}`;
    case 'forbidden':
      return 'ليست لديك صلاحية النشر.';
    default:
      return 'تعذّر تنفيذ الطلب. حدّث الصفحة وحاول مرة أخرى.';
  }
};

export const PublishPanel = ({ path }: { path: string }) => {
  const { id, collectionSlug } = useDocumentInfo();
  const { value } = useField<string[]>({ path });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const live = (Array.isArray(value) ? value : []) as Locale[];

  if (!id) {
    return <p style={{ fontSize: 13, opacity: 0.8 }}>احفظ المستند أولاً، ثم تظهر هنا أزرار المعاينة والنشر لكل لغة.</p>;
  }

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
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ ok: false, text: explain(body) });
        return;
      }
      setMessage({ ok: true, text: action === 'publish' ? `نُشرت النسخة ${NAMES[locale]}. يجري تحديث الصفحة…` : `أُلغي نشر النسخة ${NAMES[locale]}. يجري تحديث الصفحة…` });
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
      setMessage({ ok: false, text: 'تعذّر إنشاء رابط المعاينة. احفظ المسودة ثم حاول مرة أخرى.' });
      return;
    }
    if (tab) tab.location.href = body.url;
    else window.location.href = body.url;
  };

  const button = { padding: '6px 10px', borderRadius: 6, border: '1px solid currentColor', background: 'transparent', cursor: 'pointer', fontSize: 13 } as const;

  return (
    <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
      <strong style={{ fontSize: 14 }}>النشر حسب اللغة / Publish per language</strong>
      <p style={{ fontSize: 12, opacity: 0.8, margin: 0 }}>
        احفظ تعديلاتك أولاً. تُنشر العربية قبل الإنجليزية، ولا يظهر على الموقع إلا اللغة المنشورة هنا. لتحديث نسخة منشورة، اضغط «نشر التغييرات» (Publish changes) أعلى الصفحة.
      </p>
      {(['ar', 'en'] as const).map((locale) => {
        const isLive = live.includes(locale);
        return (
          <div key={locale} style={{ display: 'grid', gap: 6, padding: 10, borderRadius: 8, border: '1px solid var(--theme-elevation-150)' }}>
            <span style={{ fontSize: 13 }}>
              {NAMES[locale]}: <b>{isLive ? 'منشورة على الموقع' : 'غير منشورة'}</b>
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <button type="button" style={button} disabled={busy} onClick={() => void preview(locale)}>معاينة</button>
              {isLive ? (
                <button type="button" style={button} disabled={busy} onClick={() => void setStatus('unpublish', locale)}>إلغاء النشر</button>
              ) : (
                <button type="button" style={{ ...button, fontWeight: 600 }} disabled={busy} onClick={() => void setStatus('publish', locale)}>نشر</button>
              )}
            </div>
          </div>
        );
      })}
      {message && (
        <p role="status" style={{ fontSize: 13, margin: 0, color: message.ok ? 'var(--theme-success-500)' : 'var(--theme-error-500)' }}>{message.text}</p>
      )}
    </div>
  );
};
