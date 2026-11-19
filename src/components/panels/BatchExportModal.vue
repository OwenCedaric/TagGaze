<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  X,
  Upload,
  Layers,
  ShieldCheck,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileArchive
} from 'lucide-vue-next'
import type { BatchImageItem, BatchExportOptions } from '@/types'

const props = defineProps<{
  isOpen: boolean
  isProcessing: boolean
  progressCurrent: number
  progressTotal: number
  currentStatusText: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'startBatch', images: BatchImageItem[], options: BatchExportOptions): void
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const batchImages = ref<BatchImageItem[]>([])

const exportOptions = ref<BatchExportOptions>({
  mode: 'template',
  format: 'image/jpeg',
  quality: 0.85,
  scale: 1,
  namingPattern: 'numbered'
})

const isDragging = ref(false)

function handleFiles(files: FileList | null) {
  if (!files || files.length === 0) return

  const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'))
  if (imageFiles.length === 0) {
    alert('请选取图片格式文件 (JPEG, PNG, WebP)')
    return
  }

  for (const file of imageFiles) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        batchImages.value.push({
          id: 'batch_' + Date.now() + Math.random().toString(36).slice(2, 6),
          name: file.name,
          src: e.target.result as string,
          status: 'pending'
        })
      }
    }
    reader.readAsDataURL(file)
  }
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  handleFiles(target.files)
  target.value = ''
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  handleFiles(e.dataTransfer?.files || null)
}

function removeImage(id: string) {
  batchImages.value = batchImages.value.filter((img) => img.id !== id)
}

function clearAllImages() {
  batchImages.value = []
}

function handleStart() {
  if (batchImages.value.length === 0) {
    alert('请至少上传 1 张待处理的商品图片')
    return
  }
  emit('startBatch', [...batchImages.value], { ...exportOptions.value })
}

const progressPercent = computed(() => {
  if (props.progressTotal === 0) return 0
  return Math.round((props.progressCurrent / props.progressTotal) * 100)
})
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm select-none"
    @click.self="!isProcessing && emit('close')"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl border border-chronicle-border w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in duration-200"
    >
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-chronicle-border flex items-center justify-between bg-chronicle-surface">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-chronicle-fill border border-chronicle-border flex items-center justify-center text-chronicle-accent">
            <FileArchive class="w-4 h-4" />
          </div>
          <div>
            <h2 class="text-sm font-serif font-bold text-chronicle-primary">
              多图批量套版与打包导出 (Batch ZIP)
            </h2>
            <p class="text-[11px] text-chronicle-secondary font-light">
              以当前画布排版（文案、徽章、水印）为母版，批量替换商品底图并自动打包 ZIP
            </p>
          </div>
        </div>
        <button
          @click="emit('close')"
          :disabled="isProcessing"
          class="p-1 rounded-lg text-chronicle-secondary hover:text-chronicle-primary hover:bg-chronicle-fill transition disabled:opacity-30"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-6 overflow-y-auto space-y-5 text-xs text-chronicle-secondary flex-1">
        <!-- Hidden Multiple Files Input -->
        <input
          ref="fileInputRef"
          type="file"
          multiple
          accept="image/*"
          class="hidden"
          @change="handleFileSelect"
        />

        <!-- 1. Mode Selection -->
        <div class="space-y-2">
          <label class="block text-[11px] font-medium text-chronicle-primary font-serif">
            批量合成模式
          </label>
          <div class="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              @click="exportOptions.mode = 'template'"
              :disabled="isProcessing"
              class="p-3 rounded-xl border text-left flex items-start gap-2.5 transition"
              :class="exportOptions.mode === 'template' ? 'bg-chronicle-accent-light border-chronicle-accent text-chronicle-primary font-medium' : 'bg-white border-chronicle-border text-chronicle-secondary hover:bg-chronicle-fill'"
            >
              <Layers class="w-4 h-4 text-chronicle-accent shrink-0 mt-0.5" />
              <div>
                <div class="font-medium text-chronicle-primary text-xs">当前画布排版套版 (Canvas Layout)</div>
                <div class="text-[10px] text-chronicle-secondary font-light mt-0.5">
                  保持当前画布的营销大标题、利益胶囊、徽章与水印，逐张替换商品底图
                </div>
              </div>
            </button>

            <button
              type="button"
              @click="exportOptions.mode = 'watermark-only'"
              :disabled="isProcessing"
              class="p-3 rounded-xl border text-left flex items-start gap-2.5 transition"
              :class="exportOptions.mode === 'watermark-only' ? 'bg-chronicle-accent-light border-chronicle-accent text-chronicle-primary font-medium' : 'bg-white border-chronicle-border text-chronicle-secondary hover:bg-chronicle-fill'"
            >
              <ShieldCheck class="w-4 h-4 text-chronicle-accent shrink-0 mt-0.5" />
              <div>
                <div class="font-medium text-chronicle-primary text-xs">仅加防盗水印 (Watermark Only)</div>
                <div class="text-[10px] text-chronicle-secondary font-light mt-0.5">
                  仅在批量图片上叠加当前设置的文字/图片水印，无其他文案覆盖
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- 2. Dropzone / Upload Trigger -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-[11px] font-medium text-chronicle-primary font-serif">
              上传待处理商品图 ({{ batchImages.length }} 张)
            </label>
            <button
              v-if="batchImages.length > 0 && !isProcessing"
              type="button"
              @click="clearAllImages"
              class="text-[10px] text-rose-500 hover:underline flex items-center gap-1"
            >
              <Trash2 class="w-3 h-3" />
              <span>清空全部</span>
            </button>
          </div>

          <div
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop="handleDrop"
            @click="fileInputRef?.click()"
            class="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 bg-chronicle-surface hover:bg-white"
            :class="isDragging ? 'border-chronicle-accent bg-chronicle-accent-light/30' : 'border-chronicle-border'"
          >
            <div class="w-10 h-10 rounded-full bg-white border border-chronicle-border flex items-center justify-center text-chronicle-accent shadow-xs">
              <Upload class="w-5 h-5" />
            </div>
            <div>
              <div class="text-xs font-medium text-chronicle-primary">
                点击选择或拖拽图片至此处 (支持多选)
              </div>
              <div class="text-[10px] text-chronicle-secondary font-light mt-0.5">
                支持 JPEG, PNG, WebP，可一次性拖入 2 ~ 10 张 SKU 主图
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Image List Preview -->
        <div v-if="batchImages.length > 0" class="space-y-2">
          <div class="max-h-48 overflow-y-auto space-y-1.5 pr-1 border border-chronicle-border/60 rounded-xl p-2 bg-chronicle-surface">
            <div
              v-for="(item, idx) in batchImages"
              :key="item.id"
              class="flex items-center justify-between p-2 rounded-lg bg-white border border-chronicle-border shadow-xs text-[11px]"
            >
              <div class="flex items-center gap-2.5 overflow-hidden">
                <span class="font-mono text-[10px] text-chronicle-secondary w-4 text-center">{{ idx + 1 }}</span>
                <img :src="item.src" class="w-8 h-8 rounded object-cover border border-chronicle-border shrink-0" alt="thumb" />
                <span class="truncate font-medium text-chronicle-primary">{{ item.name }}</span>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <span v-if="item.status === 'processing'" class="text-amber-500 flex items-center gap-1 text-[10px]">
                  <Loader2 class="w-3 h-3 animate-spin" /> 处理中
                </span>
                <span v-else-if="item.status === 'done'" class="text-emerald-600 flex items-center gap-1 text-[10px]">
                  <CheckCircle2 class="w-3 h-3" /> 已完成
                </span>
                <span v-else-if="item.status === 'error'" class="text-rose-500 flex items-center gap-1 text-[10px]">
                  <AlertCircle class="w-3 h-3" /> 失败
                </span>
                <span v-else class="text-[10px] text-neutral-400">待处理</span>

                <button
                  v-if="!isProcessing"
                  type="button"
                  @click="removeImage(item.id)"
                  class="p-1 rounded text-neutral-400 hover:text-rose-500 transition"
                >
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Export Format & Resolution Options -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-chronicle-surface border border-chronicle-border rounded-xl">
          <div>
            <label class="block text-[10px] font-medium text-chronicle-primary mb-1">图片格式</label>
            <select
              v-model="exportOptions.format"
              :disabled="isProcessing"
              class="w-full px-2 py-1.5 rounded-lg border border-chronicle-border bg-white text-xs font-light text-chronicle-primary"
            >
              <option value="image/jpeg">JPEG (电商首选)</option>
              <option value="image/png">PNG (清晰无损)</option>
              <option value="image/webp">WebP (高效压缩)</option>
            </select>
          </div>

          <div>
            <label class="block text-[10px] font-medium text-chronicle-primary mb-1">分辨率倍率</label>
            <select
              v-model="exportOptions.scale"
              :disabled="isProcessing"
              class="w-full px-2 py-1.5 rounded-lg border border-chronicle-border bg-white text-xs font-light text-chronicle-primary"
            >
              <option :value="1">1x 标准画幅 (极速)</option>
              <option :value="2">2x 超清 Retina (超清晰)</option>
            </select>
          </div>

          <div>
            <label class="block text-[10px] font-medium text-chronicle-primary mb-1">命名规则</label>
            <select
              v-model="exportOptions.namingPattern"
              :disabled="isProcessing"
              class="w-full px-2 py-1.5 rounded-lg border border-chronicle-border bg-white text-xs font-light text-chronicle-primary"
            >
              <option value="numbered">序号_原文件名</option>
              <option value="original">原文件名_TagGaze</option>
            </select>
          </div>
        </div>

        <!-- 5. Active Processing Progress Bar -->
        <div v-if="isProcessing" class="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2">
          <div class="flex items-center justify-between text-[11px]">
            <span class="font-medium text-amber-900 flex items-center gap-1.5">
              <Loader2 class="w-3.5 h-3.5 animate-spin text-amber-600" />
              <span>{{ currentStatusText || '正在渲染并打包...' }}</span>
            </span>
            <span class="font-mono text-amber-700 font-semibold">{{ progressPercent }}% ({{ progressCurrent }}/{{ progressTotal }})</span>
          </div>
          <div class="w-full h-2 rounded-full bg-amber-200/60 overflow-hidden">
            <div
              class="h-full bg-amber-500 rounded-full transition-all duration-300"
              :style="{ width: `${progressPercent}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-3.5 border-t border-chronicle-border flex items-center justify-between bg-chronicle-surface">
        <span class="text-[11px] text-chronicle-secondary font-light">
          预估生成 {{ batchImages.length }} 个文件并压缩为 .zip 包
        </span>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="emit('close')"
            :disabled="isProcessing"
            class="px-3.5 py-2 rounded-lg border border-chronicle-border bg-white hover:bg-chronicle-fill text-xs font-light transition disabled:opacity-40"
          >
            取消
          </button>

          <button
            type="button"
            @click="handleStart"
            :disabled="isProcessing || batchImages.length === 0"
            class="px-4 py-2 rounded-lg bg-chronicle-primary text-white hover:bg-neutral-800 text-xs font-medium flex items-center gap-1.5 transition active:scale-95 disabled:opacity-40 shadow-sm"
          >
            <Download class="w-3.5 h-3.5" />
            <span>{{ isProcessing ? '打包中...' : '开始批量渲染并下载 ZIP' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
