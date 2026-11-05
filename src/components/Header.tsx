import React from 'react';
import { AppLanguage, ActiveTab } from '../types';
import { translations } from '../i18n/translations';
import { Camera, Film, Link2, Wand2, Sliders, HelpCircle, DownloadCloud, Languages } from 'lucide-react';

interface HeaderProps {
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  setLang,
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenHelp,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark with subtle offline note */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 font-bold text-lg">
            M
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
              {t.appTitle}
            </span>
            <span className="text-[11px] text-emerald-400 font-medium whitespace-nowrap hidden sm:inline">
              {t.offlineBadge}
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links / Segmented Mode Controls */}
        <nav className="flex items-center gap-1 sm:gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab('photo')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'photo'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{t.photoTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'video'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>{t.videoTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('downloader')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'downloader'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>{t.downloaderTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('aiStudio')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'aiStudio'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Wand2 className="w-4 h-4 text-purple-400" />
            <span>{t.aiTab}</span>
          </button>
        </nav>

        {/* Zone 3: Actions - Language toggle, Settings, Help, Install */}
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
            onClick={onOpenSettings}
            className="p-2 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            title={t.settingsTab}
            aria-label={t.settingsTab}
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenHelp}
            className="p-2 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            title={t.helpTab}
            aria-label={t.helpTab}
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <a
            href="/download/apk"
            download="MediaStudio.apk"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
            title={lang === 'ar' ? 'تنزيل تطبيق أندرويد (APK)' : 'Download Android APK'}
          >
            <DownloadCloud className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'تطبيق أندرويد APK' : 'Android APK'}</span>
          </a>
        </div>
      </div>
    </header>
  );
};
