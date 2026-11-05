import React from 'react';
import { AppLanguage } from '../types';
import { translations } from '../i18n/translations';
import { HelpCircle, Camera, Film, ShieldCheck, Keyboard, Sliders, X } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, lang }) => {
  const t = translations[lang];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">{t.helpTitle}</h2>
              <p className="text-xs text-slate-400">{t.offlineBadge}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Intro */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          {t.helpIntro}
        </p>

        {/* 100% Offline & Privacy Section */}
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/30 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>{t.privacyNoticeTitle}</span>
          </div>
          <p className="text-xs text-emerald-200/90 leading-relaxed">
            {t.privacyNoticeDesc}
          </p>
        </div>

        {/* Photo Guide */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Camera className="w-4 h-4 text-blue-400" />
            <span>{t.howPhotoTitle}</span>
          </div>
          <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside pr-1 rtl:pl-1">
            <li className="leading-relaxed">{t.howPhotoStep1}</li>
            <li className="leading-relaxed">{t.howPhotoStep2}</li>
            <li className="leading-relaxed">{t.howPhotoStep3}</li>
            <li className="leading-relaxed">{t.howPhotoStep4}</li>
          </ol>
        </div>

        {/* Video Guide */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Film className="w-4 h-4 text-amber-400" />
            <span>{t.howVideoTitle}</span>
          </div>
          <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside pr-1 rtl:pl-1">
            <li className="leading-relaxed">{t.howVideoStep1}</li>
            <li className="leading-relaxed">{t.howVideoStep2}</li>
            <li className="leading-relaxed">{t.howVideoStep3}</li>
            <li className="leading-relaxed">{t.howVideoStep4}</li>
          </ol>
        </div>

        {/* Settings, Language & Background Guide */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>
              {lang === 'ar' ? 'الإعدادات، تغيير اللغة، وتخصيص الخلفية:' : 'Settings, Language & Background Customization:'}
            </span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside pr-1 rtl:pl-1">
            <li className="leading-relaxed">
              {lang === 'ar'
                ? 'يمكنك التبديل بين العربية (RTL) والإنجليزية (LTR) بنقرة واحدة من زر "AR / EN" في الشريط العلوي أو من نافذة الإعدادات.'
                : 'Switch between Arabic (RTL) and English (LTR) with one click from the "AR / EN" top header button or Settings modal.'}
            </li>
            <li className="leading-relaxed">
              {lang === 'ar'
                ? 'تخصيص خلفية الاستوديو: اختر من بين درجات الداكن السينمائي، الكحلي الملكي، الفاتح، تدرجات المحيط والغروب، أو اختر لونك المفضل.'
                : 'Studio Wallpaper Customization: Choose from Cinematic Dark, Royal Navy, Light, Ocean, Sunset gradients, or any custom color.'}
            </li>
            <li className="leading-relaxed">
              {lang === 'ar'
                ? 'خلفية مساحة العمل: يمكنك تغيير خلفية حلبة الرسم بين رقعة الشطرنج لكشف شفافية PNG والأسود والأبيض والرمادي 18%.'
                : 'Canvas Stage Wallpaper: Toggle between transparency checkerboard, solid black, pure white, and 18% neutral gray.'}
            </li>
          </ul>
        </div>

        {/* Shortcuts */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Keyboard className="w-4 h-4 text-indigo-400" />
            <span>{t.shortcutsTitle}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <span className="text-slate-400">{t.shortcutUndo}</span>
              <kbd className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">Ctrl + Z</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <span className="text-slate-400">{t.shortcutRedo}</span>
              <kbd className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">Ctrl + Y</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 sm:col-span-2">
              <span className="text-slate-400">{t.shortcutSpace}</span>
              <kbd className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">Spacebar</kbd>
            </div>
          </div>
        </div>

        {/* Close Button */}
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
