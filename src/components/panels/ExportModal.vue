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
  quality: 0.85,
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
    class="fixed inset-0 bg-neutral-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in select-none"
    @click.self="emit('close')"
  >
    <div class="bg-white border border-chronicle-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-6 text-chronicle-secondary">
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-chronicle-border pb-3.5">
        <div class="flex items-center gap-2">
          <h3 class="text-sm font-serif font-bold text-chronicle-primary">
            画质压缩与导出
          </h3>
          <span class="text-[10px] font-mono text-chronicle-accent px-1.5 py-0.5 rounded border border-chronicle-border bg-chronicle-fill">
            3:4 商业画幅
          </span>
        </div>
        <button
          @click="emit('close')"
          class="p-1 rounded-lg text-chronicle-secondary hover:text-chronicle-primary hover:bg-chronicle-fill transition"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Format Selection -->
      <div class="space-y-2">
        <label class="block text-xs font-serif font-medium text-chronicle-primary">输出格式规范</label>
        <div class="grid grid-cols-3 gap-2">
          <button
            @click="options.format = 'image/jpeg'"
            class="py-2.5 px-2 rounded-xl border text-center transition shadow-xs"
            :class="options.format === 'image/jpeg' ? 'bg-chronicle-accent-light border-chronicle-accent text-chronicle-primary font-medium' : 'border-chronicle-border text-chronicle-secondary hover:bg-chronicle-fill'"
          >
            <div class="text-xs font-medium">JPG</div>
            <div class="text-[9px] opacity-75">电商强兼容</div>
          </button>
          <button
            @click="options.format = 'image/webp'"
            class="py-2.5 px-2 rounded-xl border text-center transition shadow-xs"
            :class="options.format === 'image/webp' ? 'bg-chronicle-accent-light border-chronicle-accent text-chronicle-primary font-medium' : 'border-chronicle-border text-chronicle-secondary hover:bg-chronicle-fill'"
          >
            <div class="text-xs font-medium">WebP</div>
            <div class="text-[9px] opacity-75">极小文件体积</div>
          </button>
          <button
            @click="options.format = 'image/png'"
            class="py-2.5 px-2 rounded-xl border text-center transition shadow-xs"
            :class="options.format === 'image/png' ? 'bg-chronicle-accent-light border-chronicle-accent text-chronicle-primary font-medium' : 'border-chronicle-border text-chronicle-secondary hover:bg-chronicle-fill'"
          >
            <div class="text-xs font-medium">PNG</div>
            <div class="text-[9px] opacity-75">保留透明图层</div>
          </button>
        </div>
      </div>

      <!-- Resolution Scale -->
      <div class="space-y-2">
        <label class="block text-xs font-serif font-medium text-chronicle-primary">分辨率输出倍率</label>
        <div class="grid grid-cols-2 gap-2">
          <button
            @click="options.scale = 1"
            class="py-2 px-3 rounded-xl border text-center transition text-xs shadow-xs"
            :class="options.scale === 1 ? 'bg-chronicle-accent-light border-chronicle-accent text-chronicle-primary font-medium' : 'border-chronicle-border text-chronicle-secondary hover:bg-chronicle-fill'"
          >
            1x 标准 (1200 × 1600)
          </button>
          <button
            @click="options.scale = 2"
            class="py-2 px-3 rounded-xl border text-center transition text-xs shadow-xs"
            :class="options.scale === 2 ? 'bg-chronicle-accent-light border-chronicle-accent text-chronicle-primary font-medium' : 'border-chronicle-border text-chronicle-secondary hover:bg-chronicle-fill'"
          >
            2x 超清 (2400 × 3200)
          </button>
        </div>
      </div>

      <!-- Quality Slider & Estimated Size -->
      <div v-if="options.format !== 'image/png'" class="space-y-3 bg-chronicle-surface p-3.5 rounded-xl border border-chronicle-border shadow-xs">
        <div class="flex items-center justify-between text-xs">
          <span class="text-chronicle-primary font-medium font-serif">导出压缩质量 ({{ Math.round(options.quality * 100) }}%)</span>
          <span class="text-chronicle-accent font-mono text-[11px] font-medium">
            <span v-if="isEstimating" class="animate-pulse">实时计算中...</span>
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
          class="w-full accent-chronicle-accent"
        />

        <!-- Smart Auto-Fit Target Size -->
        <div class="pt-2 border-t border-chronicle-border flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5 text-[11px] text-chronicle-secondary">
            <Sparkles class="w-3.5 h-3.5 text-chronicle-accent" />
            <span>目标体积限额:</span>
            <input
              type="number"
              v-model.number="targetInputKb"
              class="w-16 bg-white border border-chronicle-border rounded px-1.5 py-0.5 text-chronicle-primary font-mono text-center text-xs shadow-xs"
            />
            <span>KB</span>
          </div>

          <button
            @click="emit('autoFitTarget', targetInputKb)"
            class="px-2.5 py-1 rounded-lg border border-chronicle-border bg-white hover:bg-chronicle-fill text-chronicle-primary text-[11px] font-medium transition shadow-xs"
          >
            二分智能达标
          </button>
        </div>
      </div>

      <!-- Export CTA Button -->
      <button
        @click="emit('download')"
        :disabled="isExporting"
        class="w-full py-3 rounded-xl bg-chronicle-primary text-white hover:bg-neutral-800 font-medium text-xs shadow-md flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50"
      >
        <Download class="w-4 h-4" />
        <span>{{ isExporting ? '正在生成高质图像...' : '下载并保存主图' }}</span>
      </button>
    </div>
  </div>
</template>
