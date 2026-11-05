import React, { useState } from 'react';
import { AppLanguage, StickerOverlay } from '../../types';
import { X, Check, Type, Sparkles } from 'lucide-react';

interface TitleModalProps {
  lang: AppLanguage;
  isOpen: boolean;
  onClose: () => void;
  onInsertTitle: (titleItem: Omit<StickerOverlay, 'id' | 'x' | 'y'>) => void;
}

export const TitleModal: React.FC<TitleModalProps> = ({
  lang,
  isOpen,
  onClose,
  onInsertTitle,
}) => {
  const [text, setText] = useState<string>(lang === 'ar' ? 'عنوان مذهل' : 'AMAZING');
  const [titleStyle, setTitleStyle] = useState<
    '3d_pop' | 'comic_hero' | 'neon' | 'vintage_gold' | 'fire' | 'retro_arcade' | 'plain'
  >('3d_pop');
  const [color, setColor] = useState<string>('#38bdf8');
  const [sizeRatio, setSizeRatio] = useState<number>(45);

  if (!isOpen) return null;

  const isAr = lang === 'ar';

  const TITLE_PRESETS = [
    {
      id: '3d_pop' as const,
      label: isAr ? 'مجسم 3D بوب' : '3D Pop',
      color: '#38bdf8',
      previewClass: 'text-sky-400 drop-shadow-[2px_2px_0px_#1e3a8a]',
    },
    {
      id: 'comic_hero' as const,
      label: isAr ? 'أبطال الكوميكس' : 'Comic Hero',
      color: '#facc15',
      previewClass: 'text-yellow-400 drop-shadow-[3px_3px_0px_#000]',
    },
    {
      id: 'neon' as const,
      label: isAr ? 'توهج نيون ليلي' : 'Neon Glow',
      color: '#ec4899',
      previewClass: 'text-pink-400 drop-shadow-[0_0_12px_#ec4899]',
    },
    {
      id: 'fire' as const,
      label: isAr ? 'لهب ناري' : 'Fire Flame',
      color: '#f97316',
      previewClass: 'text-orange-500 drop-shadow-[0_0_8px_#dc2626]',
    },
    {
      id: 'vintage_gold' as const,
      label: isAr ? 'ذهب كلاسيكي' : 'Vintage Gold',
      color: '#eab308',
      previewClass: 'text-amber-400 drop-shadow-[2px_2px_0px_#78350f]',
    },
    {
      id: 'plain' as const,
      label: isAr ? 'أنيق وبسيط' : 'Clean Bold',
      color: '#ffffff',
      previewClass: 'text-white drop-shadow-[1px_1px_3px_rgba(0,0,0,0.8)]',
    },
  ];

  const handleInsert = () => {
    if (!text.trim()) return;
    onInsertTitle({
      type: 'title',
      symbol: '🔤',
      text: text.trim(),
      size: sizeRatio * 2.2,
      titleStyle,
      color,
      fontFamily: 'Cairo, Impact, sans-serif',
      rotation: 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-md bg-[#1e2126] text-slate-100 rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#181a1e] border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
              <Type className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">
              {isAr ? 'إدراج عنوان فني (Title)' : 'Insert Artistic Title'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Text Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              {isAr ? 'نص العنوان:' : 'Title text:'}
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={isAr ? 'أدخل عنوانك الجذاب...' : 'Type catchy title...'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-base focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Style Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              {isAr ? 'الأنماط ثلاثية الأبعاد والفنية:' : 'Artistic Styles:'}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {TITLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setTitleStyle(preset.id);
                    setColor(preset.color);
                  }}
                  className={`p-3 rounded-2xl border text-start flex flex-col justify-between h-20 transition-all ${
                    titleStyle === preset.id
                      ? 'border-purple-500 bg-purple-500/15 ring-2 ring-purple-500/30'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80'
                  }`}
                >
                  <span className="text-[11px] font-medium text-slate-400">
                    {preset.label}
                  </span>
                  <span className={`text-base font-extrabold tracking-wider ${preset.previewClass}`}>
                    {text || 'TITLE'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Color & Size */}
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300 font-medium">
                <span>{isAr ? 'حجم الخط' : 'Font Size'}</span>
                <span className="font-mono">{sizeRatio}px</span>
              </div>
              <input
                type="range"
                min={24}
                max={75}
                value={sizeRatio}
                onChange={(e) => setSizeRatio(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </div>

          {/* Live Preview */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">
              {isAr ? 'معاينة فورية:' : 'Live Preview:'}
            </label>
            <div className="h-28 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center p-3 overflow-hidden">
              <span
                className={`font-black tracking-wide text-center uppercase transition-all ${
                  TITLE_PRESETS.find((p) => p.id === titleStyle)?.previewClass || ''
                }`}
                style={{ fontSize: `${Math.max(16, sizeRatio * 0.6)}px` }}
              >
                {text || '...'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#181a1e] border-t border-slate-800 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleInsert}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>{isAr ? 'إدراج العنوان' : 'Insert Title'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
