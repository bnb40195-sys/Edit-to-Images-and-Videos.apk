import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppLanguage, VideoAdjustments, VideoAIAnalysis } from '../../types';
import { translations } from '../../i18n/translations';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Camera,
  Scissors,
  Download,
  Upload,
  Sparkles,
  Sliders,
  Type,
  FastForward,
  Film,
  Music,
  Check,
  RefreshCw,
  Wand2,
  Copy,
  CheckCheck,
  Star,
  Tag,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface VideoEditorProps {
  lang: AppLanguage;
  externalVideoSrc?: string | null;
  onOpenInPhotoEditor?: (imageSrc: string) => void;
  onOpenInAIStudio?: () => void;
}

export const VideoEditor: React.FC<VideoEditorProps> = ({
  lang,
  externalVideoSrc,
  onOpenInPhotoEditor,
  onOpenInAIStudio,
}) => {
  const t = translations[lang];

  // Video source state
  const [videoSrc, setVideoSrc] = useState<string | null>(externalVideoSrc || null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isGeneratingDemo, setIsGeneratingDemo] = useState<boolean>(false);

  useEffect(() => {
    if (externalVideoSrc) {
      setVideoSrc(externalVideoSrc);
    }
  }, [externalVideoSrc]);

  // Video adjustments
  const [adjustments, setAdjustments] = useState<VideoAdjustments>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    sepia: 0,
    grayscale: 0,
    invert: 0,
    hueRotate: 0,
    playbackRate: 1,
    volume: 1,
    isMuted: false,
    aspectRatio: 'original',
    trimStart: 0,
    trimEnd: 0,
    watermarkText: '',
  });

  // Export recording state
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  // Active side panel tab: 'trim' | 'filters' | 'videoAi' | 'watermark'
  const [activeTab, setActiveTab] = useState<'trim' | 'filters' | 'videoAi' | 'watermark'>('trim');

  // Video AI states
  const [isAnalyzingAI, setIsAnalyzingAI] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiCustomPrompt, setAiCustomPrompt] = useState<string>('');
  const [aiAnalysisResult, setAiAnalysisResult] = useState<VideoAIAnalysis | null>(null);
  const [copiedPost, setCopiedPost] = useState<boolean>(false);

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Helper format seconds to mm:ss.ms
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00.0';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  // Run AI Video Analysis / Color Grading / Subtitles / Social Script
  const handleRunVideoAI = async (
    mode: 'color_grade' | 'scene_summary' | 'subtitles' | 'social_script' | 'custom_prompt',
    specificPrompt?: string
  ) => {
    if (!videoRef.current && !canvasRef.current) return;
    setIsAnalyzingAI(true);
    setAiError(null);

    try {
      let frameDataUrl = '';
      if (canvasRef.current && canvasRef.current.width > 0) {
        frameDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);
      } else if (videoRef.current) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = videoRef.current.videoWidth || 640;
        tempCanvas.height = videoRef.current.videoHeight || 360;
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, tempCanvas.width, tempCanvas.height);
          frameDataUrl = tempCanvas.toDataURL('image/jpeg', 0.85);
        }
      }

      if (!frameDataUrl) {
        throw new Error(lang === 'ar' ? 'تعذر التقاط كادر من الفيديو' : 'Unable to capture frame');
      }

      const res = await fetch('/api/ai/video-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frameBase64: frameDataUrl,
          mode: mode,
          userPrompt: specificPrompt || aiCustomPrompt,
          lang: lang,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'AI Video Analysis failed');
      }

      const result: VideoAIAnalysis = data.data;
      setAiAnalysisResult(result);

      // If mode is color_grade or custom_prompt, apply adjustments immediately to video!
      if (result.adjustments && (mode === 'color_grade' || mode === 'custom_prompt')) {
        const adj = result.adjustments;
        setAdjustments((prev) => ({
          ...prev,
          brightness: typeof adj.brightness === 'number' ? adj.brightness : prev.brightness,
          contrast: typeof adj.contrast === 'number' ? adj.contrast : prev.contrast,
          saturation: typeof adj.saturation === 'number' ? adj.saturation : prev.saturation,
          sepia: typeof adj.sepia === 'number' ? adj.sepia : prev.sepia,
          grayscale: typeof adj.grayscale === 'number' ? adj.grayscale : prev.grayscale,
          invert: typeof adj.invert === 'number' ? adj.invert : prev.invert,
          hueRotate: typeof adj.hueRotate === 'number' ? adj.hueRotate : prev.hueRotate,
        }));
      }
    } catch (err: any) {
      console.error('Video AI Error:', err);
      setAiError(err.message || 'Error running Video AI');
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  // Build video CSS filter string
  const getVideoFilterString = useCallback(() => {
    const b = 100 + adjustments.brightness;
    const c = 100 + adjustments.contrast;
    const s = 100 + adjustments.saturation;
    return `brightness(${Math.max(0, b)}%) contrast(${Math.max(0, c)}%) saturate(${Math.max(0, s)}%) sepia(${adjustments.sepia}%) grayscale(${adjustments.grayscale}%) invert(${adjustments.invert}%) hue-rotate(${adjustments.hueRotate}deg)`;
  }, [adjustments]);

  // Canvas drawing loop
  const drawFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Apply video filters
    ctx.filter = getVideoFilterString();
    ctx.drawImage(video, 0, 0, w, h);
    ctx.filter = 'none';

    // Apply Watermark overlay if provided
    if (adjustments.watermarkText.trim()) {
      ctx.save();
      ctx.font = 'bold 22px Cairo, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 8;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(adjustments.watermarkText, w - 24, h - 24);
      ctx.restore();
    }
  }, [getVideoFilterString, adjustments.watermarkText]);

  // RequestAnimationFrame loop for active playback
  useEffect(() => {
    const loop = () => {
      drawFrame();
      if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime);
        // Auto-pause if loop reaches trimEnd
        if (adjustments.trimEnd > 0 && videoRef.current.currentTime >= adjustments.trimEnd) {
          videoRef.current.pause();
          setIsPlaying(false);
          videoRef.current.currentTime = adjustments.trimStart;
        }
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [drawFrame, adjustments.trimEnd, adjustments.trimStart]);

  // Handle video metadata loaded
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    const dur = video.duration || 10;
    setDuration(dur);
    setAdjustments((prev) => ({
      ...prev,
      trimStart: 0,
      trimEnd: dur,
    }));

    if (canvasRef.current) {
      canvasRef.current.width = video.videoWidth || 854;
      canvasRef.current.height = video.videoHeight || 480;
    }
    drawFrame();
  };

  // Play / Pause toggle
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      if (adjustments.trimEnd > 0 && video.currentTime >= adjustments.trimEnd) {
        video.currentTime = adjustments.trimStart;
      }
      video.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Step backward / forward
  const handleStep = (delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = Math.max(0, Math.min(duration, video.currentTime + delta));
    video.currentTime = newTime;
    setCurrentTime(newTime);
    drawFrame();
  };

  // Seek time
  const handleSeek = (newTime: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = newTime;
    setCurrentTime(newTime);
    drawFrame();
  };

  // Speed change
  const handleSpeedChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setAdjustments((prev) => ({ ...prev, playbackRate: rate }));
    }
  };

  // Volume & Mute
  const handleVolumeChange = (vol: number) => {
    if (videoRef.current) {
      videoRef.current.volume = vol;
      videoRef.current.muted = vol === 0;
      setAdjustments((prev) => ({ ...prev, volume: vol, isMuted: vol === 0 }));
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !adjustments.isMuted;
      videoRef.current.muted = nextMuted;
      setAdjustments((prev) => ({ ...prev, isMuted: nextMuted }));
    }
  };

  // Capture High-Res Snapshot Frame
  const handleCaptureSnapshot = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png', 1.0);
    const filename = `video-snapshot-frame-${Math.round(currentTime * 10)}.png`;
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();

    try {
      const activePath = localStorage.getItem('media_studio_phone_save_path') || 'Pictures/MediaStudio/Edited/';
      const saved = localStorage.getItem('offline_universal_downloads_vault');
      const prevList = saved ? JSON.parse(saved) : [];
      const newItem = {
        id: 'snapshot_' + Date.now(),
        url: dataUrl,
        title: filename,
        filename: filename,
        type: 'image' as const,
        sizeFormatted: 'لقطة شاشة HD',
        blobUrl: dataUrl,
        downloadUrl: dataUrl,
        timestamp: Date.now(),
        quality: 'Original Full HD',
        savePath: activePath,
        isEdited: true,
      };
      const updated = [newItem, ...prevList].slice(0, 30);
      localStorage.setItem('offline_universal_downloads_vault', JSON.stringify(updated));
    } catch (e) {}
  };

  // Extract Audio as WAV/recorded audio file
  const handleExtractAudio = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      // Create offline audio context and stream capture
      const stream = (video as any).captureStream ? (video as any).captureStream() : null;
      if (!stream) {
        alert(lang === 'ar' ? 'استخراج الصوت غير مدعوم في هذا المتصفح' : 'Audio extraction not supported');
        return;
      }
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        alert(lang === 'ar' ? 'هذا الفيديو لا يحتوي على مسار صوتي' : 'This video does not contain an audio track');
        return;
      }

      const audioStream = new MediaStream(audioTracks);
      const recorder = new MediaRecorder(audioStream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `extracted-audio-${Date.now()}.webm`;
        a.click();
      };

      video.currentTime = adjustments.trimStart;
      recorder.start();
      await video.play();

      const durationMs = (adjustments.trimEnd - adjustments.trimStart) * 1000;
      setTimeout(() => {
        recorder.stop();
        video.pause();
      }, Math.max(1000, durationMs));
    } catch (err) {
      console.error(err);
    }
  };

  // 100% Offline Demo Video Synthesizer (Generates a full video in browser memory!)
  const handleGenerateDemoVideo = () => {
    setIsGeneratingDemo(true);
    const demoCanvas = document.createElement('canvas');
    demoCanvas.width = 640;
    demoCanvas.height = 360;
    const ctx = demoCanvas.getContext('2d');
    if (!ctx) {
      setIsGeneratingDemo(false);
      return;
    }

    const stream = demoCanvas.captureStream(30);

    // Synthesize audio beep tone with AudioContext
    let audioTrack: MediaStreamTrack | null = null;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const dst = audioCtx.createMediaStreamDestination();
      osc.connect(dst);
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.start();
      audioTrack = dst.stream.getAudioTracks()[0];
      if (audioTrack) stream.addTrack(audioTrack);
    } catch (e) {
      // Audio optional in synthesized demo
    }

    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoSrc(url);
      setIsGeneratingDemo(false);
    };

    recorder.start();

    let frameCount = 0;
    const totalFrames = 30 * 6; // 6 seconds demo video

    const renderLoop = () => {
      if (frameCount >= totalFrames) {
        recorder.stop();
        return;
      }

      const timeSec = (frameCount / 30).toFixed(1);

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 640, 360);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#1e293b');
      grad.addColorStop(1, '#0284c7');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 360);

      // Animated orbiting geometric shapes
      const cx = 320;
      const cy = 180;
      const angle = (frameCount * 0.05);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.fillRect(-60, -60, 120, 120);
      ctx.restore();

      // Bouncing glowing ball
      const ballY = 180 + Math.sin(frameCount * 0.1) * 80;
      ctx.beginPath();
      ctx.arc(320, ballY, 28, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Studio Typography Title & Offline Badge
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Cairo, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('استوديو الفيديو أوفلاين | Video Demo', 320, 70);

      ctx.font = '16px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`TIME: ${timeSec}s / 6.0s · 30 FPS`, 320, 310);

      frameCount++;
      setTimeout(renderLoop, 1000 / 30);
    };

    renderLoop();
  };

  // Video File Upload Handler
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
    }
  };

  // Render & Export Filtered/Trimmed Video (100% Offline with MediaRecorder)
  const handleExportVideo = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setIsExporting(true);
    setExportProgress(0);
    setExportSuccess(false);

    try {
      const stream = canvas.captureStream(30);

      // Check if original video has audio and mix it
      try {
        const videoStream = (video as any).captureStream ? (video as any).captureStream() : null;
        if (videoStream && videoStream.getAudioTracks().length > 0 && !adjustments.isMuted) {
          stream.addTrack(videoStream.getAudioTracks()[0]);
        }
      } catch (err) {
        // audio capture fallback
      }

      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `offline-video-edit-${Date.now()}.webm`;
        a.click();
        setIsExporting(false);
        setExportSuccess(true);
      };

      // Set playback to trimStart
      video.currentTime = adjustments.trimStart;
      recorder.start();
      await video.play();

      const trimDuration = adjustments.trimEnd - adjustments.trimStart;
      const startTime = Date.now();

      const progressInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min(100, Math.round((elapsed / trimDuration) * 100));
        setExportProgress(progress);

        if (video.currentTime >= adjustments.trimEnd || elapsed >= trimDuration) {
          clearInterval(progressInterval);
          recorder.stop();
          video.pause();
        }
      }, 200);
    } catch (err) {
      console.error(err);
      setIsExporting(false);
      alert(lang === 'ar' ? 'حدث خطأ أثناء تصدير الفيديو' : 'Export failed');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row flex-1 min-h-[calc(100vh-3.5rem)] pb-20 lg:pb-20 w-full bg-slate-950">
      {/* Hidden HTML5 Video element for native decoding */}
      {videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          onLoadedMetadata={handleLoadedMetadata}
          className="hidden"
          playsInline
        />
      )}

      {/* Main Video Viewport & Timeline Area */}
      <div className="flex-1 flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8 bg-slate-950/60 overflow-hidden relative">
        {/* Top Control Bar: Snapshot, Audio extract, Export */}
        <div className="w-full max-w-4xl flex items-center justify-between gap-3 mb-4 z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCaptureSnapshot}
              disabled={!videoSrc}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors"
              title={t.captureFrame}
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">{t.captureFrame}</span>
            </button>

            <button
              onClick={handleExtractAudio}
              disabled={!videoSrc}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors"
              title={t.extractAudio}
            >
              <Music className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">{t.extractAudio}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportVideo}
              disabled={!videoSrc || isExporting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/30 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? `${t.exportingVideoMsg} (${exportProgress}%)` : t.exportVideo}</span>
            </button>
          </div>
        </div>

        {/* Video Canvas Viewport */}
        <div className="w-full flex-1 flex items-center justify-center p-2 min-h-[300px] max-h-[58vh] overflow-hidden">
          {videoSrc ? (
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-black max-w-full max-h-full flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[52vh] object-contain block cursor-pointer"
                onClick={togglePlay}
              />
              {/* Center Play Overlay Icon when paused */}
              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                >
                  <Play className="w-8 h-8 fill-white ml-1 rtl:mr-1" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800 rounded-3xl max-w-md w-full bg-slate-900/40 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Film className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">{t.uploadVideo}</h3>
                <p className="text-xs text-slate-400">{t.dragDropVideo}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 w-full pt-2">
                <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-md transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>{t.uploadVideo}</span>
                  <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                </label>

                {onOpenInAIStudio && (
                  <button
                    onClick={onOpenInAIStudio}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>{lang === 'ar' ? 'توليد فيديو بالذكاء الاصطناعي ✨' : 'Generate AI Video ✨'}</span>
                  </button>
                )}

                <button
                  onClick={handleGenerateDemoVideo}
                  disabled={isGeneratingDemo}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
                >
                  <Film className="w-4 h-4 text-slate-400" />
                  <span>{isGeneratingDemo ? t.generatingVideo : t.generateSampleVideo}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Video Scrubber & Playback Timeline Bar */}
        {videoSrc && (
          <div className="w-full max-w-4xl mt-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
            {/* Scrubber slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="tabular-nums text-blue-400">{formatTime(currentTime)}</span>
                <span className="tabular-nums">{formatTime(duration)}</span>
              </div>
              <input
                type="range"
                min="0"
                max={duration || 10}
                step="0.05"
                value={currentTime}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Playback action controls row */}
            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStep(-0.1)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title={t.stepBack}
                >
                  -0.1s
                </button>

                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-md transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                </button>

                <button
                  onClick={() => handleStep(0.1)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title={t.stepForward}
                >
                  +0.1s
                </button>
              </div>

              {/* Speed Buttons */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                {[0.5, 1, 1.5, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => handleSpeedChange(spd)}
                    className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                      adjustments.playbackRate === spd ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              {/* Volume & Mute */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  {adjustments.isMuted || adjustments.volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-slate-300" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={adjustments.isMuted ? 0 : adjustments.volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-16 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer hidden sm:inline-block"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Side Tools Panel: Trim, Filters, Watermark, Audio */}
      <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l rtl:lg:border-r rtl:lg:border-l-0 border-slate-800 bg-slate-900/95 flex flex-col h-auto lg:h-[calc(100vh-3.5rem-4.5rem)]">
        {/* Category Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2.5 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('trim')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium shrink-0 transition-colors ${
              activeTab === 'trim' ? 'bg-blue-600/15 text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>{t.trimming}</span>
          </button>

          <button
            onClick={() => setActiveTab('filters')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium shrink-0 transition-colors ${
              activeTab === 'filters' ? 'bg-blue-600/15 text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.videoFilters}</span>
          </button>

          <button
            onClick={() => setActiveTab('videoAi')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium shrink-0 transition-all ${
              activeTab === 'videoAi'
                ? 'bg-purple-600/20 text-purple-300 ring-1 ring-purple-500/40'
                : 'text-purple-400/80 hover:text-purple-300'
            }`}
          >
            <Wand2 className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="font-semibold">{t.videoAiTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('watermark')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium shrink-0 transition-colors ${
              activeTab === 'watermark' ? 'bg-blue-600/15 text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>{t.videoWatermark}</span>
          </button>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* TAB 1: TRIM */}
          {activeTab === 'trim' && (
            <div className="space-y-5">
              <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                {t.trimming}
              </h3>

              <div className="space-y-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{t.trimStart}</span>
                    <span className="font-mono text-blue-400 tabular-nums">
                      {formatTime(adjustments.trimStart)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={adjustments.trimEnd || duration}
                    step="0.1"
                    value={adjustments.trimStart}
                    onChange={(e) =>
                      setAdjustments((prev) => ({ ...prev, trimStart: Number(e.target.value) }))
                    }
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <button
                    onClick={() =>
                      setAdjustments((prev) => ({ ...prev, trimStart: currentTime }))
                    }
                    className="text-[11px] text-blue-400 hover:underline"
                  >
                    {t.setStartCurrent}
                  </button>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{t.trimEnd}</span>
                    <span className="font-mono text-blue-400 tabular-nums">
                      {formatTime(adjustments.trimEnd)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={adjustments.trimStart}
                    max={duration || 10}
                    step="0.1"
                    value={adjustments.trimEnd}
                    onChange={(e) =>
                      setAdjustments((prev) => ({ ...prev, trimEnd: Number(e.target.value) }))
                    }
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <button
                    onClick={() =>
                      setAdjustments((prev) => ({ ...prev, trimEnd: currentTime }))
                    }
                    className="text-[11px] text-blue-400 hover:underline"
                  >
                    {t.setEndCurrent}
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>{t.selectedDuration}</span>
                  <span className="font-mono text-white tabular-nums font-semibold">
                    {formatTime(Math.max(0, adjustments.trimEnd - adjustments.trimStart))}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded-xl text-xs text-blue-300 leading-relaxed">
                {t.videoFormatNotice}
              </div>
            </div>
          )}

          {/* TAB 2: FILTERS */}
          {activeTab === 'filters' && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                {t.videoFilters}
              </h3>

              {/* Sliders list */}
              {[
                { key: 'brightness', label: t.brightness, min: -100, max: 100 },
                { key: 'contrast', label: t.contrast, min: -100, max: 100 },
                { key: 'saturation', label: t.saturation, min: -100, max: 100 },
                { key: 'sepia', label: t.sepia, min: 0, max: 100 },
                { key: 'grayscale', label: t.grayscale, min: 0, max: 100 },
                { key: 'invert', label: t.invert, min: 0, max: 100 },
                { key: 'hueRotate', label: t.hueRotate, min: -180, max: 180 },
              ].map(({ key, label, min, max }) => {
                const val = adjustments[key as keyof VideoAdjustments] as number;
                return (
                  <div key={key} className="space-y-1.5 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{label}</span>
                      <span className="font-mono tabular-nums text-blue-400 text-[11px]">
                        {val > 0 ? `+${val}` : val}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      value={val}
                      onChange={(e) =>
                        setAdjustments((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                      }
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: VIDEO AI ASSISTANT */}
          {activeTab === 'videoAi' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-blue-950/40 border border-purple-500/30 space-y-1">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                  <Wand2 className="w-4 h-4 text-purple-400" />
                  <span>{t.videoAiTitle}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {t.videoAiSubtitle}
                </p>
                <div className="text-[10px] text-purple-300/70 font-mono pt-1">
                  الكادر الحالي: {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              {/* Quick Cinematic Color Grade Presets */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  {t.videoAiModeGrade}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'teal_orange', label: t.videoAiPresetTealOrange, prompt: 'Hollywood blockbuster cinematic teal and orange color grade with deep contrast' },
                    { id: 'golden_sunset', label: t.videoAiPresetWarmGolden, prompt: 'Warm golden sunset hour tone with soft highlights and amber warmth' },
                    { id: 'moody_noir', label: t.videoAiPresetMoodyNoir, prompt: 'Moody dark noir aesthetic with rich shadows and film contrast' },
                    { id: 'vivid_pop', label: t.videoAiPresetVividPop, prompt: 'Ultra vivid saturated colors with crystal crisp vibrance' },
                    { id: 'cyberpunk', label: t.videoAiPresetCyberpunk, prompt: 'Futuristic cyberpunk neon night atmosphere with cool blues and magenta' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleRunVideoAI('color_grade', preset.prompt)}
                      disabled={isAnalyzingAI}
                      className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-purple-500 text-right rtl:text-right ltr:text-left text-xs text-slate-300 hover:text-white transition-all disabled:opacity-50"
                    >
                      <span className="block font-medium truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Natural Language Prompt */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  {t.videoAiModeCustom}
                </span>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t.videoAiCustomPromptPlaceholder}
                    value={aiCustomPrompt}
                    onChange={(e) => setAiCustomPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRunVideoAI('custom_prompt')}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => handleRunVideoAI('custom_prompt')}
                  disabled={!aiCustomPrompt.trim() || isAnalyzingAI}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white font-semibold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  {isAnalyzingAI ? (
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

              {/* Smart Analysis & Captioning Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  أدوات التحليل والترجمة الذكية
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleRunVideoAI('scene_summary')}
                    disabled={isAnalyzingAI}
                    className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-blue-500 text-slate-300 hover:text-white text-xs font-medium transition-colors disabled:opacity-50 text-center"
                  >
                    {t.videoAiModeScene}
                  </button>
                  <button
                    onClick={() => handleRunVideoAI('subtitles')}
                    disabled={isAnalyzingAI}
                    className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-blue-500 text-slate-300 hover:text-white text-xs font-medium transition-colors disabled:opacity-50 text-center"
                  >
                    {t.videoAiModeSubtitles}
                  </button>
                  <button
                    onClick={() => handleRunVideoAI('social_script')}
                    disabled={isAnalyzingAI}
                    className="col-span-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-purple-500 text-slate-300 hover:text-white text-xs font-medium transition-colors disabled:opacity-50 text-center"
                  >
                    {t.videoAiModeSocial}
                  </button>
                </div>
              </div>

              {/* Error notice */}
              {aiError && (
                <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}

              {/* AI Analysis Result Card */}
              {aiAnalysisResult && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-3 shadow-xl animate-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-1.5 text-purple-300 font-bold text-xs truncate max-w-[200px]">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>{aiAnalysisResult.title}</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{aiAnalysisResult.aestheticScore}/100</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {aiAnalysisResult.summary}
                  </p>

                  {/* Cinematography Style Badge */}
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-slate-400">{t.cinematographyStyle}:</span>
                    <span className="font-semibold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-800">
                      {aiAnalysisResult.cinematographyStyle}
                    </span>
                  </div>

                  {/* Detected Tags */}
                  {aiAnalysisResult.detectedTags && aiAnalysisResult.detectedTags.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] text-slate-400 block">{t.detectedElements}:</span>
                      <div className="flex items-center gap-1 flex-wrap">
                        {aiAnalysisResult.detectedTags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Subtitle Suggestion & 1-click apply */}
                  {aiAnalysisResult.subtitleSuggestion && (
                    <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/40 space-y-2">
                      <div className="text-[11px] text-blue-300 font-semibold">
                        الترجمة المقترحة للمشهد:
                      </div>
                      <p className="text-xs text-white font-medium italic">
                        "{aiAnalysisResult.subtitleSuggestion}"
                      </p>
                      <button
                        onClick={() =>
                          setAdjustments((prev) => ({
                            ...prev,
                            watermarkText: aiAnalysisResult.subtitleSuggestion || prev.watermarkText,
                          }))
                        }
                        className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Type className="w-3.5 h-3.5" />
                        <span>{t.applySubtitleOverlay}</span>
                      </button>
                    </div>
                  )}

                  {/* Social Post Content & 1-click copy */}
                  {aiAnalysisResult.socialPost && (
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold">
                        <span>{aiAnalysisResult.socialPost.hookTitle}</span>
                        <button
                          onClick={() => {
                            const postText = `${aiAnalysisResult.socialPost?.hookTitle}\n\n${aiAnalysisResult.socialPost?.caption}\n\n${aiAnalysisResult.socialPost?.hashtags.join(' ')}`;
                            navigator.clipboard.writeText(postText);
                            setCopiedPost(true);
                            setTimeout(() => setCopiedPost(false), 2000);
                          }}
                          className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                        >
                          {copiedPost ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedPost ? t.copiedSuccess : t.copySocialPost}</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {aiAnalysisResult.socialPost.caption}
                      </p>
                      <div className="text-[10px] text-purple-400/90 font-mono">
                        {aiAnalysisResult.socialPost.hashtags.join(' ')}
                      </div>
                    </div>
                  )}

                  {/* Frame Upgrade & Photo Editor Transition */}
                  {onOpenInPhotoEditor && (
                    <button
                      onClick={() => {
                        if (canvasRef.current) {
                          const dataUrl = canvasRef.current.toDataURL('image/png', 1.0);
                          onOpenInPhotoEditor(dataUrl);
                        }
                      }}
                      className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-[11px] font-medium flex items-center justify-center gap-1.5 border border-slate-800 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                      <span>ترقية هذه اللقطة ونقلها لمحرر الصور</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WATERMARK */}
          {activeTab === 'watermark' && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                {t.videoWatermark}
              </h3>

              <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                <input
                  type="text"
                  placeholder={t.watermarkPlaceholder}
                  value={adjustments.watermarkText}
                  onChange={(e) =>
                    setAdjustments((prev) => ({ ...prev, watermarkText: e.target.value }))
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-[11px] text-slate-400">
                  تظهر هذه العلامة المائية بشكل دائم في الزاوية السفلية للفيديو أثناء التشغيل والتصدير.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
