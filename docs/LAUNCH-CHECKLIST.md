# قائمة الإطلاق

ما يجب إنجازه للانتقال من النسخة المحلية إلى `protosoftdev.com`. البنود مرتبة بحسب ترتيب التنفيذ. المعلومات المطلوبة من الشركة في [`FACTS-NEEDED.md`](FACTS-NEEDED.md)، وطريقة إدخالها في [`CONTENT-GUIDE.md`](CONTENT-GUIDE.md).

## 1. الخادم والنطاق

- [ ] خادم بـ Docker وDocker Compose، يُفتح فيه للعموم المنفذان 80 و443 فقط.
- [ ] سجلات DNS للنطاقين `protosoftdev.com` و`www` تشير إلى الخادم عبر Cloudflare (proxied).
- [ ] نفق Cloudflare (Tunnel) يوجّه `admin.protosoftdev.com` إلى `cms:3001`، ورمزه في `CLOUDFLARE_TUNNEL_TOKEN`. خدمة CMS لا تفتح أي منفذ.
- [ ] تطبيق **Cloudflare Access** على `admin.protosoftdev.com`، يسمح فقط ببريد فريق الإدارة.
- [ ] قواعد Rate limiting في Cloudflare WAF على `POST /api/contact` وعلى مسار تسجيل الدخول للوحة التحكم.
- [ ] شهادة Cloudflare Origin في `certs/` على الخادم، ووضع SSL في Cloudflare = Full (strict). الخطوات في [`DEPLOY.md`](DEPLOY.md).

## 2. الأسرار ومتغيرات البيئة

- [ ] نسخ `.env.example` إلى `.env` على الخادم، وتوليد قيم جديدة **خاصة بالإنتاج** لكل مفتاح. لا تُنسخ أي قيمة من بيئة التطوير.
  - `PAYLOAD_SECRET`
  - `WEB_TO_CMS_CONTENT_READ_KEY`، `WEB_TO_CMS_LEAD_SUBMIT_KEY`، `CMS_TO_WEB_REVALIDATE_KEY`، `BACKUP_REPORT_KEY`
  - زوج مفاتيح المعاينة: `PREVIEW_SIGNING_PRIVATE_KEY` (في CMS فقط) و`PREVIEW_VERIFY_PUBLIC_KEY` (في web فقط)
  - `LEAD_IP_HASH_SECRET` (القيمة نفسها في web وcms)
  - كلمات مرور قاعدة البيانات الثلاث: `POSTGRES_CMS_*` و`POSTGRES_MIGRATE_*` و`POSTGRES_BACKUP_*`
- [ ] `RESEND_API_KEY` من حساب Resend، مع توثيق نطاق الإرسال (SPF وDKIM). الإرسال الفعلي لا يعمل إلا مع `DEPLOYMENT_ENV=production`.
- [ ] `BACKUP_ENCRYPTION_PUBLIC_KEY` (مفتاح age العام). المفتاح الخاص يُحفظ **خارج الخادم**.
- [ ] التأكد من `WEB_PUBLIC_URL=https://protosoftdev.com` في خدمة CMS (يستخدمه زر المعاينة)، ومن `NEXT_PUBLIC_SITE_URL` في web.

## 3. أول تشغيل

```bash
docker compose -f docker-compose.production.yml up -d --build postgres
npm run migrate -w @protocol-soft/cms            # ضمن خدمة cms، بمستخدم الترحيل
npm run seed -w @protocol-soft/cms               # الهيكل والمسودات فقط، لا ينشر شيئاً
npm run content:load-drafts -w @protocol-soft/cms   # النصوص النهائية كمسودات، لا ينشر شيئاً
npm run bootstrap:superadmin                     # أول مدير نظام، من BOOTSTRAP_SUPERADMIN_*
docker compose -f docker-compose.production.yml up -d --build
```

- [ ] بعد إنشاء مدير النظام: احذف `BOOTSTRAP_SUPERADMIN_PASSWORD` من بيئة الخادم، وغيّر كلمة المرور من لوحة التحكم.
- [ ] أنشئ حسابات الفريق بأقل صلاحية تكفي كل شخص (Content Manager أو Editor).
- [ ] لا تُشغَّل `publish:local-review` في الإنتاج؛ السكربت يرفض ذلك أصلاً.

## 4. المحتوى

- [ ] تعبئة الحقائق الأولى من `FACTS-NEEDED.md`، وأولها `notificationRecipients` في إعدادات النماذج.
- [ ] مراجعة النصوص المحمّلة كمسودات، ومعاينتها، ثم نشرها من لوحة «النشر حسب اللغة»، العربية أولاً:
  - [ ] الخدمات الثلاث
  - [ ] الصفحة الرئيسية (Publish changes)
  - [ ] «من نحن»
- [ ] **سياسة الخصوصية:** مراجعة قانونية، ثم تسجيل `legalReviewedBy` و`legalReviewedAt`، وتغيير `contentOrigin` إلى `final`، ثم النشر بحساب مدير النظام.
- [ ] شروط الاستخدام: كتابة النص ومراجعته قانونياً قبل نشره. حتى ذلك الحين تبقى مسودة، ولا يظهر رابطها.
- [ ] رسالة التأكيد في إعدادات النماذج: لا تَعِد بمدة رد غير ملتزم بها.

## 5. البريد والطلبات

- [ ] إرسال طلب تجريبي من `/contact` على الموقع الرسمي، والتأكد من وصول الإشعار إلى المستلمين، ومن ظهور الطلب في `/admin/collections/leads`.
- [ ] **الاحتفاظ بالطلبات 12 شهراً:** السياسة تَعِد بالحذف أو إخفاء الهوية بعدها، ولا توجد مهمة آلية لذلك بعد. إما جدولة مراجعة شهرية يدوية تحذف الطلبات الأقدم من 12 شهراً، أو إضافة مهمة آلية قبل مرور السنة الأولى.

## 6. النسخ الاحتياطي

- [ ] تشغيل خدمة `backup` (`--profile backup`) وجدولتها: نسخة يومية مشفرة لقاعدة البيانات والوسائط.
- [ ] التحقق من وصول تقرير النسخة إلى لوحة التحكم (Backup Records).
- [ ] **تجربة استرجاع فعلية** على خادم منفصل قبل الإطلاق، باستخدام المفتاح الخاص المحفوظ خارج الخادم.

## 7. محركات البحث والقياس

- [ ] فتح `https://protosoftdev.com/sitemap.xml` و`/robots.txt` والتأكد من صحتهما.
- [ ] إضافة الموقع إلى Google Search Console وBing Webmaster، وإرسال خريطة الموقع.
- [ ] التأكد أن `admin.protosoftdev.com` لا يُفهرس: عليه `noindex`، ويقع خلف Cloudflare Access.
- [ ] أدوات التحليل غير مفعّلة. إن أُضيفت لاحقاً، **حدّث سياسة الخصوصية أولاً** (بند «ما لا نجمعه»)، واختر أداة لا تستخدم ملفات تعريف الارتباط إن أمكن.

## 8. التحقق قبل فتح الموقع

**أولاً، محلياً على بناء الإنتاج** (`npm run build` ثم `npm run start` للتطبيقين)، بعد تحميل المحتوى نفسه:

```bash
node apps/web/scripts/verify-public-pages.mjs        # يرسل طلب تواصل تجريبياً: محلياً فقط
node apps/web/scripts/verify-rtl-ltr.mjs
node apps/web/scripts/verify-theme.mjs
node apps/web/scripts/verify-no-db.mjs
npm run verify:roles
npx tsx --env-file-if-exists=.env apps/cms/src/scripts/verify-public-isolation.ts
```

- [ ] كل الاختبارات تمر، ومنها: لا يظهر «[PLACEHOLDER]» ولا «NEEDS CONFIRMATION» ولا «بحاجة إلى تأكيد» في أي صفحة.

**ثم على الموقع الرسمي** (اختبارات قراءة فقط، لا ترسل بيانات):

```bash
node apps/web/scripts/verify-rtl-ltr.mjs https://protosoftdev.com
node apps/web/scripts/verify-theme.mjs https://protosoftdev.com
BASE_URL=https://protosoftdev.com node apps/web/scripts/verify-preview-prod-headers.mjs
```

- [ ] فحص يدوي على جوال حقيقي بالعربية والإنجليزية، وفي الوضعين الفاتح والداكن.
- [ ] Lighthouse على الرئيسية وصفحة خدمة (المرجع في `docs/PERFORMANCE.md`).
- [ ] رؤوس الأمان: `https://securityheaders.com/?q=protosoftdev.com`.

## 9. بعد الإطلاق

- [ ] مراقبة سجلات الخدمات خلال الأيام الأولى: `docker compose logs -f web cms`.
- [ ] مراجعة الطلبات الواردة يومياً في الأسبوع الأول.
- [ ] تحديث «من نحن» وأسفل الموقع كلما وصلت حقيقة جديدة (الفريق، السجل، الحسابات).
