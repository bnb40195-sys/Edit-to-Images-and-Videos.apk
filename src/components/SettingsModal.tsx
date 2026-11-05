import React from 'react';
import { AppLanguage, StudioBackground, CanvasBackground } from '../types';
import { translations } from '../i18n/translations';
import { Languages, Palette, HardDrive, DownloadCloud, Check, X, ShieldCheck, Image as ImageIcon, Sparkles, Smartphone } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  studioBg: StudioBackground;
  setStudioBg: (bg: StudioBackground) => void;
  customBgColor: string;
  setCustomBgColor: (color: string) => void;
  canvasBg: CanvasBackground;
  setCanvasBg: (bg: CanvasBackground) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  lang,
  setLang,
  studioBg,
  setStudioBg,
  customBgColor,
  setCustomBgColor,
  canvasBg,
  setCanvasBg,
}) => {
  const t = translations[lang];
  const [clearedNotice, setClearedNotice] = React.useState(false);

  if (!isOpen) return null;

  const handleClearCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 2500);
    } catch (e) {
      // cache clear
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Languages className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white">{t.settingsTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Language Selection (تعديل اللغة) */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {t.languageSection}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setLang('ar')}
              className={`flex items-center justify-between p-3.5 rounded-2xl border text-sm font-medium transition-all ${
                lang === 'ar'
                  ? 'bg-blue-600/15 border-blue-500 text-white shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex flex-col text-right">
                <span className="font-bold text-white">العربية</span>
                <span className="text-[11px] text-slate-400">اللغة الافتراضية (RTL)</span>
              </div>
              {lang === 'ar' && <Check className="w-4 h-4 text-blue-400" />}
            </button>

            <button
              onClick={() => setLang('en')}
              className={`flex items-center justify-between p-3.5 rounded-2xl border text-sm font-medium transition-all ${
                lang === 'en'
                  ? 'bg-blue-600/15 border-blue-500 text-white shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex flex-col text-left">
                <span className="font-bold text-white">English</span>
                <span className="text-[11px] text-slate-400">English (LTR)</span>
              </div>
              {lang === 'en' && <Check className="w-4 h-4 text-blue-400" />}
            </button>
          </div>
        </div>

        {/* 2. Studio Background Customization (تعديل الخلفية) */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-blue-400" />
              <span>{t.backgroundSection}</span>
            </label>
            <p className="text-[11px] text-slate-400">{t.backgroundDesc}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'deep_slate', label: 'داكن سينمائي', preview: 'bg-slate-950' },
              { id: 'charcoal', label: 'فحمي ناعم', preview: 'bg-slate-900' },
              { id: 'midnight_royal', label: 'كحلي ملكي', preview: 'bg-[#0b132b]' },
              { id: 'neutral_pro', label: 'رمادي محايد', preview: 'bg-[#18181b]' },
              { id: 'light', label: 'فاتح ناصع', preview: 'bg-slate-100' },
              { id: 'gradient_ocean', label: 'تدرج المحيط', preview: 'bg-gradient-to-br from-slate-950 via-sky-950 to-blue-900' },
              { id: 'gradient_sunset', label: 'تدرج الغروب', preview: 'bg-gradient-to-br from-slate-950 via-amber-950 to-orange-950' },
              { id: 'custom', label: 'لون مخصص', preview: 'bg-gradient-to-r from-pink-500 to-indigo-500' },
            ].map((bg) => (
              <button
                key={bg.id}
                onClick={() => setStudioBg(bg.id as any)}
                className={`p-2.5 rounded-2xl border text-xs font-medium text-center transition-all flex flex-col items-center gap-1.5 ${
                  studioBg === bg.id
                    ? 'bg-blue-600/15 border-blue-500 text-white shadow-sm ring-1 ring-blue-500/50'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                }`}
              >
                <div className={`w-full h-8 rounded-lg border border-slate-700/60 shadow-inner ${bg.preview}`} />
                <span className="truncate w-full text-[11px]">{bg.label}</span>
              </button>
            ))}
          </div>

          {/* Custom Color input if custom selected */}
          {studioBg === 'custom' && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
              <span className="text-slate-300 font-medium">{t.bgCustom}:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-400 text-xs">{customBgColor}</span>
                <input
                  type="color"
                  value={customBgColor}
                  onChange={(e) => setCustomBgColor(e.target.value)}
                  className="w-8 h-8 rounded-xl cursor-pointer bg-transparent border-0"
                />
              </div>
            </div>
          )}
        </div>

        {/* 3. Canvas Stage Wallpaper (خلفية حلبة الرسم) */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
            <span>{t.canvasStageBgTitle}</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'checkerboard', label: t.canvasBgCheckerboard, preview: 'canvas-checkerboard' },
              { id: 'black', label: t.canvasBgBlack, preview: 'bg-black' },
              { id: 'white', label: t.canvasBgWhite, preview: 'bg-white' },
              { id: 'neutral_gray', label: t.canvasBgGray, preview: 'bg-neutral-600' },
            ].map((cbg) => (
              <button
                key={cbg.id}
                onClick={() => setCanvasBg(cbg.id as any)}
                className={`p-2.5 rounded-2xl border text-xs font-medium text-center transition-all flex flex-col items-center gap-1.5 ${
                  canvasBg === cbg.id
                    ? 'bg-blue-600/15 border-blue-500 text-white shadow-sm ring-1 ring-blue-500/50'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                }`}
              >
                <div className={`w-full h-7 rounded-lg border border-slate-700/60 shadow-inner ${cbg.preview}`} />
                <span className="truncate w-full text-[10px]">{cbg.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Native Android App Installation */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-blue-400" />
            <span>{lang === 'ar' ? 'تطبيق أندرويد الأصلي (APK)' : 'Native Android Application (APK)'}</span>
          </label>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{lang === 'ar' ? 'تطبيق محلي سريع يعمل أوفلاين مع تخزين مباشر في ذاكرة هاتفك' : 'Fast local application running offline with direct storage access'}</span>
            </div>

            {/* Direct APK Download for Android */}
            <div className="pt-2 border-t border-slate-800/80">
              <a
                href="/download/apk"
                download="MediaStudio.apk"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-colors"
              >
                <DownloadCloud className="w-4 h-4" />
                <span>{lang === 'ar' ? 'تحميل تطبيق أندرويد المباشر (APK)' : 'Download Android APK'}</span>
              </a>
              <p className="text-[10px] text-slate-400 text-center mt-1.5">
                {lang === 'ar'
                  ? 'حجم التطبيق ~3.9 ميجابايت • تثبيت مباشر بدون متجر وبدون إعلانات'
                  : 'App size ~3.9 MB • Direct install without app store'}
              </p>
            </div>
          </div>
        </div>

        {/* 5. Storage Clear */}
        <div className="space-y-3 pt-2 border-t border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-xs font-semibold text-white">{t.clearCacheBtn}</h4>
            <p className="text-[11px] text-slate-400">
              {clearedNotice ? t.cacheCleared : (lang === 'ar' ? 'تفريغ أي بيانات جلسة مؤقتة في المتصفح' : 'Clear local session caches')}
            </p>
          </div>
          <button
            onClick={handleClearCache}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            {t.clearCacheBtn}
          </button>
        </div>

        {/* Close CTA */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
