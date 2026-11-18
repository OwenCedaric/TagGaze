<script setup lang="ts">
import { Plus, Pipette, Type, Sparkles, AlignLeft, AlignCenter, AlignRight } from 'lucide-vue-next'
import { FONTS, TEXT_PRESETS } from '@/constants/fonts'
import type { TextElement } from '@/types'

defineProps<{
  activeText: TextElement | null
}>()

const emit = defineEmits<{
  (e: 'addText'): void
  (e: 'updateText', partial: Partial<TextElement>): void
  (e: 'applyPreset', preset: typeof TEXT_PRESETS[0]): void
}>()

// Native Eyedropper API
async function pickColor(target: 'fill' | 'stroke' | 'backgroundColor') {
  if ('EyeDropper' in window) {
    try {
      // @ts-expect-error EyeDropper is experimental in some TS libs
      const eyeDropper = new window.EyeDropper()
      const result = await eyeDropper.open()
      if (result && result.sRGBHex) {
        emit('updateText', { [target]: result.sRGBHex })
      }
    } catch (e) {
      console.log('Eyedropper canceled or failed:', e)
    }
  } else {
    alert('当前浏览器暂不支持原生屏幕吸管工具（推荐 Chrome / Edge）')
  }
}
</script>

<template>
  <div class="space-y-5 text-xs text-neutral-300">
    <!-- Add Text CTA -->
    <button
      @click="emit('addText')"
      class="w-full py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-brand-600/25 transition active:scale-[0.98]"
    >
      <Plus class="w-4 h-4" />
      <span>添加营销文案</span>
    </button>

    <!-- If an active text element is selected -->
    <div v-if="activeText" class="space-y-4 pt-2">
      <!-- Text content input -->
      <div>
        <label class="block text-[11px] font-semibold text-neutral-400 mb-1.5">文案内容</label>
        <textarea
          :value="activeText.text"
          @input="emit('updateText', { text: ($event.target as HTMLTextAreaElement).value })"
          rows="2"
          class="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-white focus:outline-none focus:border-brand-500 transition resize-none text-xs"
          placeholder="输入您的营销文案..."
        ></textarea>
      </div>

      <!-- Quick Artistic Presets -->
      <div>
        <label class="flex items-center gap-1 text-[11px] font-semibold text-neutral-400 mb-2">
          <Sparkles class="w-3.5 h-3.5 text-amber-400" />
          <span>一键电商视觉预设</span>
        </label>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="preset in TEXT_PRESETS"
            :key="preset.name"
            @click="emit('applyPreset', preset)"
            class="px-2.5 py-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-750 border border-neutral-700/80 text-left transition"
          >
            <div class="font-medium text-neutral-200 text-[11px] truncate">{{ preset.name }}</div>
          </button>
        </div>
      </div>

      <!-- Font Family -->
      <div>
        <label class="block text-[11px] font-semibold text-neutral-400 mb-1.5">字体选择 (Google Fonts / 开源)</label>
        <select
          :value="activeText.fontFamily"
          @change="emit('updateText', { fontFamily: ($event.target as HTMLSelectElement).value })"
          class="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-white focus:outline-none focus:border-brand-500 transition"
        >
          <option v-for="font in FONTS" :key="font.name" :value="font.family">
            {{ font.name }}
          </option>
        </select>
      </div>

      <!-- Font Size & Align -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-[11px] font-semibold text-neutral-400 mb-1.5">字号大小 ({{ activeText.fontSize }}px)</label>
          <input
            type="range"
            min="18"
            max="180"
            :value="activeText.fontSize"
            @input="emit('updateText', { fontSize: Number(($event.target as HTMLInputElement).value) })"
            class="w-full accent-brand-500"
          />
        </div>
        <div>
          <label class="block text-[11px] font-semibold text-neutral-400 mb-1.5">文本对齐</label>
          <div class="flex bg-neutral-800 rounded-lg p-1 border border-neutral-700">
            <button
              @click="emit('updateText', { align: 'left' })"
              :class="activeText.align === 'left' ? 'bg-brand-500/20 text-brand-300' : 'text-neutral-400 hover:text-white'"
              class="flex-1 py-1 rounded flex justify-center transition"
            >
              <AlignLeft class="w-3.5 h-3.5" />
            </button>
            <button
              @click="emit('updateText', { align: 'center' })"
              :class="activeText.align === 'center' ? 'bg-brand-500/20 text-brand-300' : 'text-neutral-400 hover:text-white'"
              class="flex-1 py-1 rounded flex justify-center transition"
            >
              <AlignCenter class="w-3.5 h-3.5" />
            </button>
            <button
              @click="emit('updateText', { align: 'right' })"
              :class="activeText.align === 'right' ? 'bg-brand-500/20 text-brand-300' : 'text-neutral-400 hover:text-white'"
              class="flex-1 py-1 rounded flex justify-center transition"
            >
              <AlignRight class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Colors & Eyedropper -->
      <div class="space-y-3 pt-1 border-t border-neutral-800">
        <!-- Text Color -->
        <div class="flex items-center justify-between">
          <span class="text-[11px] text-neutral-400">文字颜色</span>
          <div class="flex items-center gap-2">
            <button
              @click="pickColor('fill')"
              title="底图屏幕吸管拾色"
              class="p-1 rounded bg-neutral-800 hover:bg-neutral-750 text-neutral-300 hover:text-brand-300 border border-neutral-700 transition"
            >
              <Pipette class="w-3.5 h-3.5" />
            </button>
            <input
              type="color"
              :value="activeText.fill"
              @input="emit('updateText', { fill: ($event.target as HTMLInputElement).value })"
              class="w-7 h-7 rounded border border-neutral-700 bg-transparent cursor-pointer"
            />
          </div>
        </div>

        <!-- Background Badge Color -->
        <div class="flex items-center justify-between">
          <span class="text-[11px] text-neutral-400">文字底板色块</span>
          <div class="flex items-center gap-2">
            <button
              v-if="activeText.backgroundColor"
              @click="emit('updateText', { backgroundColor: undefined })"
              class="text-[10px] text-neutral-500 hover:text-rose-400"
            >
              清除
            </button>
            <input
              type="color"
              :value="activeText.backgroundColor || '#000000'"
              @input="emit('updateText', { backgroundColor: ($event.target as HTMLInputElement).value, backgroundPadding: 12, backgroundRadius: 6 })"
              class="w-7 h-7 rounded border border-neutral-700 bg-transparent cursor-pointer"
            />
          </div>
        </div>

        <!-- Stroke Color & Width -->
        <div class="flex items-center justify-between">
          <span class="text-[11px] text-neutral-400">清晰描边 ({{ activeText.strokeWidth || 0 }}px)</span>
          <div class="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="16"
              :value="activeText.strokeWidth || 0"
              @input="emit('updateText', { strokeWidth: Number(($event.target as HTMLInputElement).value), stroke: activeText.stroke || '#000000' })"
              class="w-20 accent-brand-500"
            />
            <input
              type="color"
              :value="activeText.stroke || '#000000'"
              @input="emit('updateText', { stroke: ($event.target as HTMLInputElement).value })"
              class="w-6 h-6 rounded border border-neutral-700 bg-transparent cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty hint if no text selected -->
    <div v-else class="text-center py-8 text-neutral-500 text-xs">
      <Type class="w-8 h-8 mx-auto mb-2 opacity-40" />
      <p>点击上方按钮添加文字，或点击画布中的文本进行编辑与微调</p>
    </div>
  </div>
</template>
