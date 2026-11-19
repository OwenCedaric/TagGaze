export type CanvasRatio = '3:4' | '1:1' | '9:16' | '16:9' | '4:3'

export interface CanvasDimensions {
  id?: string
  name: string
  platform?: string
  width: number
  height: number
  ratio: CanvasRatio
  desc?: string
}

export type ElementType = 'text' | 'image' | 'svg'

export interface BaseElement {
  id: string
  type: ElementType
  x: number
  y: number
  width: number
  height: number
  rotation: number
  scaleX: number
  scaleY: number
  opacity: number
  locked: boolean
  zIndex: number
}

export interface TextElement extends BaseElement {
  type: 'text'
  text: string
  fontFamily: string
  fontSize: number
  fontWeight: string | number
  fill: string
  align: 'left' | 'center' | 'right'
  lineHeight: number
  letterSpacing: number
  stroke?: string
  strokeWidth?: number
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetX?: number
  shadowOffsetY?: number
  backgroundColor?: string
  backgroundPadding?: number
  backgroundRadius?: number
  // 核心重点词强调 / 马克笔高光
  highlightKeyword?: string
  highlightColor?: string
  highlightMode?: 'marker' | 'badge'
}

export interface ImageElement extends BaseElement {
  type: 'image'
  src: string
  isBaseImage?: boolean
  naturalWidth?: number
  naturalHeight?: number
  fitMode?: 'cover' | 'contain'
  brightness?: number
  contrast?: number
  saturation?: number
}

export interface SvgElement extends BaseElement {
  type: 'svg'
  svgContent: string
  fill: string
  stroke?: string
}

export type CanvasElement = TextElement | ImageElement | SvgElement

export type WatermarkType = 'text' | 'image'

export interface WatermarkConfig {
  enabled: boolean
  type?: WatermarkType // 'text' | 'image', default 'text'
  text: string
  imageSrc?: string // Data URL or URL for image watermark
  imageWidth?: number // Width in px for image watermark (default 160)
  imageHeight?: number // Height in px for image watermark
  mode: 'single' | 'grid'
  opacity: number
  fontSize: number
  angle: number
  color: string
  gapX: number
  gapY: number
  x?: number // Draggable X coordinate for single watermark (default: center)
  y?: number // Draggable Y coordinate for single watermark (default: center)
}

export type SplitMode = 'single' | 'split-vertical' | 'split-horizontal'

export interface SplitConfig {
  mode: SplitMode
  ratio: number // 0.3 - 0.7, default 0.5
  dividerWidth: number // 0, 2, 4, 8 px
  dividerColor: string // '#ffffff', '#3d4451', etc.
  badge?: 'none' | 'vs' | 'before-after' | 'compare'
  imageA?: string
  imageB?: string
}

export type GuideOverlayType = 'none' | 'xhs' | 'video916' | 'thirds' | 'center'

export interface ExportOptions {
  format: 'image/jpeg' | 'image/png' | 'image/webp'
  quality: number // 0.01 - 1.0
  scale: 1 | 2
  targetSizeKb?: number
}

export interface LayoutTemplate {
  id: string
  name: string
  category: 'ecommerce' | 'social' | 'minimal' | 'promo'
  description: string
  tag: string
  presetRatio: CanvasRatio
  previewColor: string
  elements: Array<Partial<CanvasElement>>
}

export interface BrandKitConfig {
  brandName: string
  brandTagline: string
  logoSrc?: string
  primaryColor: string
  accentColor: string
  highlightColor: string
  updatedAt?: number
}

export interface ProjectFile {
  version: '1.0'
  appName: 'TagGaze'
  createdAt: number
  preset: CanvasDimensions
  canvasBgColor: string
  elements: CanvasElement[]
  splitConfig?: SplitConfig
  watermark: WatermarkConfig
  guideOverlay?: GuideOverlayType
  brandKit?: BrandKitConfig
}

export interface BatchImageItem {
  id: string
  name: string
  src: string
  status?: 'pending' | 'processing' | 'done' | 'error'
  errorMsg?: string
}

export interface BatchExportOptions {
  mode: 'template' | 'watermark-only'
  format: 'image/jpeg' | 'image/png' | 'image/webp'
  quality: number
  scale: 1 | 2
  namingPattern: 'original' | 'numbered'
}
