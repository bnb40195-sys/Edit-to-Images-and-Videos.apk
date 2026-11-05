import React from 'react';
import { AppLanguage } from '../types';
import { translations } from '../i18n/translations';
import { HelpCircle, DownloadCloud, Languages } from 'lucide-react';

interface TopBarProps {
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  onOpenHelp: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  lang,
  setLang,
  onOpenHelp,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-13 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-2.5 shrink-0">
          <img
            src="./app-icon.png"
            alt="App Icon"
            className="w-8 h-8 rounded-xl object-cover shadow-md shadow-blue-600/30 border border-slate-700/50"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-bold tracking-tight text-white whitespace-nowrap">
              {t.appTitle}
            </span>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <span className="text-[11px] text-emerald-400 font-medium whitespace-nowrap hidden sm:inline">
              {t.offlineBadge}
            </span>
          </div>
        </div>

        {/* Action Controls: Language Toggle, Help Guide, APK Download */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            title={lang === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
          >
            <Languages className="w-3.5 h-3.5 text-blue-400" />
            <span className="uppercase">{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          <button
            onClick={onOpenHelp}
            className="p-1.5 sm:p-2 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            title={t.helpTab}
            aria-label={t.helpTab}
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <a
            href="/download/apk"
            download="MediaStudio.apk"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
            title={lang === 'ar' ? 'تنزيل تطبيق أندرويد (APK)' : 'Download Android APK'}
          >
            <DownloadCloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'تطبيق أندرويد APK' : 'Android APK'}</span>
          </a>
        </div>
      </div>
    </header>
  );
};
