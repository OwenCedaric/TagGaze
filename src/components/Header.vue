<script setup lang="ts">
import { ref } from 'vue'
import { Undo2, Redo2, Download, ShieldCheck, Upload, ChevronDown } from 'lucide-vue-next'
import { CANVAS_PRESETS } from '@/constants/presets'
import type { CanvasDimensions } from '@/types'

defineProps<{
  currentPreset: CanvasDimensions
  canUndo: boolean
  canRedo: boolean
  watermarkEnabled: boolean
  hasBaseImage: boolean
}>()

const emit = defineEmits<{
  (e: 'changePreset', preset: CanvasDimensions): void
  (e: 'undo'): void
  (e: 'redo'): void
  (e: 'toggleWatermark'): void
  (e: 'openExport'): void
  (e: 'triggerUpload'): void
}>()

const isPresetsOpen = ref(false)
</script>

<template>
  <header class="h-14 border-b border-chronicle-border bg-chronicle-surface-raised/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between shrink-0 z-30 select-none shadow-xs">
    <!-- Left: Brand / Title in Serif Polarity -->
    <div class="flex items-center gap-3">
      <div class="w-7 h-7 rounded border border-chronicle-border bg-chronicle-fill flex items-center justify-center text-chronicle-accent font-serif font-bold text-xs tracking-wider">
        TG
      </div>
      <div class="flex items-baseline gap-2">
        <h1 class="text-sm font-serif font-bold tracking-wide text-chronicle-primary">
          TagGaze
        </h1>
        <span class="text-[10px] text-chronicle-secondary font-light hidden sm:inline tracking-wider">
          3:4 视觉排版工坊
        </span>
      </div>
    </div>

    <!-- Center: Ratio Presets & Undo/Redo -->
    <div class="flex items-center gap-2 md:gap-3">
      <!-- Ratio Selector -->
      <div class="relative">
        <button
          @click="isPresetsOpen = !isPresetsOpen"
          class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-chronicle-border bg-white hover:bg-chronicle-fill text-xs font-light text-chronicle-primary transition shadow-xs"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-chronicle-accent"></span>
          <span>{{ currentPreset.ratio }} ({{ currentPreset.width }} × {{ currentPreset.height }})</span>
          <ChevronDown class="w-3 h-3 text-chronicle-secondary opacity-70" />
        </button>

        <div
          v-if="isPresetsOpen"
          @click="isPresetsOpen = false"
          class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-60 bg-white border border-chronicle-border rounded-xl shadow-xl p-1.5 z-50 text-xs"
        >
          <div class="text-[10px] text-chronicle-secondary font-light px-2 py-1 tracking-wider">预设商业画幅</div>
          <button
            v-for="preset in CANVAS_PRESETS"
            :key="preset.name"
            @click="emit('changePreset', preset)"
            class="w-full text-left px-2.5 py-2 rounded-lg hover:bg-chronicle-fill flex items-center justify-between transition"
            :class="currentPreset.name === preset.name ? 'text-chronicle-accent font-medium bg-chronicle-accent-light' : 'text-chronicle-secondary'"
          >
            <span>{{ preset.name }}</span>
            <span class="text-[10px] font-mono text-chronicle-secondary/70">{{ preset.ratio }}</span>
          </button>
        </div>
      </div>

      <!-- Undo / Redo Buttons -->
      <div class="flex items-center rounded-lg border border-chronicle-border bg-white p-0.5 shadow-xs">
        <button
          @click="emit('undo')"
          :disabled="!canUndo"
          title="撤销 (Ctrl+Z)"
          class="p-1.5 rounded text-chronicle-secondary hover:text-chronicle-primary disabled:opacity-30 transition"
        >
          <Undo2 class="w-3.5 h-3.5" />
        </button>
        <button
          @click="emit('redo')"
          :disabled="!canRedo"
          title="重做 (Ctrl+Y)"
          class="p-1.5 rounded text-chronicle-secondary hover:text-chronicle-primary disabled:opacity-30 transition"
        >
          <Redo2 class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Right: Upload Image / Watermark / Export CTA -->
    <div class="flex items-center gap-2">
      <!-- Quick Base Image Upload Trigger -->
      <button
        @click="emit('triggerUpload')"
        class="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-chronicle-border bg-white hover:bg-chronicle-fill text-xs text-chronicle-primary font-light transition shadow-xs"
      >
        <Upload class="w-3 h-3 text-chronicle-accent" />
        <span>{{ hasBaseImage ? '更换底图' : '上传底图' }}</span>
      </button>

      <!-- Watermark Toggle -->
      <button
        @click="emit('toggleWatermark')"
        title="防盗水印开关"
        class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-light transition shadow-xs"
        :class="watermarkEnabled ? 'bg-chronicle-accent-light border-chronicle-accent text-chronicle-primary font-medium' : 'bg-white border-chronicle-border text-chronicle-secondary hover:text-chronicle-primary'"
      >
        <ShieldCheck class="w-3.5 h-3.5" :class="watermarkEnabled ? 'text-chronicle-accent' : ''" />
        <span class="hidden md:inline">防盗水印</span>
      </button>

      <!-- Export CTA -->
      <button
        @click="emit('openExport')"
        class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-chronicle-primary text-white hover:bg-neutral-800 text-xs font-medium transition active:scale-95 shadow-sm"
      >
        <Download class="w-3.5 h-3.5" />
        <span>导出</span>
      </button>
    </div>
  </header>
</template>
