import React, { useState } from 'react';
import { AppLanguage } from '../../types';
import { STICKER_CATEGORIES, CATEGORY_STICKERS, StickerCategory, StickerItem } from '../../utils/stickerData';
import { X, ChevronRight, ArrowLeft } from 'lucide-react';

interface StickerDrawerProps {
  lang: AppLanguage;
  isOpen: boolean;
  onClose: () => void;
  onSelectWordBalloon: () => void;
  onSelectTitle: () => void;
  onSelectSticker: (item: StickerItem) => void;
}

export const StickerDrawer: React.FC<StickerDrawerProps> = ({
  lang,
  isOpen,
  onClose,
  onSelectWordBalloon,
  onSelectTitle,
  onSelectSticker,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<StickerCategory | null>(null);

  if (!isOpen) return null;

  const isAr = lang === 'ar';

  const handleCategoryClick = (catId: StickerCategory) => {
    if (catId === 'word_balloon') {
      onClose();
      onSelectWordBalloon();
    } else if (catId === 'title') {
      onClose();
      onSelectTitle();
    } else {
      setSelectedCategory(catId);
    }
  };

  const handlePickSticker = (item: StickerItem) => {
    onSelectSticker(item);
    onClose();
    setSelectedCategory(null);
  };

  const activeCategoryMeta = selectedCategory
    ? STICKER_CATEGORIES.find((c) => c.id === selectedCategory)
    : null;
  const activeStickerList = selectedCategory ? CATEGORY_STICKERS[selectedCategory] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full sm:max-w-md h-[88vh] sm:h-[82vh] bg-[#1a1c1e] text-slate-100 rounded-t-3xl sm:rounded-3xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header bar */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-[#141517] border-b border-slate-800 shrink-0">
          {selectedCategory ? (
            <button
              onClick={() => setSelectedCategory(null)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <ArrowLeft className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
              <span>{isAr ? 'رجوع' : 'Back'}</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isAr ? 'إغلاق' : 'Close'}
            >
              <X className="w-6 h-6" />
            </button>
          )}

          <h2 className="text-lg font-bold tracking-wide text-white">
            {selectedCategory
              ? activeCategoryMeta?.title[lang]
              : isAr
              ? 'ملصق جديد (New Sticker)'
              : 'New Sticker'}
          </h2>
          <div className="w-8" />
        </div>

        {/* Content area: Category list OR Sticker Pack Grid */}
        <div className="flex-1 overflow-y-auto">
          {!selectedCategory ? (
            <div className="divide-y divide-slate-800/80">
              {STICKER_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-800/60 active:bg-slate-800 transition-colors text-start group"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-2xl w-8 text-center shrink-0">
                      {cat.icon}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors">
                        {cat.title[lang]}
                      </div>
                      <div className="text-xs text-slate-400">
                        {cat.description[lang]}
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-colors ${
                      isAr ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              ))}
            </div>
          ) : (
            /* Sticker Pack Grid */
            <div className="p-4 space-y-4">
              <p className="text-xs text-slate-400 px-1">
                {isAr
                  ? 'اضغط على أي ملصق لإضافته فوراً إلى الصورة مع إمكانية تحريكه وتكبيره:'
                  : 'Tap any sticker to place it onto the photo with drag & scale controls:'}
              </p>
              <div className="grid grid-cols-4 gap-3">
                {activeStickerList.map((stk) => (
                  <button
                    key={stk.id}
                    onClick={() => handlePickSticker(stk)}
                    className="aspect-square bg-slate-800/60 hover:bg-slate-700/80 active:bg-sky-950/40 border border-slate-700/60 rounded-2xl flex flex-col items-center justify-center p-2 transition-all hover:scale-105 group"
                    title={stk.name[lang]}
                  >
                    <span className="text-3xl group-hover:scale-110 transition-transform">
                      {stk.symbol}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate max-w-full mt-1.5 font-medium">
                      {stk.name[lang]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
