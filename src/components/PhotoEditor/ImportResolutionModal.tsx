import React from 'react';
import { AppLanguage } from '../../types';
import { Zap, Image as ImageIcon, Sparkles, X } from 'lucide-react';

interface ImportResolutionModalProps {
  lang: AppLanguage;
  isOpen: boolean;
  onClose: () => void;
  originalWidth: number;
  originalHeight: number;
  onSelectResolution: (width: number, height: number, modeName: string) => void;
}

export const ImportResolutionModal: React.FC<ImportResolutionModalProps> = ({
  lang,
  isOpen,
  onClose,
  originalWidth,
  originalHeight,
  onSelectResolution,
}) => {
  if (!isOpen) return null;

  const isAr = lang === 'ar';
  const aspect = originalWidth / (originalHeight || 1);

  // 1. Fast: scaled to around 720 max side
  const fastMax = 720;
  let fastW = originalWidth;
  let fastH = originalHeight;
  if (originalWidth > fastMax || originalHeight > fastMax) {
    if (aspect >= 1) {
      fastW = fastMax;
      fastH = Math.round(fastMax / aspect);
    } else {
      fastH = fastMax;
      fastW = Math.round(fastMax * aspect);
    }
  }

  // 2. Normal: scaled to around 1400 max side
  const normMax = 1400;
  let normW = originalWidth;
  let normH = originalHeight;
  if (originalWidth > normMax || originalHeight > normMax) {
    if (aspect >= 1) {
      normW = normMax;
      normH = Math.round(normMax / aspect);
    } else {
      normH = normMax;
      normW = Math.round(normMax * aspect);
    }
  }

  // 3. Maximum: original resolution
  const maxW = originalWidth;
  const maxH = originalHeight;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-md bg-[#24272c] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header matching classic PicSay dialog header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#2b3036] border-b border-slate-700">
          <h3 className="text-base font-semibold text-sky-400">
            {isAr ? 'استيراد صورة بحجم كبير...' : 'Import large picture...'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options list */}
        <div className="divide-y divide-slate-700/60 bg-[#1e2227]">
          {/* 1. Fast */}
          <button
            onClick={() => onSelectResolution(fastW, fastH, 'fast')}
            className="w-full p-4 flex items-start justify-between text-start hover:bg-slate-800/80 active:bg-sky-950/40 transition-colors group"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-white text-base">
                  {isAr ? 'سريع (Fast)' : 'Fast'}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-[260px]">
                {isAr
                  ? 'الحجم الأكثر كفاءة وسرعة للإرسال إلى أجهزة الهواتف والتطبيقات'
                  : 'Most efficient size for sending to mobile devices'}
              </p>
            </div>
            <div className="text-end shrink-0 ps-3">
              <span className="inline-block px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200">
                {fastW} × {fastH}
              </span>
            </div>
          </button>

          {/* 2. Normal */}
          <button
            onClick={() => onSelectResolution(normW, normH, 'normal')}
            className="w-full p-4 flex items-start justify-between text-start hover:bg-slate-800/80 active:bg-sky-950/40 transition-colors group"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-white text-base">
                  {isAr ? 'عادي (Normal)' : 'Normal'}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-[260px]">
                {isAr
                  ? 'أفضل حجم للتصميم والمشاركة عبر البريد والمدونات والمواقع'
                  : 'Best size for publishing in e-mails, blogs and websites'}
              </p>
            </div>
            <div className="text-end shrink-0 ps-3">
              <span className="inline-block px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-mono text-sky-300">
                {normW} × {normH}
              </span>
            </div>
          </button>

          {/* 3. Maximum / Original */}
          <button
            onClick={() => onSelectResolution(maxW, maxH, 'maximum')}
            className="w-full p-4 flex items-start justify-between text-start hover:bg-slate-800/80 active:bg-sky-950/40 transition-colors group"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-white text-base">
                  {isAr ? 'الأقصى / الأصلي (Maximum)' : 'Maximum (Original)'}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-[260px]">
                {isAr
                  ? 'أعلى جودة ودقة متناهية للطباعة والتعديل والتصدير الفائق'
                  : 'Highest quality for high-resolution editing and printing'}
              </p>
            </div>
            <div className="text-end shrink-0 ps-3">
              <span className="inline-block px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-300">
                {maxW} × {maxH}
              </span>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#24272c] border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};
