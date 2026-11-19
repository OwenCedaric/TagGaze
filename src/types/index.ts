export type CanvasRatio = '3:4' | '1:1' | '16:9'

export interface CanvasDimensions {
  width: number
  height: number
  ratio: CanvasRatio
  name: string
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
}

export interface ImageElement extends BaseElement {
  type: 'image'
  src: string
  isBaseImage?: boolean
  naturalWidth?: number
  naturalHeight?: number
  fitMode?: 'cover' | 'contain'
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

export interface ExportOptions {
  format: 'image/jpeg' | 'image/png' | 'image/webp'
  quality: number // 0.01 - 1.0
  scale: 1 | 2
  targetSizeKb?: number
}
