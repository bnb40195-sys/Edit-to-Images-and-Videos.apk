import React, { useState, useEffect } from 'react';
import { AppLanguage, ActiveTab, PhotoAdjustments, StudioBackground, CanvasBackground } from './types';
import { TopBar } from './components/TopBar';
import { BottomNavBar } from './components/BottomNavBar';
import { PhotoEditor } from './components/PhotoEditor/PhotoEditor';
import { VideoEditor } from './components/VideoEditor/VideoEditor';
import { MediaDownloader } from './components/Downloader/MediaDownloader';
import { AIStudio } from './components/AIStudio/AIStudio';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';
import { WifiOff } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<AppLanguage>('ar');
  const [activeTab, setActiveTab] = useState<ActiveTab>('photo');
  const [studioBg, setStudioBg] = useState<StudioBackground>('deep_slate');
  const [customBgColor, setCustomBgColor] = useState<string>('#0d1117');
  const [canvasBg, setCanvasBg] = useState<CanvasBackground>('checkerboard');

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Cross-tab media sharing states
  const [loadedPhotoSrc, setLoadedPhotoSrc] = useState<string | null>(null);
  const [loadedPhotoAdjustments, setLoadedPhotoAdjustments] = useState<Partial<PhotoAdjustments> | null>(null);
  const [loadedVideoSrc, setLoadedVideoSrc] = useState<string | null>(null);

  // Sync document direction and language attribute
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Online / Offline connectivity listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Compute background class and styles
  const getStudioBackgroundClass = () => {
    switch (studioBg) {
      case 'charcoal':
        return 'bg-slate-900 text-slate-100';
      case 'midnight_royal':
        return 'bg-[#0b132b] text-slate-100';
      case 'neutral_pro':
        return 'bg-[#18181b] text-slate-100';
      case 'light':
        return 'bg-slate-100 text-slate-900';
      case 'gradient_ocean':
        return 'bg-gradient-to-br from-slate-950 via-sky-950 to-blue-900 text-slate-100';
      case 'gradient_sunset':
        return 'bg-gradient-to-br from-slate-950 via-amber-950 to-orange-950 text-slate-100';
      case 'custom':
        return 'text-slate-100';
      case 'deep_slate':
      default:
        return 'bg-slate-950 text-slate-100';
    }
  };

  const customStyle = studioBg === 'custom' ? { backgroundColor: customBgColor } : {};

  return (
    <div
      style={customStyle}
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${getStudioBackgroundClass()}`}
    >
      {/* Offline Toast Banner if device disconnected */}
      {!isOnline && (
        <div className="bg-amber-600/90 text-white text-xs px-4 py-2 flex items-center justify-center gap-2 font-medium z-50">
          <WifiOff className="w-3.5 h-3.5" />
          <span>
            {lang === 'ar'
              ? 'أنت تعمل الآن بدون اتصال بالإنترنت (أوفلاين) - جميع أدوات التحرير والحفظ تعمل محلياً 100%'
              : 'You are currently offline - All studio editing and export features work 100% locally'}
          </span>
        </div>
      )}

      {/* Sleek Minimal Top Brand Bar */}
      <TopBar
        lang={lang}
        setLang={setLang}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'photo' && (
          <PhotoEditor
            lang={lang}
            externalImageSrc={loadedPhotoSrc}
            initialAdjustments={loadedPhotoAdjustments}
            canvasBg={canvasBg}
          />
        )}
        {activeTab === 'video' && (
          <VideoEditor
            lang={lang}
            externalVideoSrc={loadedVideoSrc}
            onOpenInPhotoEditor={(src) => {
              setLoadedPhotoSrc(src);
              setLoadedPhotoAdjustments(null);
              setActiveTab('photo');
            }}
            onOpenInAIStudio={() => {
              setActiveTab('aiStudio');
            }}
          />
        )}
        {activeTab === 'downloader' && (
          <MediaDownloader
            lang={lang}
            onOpenInPhotoEditor={(url) => {
              setLoadedPhotoSrc(url);
              setLoadedPhotoAdjustments(null);
              setActiveTab('photo');
            }}
            onOpenInVideoEditor={(url) => {
              setLoadedVideoSrc(url);
              setActiveTab('video');
            }}
          />
        )}
        {activeTab === 'aiStudio' && (
          <AIStudio
            lang={lang}
            onOpenInPhotoEditor={(src, adj) => {
              setLoadedPhotoSrc(src);
              setLoadedPhotoAdjustments(adj || null);
              setActiveTab('photo');
            }}
            onOpenInVideoEditor={(url) => {
              setLoadedVideoSrc(url);
              setActiveTab('video');
            }}
          />
        )}
      </main>

      {/* Primary Bottom Navigation Bar (شريط التنقل السفلي) */}
      <BottomNavBar
        lang={lang}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        lang={lang}
        setLang={setLang}
        studioBg={studioBg}
        setStudioBg={setStudioBg}
        customBgColor={customBgColor}
        setCustomBgColor={setCustomBgColor}
        canvasBg={canvasBg}
        setCanvasBg={setCanvasBg}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        lang={lang}
      />
    </div>
  );
}
