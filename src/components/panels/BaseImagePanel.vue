<script setup lang="ts">
import { ref } from 'vue'
import {
  Upload,
  Sparkles,
  Image as ImageIcon,
  Trash2,
  Crop,
  Maximize2,
  Sun,
  Contrast as ContrastIcon,
  Droplet,
  RotateCcw,
  Wand2,
  Square,
  Columns,
  Rows
} from 'lucide-vue-next'
import type { ImageElement, SplitConfig } from '@/types'

defineProps<{
  baseImage: ImageElement | undefined
  canvasBgColor: string
  splitConfig?: SplitConfig
}>()

const emit = defineEmits<{
  (e: 'uploadBaseImage', src: string): void
  (e: 'loadDemo'): void
  (e: 'updateFitMode', mode: 'cover' | 'contain'): void
  (e: 'updateBgColor', color: string): void
  (e: 'removeBaseImage'): void
  (e: 'updateFilters', filters: Partial<{ brightness: number, contrast: number, saturation: number }>): void
  (e: 'updateSplitConfig', partial: Partial<SplitConfig>): void
  (e: 'setSplitImage', slot: 'A' | 'B', src: string): void
  (e: 'loadDemoSplit'): void
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const fileInputARef = ref<HTMLInputElement | null>(null)
const fileInputBRef = ref<HTMLInputElement | null>(null)

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

function handleSplitFileSelect(e: Event, slot: 'A' | 'B') {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    if (event.target?.result) {
      emit('setSplitImage', slot, event.target.result as string)
    }
  }
  reader.readAsDataURL(file)
  target.value = ''
}

function handleLoadDemo() {
  emit('loadDemo')
}
</script>

<template>
  <div class="space-y-5 text-xs text-chronicle-secondary">
    <!-- Hidden File Inputs -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileSelect"
    />
    <input
      ref="fileInputARef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleSplitFileSelect($event, 'A')"
    />
    <input
      ref="fileInputBRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleSplitFileSelect($event, 'B')"
    />

    <!-- 1. Layout Mode Switcher (单图铺满 vs 双图左右对比 vs 上下对比) -->
    <div class="space-y-2">
      <div class="flex items-center justify-between text-[11px] font-medium text-chronicle-primary font-serif">
        <span>画布构图分屏模式</span>
        <span class="text-[10px] text-chronicle-accent font-normal font-sans">电商对比神级构图</span>
      </div>

      <div class="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-chronicle-surface border border-chronicle-border shadow-xs">
        <button
          @click="emit('updateSplitConfig', { mode: 'single' })"
          class="py-2 px-1.5 rounded-lg flex flex-col items-center gap-1 transition"
          :class="(!splitConfig || splitConfig.mode === 'single') ? 'bg-white border border-chronicle-border text-chronicle-primary font-medium shadow-xs' : 'text-chronicle-secondary hover:text-chronicle-primary hover:bg-white/50'"
        >
          <Square class="w-3.5 h-3.5" :class="(!splitConfig || splitConfig.mode === 'single') ? 'text-chronicle-accent' : ''" />
          <span class="text-[10px]">单图铺满</span>
        </button>

        <button
          @click="emit('updateSplitConfig', { mode: 'split-vertical' })"
          class="py-2 px-1.5 rounded-lg flex flex-col items-center gap-1 transition"
          :class="splitConfig?.mode === 'split-vertical' ? 'bg-white border border-chronicle-border text-chronicle-primary font-medium shadow-xs' : 'text-chronicle-secondary hover:text-chronicle-primary hover:bg-white/50'"
        >
          <Columns class="w-3.5 h-3.5" :class="splitConfig?.mode === 'split-vertical' ? 'text-chronicle-accent' : ''" />
          <span class="text-[10px]">左右对比</span>
        </button>

        <button
          @click="emit('updateSplitConfig', { mode: 'split-horizontal' })"
          class="py-2 px-1.5 rounded-lg flex flex-col items-center gap-1 transition"
          :class="splitConfig?.mode === 'split-horizontal' ? 'bg-white border border-chronicle-border text-chronicle-primary font-medium shadow-xs' : 'text-chronicle-secondary hover:text-chronicle-primary hover:bg-white/50'"
        >
          <Rows class="w-3.5 h-3.5" :class="splitConfig?.mode === 'split-horizontal' ? 'text-chronicle-accent' : ''" />
          <span class="text-[10px]">上下对比</span>
        </button>
      </div>
    </div>

    <!-- ===================== A. SPLIT SCREEN COLLAGE CONTROLS ===================== -->
    <div v-if="splitConfig && splitConfig.mode !== 'single'" class="space-y-4 pt-1">
      <!-- Quick Demo Split Loader Card -->
      <div class="border border-chronicle-border rounded-xl p-3 bg-chronicle-surface space-y-2 shadow-xs">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5 text-chronicle-primary font-serif font-semibold text-xs">
            <Sparkles class="w-3.5 h-3.5 text-chronicle-accent" />
            <span>双图对比智能拼图</span>
          </div>
          <button
            @click="emit('loadDemoSplit')"
            class="px-2.5 py-1 rounded-md bg-white border border-chronicle-border hover:bg-chronicle-fill text-[10px] text-chronicle-accent font-medium transition shadow-xs"
          >
            载入实拍示例
          </button>
        </div>
        <p class="text-[10px] text-chronicle-secondary font-light leading-relaxed">
          完美适用于美妆护肤前后对比、洗护去渍对比、材质微距对比。支持独立上传两个槽位与居中 VS 徽标。
        </p>
      </div>

      <!-- Dual Slot Upload Cards -->
      <div class="space-y-2.5">
        <!-- Slot A -->
        <div class="p-3 bg-white border border-chronicle-border rounded-xl space-y-2 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="font-medium text-chronicle-primary text-[11px]">
              {{ splitConfig.mode === 'split-vertical' ? '槽位 A · 左侧原图 (Before)' : '槽位 A · 上方原图 (Before)' }}
            </span>
            <span v-if="splitConfig.imageA" class="text-[9px] px-1.5 py-0.5 rounded bg-chronicle-accent-light text-chronicle-primary font-mono border border-chronicle-accent/30">已载入</span>
            <span v-else class="text-[9px] px-1.5 py-0.5 rounded bg-chronicle-fill text-chronicle-secondary font-mono border border-chronicle-border/60">待上传</span>
          </div>

          <div v-if="splitConfig.imageA" class="flex items-center gap-2.5">
            <img
              :src="splitConfig.imageA"
              class="w-16 h-16 rounded-lg object-cover border border-chronicle-border shrink-0"
              alt="Slot A preview"
            />
            <div class="flex-1 space-y-1.5">
              <button
                @click="fileInputARef?.click()"
                class="w-full py-1.5 px-2 rounded-lg border border-chronicle-border hover:bg-chronicle-fill text-[10px] text-chronicle-primary font-medium flex items-center justify-center gap-1 transition shadow-xs"
              >
                <Upload class="w-3 h-3 text-chronicle-accent" />
                <span>更换图片 A</span>
              </button>
              <button
                @click="emit('setSplitImage', 'A', '')"
                class="w-full py-1 px-2 rounded-lg hover:bg-rose-50 text-[10px] text-rose-500 flex items-center justify-center gap-1 transition"
              >
                <Trash2 class="w-3 h-3" />
                <span>移除</span>
              </button>
            </div>
          </div>

          <div v-else>
            <button
              @click="fileInputARef?.click()"
              class="w-full py-3 px-3 rounded-lg border-2 border-dashed border-chronicle-border hover:border-chronicle-accent bg-chronicle-surface hover:bg-white text-chronicle-primary font-medium flex items-center justify-center gap-2 transition shadow-xs"
            >
              <Upload class="w-3.5 h-3.5 text-chronicle-accent" />
              <span>上传对比前图片 (Slot A)</span>
            </button>
          </div>
        </div>

        <!-- Slot B -->
        <div class="p-3 bg-white border border-chronicle-border rounded-xl space-y-2 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="font-medium text-chronicle-primary text-[11px]">
              {{ splitConfig.mode === 'split-vertical' ? '槽位 B · 右侧效果图 (After)' : '槽位 B · 下方效果图 (After)' }}
            </span>
            <span v-if="splitConfig.imageB" class="text-[9px] px-1.5 py-0.5 rounded bg-chronicle-accent-light text-chronicle-primary font-mono border border-chronicle-accent/30">已载入</span>
            <span v-else class="text-[9px] px-1.5 py-0.5 rounded bg-chronicle-fill text-chronicle-secondary font-mono border border-chronicle-border/60">待上传</span>
          </div>

          <div v-if="splitConfig.imageB" class="flex items-center gap-2.5">
            <img
              :src="splitConfig.imageB"
              class="w-16 h-16 rounded-lg object-cover border border-chronicle-border shrink-0"
              alt="Slot B preview"
            />
            <div class="flex-1 space-y-1.5">
              <button
                @click="fileInputBRef?.click()"
                class="w-full py-1.5 px-2 rounded-lg border border-chronicle-border hover:bg-chronicle-fill text-[10px] text-chronicle-primary font-medium flex items-center justify-center gap-1 transition shadow-xs"
              >
                <Upload class="w-3 h-3 text-chronicle-accent" />
                <span>更换图片 B</span>
              </button>
              <button
                @click="emit('setSplitImage', 'B', '')"
                class="w-full py-1 px-2 rounded-lg hover:bg-rose-50 text-[10px] text-rose-500 flex items-center justify-center gap-1 transition"
              >
                <Trash2 class="w-3 h-3" />
                <span>移除</span>
              </button>
            </div>
          </div>

          <div v-else>
            <button
              @click="fileInputBRef?.click()"
              class="w-full py-3 px-3 rounded-lg border-2 border-dashed border-chronicle-border hover:border-chronicle-accent bg-chronicle-surface hover:bg-white text-chronicle-primary font-medium flex items-center justify-center gap-2 transition shadow-xs"
            >
              <Upload class="w-3.5 h-3.5 text-chronicle-accent" />
              <span>上传对比后图片 (Slot B)</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Split Ratio Slider -->
      <div class="p-3 bg-white border border-chronicle-border rounded-xl space-y-2 shadow-xs">
        <div class="flex items-center justify-between text-[11px]">
          <span class="font-medium text-chronicle-primary">分屏占比调节</span>
          <span class="font-mono text-chronicle-accent font-medium">
            {{ Math.round((splitConfig.ratio || 0.5) * 100) }}% : {{ 100 - Math.round((splitConfig.ratio || 0.5) * 100) }}%
          </span>
        </div>
        <input
          type="range"
          min="30"
          max="70"
          step="1"
          :value="Math.round((splitConfig.ratio || 0.5) * 100)"
          @input="emit('updateSplitConfig', { ratio: Number(($event.target as HTMLInputElement).value) / 100 })"
          class="w-full accent-chronicle-accent"
        />
        <div class="flex justify-between text-[9px] text-chronicle-secondary opacity-60">
          <span>A: 30%</span>
          <span>对半 50:50</span>
          <span>A: 70%</span>
        </div>
      </div>

      <!-- Divider Line Styling -->
      <div class="p-3 bg-white border border-chronicle-border rounded-xl space-y-3 shadow-xs">
        <div class="flex items-center justify-between text-[11px] font-medium text-chronicle-primary">
          <span>分割线样式</span>
          <span class="text-[10px] text-chronicle-secondary font-normal font-sans">粗细与色彩</span>
        </div>

        <!-- Width Options -->
        <div class="grid grid-cols-4 gap-1">
          <button
            v-for="w in [0, 2, 4, 8]"
            :key="w"
            @click="emit('updateSplitConfig', { dividerWidth: w })"
            class="py-1 px-1.5 rounded-lg border text-center text-[10px] transition"
            :class="(splitConfig.dividerWidth !== undefined ? splitConfig.dividerWidth : 4) === w ? 'bg-chronicle-accent-light border-chronicle-accent text-chronicle-primary font-medium' : 'bg-white border-chronicle-border text-chronicle-secondary hover:bg-chronicle-fill'"
          >
            {{ w === 0 ? '无缝' : `${w}px` }}
          </button>
        </div>

        <!-- Color Options -->
        <div class="flex items-center justify-between pt-1">
          <span class="text-[10px] text-chronicle-secondary">线条颜色</span>
          <div class="flex items-center gap-1.5">
            <button
              @click="emit('updateSplitConfig', { dividerColor: '#ffffff' })"
              title="纯白分割线"
              class="w-5 h-5 rounded-full border border-chronicle-border bg-white shadow-xs"
            ></button>
            <button
              @click="emit('updateSplitConfig', { dividerColor: '#3d4451' })"
              title="墨灰分割线"
              class="w-5 h-5 rounded-full border border-chronicle-border bg-[#3d4451] shadow-xs"
            ></button>
            <button
              @click="emit('updateSplitConfig', { dividerColor: '#82a1b9' })"
              title="冰川蓝分割线"
              class="w-5 h-5 rounded-full border border-chronicle-border bg-[#82a1b9] shadow-xs"
            ></button>
            <input
              type="color"
              :value="splitConfig.dividerColor || '#ffffff'"
              @input="emit('updateSplitConfig', { dividerColor: ($event.target as HTMLInputElement).value })"
              class="w-5 h-5 rounded border border-chronicle-border bg-transparent cursor-pointer ml-1"
            />
          </div>
        </div>
      </div>

      <!-- Contrast Badges (VS / Before-After / Compare) -->
      <div class="p-3 bg-white border border-chronicle-border rounded-xl space-y-2.5 shadow-xs">
        <div class="flex items-center justify-between text-[11px] font-medium text-chronicle-primary">
          <span>中心对比徽标</span>
          <span class="text-[10px] text-chronicle-accent font-normal font-sans">强化对比辨识</span>
        </div>

        <div class="grid grid-cols-2 gap-1.5">
          <button
            @click="emit('updateSplitConfig', { badge: 'none' })"
            class="py-2 px-2 rounded-lg border text-[10px] transition text-center"
            :class="(splitConfig.badge || 'none') === 'none' ? 'bg-chronicle-accent-light border-chronicle-accent text-chronicle-primary font-medium' : 'bg-white border-chronicle-border text-chronicle-secondary hover:bg-chronicle-fill'"
          >
            无徽标 (纯净)
          </button>

          <button
            @click="emit('updateSplitConfig', { badge: 'vs' })"
            class="py-2 px-2 rounded-lg border text-[10px] transition text-center flex items-center justify-center gap-1"
            :class="splitConfig.badge === 'vs' ? 'bg-chronicle-accent-light border-chronicle-accent text-chronicle-primary font-medium' : 'bg-white border-chronicle-border text-chronicle-secondary hover:bg-chronicle-fill'"
          >
            <span class="font-bold text-chronicle-accent">VS</span>
            <span>圆形对比标</span>
          </button>

          <button
            @click="emit('updateSplitConfig', { badge: 'before-after' })"
            class="py-2 px-2 rounded-lg border text-[10px] transition text-center"
            :class="splitConfig.badge === 'before-after' ? 'bg-chronicle-accent-light border-chronicle-accent text-chronicle-primary font-medium' : 'bg-white border-chronicle-border text-chronicle-secondary hover:bg-chronicle-fill'"
          >
            BEFORE / AFTER
          </button>

          <button
            @click="emit('updateSplitConfig', { badge: 'compare' })"
            class="py-2 px-2 rounded-lg border text-[10px] transition text-center"
            :class="splitConfig.badge === 'compare' ? 'bg-chronicle-accent-light border-chronicle-accent text-chronicle-primary font-medium' : 'bg-white border-chronicle-border text-chronicle-secondary hover:bg-chronicle-fill'"
          >
            实拍对比 标签
          </button>
        </div>
      </div>
    </div>

    <!-- ===================== B. SINGLE BASE IMAGE CONTROLS ===================== -->
    <div v-else class="space-y-4">
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

        <!-- Product Shot Enhancements (商品实拍画质精修) -->
        <div class="border-t border-chronicle-border pt-4 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5 font-serif font-medium text-[11px] text-chronicle-primary">
              <Wand2 class="w-3.5 h-3.5 text-chronicle-accent" />
              <span>商品图画质精修 (Filters)</span>
            </div>
            <button
              v-if="(baseImage.brightness || 0) !== 0 || (baseImage.contrast || 0) !== 0 || (baseImage.saturation || 0) !== 0"
              @click="emit('updateFilters', { brightness: 0, contrast: 0, saturation: 0 })"
              class="flex items-center gap-1 text-[10px] text-chronicle-secondary hover:text-rose-500 transition"
            >
              <RotateCcw class="w-3 h-3" />
              <span>重置</span>
            </button>
          </div>

          <!-- Quick 1-Click Optimization Presets -->
          <div class="grid grid-cols-3 gap-1.5">
            <button
              @click="emit('updateFilters', { brightness: 14, contrast: 20, saturation: 4 })"
              title="解决白底发灰发黄，强化轮廓反差"
              class="py-1.5 px-2 rounded-lg border border-chronicle-border bg-white hover:bg-chronicle-fill text-[10px] text-chronicle-primary font-medium flex flex-col items-center gap-0.5 transition shadow-xs"
            >
              <span class="text-chronicle-accent font-bold">白底增白</span>
              <span class="text-[8px] text-chronicle-secondary opacity-80">去灰提亮</span>
            </button>

            <button
              @click="emit('updateFilters', { brightness: 8, contrast: 16, saturation: 28 })"
              title="提升色彩鲜艳度，适合美妆、食品、服饰"
              class="py-1.5 px-2 rounded-lg border border-chronicle-border bg-white hover:bg-chronicle-fill text-[10px] text-chronicle-primary font-medium flex flex-col items-center gap-0.5 transition shadow-xs"
            >
              <span class="text-rose-600 font-bold">通透鲜艳</span>
              <span class="text-[8px] text-chronicle-secondary opacity-80">美妆/食品</span>
            </button>

            <button
              @click="emit('updateFilters', { brightness: -2, contrast: 28, saturation: -6 })"
              title="强化明暗层次，适合家电、数码、箱包"
              class="py-1.5 px-2 rounded-lg border border-chronicle-border bg-white hover:bg-chronicle-fill text-[10px] text-chronicle-primary font-medium flex flex-col items-center gap-0.5 transition shadow-xs"
            >
              <span class="text-chronicle-primary font-bold">硬朗质感</span>
              <span class="text-[8px] text-chronicle-secondary opacity-80">数码/硬核</span>
            </button>
          </div>

          <!-- Sliders -->
          <div class="space-y-2.5 bg-chronicle-surface p-2.5 rounded-lg border border-chronicle-border/70 text-[10px]">
            <!-- Brightness -->
            <div>
              <div class="flex items-center justify-between text-chronicle-secondary mb-1">
                <span class="flex items-center gap-1">
                  <Sun class="w-3 h-3 text-chronicle-accent" />
                  <span>亮度 ({{ baseImage.brightness || 0 }})</span>
                </span>
                <span class="opacity-70">{{ (baseImage.brightness || 0) > 0 ? '+提亮' : (baseImage.brightness || 0) < 0 ? '-压暗' : '标准' }}</span>
              </div>
              <input
                type="range"
                min="-80"
                max="80"
                :value="baseImage.brightness || 0"
                @input="emit('updateFilters', { brightness: Number(($event.target as HTMLInputElement).value) })"
                class="w-full accent-chronicle-accent"
              />
            </div>

            <!-- Contrast -->
            <div>
              <div class="flex items-center justify-between text-chronicle-secondary mb-1">
                <span class="flex items-center gap-1">
                  <ContrastIcon class="w-3 h-3 text-chronicle-accent" />
                  <span>对比度 ({{ baseImage.contrast || 0 }})</span>
                </span>
                <span class="opacity-70">{{ (baseImage.contrast || 0) > 0 ? '+鲜明' : (baseImage.contrast || 0) < 0 ? '-柔和' : '标准' }}</span>
              </div>
              <input
                type="range"
                min="-80"
                max="80"
                :value="baseImage.contrast || 0"
                @input="emit('updateFilters', { contrast: Number(($event.target as HTMLInputElement).value) })"
                class="w-full accent-chronicle-accent"
              />
            </div>

            <!-- Saturation -->
            <div>
              <div class="flex items-center justify-between text-chronicle-secondary mb-1">
                <span class="flex items-center gap-1">
                  <Droplet class="w-3 h-3 text-chronicle-accent" />
                  <span>色彩饱和度 ({{ baseImage.saturation || 0 }})</span>
                </span>
                <span class="opacity-70">{{ (baseImage.saturation || 0) > 0 ? '+浓郁' : (baseImage.saturation || 0) < 0 ? '-素雅' : '标准' }}</span>
              </div>
              <input
                type="range"
                min="-80"
                max="80"
                :value="baseImage.saturation || 0"
                @input="emit('updateFilters', { saturation: Number(($event.target as HTMLInputElement).value) })"
                class="w-full accent-chronicle-accent"
              />
            </div>
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
  </div>
</template>
