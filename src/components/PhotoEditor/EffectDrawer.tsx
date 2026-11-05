import React from 'react';
import { AppLanguage } from '../../types';
import {
  X,
  Globe2,
  Sun,
  PenTool,
  Grid,
  Aperture,
  Contrast as ContrastIcon,
  Thermometer,
  Palette,
  CircleDot,
  Crop,
  Scaling,
  RotateCcw,
  Sparkles,
  Layers,
  Flame,
} from 'lucide-react';

export type PicSayEffectId =
  // Quick Tools
  | 'distort'
  | 'spotlight'
  | 'marker'
  | 'pixelize'
  // Adjustments
  | 'exposure'
  | 'contrast'
  | 'temperature'
  | 'tint'
  | 'saturation'
  | 'brightness'
  // Effects
  | 'colorize'
  | 'hue'
  | 'rainbow'
  | 'sepia'
  | 'invert'
  | 'dizziness'
  // Transform
  | 'crop_straighten'
  | 'resize'
  | 'rotate_flip';

interface EffectDrawerProps {
  lang: AppLanguage;
  isOpen: boolean;
  onClose: () => void;
  onSelectEffect: (effectId: PicSayEffectId) => void;
}

export const EffectDrawer: React.FC<EffectDrawerProps> = ({
  lang,
  isOpen,
  onClose,
  onSelectEffect,
}) => {
  if (!isOpen) return null;

  const isAr = lang === 'ar';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full sm:max-w-md h-[88vh] sm:h-[82vh] bg-[#1a1c1e] text-slate-100 rounded-t-3xl sm:rounded-3xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header bar with Close button and title */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-[#141517] border-b border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-bold tracking-wide text-white">
            {isAr ? 'التأثيرات (Effect)' : 'Effect'}
          </h2>
          <div className="w-8" />
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
          {/* GROUP 1: QUICK TOOLS */}
          <div className="py-1">
            {/* Distort */}
            <button
              onClick={() => onSelectEffect('distort')}
              className="w-full px-4 py-3.5 flex items-center gap-3.5 hover:bg-slate-800/60 active:bg-slate-800 transition-colors text-start"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0">
                <Globe2 className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">
                  {isAr ? 'تشويه وعدسة (Distort)' : 'Distort'}
                </div>
                <div className="text-xs text-slate-400">
                  {isAr ? 'انبعاج، ضغط، وعدسة تكبير' : 'Pinch, bulge, and lens warp'}
                </div>
              </div>
            </button>

            {/* Spotlight */}
            <button
              onClick={() => onSelectEffect('spotlight')}
              className="w-full px-4 py-3.5 flex items-center gap-3.5 hover:bg-slate-800/60 active:bg-slate-800 transition-colors text-start"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0">
                <Sun className="w-5 h-5 text-amber-300" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">
                  {isAr ? 'تسليط الضوء (Spotlight)' : 'Spotlight'}
                </div>
                <div className="text-xs text-slate-400">
                  {isAr ? 'إضاءة بؤرية مركزة مع تظليل ناعم' : 'Focal light beam with smooth vignette'}
                </div>
              </div>
            </button>

            {/* Marker */}
            <button
              onClick={() => onSelectEffect('marker')}
              className="w-full px-4 py-3.5 flex items-center gap-3.5 hover:bg-slate-800/60 active:bg-slate-800 transition-colors text-start"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0">
                <PenTool className="w-5 h-5 text-rose-500" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">
                  {isAr ? 'قلم التلوين (Marker)' : 'Marker'}
                </div>
                <div className="text-xs text-slate-400">
                  {isAr ? 'رسم حر بفرش وألوان متعددة' : 'Freehand drawing pen & brush'}
                </div>
              </div>
            </button>

            {/* Pixelize */}
            <button
              onClick={() => onSelectEffect('pixelize')}
              className="w-full px-4 py-3.5 flex items-center gap-3.5 hover:bg-slate-800/60 active:bg-slate-800 transition-colors text-start"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0">
                <Grid className="w-5 h-5 text-teal-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">
                  {isAr ? 'بكسلة (Pixelize)' : 'Pixelize'}
                </div>
                <div className="text-xs text-slate-400">
                  {isAr ? 'تأثير الموزاييك الكلاسيكي وإخفاء الملامح' : 'Retro mosaic & censor blocks'}
                </div>
              </div>
            </button>
          </div>

          {/* GROUP 2: ADJUSTMENTS */}
          <div>
            <div className="px-4 py-2 bg-[#141517] text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {isAr ? 'الضبط والتحسين (Adjustments)' : 'Adjustments'}
            </div>

            {/* Exposure */}
            <button
              onClick={() => onSelectEffect('exposure')}
              className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-slate-800/60 active:bg-slate-800 transition-colors text-start"
            >
              <Aperture className="w-5 h-5 text-slate-300 ms-2" />
              <div className="text-sm font-medium text-white">
                {isAr ? 'التعريض (Exposure)' : 'Exposure'}
              </div>
            </button>

            {/* Contrast */}
            <button
              onClick={() => onSelectEffect('contrast')}
              className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-slate-800/60 active:bg-slate-800 transition-colors text-start"
            >
              <ContrastIcon className="w-5 h-5 text-slate-300 ms-2" />
              <div className="text-sm font-medium text-white">
                {isAr ? 'التباين (Contrast)' : 'Contrast'}
              </div>
            </button>

            {/* Temperature */}
            <button
              onClick={() => onSelectEffect('temperature')}
              className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-slate-800/60 active:bg-slate-800 transition-colors text-start"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-sky-400 to-amber-500 ms-2 shrink-0 border border-slate-600" />
              <div className="text-sm font-medium text-white">
                {isAr ? 'حرارة الألوان (Temperature)' : 'Temperature'}
              </div>
            </button>

            {/* Tint */}
            <button
              onClick={() => onSelectEffect('tint')}
              className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-slate-800/60 active:bg-slate-800 transition-colors text-start"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-emerald-400 to-fuchsia-500 ms-2 shrink-0 border border-slate-600" />
              <div className="text-sm font-medium text-white">
                {isAr ? 'صبغة الألوان (Tint)' : 'Tint'}
              </div>
            </button>

            {/* Saturation */}
            <button
              onClick={() => onSelectEffect('saturation')}
              className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-slate-800/60 active:bg-slate-800 transition-colors text-start"
            >
              <div className="w-5 h-5 rounded-full bg-[conic-gradient(red,yellow,lime,aqua,blue,magenta,red)] ms-2 shrink-0 border border-slate-600" />
              <div className="text-sm font-medium text-white">
                {isAr ? 'التشبع (Saturation)' : 'Saturation'}
              </div>
            </button>

            {/* Brightness */}
            <button
              onClick={() => onSelectEffect('brightness')}
              className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-slate-800/60 active:bg-slate-800 transition-colors text-start"
            >
              <Sun className="w-5 h-5 text-amber-400 ms-2" />
              <div className="text-sm font-medium text-white">
                {isAr ? 'السطوع (Brightness)' : 'Brightness'}
              </div>
            </button>
          </div>

          {/* GROUP 3: EFFECTS */}
          <div>
            <div className="px-4 py-2 bg-[#141517] text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {isAr ? 'التأثيرات (Effects)' : 'Effects'}
            </div>

            {/* Colorize */}
            <button
              onClick={() => onSelectEffect('colorize')}
              className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-slate-800/60 active:bg-slate-800 transition-colors text-start"
            >
              <div className="w-5 h-5 rounded bg-blue-500 ms-2 shrink-0 border border-slate-600 shadow-sm" />
              <div className="text-sm font-medium text-white">
                {isAr ? 'تلوين أحادي (Colorize)' : 'Colorize'}
              </div>
            </button>

            {/* Hue */}
            <button
              onClick={() => onSelectEffect('hue')}
              className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-slate-800/60 active:bg-slate-800 transition-colors text-start"
            >
              <Palette className="w-5 h-5 text-purple-400 ms-2" />
              <div className="text-sm font-medium text-white">
                {isAr ? 'طيف الألوان (Hue)' : 'Hue'}
              </div>
            </button>

            {/* Rainbow */}
            <button
              onClick={() => onSelectEffect('rainbow')}
              className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-slate-800/60 active:bg-slate-800 transition-colors text-start"
            >
              <div className="w-5 h-5 rounded bg-gradient-to-r from-red-500 via-yellow-400 via-green-400 via-blue-500 to-purple-500 ms-2 shrink-0 border border-slate-600" />
              <div className="text-sm font-medium text-white">
                {isAr ? 'قوس قزح (Rainbow)' : 'Rainbow'}
              </div>
            </button>

            {/* Sepia Toning */}
            <button
              onClick={() => onSelectEffect('sepia')}
              className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-slate-800/60 active:bg-slate-800 transition-colors text-start"
            >
              <div className="w-5 h-5 rounded bg-[#b38867] ms-2 shrink-0 border border-slate-600" />
              <div className="text-sm font-medium text-white">
                {isAr ? 'سيبيا كلاسيكية (Sepia Toning)' : 'Sepia Toning'}
              </div>
            </button>

            {/* Invert */}
            <button
              onClick={() => onSelectEffect('invert')}
              className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-slate-800/60 active:bg-slate-800 transition-colors text-start"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-b from-white to-black ms-2 shrink-0 border border-slate-600" />
              <div className="text-sm font-medium text-white">
                {isAr ? 'عكس الألوان (Invert)' : 'Invert'}
              </div>
            </button>

            {/* Dizziness */}
            <button
              onClick={() => onSelectEffect('dizziness')}
              className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-slate-800/60 active:bg-slate-800 transition-colors text-start"
            >
              <Sparkles className="w-5 h-5 text-pink-400 ms-2" />
              <div className="text-sm font-medium text-white">
                {isAr ? 'دوخة وتشويش دائري (Dizziness)' : 'Dizziness'}
              </div>
            </button>
          </div>

          {/* GROUP 4: TRANSFORM PICTURE */}
          <div>
            <div className="px-4 py-2 bg-[#141517] text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {isAr ? 'تحويل الصورة (Transform Picture)' : 'Transform Picture'}
            </div>

            {/* Crop and Straighten */}
            <button
              onClick={() => onSelectEffect('crop_straighten')}
              className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-slate-800/60 active:bg-slate-800 transition-colors text-start"
            >
              <Crop className="w-5 h-5 text-sky-400 ms-2" />
              <div className="text-sm font-medium text-white">
                {isAr ? 'قص واستقامة (Crop and Straighten)' : 'Crop and Straighten'}
              </div>
            </button>

            {/* Resize */}
            <button
              onClick={() => onSelectEffect('resize')}
              className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-slate-800/60 active:bg-slate-800 transition-colors text-start"
            >
              <Scaling className="w-5 h-5 text-emerald-400 ms-2" />
              <div className="text-sm font-medium text-white">
                {isAr ? 'تغيير الحجم والأبعاد (Resize)' : 'Resize'}
              </div>
            </button>

            {/* Rotate and Flip */}
            <button
              onClick={() => onSelectEffect('rotate_flip')}
              className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-slate-800/60 active:bg-slate-800 transition-colors text-start"
            >
              <RotateCcw className="w-5 h-5 text-amber-400 ms-2" />
              <div className="text-sm font-medium text-white">
                {isAr ? 'تدوير وقلب (Rotate and Flip)' : 'Rotate and Flip'}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
