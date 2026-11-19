<script setup lang="ts">
import { ref } from 'vue'
import {
  ShieldCheck,
  ShieldAlert,
  Upload,
  Image as ImageIcon,
  Type,
  Move,
  RotateCcw,
  Trash2
} from 'lucide-vue-next'
import type { WatermarkConfig } from '@/types'

const props = defineProps<{
  watermark: WatermarkConfig
}>()

const emit = defineEmits<{
  (e: 'updateWatermark', partial: Partial<WatermarkConfig>): void
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)

function handleImageUpload(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    if (event.target?.result) {
      const src = event.target.result as string
      // Test natural image dimensions to calculate proportional height
      const img = new Image()
      img.onload = () => {
        const aspect = img.naturalHeight / img.naturalWidth
        const targetW = props.watermark.imageWidth || 160
        emit('updateWatermark', {
          type: 'image',
          imageSrc: src,
          imageWidth: targetW,
          imageHeight: Math.round(targetW * aspect)
        })
      }
      img.src = src
    }
  }
  reader.readAsDataURL(file)
  target.value = ''
}

function handleRemoveImage() {
  emit('updateWatermark', {
    imageSrc: '',
    type: 'text'
  })
}

function setQuickPosition(pos: 'center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left') {
  if (pos === 'center') {
    emit('updateWatermark', { x: undefined, y: undefined })
  } else if (pos === 'bottom-right') {
    emit('updateWatermark', { x: 1000, y: 1420 })
  } else if (pos === 'bottom-left') {
    emit('updateWatermark', { x: 200, y: 1420 })
  } else if (pos === 'top-right') {
    emit('updateWatermark', { x: 1000, y: 180 })
  } else if (pos === 'top-left') {
    emit('updateWatermark', { x: 200, y: 180 })
  }
}
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
          <div class="text-[10px] text-chronicle-secondary font-light">保护电商原图版权，支持文字/图片与鼠标自由拖动</div>
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
      <!-- Watermark Type Selector: Text vs Image -->
      <div>
        <label class="block text-[11px] font-medium text-chronicle-primary mb-1.5 font-serif">
          水印类型 (Watermark Type)
        </label>
        <div class="grid grid-cols-2 gap-2">
          <button
            @click="emit('updateWatermark', { type: 'text' })"
            class="py-2.5 px-3 rounded-lg border text-center font-medium transition shadow-xs flex items-center justify-center gap-1.5"
            :class="(watermark.type || 'text') === 'text' ? 'bg-chronicle-accent-light border-chronicle-accent text-chronicle-primary' : 'bg-white border-chronicle-border text-chronicle-secondary hover:bg-chronicle-fill'"
          >
            <Type class="w-3.5 h-3.5" />
            <span>文字水印</span>
          </button>
          <button
            @click="emit('updateWatermark', { type: 'image' })"
            class="py-2.5 px-3 rounded-lg border text-center font-medium transition shadow-xs flex items-center justify-center gap-1.5"
            :class="watermark.type === 'image' ? 'bg-chronicle-accent-light border-chronicle-accent text-chronicle-primary' : 'bg-white border-chronicle-border text-chronicle-secondary hover:bg-chronicle-fill'"
          >
            <ImageIcon class="w-3.5 h-3.5" />
            <span>图片水印</span>
          </button>
        </div>
      </div>

      <!-- IMAGE WATERMARK CONTROLS -->
      <div v-if="watermark.type === 'image'" class="space-y-4 p-3.5 bg-white border border-chronicle-border rounded-xl shadow-xs">
        <input
          ref="fileInputRef"
          type="file"
          accept="image/png,image/svg+xml,image/jpeg,image/webp"
          class="hidden"
          @change="handleImageUpload"
        />

        <div v-if="!watermark.imageSrc">
          <button
            @click="fileInputRef?.click()"
            class="w-full py-6 px-4 border-2 border-dashed border-chronicle-border hover:border-chronicle-accent rounded-xl bg-chronicle-fill/40 hover:bg-chronicle-fill text-chronicle-primary flex flex-col items-center justify-center gap-2 transition active:scale-[0.99]"
          >
            <div class="w-10 h-10 rounded-full bg-white border border-chronicle-border flex items-center justify-center shadow-xs">
              <Upload class="w-5 h-5 text-chronicle-accent" />
            </div>
            <div class="font-medium text-xs">点击上传水印图片</div>
            <div class="text-[10px] text-chronicle-secondary font-light">
              支持 PNG / SVG / JPG / WebP，推荐透明背景 PNG
            </div>
          </button>
        </div>

        <div v-else class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium text-chronicle-primary font-serif">已载入图片水印</span>
            <div class="flex items-center gap-1.5">
              <button
                @click="fileInputRef?.click()"
                class="px-2 py-1 rounded bg-white border border-chronicle-border text-[10px] text-chronicle-primary hover:bg-chronicle-fill transition shadow-xs"
              >
                更换图片
              </button>
              <button
                @click="handleRemoveImage"
                title="移除水印图片"
                class="p-1 rounded text-rose-500 hover:bg-rose-50 transition"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Preview Frame with transparent checkerboard -->
          <div class="h-24 rounded-lg border border-chronicle-border bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:12px_12px] bg-neutral-50 flex items-center justify-center overflow-hidden p-2">
            <img
              :src="watermark.imageSrc"
              alt="Watermark Preview"
              class="max-h-full max-w-full object-contain drop-shadow-sm"
              :style="{ opacity: watermark.opacity, transform: `rotate(${watermark.angle}deg)` }"
            />
          </div>

          <!-- Image Size Slider -->
          <div>
            <div class="flex justify-between text-[11px] font-medium text-chronicle-primary mb-1.5 font-serif">
              <span>图片显示宽度</span>
              <span class="font-mono text-chronicle-accent">{{ watermark.imageWidth || 160 }} px</span>
            </div>
            <input
              type="range"
              min="40"
              max="400"
              step="10"
              :value="watermark.imageWidth || 160"
              @input="emit('updateWatermark', { imageWidth: Number(($event.target as HTMLInputElement).value) })"
              class="w-full accent-chronicle-accent"
            />
          </div>
        </div>
      </div>

      <!-- TEXT WATERMARK CONTROLS -->
      <div v-else class="space-y-4">
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

        <!-- Font Size & Color -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <div class="flex justify-between text-[11px] font-medium text-chronicle-primary mb-1.5 font-serif">
              <span>水印字号</span>
              <span class="font-mono text-chronicle-accent">{{ watermark.fontSize }} px</span>
            </div>
            <input
              type="range"
              min="14"
              max="72"
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

      <!-- Mode (Grid vs Single Draggable) -->
      <div>
        <label class="block text-[11px] font-medium text-chronicle-primary mb-1.5 font-serif">
          排布模式 (Layout Pattern)
        </label>
        <div class="grid grid-cols-2 gap-2">
          <button
            @click="emit('updateWatermark', { mode: 'single' })"
            class="py-2.5 px-3 rounded-lg border text-center font-medium transition shadow-xs flex items-center justify-center gap-1.5"
            :class="watermark.mode === 'single' ? 'bg-chronicle-accent-light border-chronicle-accent text-chronicle-primary' : 'bg-white border-chronicle-border text-chronicle-secondary hover:bg-chronicle-fill'"
          >
            <Move class="w-3.5 h-3.5" />
            <span>单处鼠标拖动</span>
          </button>
          <button
            @click="emit('updateWatermark', { mode: 'grid' })"
            class="py-2.5 px-3 rounded-lg border text-center font-medium transition shadow-xs"
            :class="watermark.mode === 'grid' ? 'bg-chronicle-accent-light border-chronicle-accent text-chronicle-primary' : 'bg-white border-chronicle-border text-chronicle-secondary hover:bg-chronicle-fill'"
          >
            全图斜向平铺
          </button>
        </div>
      </div>

      <!-- SINGLE WATERMARK DRAG & POSITION CONTROLS -->
      <div v-if="watermark.mode === 'single'" class="p-3.5 rounded-xl border border-chronicle-border bg-white space-y-3 shadow-xs">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5 text-chronicle-primary font-medium">
            <Move class="w-3.5 h-3.5 text-chronicle-accent" />
            <span>单处水印位置快捷定位</span>
          </div>
          <button
            @click="setQuickPosition('center')"
            class="flex items-center gap-1 text-[10px] text-chronicle-accent hover:underline font-light"
          >
            <RotateCcw class="w-3 h-3" />
            <span>重置居中</span>
          </button>
        </div>

        <!-- Quick Corner Buttons -->
        <div class="grid grid-cols-5 gap-1.5 text-center">
          <button
            @click="setQuickPosition('top-left')"
            class="py-1 px-1 rounded border border-chronicle-border hover:bg-chronicle-fill text-[10px] transition"
          >
            左上
          </button>
          <button
            @click="setQuickPosition('top-right')"
            class="py-1 px-1 rounded border border-chronicle-border hover:bg-chronicle-fill text-[10px] transition"
          >
            右上
          </button>
          <button
            @click="setQuickPosition('center')"
            class="py-1 px-1 rounded border border-chronicle-border hover:bg-chronicle-fill text-[10px] font-medium text-chronicle-accent bg-chronicle-fill/40 transition"
          >
            居中
          </button>
          <button
            @click="setQuickPosition('bottom-left')"
            class="py-1 px-1 rounded border border-chronicle-border hover:bg-chronicle-fill text-[10px] transition"
          >
            左下
          </button>
          <button
            @click="setQuickPosition('bottom-right')"
            class="py-1 px-1 rounded border border-chronicle-border hover:bg-chronicle-fill text-[10px] transition"
          >
            右下
          </button>
        </div>

        <div class="p-2.5 rounded-lg bg-chronicle-accent-light/40 border border-chronicle-accent/20 flex items-start gap-2 text-[11px] text-chronicle-primary font-light">
          <Move class="w-4 h-4 text-chronicle-accent shrink-0 mt-0.5" />
          <span class="leading-relaxed">
            <b>鼠标拖动操作：</b>鼠标移动到右侧画布的水印上方，光标变为移动手势后，按住左键即可拖动到任意位置。
          </span>
        </div>
      </div>

      <!-- GRID WATERMARK DENSITY CONTROLS -->
      <div v-else class="grid grid-cols-2 gap-3 p-3 bg-white border border-chronicle-border rounded-xl shadow-xs">
        <div>
          <div class="flex justify-between text-[11px] font-medium text-chronicle-primary mb-1 font-serif">
            <span>水平间距</span>
            <span class="font-mono text-chronicle-accent">{{ watermark.gapX || 200 }}</span>
          </div>
          <input
            type="range"
            min="120"
            max="400"
            step="20"
            :value="watermark.gapX || 200"
            @input="emit('updateWatermark', { gapX: Number(($event.target as HTMLInputElement).value) })"
            class="w-full accent-chronicle-accent"
          />
        </div>
        <div>
          <div class="flex justify-between text-[11px] font-medium text-chronicle-primary mb-1 font-serif">
            <span>垂直间距</span>
            <span class="font-mono text-chronicle-accent">{{ watermark.gapY || 150 }}</span>
          </div>
          <input
            type="range"
            min="100"
            max="300"
            step="20"
            :value="watermark.gapY || 150"
            @input="emit('updateWatermark', { gapY: Number(($event.target as HTMLInputElement).value) })"
            class="w-full accent-chronicle-accent"
          />
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
          max="0.9"
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
          min="-90"
          max="90"
          step="5"
          :value="watermark.angle"
          @input="emit('updateWatermark', { angle: Number(($event.target as HTMLInputElement).value) })"
          class="w-full accent-chronicle-accent"
        />
        <div class="flex items-center gap-1.5 mt-2">
          <button
            v-for="deg in [0, -15, -30, -45]"
            :key="deg"
            @click="emit('updateWatermark', { angle: deg })"
            class="py-0.5 px-2 rounded border border-chronicle-border text-[10px] transition"
            :class="watermark.angle === deg ? 'bg-chronicle-accent text-white border-chronicle-accent' : 'bg-white hover:bg-chronicle-fill'"
          >
            {{ deg }}°
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
