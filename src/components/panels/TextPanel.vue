<script setup lang="ts">
import { ref } from 'vue'
import {
  Pipette,
  Type,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Tag,
  Bookmark,
  Layers,
  Zap,
  Highlighter,
  ChevronDown,
  ChevronUp,
  Plus
} from 'lucide-vue-next'
import { FONTS, TEXT_TIERS, TEXT_PRESETS, PROMO_BENEFIT_PRESETS, type TextTier, type PromoBenefitPreset } from '@/constants/fonts'
import type { TextElement } from '@/types'

defineProps<{
  activeText: TextElement | null
}>()

const emit = defineEmits<{
  (e: 'addTextTier', tierId: TextTier['id']): void
  (e: 'addPromoBenefit', preset: PromoBenefitPreset): void
  (e: 'updateText', partial: Partial<TextElement>): void
  (e: 'applyPreset', preset: typeof TEXT_PRESETS[0]): void
}>()

const showAddMore = ref(false)

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
    <!-- MODE 1: When an active text element is selected (Prioritize Text Editing) -->
    <div v-if="activeText" class="space-y-5">
      <!-- Active Text Header Pill -->
      <div class="flex items-center justify-between pb-2 border-b border-chronicle-border">
        <div class="flex items-center gap-1.5 font-medium text-chronicle-primary text-xs">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>正在编辑文本图层</span>
        </div>
        <span class="text-[10px] text-chronicle-secondary font-mono opacity-80">
          {{ activeText.fontSize }}px · {{ activeText.fontFamily.split(',')[0].replace(/'/g, '') }}
        </span>
      </div>

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

      <!-- Font Size, Align & Letter Spacing -->
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

      <!-- Letter Spacing (社媒/电商高级排版字间距) -->
      <div>
        <div class="flex items-center justify-between mb-1">
          <label class="text-[11px] font-medium text-chronicle-primary font-serif">
            字间距 (Letter Spacing: {{ activeText.letterSpacing || 0 }}px)
          </label>
          <span class="text-[10px] text-chronicle-secondary font-light">
            {{ (activeText.letterSpacing || 0) > 8 ? '大标题开阔' : (activeText.letterSpacing || 0) > 2 ? '优雅杂志感' : '标准' }}
          </span>
        </div>
        <input
          type="range"
          min="-2"
          max="24"
          step="0.5"
          :value="activeText.letterSpacing || 0"
          @input="emit('updateText', { letterSpacing: Number(($event.target as HTMLInputElement).value) })"
          class="w-full accent-chronicle-accent"
        />
      </div>

      <!-- Color, Background, Stroke, Shadow Controls -->
      <div class="space-y-3.5 pt-3 border-t border-chronicle-border">
        <!-- Text Color with High-Conversion Swatches -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-[11px] text-chronicle-primary font-medium">文字色彩</span>
            <div class="flex items-center gap-1.5">
              <button
                @click="pickColor('fill')"
                title="底图屏幕吸管拾色"
                class="p-1 rounded border border-chronicle-border hover:bg-chronicle-fill text-chronicle-secondary hover:text-chronicle-accent transition"
              >
                <Pipette class="w-3 h-3" />
              </button>
              <input
                type="color"
                :value="activeText.fill"
                @input="emit('updateText', { fill: ($event.target as HTMLInputElement).value })"
                class="w-5 h-5 rounded border border-chronicle-border bg-transparent cursor-pointer"
              />
            </div>
          </div>
          <!-- E-Commerce Quick Color Swatches -->
          <div class="flex items-center gap-1.5">
            <button
              @click="emit('updateText', { fill: '#e11d48' })"
              title="大促红 #e11d48"
              class="w-5 h-5 rounded-full border border-chronicle-border bg-[#e11d48] hover:scale-110 transition shadow-xs"
            ></button>
            <button
              @click="emit('updateText', { fill: '#f59e0b' })"
              title="活力橙 #f59e0b"
              class="w-5 h-5 rounded-full border border-chronicle-border bg-[#f59e0b] hover:scale-110 transition shadow-xs"
            ></button>
            <button
              @click="emit('updateText', { fill: '#10b981' })"
              title="自然绿 #10b981"
              class="w-5 h-5 rounded-full border border-chronicle-border bg-[#10b981] hover:scale-110 transition shadow-xs"
            ></button>
            <button
              @click="emit('updateText', { fill: '#82a1b9' })"
              title="冰川蓝 #82a1b9"
              class="w-5 h-5 rounded-full border border-chronicle-border bg-[#82a1b9] hover:scale-110 transition shadow-xs"
            ></button>
            <button
              @click="emit('updateText', { fill: '#3d4451' })"
              title="墨黑 #3d4451"
              class="w-5 h-5 rounded-full border border-chronicle-border bg-[#3d4451] hover:scale-110 transition shadow-xs"
            ></button>
            <button
              @click="emit('updateText', { fill: '#ffffff' })"
              title="纯白 #ffffff"
              class="w-5 h-5 rounded-full border border-chronicle-border bg-white hover:scale-110 transition shadow-xs"
            ></button>
          </div>
        </div>

        <!-- Background Badge Color & Padding -->
        <div class="space-y-2 pt-2 border-t border-chronicle-border/60">
          <div class="flex items-center justify-between">
            <span class="text-[11px] text-chronicle-primary font-medium">底衬色块 (Card Pill)</span>
            <div class="flex items-center gap-1.5">
              <button
                v-if="activeText.backgroundColor"
                @click="emit('updateText', { backgroundColor: undefined })"
                class="text-[10px] text-chronicle-secondary hover:text-rose-500 mr-1"
              >
                清除底块
              </button>
              <button
                @click="emit('updateText', { backgroundColor: '#e11d48', backgroundPadding: activeText.backgroundPadding || 14, backgroundRadius: activeText.backgroundRadius || 6, fill: '#ffffff' })"
                title="大促红底"
                class="w-4 h-4 rounded-full border border-chronicle-border bg-[#e11d48]"
              ></button>
              <button
                @click="emit('updateText', { backgroundColor: '#3d4451', backgroundPadding: activeText.backgroundPadding || 14, backgroundRadius: activeText.backgroundRadius || 6, fill: '#ffffff' })"
                title="深灰底"
                class="w-4 h-4 rounded-full border border-chronicle-border bg-[#3d4451]"
              ></button>
              <button
                @click="emit('updateText', { backgroundColor: '#ffffff', backgroundPadding: activeText.backgroundPadding || 14, backgroundRadius: activeText.backgroundRadius || 6, fill: '#3d4451' })"
                title="纯白底"
                class="w-4 h-4 rounded-full border border-chronicle-border bg-white"
              ></button>
              <input
                type="color"
                :value="activeText.backgroundColor || '#ffffff'"
                @input="emit('updateText', { backgroundColor: ($event.target as HTMLInputElement).value, backgroundPadding: activeText.backgroundPadding || 14, backgroundRadius: activeText.backgroundRadius || 6 })"
                class="w-5 h-5 rounded border border-chronicle-border bg-transparent cursor-pointer"
              />
            </div>
          </div>

          <!-- If background color exists, expose padding & radius sliders -->
          <div v-if="activeText.backgroundColor" class="grid grid-cols-2 gap-2 bg-chronicle-fill p-2 rounded-lg border border-chronicle-border">
            <div>
              <label class="block text-[10px] text-chronicle-secondary font-light mb-1">
                内边距 ({{ activeText.backgroundPadding || 14 }}px)
              </label>
              <input
                type="range"
                min="4"
                max="36"
                :value="activeText.backgroundPadding || 14"
                @input="emit('updateText', { backgroundPadding: Number(($event.target as HTMLInputElement).value) })"
                class="w-full accent-chronicle-accent"
              />
            </div>
            <div>
              <label class="block text-[10px] text-chronicle-secondary font-light mb-1">
                圆角 ({{ activeText.backgroundRadius || 4 }}px)
              </label>
              <input
                type="range"
                min="0"
                max="32"
                :value="activeText.backgroundRadius || 4"
                @input="emit('updateText', { backgroundRadius: Number(($event.target as HTMLInputElement).value) })"
                class="w-full accent-chronicle-accent"
              />
            </div>
          </div>
        </div>

        <!-- Drop Shadow Protection Layer (防图片背景干扰发光/阴影) -->
        <div class="space-y-2 pt-2 border-t border-chronicle-border/60">
          <div class="flex items-center justify-between">
            <span class="text-[11px] text-chronicle-primary font-medium">防遮挡阴影 (Shadow / Glow)</span>
            <div class="flex items-center gap-1.5">
              <button
                v-if="activeText.shadowColor"
                @click="emit('updateText', { shadowColor: undefined, shadowBlur: 0, shadowOffsetY: 0 })"
                class="text-[10px] text-chronicle-secondary hover:text-rose-500 mr-1"
              >
                清除阴影
              </button>
              <button
                @click="emit('updateText', { shadowColor: 'rgba(0,0,0,0.65)', shadowBlur: 10, shadowOffsetY: 3 })"
                title="黑色柔和阴影"
                class="px-1.5 py-0.5 rounded border border-chronicle-border bg-black text-white text-[9px]"
              >
                黑影
              </button>
              <button
                @click="emit('updateText', { shadowColor: 'rgba(255,255,255,0.9)', shadowBlur: 12, shadowOffsetY: 0 })"
                title="白色抗暗底外发光"
                class="px-1.5 py-0.5 rounded border border-chronicle-border bg-white text-neutral-800 text-[9px]"
              >
                白光
              </button>
              <input
                type="color"
                :value="activeText.shadowColor ? '#000000' : '#ffffff'"
                @input="emit('updateText', { shadowColor: ($event.target as HTMLInputElement).value, shadowBlur: activeText.shadowBlur || 8, shadowOffsetY: activeText.shadowOffsetY || 2 })"
                class="w-5 h-5 rounded border border-chronicle-border bg-transparent cursor-pointer"
              />
            </div>
          </div>

          <div v-if="activeText.shadowColor" class="grid grid-cols-2 gap-2 bg-chronicle-fill p-2 rounded-lg border border-chronicle-border">
            <div>
              <label class="block text-[10px] text-chronicle-secondary font-light mb-1">
                模糊半径 ({{ activeText.shadowBlur || 0 }}px)
              </label>
              <input
                type="range"
                min="0"
                max="36"
                :value="activeText.shadowBlur || 0"
                @input="emit('updateText', { shadowBlur: Number(($event.target as HTMLInputElement).value) })"
                class="w-full accent-chronicle-accent"
              />
            </div>
            <div>
              <label class="block text-[10px] text-chronicle-secondary font-light mb-1">
                垂直位移 ({{ activeText.shadowOffsetY || 0 }}px)
              </label>
              <input
                type="range"
                min="0"
                max="24"
                :value="activeText.shadowOffsetY || 0"
                @input="emit('updateText', { shadowOffsetY: Number(($event.target as HTMLInputElement).value) })"
                class="w-full accent-chronicle-accent"
              />
            </div>
          </div>
        </div>

        <!-- Stroke Width & Color -->
        <div class="space-y-1.5 pt-2 border-t border-chronicle-border/60">
          <div class="flex items-center justify-between">
            <span class="text-[11px] text-chronicle-primary font-medium">清晰描边 ({{ activeText.strokeWidth || 0 }}px)</span>
            <div class="flex items-center gap-2">
              <button
                v-if="activeText.strokeWidth"
                @click="emit('updateText', { strokeWidth: 0, stroke: undefined })"
                class="text-[10px] text-chronicle-secondary hover:text-rose-500 mr-1"
              >
                清除描边
              </button>
              <input
                type="range"
                min="0"
                max="16"
                :value="activeText.strokeWidth || 0"
                @input="emit('updateText', { strokeWidth: Number(($event.target as HTMLInputElement).value), stroke: activeText.stroke || '#ffffff' })"
                class="w-20 accent-chronicle-accent"
              />
              <input
                type="color"
                :value="activeText.stroke || '#ffffff'"
                @input="emit('updateText', { stroke: ($event.target as HTMLInputElement).value })"
                class="w-5 h-5 rounded border border-chronicle-border bg-transparent cursor-pointer"
              />
            </div>
          </div>
        </div>

        <!-- Keyword Highlight (重点词高光 / 马克笔手绘涂抹强调) -->
        <div class="space-y-2 pt-2 border-t border-chronicle-border/60">
          <div class="flex items-center justify-between">
            <span class="flex items-center gap-1.5 text-[11px] text-chronicle-primary font-medium">
              <Highlighter class="w-3.5 h-3.5 text-chronicle-accent" />
              <span>重点词高光强调 (Highlight)</span>
            </span>
            <button
              v-if="activeText.highlightKeyword"
              @click="emit('updateText', { highlightKeyword: undefined })"
              class="text-[10px] text-chronicle-secondary hover:text-rose-500"
            >
              清除高光
            </button>
          </div>

          <div class="space-y-2 bg-chronicle-fill p-2.5 rounded-lg border border-chronicle-border">
            <input
              type="text"
              :value="activeText.highlightKeyword || ''"
              @input="emit('updateText', { highlightKeyword: ($event.target as HTMLInputElement).value })"
              placeholder="输入要高光的字词 (如: 买一赠一、第二代)..."
              class="w-full bg-white border border-chronicle-border rounded-md px-2.5 py-1.5 text-xs text-chronicle-primary focus:outline-none focus:border-chronicle-accent shadow-xs"
            />

            <div v-if="activeText.highlightKeyword" class="space-y-2 pt-1">
              <div class="flex items-center justify-between text-[10px]">
                <span class="text-chronicle-secondary">强调形态</span>
                <div class="flex items-center border border-chronicle-border rounded bg-white p-0.5 shadow-xs">
                  <button
                    @click="emit('updateText', { highlightMode: 'marker' })"
                    :class="(activeText.highlightMode || 'marker') === 'marker' ? 'bg-chronicle-accent text-white font-medium' : 'text-chronicle-secondary'"
                    class="px-2 py-0.5 rounded text-[9px] transition"
                  >
                    马克笔高光
                  </button>
                  <button
                    @click="emit('updateText', { highlightMode: 'badge' })"
                    :class="activeText.highlightMode === 'badge' ? 'bg-chronicle-accent text-white font-medium' : 'text-chronicle-secondary'"
                    class="px-2 py-0.5 rounded text-[9px] transition"
                  >
                    实心小胶囊
                  </button>
                </div>
              </div>

              <!-- Color swatches -->
              <div class="flex items-center justify-between text-[10px]">
                <span class="text-chronicle-secondary">高光色彩</span>
                <div class="flex items-center gap-1.5">
                  <button
                    @click="emit('updateText', { highlightColor: 'rgba(254, 240, 138, 0.85)' })"
                    title="柠檬黄马克笔"
                    class="w-4 h-4 rounded-full border border-chronicle-border bg-[#fef08a]"
                  ></button>
                  <button
                    @click="emit('updateText', { highlightColor: 'rgba(245, 158, 11, 0.45)' })"
                    title="活力橙高光"
                    class="w-4 h-4 rounded-full border border-chronicle-border bg-[#f59e0b]"
                  ></button>
                  <button
                    @click="emit('updateText', { highlightColor: 'rgba(244, 63, 94, 0.4)' })"
                    title="大促粉红高光"
                    class="w-4 h-4 rounded-full border border-chronicle-border bg-[#f43f5e]"
                  ></button>
                  <button
                    @click="emit('updateText', { highlightColor: 'rgba(130, 161, 185, 0.45)' })"
                    title="冰川蓝高光"
                    class="w-4 h-4 rounded-full border border-chronicle-border bg-[#82a1b9]"
                  ></button>
                  <input
                    type="color"
                    :value="'#fef08a'"
                    @input="emit('updateText', { highlightColor: ($event.target as HTMLInputElement).value })"
                    class="w-4 h-4 rounded border border-chronicle-border bg-transparent cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Secondary Collapsible: Add More Text / Capsules while an element is active -->
      <div class="pt-4 border-t border-chronicle-border">
        <button
          @click="showAddMore = !showAddMore"
          class="w-full flex items-center justify-between py-2 px-3 rounded-lg border border-chronicle-border bg-chronicle-fill hover:bg-white text-chronicle-primary transition text-xs font-medium"
        >
          <span class="flex items-center gap-1.5">
            <Plus class="w-3.5 h-3.5 text-chronicle-accent" />
            <span>添加新文字层级或营销胶囊</span>
          </span>
          <ChevronUp v-if="showAddMore" class="w-3.5 h-3.5 text-chronicle-secondary" />
          <ChevronDown v-else class="w-3.5 h-3.5 text-chronicle-secondary" />
        </button>

        <div v-if="showAddMore" class="mt-4 space-y-5">
          <!-- Text Tiers inside collapsible -->
          <div>
            <label class="block text-[11px] font-medium text-chronicle-primary mb-2 font-serif">
              文字层级 (Text Tiers)
            </label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="tier in TEXT_TIERS"
                :key="tier.id"
                @click="emit('addTextTier', tier.id)"
                class="p-2.5 rounded-lg border border-chronicle-border hover:border-chronicle-accent hover:bg-white text-left transition flex flex-col justify-between group bg-white/70"
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

          <!-- Promo Benefit Capsules inside collapsible -->
          <div>
            <label class="block text-[11px] font-medium text-chronicle-primary mb-2 font-serif">
              营销利益胶囊 (Benefit Capsules)
            </label>
            <div class="grid grid-cols-3 gap-1.5">
              <button
                v-for="benefit in PROMO_BENEFIT_PRESETS"
                :key="benefit.id"
                @click="emit('addPromoBenefit', benefit)"
                class="py-2 px-2 rounded-lg border border-chronicle-border bg-white hover:border-chronicle-accent hover:shadow-xs text-left transition flex flex-col justify-between group"
              >
                <span
                  class="text-[9px] px-1.5 py-0.5 rounded font-bold text-white w-fit mb-1 truncate max-w-full"
                  :style="{ backgroundColor: benefit.backgroundColor }"
                >
                  {{ benefit.badgeText }}
                </span>
                <span class="text-[10px] text-chronicle-primary font-medium truncate">
                  {{ benefit.title }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODE 2: When NO text element is selected (Prominently Showcase Insertion) -->
    <div v-else class="space-y-6">
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
            class="p-2.5 rounded-lg border border-chronicle-border hover:border-chronicle-accent hover:bg-chronicle-fill text-left transition flex flex-col justify-between group bg-white shadow-xs"
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

      <!-- High-Conversion Marketing Promo Benefit Capsules (高转化营销利益胶囊 - 杜绝货币符号) -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="flex items-center gap-1.5 text-[11px] font-medium text-chronicle-primary font-serif">
            <Zap class="w-3.5 h-3.5 text-chronicle-accent" />
            <span>营销利益胶囊 (Benefit Capsules)</span>
          </label>
          <span class="text-[9px] text-chronicle-secondary font-light">平台规范 · 零货币符号</span>
        </div>

        <div class="grid grid-cols-3 gap-1.5">
          <button
            v-for="benefit in PROMO_BENEFIT_PRESETS"
            :key="benefit.id"
            @click="emit('addPromoBenefit', benefit)"
            class="py-2 px-2 rounded-lg border border-chronicle-border bg-white hover:border-chronicle-accent hover:shadow-xs text-left transition flex flex-col justify-between group shadow-xs"
          >
            <span
              class="text-[9px] px-1.5 py-0.5 rounded font-bold text-white w-fit mb-1 truncate max-w-full"
              :style="{ backgroundColor: benefit.backgroundColor }"
            >
              {{ benefit.badgeText }}
            </span>
            <span class="text-[10px] text-chronicle-primary font-medium truncate">
              {{ benefit.title }}
            </span>
          </button>
        </div>
      </div>

      <!-- Friendly guidance card -->
      <div class="p-4 rounded-xl border border-chronicle-border bg-chronicle-fill/40 text-center space-y-1.5">
        <Type class="w-6 h-6 mx-auto text-chronicle-accent/70 mb-1" />
        <div class="text-xs font-medium text-chronicle-primary font-serif">文字编辑与排版微调</div>
        <p class="text-[11px] text-chronicle-secondary font-light leading-relaxed">
          点击上方卡片添加大标题、利益点或副标题；在画布上点击任意文字图层即可在此处微调字号、色彩、底块与马克笔重点词高光。
        </p>
      </div>
    </div>
  </div>
</template>
