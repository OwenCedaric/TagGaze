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
  <div class="space-y-6 text-xs text-chronicle-secondary">
    <!-- Custom Logo Upload Card -->
    <div class="border border-chronicle-border rounded-xl p-4 bg-chronicle-surface space-y-2 shadow-xs">
      <input
        ref="fileInput"
        type="file"
        accept="image/png,image/svg+xml,image/webp"
        class="hidden"
        @change="handleFileUpload"
      />
      <button
        @click="fileInput?.click()"
        class="w-full py-2.5 px-3 rounded-lg border border-chronicle-border bg-white hover:bg-chronicle-fill text-chronicle-primary font-medium flex items-center justify-center gap-2 transition active:scale-[0.99] shadow-xs"
      >
        <Upload class="w-3.5 h-3.5 text-chronicle-accent" />
        <span>上传店铺 Logo / 品牌贴图</span>
      </button>
      <p class="text-[10px] text-chronicle-secondary text-center font-light">
        支持透明背景 PNG 或矢量 SVG 格式，可任意拖拽与缩放
      </p>
    </div>

    <!-- Active SVG Color Picker (if selected) -->
    <div v-if="activeSvg" class="p-3 bg-white border border-chronicle-border rounded-xl flex items-center justify-between shadow-xs">
      <span class="font-medium text-chronicle-primary">当前徽章色彩</span>
      <div class="flex items-center gap-2">
        <button
          @click="emit('updateSvgColor', '#3d4451')"
          title="墨灰色"
          class="w-5 h-5 rounded-full border border-chronicle-border bg-[#3d4451]"
        ></button>
        <button
          @click="emit('updateSvgColor', '#82a1b9')"
          title="冰川蓝"
          class="w-5 h-5 rounded-full border border-chronicle-border bg-[#82a1b9]"
        ></button>
        <button
          @click="emit('updateSvgColor', '#ffffff')"
          title="纯白"
          class="w-5 h-5 rounded-full border border-chronicle-border bg-white shadow-xs"
        ></button>
        <input
          type="color"
          :value="activeSvg.fill"
          @input="emit('updateSvgColor', ($event.target as HTMLInputElement).value)"
          class="w-6 h-6 rounded border border-chronicle-border bg-transparent cursor-pointer ml-1"
        />
      </div>
    </div>

    <!-- Built-in eCommerce Assets -->
    <div>
      <label class="block text-[11px] font-medium text-chronicle-primary mb-3 font-serif">
        商业信任徽章与指示标识
      </label>
      <div class="grid grid-cols-2 gap-2.5">
        <button
          v-for="asset in SVG_ASSETS"
          :key="asset.id"
          @click="emit('addSvg', asset.svg, asset.defaultFill)"
          class="p-3.5 rounded-xl border border-chronicle-border bg-white hover:border-chronicle-accent hover:bg-chronicle-fill flex flex-col items-center justify-center gap-2.5 transition group shadow-xs"
        >
          <div
            class="w-10 h-10 flex items-center justify-center text-chronicle-primary group-hover:scale-105 transition"
            :style="{ color: asset.defaultFill }"
            v-html="asset.svg"
          ></div>
          <span class="text-[11px] text-chronicle-secondary group-hover:text-chronicle-primary font-light text-center">
            {{ asset.name }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
