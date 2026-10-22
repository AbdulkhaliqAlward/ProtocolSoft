# نشر الموقع على خادم Ubuntu مع Cloudflare (HTTPS كامل)

دليل خطوة بخطوة لتشغيل الموقع ولوحة التحكم على خادم واحد (مثل AWS EC2)، مع Cloudflare أمامه.

## كيف يعمل الاتصال

```
الزائر ──HTTPS──▶ Cloudflare ──HTTPS (شهادة Origin)──▶ الخادم: Caddy ──▶ الموقع (web)
المحرر ──HTTPS──▶ Cloudflare Access ──نفق مشفّر──▶ الخادم: لوحة التحكم (cms)
```

- الموقع مشفّر في كل المسار: من الزائر إلى Cloudflare، ومن Cloudflare إلى خادمك.
- لوحة التحكم ليس لها منفذ مفتوح على الخادم إطلاقاً. تصل إليها عبر نفق Cloudflare، وبعد تحقق Cloudflare Access.
- قاعدة البيانات داخلية فقط، لا تُفتح للإنترنت.

---

## 1. الخادم (AWS EC2)

**حجم الخادم:** 2 جيجابايت ذاكرة على الأقل (مثل `t3.small`). يعمل على 1 جيجابايت أيضاً، لأن سكربت التجهيز يضيف ذاكرة swap، لكن البناء يكون أبطأ.

**Security Group (جدار الحماية في AWS) — Inbound rules:**

| المنفذ | المصدر | لماذا |
|---|---|---|
| 22 (SSH) | عنوان IP جهازك فقط (`My IP`) | دخولك أنت |
| 80 (HTTP) | `0.0.0.0/0` | تحويل إلى HTTPS |
| 443 (HTTPS) | `0.0.0.0/0` | الموقع |

لا تفتح 3000 ولا 3001 ولا 5432.

**عنوان ثابت:** في EC2 خصّص **Elastic IP** واربطه بالخادم، حتى لا يتغير العنوان عند إعادة التشغيل.

---

## 2. Cloudflare

### أ. أضف النطاق
1. في لوحة Cloudflare: **Add a domain** ← اكتب `protosoftdev.com` ← اختر الخطة **Free**.
2. سيعرض لك Cloudflare سجلات DNS التي وجدها. **احذف** أي سجل `A` يشير إلى `2.57.91.91` (عنوان Hostinger). **أبقِ** سجلات البريد (`MX` و`TXT`) إن كان بريدك على Hostinger.
3. سيعطيك Cloudflare عنوانَي **nameservers**.
4. في Hostinger ← النطاق ← **DNS / Nameservers** ← «تغيير nameservers» ← ضع عنوانَي Cloudflare واحفظ. التفعيل يستغرق من دقائق إلى 24 ساعة، وتصلك رسالة من Cloudflare عند اكتماله.

### ب. سجلات DNS (في Cloudflare ← DNS ← Records)

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | `@` | عنوان الخادم (Elastic IP) | ✅ Proxied (برتقالي) |
| CNAME | `www` | `protosoftdev.com` | ✅ Proxied |

سجل `admin` لا تضفه يدوياً؛ يُنشأ تلقائياً في الخطوة (د).

### ج. إعدادات SSL/TLS
1. **SSL/TLS ← Overview**: اختر **Full (strict)**.
2. **SSL/TLS ← Edge Certificates**: فعّل **Always Use HTTPS**، وفعّل **Automatic HTTPS Rewrites**، واجعل **Minimum TLS Version** = `TLS 1.2`.
3. **SSL/TLS ← Origin Server ← Create Certificate**:
   - Private key type: `ECC`
   - Hostnames: `protosoftdev.com` و `*.protosoftdev.com`
   - Validity: `15 years`
   - اضغط Create، وستظهر لك قيمتان: **Origin Certificate** و**Private Key**. احتفظ بالصفحة مفتوحة؛ ستلصقهما على الخادم في الخطوة 3 (المفتاح الخاص لا يظهر مرة أخرى).

### د. نفق لوحة التحكم (Cloudflare Tunnel)
1. من القائمة: **Zero Trust** (قد يطلب اختيار الخطة المجانية Free، وأحياناً بطاقة للتحقق دون خصم).
2. **Networks ← Tunnels ← Create a tunnel** ← النوع **Cloudflared** ← الاسم `protocol-soft`.
3. في صفحة التثبيت اختر **Docker**، وانسخ **الرمز (token)** فقط، وهو النص الطويل بعد `--token`. لا تشغّل الأمر الذي يعرضه؛ المشروع يشغّل cloudflared بنفسه.
4. **Public Hostname** ← أضف:
   - Subdomain: `admin` ، Domain: `protosoftdev.com`
   - Service: `HTTP` ← `cms:3001`
5. احفظ.

### هـ. حماية لوحة التحكم (Cloudflare Access)
1. **Zero Trust ← Access ← Applications ← Add an application ← Self-hosted**.
2. Application domain: `admin.protosoftdev.com`.
3. Policy: **Allow** ، Include ← **Emails** ← بريدك وبريد كل من سيدير المحتوى.
4. احفظ. من الآن، لا يصل إلى صفحة الدخول إلا من يملك أحد هذه العناوين، بعد رمز يصله على بريده.

---

## 3. على الخادم

ادخل إلى الخادم:

```bash
ssh -i your-key.pem ubuntu@SERVER_IP
```

**نزّل المشروع وجهّز الخادم** (مرة واحدة):

```bash
git clone https://github.com/AbdulkhaliqAlward/ProtocolSoft.git protocol-soft
cd protocol-soft
sudo sh scripts/server/prepare-ubuntu.sh
exit
```

ادخل من جديد (حتى تعمل أوامر Docker دون sudo)، ثم:

```bash
cd protocol-soft
sh scripts/server/generate-env.sh
nano .env
```

في `.env` ضع رمز النفق في السطر `CLOUDFLARE_TUNNEL_TOKEN=` واحفظ (Ctrl+O ثم Enter ثم Ctrl+X). باقي القيم وُلّدت تلقائياً؛ **انسخ الملف كله إلى مدير كلمات المرور** لديك.

**شهادة Cloudflare** (من الخطوة 2-ج-3):

```bash
mkdir -p certs
nano certs/origin.pem   # الصق Origin Certificate واحفظ
nano certs/origin.key   # الصق Private Key واحفظ
chmod 600 certs/origin.key
```

**التشغيل الأول** (اختر بريدك وكلمة مرور طويلة لأول مدير نظام):

```bash
SUPERADMIN_EMAIL='you@example.com' SUPERADMIN_PASSWORD='كلمة-مرور-طويلة-جداً' \
  sh scripts/server/deploy.sh --first-run
```

يبني السكربت الصور، ويشغّل قاعدة البيانات، ويطبّق الجداول. ثم يحمّل نصوص الموقع **كمسودات** (لا ينشر شيئاً)، وينشئ حساب المدير، ويشغّل كل شيء. البناء الأول يستغرق 5–15 دقيقة حسب حجم الخادم.

---

## 4. بعد التشغيل

1. افتح `https://admin.protosoftdev.com/admin` وسجّل الدخول.
2. انشر المحتوى من لوحة «النشر حسب اللغة»، العربية أولاً: الخدمات الثلاث، ثم الرئيسية (Publish changes)، ثم «من نحن». التفاصيل في [`CONTENT-GUIDE.md`](CONTENT-GUIDE.md).
3. افتح `https://protosoftdev.com`، وتأكد أن القفل يظهر في المتصفح، وأن `https://www.protosoftdev.com` يحوّل إلى العنوان الأساسي.
4. أكمل باقي [`LAUNCH-CHECKLIST.md`](LAUNCH-CHECKLIST.md): البريد، والنسخ الاحتياطي، وغيرها.

## تحديث الموقع لاحقاً

```bash
cd protocol-soft
git pull
sh scripts/server/deploy.sh
```

يعيد البناء ويطبّق أي جداول جديدة، دون المساس بالمحتوى أو الصور.

## إن حدثت مشكلة

```bash
docker compose -f docker-compose.production.yml ps
docker compose -f docker-compose.production.yml logs --tail=100 web
docker compose -f docker-compose.production.yml logs --tail=100 cms
docker compose -f docker-compose.production.yml logs --tail=100 caddy
```

| العرض | السبب المرجّح |
|---|---|
| خطأ 526 من Cloudflare | ملفات الشهادة في `certs/` غير صحيحة، أو وضع SSL ليس Full (strict). |
| خطأ 521 | Caddy لا يعمل، أو المنفذ 443 مغلق في Security Group. |
| لوحة التحكم لا تفتح | رمز النفق في `.env` فارغ أو خاطئ؛ راجع `logs cloudflared`. |
| الموقع يعرض محتوى فارغاً | المحتوى لم يُنشر بعد من لوحة التحكم. |
