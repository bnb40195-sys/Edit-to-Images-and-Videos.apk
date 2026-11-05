import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppLanguage, PhotoAdjustments, PhotoTransform, DrawingPath, TextOverlay, StickerOverlay, FrameSettings, CanvasBackground } from '../../types';
import { translations } from '../../i18n/translations';
import {
  defaultAdjustments,
  defaultTransform,
  FILTER_PRESETS,
  drawImageToCanvas,
} from '../../utils/photoUtils';
import {
  Sliders,
  Sparkles,
  Crop,
  PenTool,
  Type,
  Smile,
  Square,
  Undo2,
  Redo2,
  RotateCcw,
  Eye,
  Download,
  Upload,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Trash2,
  Plus,
  Check,
  Wand2,
  MessageCircle,
} from 'lucide-react';
import { ImportResolutionModal } from './ImportResolutionModal';
import { EffectDrawer, PicSayEffectId } from './EffectDrawer';
import { StickerDrawer } from './StickerDrawer';
import { WordBalloonModal } from './WordBalloonModal';
import { TitleModal } from './TitleModal';
import { AdjustmentBar } from './AdjustmentBar';
import { StickerItem } from '../../utils/stickerData';
import samplePortrait from '../../assets/images/sample_portrait_photo_1793279158542.jpg';
import sampleLandscape from '../../assets/images/sample_landscape_photo_1793279158603.jpg';
import sampleCity from '../../assets/images/sample_city_photo_1793279159597.jpg';

interface PhotoEditorProps {
  lang: AppLanguage;
  externalImageSrc?: string | null;
  initialAdjustments?: Partial<PhotoAdjustments> | null;
  canvasBg?: CanvasBackground;
}

type ToolTab = 'filters' | 'adjust' | 'transform' | 'draw' | 'text' | 'stickers' | 'frames';

// Sample photos bundled directly
const SAMPLE_PHOTOS = [
  {
    id: 'portrait',
    titleKey: 'samplePortrait',
    src: samplePortrait,
  },
  {
    id: 'landscape',
    titleKey: 'sampleLandscape',
    src: sampleLandscape,
  },
  {
    id: 'city',
    titleKey: 'sampleCity',
    src: sampleCity,
  },
];

const STICKER_LIST = ['⭐', '🔥', '✨', '📸', '🎨', '🚀', '❤️', '🏆', '💎', '🎉', '🎬', '🌟', '🌴', '☕', '👑', '💯'];

export const PhotoEditor: React.FC<PhotoEditorProps> = ({
  lang,
  externalImageSrc,
  initialAdjustments,
  canvasBg = 'checkerboard',
}) => {
  const t = translations[lang];

  // Image source state
  const [imageSrc, setImageSrc] = useState<string | null>(externalImageSrc || SAMPLE_PHOTOS[0].src);
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (externalImageSrc) {
      setImageSrc(externalImageSrc);
    }
  }, [externalImageSrc]);

  useEffect(() => {
    if (initialAdjustments) {
      setAdjustments((prev) => ({
        ...prev,
        ...initialAdjustments,
      }));
    }
  }, [initialAdjustments]);

  // Active editing tab
  const [activeTool, setActiveTool] = useState<ToolTab>('filters');

  // Adjustments & transform states
  const [adjustments, setAdjustments] = useState<PhotoAdjustments>(defaultAdjustments);
  const [transform, setTransform] = useState<PhotoTransform>(defaultTransform);

  // Overlays
  const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);
  const [brushColor, setBrushColor] = useState<string>('#3b82f6');
  const [brushSize, setBrushSize] = useState<number>(6);

  const [textLayers, setTextLayers] = useState<TextOverlay[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

  const [stickers, setStickers] = useState<StickerOverlay[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  const [frame, setFrame] = useState<FrameSettings>({
    type: 'none',
    color: '#ffffff',
    width: 20,
  });

  // History stack for Undo / Redo
  interface HistoryState {
    adjustments: PhotoAdjustments;
    transform: PhotoTransform;
    drawingPaths: DrawingPath[];
    textLayers: TextOverlay[];
    stickers: StickerOverlay[];
    frame: FrameSettings;
  }
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Compare original state
  const [showOriginal, setShowOriginal] = useState(false);

  // PicSay Drawers & Modals
  const [isEffectDrawerOpen, setIsEffectDrawerOpen] = useState(false);
  const [isStickerDrawerOpen, setIsStickerDrawerOpen] = useState(false);
  const [isWordBalloonModalOpen, setIsWordBalloonModalOpen] = useState(false);
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [activePicSayEffect, setActivePicSayEffect] = useState<PicSayEffectId | null>(null);
  const [snapshotAdjustments, setSnapshotAdjustments] = useState<PhotoAdjustments | null>(null);
  const [snapshotTransform, setSnapshotTransform] = useState<PhotoTransform | null>(null);

  // Import Resolution Modal (Screenshot 5)
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const [pendingRawSrc, setPendingRawSrc] = useState<string | null>(null);
  const [pendingDimensions, setPendingDimensions] = useState<{ width: number; height: number }>({ width: 1280, height: 720 });

  // Sticker dragging & manipulation on canvas
  const [draggingStickerId, setDraggingStickerId] = useState<string | null>(null);

  // Export Modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [exportQuality, setExportQuality] = useState<number>(0.92);
  const [exportScale, setExportScale] = useState<number>(1);

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  // Load image element when imageSrc changes
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImageEl(img);
      // Reset adjustments on new image load
      setAdjustments(defaultAdjustments);
      setTransform(defaultTransform);
      setDrawingPaths([]);
      setTextLayers([]);
      setStickers([]);
      setSelectedStickerId(null);
      setFrame({ type: 'none', color: '#ffffff', width: 20 });
      setHistory([]);
      setHistoryIndex(-1);
    };
    img.onerror = () => {
      console.warn('Image failed to load, generating studio canvas image');
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = 1200;
      fallbackCanvas.height = 800;
      const ctx = fallbackCanvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createLinearGradient(0, 0, 1200, 800);
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(0.5, '#0f172a');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1200, 800);

        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.beginPath();
        ctx.arc(600, 400, 240, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Photo Studio - محرر الصور', 600, 390);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '22px sans-serif';
        ctx.fillText('اضغط على "Get a Picture" أو اختر صورة من المعرض للبدء', 600, 440);

        const fallbackImg = new Image();
        fallbackImg.onload = () => setImageEl(fallbackImg);
        fallbackImg.src = fallbackCanvas.toDataURL('image/jpeg', 0.9);
      }
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Record history snapshot helper
  const recordHistory = useCallback(
    (
      newAdj = adjustments,
      newTrans = transform,
      newPaths = drawingPaths,
      newTexts = textLayers,
      newStickers = stickers,
      newFrame = frame
    ) => {
      const state: HistoryState = {
        adjustments: { ...newAdj },
        transform: { ...newTrans },
        drawingPaths: [...newPaths],
        textLayers: [...newTexts],
        stickers: [...newStickers],
        frame: { ...newFrame },
      };
      setHistory((prev) => {
        const next = prev.slice(0, historyIndex + 1);
        return [...next, state];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [adjustments, transform, drawingPaths, textLayers, stickers, frame, historyIndex]
  );

  // Re-render canvas whenever relevant state changes
  useEffect(() => {
    if (!canvasRef.current || !imageEl) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (showOriginal) {
      drawImageToCanvas(
        ctx,
        imageEl,
        defaultAdjustments,
        defaultTransform,
        [],
        [],
        [],
        { type: 'none', color: '#ffffff', width: 0 },
        800,
        Math.round((800 * imageEl.height) / imageEl.width)
      );
    } else {
      const activePaths = currentPath ? [...drawingPaths, currentPath] : drawingPaths;
      drawImageToCanvas(
        ctx,
        imageEl,
        adjustments,
        transform,
        activePaths,
        textLayers,
        stickers,
        frame,
        800,
        Math.round((800 * imageEl.height) / imageEl.width)
      );
    }
  }, [imageEl, adjustments, transform, drawingPaths, currentPath, textLayers, stickers, frame, showOriginal]);

  // Undo / Redo handlers
  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      const state = history[nextIndex];
      setAdjustments(state.adjustments);
      setTransform(state.transform);
      setDrawingPaths(state.drawingPaths);
      setTextLayers(state.textLayers);
      setStickers(state.stickers);
      setFrame(state.frame);
      setHistoryIndex(nextIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const state = history[nextIndex];
      setAdjustments(state.adjustments);
      setTransform(state.transform);
      setDrawingPaths(state.drawingPaths);
      setTextLayers(state.textLayers);
      setStickers(state.stickers);
      setFrame(state.frame);
      setHistoryIndex(nextIndex);
    }
  };

  const handleReset = () => {
    setAdjustments(defaultAdjustments);
    setTransform(defaultTransform);
    setDrawingPaths([]);
    setTextLayers([]);
    setStickers([]);
    setFrame({ type: 'none', color: '#ffffff', width: 20 });
    recordHistory(defaultAdjustments, defaultTransform, [], [], [], { type: 'none', color: '#ffffff', width: 20 });
  };

  // Preset filter applicator
  const applyPreset = (preset: typeof FILTER_PRESETS[0]) => {
    const updated = {
      ...defaultAdjustments,
      ...preset.adjustments,
    };
    setAdjustments(updated);
    recordHistory(updated);
  };

  // Adjust change handler
  const handleAdjustChange = (key: keyof PhotoAdjustments, value: number) => {
    setAdjustments((prev) => ({ ...prev, [key]: value }));
  };

  const handleAdjustCommit = () => {
    recordHistory(adjustments);
  };

  // Request loading image with resolution picker modal (Screenshot 5)
  const requestLoadImage = (src: string) => {
    const tempImg = new Image();
    tempImg.crossOrigin = 'anonymous';
    tempImg.src = src;
    tempImg.onload = () => {
      setPendingDimensions({ width: tempImg.width, height: tempImg.height });
      setPendingRawSrc(src);
      setIsResolutionModalOpen(true);
    };
    tempImg.onerror = () => {
      setImageSrc(src);
    };
  };

  const handleSelectResolution = (w: number, h: number) => {
    if (pendingRawSrc) {
      setImageSrc(pendingRawSrc);
    }
    setIsResolutionModalOpen(false);
    setPendingRawSrc(null);
  };

  // Freehand Canvas & Sticker Drag events
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // 1. Drawing Mode
    if (activeTool === 'draw') {
      isDrawingRef.current = true;
      setCurrentPath({
        points: [{ x, y }],
        color: brushColor,
        width: brushSize,
      });
      return;
    }

    // 2. Sticker Hit Testing & Dragging
    const hitSticker = [...stickers].reverse().find((stk) => {
      const hitRadius = (stk.size / 600) * 0.45;
      const dx = stk.x - x;
      const dy = stk.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= Math.max(0.08, hitRadius);
    });

    if (hitSticker) {
      setSelectedStickerId(hitSticker.id);
      setDraggingStickerId(hitSticker.id);
      return;
    }

    // If tapped empty space, deselect
    setSelectedStickerId(null);
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0.05, Math.min(0.95, (e.clientY - rect.top) / rect.height));

    // Drawing
    if (isDrawingRef.current && currentPath) {
      setCurrentPath((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          points: [...prev.points, { x, y }],
        };
      });
      return;
    }

    // Dragging Sticker
    if (draggingStickerId) {
      setStickers((prev) =>
        prev.map((s) => (s.id === draggingStickerId ? { ...s, x, y } : s))
      );
    }
  };

  const handleCanvasPointerUp = () => {
    if (isDrawingRef.current && currentPath) {
      isDrawingRef.current = false;
      const updated = [...drawingPaths, currentPath];
      setDrawingPaths(updated);
      setCurrentPath(null);
      recordHistory(adjustments, transform, updated);
      return;
    }

    if (draggingStickerId) {
      setDraggingStickerId(null);
      recordHistory(adjustments, transform, drawingPaths, textLayers, stickers);
    }
  };

  // Sticker manipulation helpers
  const handleDeleteSelectedSticker = () => {
    if (!selectedStickerId) return;
    const updated = stickers.filter((s) => s.id !== selectedStickerId);
    setStickers(updated);
    setSelectedStickerId(null);
    recordHistory(adjustments, transform, drawingPaths, textLayers, updated);
  };

  const handleRotateSelectedSticker = () => {
    if (!selectedStickerId) return;
    const updated = stickers.map((s) =>
      s.id === selectedStickerId ? { ...s, rotation: ((s.rotation || 0) + 15) % 360 } : s
    );
    setStickers(updated);
    recordHistory(adjustments, transform, drawingPaths, textLayers, updated);
  };

  const handleScaleSelectedSticker = (factor: number) => {
    if (!selectedStickerId) return;
    const updated = stickers.map((s) =>
      s.id === selectedStickerId
        ? { ...s, size: Math.max(20, Math.min(220, Math.round(s.size * factor))) }
        : s
    );
    setStickers(updated);
    recordHistory(adjustments, transform, drawingPaths, textLayers, updated);
  };

  // PicSay Effect Handlers
  const handleSelectPicSayEffect = (effectId: PicSayEffectId) => {
    setIsEffectDrawerOpen(false);
    if (effectId === 'marker') {
      setActiveTool('draw');
      return;
    }
    // Take snapshot for cancel reverting
    setSnapshotAdjustments({ ...adjustments });
    setSnapshotTransform({ ...transform });
    setActivePicSayEffect(effectId);
  };

  const handleApplyPicSayEffect = () => {
    recordHistory(adjustments, transform);
    setActivePicSayEffect(null);
    setSnapshotAdjustments(null);
    setSnapshotTransform(null);
  };

  const handleCancelPicSayEffect = () => {
    if (snapshotAdjustments) setAdjustments(snapshotAdjustments);
    if (snapshotTransform) setTransform(snapshotTransform);
    setActivePicSayEffect(null);
    setSnapshotAdjustments(null);
    setSnapshotTransform(null);
  };

  // PicSay Sticker Handlers
  const handleInsertWordBalloon = (balloonData: Omit<StickerOverlay, 'id' | 'x' | 'y'>) => {
    const newStk: StickerOverlay = {
      ...balloonData,
      id: 'balloon_' + Date.now(),
      x: 0.5,
      y: 0.45,
    };
    const updated = [...stickers, newStk];
    setStickers(updated);
    setSelectedStickerId(newStk.id);
    recordHistory(adjustments, transform, drawingPaths, textLayers, updated);
  };

  const handleInsertTitle = (titleData: Omit<StickerOverlay, 'id' | 'x' | 'y'>) => {
    const newStk: StickerOverlay = {
      ...titleData,
      id: 'title_' + Date.now(),
      x: 0.5,
      y: 0.35,
    };
    const updated = [...stickers, newStk];
    setStickers(updated);
    setSelectedStickerId(newStk.id);
    recordHistory(adjustments, transform, drawingPaths, textLayers, updated);
  };

  const handleSelectStickerItem = (item: StickerItem) => {
    const newStk: StickerOverlay = {
      id: 'stk_' + Date.now(),
      type: 'symbol',
      symbol: item.symbol,
      color: item.defaultColor,
      x: 0.5,
      y: 0.5,
      size: 54,
      rotation: 0,
    };
    const updated = [...stickers, newStk];
    setStickers(updated);
    setSelectedStickerId(newStk.id);
    recordHistory(adjustments, transform, drawingPaths, textLayers, updated);
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          requestLoadImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add text layer
  const handleAddText = () => {
    const newText: TextOverlay = {
      id: 'text_' + Date.now(),
      text: lang === 'ar' ? 'عنوانك الأنيق هنا' : 'Your Title Here',
      x: 0.5,
      y: 0.5,
      fontSize: 32,
      color: '#ffffff',
      bgColor: 'transparent',
      fontFamily: 'Cairo, sans-serif',
      isBold: true,
    };
    const updated = [...textLayers, newText];
    setTextLayers(updated);
    setSelectedTextId(newText.id);
    recordHistory(adjustments, transform, drawingPaths, updated);
  };

  // Add sticker
  const handleAddSticker = (sym: string) => {
    const newStk: StickerOverlay = {
      id: 'stk_' + Date.now(),
      type: 'emoji',
      symbol: sym,
      x: 0.5,
      y: 0.5,
      size: 48,
    };
    const updated = [...stickers, newStk];
    setStickers(updated);
    setSelectedStickerId(newStk.id);
    recordHistory(adjustments, transform, drawingPaths, textLayers, updated);
  };

  // Download high-res export
  const handleExportDownload = () => {
    if (!imageEl) return;
    // Render to dedicated offscreen canvas at full original resolution * exportScale
    const offCanvas = document.createElement('canvas');
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return;

    const targetW = Math.round(imageEl.width * exportScale);
    const targetH = Math.round(imageEl.height * exportScale);

    drawImageToCanvas(
      offCtx,
      imageEl,
      adjustments,
      transform,
      drawingPaths,
      textLayers,
      stickers,
      frame,
      targetW,
      targetH
    );

    const ext = exportFormat === 'image/png' ? 'png' : exportFormat === 'image/webp' ? 'webp' : 'jpg';
    const dataUrl = offCanvas.toDataURL(exportFormat, exportQuality);
    const filename = `edited-photo-${Date.now()}.${ext}`;
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();

    // Also register in Edited Media Vault with path and quality
    try {
      const activePath = localStorage.getItem('media_studio_phone_save_path') || 'Pictures/MediaStudio/Edited/';
      const saved = localStorage.getItem('offline_universal_downloads_vault');
      const prevList = saved ? JSON.parse(saved) : [];
      const qualityText = `${targetW}×${targetH} (${Math.round(exportQuality * 100)}%)`;
      const newItem = {
        id: 'edited_' + Date.now(),
        url: dataUrl,
        title: filename,
        filename: filename,
        type: 'image' as const,
        sizeFormatted: qualityText,
        blobUrl: dataUrl,
        downloadUrl: dataUrl,
        timestamp: Date.now(),
        quality: qualityText,
        savePath: activePath,
        isEdited: true,
      };
      const updated = [newItem, ...prevList].slice(0, 30);
      localStorage.setItem('offline_universal_downloads_vault', JSON.stringify(updated));
    } catch (e) {}

    setShowExportModal(false);
  };

  return (
    <div className="flex flex-col lg:flex-row flex-1 min-h-[calc(100vh-3.5rem)] pb-20 lg:pb-20 w-full bg-slate-950">
      {/* Main Canvas Stage */}
      <div className="flex-1 flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8 bg-slate-950/60 overflow-hidden relative">
        {/* Stage Top Bar: Undo, Redo, Compare, Reset, Export */}
        <div className="w-full max-w-4xl flex items-center justify-between gap-3 mb-4 z-10">
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              title={t.undo}
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              title={t.redo}
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-slate-800 mx-1" />
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title={t.reset}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.reset}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onMouseDown={() => setShowOriginal(true)}
              onMouseUp={() => setShowOriginal(false)}
              onTouchStart={() => setShowOriginal(true)}
              onTouchEnd={() => setShowOriginal(false)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors select-none"
              title={t.compareOriginal}
            >
              <Eye className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">{t.compareOriginal}</span>
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/30 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{t.exportImage}</span>
            </button>
          </div>
        </div>

        {/* Canvas Display Viewport */}
        <div className="w-full flex-1 flex items-center justify-center p-2 min-h-[340px] max-h-[68vh] overflow-hidden">
          <div className={`relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800 max-w-full max-h-full flex items-center justify-center ${
            canvasBg === 'black'
              ? 'bg-black'
              : canvasBg === 'white'
              ? 'bg-white'
              : canvasBg === 'neutral_gray'
              ? 'bg-neutral-600'
              : 'canvas-checkerboard'
          }`}>
            {!imageEl ? (
              <div className="flex flex-col items-center justify-center p-6 sm:p-8 text-center min-w-[280px] sm:min-w-[420px] py-10 sm:py-14">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mb-4 rounded-3xl p-1 bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 shadow-2xl shadow-blue-500/30">
                  <img src="./app-icon.png" alt="App Icon" className="w-full h-full rounded-[20px] object-cover" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-white mb-2">
                  {lang === 'ar' ? 'محرر وتصميم الصور' : 'Photo Editor & Studio'}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm max-w-sm mb-6">
                  {lang === 'ar'
                    ? 'اختر صورة من معرض هاتفك أو التقط صورة جديدة للبدء بالمؤثرات والملصقات'
                    : 'Choose a photo from your device to begin adding stickers, effects and titles'}
                </p>
                <label className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 cursor-pointer active:scale-95 transition-all">
                  <Upload className="w-5 h-5" />
                  <span>{lang === 'ar' ? 'اختر صورة (Get a Picture)' : 'Get a Picture'}</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
                  <span className="text-xs text-slate-500">{lang === 'ar' ? 'أو اختر صورة جاهزة:' : 'Or sample photo:'}</span>
                  {SAMPLE_PHOTOS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => requestLoadImage(s.src)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors"
                    >
                      {(t as Record<string, string>)[s.titleKey] || s.id}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                onPointerDown={handleCanvasPointerDown}
                onPointerMove={handleCanvasPointerMove}
                onPointerUp={handleCanvasPointerUp}
                className={`max-w-full max-h-[62vh] object-contain block ${
                  activeTool === 'draw' ? 'cursor-crosshair touch-none' : 'cursor-default'
                }`}
              />
            )}

            {/* Floating Sticker Controls when a sticker/balloon/title is selected */}
            {selectedStickerId && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs text-white animate-scaleUp">
                <button
                  onClick={handleDeleteSelectedSticker}
                  className="p-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-600/30 transition-colors"
                  title={lang === 'ar' ? 'حذف الملصق' : 'Delete Sticker'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRotateSelectedSticker}
                  className="p-1.5 rounded-lg text-sky-400 hover:text-white hover:bg-sky-600/30 transition-colors"
                  title={lang === 'ar' ? 'تدوير +15°' : 'Rotate +15°'}
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-slate-700" />
                <button
                  onClick={() => handleScaleSelectedSticker(1.15)}
                  className="px-2 py-1 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800 transition-colors font-bold text-xs"
                  title={lang === 'ar' ? 'تكبير' : 'Scale Up'}
                >
                  +
                </button>
                <button
                  onClick={() => handleScaleSelectedSticker(0.85)}
                  className="px-2 py-1 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800 transition-colors font-bold text-xs"
                  title={lang === 'ar' ? 'تصغير' : 'Scale Down'}
                >
                  -
                </button>
                <div className="w-px h-4 bg-slate-700" />
                <button
                  onClick={() => setSelectedStickerId(null)}
                  className="p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-600/30 transition-colors"
                  title={lang === 'ar' ? 'تم / إنهاء' : 'Done'}
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PicSay 3-Button Tool Bar matching Screenshot 3 */}
        <div className="w-full max-w-lg mt-3 flex items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2 sm:p-2.5 rounded-2xl shadow-xl z-20">
          <button
            onClick={() => setIsEffectDrawerOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-indigo-600/20 hover:border-indigo-500/50 border border-slate-700/60 text-white font-bold text-xs sm:text-sm transition-all active:scale-95 group"
          >
            <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span>{t.picsayEffect || 'Effect'}</span>
          </button>

          <button
            onClick={() => setIsStickerDrawerOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-sky-600/20 hover:border-sky-500/50 border border-slate-700/60 text-white font-bold text-xs sm:text-sm transition-all active:scale-95 group"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400 group-hover:scale-110 transition-transform" />
            <span>{t.picsaySticker || 'Sticker'}</span>
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{t.picsayExport || 'Export'}</span>
          </button>
        </div>

        {/* Sample Photos Bar & Upload Trigger */}
        <div className="w-full max-w-4xl mt-3 flex items-center justify-between gap-3 bg-slate-900/80 border border-slate-800/80 p-2.5 rounded-2xl">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-xs text-slate-400 whitespace-nowrap hidden md:inline">
              {t.orChooseSample}
            </span>
            {SAMPLE_PHOTOS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => requestLoadImage(sample.src)}
                className={`relative rounded-xl overflow-hidden border shrink-0 transition-transform hover:scale-105 ${
                  imageSrc === sample.src ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-slate-700'
                }`}
                title={t[sample.titleKey as keyof typeof t] as string}
              >
                <img
                  src={sample.src}
                  alt={sample.id}
                  className="w-12 h-10 object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer shrink-0 transition-colors">
            <Upload className="w-4 h-4 text-blue-400" />
            <span>{t.uploadPhoto}</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Side Tools & Adjustments Panel */}
      <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l rtl:lg:border-r rtl:lg:border-l-0 border-slate-800 bg-slate-900/95 flex flex-col h-auto lg:h-[calc(100vh-3.5rem-4.5rem)]">
        {/* Tool Category Selector Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2.5 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTool('filters')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium shrink-0 transition-colors ${
              activeTool === 'filters' ? 'bg-blue-600/15 text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.filters}</span>
          </button>

          <button
            onClick={() => setActiveTool('adjust')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium shrink-0 transition-colors ${
              activeTool === 'adjust' ? 'bg-blue-600/15 text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>{t.adjust}</span>
          </button>

          <button
            onClick={() => setActiveTool('transform')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium shrink-0 transition-colors ${
              activeTool === 'transform' ? 'bg-blue-600/15 text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crop className="w-4 h-4" />
            <span>{t.transform}</span>
          </button>

          <button
            onClick={() => setActiveTool('draw')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium shrink-0 transition-colors ${
              activeTool === 'draw' ? 'bg-blue-600/15 text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>{t.draw}</span>
          </button>

          <button
            onClick={() => setActiveTool('text')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium shrink-0 transition-colors ${
              activeTool === 'text' ? 'bg-blue-600/15 text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>{t.text}</span>
          </button>

          <button
            onClick={() => setActiveTool('stickers')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium shrink-0 transition-colors ${
              activeTool === 'stickers' ? 'bg-blue-600/15 text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smile className="w-4 h-4" />
            <span>{t.stickers}</span>
          </button>

          <button
            onClick={() => setActiveTool('frames')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium shrink-0 transition-colors ${
              activeTool === 'frames' ? 'bg-blue-600/15 text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Square className="w-4 h-4" />
            <span>{t.frames}</span>
          </button>
        </div>

        {/* Panel Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* TAB 1: FILTERS */}
          {activeTool === 'filters' && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                {t.filters}
              </h3>
              <div className="grid grid-cols-3 gap-2.5">
                {FILTER_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className="group flex flex-col items-center p-2 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all text-center"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-slate-300 font-semibold mb-1.5 shadow-inner group-hover:scale-105 transition-transform">
                      {preset.id.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[11px] font-medium text-slate-300 group-hover:text-white truncate w-full">
                      {t[preset.nameKey as keyof typeof t] as string}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ADJUST */}
          {activeTool === 'adjust' && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                {t.adjust}
              </h3>

              {/* Sliders list */}
              {[
                { key: 'brightness' as const, label: t.brightness, min: -100, max: 100 },
                { key: 'contrast' as const, label: t.contrast, min: -100, max: 100 },
                { key: 'saturation' as const, label: t.saturation, min: -100, max: 100 },
                { key: 'warmth' as const, label: t.warmth, min: -100, max: 100 },
                { key: 'exposure' as const, label: t.exposure, min: -100, max: 100 },
                { key: 'vignette' as const, label: t.vignette, min: 0, max: 100 },
                { key: 'blur' as const, label: t.blur, min: 0, max: 20 },
                { key: 'sepia' as const, label: t.sepia, min: 0, max: 100 },
                { key: 'grayscale' as const, label: t.grayscale, min: 0, max: 100 },
                { key: 'hueRotate' as const, label: t.hueRotate, min: -180, max: 180 },
              ].map(({ key, label, min, max }) => {
                const val = typeof adjustments[key] === 'number' ? (adjustments[key] as number) : 0;
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
                      onChange={(e) => handleAdjustChange(key, Number(e.target.value))}
                      onMouseUp={handleAdjustCommit}
                      onTouchEnd={handleAdjustCommit}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: TRANSFORM */}
          {activeTool === 'transform' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                  {t.rotateRight} / {t.flipHorizontal}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const updated = { ...transform, rotate: (transform.rotate - 90 + 360) % 360 };
                      setTransform(updated);
                      recordHistory(adjustments, updated);
                    }}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:bg-slate-800 text-xs font-medium text-slate-300"
                  >
                    <RotateCcw className="w-4 h-4 text-blue-400" />
                    <span>{t.rotateLeft}</span>
                  </button>

                  <button
                    onClick={() => {
                      const updated = { ...transform, rotate: (transform.rotate + 90) % 360 };
                      setTransform(updated);
                      recordHistory(adjustments, updated);
                    }}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:bg-slate-800 text-xs font-medium text-slate-300"
                  >
                    <RotateCw className="w-4 h-4 text-blue-400" />
                    <span>{t.rotateRight}</span>
                  </button>

                  <button
                    onClick={() => {
                      const updated = { ...transform, flipH: !transform.flipH };
                      setTransform(updated);
                      recordHistory(adjustments, updated);
                    }}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:bg-slate-800 text-xs font-medium text-slate-300"
                  >
                    <FlipHorizontal className="w-4 h-4 text-blue-400" />
                    <span>{t.flipHorizontal}</span>
                  </button>

                  <button
                    onClick={() => {
                      const updated = { ...transform, flipV: !transform.flipV };
                      setTransform(updated);
                      recordHistory(adjustments, updated);
                    }}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:bg-slate-800 text-xs font-medium text-slate-300"
                  >
                    <FlipVertical className="w-4 h-4 text-blue-400" />
                    <span>{t.flipVertical}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                  {t.cropAspect}
                </h3>
                <div className="space-y-2">
                  {[
                    { key: 'original', label: t.aspectOriginal },
                    { key: '1:1', label: t.aspectSquare },
                    { key: '4:5', label: t.aspectPortrait },
                    { key: '9:16', label: t.aspectStory },
                    { key: '16:9', label: t.aspectLandscape },
                    { key: '3:2', label: t.aspectClassic },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => {
                        const updated = { ...transform, cropAspect: key as PhotoTransform['cropAspect'] };
                        setTransform(updated);
                        recordHistory(adjustments, updated);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-colors ${
                        transform.cropAspect === key
                          ? 'bg-blue-600/15 border-blue-500 text-blue-300'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                      }`}
                    >
                      <span>{label}</span>
                      {transform.cropAspect === key && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DRAW */}
          {activeTool === 'draw' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                  {t.brushColor}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ffffff', '#000000'].map(
                    (col) => (
                      <button
                        key={col}
                        onClick={() => setBrushColor(col)}
                        style={{ backgroundColor: col }}
                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                          brushColor === col ? 'border-white scale-110 shadow-lg' : 'border-slate-700'
                        }`}
                      />
                    )
                  )}
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-0"
                    title="Custom color"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{t.brushSize}</span>
                  <span className="font-mono tabular-nums text-blue-400">{brushSize}px</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="40"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <button
                onClick={() => {
                  setDrawingPaths([]);
                  recordHistory(adjustments, transform, []);
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-red-600/10 border border-red-500/30 text-red-400 hover:bg-red-600/20 text-xs font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t.clearDrawing}</span>
              </button>
            </div>
          )}

          {/* TAB 5: TEXT */}
          {activeTool === 'text' && (
            <div className="space-y-4">
              <button
                onClick={handleAddText}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addText}</span>
              </button>

              <div className="space-y-3">
                {textLayers.map((layer) => (
                  <div
                    key={layer.id}
                    className="space-y-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={layer.text}
                        onChange={(e) => {
                          const updated = textLayers.map((l) =>
                            l.id === layer.id ? { ...l, text: e.target.value } : l
                          );
                          setTextLayers(updated);
                        }}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => {
                          const updated = textLayers.filter((l) => l.id !== layer.id);
                          setTextLayers(updated);
                          recordHistory(adjustments, transform, drawingPaths, updated);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{t.fontSize}</span>
                        <input
                          type="range"
                          min="14"
                          max="72"
                          value={layer.fontSize}
                          onChange={(e) => {
                            const updated = textLayers.map((l) =>
                              l.id === layer.id ? { ...l, fontSize: Number(e.target.value) } : l
                            );
                            setTextLayers(updated);
                          }}
                          className="w-20 h-1 bg-slate-800 rounded appearance-none"
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={layer.color}
                          onChange={(e) => {
                            const updated = textLayers.map((l) =>
                              l.id === layer.id ? { ...l, color: e.target.value } : l
                            );
                            setTextLayers(updated);
                          }}
                          className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-800 text-[11px] text-slate-400">
                      <span>X: {Math.round(layer.x * 100)}%</span>
                      <span>·</span>
                      <span>Y: {Math.round(layer.y * 100)}%</span>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        value={Math.round(layer.y * 100)}
                        onChange={(e) => {
                          const updated = textLayers.map((l) =>
                            l.id === layer.id ? { ...l, y: Number(e.target.value) / 100 } : l
                          );
                          setTextLayers(updated);
                        }}
                        className="flex-1 h-1 bg-slate-800 rounded appearance-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: STICKERS */}
          {activeTool === 'stickers' && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                {t.addSticker}
              </h3>
              <div className="grid grid-cols-4 gap-2.5">
                {STICKER_LIST.map((sym) => (
                  <button
                    key={sym}
                    onClick={() => handleAddSticker(sym)}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-blue-500 hover:scale-105 transition-all text-2xl flex items-center justify-center"
                  >
                    {sym}
                  </button>
                ))}
              </div>

              {stickers.length > 0 && (
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{stickers.length} ملصق مضاف</span>
                    <button
                      onClick={() => {
                        setStickers([]);
                        recordHistory(adjustments, transform, drawingPaths, textLayers, []);
                      }}
                      className="text-red-400 hover:underline text-xs"
                    >
                      {t.deleteElement} (الكل)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: FRAMES */}
          {activeTool === 'frames' && (
            <div className="space-y-5">
              <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                {t.frameType}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'none', label: t.frameNone },
                  { key: 'simple', label: t.frameSimple },
                  { key: 'polaroid', label: t.framePolaroid },
                  { key: 'double', label: t.frameDouble },
                  { key: 'rounded', label: t.frameRounded },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => {
                      const updated = { ...frame, type: key as FrameSettings['type'] };
                      setFrame(updated);
                      recordHistory(adjustments, transform, drawingPaths, textLayers, stickers, updated);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-colors ${
                      frame.type === key
                        ? 'bg-blue-600/15 border-blue-500 text-blue-300'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {frame.type !== 'none' && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <span className="text-xs text-slate-300 font-medium">{t.frameColor}</span>
                    <div className="flex items-center gap-2">
                      {['#ffffff', '#0f172a', '#e2e8f0', '#f59e0b', '#ef4444', '#3b82f6'].map((col) => (
                        <button
                          key={col}
                          onClick={() => setFrame({ ...frame, color: col })}
                          style={{ backgroundColor: col }}
                          className={`w-7 h-7 rounded-full border ${
                            frame.color === col ? 'border-blue-500 ring-2 ring-blue-500/40' : 'border-slate-700'
                          }`}
                        />
                      ))}
                      <input
                        type="color"
                        value={frame.color}
                        onChange={(e) => setFrame({ ...frame, color: e.target.value })}
                        className="w-7 h-7 rounded-full cursor-pointer bg-transparent border-0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{t.frameWidth}</span>
                      <span className="font-mono tabular-nums text-blue-400">{frame.width}px</span>
                    </div>
                    <input
                      type="range"
                      min="6"
                      max="60"
                      value={frame.width}
                      onChange={(e) => setFrame({ ...frame, width: Number(e.target.value) })}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">{t.exportImage}</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-medium">{t.exportFormat}</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { format: 'image/png', label: 'PNG (Lossless)' },
                    { format: 'image/jpeg', label: 'JPEG (Compact)' },
                    { format: 'image/webp', label: 'WebP (Modern)' },
                  ].map(({ format, label }) => (
                    <button
                      key={format}
                      onClick={() => setExportFormat(format as any)}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-colors ${
                        exportFormat === format
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {exportFormat !== 'image/png' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">{t.quality}</span>
                    <span className="font-mono tabular-nums text-blue-400">
                      {Math.round(exportQuality * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="1.0"
                    step="0.05"
                    value={exportQuality}
                    onChange={(e) => setExportQuality(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}

              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-medium">مقياس الدقة (Resolution Scale)</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { scale: 0.5, label: '0.5x (صغير)' },
                    { scale: 1, label: '1x (الأصلي)' },
                    { scale: 2, label: '2x (فائق الدقة)' },
                  ].map(({ scale, label }) => (
                    <button
                      key={scale}
                      onClick={() => setExportScale(scale)}
                      className={`p-2 rounded-xl border text-xs font-medium text-center transition-colors ${
                        exportScale === scale
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleExportDownload}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>{t.downloadNow}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PicSay Import Resolution Selector Modal (Screenshot 5) */}
      <ImportResolutionModal
        lang={lang}
        isOpen={isResolutionModalOpen}
        onClose={() => {
          setIsResolutionModalOpen(false);
          setPendingRawSrc(null);
        }}
        originalWidth={pendingDimensions.width}
        originalHeight={pendingDimensions.height}
        onSelectResolution={handleSelectResolution}
      />

      {/* PicSay Effect Drawer (Screenshots 1 & 4 - NO PicSay Pro!) */}
      <EffectDrawer
        lang={lang}
        isOpen={isEffectDrawerOpen}
        onClose={() => setIsEffectDrawerOpen(false)}
        onSelectEffect={handleSelectPicSayEffect}
      />

      {/* PicSay New Sticker Drawer (Screenshot 2 - NO PicSay Pro!) */}
      <StickerDrawer
        lang={lang}
        isOpen={isStickerDrawerOpen}
        onClose={() => setIsStickerDrawerOpen(false)}
        onSelectWordBalloon={() => setIsWordBalloonModalOpen(true)}
        onSelectTitle={() => setIsTitleModalOpen(true)}
        onSelectSticker={handleSelectStickerItem}
      />

      {/* Word Balloon Creator Modal */}
      <WordBalloonModal
        lang={lang}
        isOpen={isWordBalloonModalOpen}
        onClose={() => setIsWordBalloonModalOpen(false)}
        onInsertBalloon={handleInsertWordBalloon}
      />

      {/* Title Creator Modal */}
      <TitleModal
        lang={lang}
        isOpen={isTitleModalOpen}
        onClose={() => setIsTitleModalOpen(false)}
        onInsertTitle={handleInsertTitle}
      />

      {/* PicSay Adjustment Floating Bottom Control Bar */}
      <AdjustmentBar
        lang={lang}
        activeEffect={activePicSayEffect}
        adjustments={adjustments}
        transform={transform}
        onUpdateAdjustments={setAdjustments}
        onUpdateTransform={setTransform}
        onApply={handleApplyPicSayEffect}
        onCancel={handleCancelPicSayEffect}
      />
    </div>
  );
};
