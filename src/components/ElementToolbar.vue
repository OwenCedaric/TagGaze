<script setup lang="ts">
import { Copy, Trash2, ArrowUp, ArrowDown, Lock, Unlock } from 'lucide-vue-next'
import type { CanvasElement } from '@/types'

defineProps<{
  element: CanvasElement | null
}>()

const emit = defineEmits<{
  (e: 'duplicate'): void
  (e: 'delete'): void
  (e: 'bringForward'): void
  (e: 'sendBackward'): void
  (e: 'toggleLock'): void
}>()
</script>

<template>
  <div
    v-if="element && !(element.type === 'image' && element.isBaseImage)"
    class="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 border border-chronicle-border rounded-xl shadow-lg px-2 py-1.5 flex items-center gap-1 z-20 backdrop-blur-[12px]"
  >
    <span class="text-[10px] font-medium text-chronicle-secondary px-2 border-r border-chronicle-border">
      {{ element.type === 'text' ? '文本' : element.type === 'svg' ? '徽章' : '贴图' }}
    </span>

    <button
      @click="emit('duplicate')"
      title="复制元素"
      class="p-1.5 rounded-md text-chronicle-primary hover:bg-chronicle-fill transition"
    >
      <Copy class="w-3.5 h-3.5" />
    </button>

    <button
      @click="emit('bringForward')"
      title="上移一层"
      class="p-1.5 rounded-md text-chronicle-primary hover:bg-chronicle-fill transition"
    >
      <ArrowUp class="w-3.5 h-3.5" />
    </button>

    <button
      @click="emit('sendBackward')"
      title="下移一层"
      class="p-1.5 rounded-md text-chronicle-primary hover:bg-chronicle-fill transition"
    >
      <ArrowDown class="w-3.5 h-3.5" />
    </button>

    <button
      @click="emit('toggleLock')"
      :title="element.locked ? '解锁' : '锁定'"
      class="p-1.5 rounded-md hover:bg-chronicle-fill transition"
      :class="element.locked ? 'text-chronicle-accent' : 'text-chronicle-primary'"
    >
      <Lock v-if="element.locked" class="w-3.5 h-3.5" />
      <Unlock v-else class="w-3.5 h-3.5" />
    </button>

    <div class="w-px h-3.5 bg-chronicle-border mx-0.5"></div>

    <button
      @click="emit('delete')"
      title="删除"
      class="p-1.5 rounded-md text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition"
    >
      <Trash2 class="w-3.5 h-3.5" />
    </button>
  </div>
</template>
