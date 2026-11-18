<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { X, Download, Sparkles } from 'lucide-vue-next'
import type { ExportOptions } from '@/types'

defineProps<{
  isOpen: boolean
  estimatedSizeKb: number | null
  isEstimating: boolean
  isExporting: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'changeOptions', options: ExportOptions): void
  (e: 'autoFitTarget', targetKb: number): void
  (e: 'download'): void
}>()

const options = ref<ExportOptions>({
  format: 'image/jpeg',
  quality: 0.82,
  scale: 1
})

const targetInputKb = ref(500)

watch(
  options,
  (val) => {
    emit('changeOptions', { ...val })
  },
  { deep: true }
)

onMounted(() => {
  emit('changeOptions', { ...options.value })
})
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in"
    @click.self="emit('close')"
  >
    <div class="bg-neutral-900 border border-neutral-750 w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-5 text-neutral-200">
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-neutral-800 pb-3">
        <h3 class="text-sm font-bold text-white flex items-center gap-1.5">
          <span>导出与画质压缩设置</span>
          <span class="text-[10px] font-medium bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
            3:4 竖屏输出
          </span>
        </h3>
        <button
          @click="emit('close')"
          class="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Format Selection -->
      <div class="space-y-1.5">
        <label class="block text-xs font-semibold text-neutral-400">输出格式</label>
        <div class="grid grid-cols-3 gap-2">
          <button
            @click="options.format = 'image/jpeg'"
            class="py-2 px-2.5 rounded-xl border text-center transition"
            :class="options.format === 'image/jpeg' ? 'bg-brand-500/15 border-brand-500 text-brand-300 font-semibold' : 'bg-neutral-800/80 border-neutral-700 text-neutral-400'"
          >
            <div class="text-xs">JPG</div>
            <div class="text-[10px] opacity-75">电商强兼容</div>
          </button>
          <button
            @click="options.format = 'image/webp'"
            class="py-2 px-2.5 rounded-xl border text-center transition"
            :class="options.format === 'image/webp' ? 'bg-brand-500/15 border-brand-500 text-brand-300 font-semibold' : 'bg-neutral-800/80 border-neutral-700 text-neutral-400'"
          >
            <div class="text-xs">WebP</div>
            <div class="text-[10px] opacity-75">体积极致精简</div>
          </button>
          <button
            @click="options.format = 'image/png'"
            class="py-2 px-2.5 rounded-xl border text-center transition"
            :class="options.format === 'image/png' ? 'bg-brand-500/15 border-brand-500 text-brand-300 font-semibold' : 'bg-neutral-800/80 border-neutral-700 text-neutral-400'"
          >
            <div class="text-xs">PNG</div>
            <div class="text-[10px] opacity-75">无损透明通道</div>
          </button>
        </div>
      </div>

      <!-- Resolution Scale -->
      <div class="space-y-1.5">
        <label class="block text-xs font-semibold text-neutral-400">清晰度倍率</label>
        <div class="grid grid-cols-2 gap-2">
          <button
            @click="options.scale = 1"
            class="py-2 px-3 rounded-xl border text-center transition text-xs font-medium"
            :class="options.scale === 1 ? 'bg-brand-500/15 border-brand-500 text-brand-300' : 'bg-neutral-800 border-neutral-700 text-neutral-400'"
          >
            1x 标准 (1200×1600)
          </button>
          <button
            @click="options.scale = 2"
            class="py-2 px-3 rounded-xl border text-center transition text-xs font-medium"
            :class="options.scale === 2 ? 'bg-brand-500/15 border-brand-500 text-brand-300' : 'bg-neutral-800 border-neutral-700 text-neutral-400'"
          >
            2x 超清印刷 (2400×3200)
          </button>
        </div>
      </div>

      <!-- Quality Slider & Estimated Size -->
      <div v-if="options.format !== 'image/png'" class="space-y-2 bg-neutral-850 p-3.5 rounded-xl border border-neutral-800">
        <div class="flex items-center justify-between text-xs font-medium">
          <span class="text-neutral-400">导出画质质量 ({{ Math.round(options.quality * 100) }}%)</span>
          <span class="text-brand-300 font-mono">
            <span v-if="isEstimating" class="animate-pulse">计算中...</span>
            <span v-else-if="estimatedSizeKb">预估约 {{ estimatedSizeKb }} KB</span>
            <span v-else>--</span>
          </span>
        </div>

        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.02"
          v-model.number="options.quality"
          class="w-full accent-brand-500"
        />

        <!-- Smart Auto-Fit Target Size -->
        <div class="pt-2 border-t border-neutral-800 flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5 text-[11px] text-neutral-400">
            <Sparkles class="w-3.5 h-3.5 text-amber-400" />
            <span>目标限额:</span>
            <input
              type="number"
              v-model.number="targetInputKb"
              class="w-16 bg-neutral-800 border border-neutral-700 rounded px-1.5 py-0.5 text-white font-mono text-center text-xs"
            />
            <span>KB</span>
          </div>

          <button
            @click="emit('autoFitTarget', targetInputKb)"
            class="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-neutral-300 hover:text-white text-[11px] font-medium transition"
          >
            一键智能达标
          </button>
        </div>
      </div>

      <!-- Export CTA -->
      <button
        @click="emit('download')"
        :disabled="isExporting"
        class="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50"
      >
        <Download class="w-4 h-4" />
        <span>{{ isExporting ? '正在生成高质图片...' : '下载并保存图片' }}</span>
      </button>
    </div>
  </div>
</template>
