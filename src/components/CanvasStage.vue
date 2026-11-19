<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import Konva from 'konva'
import { Upload, Sparkles, Image as ImageIcon } from 'lucide-vue-next'
import type { CanvasDimensions, CanvasElement, TextElement, ImageElement, SvgElement, WatermarkConfig } from '@/types'

const props = defineProps<{
  preset: CanvasDimensions
  elements: CanvasElement[]
  selectedId: string | null
  watermark: WatermarkConfig
  canvasBgColor: string
  hasBaseImage: boolean
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
let transformer: Konva.Transformer | null = null

const imageCache = new Map<string, HTMLImageElement>()

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

        if (!imgEl.isBaseImage) {
          bindElementEvents(kImage, el.id)
          elementsLayer.add(kImage)
        } else {
          bgLayer.add(kImage)
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
          cornerRadius: textEl.backgroundRadius || 2
        })
        group.add(textBgRect)
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

  node.on('dragend', () => {
    if (stage) stage.container().style.cursor = 'default'
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

  node.on('dragend', () => {
    if (stage) stage.container().style.cursor = 'default'
    emit('updateWatermark', {
      x: Math.round(node.x()),
      y: Math.round(node.y())
    })
  })
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

      <!-- Chronicle Empty State Overlay: When NO Base Image is loaded -->
      <div
        v-if="!hasBaseImage"
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
