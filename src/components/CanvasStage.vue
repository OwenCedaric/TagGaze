<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import Konva from 'konva'
import { Upload } from 'lucide-vue-next'
import type { CanvasDimensions, CanvasElement, TextElement, ImageElement, SvgElement, WatermarkConfig } from '@/types'

const props = defineProps<{
  preset: CanvasDimensions
  elements: CanvasElement[]
  selectedId: string | null
  watermark: WatermarkConfig
}>()

const emit = defineEmits<{
  (e: 'select', id: string | null): void
  (e: 'updateElement', id: string, partial: Partial<CanvasElement>): void
  (e: 'uploadBaseImage', src: string): void
}>()

const containerRef = ref<HTMLDivElement | null>(null)
let stage: Konva.Stage | null = null
let bgLayer: Konva.Layer | null = null
let elementsLayer: Konva.Layer | null = null
let watermarkLayer: Konva.Layer | null = null
let transformer: Konva.Transformer | null = null

// Loaded HTMLImageElement cache to prevent re-instantiation
const imageCache = new Map<string, HTMLImageElement>()

// Responsive display scale
const viewportScale = ref(1)

function getLoadedImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!)
  }
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imageCache.set(src, img)
      resolve(img)
    }
    img.onerror = reject
    img.src = src
  })
}

function initKonva() {
  if (!containerRef.value) return

  const container = containerRef.value
  const { width: pWidth, height: pHeight } = props.preset

  // Calculate fit scale within container
  const padding = 24
  const availW = container.clientWidth - padding * 2
  const availH = container.clientHeight - padding * 2
  const scale = Math.min(availW / pWidth, availH / pHeight, 1)
  viewportScale.value = scale

  stage = new Konva.Stage({
    container: container,
    width: pWidth * scale,
    height: pHeight * scale,
    scaleX: scale,
    scaleY: scale
  })

  bgLayer = new Konva.Layer()
  elementsLayer = new Konva.Layer()
  watermarkLayer = new Konva.Layer({ listening: false })

  transformer = new Konva.Transformer({
    rotateAnchorOffset: 25,
    borderStroke: '#8B5CF6',
    borderStrokeWidth: 2,
    anchorStroke: '#8B5CF6',
    anchorFill: '#FFFFFF',
    anchorSize: 10,
    anchorCornerRadius: 2,
    enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    boundBoxFunc: (oldBox, newBox) => {
      // Limit minimum size
      if (newBox.width < 20 || newBox.height < 20) return oldBox
      return newBox
    }
  })

  elementsLayer.add(transformer)
  stage.add(bgLayer)
  stage.add(elementsLayer)
  stage.add(watermarkLayer)

  // Stage click: deselect if background clicked
  stage.on('click tap', (e) => {
    if (e.target === stage || e.target.hasName('bg-rect') || e.target.hasName('base-image')) {
      emit('select', null)
    }
  })

  renderAll()
}

// Re-render all layers
async function renderAll() {
  if (!stage || !bgLayer || !elementsLayer || !watermarkLayer || !transformer) return

  // 1. Render Background Layer
  bgLayer.destroyChildren()
  const bgRect = new Konva.Rect({
    x: 0,
    y: 0,
    width: props.preset.width,
    height: props.preset.height,
    fill: '#171717',
    name: 'bg-rect'
  })
  bgLayer.add(bgRect)

  // 2. Render Elements
  // Keep transformer intact
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

        bindElementEvents(kImage, el.id)
        if (imgEl.isBaseImage) {
          bgLayer.add(kImage)
        } else {
          elementsLayer.add(kImage)
        }
      } catch (err) {
        console.error('Failed to load image:', err)
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
        fontStyle: textEl.fontWeight === 'bold' ? 'bold' : 'normal',
        fill: textEl.fill,
        align: textEl.align,
        width: textEl.width,
        lineHeight: textEl.lineHeight,
        stroke: textEl.stroke,
        strokeWidth: textEl.strokeWidth || 0,
        shadowColor: textEl.shadowColor,
        shadowBlur: textEl.shadowBlur,
        shadowOffsetY: textEl.shadowOffsetY,
        padding: textEl.backgroundPadding || 0
      })

      if (textEl.backgroundColor) {
        const bgRect = new Konva.Rect({
          width: kText.width(),
          height: kText.height(),
          fill: textEl.backgroundColor,
          cornerRadius: textEl.backgroundRadius || 4
        })
        group.add(bgRect)
      }

      group.add(kText)
      bindElementEvents(group, el.id)
      elementsLayer.add(group)
    } else if (el.type === 'svg') {
      const svgEl = el as SvgElement
      // Render SVG string into Image
      const blob = new Blob([svgEl.svgContent.replace('currentColor', svgEl.fill)], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      try {
        const imgObj = await getLoadedImage(url)
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
          draggable: !el.locked
        })
        bindElementEvents(kSvg, el.id)
        elementsLayer.add(kSvg)
      } catch (e) {
        console.error('Failed to render SVG asset:', e)
      }
    }
  }

  // 3. Render Watermark Layer
  watermarkLayer.destroyChildren()
  if (props.watermark.enabled && props.watermark.text) {
    const wm = props.watermark
    if (wm.mode === 'single') {
      const text = new Konva.Text({
        x: props.preset.width / 2,
        y: props.preset.height / 2,
        text: wm.text,
        fontSize: wm.fontSize,
        fill: wm.color,
        opacity: wm.opacity,
        rotation: wm.angle,
        align: 'center'
      })
      text.offsetX(text.width() / 2)
      text.offsetY(text.height() / 2)
      watermarkLayer.add(text)
    } else {
      // Grid Repeat Pattern
      const stepX = wm.gapX || 240
      const stepY = wm.gapY || 180
      for (let x = -100; x < props.preset.width + 200; x += stepX) {
        for (let y = -100; y < props.preset.height + 200; y += stepY) {
          const text = new Konva.Text({
            x,
            y,
            text: wm.text,
            fontSize: wm.fontSize,
            fill: wm.color,
            opacity: wm.opacity,
            rotation: wm.angle
          })
          watermarkLayer.add(text)
        }
      }
    }
  }

  // 4. Update Transformer Selection
  updateTransformer()

  bgLayer.batchDraw()
  elementsLayer.batchDraw()
  watermarkLayer.batchDraw()
}

function bindElementEvents(node: Konva.Node, id: string) {
  node.on('click tap', (e) => {
    e.cancelBubble = true
    emit('select', id)
  })

  node.on('dragend', () => {
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
watch(
  () => props.elements,
  () => {
    renderAll()
  },
  { deep: true }
)

watch(
  () => props.selectedId,
  () => {
    updateTransformer()
  }
)

watch(
  () => props.watermark,
  () => {
    renderAll()
  },
  { deep: true }
)

watch(
  () => props.preset,
  () => {
    if (stage) {
      stage.destroy()
      stage = null
    }
    nextTick(initKonva)
  }
)

// Handle drag and drop base image
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
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (stage) stage.destroy()
})

// Expose stage getter for export composable
defineExpose({
  getStage: () => stage
})
</script>

<template>
  <div
    class="flex-1 h-full flex items-center justify-center bg-neutral-950 p-4 md:p-8 overflow-hidden relative"
    @dragover.prevent
    @drop="handleDrop"
  >
    <!-- Background dotted grid -->
    <div
      class="absolute inset-0 opacity-20 pointer-events-none"
      style="background-image: radial-gradient(circle, #737373 1px, transparent 1px); background-size: 20px 20px;"
    ></div>

    <!-- Konva Stage Container with sleek shadow and frame -->
    <div
      ref="containerRef"
      class="relative shadow-2xl rounded-sm overflow-hidden border border-neutral-800 transition-all duration-200"
      :style="{
        aspectRatio: `${preset.width} / ${preset.height}`,
        maxHeight: '90%',
        maxWidth: '90%'
      }"
    >
      <!-- Empty State Drop Guide -->
      <div
        v-if="elements.length === 0"
        class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-neutral-500 pointer-events-none z-10"
      >
        <div class="w-14 h-14 rounded-2xl bg-neutral-850 border border-neutral-750 flex items-center justify-center mb-3 text-brand-400">
          <Upload class="w-7 h-7" />
        </div>
        <p class="text-xs font-semibold text-neutral-300 mb-1">拖拽底图至此处，或从左侧添加文案</p>
        <p class="text-[11px] text-neutral-500">默认 3:4 黄金画幅 ({{ preset.width }} × {{ preset.height }} px)</p>
      </div>
    </div>
  </div>
</template>
