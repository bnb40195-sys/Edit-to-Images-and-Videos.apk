import React, { useState } from 'react';
import { AppLanguage, StickerOverlay } from '../../types';
import { X, Check, MessageSquare, Cloud, Zap, Square } from 'lucide-react';

interface WordBalloonModalProps {
  lang: AppLanguage;
  isOpen: boolean;
  onClose: () => void;
  onInsertBalloon: (balloon: Omit<StickerOverlay, 'id' | 'x' | 'y'>) => void;
}

export const WordBalloonModal: React.FC<WordBalloonModalProps> = ({
  lang,
  isOpen,
  onClose,
  onInsertBalloon,
}) => {
  const [text, setText] = useState<string>(lang === 'ar' ? 'يا لها من صورة رائعة!' : 'What a cool photo!');
  const [balloonShape, setBalloonShape] = useState<'oval' | 'rect' | 'thought' | 'shout'>('oval');
  const [tailPos, setTailPos] = useState<'bl' | 'br' | 'tl' | 'tr' | 'none'>('bl');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [textColor, setTextColor] = useState<string>('#0f172a');
  const [borderColor, setBorderColor] = useState<string>('#1e293b');
  const [fontSizeRatio, setFontSizeRatio] = useState<number>(36);

  if (!isOpen) return null;

  const isAr = lang === 'ar';

  const PRESET_THEMES = [
    { label: isAr ? 'أبيض كلاسيك' : 'Classic White', bg: '#ffffff', text: '#0f172a', border: '#1e293b' },
    { label: isAr ? 'أصفر كوميكس' : 'Comic Yellow', bg: '#fef08a', text: '#000000', border: '#000000' },
    { label: isAr ? 'داكن ليلي' : 'Dark Mode', bg: '#1e293b', text: '#ffffff', border: '#38bdf8' },
    { label: isAr ? 'وردي كيوت' : 'Pastel Pink', bg: '#fce7f3', text: '#831843', border: '#ec4899' },
    { label: isAr ? 'سماوي منعش' : 'Sky Cyan', bg: '#e0f2fe', text: '#0369a1', border: '#0284c7' },
    { label: isAr ? 'أخضر نيون' : 'Neon Lime', bg: '#dcfce7', text: '#14532d', border: '#22c55e' },
  ];

  const handleInsert = () => {
    if (!text.trim()) return;
    onInsertBalloon({
      type: 'word_balloon',
      symbol: '💬',
      text: text.trim(),
      size: fontSizeRatio * 2,
      balloonShape,
      tailPos,
      bgColor,
      color: textColor,
      borderColor,
      borderWidth: 3.5,
      fontFamily: 'Cairo, Comic Sans MS, sans-serif',
      rotation: 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-md bg-[#1e2126] text-slate-100 rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#181a1e] border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center font-bold">
              💬
            </div>
            <h3 className="text-base font-bold text-white">
              {isAr ? 'إنشاء فقاعة كلام (Word Balloon)' : 'New Word Balloon'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Text Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              {isAr ? 'نص الفقاعة:' : 'Balloon text:'}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder={isAr ? 'اكتب الرسالة أو الحوار هنا...' : 'Write message or dialogue...'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors resize-none"
            />
          </div>

          {/* Balloon Shape Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              {isAr ? 'شكل الفقاعة:' : 'Balloon Shape:'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setBalloonShape('oval')}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all ${
                  balloonShape === 'oval'
                    ? 'border-sky-500 bg-sky-500/15 text-sky-300 font-bold'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="w-6 h-4 rounded-full border-2 border-current" />
                <span className="text-[11px]">{isAr ? 'بيضاوي' : 'Oval'}</span>
              </button>

              <button
                type="button"
                onClick={() => setBalloonShape('rect')}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all ${
                  balloonShape === 'rect'
                    ? 'border-sky-500 bg-sky-500/15 text-sky-300 font-bold'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Square className="w-5 h-4" />
                <span className="text-[11px]">{isAr ? 'مستطيل' : 'Rect'}</span>
              </button>

              <button
                type="button"
                onClick={() => setBalloonShape('thought')}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all ${
                  balloonShape === 'thought'
                    ? 'border-sky-500 bg-sky-500/15 text-sky-300 font-bold'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cloud className="w-5 h-4" />
                <span className="text-[11px]">{isAr ? 'تفكير' : 'Thought'}</span>
              </button>

              <button
                type="button"
                onClick={() => setBalloonShape('shout')}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all ${
                  balloonShape === 'shout'
                    ? 'border-sky-500 bg-sky-500/15 text-sky-300 font-bold'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-5 h-4" />
                <span className="text-[11px]">{isAr ? 'صراخ' : 'Shout'}</span>
              </button>
            </div>
          </div>

          {/* Tail Position */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              {isAr ? 'اتجاه ذيل الحوار:' : 'Pointer Tail Direction:'}
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { id: 'bl', label: isAr ? 'أسفل يسار' : 'Bottom L' },
                { id: 'br', label: isAr ? 'أسفل يمين' : 'Bottom R' },
                { id: 'tl', label: isAr ? 'أعلى يسار' : 'Top L' },
                { id: 'tr', label: isAr ? 'أعلى يمين' : 'Top R' },
                { id: 'none', label: isAr ? 'بدون ذيل' : 'None' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTailPos(t.id as any)}
                  className={`py-1.5 px-1 rounded-lg text-[10px] font-medium border text-center transition-colors ${
                    tailPos === t.id
                      ? 'border-sky-500 bg-sky-500/20 text-sky-300 font-bold'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Color Themes */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              {isAr ? 'الألوان والتنسيقات الجاهزة:' : 'Color Themes:'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_THEMES.map((th, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setBgColor(th.bg);
                    setTextColor(th.text);
                    setBorderColor(th.border);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-xs text-start transition-all ${
                    bgColor === th.bg
                      ? 'border-sky-500 ring-2 ring-sky-500/30'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                  style={{ backgroundColor: th.bg }}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border shrink-0"
                    style={{ backgroundColor: th.border }}
                  />
                  <span
                    className="text-[11px] font-bold truncate"
                    style={{ color: th.text }}
                  >
                    {th.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Size slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300 font-medium">
              <span>{isAr ? 'حجم الفقاعة والخط' : 'Balloon Size'}</span>
              <span className="font-mono">{fontSizeRatio}px</span>
            </div>
            <input
              type="range"
              min={20}
              max={65}
              value={fontSizeRatio}
              onChange={(e) => setFontSizeRatio(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          {/* Live Preview Card */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">
              {isAr ? 'معاينة فورية:' : 'Live Preview:'}
            </label>
            <div className="h-28 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-center p-3 relative overflow-hidden">
              <div
                className="max-w-full px-4 py-2 text-center font-bold shadow-lg transition-all"
                style={{
                  backgroundColor: bgColor,
                  color: textColor,
                  borderColor: borderColor,
                  borderWidth: '3px',
                  borderStyle: 'solid',
                  borderRadius:
                    balloonShape === 'rect'
                      ? '12px'
                      : balloonShape === 'shout'
                      ? '2px'
                      : '30px',
                  fontSize: `${Math.max(12, fontSizeRatio * 0.4)}px`,
                }}
              >
                {text || '...'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
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
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>{isAr ? 'إدراج في الصورة' : 'Insert Balloon'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
