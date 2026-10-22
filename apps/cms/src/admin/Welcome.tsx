/**
 * Dashboard header (beforeDashboard): a greeting, what needs attention (new
 * leads, items with an unpublished language), shortcuts to the pages editors
 * open most, and the three publishing steps. Counts are read server-side with
 * the viewer's own access, so a role only sees what it may open.
 */
import type { Payload, TypedUser } from 'payload';

type Lang = 'ar' | 'en';
type Props = { payload: Payload; user?: TypedUser | null; i18n?: { language?: string } };

const T = (lang: Lang, ar: string, en: string): string => (lang === 'ar' ? ar : en);

const count = async (fn: () => Promise<{ totalDocs: number }>): Promise<number | null> => {
  try {
    return (await fn()).totalDocs;
  } catch {
    return null; // no access for this role: the tile is not shown
  }
};

export const Welcome = async ({ payload, user, i18n }: Props) => {
  const lang: Lang = i18n?.language === 'en' ? 'en' : 'ar';
  const admin = payload.config.routes.admin;
  const site = (process.env.WEB_PUBLIC_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const asUser = { user: user ?? undefined, overrideAccess: false } as const;

  const [newLeads, servicesPending, pagesPending, about, privacy] = await Promise.all([
    count(() => payload.count({ collection: 'leads', where: { status: { equals: 'new' } }, ...asUser })),
    count(() => payload.count({ collection: 'services', where: { publishedLocales: { not_in: ['en'] } }, draft: true, ...asUser } as never)),
    count(() => payload.count({ collection: 'pages', where: { and: [{ slug: { in: ['about', 'privacy'] } }, { publishedLocales: { not_in: ['en'] } }] }, draft: true, ...asUser } as never)),
    payload.find({ collection: 'pages', where: { slug: { equals: 'about' } }, limit: 1, depth: 0, draft: true, ...asUser }).catch(() => null),
    payload.find({ collection: 'pages', where: { slug: { equals: 'privacy' } }, limit: 1, depth: 0, draft: true, ...asUser }).catch(() => null),
  ]);
  const pageLink = (res: typeof about) => (res?.docs[0] ? `${admin}/collections/pages/${res.docs[0].id}` : `${admin}/collections/pages`);
  const pending = (servicesPending ?? 0) + (pagesPending ?? 0);
  const name = (user as { name?: string } | null | undefined)?.name ?? '';

  const shortcuts: Array<{ href: string; title: string; hint: string }> = [
    { href: `${admin}/globals/homepage`, title: T(lang, 'الصفحة الرئيسية', 'Homepage'), hint: T(lang, 'العناوين، طريقة العمل، الأسئلة الشائعة', 'Headlines, method, FAQs') },
    { href: `${admin}/collections/services`, title: T(lang, 'الخدمات', 'Services'), hint: T(lang, 'صفحات الخدمات الثلاث', 'The three service pages') },
    { href: pageLink(about), title: T(lang, 'من نحن', 'About'), hint: T(lang, 'التعريف والمبادئ والحقائق', 'Story, principles, facts') },
    { href: `${admin}/collections/team-members`, title: T(lang, 'فريق العمل', 'Team'), hint: T(lang, 'يظهر في «من نحن» عند النشر', 'Shown on About once published') },
    { href: `${admin}/globals/site-settings`, title: T(lang, 'معلومات التواصل', 'Contact details'), hint: T(lang, 'البريد، الهاتف، واتساب، العنوان، السجل', 'Email, phone, WhatsApp, address, CR') },
    { href: `${admin}/collections/social-links`, title: T(lang, 'روابط الحسابات', 'Social links'), hint: T(lang, 'تظهر أسفل الموقع', 'Shown in the footer') },
    { href: `${admin}/globals/form-settings`, title: T(lang, 'نموذج التواصل', 'Contact form'), hint: T(lang, 'المستلمون ورسالة التأكيد', 'Recipients, confirmation message') },
    { href: pageLink(privacy), title: T(lang, 'سياسة الخصوصية', 'Privacy policy'), hint: T(lang, 'تُنشر بعد المراجعة القانونية', 'Published after legal review') },
    { href: `${admin}/collections/media`, title: T(lang, 'الوسائط', 'Media'), hint: T(lang, 'الصور والملفات', 'Images and files') },
  ];

  return (
    <section className="ps-welcome" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="ps-welcome__head">
        <div>
          <p className="ps-welcome__eyebrow">{T(lang, 'لوحة إدارة محتوى بروتوكول سوفت', 'Protocol Soft content admin')}</p>
          <h1 className="ps-welcome__title">{name ? T(lang, `مرحباً، ${name}`, `Welcome, ${name}`) : T(lang, 'مرحباً', 'Welcome')}</h1>
        </div>
        <a className="ps-welcome__site" href={lang === 'ar' ? site : `${site}/en`} target="_blank" rel="noopener noreferrer">
          {T(lang, 'عرض الموقع', 'View site')} ↗
        </a>
      </header>

      {(newLeads != null || pending > 0) && (
        <div className="ps-welcome__status">
          {newLeads != null && (
            <a href={`${admin}/collections/leads?where[status][equals]=new`} className={`ps-stat${newLeads > 0 ? ' ps-stat--alert' : ''}`}>
              <span className="ps-stat__num">{newLeads}</span>
              <span>{T(lang, 'طلبات تواصل جديدة', 'new contact requests')}</span>
            </a>
          )}
          {pending > 0 && (
            <a href={`${admin}/collections/services`} className="ps-stat">
              <span className="ps-stat__num">{pending}</span>
              <span>{T(lang, 'عناصر لم تُنشر بكل اللغات', 'items not published in every language')}</span>
            </a>
          )}
        </div>
      )}

      <div className="ps-welcome__grid">
        <nav className="ps-shortcuts" aria-label={T(lang, 'اختصارات', 'Shortcuts')}>
          {shortcuts.map((s) => (
            <a key={s.href} href={s.href} className="ps-shortcut">
              <strong>{s.title}</strong>
              <span>{s.hint}</span>
            </a>
          ))}
        </nav>

        <aside className="ps-steps">
          <h2>{T(lang, 'كيف تنشر تعديلاً', 'How to publish a change')}</h2>
          <ol>
            <li>{T(lang, 'حرّر النص بالعربية، ثم بدّل اللغة أعلى الصفحة إلى English وحرّر.', 'Edit in Arabic, then switch the language at the top to English and edit.')}</li>
            <li>{T(lang, 'اضغط «حفظ المسودة» ثم «معاينة» من لوحة النشر الجانبية.', 'Save the draft, then use Preview in the side publishing panel.')}</li>
            <li>{T(lang, 'اضغط «نشر» لكل لغة، أو «نشر التغييرات» إن كانت منشورة. يظهر التعديل خلال ثوانٍ.', 'Publish each language, or Publish changes if already live. It shows within seconds.')}</li>
          </ol>
          <p>{T(lang, 'الحقول الفارغة لا تظهر على الموقع، فلا تضع نصاً مؤقتاً.', 'Empty fields never show on the site, so never enter placeholder text.')}</p>
        </aside>
      </div>
    </section>
  );
};
