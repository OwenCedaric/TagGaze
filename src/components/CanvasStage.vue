<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import Konva from 'konva'
import { Upload, Sparkles, Image as ImageIcon } from 'lucide-vue-next'
import type { CanvasDimensions, CanvasElement, TextElement, ImageElement, SvgElement, WatermarkConfig, GuideOverlayType, SplitConfig } from '@/types'

const props = defineProps<{
  preset: CanvasDimensions
  elements: CanvasElement[]
  selectedId: string | null
  watermark: WatermarkConfig
  canvasBgColor: string
  hasBaseImage: boolean
  guideOverlay: GuideOverlayType
  enableSnapping: boolean
  splitConfig: SplitConfig
}>()

const emit = defineEmits<{
  (e: 'select', id: string | null): void
  (e: 'updateElement', id: string, partial: Partial<CanvasElement>): void
  (e: 'uploadBaseImage', src: string): void
  (e: 'editElementText', id: string): void
  (e: 'updateWatermark', partial: Partial<WatermarkConfig>): void
  (e: 'selectWatermark'): void
  (e: 'loadDemo'): void
}>()

const viewportRef = ref<HTMLDivElement | null>(null)
const konvaContainerRef = ref<HTMLDivElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

// Displayed stage pixel dimensions (scaled to fit viewport)
const stageDisplaySize = ref({ width: 450, height: 600 })
let currentScale = 1

let stage: Konva.Stage | null = null
let bgLayer: Konva.Layer | null = null
let elementsLayer: Konva.Layer | null = null
let watermarkLayer: Konva.Layer | null = null
let snapLayer: Konva.Layer | null = null
let guidesLayer: Konva.Layer | null = null
let transformer: Konva.Transformer | null = null

const imageCache = new Map<string, HTMLImageElement>()
let measureCanvas: HTMLCanvasElement | null = null
let measureCtx: CanvasRenderingContext2D | null = null

function measureTextSegment(text: string, font: string, letterSpacing = 0): number {
  if (!text) return 0
  if (!measureCanvas) {
    measureCanvas = document.createElement('canvas')
    measureCtx = measureCanvas.getContext('2d')
  }
  if (!measureCtx) return text.length * 20
  measureCtx.font = font
  let width = measureCtx.measureText(text).width
  if (letterSpacing && text.length > 1) {
    width += (text.length - 1) * letterSpacing
  }
  return width
}

/**
 * Loads an image from URL or DataURI safely with caching and no CORS issues for data/blob URLs
 */
function getLoadedImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!)
  }
  return new Promise((resolve, reject) => {
    const img = new Image()
    if (src.startsWith('http://') || src.startsWith('https://')) {
      img.crossOrigin = 'anonymous'
    }
    img.onload = () => {
      imageCache.set(src, img)
      resolve(img)
    }
    img.onerror = (err) => {
      console.error('Failed to load image:', src.slice(0, 80), err)
      reject(err)
    }
    img.src = src
  })
}

/**
 * Convert SVG content into a valid UTF-8 SVG DataURI with explicit XMLNS and viewBox dimensions
 */
function prepareSvgDataUrl(svgContent: string, fill: string): string {
  let str = svgContent.replace(/currentColor/g, fill)
  if (!str.includes('xmlns=')) {
    str = str.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
  }
  const vb = str.match(/viewBox=["']([\d.\s-]+)["']/)
  if (vb) {
    const parts = vb[1].trim().split(/\s+/).map(Number)
    if (parts.length === 4 && parts[2] && parts[3]) {
      if (!str.match(/<svg[^>]*\bwidth=/)) {
        str = str.replace('<svg', `<svg width="${parts[2]}"`)
      }
      if (!str.match(/<svg[^>]*\bheight=/)) {
        str = str.replace('<svg', `<svg height="${parts[3]}"`)
      }
    }
  }
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(str)}`
}

function updateStageDimensions() {
  if (!viewportRef.value) return

  const padding = 48
  const availW = Math.max(viewportRef.value.clientWidth - padding, 200)
  const availH = Math.max(viewportRef.value.clientHeight - padding, 200)

  const scale = Math.min(availW / props.preset.width, availH / props.preset.height)
  currentScale = scale

  stageDisplaySize.value = {
    width: Math.round(props.preset.width * scale),
    height: Math.round(props.preset.height * scale)
  }
}

function initKonva() {
  updateStageDimensions()
  if (!konvaContainerRef.value) return

  const container = konvaContainerRef.value

  stage = new Konva.Stage({
    container: container,
    width: stageDisplaySize.value.width,
    height: stageDisplaySize.value.height,
    scaleX: currentScale,
    scaleY: currentScale
  })

  bgLayer = new Konva.Layer()
  elementsLayer = new Konva.Layer()
  watermarkLayer = new Konva.Layer()
  snapLayer = new Konva.Layer({ name: 'snap-layer', listening: false })
  guidesLayer = new Konva.Layer({ name: 'guides-layer', listening: false })

  // Chronicle Light Styled Transformer (Accent #82a1b9, Base Surface #ffffff)
  transformer = new Konva.Transformer({
    rotateAnchorOffset: 24,
    borderStroke: '#82a1b9',
    borderStrokeWidth: 1.5,
    anchorStroke: '#82a1b9',
    anchorFill: '#ffffff',
    anchorSize: 9,
    anchorCornerRadius: 1,
    enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    boundBoxFunc: (oldBox, newBox) => {
      if (newBox.width < 20 || newBox.height < 20) return oldBox
      return newBox
    }
  })

  elementsLayer.add(transformer)
  stage.add(bgLayer)
  stage.add(elementsLayer)
  stage.add(watermarkLayer)
  stage.add(snapLayer)
  stage.add(guidesLayer)

  stage.on('click tap', (e) => {
    if (e.target === stage || e.target.hasName('bg-rect') || e.target.hasName('base-image')) {
      emit('select', null)
    }
  })

  renderAll()
}

async function renderAll() {
  if (!stage || !bgLayer || !elementsLayer || !watermarkLayer || !transformer) return

  // 1. Render Background
  bgLayer.destroyChildren()
  const bgRect = new Konva.Rect({
    x: 0,
    y: 0,
    width: props.preset.width,
    height: props.preset.height,
    fill: props.canvasBgColor,
    name: 'bg-rect'
  })
  bgLayer.add(bgRect)

  const isSplit = props.splitConfig && props.splitConfig.mode !== 'single'
  if (isSplit) {
    await renderSplitCollage()
  }

  // 2. Render Elements
  const nodesToRemove = elementsLayer.getChildren().filter((node) => node !== transformer)
  nodesToRemove.forEach((node) => node.destroy())

  for (const el of props.elements) {
    if (el.type === 'image') {
      const imgEl = el as ImageElement
      try {
        const imgObj = await getLoadedImage(imgEl.src)
        const kImage = new Konva.Image({
          id: el.id,
          image: imgObj,
          x: el.x,
          y: el.y,
          width: el.width,
          height: el.height,
          rotation: el.rotation,
          scaleX: el.scaleX,
          scaleY: el.scaleY,
          opacity: el.opacity,
          draggable: !el.locked,
          name: imgEl.isBaseImage ? 'base-image' : 'sticker-image'
        })

        const hasFilters = (imgEl.brightness && imgEl.brightness !== 0) ||
                           (imgEl.contrast && imgEl.contrast !== 0) ||
                           (imgEl.saturation && imgEl.saturation !== 0)

        if (hasFilters) {
          const filters: any[] = []
          if (imgEl.brightness && imgEl.brightness !== 0) {
            filters.push(Konva.Filters.Brighten)
            kImage.brightness(imgEl.brightness / 100)
          }
          if (imgEl.contrast && imgEl.contrast !== 0) {
            filters.push(Konva.Filters.Contrast)
            kImage.contrast(imgEl.contrast)
          }
          if (imgEl.saturation && imgEl.saturation !== 0) {
            filters.push(Konva.Filters.HSL)
            kImage.saturation(imgEl.saturation / 50)
          }
          kImage.filters(filters)
          kImage.cache()
        }

        if (imgEl.isBaseImage) {
          if (!isSplit) {
            bgLayer.add(kImage)
          }
        } else {
          bindElementEvents(kImage, el.id)
          elementsLayer.add(kImage)
        }
      } catch (err) {
        console.error('Failed to load image element:', err)
      }
    } else if (el.type === 'text') {
      const textEl = el as TextElement
      const group = new Konva.Group({
        id: el.id,
        x: el.x,
        y: el.y,
        rotation: el.rotation,
        scaleX: el.scaleX,
        scaleY: el.scaleY,
        draggable: !el.locked
      })

      const kText = new Konva.Text({
        text: textEl.text,
        fontFamily: textEl.fontFamily,
        fontSize: textEl.fontSize,
        fontStyle: textEl.fontWeight === 'bold' || textEl.fontWeight === '700' || textEl.fontWeight === '900' ? 'bold' : 'normal',
        fill: textEl.fill,
        align: textEl.align,
        width: textEl.width,
        lineHeight: textEl.lineHeight,
        letterSpacing: textEl.letterSpacing,
        stroke: textEl.stroke,
        strokeWidth: textEl.strokeWidth || 0,
        shadowColor: textEl.shadowColor,
        shadowBlur: textEl.shadowBlur,
        shadowOffsetY: textEl.shadowOffsetY,
        padding: textEl.backgroundPadding || 0
      })

      if (textEl.backgroundColor) {
        const textBgRect = new Konva.Rect({
          width: kText.width(),
          height: kText.height(),
          fill: textEl.backgroundColor,
          cornerRadius: textEl.backgroundRadius || 2,
          shadowColor: textEl.shadowColor,
          shadowBlur: textEl.shadowBlur,
          shadowOffsetY: textEl.shadowOffsetY
        })
        group.add(textBgRect)
      }

      // Keyword Highlight: Draw marker or badge behind specific keyword
      if (textEl.highlightKeyword && textEl.highlightKeyword.trim()) {
        const kw = textEl.highlightKeyword.trim()
        const idx = textEl.text.indexOf(kw)
        if (idx !== -1) {
          const prefix = textEl.text.slice(0, idx)
          const fontStyle = (textEl.fontWeight === 'bold' || textEl.fontWeight === '700' || textEl.fontWeight === '900') ? 'bold ' : 'normal '
          const fontSpec = `${fontStyle}${textEl.fontSize}px ${textEl.fontFamily}`
          
          const prefixW = measureTextSegment(prefix, fontSpec, textEl.letterSpacing)
          const kwW = measureTextSegment(kw, fontSpec, textEl.letterSpacing)
          const totalTextW = measureTextSegment(textEl.text, fontSpec, textEl.letterSpacing)
          
          let startX = textEl.backgroundPadding || 0
          if (textEl.align === 'center') {
            startX = Math.max(0, (kText.width() - totalTextW) / 2)
          } else if (textEl.align === 'right') {
            startX = Math.max(0, kText.width() - totalTextW - (textEl.backgroundPadding || 0))
          }
          
          const kwX = startX + prefixW
          const isMarker = textEl.highlightMode !== 'badge'
          
          const highlightRect = new Konva.Rect({
            x: kwX - (isMarker ? 2 : 6),
            y: isMarker ? (kText.height() * 0.48) : (kText.height() * 0.12),
            width: kwW + (isMarker ? 4 : 12),
            height: isMarker ? (kText.height() * 0.44) : (kText.height() * 0.76),
            fill: textEl.highlightColor || (isMarker ? 'rgba(254, 240, 138, 0.8)' : '#e11d48'),
            cornerRadius: isMarker ? 2 : 4,
            listening: false
          })
          group.add(highlightRect)
        }
      }

      group.add(kText)

      group.on('dblclick dbltap', () => {
        emit('editElementText', el.id)
      })

      bindElementEvents(group, el.id)
      elementsLayer.add(group)
    } else if (el.type === 'svg') {
      const svgEl = el as SvgElement
      const dataUrl = prepareSvgDataUrl(svgEl.svgContent, svgEl.fill)
      try {
        const imgObj = await getLoadedImage(dataUrl)
        const kSvg = new Konva.Image({
          id: el.id,
          image: imgObj,
          x: el.x,
          y: el.y,
          width: el.width,
          height: el.height,
          rotation: el.rotation,
          scaleX: el.scaleX,
          scaleY: el.scaleY,
          opacity: el.opacity,
          draggable: !el.locked,
          name: 'svg-badge'
        })
        bindElementEvents(kSvg, el.id)
        elementsLayer.add(kSvg)
      } catch (e) {
        console.error('Failed to render SVG asset:', e)
      }
    }
  }

  // 3. Render Watermark (Supports Text or Image, and Free Dragging in Single Mode)
  watermarkLayer.destroyChildren()
  if (props.watermark.enabled) {
    const wm = props.watermark
    const isImage = wm.type === 'image' && !!wm.imageSrc
    const hasText = !!wm.text && wm.text.trim().length > 0

    if (isImage || hasText) {
      if (wm.mode === 'single') {
        const posX = wm.x !== undefined ? wm.x : props.preset.width / 2
        const posY = wm.y !== undefined ? wm.y : props.preset.height / 2

        if (isImage && wm.imageSrc) {
          try {
            const imgObj = await getLoadedImage(wm.imageSrc)
            const natW = imgObj.naturalWidth || imgObj.width || 100
            const natH = imgObj.naturalHeight || imgObj.height || 100
            const targetW = wm.imageWidth || 160
            const targetH = wm.imageHeight || Math.round(targetW * (natH / natW))

            const kWatermarkImg = new Konva.Image({
              id: 'watermark-node',
              image: imgObj,
              x: posX,
              y: posY,
              width: targetW,
              height: targetH,
              offsetX: targetW / 2,
              offsetY: targetH / 2,
              opacity: wm.opacity,
              rotation: wm.angle,
              draggable: true,
              listening: true
            })
            bindWatermarkEvents(kWatermarkImg)
            watermarkLayer.add(kWatermarkImg)
          } catch (e) {
            console.error('Failed to render image watermark:', e)
          }
        } else {
          // Text Watermark
          const kWatermarkText = new Konva.Text({
            id: 'watermark-node',
            x: posX,
            y: posY,
            text: wm.text,
            fontSize: wm.fontSize,
            fill: wm.color,
            opacity: wm.opacity,
            rotation: wm.angle,
            fontFamily: "'Noto Sans SC', sans-serif",
            align: 'center',
            draggable: true,
            listening: true
          })
          kWatermarkText.offsetX(kWatermarkText.width() / 2)
          kWatermarkText.offsetY(kWatermarkText.height() / 2)
          bindWatermarkEvents(kWatermarkText)
          watermarkLayer.add(kWatermarkText)
        }
      } else {
        // Grid Tiling Mode
        if (isImage && wm.imageSrc) {
          try {
            const imgObj = await getLoadedImage(wm.imageSrc)
            const natW = imgObj.naturalWidth || imgObj.width || 100
            const natH = imgObj.naturalHeight || imgObj.height || 100
            const targetW = wm.imageWidth || 140
            const targetH = wm.imageHeight || Math.round(targetW * (natH / natW))
            const stepX = wm.gapX || 280
            const stepY = wm.gapY || 220

            for (let x = -100; x < props.preset.width + 300; x += stepX) {
              for (let y = -100; y < props.preset.height + 300; y += stepY) {
                const kImg = new Konva.Image({
                  x,
                  y,
                  image: imgObj,
                  width: targetW,
                  height: targetH,
                  offsetX: targetW / 2,
                  offsetY: targetH / 2,
                  opacity: wm.opacity,
                  rotation: wm.angle,
                  listening: false
                })
                watermarkLayer.add(kImg)
              }
            }
          } catch (e) {
            console.error('Failed to render grid image watermark:', e)
          }
        } else {
          const stepX = wm.gapX || 280
          const stepY = wm.gapY || 200
          for (let x = -100; x < props.preset.width + 300; x += stepX) {
            for (let y = -100; y < props.preset.height + 300; y += stepY) {
              const text = new Konva.Text({
                x,
                y,
                text: wm.text,
                fontSize: wm.fontSize,
                fill: wm.color,
                opacity: wm.opacity,
                rotation: wm.angle,
                fontFamily: "'Noto Sans SC', sans-serif",
                listening: false
              })
              watermarkLayer.add(text)
            }
          }
        }
      }
    }
  }

  updateTransformer()

  bgLayer.batchDraw()
  elementsLayer.batchDraw()
  watermarkLayer.batchDraw()
  renderGuides()
}

/**
 * Render visual composition guides and e-commerce/social safe area avoidance zones
 */
function renderGuides() {
  if (!guidesLayer || !stage) return
  guidesLayer.destroyChildren()

  const W = props.preset.width
  const H = props.preset.height
  const mode = props.guideOverlay

  if (mode === 'xhs') {
    // 1. Top Danger Zone (Status bar / Nav avoidance: ~14%)
    const topH = Math.round(H * 0.14)
    const topZone = new Konva.Rect({
      x: 0,
      y: 0,
      width: W,
      height: topH,
      fill: 'rgba(239, 68, 68, 0.08)',
      stroke: 'rgba(239, 68, 68, 0.45)',
      strokeWidth: 2,
      dash: [8, 6]
    })
    const topLabel = new Konva.Text({
      x: 24,
      y: 20,
      text: '📕 小红书顶部状态与导航避让区 (14%)',
      fontSize: Math.max(14, Math.round(W * 0.024)),
      fill: '#ef4444',
      fontFamily: "'Noto Sans SC', sans-serif",
      fontStyle: 'bold'
    })
    guidesLayer.add(topZone, topLabel)

    // 2. Bottom Danger Zone (Interactions / Title / Avatar avoidance: ~18%)
    const bottomH = Math.round(H * 0.18)
    const bottomY = H - bottomH
    const bottomZone = new Konva.Rect({
      x: 0,
      y: bottomY,
      width: W,
      height: bottomH,
      fill: 'rgba(239, 68, 68, 0.08)',
      stroke: 'rgba(239, 68, 68, 0.45)',
      strokeWidth: 2,
      dash: [8, 6]
    })
    const bottomLabel = new Konva.Text({
      x: 24,
      y: bottomY + 16,
      text: '📕 小红书底部互动栏避让区 (赞/藏/评/作者信息 18%)',
      fontSize: Math.max(14, Math.round(W * 0.024)),
      fill: '#ef4444',
      fontFamily: "'Noto Sans SC', sans-serif",
      fontStyle: 'bold'
    })
    guidesLayer.add(bottomZone, bottomLabel)

    // 3. Center Golden Conversion Area
    const safeMarginX = Math.round(W * 0.05)
    const safeZone = new Konva.Rect({
      x: safeMarginX,
      y: topH + 12,
      width: W - safeMarginX * 2,
      height: bottomY - topH - 24,
      stroke: 'rgba(16, 185, 129, 0.65)',
      strokeWidth: 2,
      dash: [6, 6]
    })
    const safeLabel = new Konva.Text({
      x: safeMarginX + 16,
      y: topH + 22,
      text: '✨ 核心视觉与营销文案黄金安全区',
      fontSize: Math.max(13, Math.round(W * 0.022)),
      fill: '#10b981',
      fontFamily: "'Noto Sans SC', sans-serif",
      fontStyle: 'bold'
    })
    guidesLayer.add(safeZone, safeLabel)
  } else if (mode === 'video916') {
    // 9:16 Short Video (TikTok / 抖音 / Reels)
    const topH = Math.round(H * 0.12)
    const bottomH = Math.round(H * 0.22)
    const rightW = Math.round(W * 0.18)

    // Top
    const topZone = new Konva.Rect({
      x: 0,
      y: 0,
      width: W,
      height: topH,
      fill: 'rgba(245, 158, 11, 0.08)',
      stroke: 'rgba(245, 158, 11, 0.5)',
      strokeWidth: 2,
      dash: [8, 6]
    })
    const topLabel = new Konva.Text({
      x: 24,
      y: 18,
      text: '🎵 短视频顶部状态避让区 (12%)',
      fontSize: Math.max(14, Math.round(W * 0.024)),
      fill: '#f59e0b',
      fontFamily: "'Noto Sans SC', sans-serif",
      fontStyle: 'bold'
    })
    guidesLayer.add(topZone, topLabel)

    // Bottom
    const bottomY = H - bottomH
    const bottomZone = new Konva.Rect({
      x: 0,
      y: bottomY,
      width: W,
      height: bottomH,
      fill: 'rgba(245, 158, 11, 0.08)',
      stroke: 'rgba(245, 158, 11, 0.5)',
      strokeWidth: 2,
      dash: [8, 6]
    })
    const bottomLabel = new Konva.Text({
      x: 24,
      y: bottomY + 16,
      text: '🎵 短视频底部标题与音乐避让区 (22%)',
      fontSize: Math.max(14, Math.round(W * 0.024)),
      fill: '#f59e0b',
      fontFamily: "'Noto Sans SC', sans-serif",
      fontStyle: 'bold'
    })
    guidesLayer.add(bottomZone, bottomLabel)

    // Right action buttons
    const rightZone = new Konva.Rect({
      x: W - rightW,
      y: topH,
      width: rightW,
      height: H - topH - bottomH,
      fill: 'rgba(245, 158, 11, 0.08)',
      stroke: 'rgba(245, 158, 11, 0.5)',
      strokeWidth: 2,
      dash: [8, 6]
    })
    const rightLabel = new Konva.Text({
      x: W - rightW + 10,
      y: topH + 30,
      text: '侧边\n互动\n按钮\n避让',
      fontSize: Math.max(13, Math.round(W * 0.022)),
      fill: '#f59e0b',
      fontFamily: "'Noto Sans SC', sans-serif",
      lineHeight: 1.4,
      fontStyle: 'bold'
    })
    guidesLayer.add(rightZone, rightLabel)
  } else if (mode === 'thirds') {
    // 3x3 Rule of Thirds
    const col1 = W / 3
    const col2 = (2 * W) / 3
    const row1 = H / 3
    const row2 = (2 * H) / 3

    const lineV1 = new Konva.Line({ points: [col1, 0, col1, H], stroke: 'rgba(130, 161, 185, 0.7)', strokeWidth: 1.5, dash: [8, 6] })
    const lineV2 = new Konva.Line({ points: [col2, 0, col2, H], stroke: 'rgba(130, 161, 185, 0.7)', strokeWidth: 1.5, dash: [8, 6] })
    const lineH1 = new Konva.Line({ points: [0, row1, W, row1], stroke: 'rgba(130, 161, 185, 0.7)', strokeWidth: 1.5, dash: [8, 6] })
    const lineH2 = new Konva.Line({ points: [0, row2, W, row2], stroke: 'rgba(130, 161, 185, 0.7)', strokeWidth: 1.5, dash: [8, 6] })
    guidesLayer.add(lineV1, lineV2, lineH1, lineH2)

    // 4 Intersection Focal Dots
    const points = [
      [col1, row1],
      [col2, row1],
      [col1, row2],
      [col2, row2]
    ]
    for (const [px, py] of points) {
      const ring = new Konva.Circle({
        x: px,
        y: py,
        radius: 12,
        stroke: 'rgba(130, 161, 185, 0.9)',
        strokeWidth: 2,
        fill: 'rgba(130, 161, 185, 0.2)'
      })
      const dot = new Konva.Circle({
        x: px,
        y: py,
        radius: 4,
        fill: '#82a1b9'
      })
      guidesLayer.add(ring, dot)
    }
  } else if (mode === 'center') {
    // Center Crosshair
    const midX = W / 2
    const midY = H / 2
    const lineV = new Konva.Line({ points: [midX, 0, midX, H], stroke: 'rgba(130, 161, 185, 0.7)', strokeWidth: 1.5, dash: [8, 6] })
    const lineH = new Konva.Line({ points: [0, midY, W, midY], stroke: 'rgba(130, 161, 185, 0.7)', strokeWidth: 1.5, dash: [8, 6] })
    const ringOuter = new Konva.Circle({ x: midX, y: midY, radius: 48, stroke: 'rgba(130, 161, 185, 0.7)', strokeWidth: 1.5, dash: [4, 4] })
    const ringInner = new Konva.Circle({ x: midX, y: midY, radius: 20, stroke: 'rgba(130, 161, 185, 0.9)', strokeWidth: 2 })
    const centerDot = new Konva.Circle({ x: midX, y: midY, radius: 4, fill: '#82a1b9' })
    guidesLayer.add(lineV, lineH, ringOuter, ringInner, centerDot)
  }

  guidesLayer.batchDraw()
}

function bindElementEvents(node: Konva.Node, id: string) {
  node.on('mouseenter', () => {
    const el = props.elements.find((e) => e.id === id)
    if (!el?.locked && stage) {
      stage.container().style.cursor = 'move'
    }
  })

  node.on('mouseleave', () => {
    if (stage) stage.container().style.cursor = 'default'
  })

  node.on('click tap', (e) => {
    e.cancelBubble = true
    emit('select', id)
  })

  node.on('dragstart', () => {
    if (stage) stage.container().style.cursor = 'grabbing'
  })

  node.on('dragmove', () => {
    if (!props.enableSnapping || !snapLayer || !stage) return
    handleSnapping(node)
  })

  node.on('dragend', () => {
    if (stage) stage.container().style.cursor = 'default'
    if (snapLayer) {
      snapLayer.destroyChildren()
      snapLayer.batchDraw()
    }
    emit('updateElement', id, {
      x: Math.round(node.x()),
      y: Math.round(node.y())
    })
  })

  node.on('transformend', () => {
    emit('updateElement', id, {
      x: Math.round(node.x()),
      y: Math.round(node.y()),
      rotation: Math.round(node.rotation()),
      scaleX: node.scaleX(),
      scaleY: node.scaleY()
    })
  })
}

function bindWatermarkEvents(node: Konva.Node) {
  node.on('mouseenter', () => {
    if (stage) stage.container().style.cursor = 'move'
  })

  node.on('mouseleave', () => {
    if (stage) stage.container().style.cursor = 'default'
  })

  node.on('click tap', (e) => {
    e.cancelBubble = true
    emit('selectWatermark')
  })

  node.on('dragstart', () => {
    if (stage) stage.container().style.cursor = 'grabbing'
  })

  node.on('dragmove', () => {
    if (!props.enableSnapping || !snapLayer || !stage) return
    handleSnapping(node)
  })

  node.on('dragend', () => {
    if (stage) stage.container().style.cursor = 'default'
    if (snapLayer) {
      snapLayer.destroyChildren()
      snapLayer.batchDraw()
    }
    emit('updateWatermark', {
      x: Math.round(node.x()),
      y: Math.round(node.y())
    })
  })
}

/**
 * Render Split Screen Collage (左右对比分屏 / 上下分屏)
 */
async function renderSplitCollage() {
  if (!bgLayer || !props.splitConfig) return
  const sc = props.splitConfig
  const W = props.preset.width
  const H = props.preset.height
  const ratio = sc.ratio || 0.5
  const isVert = sc.mode === 'split-vertical'

  const splitX = Math.round(W * ratio)
  const splitY = Math.round(H * ratio)

  // Slot A
  const clipA = isVert ? { x: 0, y: 0, width: splitX, height: H } : { x: 0, y: 0, width: W, height: splitY }
  const groupA = new Konva.Group({ clip: clipA, name: 'split-slot-a' })
  if (sc.imageA) {
    try {
      const imgA = await getLoadedImage(sc.imageA)
      const scaleA = Math.max(clipA.width / imgA.width, clipA.height / imgA.height)
      const imgNodeA = new Konva.Image({
        image: imgA,
        x: clipA.x + Math.round((clipA.width - imgA.width * scaleA) / 2),
        y: clipA.y + Math.round((clipA.height - imgA.height * scaleA) / 2),
        width: Math.round(imgA.width * scaleA),
        height: Math.round(imgA.height * scaleA),
        listening: false
      })
      groupA.add(imgNodeA)
    } catch (e) {
      console.error('Failed to load split image A:', e)
    }
  } else {
    // Slot A Placeholder
    const placeholderA = new Konva.Rect({
      x: clipA.x + 16,
      y: clipA.y + 16,
      width: clipA.width - 32,
      height: clipA.height - 32,
      stroke: 'rgba(130, 161, 185, 0.45)',
      strokeWidth: 2,
      dash: [8, 6],
      fill: 'rgba(240, 244, 248, 0.4)',
      cornerRadius: 8,
      listening: false
    })
    const txtA = new Konva.Text({
      x: clipA.x + clipA.width / 2,
      y: clipA.y + clipA.height / 2,
      text: '槽位 A (对比前/左图)\n请在左侧面板上传图片',
      fontSize: 18,
      fontFamily: "'Noto Sans SC', sans-serif",
      fontStyle: 'bold',
      fill: '#82a1b9',
      align: 'center',
      lineHeight: 1.5,
      listening: false
    })
    txtA.offsetX(txtA.width() / 2)
    txtA.offsetY(txtA.height() / 2)
    groupA.add(placeholderA, txtA)
  }
  bgLayer.add(groupA)

  // Slot B
  const clipB = isVert ? { x: splitX, y: 0, width: W - splitX, height: H } : { x: 0, y: splitY, width: W, height: H - splitY }
  const groupB = new Konva.Group({ clip: clipB, name: 'split-slot-b' })
  if (sc.imageB) {
    try {
      const imgB = await getLoadedImage(sc.imageB)
      const scaleB = Math.max(clipB.width / imgB.width, clipB.height / imgB.height)
      const imgNodeB = new Konva.Image({
        image: imgB,
        x: clipB.x + Math.round((clipB.width - imgB.width * scaleB) / 2),
        y: clipB.y + Math.round((clipB.height - imgB.height * scaleB) / 2),
        width: Math.round(imgB.width * scaleB),
        height: Math.round(imgB.height * scaleB),
        listening: false
      })
      groupB.add(imgNodeB)
    } catch (e) {
      console.error('Failed to load split image B:', e)
    }
  } else {
    // Slot B Placeholder
    const placeholderB = new Konva.Rect({
      x: clipB.x + 16,
      y: clipB.y + 16,
      width: clipB.width - 32,
      height: clipB.height - 32,
      stroke: 'rgba(130, 161, 185, 0.45)',
      strokeWidth: 2,
      dash: [8, 6],
      fill: 'rgba(240, 244, 248, 0.4)',
      cornerRadius: 8,
      listening: false
    })
    const txtB = new Konva.Text({
      x: clipB.x + clipB.width / 2,
      y: clipB.y + clipB.height / 2,
      text: '槽位 B (效果后/右图)\n请在左侧面板上传图片',
      fontSize: 18,
      fontFamily: "'Noto Sans SC', sans-serif",
      fontStyle: 'bold',
      fill: '#82a1b9',
      align: 'center',
      lineHeight: 1.5,
      listening: false
    })
    txtB.offsetX(txtB.width() / 2)
    txtB.offsetY(txtB.height() / 2)
    groupB.add(placeholderB, txtB)
  }
  bgLayer.add(groupB)

  // Divider Line
  const divWidth = sc.dividerWidth !== undefined ? sc.dividerWidth : 4
  if (divWidth > 0) {
    const divLine = new Konva.Line({
      points: isVert ? [splitX, 0, splitX, H] : [0, splitY, W, splitY],
      stroke: sc.dividerColor || '#ffffff',
      strokeWidth: divWidth,
      listening: false
    })
    bgLayer.add(divLine)
  }

  // Divider Badge
  if (sc.badge && sc.badge !== 'none') {
    const badgeX = isVert ? splitX : Math.round(W / 2)
    const badgeY = isVert ? Math.round(H / 2) : splitY
    const badgeGroup = new Konva.Group({ x: badgeX, y: badgeY, listening: false })

    if (sc.badge === 'vs') {
      const circle = new Konva.Circle({
        radius: 32,
        fill: '#3d4451',
        stroke: sc.dividerColor || '#ffffff',
        strokeWidth: 3,
        shadowColor: 'rgba(0,0,0,0.3)',
        shadowBlur: 10,
        shadowOffsetY: 2
      })
      const txt = new Konva.Text({
        text: 'VS',
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 32,
        fill: '#ffffff',
        fontStyle: 'bold'
      })
      txt.offsetX(txt.width() / 2)
      txt.offsetY(txt.height() / 2)
      badgeGroup.add(circle, txt)
    } else {
      const bText = sc.badge === 'before-after' ? 'BEFORE / AFTER' : '实拍对比'
      const txt = new Konva.Text({
        text: bText,
        fontFamily: "'Noto Sans SC', sans-serif",
        fontSize: 15,
        fill: '#ffffff',
        fontStyle: 'bold',
        padding: 8
      })
      const rect = new Konva.Rect({
        width: txt.width(),
        height: txt.height(),
        fill: '#3d4451',
        stroke: sc.dividerColor || '#ffffff',
        strokeWidth: 2,
        cornerRadius: 12,
        shadowColor: 'rgba(0,0,0,0.25)',
        shadowBlur: 8,
        shadowOffsetY: 2
      })
      rect.offsetX(txt.width() / 2)
      rect.offsetY(txt.height() / 2)
      txt.offsetX(txt.width() / 2)
      txt.offsetY(txt.height() / 2)
      badgeGroup.add(rect, txt)
    }
    bgLayer.add(badgeGroup)
  }
}

/**
 * Smart Magnetic Snapping: Snap candidate positions & draw dynamic cyan guide lines
 */
function handleSnapping(node: Konva.Node) {
  if (!snapLayer || !stage) return
  snapLayer.destroyChildren()

  const W = props.preset.width
  const H = props.preset.height
  const threshold = 14

  const nodeW = node.width() * node.scaleX()
  const nodeH = node.height() * node.scaleY()
  
  const curX = node.x() - node.offsetX() * node.scaleX()
  const curY = node.y() - node.offsetY() * node.scaleY()
  const centerX = curX + nodeW / 2
  const centerY = curY + nodeH / 2

  const candidateX = [
    { pos: W / 2, label: 'center' },
    { pos: Math.round(W * 0.05), label: 'margin-left' },
    { pos: Math.round(W * 0.95), label: 'margin-right' }
  ]

  const candidateY = [
    { pos: H / 2, label: 'center' },
    { pos: Math.round(H * 0.05), label: 'margin-top' },
    { pos: Math.round(H * 0.95), label: 'margin-bottom' }
  ]

  for (const el of props.elements) {
    if (el.id === node.id() || (el.type === 'image' && (el as ImageElement).isBaseImage)) continue
    const elW = el.width * el.scaleX
    const elH = el.height * el.scaleY
    candidateX.push(
      { pos: el.x + elW / 2, label: 'element-center' },
      { pos: el.x, label: 'element-edge' },
      { pos: el.x + elW, label: 'element-edge' }
    )
    candidateY.push(
      { pos: el.y + elH / 2, label: 'element-center' },
      { pos: el.y, label: 'element-edge' },
      { pos: el.y + elH, label: 'element-edge' }
    )
  }

  for (const snap of candidateX) {
    if (Math.abs(centerX - snap.pos) < threshold) {
      node.x(node.x() + (snap.pos - centerX))
      drawSnapLine(snap.pos, 0, snap.pos, H)
      break
    }
    if (Math.abs(curX - snap.pos) < threshold) {
      node.x(node.x() + (snap.pos - curX))
      drawSnapLine(snap.pos, 0, snap.pos, H)
      break
    }
    if (Math.abs(curX + nodeW - snap.pos) < threshold) {
      node.x(node.x() + (snap.pos - (curX + nodeW)))
      drawSnapLine(snap.pos, 0, snap.pos, H)
      break
    }
  }

  for (const snap of candidateY) {
    if (Math.abs(centerY - snap.pos) < threshold) {
      node.y(node.y() + (snap.pos - centerY))
      drawSnapLine(0, snap.pos, W, snap.pos)
      break
    }
    if (Math.abs(curY - snap.pos) < threshold) {
      node.y(node.y() + (snap.pos - curY))
      drawSnapLine(0, snap.pos, W, snap.pos)
      break
    }
    if (Math.abs(curY + nodeH - snap.pos) < threshold) {
      node.y(node.y() + (snap.pos - (curY + nodeH)))
      drawSnapLine(0, snap.pos, W, snap.pos)
      break
    }
  }

  snapLayer.batchDraw()
}

function drawSnapLine(x1: number, y1: number, x2: number, y2: number) {
  if (!snapLayer) return
  const line = new Konva.Line({
    points: [x1, y1, x2, y2],
    stroke: '#38bdf8', // crisp cyan
    strokeWidth: 1.5,
    dash: [6, 4],
    listening: false
  })
  snapLayer.add(line)
}

function updateTransformer() {
  if (!transformer || !elementsLayer) return

  if (!props.selectedId) {
    transformer.nodes([])
    transformer.getLayer()?.batchDraw()
    return
  }

  const selectedNode = elementsLayer.findOne('#' + props.selectedId)
  if (selectedNode) {
    transformer.nodes([selectedNode])
  } else {
    transformer.nodes([])
  }
  transformer.getLayer()?.batchDraw()
}

// Watchers
watch(() => props.elements, () => renderAll(), { deep: true })
watch(() => props.selectedId, () => updateTransformer())
watch(() => props.watermark, () => renderAll(), { deep: true })
watch(() => props.canvasBgColor, () => renderAll())
watch(() => props.guideOverlay, () => renderGuides())
watch(() => props.splitConfig, () => renderAll(), { deep: true })
watch(() => props.enableSnapping, (enabled) => {
  if (!enabled && snapLayer) {
    snapLayer.destroyChildren()
    snapLayer.batchDraw()
  }
})
watch(() => props.preset, () => {
  if (stage) {
    stage.destroy()
    stage = null
  }
  nextTick(initKonva)
})

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    if (event.target?.result) {
      emit('uploadBaseImage', event.target.result as string)
    }
  }
  reader.readAsDataURL(file)
  target.value = ''
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        emit('uploadBaseImage', event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }
}

function handlePaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items
  if (!items) return

  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      const blob = items[i].getAsFile()
      if (blob) {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            emit('uploadBaseImage', event.target.result as string)
          }
        }
        reader.readAsDataURL(blob)
        e.preventDefault()
        break
      }
    }
  }
}

function handleLoadDemo() {
  emit('loadDemo')
}

function handleResize() {
  if (stage) {
    stage.destroy()
    stage = null
  }
  nextTick(initKonva)
}

onMounted(() => {
  initKonva()
  window.addEventListener('resize', handleResize)
  window.addEventListener('paste', handlePaste)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('paste', handlePaste)
  if (stage) stage.destroy()
})

defineExpose({
  getStage: () => stage
})
</script>

<template>
  <div
    ref="viewportRef"
    class="flex-1 h-full flex items-center justify-center bg-chronicle-surface p-4 md:p-8 overflow-hidden relative select-none"
    @dragover.prevent
    @drop="handleDrop"
  >
    <!-- Hidden File Input for Canvas trigger -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileSelect"
    />

    <!-- Chronicle Subtle Geometric Watermark Background -->
    <div
      class="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center"
    >
      <div class="w-[70vmin] h-[70vmin] rounded-full border border-chronicle-primary"></div>
    </div>

    <!-- Canvas Frame Container (Chronicle Frame with hairline border) -->
    <div
      class="relative border border-chronicle-border/80 transition-all duration-300 shadow-sm overflow-hidden"
      :style="{
        width: `${stageDisplaySize.width}px`,
        height: `${stageDisplaySize.height}px`
      }"
    >
      <!-- Dedicated Konva Stage Mounting Target -->
      <div ref="konvaContainerRef" class="w-full h-full"></div>

      <!-- Chronicle Empty State Overlay: When NO Base Image and NO Elements are loaded (Single Mode) -->
      <div
        v-if="!hasBaseImage && elements.length === 0 && (!splitConfig || splitConfig.mode === 'single')"
        class="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-white/95 backdrop-blur-md"
      >
        <!-- Center Geometric Hairline Circle -->
        <div class="w-16 h-16 rounded-full border border-chronicle-border flex items-center justify-center mb-4 bg-chronicle-fill shadow-xs">
          <ImageIcon class="w-7 h-7 text-chronicle-accent" />
        </div>

        <h2 class="text-base font-serif font-semibold text-chronicle-primary tracking-wide mb-1.5">
          载入电商底图，开启 3:4 视觉编排
        </h2>

        <p class="text-xs text-chronicle-secondary font-light max-w-xs leading-relaxed mb-5">
          支持商品实拍、AI 概念图或白底图。拖拽图片至此、快捷键 ⌘+V 粘贴，或点击下方按钮载入。
        </p>

        <div class="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-xs">
          <button
            @click="fileInputRef?.click()"
            class="w-full py-2.5 px-4 rounded-lg bg-chronicle-primary text-white hover:bg-neutral-800 font-medium text-xs flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-sm"
          >
            <Upload class="w-3.5 h-3.5" />
            <span>选取本地图片文件</span>
          </button>

          <button
            @click="handleLoadDemo"
            class="w-full py-2.5 px-4 rounded-lg border border-chronicle-border bg-white hover:bg-chronicle-fill text-chronicle-primary font-medium text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.98] shadow-xs"
          >
            <Sparkles class="w-3.5 h-3.5 text-chronicle-accent" />
            <span>试用预置商品图</span>
          </button>
        </div>

        <div class="mt-6 text-[10px] tracking-wider text-chronicle-secondary font-mono">
          画幅基准 · {{ preset.ratio }} ({{ preset.width }} × {{ preset.height }} px)
        </div>
      </div>
    </div>
  </div>
</template>
