<script setup lang="ts">
import { ref } from 'vue'
import { Undo2, Redo2, Download, ShieldCheck } from 'lucide-vue-next'
import { CANVAS_PRESETS } from '@/constants/presets'
import type { CanvasDimensions } from '@/types'

defineProps<{
  currentPreset: CanvasDimensions
  canUndo: boolean
  canRedo: boolean
  watermarkEnabled: boolean
}>()

const emit = defineEmits<{
  (e: 'changePreset', preset: CanvasDimensions): void
  (e: 'undo'): void
  (e: 'redo'): void
  (e: 'toggleWatermark'): void
  (e: 'openExport'): void
}>()

const isPresetsOpen = ref(false)
</script>

<template>
  <header class="h-14 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur px-3 md:px-5 flex items-center justify-between shrink-0 z-30 select-none">
    <!-- Left: Brand Logo & Title -->
    <div class="flex items-center gap-2.5">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white font-bold text-sm">
        TG
      </div>
      <div>
        <h1 class="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
          TagGaze
          <span class="text-[10px] uppercase font-semibold px-1.5 py-0.2 bg-brand-500/20 text-brand-300 rounded border border-brand-500/30">
            3:4 爆款
          </span>
        </h1>
      </div>
    </div>

    <!-- Center: Ratio Presets & Undo/Redo -->
    <div class="flex items-center gap-1.5 md:gap-3">
      <!-- Ratio Selector -->
      <div class="relative">
        <button
          @click="isPresetsOpen = !isPresetsOpen"
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-xs font-medium text-neutral-200 border border-neutral-700/80 transition"
        >
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{{ currentPreset.ratio }} ({{ currentPreset.width }}×{{ currentPreset.height }})</span>
        </button>

        <!-- Dropdown Menu -->
        <div
          v-if="isPresetsOpen"
          @click="isPresetsOpen = false"
          class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-neutral-850 border border-neutral-700 rounded-xl shadow-2xl p-1.5 z-50 text-xs"
        >
          <div class="text-[11px] text-neutral-400 font-semibold px-2 py-1">常用画幅尺寸</div>
          <button
            v-for="preset in CANVAS_PRESETS"
            :key="preset.name"
            @click="emit('changePreset', preset)"
            class="w-full text-left px-2.5 py-2 rounded-lg hover:bg-neutral-800 flex items-center justify-between transition"
            :class="currentPreset.name === preset.name ? 'text-brand-400 font-medium bg-brand-500/10' : 'text-neutral-300'"
          >
            <span>{{ preset.name }}</span>
            <span class="text-[10px] text-neutral-500">{{ preset.ratio }}</span>
          </button>
        </div>
      </div>

      <!-- Undo / Redo Buttons -->
      <div class="flex items-center bg-neutral-800/80 rounded-lg p-0.5 border border-neutral-700/60">
        <button
          @click="emit('undo')"
          :disabled="!canUndo"
          title="撤销 (Ctrl+Z)"
          class="p-1.5 rounded text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition"
        >
          <Undo2 class="w-4 h-4" />
        </button>
        <button
          @click="emit('redo')"
          :disabled="!canRedo"
          title="重做 (Ctrl+Y)"
          class="p-1.5 rounded text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition"
        >
          <Redo2 class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Right: Watermark Toggle & Export CTA -->
    <div class="flex items-center gap-2">
      <!-- Watermark Quick Toggle -->
      <button
        @click="emit('toggleWatermark')"
        title="防盗水印层开关"
        class="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition"
        :class="watermarkEnabled ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-neutral-200'"
      >
        <ShieldCheck class="w-3.5 h-3.5" />
        <span>水印防盗</span>
      </button>

      <!-- Export Button -->
      <button
        @click="emit('openExport')"
        class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition transform active:scale-95"
      >
        <Download class="w-3.5 h-3.5" />
        <span>导出</span>
      </button>
    </div>
  </header>
</template>
