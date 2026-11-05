# 🎨 استوديو الميديا أوفلاين | Offline Media Studio & Photo Editor

[![React 19](https://img.shields.io/badge/React-19.0-blue.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.x-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-100%25_Offline-success.svg?logo=pwa)](https://developer.mozilla.org/docs/Web/Progressive_web_apps)
[![Android APK](https://img.shields.io/badge/Android-Debug_APK_Ready-3DDC84.svg?logo=android)](https://www.android.com/)
[![GitHub Actions CI](https://img.shields.io/badge/CI-GitHub_Actions_Build-2088FF.svg?logo=github-actions)](https://github.com/features/actions)

تطبيق متكامل لتصميم وتحرير الصور والفيديوهات مستوحى من تجربة **PicSay Lite** الكلاسيكية وأحدث أدوات الميديا الحديثة. يعمل التطبيق **بدون إنترنت بالكامل (100% Offline)**، ويدعم واجهة عربية وإنجليزية كاملة، ومجهز كـ **Progressive Web App (PWA)** وتطبيق أندرويد حقيقي بصيغة **Debug APK** مبني تلقائياً عبر **GitHub Actions**.

---

## 🌟 المميزات الرئيسية | Core Features

### 1. 🖼️ محرر الصور الإبداعي (PicSay-Style Photo Editor)
- **Get a Picture (التقاط واختيار الصور):** شاشة ترحيبية مرنة تتيح اختيار الصور من المعرض أو الكاميرا أو استخدام صور نموذجية بدقة قابلة للتخصيص (Fast / Normal / Maximum).
- **المؤثرات (PicSay Effects Drawer):**
  - تشويه وتأثيرات بصرية (Distort, Spotlight, Marker, Pixelize).
  - مؤثرات الألوان (Colorize, Hue, Rainbow, Sepia Toning, Invert, Dizziness).
- **التعديلات وضبط الألوان (Adjustments):**
  - التحكم الكامل في التعريض (Exposure)، التباين (Contrast)، درجة الحرارة (Temperature)، الصبغة (Tint)، التشبع (Saturation)، والسطوع (Brightness).
- **التحويل والقص (Transform):**
  - قص وتعديل الاستقامة (Crop & Straighten).
  - تغيير الأبعاد والدقة (Resize).
  - التدوير والانعكاس (Rotate & Flip).
- **الملصقات والكتابة (Stickers & Typography):**
  - **فقاعات الكلام (Word Balloons):** مع تحكم كامل بنمط الفقاعة، الخط، وألوان النص والخلفية.
  - **العناوين والنصوص (Titles):** خطوط عربية ولاتينية منوعة، تأثيرات الظل والوهج.
  - **حزم الملصقات:** قبعات وخوذ، نظارات، شعر، رموز رومانسية، احتفالات، أشكال هندسية، وأيقونات تعبيرية.
  - تحكم كامل بالملصقات على الشاشة: سحب، تكبير وتصغير (+/-)، تدوير (+15°)، وحذف.
- **أدوات الرسم والتأطير:**
  - قلم وفرشاة رسم حرة بألوان وأحجام متعددة.
  - إطارات صور أنيقة (Vintage, Modern, Border, Polaroid).
- **التصدير والمقارنة:**
  - زر مقارنة فوري مع الصورة الأصلية (Compare).
  - تراجع وإعادة غير محدود (Undo / Redo).
  - تصدير بصيغ متعددة (PNG / JPEG / WebP) بجودات وأحجام قابلة للتخصيص.

### 2. 🎥 محرر الفيديو (Video Studio)
- قص وتجزئة الفيديو (Trim & Split).
- تسريع وإبطاء الحركة (Speed Control).
- فلاتر وتأثيرات لونية سينمائية على الفيديو محلياً.
- كتم، تعديل، واستخراج الصوت.
- التقاط لقطة شاشة عالية الدقة من أي إطار فيديو وفتحها مباشرة في محرر الصور.

### 3. 📥 منزل الوسائط أوفلاين (Offline Media Downloader)
- استيراد وحفظ الصور والفيديوهات للعمل عليها لاحقاً بدون اتصال بالإنترنت.
- نقل الوسائط المحفوظة بضغطة زر إلى محرر الصور أو محرر الفيديو.

### 4. 🤖 استوديو الذكاء الاصطناعي (AI Studio)
- توليد صور إبداعية واقتراحات تحسين ذكية.
- نقل النتائج مباشرة إلى محرر الصور لإضافة المؤثرات والملصقات.

---

## 📱 تطبيق الأندرويد وحزمة الـ APK | Android App & APK

تم إعداد المشروع بالكامل ليكون تطبيق أندرويد حقيقي متوافق مع نظام Gradle Version Catalog الحديث:

### 📥 مسارات ملف الـ APK الجاهز داخل المشروع:
* `APK_DOWNLOAD/app-debug.apk` (حجم ~3.9 ميجابايت، موقع وجاهز للتثبيت).
* `.build-outputs/app-debug.apk`.
* `app/build/outputs/apk/debug/app-debug.apk`.

### ⚠️ إرشادات تثبيت الـ APK على الهاتف:
نظراً لأن ملف الـ APK يحمل توقيعاً اختبارياً (`Debug Keystore`):
1. **تنبيه حماية Google Play (Play Protect):**
   - عند محاولة التثبيت، قد تظهر رسالة: *(تم حظر التطبيق بواسطة حماية Play / Blocked by Play Protect)*.
   - اضغط على **"مزيد من التفاصيل" (More details)** ثم اختر **"التثبيت على أي حال" (Install anyway)**.
2. **إذن المصادر غير المعروفة (Unknown Sources):**
   - تأكد من تفعيل إذن تثبيت التطبيقات لمتصفحك أو مدير الملفات عبر:
     *(الإعدادات > التطبيقات > تثبيت تطبيقات غير معروفة > تفعيل السماح)*.
3. **تجنب تعارض النسخ (Package Conflict):**
   - إذا كان هناك إصدار تجريبي قديم مثبت على الهاتف، قم بإلغاء تثبيته (Uninstall) أولاً قبل تثبيت النسخة الجديدة.

---

## ⚡ البناء التلقائي عبر GitHub Actions | CI/CD Workflow

يحتوي المشروع على سير عمل آلي في المسار:
`.github/workflows/build-apk.yml`

### كيف يعمل سير العمل؟
1. **المشغلات (Triggers):**
   - يعمل تلقائياً عند كل `push` إلى فرع `main`.
   - يمكن تشغيله يدوياً عبر زر **Run workflow** (`workflow_dispatch`).
2. **بيئة التشغيل:**
   - خادم `ubuntu-latest`.
   - تهيئة Java 17 عبر Eclipse Temurin مع التحقق الإجباري من الإصدار في خطوة `Verify Java environment`.
   - استخدام محرك **Gradle 9.3.1** بدقة متناهية.
3. **مفتاح التوقيع المؤقت:**
   - خطوة `Create temporary debug keystore` تقوم بتوليد `./debug.keystore` محلياً لتوقيع الـ APK دون نشر أي مفاتيح سرية.
4. **أمر البناء:**
   ```bash
   gradle :app:assembleDebug --stacktrace --no-daemon
   ```
5. **رفع وحفظ الـ APK:**
   - يتم التحقق من وجود `app/build/outputs/apk/debug/app-debug.apk`.
   - يتم رفع الملف كـ Artifact متاح للتنزيل تحت اسم **`app-debug-apk`**.

---

## 🌐 التثبيت المباشر كـ PWA (أسهل طريقة بدون APK)

التطبيق مجهز كـ **Progressive Web App (PWA)** متكامل 100%:
1. افتح رابط التطبيق في متصفح هاتفك (Google Chrome أو Safari):
   ```
   https://ais-pre-b25wjfm3o3xsrxbe5qpmkh-624055144227.europe-west3.run.app
   ```
2. اضغط على خيارات المتصفح ($\vdots$) ثم اختر:
   - **"تثبيت التطبيق" (Install app)** أو **"إضافة إلى الشاشة الرئيسية" (Add to Home screen)**.
3. سيثبت التطبيق فوراً كأيقونة أصلية على هاتفك، يعمل بملء الشاشة، وبدون إنترنت نهائياً وبدون أي تحذيرات حظر.

---

## 💻 التشغيل والتطوير المحلي | Local Development

### المتطلبات الأساسية:
- Node.js (الإصدار 18 أو أحدث)
- npm أو bun

### خطوات التشغيل:
```bash
# 1. تثبيت التبعيات
npm install

# 2. تشغيل خادم التطوير المحلي
npm run dev

# 3. بناء نسخة الإنتاج
npm run build

# 4. فحص الأخطاء البرمجية والأنماط
npm run lint
```
يفتح التطبيق محلياً عبر الرابط: `http://localhost:3000`.

---

## 📁 هيكلية المشروع | Project Structure

```text
├── .github/workflows/
│   └── build-apk.yml          # سير عمل GitHub Actions لبناء الـ APK
├── APK_DOWNLOAD/
│   └── app-debug.apk          # نسخة الـ APK الجاهزة للتنزيل المباشر
├── app/
│   ├── build.gradle.kts       # إعدادات موديول التطبيق ومهمة assembleDebug
│   └── src/main/
│       └── AndroidManifest.xml # ملف تصاريح وبيان تطبيق الأندرويد
├── gradle/
│   └── libs.versions.toml     # كتالوج إصدارات Gradle (agp = "9.1.1")
├── public/
│   ├── icon.svg               # الأيقونة الرئيسية للتطبيق (SVG)
│   ├── pwa-192x192.png        # أيقونة PWA وأندرويد (192px)
│   ├── pwa-512x512.png        # أيقونة PWA عالية الدقة (512px)
│   └── manifest.webmanifest   # بيان تطبيق الويب PWA
├── src/
│   ├── components/
│   │   ├── PhotoEditor/       # محرر الصور، المؤثرات، والملصقات (PicSay Style)
│   │   ├── VideoEditor/       # محرر الفيديو والقص السينمائي
│   │   ├── Downloader/        # منزل الوسائط الأوفلاين
│   │   ├── AIStudio/          # أدوات الذكاء الاصطناعي
│   │   ├── TopBar.tsx         # الشريط العلوي واللغات
│   │   └── BottomNavBar.tsx   # شريط التنقل السفلي للأجهزة المحمولة
│   ├── utils/
│   │   ├── photoUtils.ts      # خوارزميات معالجة ورسم الصور على الكانفاس
│   │   └── stickerData.ts     # مكتبة ملصقات PicSay والرموز
│   ├── i18n/
│   │   └── translations.ts    # الترجمة الكاملة (العربية والإنجليزية)
│   ├── App.tsx                # المكون الرئيسي للتطبيق
│   └── index.css              # تنسيقات Tailwind CSS الشاملة
├── build.gradle.kts           # إعدادات بناء Gradle الجذرية
├── settings.gradle.kts        # تعريف موديول :app ومستودعات التبعيات
├── server.ts                  # خادم Express المدمج للبيئة المستضافة
├── vite.config.ts             # إعدادات Vite و Tailwind و PWA
└── package.json               # التبعيات وحزم المشروع
```

---

## 📜 الترخيص والحقوق | License

تم تطوير هذا التطبيق لدعم مصممي وهواة تعديل الصور والفيديو ليعمل بدون إنترنت بنسبة 100% مع أعلى درجات الخصوصية والأداء.
