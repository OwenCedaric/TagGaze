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
    class="absolute top-4 left-1/2 -translate-x-1/2 bg-neutral-900/95 border border-neutral-700/80 rounded-xl shadow-2xl px-2 py-1.5 flex items-center gap-1 z-20 backdrop-blur"
  >
    <span class="text-[11px] font-medium text-neutral-400 px-1.5 border-r border-neutral-750">
      {{ element.type === 'text' ? '文本' : element.type === 'svg' ? '徽章' : '贴纸' }}
    </span>

    <button
      @click="emit('duplicate')"
      title="复制元素"
      class="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
    >
      <Copy class="w-3.5 h-3.5" />
    </button>

    <button
      @click="emit('bringForward')"
      title="上移一层"
      class="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
    >
      <ArrowUp class="w-3.5 h-3.5" />
    </button>

    <button
      @click="emit('sendBackward')"
      title="下移一层"
      class="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
    >
      <ArrowDown class="w-3.5 h-3.5" />
    </button>

    <button
      @click="emit('toggleLock')"
      :title="element.locked ? '解锁' : '锁定'"
      class="p-1.5 rounded-lg hover:bg-neutral-800 transition"
      :class="element.locked ? 'text-amber-400' : 'text-neutral-300 hover:text-white'"
    >
      <Lock v-if="element.locked" class="w-3.5 h-3.5" />
      <Unlock v-else class="w-3.5 h-3.5" />
    </button>

    <div class="w-px h-4 bg-neutral-750 mx-0.5"></div>

    <button
      @click="emit('delete')"
      title="删除"
      class="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 transition"
    >
      <Trash2 class="w-3.5 h-3.5" />
    </button>
  </div>
</template>
