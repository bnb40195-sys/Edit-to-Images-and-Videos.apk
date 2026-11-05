import React, { useState, useRef } from 'react';
import { AppLanguage, PhotoAdjustments, VideoAIAnalysis } from '../../types';
import { translations } from '../../i18n/translations';
import {
  Wand2,
  Sparkles,
  Upload,
  Download,
  Image as ImageIcon,
  Film,
  CheckCircle2,
  Loader2,
  Sliders,
  Palette,
  Layers,
  ArrowRight,
  ArrowLeft,
  Check,
  Star,
  Copy,
  CheckCheck,
  Type,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import samplePortrait from '../../assets/images/sample_portrait_photo_1793279158542.jpg';
import sampleLandscape from '../../assets/images/sample_landscape_photo_1793279158603.jpg';
import sampleCity from '../../assets/images/sample_city_photo_1793279159597.jpg';

interface AIStudioProps {
  lang: AppLanguage;
  onOpenInPhotoEditor: (imageSrc: string, initialAdjustments?: Partial<PhotoAdjustments>) => void;
  onOpenInVideoEditor?: (videoSrc: string) => void;
}

const SAMPLE_TEMPLATES = [
  {
    id: 'portrait',
    name: 'بورتريه للتجميل والتحسين',
    src: samplePortrait,
  },
  {
    id: 'landscape',
    name: 'طبيعة للتحسين السينمائي',
    src: sampleLandscape,
  },
  {
    id: 'city',
    name: 'شوارع للتباين والـ HDR',
    src: sampleCity,
  },
];

const PROMPT_SUGGESTIONS = [
  'واحة خضراء في قلب الصحراء عند الغروب الذهبي بإضاءة سينمائية ساحرة',
  'رائد فضاء صغير يطفو بين الكواكب اللامعة بأسلوب كرتوني مرح',
  'شوارع مدينة طوكيو المستقبلية في ليلة ممطرة مع انعكاسات أضواء النيون الزرقاء والبنفسجية',
  'صقر عربي أصيل يحلق فوق الجبال الشاهقة بتفاصيل فائقة الدقة',
];

export const AIStudio: React.FC<AIStudioProps> = ({
  lang,
  onOpenInPhotoEditor,
  onOpenInVideoEditor,
}) => {
  const t = translations[lang];

  // Active sub-mode: 'enhance' | 'video' | 'generate'
  const [mode, setMode] = useState<'enhance' | 'video' | 'generate'>('enhance');

  // Enhance state
  const [selectedPhoto, setSelectedPhoto] = useState<string>(SAMPLE_TEMPLATES[0].src);
  const [naturalPrompt, setNaturalPrompt] = useState<string>('');
  const [selectedEnhancePreset, setSelectedEnhancePreset] = useState<string>('smart_auto');
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [enhanceResult, setEnhanceResult] = useState<{
    title: string;
    explanation: string;
    adjustments: PhotoAdjustments;
  } | null>(null);

  // Video AI Studio State
  const videoStudioRef = useRef<HTMLVideoElement | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string>(
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  );
  const [videoAiResult, setVideoAiResult] = useState<VideoAIAnalysis | null>(null);
  const [isVideoAiLoading, setIsVideoAiLoading] = useState<boolean>(false);
  const [videoAiError, setVideoAiError] = useState<string | null>(null);
  const [videoAiPrompt, setVideoAiPrompt] = useState<string>('');
  const [copiedVideoScript, setCopiedVideoScript] = useState<boolean>(false);

  // AI Video Generation State (Text-to-Video & Image-to-Video)
  const [videoSubTab, setVideoSubTab] = useState<'generate_video' | 'grade_existing'>('generate_video');
  const [videoGenPrompt, setVideoGenPrompt] = useState<string>('');
  const [videoGenAspect, setVideoGenAspect] = useState<'16:9' | '9:16'>('16:9');
  const [videoGenDuration, setVideoGenDuration] = useState<'5s' | '10s'>('5s');
  const [videoGenStyle, setVideoGenStyle] = useState<string>('cinematic');
  const [videoGenStartingImage, setVideoGenStartingImage] = useState<string | null>(null);
  const [isVideoGenerating, setIsVideoGenerating] = useState<boolean>(false);
  const [generatedVideoResult, setGeneratedVideoResult] = useState<{
    videoUrl: string;
    title: string;
    duration: string;
  } | null>(null);

  // Generate state
  const [generatePrompt, setGeneratePrompt] = useState<string>('');
  const [generateStyle, setGenerateStyle] = useState<'realistic' | 'illustration' | 'sticker' | 'vector'>('realistic');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Run AI Video Generation
  const handleRunVideoGeneration = async () => {
    if (!videoGenPrompt.trim()) return;
    setIsVideoGenerating(true);
    setVideoAiError(null);
    setGeneratedVideoResult(null);

    try {
      const res = await fetch('/api/ai/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoGenPrompt.trim(),
          imageStartingFrame: videoGenStartingImage,
          aspectRatio: videoGenAspect,
          duration: videoGenDuration,
          style: videoGenStyle,
          lang: lang,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Video generation failed');
      }

      setGeneratedVideoResult({
        videoUrl: data.videoUrl,
        title: data.title || videoGenPrompt,
        duration: data.duration || videoGenDuration,
      });
      setSelectedVideo(data.videoUrl);
    } catch (err: any) {
      console.error(err);
      setVideoAiError(err.message || 'Error generating AI video');
    } finally {
      setIsVideoGenerating(false);
    }
  };

  // Run Video AI in AIStudio
  const handleRunVideoAIInStudio = async (
    targetMode: 'color_grade' | 'scene_summary' | 'subtitles' | 'social_script' | 'custom_prompt',
    specificPrompt?: string
  ) => {
    const video = videoStudioRef.current;
    if (!video) return;

    setIsVideoAiLoading(true);
    setVideoAiError(null);

    try {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = video.videoWidth || 640;
      tempCanvas.height = video.videoHeight || 360;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context error');

      ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
      const frameBase64 = tempCanvas.toDataURL('image/jpeg', 0.85);

      const res = await fetch('/api/ai/video-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frameBase64: frameBase64,
          mode: targetMode,
          userPrompt: specificPrompt || videoAiPrompt,
          lang: lang,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Video AI analysis failed');
      }

      setVideoAiResult(data.data);
    } catch (err: any) {
      console.error(err);
      setVideoAiError(err.message || 'Error processing video AI');
    } finally {
      setIsVideoAiLoading(false);
    }
  };

  // Helper convert image URL to base64
  const imageUrlToBase64 = async (url: string): Promise<string> => {
    if (url.startsWith('data:')) return url;
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Run AI Photo Auto-Enhance or Natural Language Edit
  const handleRunEnhance = async (specificMode?: string) => {
    setIsEnhancing(true);
    setErrorMsg(null);
    setEnhanceResult(null);

    try {
      const base64 = await imageUrlToBase64(selectedPhoto);

      // If user typed custom natural prompt, use edit-with-prompt endpoint
      if (naturalPrompt.trim()) {
        const res = await fetch('/api/ai/edit-with-prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            userPrompt: naturalPrompt.trim(),
            lang: lang,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to process edit');
        }

        const adj: PhotoAdjustments = {
          brightness: data.data.adjustments.brightness || 0,
          contrast: data.data.adjustments.contrast || 0,
          saturation: data.data.adjustments.saturation || 0,
          vibrance: data.data.adjustments.vibrance || 0,
          warmth: data.data.adjustments.warmth || 0,
          tint: data.data.adjustments.tint || 0,
          sepia: data.data.adjustments.sepia || 0,
          grayscale: data.data.adjustments.grayscale || 0,
          invert: data.data.adjustments.invert || 0,
          blur: data.data.adjustments.blur || 0,
          vignette: data.data.adjustments.vignette || 0,
          exposure: data.data.adjustments.exposure || 0,
          hueRotate: data.data.adjustments.hueRotate || 0,
        };

        setEnhanceResult({
          title: lang === 'ar' ? 'تعديل مخصص بالذكاء الاصطناعي' : 'Custom AI Edit',
          explanation: data.data.feedback,
          adjustments: adj,
        });
      } else {
        // Run preset auto-enhance mode
        const targetMode = specificMode || selectedEnhancePreset;
        const res = await fetch('/api/ai/auto-enhance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            mode: targetMode,
            lang: lang,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to enhance');
        }

        const adj: PhotoAdjustments = {
          brightness: data.data.adjustments.brightness || 0,
          contrast: data.data.adjustments.contrast || 0,
          saturation: data.data.adjustments.saturation || 0,
          vibrance: data.data.adjustments.vibrance || 0,
          warmth: data.data.adjustments.warmth || 0,
          tint: data.data.adjustments.tint || 0,
          sepia: data.data.adjustments.sepia || 0,
          grayscale: data.data.adjustments.grayscale || 0,
          invert: 0,
          blur: data.data.adjustments.blur || 0,
          vignette: data.data.adjustments.vignette || 0,
          exposure: data.data.adjustments.exposure || 0,
          hueRotate: 0,
        };

        setEnhanceResult({
          title: data.data.title || (lang === 'ar' ? 'تم التحسين بنجاح' : 'Enhanced Successfully'),
          explanation: data.data.explanation,
          adjustments: adj,
        });
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error executing AI action');
    } finally {
      setIsEnhancing(false);
    }
  };

  // Run AI Image / Artwork Generation
  const handleRunGenerate = async () => {
    if (!generatePrompt.trim()) return;
    setIsGenerating(true);
    setErrorMsg(null);
    setGeneratedImageUrl(null);

    try {
      if (generateStyle === 'sticker' || generateStyle === 'vector') {
        // Generate SVG vector artwork
        const res = await fetch('/api/ai/generate-artwork', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: generatePrompt.trim(),
            style: generateStyle,
            lang: lang,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to generate vector');
        }
        const base64Svg = btoa(unescape(encodeURIComponent(data.svg)));
        setGeneratedImageUrl(`data:image/svg+xml;base64,${base64Svg}`);
      } else {
        // Generate full image
        const res = await fetch('/api/ai/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: generatePrompt.trim(),
            aspectRatio: aspectRatio,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to generate image');
        }
        setGeneratedImageUrl(data.imageUrl);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Generation error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle file upload for enhancement
  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedPhoto(event.target.result as string);
          setEnhanceResult(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 pb-28 space-y-8 animate-in fade-in duration-200">
      {/* Title & Introduction */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-purple-600/15 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-purple-600/20">
          <Wand2 className="w-6 h-6" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          {t.aiTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          {t.aiSubtitle}
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center justify-center">
        <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-2xl flex items-center gap-1.5 max-w-xl w-full">
          <button
            onClick={() => setMode('enhance')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
              mode === 'enhance'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{t.aiModeEnhance}</span>
          </button>

          <button
            onClick={() => setMode('video')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
              mode === 'video'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4 text-purple-400" />
            <span>{t.videoAiTab}</span>
          </button>

          <button
            onClick={() => setMode('generate')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
              mode === 'generate'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-4 h-4 text-purple-400" />
            <span>{t.aiModeGenerate}</span>
          </button>
        </div>
      </div>

      {/* MODE 1: SMART PHOTO ENHANCEMENT & EDITING */}
      {mode === 'enhance' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Photo Preview & Selection */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              الصورة المراد تعديلها
            </h3>

            <div className="w-full h-64 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center relative shadow-inner">
              <img
                src={selectedPhoto}
                alt="Selected"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
              {isEnhancing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                  <span className="text-xs font-medium">{t.enhancingPhotoMsg}</span>
                </div>
              )}
            </div>

            {/* Template Thumbnails & Upload */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {SAMPLE_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => {
                      setSelectedPhoto(tmpl.src);
                      setEnhanceResult(null);
                    }}
                    className={`w-11 h-9 rounded-lg overflow-hidden border transition-all shrink-0 ${
                      selectedPhoto === tmpl.src
                        ? 'border-blue-500 ring-2 ring-blue-500/30'
                        : 'border-slate-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={tmpl.src} alt={tmpl.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer shrink-0 transition-colors">
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                <span>رفع صورة أخرى</span>
                <input type="file" accept="image/*" onChange={handleUploadPhoto} className="hidden" />
              </label>
            </div>
          </div>

          {/* Right Column: AI Controls & Results */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
            {/* Quick 1-Click Enhancement Presets */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {t.aiQuickEnhanceTitle}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'smart_auto', label: t.modeSmartAuto, desc: 'تصحيح تلقائي للإضاءة والتباين' },
                  { id: 'cinematic_glow', label: t.modeCinematic, desc: 'تدرج ألوان سينمائي غني' },
                  { id: 'hdr_vivid', label: t.modeHdr, desc: 'حيوية وتشبع ألوان فائق' },
                  { id: 'portrait_magic', label: t.modePortrait, desc: 'تنعيم البشرة ودفء الملامح' },
                  { id: 'vintage_film', label: t.modeVintage, desc: 'طابع كاميرات الفيلم 35mm' },
                  { id: 'night_clarity', label: t.modeNight, desc: 'تفتيح الظلام واستعادة التفاصيل' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedEnhancePreset(item.id);
                      setNaturalPrompt('');
                      handleRunEnhance(item.id);
                    }}
                    disabled={isEnhancing}
                    className={`p-3 rounded-2xl border text-right rtl:text-right ltr:text-left transition-all ${
                      selectedEnhancePreset === item.id && !naturalPrompt
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    <span className="block text-xs font-bold text-white truncate">{item.label}</span>
                    <span className="block text-[10px] text-slate-400 truncate mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* OR Custom Natural Language Prompt Input */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                أو اكتب التعديل المطلوب بكلماتك الخاصة:
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="مثال: اجعل الصورة تبدو كأنها التقطت في ساعة الغروب بألوان ذهبية دافئة..."
                  value={naturalPrompt}
                  onChange={(e) => setNaturalPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunEnhance()}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none transition-colors"
                />
              </div>
              <button
                onClick={() => handleRunEnhance()}
                disabled={isEnhancing}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-semibold text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                {isEnhancing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.enhancingPhotoMsg}</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>تطبيق التعديل بالذكاء الاصطناعي</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Result Card */}
            {enhanceResult && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{enhanceResult.title}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {enhanceResult.explanation}
                </p>

                {/* Key adjustment badges */}
                <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono text-slate-400 pt-1">
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    سطوع: {enhanceResult.adjustments.brightness > 0 ? `+${enhanceResult.adjustments.brightness}` : enhanceResult.adjustments.brightness}
                  </span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    تباين: {enhanceResult.adjustments.contrast > 0 ? `+${enhanceResult.adjustments.contrast}` : enhanceResult.adjustments.contrast}
                  </span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    تشبع: {enhanceResult.adjustments.saturation > 0 ? `+${enhanceResult.adjustments.saturation}` : enhanceResult.adjustments.saturation}
                  </span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    حرارة: {enhanceResult.adjustments.warmth > 0 ? `+${enhanceResult.adjustments.warmth}` : enhanceResult.adjustments.warmth}
                  </span>
                </div>

                <button
                  onClick={() => onOpenInPhotoEditor(selectedPhoto, enhanceResult.adjustments)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t.applyToEditor}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: VIDEO AI STUDIO & VIDEO GENERATION */}
      {mode === 'video' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Sub-tab switcher: Generate New Video VS Grade Existing */}
          <div className="flex items-center justify-center">
            <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex items-center gap-1 w-full max-w-md">
              <button
                onClick={() => setVideoSubTab('generate_video')}
                className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                  videoSubTab === 'generate_video'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{lang === 'ar' ? 'توليد فيديو بالذكاء الاصطناعي' : 'Generate AI Video'}</span>
              </button>

              <button
                onClick={() => setVideoSubTab('grade_existing')}
                className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                  videoSubTab === 'grade_existing'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-blue-300" />
                <span>{lang === 'ar' ? 'تلوين وتحليل فيديو' : 'Color Grade & Analyze'}</span>
              </button>
            </div>
          </div>

          {/* SUB-VIEW 1: AI VIDEO GENERATOR (Text-to-Video & Image-to-Video) */}
          {videoSubTab === 'generate_video' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
              {/* Prompt Input & Suggestions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>{lang === 'ar' ? 'اكتب وصف الفيديو المطلوب توليده:' : 'Describe the video to generate:'}</span>
                  </label>
                  <span className="text-[10px] text-purple-400 font-mono bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">
                    Gemini Video AI
                  </span>
                </div>

                <textarea
                  rows={3}
                  value={videoGenPrompt}
                  onChange={(e) => setVideoGenPrompt(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثال: غروب سينمائي ساحر مع تلاطم أمواج البحر الذهبية بدقة 4K وحركة كاميرا بطيئة وناعمة...' : 'e.g. Cinematic golden sunset over ocean waves in 4K with smooth slow-motion camera...'}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none transition-colors resize-none"
                />

                {/* Quick Inspiration Video Prompts */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  <span className="text-[11px] text-slate-500 shrink-0">{lang === 'ar' ? 'أفكار مقترحة:' : 'Suggestions:'}</span>
                  {[
                    'غروب سينمائي ساحر مع تلاطم أمواج البحر الذهبية بدقة 4K',
                    'صقر عربي يحلق في سماء صافية فوق قمم جبال شاهقة',
                    'سيارة رياضية نيون في شوارع طوكيو المستقبلية في ليلة ممطرة',
                    'رحلة فضائية كونية بين الكواكب والمجرات اللامعة',
                    'لقطة درون جوية فوق غابة استوائية وشلالات مائية ضخمة',
                  ].map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => setVideoGenPrompt(sug)}
                      className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500 hover:text-white text-[11px] text-slate-400 truncate max-w-xs shrink-0 transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings Controls: Aspect Ratio, Duration, Style, and Optional Image Frame */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800">
                {/* Aspect Ratio */}
                <div className="space-y-2">
                  <span className="text-xs text-slate-400 font-medium">
                    {lang === 'ar' ? 'أبعاد الفيديو (Aspect Ratio)' : 'Aspect Ratio'}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: '16:9', label: lang === 'ar' ? '16:9 أفقي (يوتيوب)' : '16:9 Landscape' },
                      { id: '9:16', label: lang === 'ar' ? '9:16 ريلز / شورتس' : '9:16 Portrait' },
                    ].map((ar) => (
                      <button
                        key={ar.id}
                        onClick={() => setVideoGenAspect(ar.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                          videoGenAspect === ar.id
                            ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-sm'
                            : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                        }`}
                      >
                        {ar.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <span className="text-xs text-slate-400 font-medium">
                    {lang === 'ar' ? 'مدة المقطع (Duration)' : 'Duration'}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: '5s', label: lang === 'ar' ? '⚡ 5 ثوانٍ (سريع)' : '5 seconds' },
                      { id: '10s', label: lang === 'ar' ? '🎬 10 ثوانٍ (كامل)' : '10 seconds' },
                    ].map((dur) => (
                      <button
                        key={dur.id}
                        onClick={() => setVideoGenDuration(dur.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                          videoGenDuration === dur.id
                            ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-sm'
                            : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                        }`}
                      >
                        {dur.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style */}
                <div className="space-y-2">
                  <span className="text-xs text-slate-400 font-medium">
                    {lang === 'ar' ? 'النمط السينمائي (Style)' : 'Visual Style'}
                  </span>
                  <select
                    value={videoGenStyle}
                    onChange={(e) => setVideoGenStyle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="cinematic">{lang === 'ar' ? 'سينمائي هوليوود (Cinematic)' : 'Cinematic Hollywood'}</option>
                    <option value="drone">{lang === 'ar' ? 'تصوير درون جوي (Aerial Drone)' : 'Aerial Drone'}</option>
                    <option value="cyberpunk">{lang === 'ar' ? 'خيال علمي ونيون (Cyberpunk)' : 'Futuristic Cyberpunk'}</option>
                    <option value="nature">{lang === 'ar' ? 'وثائقي طبيعة ناشيونال جيوغرافيك' : 'Nature Documentary'}</option>
                    <option value="3d_animation">{lang === 'ar' ? 'رسوم متحركة ثلاثية الأبعاد (3D CGI)' : '3D CGI Animation'}</option>
                  </select>
                </div>
              </div>

              {/* Optional: Image-to-Video Animate Frame */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-300">
                    {lang === 'ar' ? 'تحريك صورة (Image-to-Video اختيارياً):' : 'Optional Starting Frame (Image-to-Video):'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {videoGenStartingImage ? (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-purple-500">
                        <img src={videoGenStartingImage} alt="Frame" className="w-full h-full object-cover" />
                      </div>
                      <button
                        onClick={() => setVideoGenStartingImage(null)}
                        className="text-xs text-rose-400 hover:text-white"
                      >
                        {lang === 'ar' ? 'إزالة' : 'Remove'}
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium cursor-pointer border border-slate-700 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-purple-400" />
                      <span>{lang === 'ar' ? 'إرفاق صورة للتحريك' : 'Upload Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (ev.target?.result) setVideoGenStartingImage(ev.target.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Generate CTA Button */}
              <button
                onClick={handleRunVideoGeneration}
                disabled={!videoGenPrompt.trim() || isVideoGenerating}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                {isVideoGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{lang === 'ar' ? 'جاري توليد الفيديو بالذكاء الاصطناعي بدقة فائقة...' : 'Generating AI Video with Gemini Omni...'}</span>
                  </>
                ) : (
                  <>
                    <Film className="w-5 h-5 text-amber-300" />
                    <span>{lang === 'ar' ? '🎬 توليد الفيديو الآن بالذكاء الاصطناعي' : '🎬 Generate AI Video Now'}</span>
                  </>
                )}
              </button>

              {/* Error Alert */}
              {videoAiError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/50 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{videoAiError}</span>
                </div>
              )}

              {/* Generated Video Player & Output Card */}
              {generatedVideoResult && (
                <div className="p-5 rounded-3xl bg-slate-950 border border-purple-500/50 space-y-4 shadow-2xl animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'تم توليد الفيديو بنجاح!' : 'AI Video Generated Successfully!'}</span>
                    </div>
                    <span className="text-xs text-purple-300 font-mono bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-800">
                      {generatedVideoResult.duration} • {videoGenAspect}
                    </span>
                  </div>

                  <div className="w-full max-h-[460px] bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
                    <video
                      src={generatedVideoResult.videoUrl}
                      controls
                      autoPlay
                      loop
                      className="w-full max-h-[440px] object-contain"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <a
                      href={generatedVideoResult.videoUrl}
                      download={`ai-video-${Date.now()}.mp4`}
                      className="w-full sm:flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 text-center"
                    >
                      <Download className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'حفظ الفيديو في الهاتف' : 'Download Video to Phone'}</span>
                    </a>

                    {onOpenInVideoEditor && (
                      <button
                        onClick={() => onOpenInVideoEditor(generatedVideoResult.videoUrl)}
                        className="w-full sm:flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                      >
                        <Film className="w-4 h-4" />
                        <span>{lang === 'ar' ? 'فتح في استوديو الفيديو للتعديل' : 'Open in Video Editor'}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW 2: COLOR GRADE & SCENE ANALYSIS FOR EXISTING VIDEO */}
          {videoSubTab === 'grade_existing' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Video Player & Source */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    مقطع الفيديو للتحليل والتلوين
                  </h3>
                  <span className="text-[10px] text-purple-400 font-mono bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">
                    AI Active
                  </span>
                </div>

                <div className="w-full h-64 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center relative shadow-inner">
                  <video
                    ref={videoStudioRef}
                    src={selectedVideo}
                    controls
                    crossOrigin="anonymous"
                    className="w-full h-full object-contain"
                    playsInline
                  />
                  {isVideoAiLoading && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white z-20">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                      <span className="text-xs font-medium">{t.analyzingVideoMsg}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() =>
                      setSelectedVideo(
                        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                  >
                    نموذج تجريبي
                  </button>

                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-medium cursor-pointer border border-purple-500/30 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع فيديو آخر</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setSelectedVideo(URL.createObjectURL(f));
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Right Column: AI Video Actions & Results */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
                {/* Quick 1-Click Color Grade Presets */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {t.videoAiModeGrade}
                    </h3>
                    <span className="text-[11px] text-slate-500">بنقرة واحدة على الكادر الحالي</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'teal_orange', label: t.videoAiPresetTealOrange, prompt: 'Hollywood blockbuster cinematic teal and orange color grade' },
                      { id: 'golden_sunset', label: t.videoAiPresetWarmGolden, prompt: 'Warm golden sunset hour tone with amber warmth' },
                      { id: 'moody_noir', label: t.videoAiPresetMoodyNoir, prompt: 'Moody dark noir aesthetic with rich shadows' },
                      { id: 'vivid_pop', label: t.videoAiPresetVividPop, prompt: 'Ultra vivid saturated colors with crystal crisp vibrance' },
                      { id: 'cyberpunk', label: t.videoAiPresetCyberpunk, prompt: 'Futuristic cyberpunk neon night atmosphere' },
                      { id: 'smart_auto', label: 'تحسين أوتوماتيكي', prompt: 'Balanced professional clean exposure and color fidelity' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleRunVideoAIInStudio('color_grade', item.prompt)}
                        disabled={isVideoAiLoading}
                        className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-purple-500 text-right rtl:text-right ltr:text-left transition-all disabled:opacity-50"
                      >
                        <span className="block text-xs font-bold text-white truncate">{item.label}</span>
                        <span className="block text-[10px] text-slate-400 truncate mt-0.5">تلوين فوري</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Prompt */}
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    أو اكتب توجيهك الخاص بالذكاء الاصطناعي للمشهد:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t.videoAiCustomPromptPlaceholder}
                      value={videoAiPrompt}
                      onChange={(e) => setVideoAiPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRunVideoAIInStudio('custom_prompt')}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => handleRunVideoAIInStudio('custom_prompt')}
                    disabled={!videoAiPrompt.trim() || isVideoAiLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isVideoAiLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t.analyzingVideoMsg}</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        <span>تطبيق التوجيه بالذكاء الاصطناعي</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Smart Actions Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleRunVideoAIInStudio('scene_summary')}
                    disabled={isVideoAiLoading}
                    className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-blue-500 text-slate-300 hover:text-white text-xs font-medium transition-colors text-center disabled:opacity-50"
                  >
                    {t.videoAiModeScene}
                  </button>
                  <button
                    onClick={() => handleRunVideoAIInStudio('subtitles')}
                    disabled={isVideoAiLoading}
                    className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-blue-500 text-slate-300 hover:text-white text-xs font-medium transition-colors text-center disabled:opacity-50"
                  >
                    {t.videoAiModeSubtitles}
                  </button>
                  <button
                    onClick={() => handleRunVideoAIInStudio('social_script')}
                    disabled={isVideoAiLoading}
                    className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-purple-500 text-slate-300 hover:text-white text-xs font-medium transition-colors text-center disabled:opacity-50"
                  >
                    {t.videoAiModeSocial}
                  </button>
                </div>

                {/* Video AI Result Card */}
                {videoAiResult && (
                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-purple-500/30 space-y-3.5 shadow-xl animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2 text-purple-300 font-bold text-xs truncate">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>{videoAiResult.title}</span>
                      </div>
                      <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{videoAiResult.aestheticScore}/100</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {videoAiResult.summary}
                    </p>

                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-slate-400">{t.cinematographyStyle}:</span>
                      <span className="font-semibold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-800">
                        {videoAiResult.cinematographyStyle}
                      </span>
                    </div>

                    {videoAiResult.subtitleSuggestion && (
                      <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/40 space-y-1">
                        <div className="text-[11px] text-blue-300 font-semibold">الترجمة للمشهد:</div>
                        <p className="text-xs text-white font-medium italic">
                          "{videoAiResult.subtitleSuggestion}"
                        </p>
                      </div>
                    )}

                    {videoAiResult.socialPost && (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold">
                          <span>{videoAiResult.socialPost.hookTitle}</span>
                          <button
                            onClick={() => {
                              const text = `${videoAiResult.socialPost?.hookTitle}\n\n${videoAiResult.socialPost?.caption}\n\n${videoAiResult.socialPost?.hashtags.join(' ')}`;
                              navigator.clipboard.writeText(text);
                              setCopiedVideoScript(true);
                              setTimeout(() => setCopiedVideoScript(false), 2000);
                            }}
                            className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                          >
                            {copiedVideoScript ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedVideoScript ? t.copiedSuccess : t.copySocialPost}</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {videoAiResult.socialPost.caption}
                        </p>
                        <div className="text-[10px] text-purple-400/90 font-mono">
                          {videoAiResult.socialPost.hashtags.join(' ')}
                        </div>
                      </div>
                    )}

                    {/* Transition to Video Editor */}
                    {onOpenInVideoEditor && (
                      <button
                        onClick={() => onOpenInVideoEditor(selectedVideo)}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                      >
                        <Film className="w-4 h-4" />
                        <span>فتح المقطع في استوديو الفيديو للتعديل والتصدير</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: GENERATE NEW IMAGE & ARTWORK */}
      {mode === 'generate' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              صف فكرة الصورة أو العمل الفني:
            </label>
            <textarea
              rows={3}
              placeholder={t.aiPromptPlaceholder}
              value={generatePrompt}
              onChange={(e) => setGeneratePrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none transition-colors resize-none"
            />

            {/* Quick Inspiration Prompts */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <span className="text-[11px] text-slate-500 shrink-0">أفكار سريعة:</span>
              {PROMPT_SUGGESTIONS.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => setGeneratePrompt(sug)}
                  className="px-2.5 py-1 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-purple-500 hover:text-white text-[11px] text-slate-400 truncate max-w-xs shrink-0 transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Style & Aspect Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div className="space-y-2">
              <span className="text-xs text-slate-400 font-medium">النمط الفني (Style)</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'realistic', label: 'صورة واقعية سينمائية' },
                  { id: 'illustration', label: 'رسم توضيحي فني' },
                  { id: 'sticker', label: 'ملصق شفاف (Sticker)' },
                  { id: 'vector', label: 'شعار ورسم Vector' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setGenerateStyle(st.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-colors ${
                      generateStyle === st.id
                        ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-slate-400 font-medium">أبعاد الصورة (Aspect Ratio)</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '1:1', label: '1:1 مربع' },
                  { id: '16:9', label: '16:9 أفقي' },
                  { id: '9:16', label: '9:16 ستوري' },
                ].map((ar) => (
                  <button
                    key={ar.id}
                    onClick={() => setAspectRatio(ar.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-colors ${
                      aspectRatio === ar.id
                        ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    {ar.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleRunGenerate}
            disabled={!generatePrompt.trim() || isGenerating}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t.generatingArtMsg}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>{t.generateAiBtn}</span>
              </>
            )}
          </button>

          {/* Generated Result Display */}
          {generatedImageUrl && (
            <div className="pt-4 border-t border-slate-800 space-y-4 animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.aiGeneratedSuccess}</span>
              </div>

              <div className="w-full max-h-[500px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner p-2">
                <img
                  src={generatedImageUrl}
                  alt="AI Generated"
                  className="max-w-full max-h-[460px] object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => onOpenInPhotoEditor(generatedImageUrl)}
                  className="w-full sm:flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Sliders className="w-4 h-4" />
                  <span>{t.applyToEditor}</span>
                </button>

                <a
                  href={generatedImageUrl}
                  download={`ai-creation-${Date.now()}.png`}
                  className="w-full sm:flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-colors flex items-center justify-center gap-2 text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>{t.downloadResult}</span>
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
