<script setup lang="ts">
import { ref } from 'vue'
import { Image as ImageIcon, Type, Sparkles, ShieldCheck } from 'lucide-vue-next'
import type { TabType } from './Sidebar.vue'

defineProps<{
  activeTab: TabType
  hasBaseImage: boolean
}>()

const emit = defineEmits<{
  (e: 'update:activeTab', tab: TabType): void
}>()

const isExpanded = ref(true)
</script>

<template>
  <div class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-chronicle-surface-raised border-t border-chronicle-border shadow-2xl transition-all duration-300">
    <!-- Collapse / Expand Toggle Bar -->
    <div
      @click="isExpanded = !isExpanded"
      class="h-5 flex items-center justify-center cursor-pointer hover:bg-chronicle-fill transition"
    >
      <div class="w-8 h-1 bg-neutral-300 rounded-full"></div>
    </div>

    <!-- Mobile 4-Tab Nav Strip in Light Palette -->
    <div class="grid grid-cols-4 border-b border-chronicle-border p-1 gap-1 bg-chronicle-surface">
      <button
        @click="emit('update:activeTab', 'image'); isExpanded = true"
        class="py-2 rounded-lg text-xs font-light flex items-center justify-center gap-1 transition relative"
        :class="activeTab === 'image' ? 'bg-white text-chronicle-primary font-medium shadow-xs border border-chronicle-border' : 'text-chronicle-secondary'"
      >
        <ImageIcon class="w-3.5 h-3.5" :class="activeTab === 'image' ? 'text-chronicle-accent' : ''" />
        <span>底图</span>
        <span v-if="!hasBaseImage" class="w-1.5 h-1.5 rounded-full bg-chronicle-accent absolute top-1 right-2"></span>
      </button>

      <button
        @click="emit('update:activeTab', 'text'); isExpanded = true"
        class="py-2 rounded-lg text-xs font-light flex items-center justify-center gap-1 transition"
        :class="activeTab === 'text' ? 'bg-white text-chronicle-primary font-medium shadow-xs border border-chronicle-border' : 'text-chronicle-secondary'"
      >
        <Type class="w-3.5 h-3.5" :class="activeTab === 'text' ? 'text-chronicle-accent' : ''" />
        <span>文案</span>
      </button>

      <button
        @click="emit('update:activeTab', 'assets'); isExpanded = true"
        class="py-2 rounded-lg text-xs font-light flex items-center justify-center gap-1 transition"
        :class="activeTab === 'assets' ? 'bg-white text-chronicle-primary font-medium shadow-xs border border-chronicle-border' : 'text-chronicle-secondary'"
      >
        <Sparkles class="w-3.5 h-3.5" :class="activeTab === 'assets' ? 'text-chronicle-accent' : ''" />
        <span>徽章</span>
      </button>

      <button
        @click="emit('update:activeTab', 'watermark'); isExpanded = true"
        class="py-2 rounded-lg text-xs font-light flex items-center justify-center gap-1 transition"
        :class="activeTab === 'watermark' ? 'bg-white text-chronicle-primary font-medium shadow-xs border border-chronicle-border' : 'text-chronicle-secondary'"
      >
        <ShieldCheck class="w-3.5 h-3.5" :class="activeTab === 'watermark' ? 'text-chronicle-accent' : ''" />
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
