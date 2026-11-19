<script setup lang="ts">
import { LayoutTemplate, Image as ImageIcon, Type, Sparkles, ShieldCheck } from 'lucide-vue-next'

export type TabType = 'templates' | 'image' | 'text' | 'assets' | 'watermark'

defineProps<{
  activeTab: TabType
  hasBaseImage: boolean
}>()

const emit = defineEmits<{
  (e: 'update:activeTab', tab: TabType): void
}>()
</script>

<template>
  <aside class="hidden md:flex flex-col w-80 lg:w-96 border-r border-chronicle-border bg-chronicle-surface-raised z-20 shrink-0 shadow-xs">
    <!-- Chronicle 5-Tab Nav Strip in Light Palette -->
    <div class="grid grid-cols-5 border-b border-chronicle-border p-1.5 gap-1 bg-chronicle-surface">
      <button
        @click="emit('update:activeTab', 'templates')"
        class="py-2 px-1 rounded-lg text-xs font-light flex items-center justify-center gap-1 transition"
        :class="activeTab === 'templates' ? 'bg-white text-chronicle-primary font-medium shadow-xs border border-chronicle-border' : 'text-chronicle-secondary hover:text-chronicle-primary hover:bg-white/60'"
        title="电商与社媒一键排版模板"
      >
        <LayoutTemplate class="w-3.5 h-3.5" :class="activeTab === 'templates' ? 'text-chronicle-accent' : ''" />
        <span>模板</span>
      </button>

      <button
        @click="emit('update:activeTab', 'image')"
        class="py-2 px-1 rounded-lg text-xs font-light flex items-center justify-center gap-1 transition relative"
        :class="activeTab === 'image' ? 'bg-white text-chronicle-primary font-medium shadow-xs border border-chronicle-border' : 'text-chronicle-secondary hover:text-chronicle-primary hover:bg-white/60'"
      >
        <ImageIcon class="w-3.5 h-3.5" :class="activeTab === 'image' ? 'text-chronicle-accent' : ''" />
        <span>底图</span>
        <span v-if="!hasBaseImage" class="w-1.5 h-1.5 rounded-full bg-chronicle-accent absolute top-1.5 right-1.5"></span>
      </button>

      <button
        @click="emit('update:activeTab', 'text')"
        class="py-2 px-1 rounded-lg text-xs font-light flex items-center justify-center gap-1 transition"
        :class="activeTab === 'text' ? 'bg-white text-chronicle-primary font-medium shadow-xs border border-chronicle-border' : 'text-chronicle-secondary hover:text-chronicle-primary hover:bg-white/60'"
      >
        <Type class="w-3.5 h-3.5" :class="activeTab === 'text' ? 'text-chronicle-accent' : ''" />
        <span>文案</span>
      </button>

      <button
        @click="emit('update:activeTab', 'assets')"
        class="py-2 px-1 rounded-lg text-xs font-light flex items-center justify-center gap-1 transition"
        :class="activeTab === 'assets' ? 'bg-white text-chronicle-primary font-medium shadow-xs border border-chronicle-border' : 'text-chronicle-secondary hover:text-chronicle-primary hover:bg-white/60'"
      >
        <Sparkles class="w-3.5 h-3.5" :class="activeTab === 'assets' ? 'text-chronicle-accent' : ''" />
        <span>徽章</span>
      </button>

      <button
        @click="emit('update:activeTab', 'watermark')"
        class="py-2 px-1 rounded-lg text-xs font-light flex items-center justify-center gap-1 transition"
        :class="activeTab === 'watermark' ? 'bg-white text-chronicle-primary font-medium shadow-xs border border-chronicle-border' : 'text-chronicle-secondary hover:text-chronicle-primary hover:bg-white/60'"
      >
        <ShieldCheck class="w-3.5 h-3.5" :class="activeTab === 'watermark' ? 'text-chronicle-accent' : ''" />
        <span>水印</span>
      </button>
    </div>

    <!-- Panel Content Slot with clean light styling -->
    <div class="flex-1 overflow-y-auto p-5">
      <slot></slot>
    </div>
  </aside>
</template>
