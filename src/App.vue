<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import Header from './components/Header.vue'
import CanvasStage from './components/CanvasStage.vue'
import ElementToolbar from './components/ElementToolbar.vue'
import Sidebar from './components/layout/Sidebar.vue'
import BottomDrawer from './components/layout/BottomDrawer.vue'
import TextPanel from './components/panels/TextPanel.vue'
import AssetsPanel from './components/panels/AssetsPanel.vue'
import WatermarkPanel from './components/panels/WatermarkPanel.vue'
import ExportModal from './components/panels/ExportModal.vue'

import { useCanvas } from './composables/useCanvas'
import { useWatermark } from './composables/useWatermark'
import { useExport } from './composables/useExport'
import type { TextElement, SvgElement, ExportOptions } from './types'

// Active Panel Tab
const activeTab = ref<'text' | 'assets' | 'watermark'>('text')
const isExportModalOpen = ref(false)

// Canvas Composable
const {
  currentPreset,
  elements,
  selectedId,
  selectedElement,
  canUndo,
  canRedo,
  undo,
  redo,
  loadState,
  setPreset,
  selectElement,
  addText,
  addImage,
  addSvg,
  updateElement,
  removeElement,
  duplicateElement,
  bringForward,
  sendBackward,
  toggleLock
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
  selectElement(null) // clear transformer box during export preview
  isExportModalOpen.value = true
  const stage = canvasStageRef.value?.getStage()
  if (stage) {
    estimateFileSize(stage, currentExportOptions.value, 0)
  }
}

// Global Keyboard shortcuts (Undo/Redo/Delete)
function handleKeydown(e: KeyboardEvent) {
  // If typing inside an input or textarea, ignore shortcuts
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

onMounted(() => {
  loadState()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="h-screen w-screen flex flex-col bg-neutral-950 text-neutral-100 overflow-hidden font-sans">
    <!-- Top Navigation Header -->
    <Header
      :current-preset="currentPreset"
      :can-undo="canUndo"
      :can-redo="canRedo"
      :watermark-enabled="watermark.enabled"
      @change-preset="setPreset"
      @undo="undo"
      @redo="redo"
      @toggle-watermark="toggleWatermark()"
      @open-export="handleOpenExport"
    />

    <!-- Main Workspace -->
    <div class="flex-1 flex overflow-hidden relative">
      <!-- Desktop Sidebar -->
      <Sidebar v-model:activeTab="activeTab">
        <TextPanel
          v-if="activeTab === 'text'"
          :active-text="activeText"
          @add-text="addText"
          @update-text="(partial) => activeText && updateElement(activeText.id, partial)"
          @apply-preset="(p) => activeText && updateElement(activeText.id, p)"
        />

        <AssetsPanel
          v-else-if="activeTab === 'assets'"
          :active-svg="activeSvg"
          @add-svg="addSvg"
          @upload-logo="(src) => addImage(src, false)"
          @update-svg-color="(fill) => activeSvg && updateElement(activeSvg.id, { fill })"
        />

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
          @select="selectElement"
          @update-element="updateElement"
          @upload-base-image="(src) => addImage(src, true)"
        />
      </main>

      <!-- Mobile & Tablet Bottom Drawer -->
      <BottomDrawer v-model:activeTab="activeTab">
        <TextPanel
          v-if="activeTab === 'text'"
          :active-text="activeText"
          @add-text="addText"
          @update-text="(partial) => activeText && updateElement(activeText.id, partial)"
          @apply-preset="(p) => activeText && updateElement(activeText.id, p)"
        />

        <AssetsPanel
          v-else-if="activeTab === 'assets'"
          :active-svg="activeSvg"
          @add-svg="addSvg"
          @upload-logo="(src) => addImage(src, false)"
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
