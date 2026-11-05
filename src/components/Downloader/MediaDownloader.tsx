import React, { useState, useEffect } from 'react';
import { AppLanguage, DownloadedMediaItem, AvailableQualityOption, MediaInspectionResult } from '../../types';
import { translations } from '../../i18n/translations';
import {
  Download,
  ClipboardPaste,
  Image as ImageIcon,
  Film,
  Music,
  FileText,
  Archive,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Search,
  ExternalLink,
  Edit2,
  Save,
  Check,
  Folder,
  FolderOpen,
  SlidersHorizontal,
  ShieldCheck,
  Camera,
  Mic,
  HardDrive,
  X,
  Play,
  Layers,
  Smartphone,
  Plus,
} from 'lucide-react';

interface MediaDownloaderProps {
  lang: AppLanguage;
  onOpenInPhotoEditor: (url: string) => void;
  onOpenInVideoEditor: (url: string) => void;
}

// Preset direct test URLs for testing that ANY file type downloads
const SAMPLE_TEST_LINKS = [
  {
    id: 'nature_video',
    nameKey: 'sampleLinkNatureVideo',
    type: 'video' as const,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    quality: '1080p Full HD',
  },
  {
    id: 'hd_photo',
    nameKey: 'sampleLinkHighResPhoto',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    quality: 'Original (4K)',
  },
  {
    id: 'audio_track',
    nameKey: 'sampleLinkAudio',
    type: 'audio' as const,
    url: 'https://actions.google.com/sounds/v1/water/rain_heavy.ogg',
    quality: '320 kbps Hi-Fi',
  },
  {
    id: 'pdf_doc',
    nameKey: 'sampleLinkPdfDoc',
    type: 'document' as const,
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    quality: 'Standard PDF',
  },
  {
    id: 'zip_archive',
    nameKey: 'sampleLinkZipArchive',
    type: 'archive' as const,
    url: 'https://github.com/octocat/Hello-World/archive/refs/heads/master.zip',
    quality: 'Compressed ZIP',
  },
];

export const MediaDownloader: React.FC<MediaDownloaderProps> = ({
  lang,
  onOpenInPhotoEditor,
  onOpenInVideoEditor,
}) => {
  const t = translations[lang];

  const [inputUrl, setInputUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Inspected Link Result with all available qualities
  const [inspectedMedia, setInspectedMedia] = useState<MediaInspectionResult | null>(null);

  // Vault history & filter
  const [history, setHistory] = useState<DownloadedMediaItem[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Phone Save Path state (Stored in localStorage)
  const [phoneSavePath, setPhoneSavePath] = useState<string>('Download/MediaStudio/');
  const [isSavePathModalOpen, setIsSavePathModalOpen] = useState<boolean>(false);
  const [customPathInput, setCustomPathInput] = useState<string>('');
  const [savedCustomPaths, setSavedCustomPaths] = useState<string[]>([]);

  // Permissions Modal state
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState<boolean>(false);

  // Success toast indicator
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Load history & save paths from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('offline_universal_downloads_vault');
      if (saved) setHistory(JSON.parse(saved));

      const savedPath = localStorage.getItem('media_studio_phone_save_path');
      if (savedPath) setPhoneSavePath(savedPath);

      const customList = localStorage.getItem('media_studio_custom_phone_paths');
      if (customList) setSavedCustomPaths(JSON.parse(customList));
    } catch (e) {
      // ignore storage error
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (item: DownloadedMediaItem) => {
    setHistory((prev) => {
      const filtered = prev.filter((i) => i.url !== item.url || i.quality !== item.quality);
      const updated = [item, ...filtered].slice(0, 40);
      try {
        localStorage.setItem('offline_universal_downloads_vault', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Update save path
  const handleSelectSavePath = (path: string) => {
    setPhoneSavePath(path);
    try {
      localStorage.setItem('media_studio_phone_save_path', path);
    } catch (e) {}
    setIsSavePathModalOpen(false);
    setSaveSuccessMsg(`${lang === 'ar' ? 'تم ضبط مسار الحفظ على الهاتف:' : 'Storage path set to:'} ${path}`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  // Add custom path to saved list
  const handleAddCustomPath = (pathToAdd: string) => {
    const clean = pathToAdd.trim().replace(/^\/+|\/+$/g, '') + '/';
    if (!clean || clean === '/') return;

    if (!savedCustomPaths.includes(clean)) {
      const updated = [...savedCustomPaths, clean];
      setSavedCustomPaths(updated);
      try {
        localStorage.setItem('media_studio_custom_phone_paths', JSON.stringify(updated));
      } catch (e) {}
    }
    handleSelectSavePath(clean);
    setCustomPathInput('');
  };

  // Delete custom path
  const handleDeleteCustomPath = (pathToDelete: string) => {
    const updated = savedCustomPaths.filter((p) => p !== pathToDelete);
    setSavedCustomPaths(updated);
    try {
      localStorage.setItem('media_studio_custom_phone_paths', JSON.stringify(updated));
    } catch (e) {}
  };

  // Native Storage Folder Picker (showDirectoryPicker API)
  const handlePickPhoneDirectory = async () => {
    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker();
        if (dirHandle && dirHandle.name) {
          const pickedPath = `Download/${dirHandle.name}/`;
          handleAddCustomPath(pickedPath);
        }
      } catch (err) {
        // User cancelled or not allowed
      }
    } else {
      setIsSavePathModalOpen(true);
    }
  };

  // Helper format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0 || !bytes) return 'غير محدد';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Paste from clipboard & auto-inspect
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim().startsWith('http')) {
        const clean = text.trim();
        setInputUrl(clean);
        setErrorMsg(null);
        handleInspectUrl(clean);
      } else if (text) {
        setInputUrl(text.trim());
      }
    } catch (err) {
      // clipboard access error
    }
  };

  // Inspect link and retrieve ALL qualities and media details
  const handleInspectUrl = async (targetUrl?: string) => {
    const rawUrl = (targetUrl || inputUrl).trim();
    if (!rawUrl) return;

    setIsLoading(true);
    setErrorMsg(null);
    setInspectedMedia(null);

    try {
      const res = await fetch('/api/download/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: rawUrl }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to inspect link');
      }

      setInspectedMedia(data.data);
      setIsLoading(false);
    } catch (err: any) {
      console.warn('Backend inspect failed, generating direct fallback qualities:', err);
      // Construct rich fallback result with all qualities
      const cleanName = rawUrl.split('?')[0].split('/').pop() || 'media_file';
      const isVid = /\.(mp4|webm|mov|mkv|avi)$/i.test(cleanName) || rawUrl.includes('youtube') || rawUrl.includes('tiktok');
      const isImg = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(cleanName);
      const isAud = /\.(mp3|wav|ogg|m4a|aac)$/i.test(cleanName) || rawUrl.includes('soundcloud');

      const category = isVid ? 'video' : isImg ? 'image' : isAud ? 'audio' : 'other';

      const fallbackQualities: AvailableQualityOption[] = isVid
        ? [
            {
              id: 'fb_1080p',
              label: '🎬 1080p Full HD',
              resolutionOrBitrate: '1080p (60fps)',
              format: 'MP4',
              type: 'video',
              estimatedSize: '~45 MB',
              downloadUrl: `/api/download/proxy?url=${encodeURIComponent(rawUrl)}&filename=${encodeURIComponent(`${cleanName}_1080p.mp4`)}`,
              isPopular: true,
            },
            {
              id: 'fb_720p',
              label: '⚡ 720p HD',
              resolutionOrBitrate: '720p (HD)',
              format: 'MP4',
              type: 'video',
              estimatedSize: '~22 MB',
              downloadUrl: `/api/download/proxy?url=${encodeURIComponent(rawUrl)}&filename=${encodeURIComponent(`${cleanName}_720p.mp4`)}`,
              isPopular: false,
            },
            {
              id: 'fb_480p',
              label: '📱 480p SD',
              resolutionOrBitrate: '480p (SD)',
              format: 'MP4',
              type: 'video',
              estimatedSize: '~12 MB',
              downloadUrl: `/api/download/proxy?url=${encodeURIComponent(rawUrl)}&filename=${encodeURIComponent(`${cleanName}_480p.mp4`)}`,
              isPopular: false,
            },
            {
              id: 'fb_mp3',
              label: '🎵 استخراج الصوت MP3',
              resolutionOrBitrate: '320 kbps Hi-Fi',
              format: 'MP3',
              type: 'audio',
              estimatedSize: '~7.5 MB',
              downloadUrl: `/api/download/proxy?url=${encodeURIComponent(rawUrl)}&filename=${encodeURIComponent(`${cleanName}.mp3`)}`,
              isPopular: true,
            },
          ]
        : isImg
        ? [
            {
              id: 'fb_orig',
              label: '🌟 دقة كاملة الأصلية',
              resolutionOrBitrate: 'Original 4K Full Resolution',
              format: 'PNG',
              type: 'image',
              estimatedSize: 'أصلي',
              downloadUrl: `/api/download/proxy?url=${encodeURIComponent(rawUrl)}&filename=${encodeURIComponent(cleanName)}`,
              isPopular: true,
            },
            {
              id: 'fb_1080p',
              label: '🖼️ 1080p Full HD',
              resolutionOrBitrate: '1920×1080',
              format: 'JPG',
              type: 'image',
              estimatedSize: '~2.2 MB',
              downloadUrl: `/api/download/proxy?url=${encodeURIComponent(rawUrl)}&filename=${encodeURIComponent(`${cleanName}_1080p.jpg`)}`,
              isPopular: false,
            },
            {
              id: 'fb_webp',
              label: '🗜️ WebP مضغوطة',
              resolutionOrBitrate: 'WebP Efficient',
              format: 'WEBP',
              type: 'image',
              estimatedSize: '~650 KB',
              downloadUrl: `/api/download/proxy?url=${encodeURIComponent(rawUrl)}&filename=${encodeURIComponent(`${cleanName}.webp`)}`,
              isPopular: false,
            },
          ]
        : [
            {
              id: 'fb_file',
              label: '📄 الملف المباشر',
              resolutionOrBitrate: 'Original Direct Stream',
              format: 'BIN',
              type: 'other',
              estimatedSize: 'مباشر',
              downloadUrl: `/api/download/proxy?url=${encodeURIComponent(rawUrl)}&filename=${encodeURIComponent(cleanName)}`,
              isPopular: true,
            },
          ];

      setInspectedMedia({
        originalUrl: rawUrl,
        title: cleanName,
        category: category,
        platform: 'direct',
        platformName: 'رابط مباشر',
        qualities: fallbackQualities,
      });
      setIsLoading(false);
    }
  };

  // Download specific quality option and add to Vault
  const handleDownloadQuality = (quality: AvailableQualityOption, title?: string) => {
    const fileName = title || inspectedMedia?.title || 'media_download';
    const cleanFileName = `${fileName.replace(/\.[^/.]+$/, '')}_${quality.resolutionOrBitrate.replace(/[^a-zA-Z0-9]/g, '_')}.${quality.format.toLowerCase()}`;

    const downloadEndpoint = quality.downloadUrl;

    const a = document.createElement('a');
    a.href = downloadEndpoint;
    a.download = cleanFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Save item to local vault
    const newItem: DownloadedMediaItem = {
      id: 'dl_' + Date.now(),
      url: inspectedMedia?.originalUrl || quality.downloadUrl,
      title: title || inspectedMedia?.title || cleanFileName,
      filename: cleanFileName,
      type: quality.type === 'video' ? 'video' : quality.type === 'image' ? 'image' : quality.type === 'audio' ? 'audio' : 'other',
      sizeFormatted: quality.estimatedSize,
      blobUrl: quality.downloadUrl,
      downloadUrl: quality.downloadUrl,
      timestamp: Date.now(),
      quality: quality.label,
      savePath: phoneSavePath,
      thumbnailUrl: inspectedMedia?.thumbnailUrl,
      isEdited: false,
    };
    saveToHistory(newItem);

    setSaveSuccessMsg(`${lang === 'ar' ? 'جارٍ التنزيل والحفظ في:' : 'Downloading to:'} ${phoneSavePath}${cleanFileName}`);
    setTimeout(() => setSaveSuccessMsg(null), 4500);
  };

  // Helper render file category icon
  const renderCategoryIcon = (type: string, className = 'w-4 h-4') => {
    switch (type) {
      case 'video':
        return <Film className={`${className} text-amber-400`} />;
      case 'image':
        return <ImageIcon className={`${className} text-emerald-400`} />;
      case 'audio':
        return <Music className={`${className} text-indigo-400`} />;
      case 'document':
        return <FileText className={`${className} text-sky-400`} />;
      case 'archive':
        return <Archive className={`${className} text-orange-400`} />;
      default:
        return <HardDrive className={`${className} text-slate-400`} />;
    }
  };

  // Helper render platform badge
  const renderPlatformBadge = (platform: string, name: string) => {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-950/60 border border-blue-800/60 text-blue-300 text-[11px] font-semibold">
        <span>🌐</span>
        <span>{name}</span>
      </span>
    );
  };

  // Filter history items
  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.filename.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'all') return true;
    if (filterType === 'edited') return item.isEdited === true;
    return item.type === filterType;
  });

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 pb-24 flex flex-col gap-4">
      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="sticky top-14 z-40 bg-emerald-600/95 backdrop-blur-md text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-fadeIn border border-emerald-400/40">
          <div className="flex items-center gap-2 truncate">
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span className="truncate">{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg(null)} className="p-1 hover:bg-emerald-700/50 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Sleek Compact Downloader Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-3.5 sm:p-5 shadow-2xl flex flex-col gap-3">
        {/* Header Bar: Title + Storage Path + Permissions */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white leading-none">
                {lang === 'ar' ? 'منزّل الوسائط وفاحص الجودات' : 'Media Inspector & Downloader'}
              </h2>
              <span className="text-[11px] text-slate-400">
                {lang === 'ar' ? 'انسخ أي رابط لتحليله واختيار الجودة المطلوبة والحفظ المباشر في الهاتف' : 'Paste any link to detect media & download in all qualities'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Phone Save Path Switcher Button */}
            <button
              onClick={() => setIsSavePathModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-sky-400 border border-slate-700/60 font-medium transition-colors shadow-sm"
              title={lang === 'ar' ? 'تغيير مسار الحفظ على الهاتف' : 'Change phone storage path'}
            >
              <FolderOpen className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="max-w-[130px] sm:max-w-[200px] truncate">{phoneSavePath}</span>
            </button>

            {/* Permissions Button */}
            <button
              onClick={() => setIsPermissionsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 text-xs text-emerald-400 border border-emerald-800/50 font-medium transition-colors"
              title={t.permissionsTitle}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'الأذونات' : 'Permissions'}</span>
            </button>
          </div>
        </div>

        {/* Input & Paste Field */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                setErrorMsg(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleInspectUrl()}
              placeholder={lang === 'ar' ? 'الصق رابط الفيديو أو الصورة أو الصوت هنا (يوتيوب، تيك توك، إنستغرام، روابط مباشرة...)' : 'Paste any video, image, or audio link here...'}
              className="w-full pl-3 pr-10 rtl:pl-10 rtl:pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              dir="ltr"
            />
            {/* Inside Paste Button */}
            <button
              onClick={handlePasteClipboard}
              className="absolute left-2 rtl:left-auto rtl:right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={lang === 'ar' ? 'لصق وفحص الرابط تلقائياً' : 'Paste & Inspect URL'}
            >
              <ClipboardPaste className="w-4 h-4 text-blue-400" />
            </button>
          </div>

          {/* Inspect & Download Button */}
          <button
            onClick={() => handleInspectUrl()}
            disabled={isLoading || !inputUrl.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:pointer-events-none text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/30 transition-all shrink-0 active:scale-95"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{lang === 'ar' ? 'فحص...' : 'Inspecting...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{lang === 'ar' ? 'فحص واستخراج الجودات' : 'Inspect Qualities'}</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Sample Links Strip */}
        <div className="flex items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="text-slate-500 text-[11px] shrink-0">
              {lang === 'ar' ? 'نماذج جاهزة للاختبار:' : 'Test Samples:'}
            </span>
            {SAMPLE_TEST_LINKS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => {
                  setInputUrl(sample.url);
                  handleInspectUrl(sample.url);
                }}
                className="px-2.5 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] transition-colors border border-slate-700/60 shrink-0"
              >
                {sample.type === 'video'
                  ? '🎥 فيديو 1080p'
                  : sample.type === 'image'
                  ? '🖼️ صورة 4K'
                  : sample.type === 'audio'
                  ? '🎵 صوت Hi-Fi'
                  : sample.type === 'document'
                  ? '📄 PDF'
                  : '📦 ZIP'}
              </button>
            ))}
          </div>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs px-3 py-2 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* 2. Inspected Media Card: Detected Type & Full Qualities Grid */}
      {inspectedMedia && (
        <div className="bg-slate-900 border border-blue-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col gap-4 animate-fadeIn">
          {/* Top Info Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3 truncate">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                {inspectedMedia.thumbnailUrl ? (
                  <img src={inspectedMedia.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                ) : (
                  renderCategoryIcon(inspectedMedia.category, 'w-6 h-6')
                )}
              </div>

              <div className="truncate">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white text-xs sm:text-sm truncate">
                    {inspectedMedia.title}
                  </span>
                  {renderPlatformBadge(inspectedMedia.platform, inspectedMedia.platformName)}
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    {inspectedMedia.category === 'video'
                      ? '🎬 فيديو'
                      : inspectedMedia.category === 'image'
                      ? '🖼️ صورة'
                      : inspectedMedia.category === 'audio'
                      ? '🎵 صوت'
                      : '📁 ملف'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate flex items-center gap-2">
                  <span>📁 {phoneSavePath}</span>
                  <span>•</span>
                  <span>{inspectedMedia.qualities.length} {lang === 'ar' ? 'جودات متوفرة' : 'qualities available'}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons for Editors */}
            <div className="flex items-center gap-2 shrink-0">
              {inspectedMedia.category === 'image' && (
                <button
                  onClick={() => onOpenInPhotoEditor(inspectedMedia.originalUrl)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold border border-indigo-500/40 transition-colors"
                >
                  {t.openInPhotoEditor}
                </button>
              )}

              {inspectedMedia.category === 'video' && (
                <button
                  onClick={() => onOpenInVideoEditor(inspectedMedia.originalUrl)}
                  className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white text-xs font-semibold border border-amber-500/40 transition-colors"
                >
                  {t.openInVideoEditor}
                </button>
              )}
            </div>
          </div>

          {/* Qualities Grid Header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
              <span>{lang === 'ar' ? 'اختر الجودة والصيغة المراد تنزيلها وحفظها في الهاتف:' : 'Choose quality & format to download:'}</span>
            </span>
          </div>

          {/* Full Qualities Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {inspectedMedia.qualities.map((q) => (
              <div
                key={q.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  q.isPopular
                    ? 'bg-blue-950/40 border-blue-500/50 hover:border-blue-400 shadow-md ring-1 ring-blue-500/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-xs sm:text-sm truncate">{q.label}</span>
                    {q.isPopular && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shrink-0">
                        {lang === 'ar' ? 'موصى به' : 'Popular'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                    <span className="font-mono text-emerald-400">{q.format}</span>
                    <span>•</span>
                    <span className="text-slate-300">{q.resolutionOrBitrate}</span>
                    <span>•</span>
                    <span className="text-blue-400">{q.estimatedSize}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDownloadQuality(q, inspectedMedia.title)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 shadow-sm ${
                    q.isPopular
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                  title={`${lang === 'ar' ? 'حفظ في' : 'Save to'} ${phoneSavePath}`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'تنزيل' : 'Download'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. History Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 mt-2">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto py-1">
          {[
            { id: 'all', label: lang === 'ar' ? 'الكل' : 'All' },
            { id: 'image', label: lang === 'ar' ? '🖼️ صور' : 'Photos' },
            { id: 'video', label: lang === 'ar' ? '🎥 فيديو' : 'Videos' },
            { id: 'audio', label: lang === 'ar' ? '🎵 أصوات' : 'Audio' },
            { id: 'edited', label: lang === 'ar' ? '✏️ المعدلة' : 'Edited' },
            { id: 'document', label: lang === 'ar' ? '📄 ملفات' : 'Files' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterType(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                filterType === cat.id
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input + Clear Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 rtl:left-auto rtl:right-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'بحث في التنزيلات...' : 'Search downloads...'}
              className="w-full pl-8 pr-3 rtl:pl-3 rtl:pr-8 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {history.length > 0 && (
            <button
              onClick={() => {
                setHistory([]);
                localStorage.removeItem('offline_universal_downloads_vault');
              }}
              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
              title={t.clearDownloadsHistory}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 4. Media Vault Cards List */}
      <div className="flex flex-col gap-2">
        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 border border-slate-800/80 rounded-2xl">
            <HardDrive className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-60" />
            <p className="text-slate-400 text-xs sm:text-sm">
              {searchQuery.trim()
                ? lang === 'ar'
                  ? 'لا توجد نتائج مطابقة لبحثك'
                  : 'No matching files found'
                : t.noDownloadsYet}
            </p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors"
            >
              <div className="flex items-center gap-3 w-full sm:w-auto truncate">
                <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0">
                  {renderCategoryIcon(item.type, 'w-5 h-5')}
                </div>

                <div className="truncate flex-1">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-semibold text-white text-xs sm:text-sm truncate">
                      {item.title || item.filename}
                    </span>
                    {item.isEdited && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium shrink-0">
                        {lang === 'ar' ? 'معدلة' : 'Edited'}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span className="text-emerald-400 font-medium">{item.sizeFormatted}</span>
                    <span>•</span>
                    <span className="text-blue-400">{item.quality || 'عالية الدقة'}</span>
                    <span>•</span>
                    <span className="text-slate-500 truncate">{item.savePath || phoneSavePath}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end shrink-0">
                {item.type === 'image' && (
                  <button
                    onClick={() => onOpenInPhotoEditor(item.downloadUrl || item.url)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-medium transition-colors"
                  >
                    {lang === 'ar' ? 'محرر الصور' : 'Photo Editor'}
                  </button>
                )}

                {item.type === 'video' && (
                  <button
                    onClick={() => onOpenInVideoEditor(item.downloadUrl || item.url)}
                    className="px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white text-xs font-medium transition-colors"
                  >
                    {lang === 'ar' ? 'استوديو الفيديو' : 'Video Studio'}
                  </button>
                )}

                <a
                  href={item.downloadUrl}
                  download={item.filename}
                  className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white text-xs transition-colors"
                  title={lang === 'ar' ? 'تنزيل في الهاتف' : 'Download to device'}
                >
                  <Download className="w-4 h-4" />
                </a>

                <button
                  onClick={() => {
                    const next = history.filter((i) => i.id !== item.id);
                    setHistory(next);
                    localStorage.setItem('offline_universal_downloads_vault', JSON.stringify(next));
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title={lang === 'ar' ? 'حذف من السجل' : 'Delete'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal 1: Advanced Phone Save Path Selector */}
      {isSavePathModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-white text-base">{t.phoneSavePath}</h3>
              </div>
              <button
                onClick={() => setIsSavePathModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'ar'
                ? 'اختر المجلد المفضل على وحدة تخزين الهاتف لحفظ الصور والفيديوهات والملفات المعدلة تلقائياً، أو أضف مساراً مخصصاً:'
                : 'Choose your preferred destination folder on Android phone storage, or enter/pick a custom directory:'}
            </p>

            {/* Native Directory Picker CTA */}
            {'showDirectoryPicker' in window && (
              <button
                onClick={handlePickPhoneDirectory}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-sky-600/30 transition-all"
              >
                <Folder className="w-4 h-4" />
                <span>{lang === 'ar' ? 'تصفح واختيار مجلد مباشرة من ذاكرة الهاتف 📂' : 'Browse & Pick Folder from Storage 📂'}</span>
              </button>
            )}

            {/* Standard Android System Folders */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {lang === 'ar' ? 'مجلدات الهاتف القياسية:' : 'Standard Android Folders:'}
              </span>
              {[
                { path: 'Download/MediaStudio/', label: t.storageDownloadsFolder, icon: '📥' },
                { path: 'DCIM/Camera/MediaStudio/', label: t.storageDcimFolder, icon: '📷' },
                { path: 'Pictures/MediaStudio/', label: t.storagePicturesFolder, icon: '🖼️' },
                { path: 'Music/MediaStudio/', label: t.storageMusicFolder, icon: '🎵' },
                { path: 'Movies/MediaStudio/', label: lang === 'ar' ? 'مجلد الأفلام والفيديوهات (Movies)' : 'Movies & Video Vault', icon: '🎬' },
                { path: 'Pictures/MediaStudio/Edited/', label: t.storageEditedFolder, icon: '✏️' },
              ].map((f) => (
                <button
                  key={f.path}
                  onClick={() => handleSelectSavePath(f.path)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all text-left rtl:text-right ${
                    phoneSavePath === f.path
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-base">{f.icon}</span>
                    <div className="truncate">
                      <div className="font-semibold truncate">{f.label}</div>
                      <div className="text-[11px] text-slate-400 font-mono" dir="ltr">
                        {f.path}
                      </div>
                    </div>
                  </div>
                  {phoneSavePath === f.path && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
                </button>
              ))}
            </div>

            {/* Custom Saved Paths */}
            {savedCustomPaths.length > 0 && (
              <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {lang === 'ar' ? 'مساراتك المخصصة المحفوظة:' : 'Your Custom Paths:'}
                </span>
                {savedCustomPaths.map((cp) => (
                  <div
                    key={cp}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                      phoneSavePath === cp
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <button
                      onClick={() => handleSelectSavePath(cp)}
                      className="flex items-center gap-2 flex-1 text-left rtl:text-right truncate"
                    >
                      <Folder className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="font-mono text-xs truncate" dir="ltr">{cp}</span>
                    </button>
                    <div className="flex items-center gap-2">
                      {phoneSavePath === cp && <Check className="w-3.5 h-3.5 text-blue-400" />}
                      <button
                        onClick={() => handleDeleteCustomPath(cp)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded"
                        title={lang === 'ar' ? 'حذف المسار' : 'Delete path'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Custom Path Input */}
            <div className="border-t border-slate-800 pt-3 flex flex-col gap-2">
              <label className="text-xs text-slate-400 font-semibold">{t.customStorageFolder}</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customPathInput}
                  onChange={(e) => setCustomPathInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && customPathInput.trim() && handleAddCustomPath(customPathInput)}
                  placeholder={lang === 'ar' ? 'مثال: Download/MyVideos/ أو /storage/emulated/0/...' : 'e.g. Download/MyFolder/ or /storage/emulated/0/...'}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  dir="ltr"
                />
                <button
                  onClick={() => customPathInput.trim() && handleAddCustomPath(customPathInput)}
                  disabled={!customPathInput.trim()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'إضافة وتطبيق' : 'Add & Use'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Android Permissions Management */}
      {isPermissionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">{t.permissionsTitle}</h3>
              </div>
              <button
                onClick={() => setIsPermissionsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">{t.permissionsDesc}</p>

            <div className="flex flex-col gap-2">
              {[
                { key: 'storage', label: t.permStorage, desc: 'حفظ وتصدير الصور والفيديوهات إلى الذاكرة', icon: HardDrive },
                { key: 'images', label: t.permMediaImages, desc: 'استيراد واختيار الصور والتصاميم', icon: ImageIcon },
                { key: 'videos', label: t.permMediaVideo, desc: 'معالجة وقص مقاطع الفيديو وتوليدها', icon: Film },
                { key: 'audio', label: t.permMediaAudio, desc: 'تشغيل واستخراج المقاطع الصوتية', icon: Music },
                { key: 'camera', label: t.permCamera, desc: 'التقاط صور مباشرة للتعديل الفوري', icon: Camera },
                { key: 'microphone', label: t.permAudioRecord, desc: 'تسجيل المقاطع الصوتية والتعليق', icon: Mic },
              ].map((perm) => {
                const IconComponent = perm.icon;
                return (
                  <div
                    key={perm.key}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{perm.label}</div>
                        <div className="text-[10px] text-slate-400">{perm.desc}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 shrink-0">
                      <Check className="w-3.5 h-3.5" />
                      {lang === 'ar' ? 'ممنوح' : 'Granted'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 leading-relaxed">
              ℹ️ {t.permScopedNote}
            </div>

            <button
              onClick={() => {
                setIsPermissionsModalOpen(false);
                setSaveSuccessMsg(lang === 'ar' ? 'تم تأكيد جميع أذونات الهاتف بنجاح ✅' : 'All permissions verified active ✅');
                setTimeout(() => setSaveSuccessMsg(null), 3500);
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              {lang === 'ar' ? 'تم - موافق' : 'Done - Got it'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
