<script setup lang="ts">
import { ref } from 'vue'
import { Upload, Sparkles, Image as ImageIcon, Trash2, Crop, Maximize2 } from 'lucide-vue-next'
import { generateDemoHeroImage } from '@/constants/demoImage'
import type { ImageElement } from '@/types'

defineProps<{
  baseImage: ImageElement | undefined
  canvasBgColor: string
}>()

const emit = defineEmits<{
  (e: 'uploadBaseImage', src: string): void
  (e: 'updateFitMode', mode: 'cover' | 'contain'): void
  (e: 'updateBgColor', color: string): void
  (e: 'removeBaseImage'): void
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    if (event.target?.result) {
      emit('uploadBaseImage', event.target.result as string)
    }
  }
  reader.readAsDataURL(file)
  target.value = ''
}

function handleLoadDemo() {
  const demoUrl = generateDemoHeroImage()
  if (demoUrl) {
    emit('uploadBaseImage', demoUrl)
  }
}
</script>

<template>
  <div class="space-y-6 text-xs text-chronicle-secondary">
    <!-- Hidden File Input -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileSelect"
    />

    <!-- Upload Hero Card -->
    <div class="border border-chronicle-border rounded-xl p-4 bg-chronicle-surface space-y-3 shadow-xs">
      <div class="flex items-center gap-2 text-chronicle-primary font-serif font-semibold text-sm">
        <ImageIcon class="w-4 h-4 text-chronicle-accent" />
        <span>电商底图资产</span>
      </div>

      <p class="text-[11px] leading-relaxed text-chronicle-secondary font-light">
        支持实拍商品图、白底图或 AI 生成图。载入后自动锚定 3:4 黄金画幅，保障主图视觉下限。
      </p>

      <div class="flex flex-col gap-2 pt-1">
        <button
          @click="fileInputRef?.click()"
          class="w-full py-2.5 px-3 rounded-lg bg-chronicle-primary text-white hover:bg-neutral-800 font-medium flex items-center justify-center gap-2 transition active:scale-[0.99] shadow-xs"
        >
          <Upload class="w-3.5 h-3.5" />
          <span>{{ baseImage ? '更换本地图片文件' : '选取本地图片文件' }}</span>
        </button>

        <button
          @click="handleLoadDemo"
          class="w-full py-2 px-3 rounded-lg border border-chronicle-border bg-white hover:bg-chronicle-fill text-chronicle-primary font-medium flex items-center justify-center gap-1.5 transition text-[11px] shadow-xs"
        >
          <Sparkles class="w-3 h-3 text-chronicle-accent" />
          <span>载入预置商品图 (快速体验)</span>
        </button>
      </div>
    </div>

    <!-- Active Base Image Controls -->
    <div v-if="baseImage" class="space-y-4 pt-1">
      <!-- Fit Mode (Cover vs Contain) -->
      <div>
        <label class="block text-[11px] font-medium text-chronicle-primary mb-2 font-serif">
          画幅适配策略 (3:4 Ratio)
        </label>
        <div class="grid grid-cols-2 gap-2">
          <button
            @click="emit('updateFitMode', 'cover')"
            class="py-2.5 px-3 rounded-lg border text-center font-medium flex flex-col items-center gap-1 transition shadow-xs"
            :class="(baseImage.fitMode || 'cover') === 'cover' ? 'bg-chronicle-accent-light border-chronicle-accent text-chronicle-primary' : 'bg-white border-chronicle-border hover:bg-chronicle-fill text-chronicle-secondary'"
          >
            <Crop class="w-4 h-4 text-chronicle-accent" />
            <span class="text-[11px]">裁剪铺满 (Cover)</span>
            <span class="text-[9px] text-chronicle-secondary opacity-75">无黑边，视觉饱满</span>
          </button>

          <button
            @click="emit('updateFitMode', 'contain')"
            class="py-2.5 px-3 rounded-lg border text-center font-medium flex flex-col items-center gap-1 transition shadow-xs"
            :class="baseImage.fitMode === 'contain' ? 'bg-chronicle-accent-light border-chronicle-accent text-chronicle-primary' : 'bg-white border-chronicle-border hover:bg-chronicle-fill text-chronicle-secondary'"
          >
            <Maximize2 class="w-4 h-4 text-chronicle-accent" />
            <span class="text-[11px]">完整容纳 (Contain)</span>
            <span class="text-[9px] text-chronicle-secondary opacity-75">全图保留，两侧留白</span>
          </button>
        </div>
      </div>

      <!-- Canvas Background Fill for Contain Mode -->
      <div class="border-t border-chronicle-border pt-4 flex items-center justify-between">
        <div>
          <div class="text-[11px] font-medium text-chronicle-primary">画布衬底色彩</div>
          <div class="text-[10px] text-chronicle-secondary">留白区域背景颜色</div>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="emit('updateBgColor', '#ffffff')"
            title="纯白衬底"
            class="w-5 h-5 rounded-full border border-chronicle-border bg-white shadow-xs"
          ></button>
          <button
            @click="emit('updateBgColor', '#fbf9f6')"
            title="Chronicle 浅雅色"
            class="w-5 h-5 rounded-full border border-chronicle-border bg-[#fbf9f6] shadow-xs"
          ></button>
          <button
            @click="emit('updateBgColor', '#3d4451')"
            title="墨灰衬底"
            class="w-5 h-5 rounded-full border border-chronicle-border bg-[#3d4451] shadow-xs"
          ></button>
          <input
            type="color"
            :value="canvasBgColor"
            @input="emit('updateBgColor', ($event.target as HTMLInputElement).value)"
            class="w-6 h-6 rounded border border-chronicle-border bg-transparent cursor-pointer ml-1"
          />
        </div>
      </div>

      <!-- Remove Base Image -->
      <div class="pt-3 border-t border-chronicle-border">
        <button
          @click="emit('removeBaseImage')"
          class="w-full py-2 rounded-lg border border-chronicle-border hover:border-chronicle-border-strong bg-white text-chronicle-secondary hover:text-rose-600 flex items-center justify-center gap-1.5 transition text-[11px] shadow-xs"
        >
          <Trash2 class="w-3.5 h-3.5" />
          <span>清除当前底图</span>
        </button>
      </div>
    </div>
  </div>
</template>
