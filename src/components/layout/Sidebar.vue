<script setup lang="ts">
import { Type, Sparkles, ShieldCheck } from 'lucide-vue-next'

defineProps<{
  activeTab: 'text' | 'assets' | 'watermark'
}>()

const emit = defineEmits<{
  (e: 'update:activeTab', tab: 'text' | 'assets' | 'watermark'): void
}>()
</script>

<template>
  <aside class="hidden md:flex flex-col w-80 lg:w-96 border-r border-neutral-800 bg-neutral-900/95 backdrop-blur z-20 shrink-0">
    <!-- Tab Selector -->
    <div class="grid grid-cols-3 border-b border-neutral-800 p-2 gap-1 bg-neutral-950/40">
      <button
        @click="emit('update:activeTab', 'text')"
        class="py-2 px-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
        :class="activeTab === 'text' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'"
      >
        <Type class="w-3.5 h-3.5" />
        <span>文案排版</span>
      </button>

      <button
        @click="emit('update:activeTab', 'assets')"
        class="py-2 px-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
        :class="activeTab === 'assets' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'"
      >
        <Sparkles class="w-3.5 h-3.5" />
        <span>徽章贴图</span>
      </button>

      <button
        @click="emit('update:activeTab', 'watermark')"
        class="py-2 px-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
        :class="activeTab === 'watermark' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'"
      >
        <ShieldCheck class="w-3.5 h-3.5" />
        <span>防盗水印</span>
      </button>
    </div>

    <!-- Panel Content Slot with scrolling -->
    <div class="flex-1 overflow-y-auto p-4">
      <slot></slot>
    </div>
  </aside>
</template>
