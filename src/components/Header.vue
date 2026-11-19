<script setup lang="ts">
import { ref } from 'vue'
import {
  Undo2,
  Redo2,
  Download,
  ShieldCheck,
  Upload,
  ChevronDown,
  Grid3X3,
  Check,
  Magnet,
  FolderOpen,
  Save,
  FileArchive,
  Smartphone,
  Video,
  Crosshair,
  EyeOff
} from 'lucide-vue-next'
import { CANVAS_PRESETS } from '@/constants/presets'
import type { CanvasDimensions, GuideOverlayType } from '@/types'

defineProps<{
  currentPreset: CanvasDimensions
  canUndo: boolean
  canRedo: boolean
  watermarkEnabled: boolean
  hasBaseImage: boolean
  guideOverlay: GuideOverlayType
  enableSnapping?: boolean
}>()

const emit = defineEmits<{
  (e: 'changePreset', preset: CanvasDimensions): void
  (e: 'undo'): void
  (e: 'redo'): void
  (e: 'toggleWatermark'): void
  (e: 'changeGuideOverlay', mode: GuideOverlayType): void
  (e: 'openExport'): void
  (e: 'triggerUpload'): void
  (e: 'toggleSnapping'): void
  (e: 'saveProject'): void
  (e: 'openProjectFile', file: File): void
  (e: 'openBatch'): void
}>()

const isPresetsOpen = ref(false)
const isGuidesOpen = ref(false)
const projectFileInputRef = ref<HTMLInputElement | null>(null)

function handleProjectFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('openProjectFile', file)
  }
  target.value = ''
}

const GUIDE_OPTIONS = [
  { id: 'none', label: '关闭参考线', desc: '纯净画布编辑', icon: EyeOff },
  { id: 'xhs', label: '小红书 3:4 避让安全区', desc: '避让顶部状态栏与底部描述/赞藏区', icon: Smartphone },
  { id: 'video916', label: '短视频 9:16 避让安全区', desc: '避让右侧互动按钮与底部音乐区', icon: Video },
  { id: 'thirds', label: '三分构图法则 (3×3)', desc: '经典摄影视觉焦点辅助网格', icon: Grid3X3 },
  { id: 'center', label: '中心对称十字参考线', desc: '画面绝对中心定位与对称参考', icon: Crosshair }
] as const
</script>

<template>
  <header class="h-14 border-b border-chronicle-border bg-chronicle-surface-raised/90 backdrop-blur-md px-3 sm:px-4 md:px-6 flex items-center justify-between shrink-0 z-30 select-none shadow-xs gap-2">
    <!-- Left: Brand / Title in Serif Polarity -->
    <div class="flex items-center gap-2 sm:gap-3 shrink-0">
      <div class="w-7 h-7 rounded border border-chronicle-border bg-chronicle-fill flex items-center justify-center text-chronicle-accent font-serif font-bold text-xs tracking-wider shrink-0">
        TG
      </div>
      <div class="flex items-baseline gap-2">
        <h1 class="text-sm font-serif font-bold tracking-wide text-chronicle-primary whitespace-nowrap">
          TagGaze
        </h1>
        <span class="text-[10px] text-chronicle-secondary font-light hidden xl:inline tracking-wider whitespace-nowrap">
          电商与社媒视觉排版工坊
        </span>
      </div>
    </div>

    <!-- Center: Ratio Presets & Guides & Undo/Redo -->
    <div class="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
      <!-- Ratio Selector -->
      <div class="relative shrink-0">
        <button
          @click="isPresetsOpen = !isPresetsOpen; isGuidesOpen = false"
          class="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-lg border border-chronicle-border bg-white hover:bg-chronicle-fill text-xs font-light text-chronicle-primary transition shadow-xs whitespace-nowrap shrink-0"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-chronicle-accent shrink-0"></span>
          <span class="font-medium">{{ currentPreset.ratio }}</span>
          <span class="hidden xl:inline text-chronicle-secondary font-mono text-[11px]">({{ currentPreset.width }} × {{ currentPreset.height }})</span>
          <ChevronDown class="w-3 h-3 text-chronicle-secondary opacity-70 shrink-0" />
        </button>

        <div
          v-if="isPresetsOpen"
          @click="isPresetsOpen = false"
          class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white border border-chronicle-border rounded-xl shadow-xl p-1.5 z-50 text-xs"
        >
          <div class="text-[10px] text-chronicle-secondary font-light px-2.5 py-1 tracking-wider border-b border-chronicle-border/60 mb-1">
            电商与社媒规范画幅
          </div>
          <button
            v-for="preset in CANVAS_PRESETS"
            :key="preset.id || preset.name"
            @click="emit('changePreset', preset)"
            class="w-full text-left px-2.5 py-2 rounded-lg hover:bg-chronicle-fill flex flex-col gap-0.5 transition"
            :class="currentPreset.name === preset.name ? 'bg-chronicle-accent-light text-chronicle-primary font-medium' : 'text-chronicle-secondary'"
          >
            <div class="flex items-center justify-between w-full">
              <span class="font-medium text-chronicle-primary">{{ preset.name }}</span>
              <span class="text-[10px] font-mono opacity-70">{{ preset.ratio }}</span>
            </div>
            <div v-if="preset.desc" class="text-[10px] opacity-75 font-light">
              {{ preset.desc }}
            </div>
          </button>
        </div>
      </div>

      <!-- Guides & Safe Areas Dropdown -->
      <div class="relative hidden sm:block shrink-0">
        <button
          @click="isGuidesOpen = !isGuidesOpen; isPresetsOpen = false"
          title="构图辅助线与平台安全区"
          class="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-light transition shadow-xs whitespace-nowrap shrink-0"
          :class="guideOverlay !== 'none' ? 'bg-chronicle-accent-light border-chronicle-accent text-chronicle-primary font-medium' : 'bg-white border-chronicle-border text-chronicle-secondary hover:text-chronicle-primary'"
        >
          <Grid3X3 class="w-3.5 h-3.5 shrink-0" :class="guideOverlay !== 'none' ? 'text-chronicle-accent' : ''" />
          <span class="hidden lg:inline whitespace-nowrap">{{ guideOverlay === 'none' ? '安全区' : '已开启参考线' }}</span>
          <ChevronDown class="w-3 h-3 text-chronicle-secondary opacity-70 shrink-0" />
        </button>

        <div
          v-if="isGuidesOpen"
          @click="isGuidesOpen = false"
          class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white border border-chronicle-border rounded-xl shadow-xl p-1.5 z-50 text-xs"
        >
          <div class="text-[10px] text-chronicle-secondary font-light px-2.5 py-1 tracking-wider border-b border-chronicle-border/60 mb-1">
            辅助构图与 UI 避让安全区
          </div>
          <button
            v-for="opt in GUIDE_OPTIONS"
            :key="opt.id"
            @click="emit('changeGuideOverlay', opt.id as GuideOverlayType)"
            class="w-full text-left px-2.5 py-2 rounded-lg hover:bg-chronicle-fill flex items-start justify-between transition gap-2"
            :class="guideOverlay === opt.id ? 'bg-chronicle-accent-light text-chronicle-primary font-medium' : 'text-chronicle-secondary'"
          >
            <div class="flex items-start gap-2">
              <component :is="opt.icon" class="w-3.5 h-3.5 text-chronicle-accent shrink-0 mt-0.5" />
              <div>
                <div class="font-medium text-chronicle-primary text-[11px]">{{ opt.label }}</div>
                <div class="text-[10px] text-chronicle-secondary font-light">{{ opt.desc }}</div>
              </div>
            </div>
            <Check v-if="guideOverlay === opt.id" class="w-3.5 h-3.5 text-chronicle-accent shrink-0 mt-0.5" />
          </button>
        </div>
      </div>

      <!-- Smart Magnetic Snapping Toggle -->
      <button
        @click="emit('toggleSnapping')"
        :title="enableSnapping ? '智能磁吸吸附：已开启 (自动吸附画布中心、边距及其他元素)' : '智能磁吸吸附：已关闭 (点击开启)'"
        class="hidden sm:flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-light transition shadow-xs whitespace-nowrap shrink-0"
        :class="enableSnapping ? 'bg-chronicle-accent-light border-chronicle-accent text-chronicle-primary font-medium' : 'bg-white border-chronicle-border text-chronicle-secondary hover:text-chronicle-primary'"
      >
        <Magnet class="w-3.5 h-3.5 shrink-0" :class="enableSnapping ? 'text-chronicle-accent' : ''" />
        <span class="hidden xl:inline whitespace-nowrap">智能吸附</span>
      </button>

      <!-- Undo / Redo Buttons -->
      <div class="flex items-center rounded-lg border border-chronicle-border bg-white p-0.5 shadow-xs shrink-0">
        <button
          @click="emit('undo')"
          :disabled="!canUndo"
          title="撤销 (Ctrl+Z)"
          class="p-1.5 rounded text-chronicle-secondary hover:text-chronicle-primary disabled:opacity-30 transition shrink-0"
        >
          <Undo2 class="w-3.5 h-3.5" />
        </button>
        <button
          @click="emit('redo')"
          :disabled="!canRedo"
          title="重做 (Ctrl+Y)"
          class="p-1.5 rounded text-chronicle-secondary hover:text-chronicle-primary disabled:opacity-30 transition shrink-0"
        >
          <Redo2 class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Right: Upload Image / Watermark / Export CTA -->
    <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
      <!-- Hidden Project File Input (.taggaze / .json) -->
      <input
        ref="projectFileInputRef"
        type="file"
        accept=".taggaze,.json,application/json"
        class="hidden"
        @change="handleProjectFileChange"
      />

      <!-- Project Save / Load Group -->
      <div class="hidden lg:flex items-center rounded-lg border border-chronicle-border bg-white p-0.5 shadow-xs shrink-0">
        <button
          type="button"
          @click="projectFileInputRef?.click()"
          title="载入工程文件 (.taggaze)"
          class="flex items-center gap-1 px-2 py-1 rounded text-xs text-chronicle-secondary hover:text-chronicle-primary transition whitespace-nowrap shrink-0"
        >
          <FolderOpen class="w-3.5 h-3.5 text-chronicle-accent shrink-0" />
          <span class="hidden xl:inline">打开工程</span>
          <span class="xl:hidden">打开</span>
        </button>
        <button
          type="button"
          @click="emit('saveProject')"
          title="将当前完整排版保存为本地工程包 (.taggaze)"
          class="flex items-center gap-1 px-2 py-1 rounded text-xs text-chronicle-secondary hover:text-chronicle-primary transition border-l border-chronicle-border/60 whitespace-nowrap shrink-0"
        >
          <Save class="w-3.5 h-3.5 text-chronicle-accent shrink-0" />
          <span class="hidden xl:inline">保存工程</span>
          <span class="xl:hidden">保存</span>
        </button>
      </div>

      <!-- Batch Production Trigger -->
      <button
        type="button"
        @click="emit('openBatch')"
        title="多图批量套版与打包导出 (.zip)"
        class="hidden sm:flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border border-chronicle-border bg-white hover:bg-chronicle-fill text-xs text-chronicle-primary font-light transition shadow-xs whitespace-nowrap shrink-0"
      >
        <FileArchive class="w-3.5 h-3.5 text-chronicle-accent shrink-0" />
        <span class="hidden lg:inline whitespace-nowrap">批量套版</span>
      </button>

      <!-- Quick Base Image Upload Trigger -->
      <button
        @click="emit('triggerUpload')"
        class="hidden sm:flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border border-chronicle-border bg-white hover:bg-chronicle-fill text-xs text-chronicle-primary font-light transition shadow-xs whitespace-nowrap shrink-0"
      >
        <Upload class="w-3 h-3 text-chronicle-accent shrink-0" />
        <span class="whitespace-nowrap">{{ hasBaseImage ? '更换底图' : '上传底图' }}</span>
      </button>

      <!-- Watermark Toggle -->
      <button
        @click="emit('toggleWatermark')"
        title="防盗水印开关"
        class="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-light transition shadow-xs whitespace-nowrap shrink-0"
        :class="watermarkEnabled ? 'bg-chronicle-accent-light border-chronicle-accent text-chronicle-primary font-medium' : 'bg-white border-chronicle-border text-chronicle-secondary hover:text-chronicle-primary'"
      >
        <ShieldCheck class="w-3.5 h-3.5 shrink-0" :class="watermarkEnabled ? 'text-chronicle-accent' : ''" />
        <span class="hidden md:inline whitespace-nowrap">防盗水印</span>
      </button>

      <!-- Export CTA -->
      <button
        @click="emit('openExport')"
        class="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg bg-chronicle-primary text-white hover:bg-neutral-800 text-xs font-medium transition active:scale-95 shadow-sm whitespace-nowrap shrink-0"
      >
        <Download class="w-3.5 h-3.5 shrink-0" />
        <span class="whitespace-nowrap">导出</span>
      </button>
    </div>
  </header>
</template>
