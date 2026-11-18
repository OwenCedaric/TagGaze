<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from 'lucide-vue-next'
import { SVG_ASSETS } from '@/constants/assets'
import type { SvgElement } from '@/types'

defineProps<{
  activeSvg: SvgElement | null
}>()

const emit = defineEmits<{
  (e: 'addSvg', svgContent: string, defaultFill: string): void
  (e: 'uploadLogo', src: string): void
  (e: 'updateSvgColor', fill: string): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)

function handleFileUpload(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    if (event.target?.result) {
      emit('uploadLogo', event.target.result as string)
    }
  }
  reader.readAsDataURL(file)
  target.value = ''
}
</script>

<template>
  <div class="space-y-5 text-xs text-neutral-300">
    <!-- Custom Logo / Sticker Upload -->
    <div>
      <input
        ref="fileInput"
        type="file"
        accept="image/png,image/svg+xml,image/webp"
        class="hidden"
        @change="handleFileUpload"
      />
      <button
        @click="fileInput?.click()"
        class="w-full py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-neutral-200 font-medium flex items-center justify-center gap-2 transition active:scale-[0.98]"
      >
        <Upload class="w-4 h-4 text-brand-400" />
        <span>上传店铺 Logo / 品牌贴图</span>
      </button>
      <p class="text-[10px] text-neutral-500 text-center mt-1">推荐使用透明背景 PNG 或 SVG 格式</p>
    </div>

    <!-- Active SVG Color Picker (if selected) -->
    <div v-if="activeSvg" class="p-3 bg-neutral-800/80 border border-neutral-700/80 rounded-xl space-y-2">
      <div class="flex items-center justify-between">
        <span class="font-medium text-neutral-200">当前徽章颜色</span>
        <input
          type="color"
          :value="activeSvg.fill"
          @input="emit('updateSvgColor', ($event.target as HTMLInputElement).value)"
          class="w-7 h-7 rounded border border-neutral-700 bg-transparent cursor-pointer"
        />
      </div>
    </div>

    <!-- Built-in eCommerce Assets -->
    <div>
      <label class="block text-[11px] font-semibold text-neutral-400 mb-2">电商高转化信任徽章 & 标签</label>
      <div class="grid grid-cols-2 gap-2.5">
        <button
          v-for="asset in SVG_ASSETS"
          :key="asset.id"
          @click="emit('addSvg', asset.svg, asset.defaultFill)"
          class="p-3 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/70 hover:border-brand-500/50 flex flex-col items-center justify-center gap-2 transition group"
        >
          <div
            class="w-12 h-12 flex items-center justify-center text-neutral-300 group-hover:scale-110 transition"
            :style="{ color: asset.defaultFill }"
            v-html="asset.svg"
          ></div>
          <span class="text-[11px] text-neutral-400 group-hover:text-neutral-200 font-medium text-center">
            {{ asset.name }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
