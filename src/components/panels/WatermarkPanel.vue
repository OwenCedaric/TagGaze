<script setup lang="ts">
import { ShieldCheck, ShieldAlert } from 'lucide-vue-next'
import type { WatermarkConfig } from '@/types'

defineProps<{
  watermark: WatermarkConfig
}>()

const emit = defineEmits<{
  (e: 'updateWatermark', partial: Partial<WatermarkConfig>): void
}>()
</script>

<template>
  <div class="space-y-5 text-xs text-neutral-300">
    <!-- Enable Switch -->
    <div class="p-3 bg-neutral-800/80 border border-neutral-700 rounded-xl flex items-center justify-between">
      <div class="flex items-center gap-2">
        <ShieldCheck v-if="watermark.enabled" class="w-5 h-5 text-amber-400" />
        <ShieldAlert v-else class="w-5 h-5 text-neutral-500" />
        <div>
          <div class="font-medium text-neutral-200">启用防盗水印</div>
          <div class="text-[10px] text-neutral-500">非破坏性独立安全图层</div>
        </div>
      </div>
      <button
        @click="emit('updateWatermark', { enabled: !watermark.enabled })"
        class="w-11 h-6 rounded-full transition-colors relative"
        :class="watermark.enabled ? 'bg-amber-500' : 'bg-neutral-700'"
      >
        <span
          class="w-4 h-4 rounded-full bg-white absolute top-1 transition-transform"
          :class="watermark.enabled ? 'left-6' : 'left-1'"
        ></span>
      </button>
    </div>

    <div v-if="watermark.enabled" class="space-y-4 pt-1">
      <!-- Watermark Text -->
      <div>
        <label class="block text-[11px] font-semibold text-neutral-400 mb-1.5">水印文案</label>
        <input
          type="text"
          :value="watermark.text"
          @input="emit('updateWatermark', { text: ($event.target as HTMLInputElement).value })"
          class="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500 transition text-xs"
          placeholder="@您的店铺名称 / 严禁盗图"
        />
      </div>

      <!-- Mode (Grid vs Single) -->
      <div>
        <label class="block text-[11px] font-semibold text-neutral-400 mb-1.5">排布模式</label>
        <div class="grid grid-cols-2 gap-2">
          <button
            @click="emit('updateWatermark', { mode: 'grid' })"
            class="py-2 px-3 rounded-lg border text-center font-medium transition"
            :class="watermark.mode === 'grid' ? 'bg-amber-500/15 border-amber-500/50 text-amber-300' : 'bg-neutral-800 border-neutral-700 text-neutral-400'"
          >
            全图斜向平铺防盗
          </button>
          <button
            @click="emit('updateWatermark', { mode: 'single' })"
            class="py-2 px-3 rounded-lg border text-center font-medium transition"
            :class="watermark.mode === 'single' ? 'bg-amber-500/15 border-amber-500/50 text-amber-300' : 'bg-neutral-800 border-neutral-700 text-neutral-400'"
          >
            单处中心水印
          </button>
        </div>
      </div>

      <!-- Opacity -->
      <div>
        <div class="flex justify-between text-[11px] font-semibold text-neutral-400 mb-1.5">
          <span>水印透明度</span>
          <span>{{ Math.round(watermark.opacity * 100) }}%</span>
        </div>
        <input
          type="range"
          min="0.05"
          max="0.8"
          step="0.05"
          :value="watermark.opacity"
          @input="emit('updateWatermark', { opacity: Number(($event.target as HTMLInputElement).value) })"
          class="w-full accent-amber-500"
        />
      </div>

      <!-- Angle -->
      <div>
        <div class="flex justify-between text-[11px] font-semibold text-neutral-400 mb-1.5">
          <span>倾斜角度</span>
          <span>{{ watermark.angle }}°</span>
        </div>
        <input
          type="range"
          min="-60"
          max="60"
          step="5"
          :value="watermark.angle"
          @input="emit('updateWatermark', { angle: Number(($event.target as HTMLInputElement).value) })"
          class="w-full accent-amber-500"
        />
      </div>

      <!-- Font Size & Color -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-[11px] font-semibold text-neutral-400 mb-1.5">字号大小</label>
          <input
            type="range"
            min="14"
            max="64"
            :value="watermark.fontSize"
            @input="emit('updateWatermark', { fontSize: Number(($event.target as HTMLInputElement).value) })"
            class="w-full accent-amber-500"
          />
        </div>
        <div>
          <label class="block text-[11px] font-semibold text-neutral-400 mb-1.5">水印颜色</label>
          <input
            type="color"
            :value="watermark.color"
            @input="emit('updateWatermark', { color: ($event.target as HTMLInputElement).value })"
            class="w-full h-8 rounded border border-neutral-700 bg-transparent cursor-pointer"
          />
        </div>
      </div>
    </div>
  </div>
</template>
