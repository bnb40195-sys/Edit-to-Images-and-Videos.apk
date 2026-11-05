import React from 'react';
import { AppLanguage, PhotoAdjustments, PhotoTransform } from '../../types';
import { PicSayEffectId } from './EffectDrawer';
import { X, Check, RotateCw, RotateCcw, FlipHorizontal, FlipVertical } from 'lucide-react';

interface AdjustmentBarProps {
  lang: AppLanguage;
  activeEffect: PicSayEffectId | null;
  adjustments: PhotoAdjustments;
  transform: PhotoTransform;
  onUpdateAdjustments: (updater: (prev: PhotoAdjustments) => PhotoAdjustments) => void;
  onUpdateTransform: (updater: (prev: PhotoTransform) => PhotoTransform) => void;
  onApply: () => void;
  onCancel: () => void;
}

export const AdjustmentBar: React.FC<AdjustmentBarProps> = ({
  lang,
  activeEffect,
  adjustments,
  transform,
  onUpdateAdjustments,
  onUpdateTransform,
  onApply,
  onCancel,
}) => {
  if (!activeEffect) return null;

  const isAr = lang === 'ar';

  const getEffectTitle = (id: PicSayEffectId): string => {
    switch (id) {
      case 'exposure':
        return isAr ? 'التعريض (Exposure)' : 'Exposure';
      case 'contrast':
        return isAr ? 'التباين (Contrast)' : 'Contrast';
      case 'temperature':
        return isAr ? 'حرارة الألوان (Temperature)' : 'Temperature';
      case 'tint':
        return isAr ? 'صبغة الألوان (Tint)' : 'Tint';
      case 'saturation':
        return isAr ? 'التشبع (Saturation)' : 'Saturation';
      case 'brightness':
        return isAr ? 'السطوع (Brightness)' : 'Brightness';
      case 'colorize':
        return isAr ? 'تلوين أحادي (Colorize)' : 'Colorize';
      case 'hue':
        return isAr ? 'طيف الألوان (Hue)' : 'Hue';
      case 'rainbow':
        return isAr ? 'قوس قزح (Rainbow)' : 'Rainbow';
      case 'sepia':
        return isAr ? 'سيبيا كلاسيكية (Sepia Toning)' : 'Sepia Toning';
      case 'invert':
        return isAr ? 'عكس الألوان (Invert)' : 'Invert';
      case 'dizziness':
        return isAr ? 'دوخة وتشويش دائري (Dizziness)' : 'Dizziness';
      case 'pixelize':
        return isAr ? 'بكسلة (Pixelize)' : 'Pixelize';
      case 'spotlight':
        return isAr ? 'تسليط الضوء (Spotlight)' : 'Spotlight';
      case 'distort':
        return isAr ? 'تشويه وعدسة (Distort)' : 'Distort';
      case 'crop_straighten':
        return isAr ? 'قص واستقامة (Crop & Straighten)' : 'Crop and Straighten';
      case 'resize':
        return isAr ? 'تغيير الحجم (Resize)' : 'Resize';
      case 'rotate_flip':
        return isAr ? 'تدوير وقلب (Rotate & Flip)' : 'Rotate and Flip';
      default:
        return '';
    }
  };

  return (
    <div className="fixed bottom-16 sm:bottom-20 left-0 right-0 z-40 px-3 sm:px-6 pointer-events-none animate-slideUp">
      <div className="max-w-2xl mx-auto bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-3 sm:p-4 pointer-events-auto text-slate-100">
        {/* Top bar with Cancel, Title, and OK Check */}
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-semibold"
          >
            <X className="w-4 h-4 text-rose-400" />
            <span>{isAr ? 'إلغاء' : 'Cancel'}</span>
          </button>

          <span className="text-xs sm:text-sm font-bold text-white tracking-wide text-center">
            {getEffectTitle(activeEffect)}
          </span>

          <button
            onClick={onApply}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition-colors text-xs font-bold shadow-md shadow-sky-600/30"
          >
            <Check className="w-4 h-4" />
            <span>{isAr ? 'تطبيق' : 'Apply'}</span>
          </button>
        </div>

        {/* Dynamic Controls per effect */}
        <div className="px-2 py-1">
          {/* 1. EXPOSURE */}
          {activeEffect === 'exposure' && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>{isAr ? 'شدة التعريض' : 'Exposure Value'}</span>
                <span className="font-mono text-sky-400">{adjustments.exposure}</span>
              </div>
              <input
                type="range"
                min={-100}
                max={100}
                value={adjustments.exposure}
                onChange={(e) =>
                  onUpdateAdjustments((prev) => ({ ...prev, exposure: Number(e.target.value) }))
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>
          )}

          {/* 2. CONTRAST */}
          {activeEffect === 'contrast' && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>{isAr ? 'مستوى التباين' : 'Contrast Level'}</span>
                <span className="font-mono text-sky-400">{adjustments.contrast}</span>
              </div>
              <input
                type="range"
                min={-100}
                max={100}
                value={adjustments.contrast}
                onChange={(e) =>
                  onUpdateAdjustments((prev) => ({ ...prev, contrast: Number(e.target.value) }))
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>
          )}

          {/* 3. TEMPERATURE */}
          {activeEffect === 'temperature' && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>{isAr ? 'حرارة الألوان (بارد / دافئ)' : 'Cool / Warm Balance'}</span>
                <span className="font-mono text-amber-400">{adjustments.warmth}</span>
              </div>
              <input
                type="range"
                min={-100}
                max={100}
                value={adjustments.warmth}
                onChange={(e) =>
                  onUpdateAdjustments((prev) => ({ ...prev, warmth: Number(e.target.value) }))
                }
                className="w-full h-1.5 bg-gradient-to-r from-sky-500 via-slate-700 to-amber-500 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          )}

          {/* 4. TINT */}
          {activeEffect === 'tint' && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>{isAr ? 'الصبغة (أخضر / قرمزي)' : 'Green / Magenta Tint'}</span>
                <span className="font-mono text-fuchsia-400">{adjustments.tint}</span>
              </div>
              <input
                type="range"
                min={-100}
                max={100}
                value={adjustments.tint}
                onChange={(e) =>
                  onUpdateAdjustments((prev) => ({ ...prev, tint: Number(e.target.value) }))
                }
                className="w-full h-1.5 bg-gradient-to-r from-emerald-500 via-slate-700 to-fuchsia-500 rounded-lg appearance-none cursor-pointer accent-fuchsia-400"
              />
            </div>
          )}

          {/* 5. SATURATION */}
          {activeEffect === 'saturation' && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>{isAr ? 'درجة التشبع اللوني' : 'Color Saturation'}</span>
                <span className="font-mono text-sky-400">{adjustments.saturation}</span>
              </div>
              <input
                type="range"
                min={-100}
                max={100}
                value={adjustments.saturation}
                onChange={(e) =>
                  onUpdateAdjustments((prev) => ({ ...prev, saturation: Number(e.target.value) }))
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>
          )}

          {/* 6. BRIGHTNESS */}
          {activeEffect === 'brightness' && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>{isAr ? 'السطوع' : 'Brightness Level'}</span>
                <span className="font-mono text-amber-400">{adjustments.brightness}</span>
              </div>
              <input
                type="range"
                min={-100}
                max={100}
                value={adjustments.brightness}
                onChange={(e) =>
                  onUpdateAdjustments((prev) => ({ ...prev, brightness: Number(e.target.value) }))
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          )}

          {/* 7. COLORIZE */}
          {activeEffect === 'colorize' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">{isAr ? 'اختر لون التلوين:' : 'Select Color:'}</span>
                <div className="flex items-center gap-1.5">
                  {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'].map((col) => (
                    <button
                      key={col}
                      onClick={() =>
                        onUpdateAdjustments((prev) => ({
                          ...prev,
                          colorizeColor: col,
                          colorizeStrength: prev.colorizeStrength || 65,
                        }))
                      }
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        adjustments.colorizeColor === col ? 'scale-125 border-white ring-2 ring-sky-500/50' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{isAr ? 'كثافة اللون' : 'Color Intensity'}</span>
                  <span className="font-mono">{adjustments.colorizeStrength || 60}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={adjustments.colorizeStrength || 60}
                  onChange={(e) =>
                    onUpdateAdjustments((prev) => ({
                      ...prev,
                      colorizeStrength: Number(e.target.value),
                      colorizeColor: prev.colorizeColor || '#3b82f6',
                    }))
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
              </div>
            </div>
          )}

          {/* 8. HUE */}
          {activeEffect === 'hue' && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>{isAr ? 'تدوير طيف الألوان (Hue)' : 'Hue Rotation'}</span>
                <span className="font-mono text-purple-400">{adjustments.hueRotate}°</span>
              </div>
              <input
                type="range"
                min={-180}
                max={180}
                value={adjustments.hueRotate}
                onChange={(e) =>
                  onUpdateAdjustments((prev) => ({ ...prev, hueRotate: Number(e.target.value) }))
                }
                className="w-full h-1.5 bg-[linear-gradient(to_right,red,yellow,lime,cyan,blue,magenta,red)] rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>
          )}

          {/* 9. RAINBOW */}
          {activeEffect === 'rainbow' && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>{isAr ? 'كثافة طيف قوس قزح' : 'Rainbow Intensity'}</span>
                <span className="font-mono">{adjustments.rainbow || 50}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={adjustments.rainbow || 50}
                onChange={(e) =>
                  onUpdateAdjustments((prev) => ({ ...prev, rainbow: Number(e.target.value) }))
                }
                className="w-full h-1.5 bg-[linear-gradient(to_right,red,orange,yellow,green,blue,indigo,violet)] rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>
          )}

          {/* 10. SEPIA */}
          {activeEffect === 'sepia' && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>{isAr ? 'شدة السيبيا العتيقة' : 'Sepia Toning'}</span>
                <span className="font-mono text-amber-500">{adjustments.sepia}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={adjustments.sepia}
                onChange={(e) =>
                  onUpdateAdjustments((prev) => ({ ...prev, sepia: Number(e.target.value) }))
                }
                className="w-full h-1.5 bg-gradient-to-r from-slate-700 to-[#b38867] rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          )}

          {/* 11. INVERT */}
          {activeEffect === 'invert' && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>{isAr ? 'نسبة عكس الألوان (Negative)' : 'Invert Negative'}</span>
                <span className="font-mono">{adjustments.invert}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={adjustments.invert}
                onChange={(e) =>
                  onUpdateAdjustments((prev) => ({ ...prev, invert: Number(e.target.value) }))
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>
          )}

          {/* 12. DIZZINESS */}
          {activeEffect === 'dizziness' && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>{isAr ? 'درجة الدوخة والتشويش' : 'Dizziness Swirl Intensity'}</span>
                <span className="font-mono">{adjustments.dizziness || 40}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={adjustments.dizziness || 40}
                onChange={(e) =>
                  onUpdateAdjustments((prev) => ({ ...prev, dizziness: Number(e.target.value) }))
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>
          )}

          {/* 13. PIXELIZE */}
          {activeEffect === 'pixelize' && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>{isAr ? 'حجم مربعات الموزاييك (البكسل)' : 'Pixel Mosaic Block Size'}</span>
                <span className="font-mono text-teal-400">{adjustments.pixelize || 16}px</span>
              </div>
              <input
                type="range"
                min={4}
                max={48}
                step={2}
                value={adjustments.pixelize || 16}
                onChange={(e) =>
                  onUpdateAdjustments((prev) => ({ ...prev, pixelize: Number(e.target.value) }))
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
            </div>
          )}

          {/* 14. SPOTLIGHT */}
          {activeEffect === 'spotlight' && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>{isAr ? 'نصف قطر الإضاءة' : 'Spotlight Beam Radius'}</span>
                <span className="font-mono">
                  {Math.round((adjustments.spotlight?.radius || 0.6) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.2}
                max={1}
                step={0.05}
                value={adjustments.spotlight?.radius || 0.6}
                onChange={(e) =>
                  onUpdateAdjustments((prev) => ({
                    ...prev,
                    spotlight: {
                      x: prev.spotlight?.x ?? 0.5,
                      y: prev.spotlight?.y ?? 0.5,
                      radius: Number(e.target.value),
                      darkness: prev.spotlight?.darkness ?? 0.75,
                    },
                  }))
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-xs text-slate-300 pt-1">
                <span>{isAr ? 'عتامة الظلام المحيط' : 'Surrounding Vignette Darkness'}</span>
                <span className="font-mono">
                  {Math.round((adjustments.spotlight?.darkness || 0.75) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.2}
                max={0.95}
                step={0.05}
                value={adjustments.spotlight?.darkness || 0.75}
                onChange={(e) =>
                  onUpdateAdjustments((prev) => ({
                    ...prev,
                    spotlight: {
                      x: prev.spotlight?.x ?? 0.5,
                      y: prev.spotlight?.y ?? 0.5,
                      radius: prev.spotlight?.radius ?? 0.6,
                      darkness: Number(e.target.value),
                    },
                  }))
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          )}

          {/* 15. DISTORT */}
          {activeEffect === 'distort' && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>{isAr ? 'قوة انبعاج العدسة (Bulge / Pinch)' : 'Lens Warp Intensity'}</span>
                <span className="font-mono text-indigo-400">
                  {adjustments.distort?.strength || 50}
                </span>
              </div>
              <input
                type="range"
                min={-100}
                max={100}
                value={adjustments.distort?.strength || 50}
                onChange={(e) =>
                  onUpdateAdjustments((prev) => ({
                    ...prev,
                    distort: {
                      type: Number(e.target.value) >= 0 ? 'bulge' : 'pinch',
                      strength: Number(e.target.value),
                      radius: 0.6,
                    },
                  }))
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
              />
            </div>
          )}

          {/* 16. CROP & STRAIGHTEN */}
          {activeEffect === 'crop_straighten' && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {[
                  { id: 'original', label: isAr ? 'أصلي' : 'Original' },
                  { id: '1:1', label: '1:1' },
                  { id: '4:5', label: '4:5' },
                  { id: '16:9', label: '16:9' },
                  { id: '9:16', label: '9:16' },
                  { id: '3:2', label: '3:2' },
                ].map((asp) => (
                  <button
                    key={asp.id}
                    onClick={() =>
                      onUpdateTransform((prev) => ({ ...prev, cropAspect: asp.id as any }))
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                      transform.cropAspect === asp.id
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {asp.label}
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{isAr ? 'زاوية الاستقامة والتعديل (Straighten)' : 'Straighten Angle'}</span>
                  <span className="font-mono text-sky-400">{transform.straightenAngle || 0}°</span>
                </div>
                <input
                  type="range"
                  min={-30}
                  max={30}
                  value={transform.straightenAngle || 0}
                  onChange={(e) =>
                    onUpdateTransform((prev) => ({
                      ...prev,
                      straightenAngle: Number(e.target.value),
                    }))
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
              </div>
            </div>
          )}

          {/* 17. ROTATE & FLIP */}
          {activeEffect === 'rotate_flip' && (
            <div className="flex items-center justify-around py-1">
              <button
                onClick={() =>
                  onUpdateTransform((prev) => ({ ...prev, rotate: (prev.rotate - 90 + 360) % 360 }))
                }
                className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                <RotateCcw className="w-5 h-5 text-sky-400" />
                <span className="text-[11px]">{isAr ? '90° يساراً' : '90° Left'}</span>
              </button>

              <button
                onClick={() =>
                  onUpdateTransform((prev) => ({ ...prev, rotate: (prev.rotate + 90) % 360 }))
                }
                className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                <RotateCw className="w-5 h-5 text-sky-400" />
                <span className="text-[11px]">{isAr ? '90° يميناً' : '90° Right'}</span>
              </button>

              <button
                onClick={() =>
                  onUpdateTransform((prev) => ({ ...prev, flipH: !prev.flipH }))
                }
                className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                <FlipHorizontal className="w-5 h-5 text-amber-400" />
                <span className="text-[11px]">{isAr ? 'قلب أفقي' : 'Flip H'}</span>
              </button>

              <button
                onClick={() =>
                  onUpdateTransform((prev) => ({ ...prev, flipV: !prev.flipV }))
                }
                className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                <FlipVertical className="w-5 h-5 text-amber-400" />
                <span className="text-[11px]">{isAr ? 'قلب رأسي' : 'Flip V'}</span>
              </button>
            </div>
          )}

          {/* 18. RESIZE */}
          {activeEffect === 'resize' && (
            <div className="text-center py-2 text-xs text-slate-300">
              {isAr
                ? 'استخدم خيار التصدير (Export) لتحديد دقة وحجم الصورة بدقة متناهية وبجودة أصلية.'
                : 'Use Export modal to scale and resize image to exact dimensions and high fidelity.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
