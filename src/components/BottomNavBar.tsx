import React from 'react';
import { AppLanguage, ActiveTab } from '../types';
import { translations } from '../i18n/translations';
import { Camera, Film, Link2, Wand2, Sliders } from 'lucide-react';

interface BottomNavBarProps {
  lang: AppLanguage;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  lang,
  activeTab,
  setActiveTab,
  onOpenSettings,
}) => {
  const t = translations[lang];

  const navItems = [
    {
      id: 'photo' as ActiveTab,
      label: t.photoTab,
      icon: Camera,
      badgeColor: 'text-blue-400',
    },
    {
      id: 'video' as ActiveTab,
      label: t.videoTab,
      icon: Film,
      badgeColor: 'text-amber-400',
    },
    {
      id: 'downloader' as ActiveTab,
      label: t.downloaderTab,
      icon: Link2,
      badgeColor: 'text-emerald-400',
    },
    {
      id: 'aiStudio' as ActiveTab,
      label: t.aiTab,
      icon: Wand2,
      badgeColor: 'text-purple-400',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 shadow-[0_-8px_25px_rgba(0,0,0,0.5)]">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 h-16 sm:h-18 flex items-center justify-around gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 sm:py-2 px-1 rounded-xl transition-all min-h-[48px] select-none ${
                isActive
                  ? 'text-white font-bold bg-blue-600/15 relative'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-1 bg-blue-500 rounded-full shadow-sm" />
              )}
              <Icon
                className={`w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform ${
                  isActive ? `${item.badgeColor} scale-110` : 'text-slate-400'
                }`}
              />
              <span className="text-[10px] sm:text-[11px] mt-1 tracking-tight truncate max-w-[70px] sm:max-w-none">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* 5th button: Quick Settings & Background */}
        <button
          onClick={onOpenSettings}
          className="flex-1 flex flex-col items-center justify-center py-1.5 sm:py-2 px-1 rounded-xl transition-all min-h-[48px] select-none text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          title={t.settingsTab}
        >
          <Sliders className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-slate-400" />
          <span className="text-[10px] sm:text-[11px] mt-1 tracking-tight truncate max-w-[70px] sm:max-w-none">
            {t.settingsTab}
          </span>
        </button>
      </div>
    </nav>
  );
};
