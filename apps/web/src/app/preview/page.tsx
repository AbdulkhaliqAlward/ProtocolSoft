'use client';

/**
 * Preview renderer (Phase 2 §6.7 + OD2).
 *
 * The one-time code travels in the URL FRAGMENT only (/preview#code=…). Fragments
 * are never transmitted to any server — not the web origin, not the proxy, not
 * Cloudflare — so the code cannot appear in application, proxy, or CDN access
 * logs. The browser posts the code once to /api/preview/exchange (server-side
 * verification + CMS exchange with atomic single-use redemption), then the URL is
 * cleaned via history.replaceState. Page and exchange responses are
 * no-store/no-referrer/noindex (next.config headers).
 */
import React from 'react';

interface PreviewState {
  kind: 'idle' | 'loading' | 'invalid' | 'expired' | 'ready';
  messageAr: string;
  messageEn: string;
  snapshot?: Record<string, unknown>;
  collection?: string;
  locale?: string;
}

const IDLE_AR = 'افتح المعاينة من لوحة التحكم — هذه الصفحة تنتظر رمز معاينة صالحاً للاستخدام مرة واحدة.';
const IDLE_EN = 'Open a preview from the admin panel — this page awaits a valid one-time preview code.';
const EXPIRED_AR = 'انتهت صلاحية رمز المعاينة أو استُخدم مسبقاً. اطلب رمزاً جديداً من لوحة التحكم.';
const EXPIRED_EN = 'This preview code has expired or was already used. Request a new one from the admin panel.';
const INVALID_AR = 'تعذر تبادل رمز المعاينة — الرمز غير صالح أو استُخدم مسبقاً أو انتهت صلاحيته.';
const INVALID_EN = 'Preview code exchange failed — the code is invalid, already used, or expired.';

const PreviewInner = ({ state }: { state: PreviewState }) => {
  const isReady = state.kind === 'ready';
  const title = isReady
    ? 'معاينة مسودة / Draft preview'
    : state.kind === 'idle'
      ? 'معاينة / Preview'
      : 'رمز المعاينة غير صالح / Invalid preview code';
  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px 128px' }}>
      <p className="preview-frame" role="status">
        {isReady ? (
          <>
            معاينة مسودة — <code>{state.collection}</code> / draft preview — noindex, no-store
          </>
        ) : (
          title
        )}
      </p>
      <h1 style={{ marginTop: 48 }}>{title}</h1>
      {!isReady && <p style={{ color: 'var(--color-text-muted)' }}>{state.messageAr}</p>}
      {!isReady && <p style={{ color: 'var(--color-text-muted)' }}>{state.messageEn}</p>}
      {isReady && <PreviewSnapshot snapshot={state.snapshot ?? {}} />}
    </main>
  );
};

const PreviewSnapshot = ({ snapshot }: { snapshot: Record<string, unknown> }) => {
  // Locale-scoped snapshots resolve localized fields to plain strings; tolerate
  // legacy {ar,en} shapes defensively.
  const pick = (v: unknown): string | null => {
    if (typeof v === 'string' && v.length > 0) return v;
    if (v && typeof v === 'object') {
      const loc = v as { ar?: string; en?: string };
      return loc.ar ?? loc.en ?? null;
    }
    return null;
  };
  const title = pick(snapshot.title);
  const summary = pick(snapshot.summary);
  return (
    <article style={{ border: '1px solid var(--color-border)', borderRadius: 16, padding: 32, background: 'var(--color-surface)' }}>
      <h2>{title ?? '(بدون عنوان / untitled)'}</h2>
      {summary && <p style={{ color: 'var(--color-text-muted)' }}>{summary}</p>}
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
        عرض مبسّط للمسودة في أساس المرحلة 4 — العرض الكامل لكل نوع محتوى يُبنى في المرحلة 6/7. / Simplified foundation rendering — full per-type preview lands in Phase 6/7.
      </p>
    </article>
  );
};

/** Reads the code from the fragment, exchanges it once, and cleans the URL. */
const PreviewBridge = () => {
  const [state, setState] = React.useState<PreviewState>({
    kind: 'idle',
    messageAr: IDLE_AR,
    messageEn: IDLE_EN,
  });

  React.useEffect(() => {
    // FRAGMENT-ONLY transport (approved Phase 4 flow): the code may arrive ONLY
    // via /preview#code=… — fragments are never sent to any server, proxy, or
    // CDN, so the code cannot be logged in transit. Query-string codes
    // (/preview?code=…) are REJECTED outright: never read, never migrated,
    // never exchanged — a query value may already have been logged upstream.
    const hasQueryCode = new URLSearchParams(window.location.search).has('code');
    if (hasQueryCode) {
      setState({ kind: 'invalid', messageAr: INVALID_AR, messageEn: INVALID_EN });
      return;
    }
    const code = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('code');
    if (!code) return;

    setState({ kind: 'loading', messageAr: '', messageEn: '' });
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/preview/exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
          cache: 'no-store',
          referrerPolicy: 'no-referrer',
        });
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as { reason?: string };
          if (cancelled) return;
          setState({
            kind: err.reason === 'expired' ? 'expired' : 'invalid',
            messageAr: err.reason === 'expired' ? EXPIRED_AR : INVALID_AR,
            messageEn: err.reason === 'expired' ? EXPIRED_EN : INVALID_EN,
          });
          return;
        }
        const data = (await res.json()) as {
          collection: string;
          locale: string;
          snapshot: Record<string, unknown>;
        };
        if (cancelled) return;
        setState({
          kind: 'ready',
          messageAr: '',
          messageEn: '',
          snapshot: data.snapshot,
          collection: data.collection,
          locale: data.locale,
        });
      } catch {
        if (!cancelled) {
          setState({ kind: 'invalid', messageAr: INVALID_AR, messageEn: INVALID_EN });
        }
      } finally {
        // Remove the one-time code from the address bar (OD2).
        try {
          window.history.replaceState({}, '', window.location.pathname);
        } catch {
          /* best-effort cleanup */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return <PreviewInner state={state} />;
};

const Page = () => (
  <React.Suspense fallback={<PreviewInner state={{ kind: 'idle', messageAr: '', messageEn: '' }} />}>
    <PreviewBridge />
  </React.Suspense>
);

export default Page;
