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
import ExportModal from './components/panels/ExportModal.vue'

import { useCanvas } from './composables/useCanvas'
import { useWatermark } from './composables/useWatermark'
import { useExport } from './composables/useExport'
import type { TabType } from './components/layout/Sidebar.vue'
import type { TextElement, SvgElement, ExportOptions } from './types'

// Active Panel Tab: default to 'image' if no base image, else 'text'
const activeTab = ref<TabType>('image')
const isExportModalOpen = ref(false)

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
  loadDemoTemplate
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
  downloadStage
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
      @change-preset="setPreset"
      @undo="undo"
      @redo="redo"
      @toggle-watermark="toggleWatermark()"
      @open-export="handleOpenExport"
      @trigger-upload="activeTab = 'image'"
    />

    <!-- Main Workspace -->
    <div class="flex-1 flex overflow-hidden relative">
      <!-- Desktop Sidebar -->
      <Sidebar v-model:activeTab="activeTab" :has-base-image="hasBaseImage">
        <!-- Tab 0: Base Image Manager -->
        <BaseImagePanel
          v-if="activeTab === 'image'"
          :base-image="baseImage"
          :canvas-bg-color="canvasBgColor"
          @upload-base-image="handleBaseImageUpload"
          @load-demo="handleLoadDemo"
          @update-fit-mode="updateBaseImageFit"
          @update-bg-color="(c) => canvasBgColor = c"
          @remove-base-image="removeBaseImage"
        />

        <!-- Tab 1: Typography -->
        <TextPanel
          v-else-if="activeTab === 'text'"
          :active-text="activeText"
          @add-text-tier="handleAddTextTier"
          @update-text="(partial) => activeText && updateElement(activeText.id, partial)"
          @apply-preset="(p) => activeText && updateElement(activeText.id, p)"
        />

        <!-- Tab 2: Assets & Badges -->
        <AssetsPanel
          v-else-if="activeTab === 'assets'"
          :active-svg="activeSvg"
          @add-svg="(content, fill, w, h) => addSvg(content, fill, w, h)"
          @upload-logo="(src) => addSticker(src)"
          @update-svg-color="(fill) => activeSvg && updateElement(activeSvg.id, { fill })"
        />

        <!-- Tab 3: Watermark -->
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
        <BaseImagePanel
          v-if="activeTab === 'image'"
          :base-image="baseImage"
          :canvas-bg-color="canvasBgColor"
          @upload-base-image="handleBaseImageUpload"
          @load-demo="handleLoadDemo"
          @update-fit-mode="updateBaseImageFit"
          @update-bg-color="(c) => canvasBgColor = c"
          @remove-base-image="removeBaseImage"
        />

        <TextPanel
          v-else-if="activeTab === 'text'"
          :active-text="activeText"
          @add-text-tier="handleAddTextTier"
          @update-text="(partial) => activeText && updateElement(activeText.id, partial)"
          @apply-preset="(p) => activeText && updateElement(activeText.id, p)"
        />

        <AssetsPanel
          v-else-if="activeTab === 'assets'"
          :active-svg="activeSvg"
          @add-svg="(content, fill, w, h) => addSvg(content, fill, w, h)"
          @upload-logo="(src) => addSticker(src)"
          @update-svg-color="(fill) => activeSvg && updateElement(activeSvg.id, { fill })"
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
  </div>
</template>
