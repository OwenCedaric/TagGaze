<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import Header from './components/Header.vue'
import CanvasStage from './components/CanvasStage.vue'
import ElementToolbar from './components/ElementToolbar.vue'
import Sidebar from './components/layout/Sidebar.vue'
import BottomDrawer from './components/layout/BottomDrawer.vue'
import BaseImagePanel from './components/panels/BaseImagePanel.vue'
import TextPanel from './components/panels/TextPanel.vue'
import AssetsPanel from './components/panels/AssetsPanel.vue'
import WatermarkPanel from './components/panels/WatermarkPanel.vue'
import TemplatesPanel from './components/panels/TemplatesPanel.vue'
import ExportModal from './components/panels/ExportModal.vue'
import BatchExportModal from './components/panels/BatchExportModal.vue'

import { useCanvas } from './composables/useCanvas'
import { useWatermark } from './composables/useWatermark'
import { useExport } from './composables/useExport'
import { useBrandKit } from './composables/useBrandKit'
import { exportProjectFile, parseProjectFile } from './utils/projectFile'
import { SimpleZip } from './utils/simpleZip'
import type { TabType } from './components/layout/Sidebar.vue'
import type { TextElement, SvgElement, ExportOptions, LayoutTemplate, BatchImageItem, BatchExportOptions } from './types'

// Active Panel Tab: default to 'image' if no base image, else 'text'
const activeTab = ref<TabType>('image')
const isExportModalOpen = ref(false)
const isBatchModalOpen = ref(false)
const isBatchProcessing = ref(false)
const progressCurrent = ref(0)
const progressTotal = ref(0)
const currentBatchStatus = ref('')

// Brand Kit Composable
const { brandKit, updateBrandKit } = useBrandKit()

// Canvas Composable
const {
  currentPreset,
  elements,
  selectedId,
  selectedElement,
  baseImage,
  hasBaseImage,
  canvasBgColor,
  canUndo,
  canRedo,
  undo,
  redo,
  loadState,
  setPreset,
  selectElement,
  addText,
  addPromoBenefit,
  addBrandGuarantee,
  addCalloutPin,
  setBaseImage,
  updateBaseImageFit,
  removeBaseImage,
  addSticker,
  addSvg,
  updateElement,
  removeElement,
  duplicateElement,
  bringForward,
  sendBackward,
  toggleLock,
  loadDemoTemplate,
  loadDemoSplitImages,
  guideOverlay,
  applyTemplate,
  enableSnapping,
  toggleSnapping,
  splitConfig,
  updateSplitConfig,
  setSplitImage,
  restoreProject
} = useCanvas()

// Watermark Composable
const { watermark, toggleWatermark, updateWatermark } = useWatermark()

// Export Composable
const {
  isExporting,
  isEstimating,
  estimatedSizeKb,
  estimateFileSize,
  findOptimalQuality,
  downloadStage,
  getStageCanvas,
  canvasToBlob
} = useExport()

const canvasStageRef = ref<InstanceType<typeof CanvasStage> | null>(null)

// Current Export Options
const currentExportOptions = ref<ExportOptions>({
  format: 'image/jpeg',
  quality: 0.82,
  scale: 1
})

// Active typed elements
const activeText = computed(() => {
  return selectedElement.value && selectedElement.value.type === 'text'
    ? (selectedElement.value as TextElement)
    : null
})

const activeSvg = computed(() => {
  return selectedElement.value && selectedElement.value.type === 'svg'
    ? (selectedElement.value as SvgElement)
    : null
})

function handleBaseImageUpload(src: string) {
  setBaseImage(src, 'cover')
  // Automatically guide user to text typography after loading base image
  nextTick(() => {
    activeTab.value = 'text'
  })
}

function handleLoadDemo() {
  loadDemoTemplate()
  nextTick(() => {
    activeTab.value = 'assets'
  })
}

function handleApplyTemplate(template: LayoutTemplate) {
  applyTemplate(template)
  nextTick(() => {
    activeTab.value = 'text'
  })
}

function handleAddTextTier(tierId: 'hero' | 'subtitle' | 'price' | 'body') {
  addText(tierId)
  activeTab.value = 'text'
}

function handleSelectElement(id: string | null) {
  selectElement(id)
  if (id) {
    const el = elements.value.find((e) => e.id === id)
    if (el?.type === 'text') activeTab.value = 'text'
    else if (el?.type === 'svg') activeTab.value = 'assets'
  }
}

function handleEditElementText(id: string) {
  selectElement(id)
  activeTab.value = 'text'
}

function handleExportChange(options: ExportOptions) {
  currentExportOptions.value = options
  const stage = canvasStageRef.value?.getStage()
  if (stage) {
    estimateFileSize(stage, options)
  }
}

async function handleAutoFitTarget(targetKb: number) {
  const stage = canvasStageRef.value?.getStage()
  if (!stage) return

  const bestQ = await findOptimalQuality(
    stage,
    targetKb,
    currentExportOptions.value.format,
    currentExportOptions.value.scale
  )
  currentExportOptions.value.quality = bestQ
  estimateFileSize(stage, currentExportOptions.value)
}

function handleDownload() {
  const stage = canvasStageRef.value?.getStage()
  if (!stage) return

  downloadStage(stage, currentExportOptions.value, `TagGaze-${currentPreset.value.ratio.replace(':', 'x')}`)
}

function handleOpenExport() {
  selectElement(null) // clear transformer selection box during export
  isExportModalOpen.value = true
  const stage = canvasStageRef.value?.getStage()
  if (stage) {
    estimateFileSize(stage, currentExportOptions.value, 0)
  }
}

function handleSaveProject() {
  exportProjectFile(
    currentPreset.value,
    canvasBgColor.value,
    elements.value,
    watermark.value,
    splitConfig.value,
    guideOverlay.value,
    brandKit.value
  )
}

async function handleOpenProjectFile(file: File) {
  try {
    const project = await parseProjectFile(file)
    restoreProject(project)
    updateWatermark(project.watermark)
    if (project.brandKit) {
      updateBrandKit(project.brandKit)
    }
    // Switch to text or templates tab to show elements
    nextTick(() => {
      activeTab.value = 'text'
    })
  } catch (err: any) {
    alert(err.message || '导入工程文件失败')
  }
}

function handleApplyBrandColor(color: string) {
  if (activeText.value) {
    updateElement(activeText.value.id, { fill: color })
  } else if (activeSvg.value) {
    updateElement(activeSvg.value.id, { fill: color })
  }
}

async function handleStartBatch(images: BatchImageItem[], options: BatchExportOptions) {
  const stage = canvasStageRef.value?.getStage()
  if (!stage) return

  selectElement(null)
  isBatchProcessing.value = true
  progressCurrent.value = 0
  progressTotal.value = images.length
  currentBatchStatus.value = '准备批量合成...'

  const originalBaseImage = baseImage.value ? { ...baseImage.value } : null
  const elementsLayer = stage.getChildren().find((l) => l.hasName('elements-layer') || stage.getChildren().indexOf(l) === 1)
  const wasElementsVisible = elementsLayer ? elementsLayer.visible() : true

  try {
    if (options.mode === 'watermark-only' && elementsLayer) {
      elementsLayer.visible(false)
    }

    const zip = new SimpleZip()
    const ext = options.format === 'image/webp' ? 'webp' : options.format === 'image/png' ? 'png' : 'jpg'

    for (let i = 0; i < images.length; i++) {
      const item = images[i]
      item.status = 'processing'
      progressCurrent.value = i + 1
      currentBatchStatus.value = `正在合成 (${i + 1}/${images.length}): ${item.name}`

      // Temporarily swap base image
      setBaseImage(item.src, 'cover')

      // Allow Konva to redraw with new image
      await nextTick()
      await new Promise((resolve) => setTimeout(resolve, 200))

      const canvas = getStageCanvas(stage, options.scale)
      const blob = await canvasToBlob(canvas, options.format, options.quality)

      const cleanName = item.name.replace(/\.[^.]+$/, '')
      const outName = options.namingPattern === 'numbered'
        ? `${String(i + 1).padStart(2, '0')}_${cleanName}.${ext}`
        : `${cleanName}_TagGaze.${ext}`

      await zip.addFile(outName, blob)
      item.status = 'done'
    }

    currentBatchStatus.value = '正在压缩并打包 ZIP...'
    await new Promise((resolve) => setTimeout(resolve, 150))
    const zipBlob = zip.generateBlob()

    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const ratioStr = currentPreset.value.ratio.replace(':', 'x')
    a.href = url
    a.download = `TagGaze-Batch-${ratioStr}-${dateStr}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    currentBatchStatus.value = '全部处理完成，ZIP 已自动下载！'
    await new Promise((resolve) => setTimeout(resolve, 1200))
    isBatchModalOpen.value = false
  } catch (err) {
    console.error('Batch export failed:', err)
    alert('批量合成过程中出现错误，请检查上传图片')
  } finally {
    if (originalBaseImage) {
      setBaseImage(originalBaseImage.src, originalBaseImage.fitMode || 'cover')
    } else {
      removeBaseImage()
    }
    if (elementsLayer) {
      elementsLayer.visible(wasElementsVisible)
    }
    isBatchProcessing.value = false
  }
}

// Global Keyboard shortcuts (Undo/Redo/Delete)
function handleKeydown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return

  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
    e.preventDefault()
    if (e.shiftKey) {
      redo()
    } else {
      undo()
    }
  } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
    e.preventDefault()
    redo()
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    if (selectedId.value) {
      e.preventDefault()
      removeElement(selectedId.value)
    }
  } else if (e.key === 'Escape') {
    selectElement(null)
  }
}

onMounted(async () => {
  await loadState()
  if (hasBaseImage.value) {
    activeTab.value = 'text'
  } else {
    activeTab.value = 'image'
  }
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="h-screen w-screen flex flex-col bg-chronicle-surface text-chronicle-primary overflow-hidden font-sans">
    <!-- Chronicle Top Navigation Header -->
    <Header
      :current-preset="currentPreset"
      :can-undo="canUndo"
      :can-redo="canRedo"
      :watermark-enabled="watermark.enabled"
      :has-base-image="hasBaseImage"
      :guide-overlay="guideOverlay"
      :enable-snapping="enableSnapping"
      @change-preset="setPreset"
      @undo="undo"
      @redo="redo"
      @toggle-watermark="toggleWatermark()"
      @change-guide-overlay="(m) => guideOverlay = m"
      @toggle-snapping="toggleSnapping"
      @save-project="handleSaveProject"
      @open-project-file="handleOpenProjectFile"
      @open-batch="isBatchModalOpen = true"
      @open-export="handleOpenExport"
      @trigger-upload="activeTab = 'image'"
    />

    <!-- Main Workspace -->
    <div class="flex-1 flex overflow-hidden relative">
      <!-- Desktop Sidebar -->
      <Sidebar v-model:activeTab="activeTab" :has-base-image="hasBaseImage">
        <!-- Tab 0: Templates & Layouts -->
        <TemplatesPanel
          v-if="activeTab === 'templates'"
          :current-ratio="currentPreset.ratio"
          @apply-template="handleApplyTemplate"
        />

        <!-- Tab 1: Base Image Manager -->
        <BaseImagePanel
          v-else-if="activeTab === 'image'"
          :base-image="baseImage"
          :canvas-bg-color="canvasBgColor"
          :split-config="splitConfig"
          @upload-base-image="handleBaseImageUpload"
          @load-demo="handleLoadDemo"
          @update-fit-mode="updateBaseImageFit"
          @update-bg-color="(c) => canvasBgColor = c"
          @remove-base-image="removeBaseImage"
          @update-filters="(f) => baseImage && updateElement(baseImage.id, f)"
          @update-split-config="updateSplitConfig"
          @set-split-image="setSplitImage"
          @load-demo-split="loadDemoSplitImages"
        />

        <!-- Tab 2: Typography -->
        <TextPanel
          v-else-if="activeTab === 'text'"
          :active-text="activeText"
          @add-text-tier="handleAddTextTier"
          @add-promo-benefit="(p) => addPromoBenefit(p)"
          @update-text="(partial) => activeText && updateElement(activeText.id, partial)"
          @apply-preset="(p) => activeText && updateElement(activeText.id, p)"
        />

        <!-- Tab 3: Assets & Badges -->
        <AssetsPanel
          v-else-if="activeTab === 'assets'"
          :active-svg="activeSvg"
          :brand-kit="brandKit"
          @add-svg="(content, fill, w, h) => addSvg(content, fill, w, h)"
          @upload-logo="(src) => addSticker(src)"
          @update-svg-color="(fill) => activeSvg && updateElement(activeSvg.id, { fill })"
          @add-callout-pin="addCalloutPin"
          @update-brand-kit="updateBrandKit"
          @add-brand-guarantee="addBrandGuarantee"
          @apply-brand-color="handleApplyBrandColor"
        />

        <!-- Tab 4: Watermark -->
        <WatermarkPanel
          v-else-if="activeTab === 'watermark'"
          :watermark="watermark"
          @update-watermark="updateWatermark"
        />
      </Sidebar>

      <!-- Center Interactive Canvas Viewport -->
      <main class="flex-1 h-full relative overflow-hidden flex flex-col">
        <!-- Floating Element Action Toolbar -->
        <ElementToolbar
          :element="selectedElement"
          @duplicate="selectedId && duplicateElement(selectedId)"
          @delete="selectedId && removeElement(selectedId)"
          @bring-forward="selectedId && bringForward(selectedId)"
          @send-backward="selectedId && sendBackward(selectedId)"
          @toggle-lock="selectedId && toggleLock(selectedId)"
        />

        <CanvasStage
          ref="canvasStageRef"
          :preset="currentPreset"
          :elements="elements"
          :selected-id="selectedId"
          :watermark="watermark"
          :canvas-bg-color="canvasBgColor"
          :has-base-image="hasBaseImage"
          :guide-overlay="guideOverlay"
          :enable-snapping="enableSnapping"
          :split-config="splitConfig"
          @select="handleSelectElement"
          @update-element="updateElement"
          @upload-base-image="handleBaseImageUpload"
          @edit-element-text="handleEditElementText"
          @update-watermark="updateWatermark"
          @select-watermark="activeTab = 'watermark'"
          @load-demo="handleLoadDemo"
        />
      </main>

      <!-- Mobile & Tablet Bottom Drawer -->
      <BottomDrawer v-model:activeTab="activeTab" :has-base-image="hasBaseImage">
        <TemplatesPanel
          v-if="activeTab === 'templates'"
          :current-ratio="currentPreset.ratio"
          @apply-template="handleApplyTemplate"
        />

        <BaseImagePanel
          v-else-if="activeTab === 'image'"
          :base-image="baseImage"
          :canvas-bg-color="canvasBgColor"
          :split-config="splitConfig"
          @upload-base-image="handleBaseImageUpload"
          @load-demo="handleLoadDemo"
          @update-fit-mode="updateBaseImageFit"
          @update-bg-color="(c) => canvasBgColor = c"
          @remove-base-image="removeBaseImage"
          @update-filters="(f) => baseImage && updateElement(baseImage.id, f)"
          @update-split-config="updateSplitConfig"
          @set-split-image="setSplitImage"
          @load-demo-split="loadDemoSplitImages"
        />

        <TextPanel
          v-else-if="activeTab === 'text'"
          :active-text="activeText"
          @add-text-tier="handleAddTextTier"
          @add-promo-benefit="(p) => addPromoBenefit(p)"
          @update-text="(partial) => activeText && updateElement(activeText.id, partial)"
          @apply-preset="(p) => activeText && updateElement(activeText.id, p)"
        />

        <AssetsPanel
          v-else-if="activeTab === 'assets'"
          :active-svg="activeSvg"
          :brand-kit="brandKit"
          @add-svg="(content, fill, w, h) => addSvg(content, fill, w, h)"
          @upload-logo="(src) => addSticker(src)"
          @update-svg-color="(fill) => activeSvg && updateElement(activeSvg.id, { fill })"
          @add-callout-pin="addCalloutPin"
          @update-brand-kit="updateBrandKit"
          @add-brand-guarantee="addBrandGuarantee"
          @apply-brand-color="handleApplyBrandColor"
        />

        <WatermarkPanel
          v-else-if="activeTab === 'watermark'"
          :watermark="watermark"
          @update-watermark="updateWatermark"
        />
      </BottomDrawer>
    </div>

    <!-- Export Dialog Modal -->
    <ExportModal
      :is-open="isExportModalOpen"
      :estimated-size-kb="estimatedSizeKb"
      :is-estimating="isEstimating"
      :is-exporting="isExporting"
      @close="isExportModalOpen = false"
      @change-options="handleExportChange"
      @auto-fit-target="handleAutoFitTarget"
      @download="handleDownload"
    />

    <!-- Batch Export Modal -->
    <BatchExportModal
      :is-open="isBatchModalOpen"
      :is-processing="isBatchProcessing"
      :progress-current="progressCurrent"
      :progress-total="progressTotal"
      :current-status-text="currentBatchStatus"
      @close="isBatchModalOpen = false"
      @start-batch="handleStartBatch"
    />
  </div>
</template>
