export type AppLanguage = 'ar' | 'en';
export type ActiveTab = 'photo' | 'video' | 'downloader' | 'aiStudio' | 'settings' | 'help';

export type StudioBackground =
  | 'deep_slate'
  | 'charcoal'
  | 'midnight_royal'
  | 'neutral_pro'
  | 'light'
  | 'gradient_ocean'
  | 'gradient_sunset'
  | 'custom';

export type CanvasBackground =
  | 'checkerboard'
  | 'black'
  | 'white'
  | 'neutral_gray'
  | 'custom';


export interface DownloadedMediaItem {
  id: string;
  url: string;
  title: string;
  filename: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';
  sizeFormatted: string;
  blobUrl: string;
  downloadUrl: string;
  timestamp: number;
  mimeType?: string;
  thumbnailUrl?: string;
  quality?: string;
  savePath?: string;
  isEdited?: boolean;
  duration?: string;
  dimensions?: string;
}

export interface AvailableQualityOption {
  id: string;
  label: string;
  resolutionOrBitrate: string;
  format: string;
  type: 'video' | 'audio' | 'image' | 'document' | 'other';
  estimatedSize: string;
  downloadUrl: string;
  isPopular?: boolean;
}

export interface MediaInspectionResult {
  originalUrl: string;
  title: string;
  category: 'video' | 'image' | 'audio' | 'document' | 'archive' | 'other';
  platform: 'youtube' | 'tiktok' | 'instagram' | 'twitter' | 'facebook' | 'soundcloud' | 'pinterest' | 'direct' | 'cloud' | 'other';
  platformName: string;
  thumbnailUrl?: string;
  duration?: string;
  qualities: AvailableQualityOption[];
}

export interface AIVideoGenerationRequest {
  prompt: string;
  imageStartingFrame?: string;
  aspectRatio: '16:9' | '9:16';
  duration: '5s' | '10s';
  resolution?: '720p' | '1080p';
  style?: string;
}

export interface AIVideoGenerationResponse {
  success: boolean;
  videoUrl: string;
  duration: string;
  aspectRatio: string;
  title: string;
  thumbnailUrl?: string;
  error?: string;
}

export interface VideoAIAnalysis {
  title: string;
  summary: string;
  cinematographyStyle: string;
  aestheticScore: number;
  mood: string;
  detectedTags: string[];
  adjustments: {
    brightness: number;
    contrast: number;
    saturation: number;
    sepia?: number;
    grayscale?: number;
    invert?: number;
    hueRotate: number;
  };
  subtitleSuggestion?: string;
  socialPost?: {
    hookTitle: string;
    caption: string;
    hashtags: string[];
  };
}


export interface PhotoAdjustments {
  brightness: number; // -100 to 100 (0 default)
  contrast: number;   // -100 to 100 (0 default)
  saturation: number; // -100 to 100 (0 default)
  vibrance: number;   // -100 to 100 (0 default)
  warmth: number;     // -100 to 100 (0 default)
  tint: number;       // -100 to 100 (0 default)
  sepia: number;      // 0 to 100
  grayscale: number;  // 0 to 100
  invert: number;     // 0 to 100
  blur: number;       // 0 to 20 px
  vignette: number;   // 0 to 100
  exposure: number;   // -100 to 100
  hueRotate: number;  // -180 to 180
  // PicSay Extended Effects
  colorizeColor?: string;
  colorizeStrength?: number; // 0 to 100
  rainbow?: number;          // 0 to 100
  dizziness?: number;        // 0 to 100 (swirl / radial blur)
  pixelize?: number;         // 0 to 50 (mosaic block size)
  spotlight?: {
    x: number;
    y: number;
    radius: number;
    darkness: number;
  } | null;
  distort?: {
    type: 'bulge' | 'pinch' | 'swirl';
    strength: number; // -100 to 100
    radius: number;
  } | null;
}

export interface PhotoTransform {
  rotate: number; // degrees
  flipH: boolean;
  flipV: boolean;
  cropAspect: 'original' | '1:1' | '4:5' | '16:9' | '9:16' | '3:2';
  straightenAngle?: number; // -45 to 45
}

export interface DrawingPath {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  bgColor: string;
  fontFamily: string;
  isBold: boolean;
}

export interface StickerOverlay {
  id: string;
  type: 'emoji' | 'word_balloon' | 'title' | 'symbol' | 'shape';
  symbol: string;
  text?: string;
  x: number;
  y: number;
  size: number;
  rotation?: number;
  color?: string;
  bgColor?: string;
  borderColor?: string;
  borderWidth?: number;
  balloonShape?: 'oval' | 'rect' | 'thought' | 'shout';
  tailPos?: 'bl' | 'br' | 'tl' | 'tr' | 'none';
  titleStyle?: '3d_pop' | 'comic_hero' | 'neon' | 'vintage_gold' | 'fire' | 'retro_arcade' | 'plain';
  fontFamily?: string;
}

export interface FrameSettings {
  type: 'none' | 'simple' | 'polaroid' | 'double' | 'rounded';
  color: string;
  width: number;
}

export interface VideoAdjustments {
  brightness: number; // -100 to 100
  contrast: number;   // -100 to 100
  saturation: number; // -100 to 100
  sepia: number;      // 0 to 100
  grayscale: number;  // 0 to 100
  invert: number;     // 0 to 100
  hueRotate: number;  // -180 to 180
  playbackRate: number; // 0.25 to 2
  volume: number;     // 0 to 1
  isMuted: boolean;
  aspectRatio: 'original' | '16:9' | '9:16' | '1:1' | '4:3';
  trimStart: number;  // seconds
  trimEnd: number;    // seconds
  watermarkText: string;
}

export interface SampleMedia {
  id: string;
  title: { ar: string; en: string };
  url: string;
  aspect: string;
}
