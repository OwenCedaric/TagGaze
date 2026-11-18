<script setup lang="ts">
import { ref } from 'vue'
import { Type, Sparkles, ShieldCheck } from 'lucide-vue-next'

defineProps<{
  activeTab: 'text' | 'assets' | 'watermark'
}>()

const emit = defineEmits<{
  (e: 'update:activeTab', tab: 'text' | 'assets' | 'watermark'): void
}>()

const isExpanded = ref(true)
</script>

<template>
  <div class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-900 border-t border-neutral-800 shadow-2xl transition-all duration-300">
    <!-- Collapse / Expand Toggle Bar -->
    <div
      @click="isExpanded = !isExpanded"
      class="h-6 flex items-center justify-center cursor-pointer bg-neutral-850 hover:bg-neutral-800 transition text-neutral-400"
    >
      <div class="w-8 h-1 bg-neutral-600 rounded-full"></div>
    </div>

    <!-- Mobile Tab Nav -->
    <div class="grid grid-cols-3 border-b border-neutral-800 p-1.5 gap-1 bg-neutral-950/60">
      <button
        @click="emit('update:activeTab', 'text'); isExpanded = true"
        class="py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition"
        :class="activeTab === 'text' ? 'bg-neutral-800 text-brand-300' : 'text-neutral-400'"
      >
        <Type class="w-3.5 h-3.5" />
        <span>文案</span>
      </button>

      <button
        @click="emit('update:activeTab', 'assets'); isExpanded = true"
        class="py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition"
        :class="activeTab === 'assets' ? 'bg-neutral-800 text-brand-300' : 'text-neutral-400'"
      >
        <Sparkles class="w-3.5 h-3.5" />
        <span>徽章</span>
      </button>

      <button
        @click="emit('update:activeTab', 'watermark'); isExpanded = true"
        class="py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition"
        :class="activeTab === 'watermark' ? 'bg-neutral-800 text-brand-300' : 'text-neutral-400'"
      >
        <ShieldCheck class="w-3.5 h-3.5" />
        <span>水印</span>
      </button>
    </div>

    <!-- Expandable Content Drawer -->
    <div
      v-show="isExpanded"
      class="max-h-[50vh] overflow-y-auto p-4 pb-8"
    >
      <slot></slot>
    </div>
  </div>
</template>
