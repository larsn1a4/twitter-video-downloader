# DownX — موقع تحميل فيديوهات وبث X المباشر

موقع كامل (Next.js 14 + TypeScript + Tailwind CSS) لتحميل الفيديوهات والبثوث
المباشرة من منصة **X (تويتر سابقا)** — الواجهة بالإنجليزية بتصميم داكن عصري:

- الصق رابط أي منشور فيه فيديو → جلب كل الجودات المتوفرة (حتى 4K) → تحميل مباشر
- دعم **روابط البث المباشر** (`x.com/i/broadcasts/...`): استخراج تلقائي لرابط
  البث عبر API عام (بدون مصادقة)، ثم تسجيله وتحويله إلى MP4 **بـ JavaScript
  خالص (mux.js) — بدون الحاجة إلى `ffmpeg`** — يعمل للبث الجاري حاليا ولإعادة البث المنتهي
- دعم **عدة فيديوهات** في نفس المنشور (Video 1, Video 2...)
- متجاوب مع **الهاتف والحاسوب** وجميع الأجهزة
- **SEO متكامل**: عناوين ووصف وكلمات مفتاحية بالإنجليزية، Open Graph مع صورة
  مخصصة، بيانات منظمة (JSON-LD: WebApplication + FAQPage + HowTo + Article)،
  صفحة دليل `/guide` لاستهداف الكلمات الطويلة، و`sitemap.xml` و`robots.txt`
  تلقائيان
- حماية أساسية: حد أقصى 30 طلب/دقيقة لكل IP، والتحميل مقيد بنطاقات X فقط
  (`video.twimg.com` و `*.video.pscp.tv`)

> ⚖️ **ملاحظة قانونية:** حمّل فقط المحتوى الذي تملك حقوقه أو المسموح لك
> بتنزيله. احترام حقوق النشر وشروط منصة X مسؤولية المستخدم.

---

## 1. التشغيل محليا (للتجربة)

المتطلبات: Node.js 20+

```bash
npm install
cp .env.example .env   # ثم عدّل NEXT_PUBLIC_SITE_URL
npm run dev            # http://localhost:3000
```

## 2. النشر على Vercel (أسهل طريقة)

1. ارفع المشروع إلى GitHub.
2. في [vercel.com](https://vercel.com) اختر *Import Project* واختر المستودع.
3. أضف متغير البيئة: `NEXT_PUBLIC_SITE_URL=https://your-domain.com`
4. اضغط Deploy.

> ملاحظة: تحويل البث المباشر يعمل بـ JavaScript خالص (بدون ffmpeg)،
> لكن على Vercel قد يتوقف التسجيل الطويل بسبب حد مدة تنفيذ الدوال
> (timeout) — التسجيلات القصيرة وإعادة البث تعمل كاملة.

## 3. النشر بـ Docker (موصى به)

```bash
# ضع رابط موقعك الحقيقي
export NEXT_PUBLIC_SITE_URL=https://dl.example.com

docker compose up -d --build
# الموقع يعمل على http://SERVER_IP:3000
```

صورة Docker مبنية على `node:20-slim`، وتحويل البث المباشر إلى MP4
يعمل مباشرة (JavaScript خالص، بدون برامج إضافية).

## 4. النشر على VPS يدويا (بدون Docker)

```bash
# على السيرفر (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
npm install -g pm2

# انسخ المشروع ثم:
npm ci
npm run build
pm2 start npm --name x-dl -- start
pm2 save
```

### Nginx كوسيط عكسي + HTTPS

```nginx
server {
    listen 80;
    server_name dl.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 300s;   # مهم لتحميل/تسجيل البثوث الطويلة
    }
}
```

ثم فعّل HTTPS مجانا:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d dl.example.com
```

---

## هيكل المشروع

```
app/
  page.tsx              # الصفحة الرئيسية (SEO + أقسام + HowTo/FAQ JSON-LD)
  guide/page.tsx        # صفحة دليل SEO للكلمات الطويلة
  layout.tsx            # بيانات SEO العامة (إنجليزية LTR + OG image)
  sitemap.ts / robots.ts
  api/
    extract/route.ts    # POST {url} → استخراج الفيديو/البث
    download/route.ts   # تحميل MP4 عبر السيرفر (يعمل على الهاتف)
    live/route.ts       # تسجيل البث m3u8 → MP4 بـ JavaScript (mux.js)
components/
  Downloader.tsx        # واجهة إدخال الرابط وعرض النتائج (مقاطع متعددة)
lib/
  xExtract.ts           # منطق استخراج روابط الفيديو والبثوث
  site.ts               # عنوان الموقع (للـ SEO)
public/
  og-image.png          # صورة المشاركة (Open Graph 1200×630)
```

## كيف يعمل الاستخراج؟

الاتصال المباشر بـ X يتطلب حسابا مدفوعا، لذلك يستعمل السيرفر واجهات عامة
مجانية:

1. **منشورات الفيديو**: واجهة **FxEmbed** (`api.fxtwitter.com/2/status/{id}`)
   لاستخراج روابط MP4 المباشرة من أي منشور عام، مع واجهة بديلة
   (`api.vxtwitter.com`) عند التعطل. روابط `video.twimg.com` تُمرَّر عبر
   `/api/download` لفرض الحفظ كملف.
2. **البثوث المباشرة** (`x.com/i/broadcasts/{id}`): واجهة X العامة
   `api.x.com/1.1/broadcasts/show.json` تعطي `media_key`، ثم
   `api.x.com/1.1/live_video_stream/status/{media_key}` يعطي رابط التشغيل
   (HLS). السيرفر يحلّل الـ master playlist ويختار أفضل variant، ثم يجمّع
   مقاطع MPEG-TS ويحوّلها إلى MP4 مجزّأ (fragmented) أثناء التسجيل
   بـ JavaScript خالص (مكتبة mux.js) — بدون أي برنامج خارجي.

## تخصيص

- **اسم/عنوان الموقع:** `NEXT_PUBLIC_SITE_URL` في `.env`
- **الألوان:** `tailwind.config.ts` (كائن `brand`)
- **الأسئلة الشائعة:** مصفوفة `faqs` في `app/page.tsx`

## استكشاف الأخطاء

- **البث يعطي خطأ 502**: تأكد أن البث ما زال متاحا (قد يكون حُذف)، وأن
  السيرفر يصل إلى الإنترنت مباشرة.
- **Vercel**: التسجيل الطويل جدا قد يتوقف بسبب حد مدة الدوال — استعمل
  Docker أو VPS للتسجيلات الطويلة.
- **NEXT_PUBLIC_SITE_URL**: ضروري قبل النشر (يغذي canonical وsitemap وOG).
