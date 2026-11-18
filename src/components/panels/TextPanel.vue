<script setup lang="ts">
import { Pipette, Type, Sparkles, AlignLeft, AlignCenter, AlignRight, Tag, Bookmark, Layers } from 'lucide-vue-next'
import { FONTS, TEXT_TIERS, TEXT_PRESETS, type TextTier } from '@/constants/fonts'
import type { TextElement } from '@/types'

defineProps<{
  activeText: TextElement | null
}>()

const emit = defineEmits<{
  (e: 'addTextTier', tierId: TextTier['id']): void
  (e: 'updateText', partial: Partial<TextElement>): void
  (e: 'applyPreset', preset: typeof TEXT_PRESETS[0]): void
}>()

async function pickColor(target: 'fill' | 'stroke' | 'backgroundColor') {
  if ('EyeDropper' in window) {
    try {
      // @ts-expect-error EyeDropper is experimental
      const eyeDropper = new window.EyeDropper()
      const result = await eyeDropper.open()
      if (result && result.sRGBHex) {
        emit('updateText', { [target]: result.sRGBHex })
      }
    } catch (e) {
      console.log('Eyedropper canceled:', e)
    }
  } else {
    alert('当前浏览器暂不支持原生屏幕吸管工具（推荐 Chrome / Edge）')
  }
}
</script>

<template>
  <div class="space-y-6 text-xs text-chronicle-secondary">
    <!-- Quick Insert by Text Tier (4 种电商核心文本层级) -->
    <div>
      <label class="block text-[11px] font-medium text-chronicle-primary mb-2 font-serif">
        快速添加文字层级 (Text Tiers)
      </label>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="tier in TEXT_TIERS"
          :key="tier.id"
          @click="emit('addTextTier', tier.id)"
          class="p-2.5 rounded-lg border border-chronicle-border hover:border-chronicle-accent hover:bg-chronicle-fill text-left transition flex flex-col justify-between group"
        >
          <div class="flex items-center gap-1.5 font-medium text-chronicle-primary text-xs mb-0.5">
            <Tag v-if="tier.id === 'price'" class="w-3 h-3 text-chronicle-accent" />
            <Bookmark v-else-if="tier.id === 'hero'" class="w-3 h-3 text-chronicle-accent" />
            <Layers v-else class="w-3 h-3 text-chronicle-accent" />
            <span>{{ tier.label }}</span>
          </div>
          <div class="text-[10px] text-chronicle-secondary font-light truncate">
            {{ tier.desc }}
          </div>
        </button>
      </div>
    </div>

    <!-- If an active text element is selected -->
    <div v-if="activeText" class="space-y-5 pt-2 border-t border-chronicle-border">
      <!-- Text content input -->
      <div>
        <label class="block text-[11px] font-medium text-chronicle-primary mb-1.5 font-serif">
          文案内容 (Content)
        </label>
        <textarea
          :value="activeText.text"
          @input="emit('updateText', { text: ($event.target as HTMLTextAreaElement).value })"
          rows="2"
          class="w-full bg-chronicle-surface-raised border border-chronicle-border rounded-lg p-2.5 text-chronicle-primary focus:outline-none focus:border-chronicle-accent transition resize-none text-xs font-light shadow-sm"
          placeholder="输入您的商品文案或规格参数..."
        ></textarea>
      </div>

      <!-- Chronicle Presets -->
      <div>
        <label class="flex items-center gap-1.5 text-[11px] font-medium text-chronicle-primary mb-2 font-serif">
          <Sparkles class="w-3.5 h-3.5 text-chronicle-accent" />
          <span>一键版式预设 (Artistic Presets)</span>
        </label>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="preset in TEXT_PRESETS"
            :key="preset.name"
            @click="emit('applyPreset', preset)"
            class="px-2.5 py-2 rounded-lg border border-chronicle-border hover:bg-chronicle-fill hover:border-chronicle-border-strong text-left transition"
          >
            <div class="font-medium text-chronicle-primary text-[11px] truncate">{{ preset.name }}</div>
          </button>
        </div>
      </div>

      <!-- Font Family -->
      <div>
        <label class="block text-[11px] font-medium text-chronicle-primary mb-1.5 font-serif">
          字体选择 (Typography)
        </label>
        <select
          :value="activeText.fontFamily"
          @change="emit('updateText', { fontFamily: ($event.target as HTMLSelectElement).value })"
          class="w-full bg-chronicle-surface-raised border border-chronicle-border rounded-lg p-2.5 text-chronicle-primary focus:outline-none focus:border-chronicle-accent transition text-xs shadow-sm"
        >
          <option v-for="font in FONTS" :key="font.name" :value="font.family">
            {{ font.name }}
          </option>
        </select>
      </div>

      <!-- Font Size & Align -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-[11px] font-medium text-chronicle-primary mb-1.5 font-serif">
            字号 ({{ activeText.fontSize }}px)
          </label>
          <input
            type="range"
            min="16"
            max="160"
            :value="activeText.fontSize"
            @input="emit('updateText', { fontSize: Number(($event.target as HTMLInputElement).value) })"
            class="w-full accent-chronicle-accent"
          />
        </div>
        <div>
          <label class="block text-[11px] font-medium text-chronicle-primary mb-1.5 font-serif">
            对齐方式
          </label>
          <div class="flex border border-chronicle-border rounded-lg p-0.5 bg-chronicle-surface-raised shadow-sm">
            <button
              @click="emit('updateText', { align: 'left' })"
              :class="activeText.align === 'left' ? 'bg-chronicle-accent text-white font-medium shadow-xs' : 'text-chronicle-secondary'"
              class="flex-1 py-1 rounded flex justify-center transition"
            >
              <AlignLeft class="w-3.5 h-3.5" />
            </button>
            <button
              @click="emit('updateText', { align: 'center' })"
              :class="activeText.align === 'center' ? 'bg-chronicle-accent text-white font-medium shadow-xs' : 'text-chronicle-secondary'"
              class="flex-1 py-1 rounded flex justify-center transition"
            >
              <AlignCenter class="w-3.5 h-3.5" />
            </button>
            <button
              @click="emit('updateText', { align: 'right' })"
              :class="activeText.align === 'right' ? 'bg-chronicle-accent text-white font-medium shadow-xs' : 'text-chronicle-secondary'"
              class="flex-1 py-1 rounded flex justify-center transition"
            >
              <AlignRight class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Color, Background, Stroke Controls -->
      <div class="space-y-3 pt-2 border-t border-chronicle-border">
        <!-- Text Color -->
        <div class="flex items-center justify-between">
          <span class="text-[11px] text-chronicle-primary font-medium">文字色彩</span>
          <div class="flex items-center gap-2">
            <button
              @click="emit('updateText', { fill: '#3d4451' })"
              title="墨黑"
              class="w-5 h-5 rounded-full border border-chronicle-border bg-[#3d4451]"
            ></button>
            <button
              @click="emit('updateText', { fill: '#ffffff' })"
              title="纯白"
              class="w-5 h-5 rounded-full border border-chronicle-border bg-white"
            ></button>
            <button
              @click="emit('updateText', { fill: '#82a1b9' })"
              title="冰川蓝"
              class="w-5 h-5 rounded-full border border-chronicle-border bg-[#82a1b9]"
            ></button>
            <button
              @click="pickColor('fill')"
              title="底图屏幕吸管拾色"
              class="p-1 rounded border border-chronicle-border hover:bg-chronicle-fill text-chronicle-secondary hover:text-chronicle-accent transition ml-1"
            >
              <Pipette class="w-3.5 h-3.5" />
            </button>
            <input
              type="color"
              :value="activeText.fill"
              @input="emit('updateText', { fill: ($event.target as HTMLInputElement).value })"
              class="w-6 h-6 rounded border border-chronicle-border bg-transparent cursor-pointer"
            />
          </div>
        </div>

        <!-- Background Badge Color -->
        <div class="flex items-center justify-between">
          <span class="text-[11px] text-chronicle-primary font-medium">文字底衬色块</span>
          <div class="flex items-center gap-2">
            <button
              v-if="activeText.backgroundColor"
              @click="emit('updateText', { backgroundColor: undefined })"
              class="text-[10px] text-chronicle-secondary hover:text-rose-500 mr-1"
            >
              清除底块
            </button>
            <button
              @click="emit('updateText', { backgroundColor: '#3d4451', backgroundPadding: 14, backgroundRadius: 4 })"
              title="深灰底块"
              class="w-5 h-5 rounded-full border border-chronicle-border bg-[#3d4451]"
            ></button>
            <button
              @click="emit('updateText', { backgroundColor: '#ffffff', backgroundPadding: 14, backgroundRadius: 4 })"
              title="纯白底块"
              class="w-5 h-5 rounded-full border border-chronicle-border bg-white"
            ></button>
            <input
              type="color"
              :value="activeText.backgroundColor || '#ffffff'"
              @input="emit('updateText', { backgroundColor: ($event.target as HTMLInputElement).value, backgroundPadding: 14, backgroundRadius: 4 })"
              class="w-6 h-6 rounded border border-chronicle-border bg-transparent cursor-pointer"
            />
          </div>
        </div>

        <!-- Stroke Width -->
        <div class="flex items-center justify-between">
          <span class="text-[11px] text-chronicle-primary font-medium">清晰描边 ({{ activeText.strokeWidth || 0 }}px)</span>
          <div class="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="14"
              :value="activeText.strokeWidth || 0"
              @input="emit('updateText', { strokeWidth: Number(($event.target as HTMLInputElement).value), stroke: activeText.stroke || '#ffffff' })"
              class="w-20 accent-chronicle-accent"
            />
            <input
              type="color"
              :value="activeText.stroke || '#ffffff'"
              @input="emit('updateText', { stroke: ($event.target as HTMLInputElement).value })"
              class="w-6 h-6 rounded border border-chronicle-border bg-transparent cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty hint if no text selected -->
    <div v-else class="text-center py-8 text-chronicle-secondary font-light">
      <Type class="w-8 h-8 mx-auto mb-2 opacity-30 text-chronicle-accent" />
      <p class="text-xs leading-relaxed">
        点击上方分类直接添加大标题、卖点副标题或价格条，也可在画布上双击任意文字直接编辑
      </p>
    </div>
  </div>
</template>
