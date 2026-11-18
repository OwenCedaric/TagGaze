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
  <div class="space-y-6 text-xs text-chronicle-secondary">
    <!-- Enable Switch -->
    <div class="p-4 bg-chronicle-surface border border-chronicle-border rounded-xl flex items-center justify-between shadow-xs">
      <div class="flex items-center gap-3">
        <ShieldCheck v-if="watermark.enabled" class="w-5 h-5 text-chronicle-accent" />
        <ShieldAlert v-else class="w-5 h-5 text-chronicle-secondary opacity-50" />
        <div>
          <div class="font-medium text-chronicle-primary font-serif">启用防盗水印</div>
          <div class="text-[10px] text-chronicle-secondary font-light">非破坏性安全图层，保护电商原图版权</div>
        </div>
      </div>
      <button
        @click="emit('updateWatermark', { enabled: !watermark.enabled })"
        class="w-10 h-5 rounded-full transition-colors relative"
        :class="watermark.enabled ? 'bg-chronicle-accent' : 'bg-neutral-200 border border-neutral-300'"
      >
        <span
          class="w-3.5 h-3.5 rounded-full bg-white absolute top-[2px] transition-transform shadow-xs"
          :class="watermark.enabled ? 'left-5' : 'left-1'"
        ></span>
      </button>
    </div>

    <div v-if="watermark.enabled" class="space-y-5 pt-1">
      <!-- Watermark Text -->
      <div>
        <label class="block text-[11px] font-medium text-chronicle-primary mb-1.5 font-serif">
          水印文字 (Watermark Text)
        </label>
        <input
          type="text"
          :value="watermark.text"
          @input="emit('updateWatermark', { text: ($event.target as HTMLInputElement).value })"
          class="w-full bg-white border border-chronicle-border rounded-lg p-2.5 text-chronicle-primary focus:outline-none focus:border-chronicle-accent transition text-xs font-light shadow-xs"
          placeholder="@您的店铺名称 / 严禁盗图"
        />
      </div>

      <!-- Mode (Grid vs Single) -->
      <div>
        <label class="block text-[11px] font-medium text-chronicle-primary mb-1.5 font-serif">
          排布模式 (Layout Pattern)
        </label>
        <div class="grid grid-cols-2 gap-2">
          <button
            @click="emit('updateWatermark', { mode: 'grid' })"
            class="py-2.5 px-3 rounded-lg border text-center font-medium transition shadow-xs"
            :class="watermark.mode === 'grid' ? 'bg-chronicle-accent-light border-chronicle-accent text-chronicle-primary' : 'bg-white border-chronicle-border text-chronicle-secondary hover:bg-chronicle-fill'"
          >
            全图斜向平铺
          </button>
          <button
            @click="emit('updateWatermark', { mode: 'single' })"
            class="py-2.5 px-3 rounded-lg border text-center font-medium transition shadow-xs"
            :class="watermark.mode === 'single' ? 'bg-chronicle-accent-light border-chronicle-accent text-chronicle-primary' : 'bg-white border-chronicle-border text-chronicle-secondary hover:bg-chronicle-fill'"
          >
            单处中心印记
          </button>
        </div>
      </div>

      <!-- Opacity -->
      <div>
        <div class="flex justify-between text-[11px] font-medium text-chronicle-primary mb-1.5 font-serif">
          <span>水印透明度</span>
          <span class="font-mono text-chronicle-accent">{{ Math.round(watermark.opacity * 100) }}%</span>
        </div>
        <input
          type="range"
          min="0.05"
          max="0.8"
          step="0.05"
          :value="watermark.opacity"
          @input="emit('updateWatermark', { opacity: Number(($event.target as HTMLInputElement).value) })"
          class="w-full accent-chronicle-accent"
        />
      </div>

      <!-- Angle -->
      <div>
        <div class="flex justify-between text-[11px] font-medium text-chronicle-primary mb-1.5 font-serif">
          <span>倾斜角度</span>
          <span class="font-mono text-chronicle-accent">{{ watermark.angle }}°</span>
        </div>
        <input
          type="range"
          min="-60"
          max="60"
          step="5"
          :value="watermark.angle"
          @input="emit('updateWatermark', { angle: Number(($event.target as HTMLInputElement).value) })"
          class="w-full accent-chronicle-accent"
        />
      </div>

      <!-- Font Size & Color -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-[11px] font-medium text-chronicle-primary mb-1.5 font-serif">
            水印字号
          </label>
          <input
            type="range"
            min="14"
            max="64"
            :value="watermark.fontSize"
            @input="emit('updateWatermark', { fontSize: Number(($event.target as HTMLInputElement).value) })"
            class="w-full accent-chronicle-accent"
          />
        </div>
        <div>
          <label class="block text-[11px] font-medium text-chronicle-primary mb-1.5 font-serif">
            水印色彩
          </label>
          <div class="flex items-center gap-2">
            <button
              @click="emit('updateWatermark', { color: '#3d4451' })"
              title="墨黑水印"
              class="w-5 h-5 rounded-full border border-chronicle-border bg-[#3d4451]"
            ></button>
            <button
              @click="emit('updateWatermark', { color: '#ffffff' })"
              title="白色水印"
              class="w-5 h-5 rounded-full border border-chronicle-border bg-white shadow-xs"
            ></button>
            <button
              @click="emit('updateWatermark', { color: '#82a1b9' })"
              title="冰川蓝水印"
              class="w-5 h-5 rounded-full border border-chronicle-border bg-[#82a1b9]"
            ></button>
            <input
              type="color"
              :value="watermark.color"
              @input="emit('updateWatermark', { color: ($event.target as HTMLInputElement).value })"
              class="w-full h-7 rounded border border-chronicle-border bg-transparent cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
