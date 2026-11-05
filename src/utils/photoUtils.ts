import { PhotoAdjustments, PhotoTransform, DrawingPath, TextOverlay, StickerOverlay, FrameSettings } from '../types';

export const defaultAdjustments: PhotoAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  vibrance: 0,
  warmth: 0,
  tint: 0,
  sepia: 0,
  grayscale: 0,
  invert: 0,
  blur: 0,
  vignette: 0,
  exposure: 0,
  hueRotate: 0,
};

export const defaultTransform: PhotoTransform = {
  rotate: 0,
  flipH: false,
  flipV: false,
  cropAspect: 'original',
};

export interface FilterPreset {
  id: string;
  nameKey: string;
  adjustments: Partial<PhotoAdjustments>;
}

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'normal',
    nameKey: 'filterNormal',
    adjustments: {},
  },
  {
    id: 'vivid',
    nameKey: 'filterVivid',
    adjustments: { saturation: 40, contrast: 25, brightness: 5, vibrance: 30 },
  },
  {
    id: 'cinematic',
    nameKey: 'filterCinematic',
    adjustments: { contrast: 30, saturation: -15, warmth: -20, vignette: 35, exposure: 5 },
  },
  {
    id: 'goldenHour',
    nameKey: 'filterGoldenHour',
    adjustments: { warmth: 45, saturation: 20, brightness: 10, contrast: 15, sepia: 15 },
  },
  {
    id: 'noir',
    nameKey: 'filterNoir',
    adjustments: { grayscale: 100, contrast: 50, brightness: -5, vignette: 40 },
  },
  {
    id: 'vintage',
    nameKey: 'filterVintage',
    adjustments: { sepia: 50, contrast: -10, warmth: 25, brightness: 10, vignette: 25 },
  },
  {
    id: 'warmSunset',
    nameKey: 'filterWarmSunset',
    adjustments: { warmth: 55, tint: 20, saturation: 25, contrast: 20 },
  },
  {
    id: 'coolBreeze',
    nameKey: 'filterCoolBreeze',
    adjustments: { warmth: -45, tint: -10, saturation: -5, brightness: 5 },
  },
  {
    id: 'cyberpunk',
    nameKey: 'filterCyberpunk',
    adjustments: { saturation: 60, contrast: 40, hueRotate: 45, brightness: 10 },
  },
];

export function buildCssFilter(adj: PhotoAdjustments): string {
  const b = 100 + adj.brightness + adj.exposure;
  const c = 100 + adj.contrast;
  const s = 100 + adj.saturation + adj.vibrance;
  const sepia = adj.sepia;
  const gray = adj.grayscale;
  const inv = adj.invert;
  const bl = adj.blur;
  const hue = adj.hueRotate;

  return `brightness(${Math.max(0, b)}%) contrast(${Math.max(0, c)}%) saturate(${Math.max(0, s)}%) sepia(${sepia}%) grayscale(${gray}%) invert(${inv}%) blur(${bl}px) hue-rotate(${hue}deg)`;
}

export function drawImageToCanvas(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  adj: PhotoAdjustments,
  transform: PhotoTransform,
  paths: DrawingPath[],
  textLayers: TextOverlay[],
  stickers: StickerOverlay[],
  frame: FrameSettings,
  targetWidth?: number,
  targetHeight?: number
) {
  const canvas = ctx.canvas;
  const w = targetWidth || canvas.width;
  const h = targetHeight || canvas.height;

  canvas.width = w;
  canvas.height = h;

  ctx.clearRect(0, 0, w, h);
  ctx.save();

  // Apply transformations: rotation and flips
  ctx.translate(w / 2, h / 2);
  ctx.rotate((transform.rotate * Math.PI) / 180);
  ctx.scale(transform.flipH ? -1 : 1, transform.flipV ? -1 : 1);

  // Aspect ratio crop calculation
  let renderW = w;
  let renderH = h;
  if (transform.rotate % 180 !== 0) {
    renderW = h;
    renderH = w;
  }

  // Draw base image with filters
  ctx.filter = buildCssFilter(adj);

  // Compute scale to cover / fit
  const imgAspect = img.width / img.height;
  const canvasAspect = renderW / renderH;
  let drawW = renderW;
  let drawH = renderH;
  let dx = -renderW / 2;
  let dy = -renderH / 2;

  if (transform.cropAspect === '1:1') {
    const minSide = Math.min(renderW, renderH);
    drawW = minSide;
    drawH = minSide;
    dx = -minSide / 2;
    dy = -minSide / 2;
  } else if (canvasAspect > imgAspect) {
    drawW = renderW;
    drawH = renderW / imgAspect;
    dy = -drawH / 2;
  } else {
    drawH = renderH;
    drawW = renderH * imgAspect;
    dx = -drawW / 2;
  }

  // Straighten angle subtle rotation
  if (transform.straightenAngle && transform.straightenAngle !== 0) {
    ctx.rotate((transform.straightenAngle * Math.PI) / 180);
  }

  // Pixelize effect (Mosaic)
  if (adj.pixelize && adj.pixelize > 1) {
    const blockSize = Math.max(4, Math.round(adj.pixelize));
    const smallW = Math.max(1, Math.floor(drawW / blockSize));
    const smallH = Math.max(1, Math.floor(drawH / blockSize));
    
    // Offscreen small canvas for downsampling
    const off = document.createElement('canvas');
    off.width = smallW;
    off.height = smallH;
    const offCtx = off.getContext('2d');
    if (offCtx) {
      offCtx.imageSmoothingEnabled = false;
      offCtx.filter = buildCssFilter(adj);
      offCtx.drawImage(img, 0, 0, smallW, smallH);

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(off, dx, dy, drawW, drawH);
      ctx.imageSmoothingEnabled = true;
    } else {
      ctx.drawImage(img, dx, dy, drawW, drawH);
    }
  } else {
    ctx.drawImage(img, dx, dy, drawW, drawH);
  }
  ctx.filter = 'none';

  // Dizziness (Rotational swirl / motion blur)
  if (adj.dizziness && adj.dizziness > 0) {
    ctx.save();
    const passes = Math.min(6, Math.max(2, Math.round(adj.dizziness / 15)));
    const maxAngle = (adj.dizziness / 100) * 0.08;
    ctx.globalAlpha = 0.25;
    for (let p = 1; p <= passes; p++) {
      ctx.rotate(maxAngle * (p % 2 === 0 ? 1 : -1));
      ctx.drawImage(img, dx, dy, drawW, drawH);
    }
    ctx.restore();
  }

  // Apply Warmth / Tint Color Overlay if set
  if (adj.warmth !== 0 || adj.tint !== 0) {
    ctx.save();
    if (adj.warmth > 0) {
      ctx.fillStyle = `rgba(255, 140, 0, ${Math.min(0.4, adj.warmth / 200)})`;
      ctx.fillRect(dx, dy, drawW, drawH);
    } else if (adj.warmth < 0) {
      ctx.fillStyle = `rgba(0, 150, 255, ${Math.min(0.4, Math.abs(adj.warmth) / 200)})`;
      ctx.fillRect(dx, dy, drawW, drawH);
    }
    if (adj.tint > 0) {
      ctx.fillStyle = `rgba(255, 0, 180, ${Math.min(0.3, adj.tint / 250)})`;
      ctx.fillRect(dx, dy, drawW, drawH);
    } else if (adj.tint < 0) {
      ctx.fillStyle = `rgba(0, 255, 120, ${Math.min(0.3, Math.abs(adj.tint) / 250)})`;
      ctx.fillRect(dx, dy, drawW, drawH);
    }
    ctx.restore();
  }

  // Colorize Effect (Monochrome / Color Tint)
  if (adj.colorizeStrength && adj.colorizeStrength > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'color';
    ctx.globalAlpha = adj.colorizeStrength / 100;
    ctx.fillStyle = adj.colorizeColor || '#3b82f6';
    ctx.fillRect(dx, dy, drawW, drawH);
    ctx.restore();
  }

  // Rainbow Spectral Effect
  if (adj.rainbow && adj.rainbow > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'color';
    ctx.globalAlpha = (adj.rainbow / 100) * 0.7;
    const rGrad = ctx.createLinearGradient(dx, dy, dx + drawW, dy + drawH);
    rGrad.addColorStop(0, '#ff0000');
    rGrad.addColorStop(0.17, '#ff7f00');
    rGrad.addColorStop(0.33, '#ffff00');
    rGrad.addColorStop(0.5, '#00ff00');
    rGrad.addColorStop(0.67, '#0000ff');
    rGrad.addColorStop(0.83, '#4b0082');
    rGrad.addColorStop(1, '#9400d3');
    ctx.fillStyle = rGrad;
    ctx.fillRect(dx, dy, drawW, drawH);
    ctx.restore();
  }

  // Spotlight Effect (Focus beam)
  if (adj.spotlight) {
    ctx.save();
    const spotX = (adj.spotlight.x - 0.5) * renderW;
    const spotY = (adj.spotlight.y - 0.5) * renderH;
    const spotRadius = Math.max(40, adj.spotlight.radius * (Math.min(renderW, renderH) / 2));
    const spotGrad = ctx.createRadialGradient(spotX, spotY, spotRadius * 0.3, spotX, spotY, spotRadius);
    spotGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    spotGrad.addColorStop(1, `rgba(0, 0, 0, ${Math.min(0.95, adj.spotlight.darkness)})`);
    ctx.fillStyle = spotGrad;
    ctx.fillRect(-renderW / 2, -renderH / 2, renderW, renderH);
    ctx.restore();
  }

  // Apply Vignette overlay
  if (adj.vignette > 0) {
    ctx.save();
    const radius = Math.max(renderW, renderH) * 0.7;
    const grad = ctx.createRadialGradient(0, 0, radius * 0.4, 0, 0, radius);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, `rgba(0, 0, 0, ${Math.min(0.9, adj.vignette / 100)})`);
    ctx.fillStyle = grad;
    ctx.fillRect(-renderW / 2, -renderH / 2, renderW, renderH);
    ctx.restore();
  }

  ctx.restore(); // restore from rotate & flip center

  // Draw Frame
  if (frame.type !== 'none') {
    ctx.save();
    const borderWidth = frame.width || 16;
    ctx.strokeStyle = frame.color || '#ffffff';
    ctx.lineWidth = borderWidth;

    if (frame.type === 'simple') {
      ctx.strokeRect(borderWidth / 2, borderWidth / 2, w - borderWidth, h - borderWidth);
    } else if (frame.type === 'double') {
      ctx.strokeRect(borderWidth / 2, borderWidth / 2, w - borderWidth, h - borderWidth);
      ctx.strokeRect(borderWidth * 1.5, borderWidth * 1.5, w - borderWidth * 3, h - borderWidth * 3);
    } else if (frame.type === 'polaroid') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, borderWidth);
      ctx.fillRect(0, 0, borderWidth, h);
      ctx.fillRect(w - borderWidth, 0, borderWidth, h);
      ctx.fillRect(0, h - borderWidth * 3.5, w, borderWidth * 3.5);
    } else if (frame.type === 'rounded') {
      ctx.lineJoin = 'round';
      ctx.strokeRect(borderWidth / 2, borderWidth / 2, w - borderWidth, h - borderWidth);
    }
    ctx.restore();
  }

  // Draw Freehand Paths
  if (paths.length > 0) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const p of paths) {
      if (p.points.length < 2) continue;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.width;
      ctx.beginPath();
      ctx.moveTo(p.points[0].x * w, p.points[0].y * h);
      for (let i = 1; i < p.points.length; i++) {
        ctx.lineTo(p.points[i].x * w, p.points[i].y * h);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // Draw Text Overlays
  if (textLayers.length > 0) {
    ctx.save();
    for (const textItem of textLayers) {
      if (!textItem.text) continue;
      const posX = textItem.x * w;
      const posY = textItem.y * h;
      const size = (textItem.fontSize / 500) * Math.min(w, h);

      ctx.font = `${textItem.isBold ? 'bold' : 'normal'} ${Math.max(14, size)}px ${textItem.fontFamily || 'Cairo, sans-serif'}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const metrics = ctx.measureText(textItem.text);
      const textWidth = metrics.width;
      const pad = 12;

      // Draw background pill if selected
      if (textItem.bgColor && textItem.bgColor !== 'transparent') {
        ctx.fillStyle = textItem.bgColor;
        ctx.fillRect(posX - textWidth / 2 - pad, posY - size / 2 - pad / 2, textWidth + pad * 2, size + pad);
      }

      // Draw text shadow / stroke for legibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 6;
      ctx.fillStyle = textItem.color;
      ctx.fillText(textItem.text, posX, posY);
    }
    ctx.restore();
  }

  // Draw Stickers, Word Balloons, and Artistic Titles
  if (stickers.length > 0) {
    ctx.save();
    for (const stk of stickers) {
      const posX = stk.x * w;
      const posY = stk.y * h;
      const baseScale = Math.min(w, h) / 600;
      const size = Math.max(24, stk.size * baseScale);

      ctx.save();
      ctx.translate(posX, posY);
      if (stk.rotation) {
        ctx.rotate((stk.rotation * Math.PI) / 180);
      }

      // 1. WORD BALLOON
      if (stk.type === 'word_balloon') {
        const text = stk.text || '...';
        const fontSize = Math.max(13, size * 0.32);
        ctx.font = `bold ${fontSize}px ${stk.fontFamily || 'Cairo, Comic Sans MS, sans-serif'}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const lines = text.split('\n');
        let maxLineW = 0;
        lines.forEach((l) => {
          const lw = ctx.measureText(l).width;
          if (lw > maxLineW) maxLineW = lw;
        });

        const padX = Math.max(16, fontSize * 1.2);
        const padY = Math.max(12, fontSize * 0.9);
        const bw = Math.max(size * 1.2, maxLineW + padX * 2);
        const bh = Math.max(size * 0.7, lines.length * (fontSize * 1.3) + padY * 2);

        const fill = stk.bgColor || '#ffffff';
        const stroke = stk.borderColor || '#1e293b';
        const strokeW = stk.borderWidth || 3.5;

        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeW;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        // Draw balloon body
        const shape = stk.balloonShape || 'oval';
        ctx.beginPath();
        if (shape === 'thought') {
          // Fluffy thought clouds
          const r = bh / 2;
          ctx.arc(-bw / 3, 0, r * 0.8, 0, Math.PI * 2);
          ctx.arc(0, -bh * 0.25, r * 0.9, 0, Math.PI * 2);
          ctx.arc(bw / 3, 0, r * 0.8, 0, Math.PI * 2);
          ctx.arc(0, bh * 0.25, r * 0.85, 0, Math.PI * 2);
        } else if (shape === 'shout') {
          // Spiky comic burst
          const points = 14;
          const outerR = bw / 1.8;
          const innerR = bh / 2.2;
          for (let i = 0; i < points * 2; i++) {
            const rad = (i * Math.PI) / points;
            const dist = i % 2 === 0 ? outerR : innerR;
            const px = Math.cos(rad) * dist;
            const py = Math.sin(rad) * dist * (bh / bw);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
        } else if (shape === 'rect') {
          // Rounded rectangle
          const rx = 14;
          ctx.roundRect(-bw / 2, -bh / 2, bw, bh, rx);
        } else {
          // Classic oval
          ctx.ellipse(0, 0, bw / 2, bh / 2, 0, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.stroke();

        // Draw speech tail
        const tail = stk.tailPos || 'bl';
        if (tail !== 'none' && shape !== 'thought') {
          ctx.beginPath();
          if (tail === 'bl') {
            ctx.moveTo(-bw * 0.25, bh * 0.35);
            ctx.lineTo(-bw * 0.45, bh * 0.75);
            ctx.lineTo(-bw * 0.1, bh * 0.35);
          } else if (tail === 'br') {
            ctx.moveTo(bw * 0.1, bh * 0.35);
            ctx.lineTo(bw * 0.45, bh * 0.75);
            ctx.lineTo(bw * 0.25, bh * 0.35);
          } else if (tail === 'tl') {
            ctx.moveTo(-bw * 0.25, -bh * 0.35);
            ctx.lineTo(-bw * 0.45, -bh * 0.75);
            ctx.lineTo(-bw * 0.1, -bh * 0.35);
          } else {
            ctx.moveTo(bw * 0.1, -bh * 0.35);
            ctx.lineTo(bw * 0.45, -bh * 0.75);
            ctx.lineTo(bw * 0.25, -bh * 0.35);
          }
          ctx.closePath();
          ctx.fillStyle = fill;
          ctx.fill();
          ctx.stroke();
        } else if (shape === 'thought' && tail !== 'none') {
          // Thought tail bubbles
          const signX = tail === 'bl' || tail === 'tl' ? -1 : 1;
          const signY = tail === 'bl' || tail === 'br' ? 1 : -1;
          ctx.beginPath();
          ctx.arc(signX * bw * 0.35, signY * bh * 0.65, 8, 0, Math.PI * 2);
          ctx.arc(signX * bw * 0.45, signY * bh * 0.85, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = fill;
          ctx.fill();
          ctx.stroke();
        }

        // Draw Text inside
        ctx.fillStyle = stk.color || '#0f172a';
        const lineHeight = fontSize * 1.3;
        const startY = -((lines.length - 1) * lineHeight) / 2;
        lines.forEach((line, idx) => {
          ctx.fillText(line, 0, startY + idx * lineHeight);
        });

      // 2. ARTISTIC TITLE
      } else if (stk.type === 'title') {
        const text = stk.text || 'TITLE';
        const fontSize = Math.max(18, size * 0.48);
        ctx.font = `900 ${fontSize}px ${stk.fontFamily || 'Cairo, Impact, sans-serif'}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const style = stk.titleStyle || '3d_pop';

        if (style === '3d_pop') {
          // 3D Pop layers
          for (let d = 8; d >= 1; d--) {
            ctx.fillStyle = '#1e3a8a';
            ctx.fillText(text, d, d);
          }
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 6;
          ctx.strokeText(text, 0, 0);
          ctx.fillStyle = stk.color || '#38bdf8';
          ctx.fillText(text, 0, 0);
        } else if (style === 'comic_hero') {
          // Comic bold black outline + vibrant yellow
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 5;
          ctx.shadowOffsetY = 5;
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 8;
          ctx.strokeText(text, 0, 0);
          ctx.shadowColor = 'transparent';
          ctx.fillStyle = stk.color || '#facc15';
          ctx.fillText(text, 0, 0);
        } else if (style === 'neon') {
          // Neon glow
          ctx.shadowColor = stk.color || '#ec4899';
          ctx.shadowBlur = 18;
          ctx.strokeStyle = stk.color || '#ec4899';
          ctx.lineWidth = 4;
          ctx.strokeText(text, 0, 0);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(text, 0, 0);
        } else if (style === 'fire') {
          // Fiery
          ctx.shadowColor = '#dc2626';
          ctx.shadowBlur = 12;
          ctx.strokeStyle = '#7f1d1d';
          ctx.lineWidth = 6;
          ctx.strokeText(text, 0, 0);
          const fGrad = ctx.createLinearGradient(0, -fontSize / 2, 0, fontSize / 2);
          fGrad.addColorStop(0, '#fef08a');
          fGrad.addColorStop(0.5, '#f97316');
          fGrad.addColorStop(1, '#dc2626');
          ctx.fillStyle = fGrad;
          ctx.fillText(text, 0, 0);
        } else if (style === 'vintage_gold') {
          // Vintage Gold
          ctx.fillStyle = '#78350f';
          ctx.fillText(text, 3, 3);
          const gGrad = ctx.createLinearGradient(0, -fontSize / 2, 0, fontSize / 2);
          gGrad.addColorStop(0, '#fef08a');
          gGrad.addColorStop(0.5, '#eab308');
          gGrad.addColorStop(1, '#a16207');
          ctx.fillStyle = gGrad;
          ctx.fillText(text, 0, 0);
        } else {
          // Clean / Plain
          ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
          ctx.shadowBlur = 6;
          ctx.fillStyle = stk.color || '#ffffff';
          ctx.fillText(text, 0, 0);
        }

      // 3. EMOJI & SYMBOL STICKERS
      } else {
        ctx.font = `${size}px 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (stk.color && (stk.symbol === '★' || stk.symbol === '▲' || stk.symbol === '⚪' || stk.symbol === '➔')) {
          ctx.fillStyle = stk.color;
        }
        ctx.fillText(stk.symbol, 0, 0);
      }

      ctx.restore();
    }
    ctx.restore();
  }
}

