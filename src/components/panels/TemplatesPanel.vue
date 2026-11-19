<script setup lang="ts">
import { Sparkles, ArrowRight } from 'lucide-vue-next'
import { LAYOUT_TEMPLATES } from '@/constants/templates'
import type { LayoutTemplate } from '@/types'

defineProps<{
  currentRatio: string
}>()

const emit = defineEmits<{
  (e: 'applyTemplate', template: LayoutTemplate): void
}>()
</script>

<template>
  <div class="space-y-6 text-xs text-chronicle-secondary">
    <!-- Header introduction -->
    <div class="p-3.5 rounded-xl border border-chronicle-border bg-chronicle-surface space-y-1 shadow-xs">
      <div class="flex items-center gap-2 font-serif text-chronicle-primary font-medium text-xs">
        <Sparkles class="w-4 h-4 text-chronicle-accent" />
        <span>电商与社媒一键成图模板</span>
      </div>
      <p class="text-[11px] text-chronicle-secondary font-light leading-relaxed">
        针对小红书爆款、电商主图、大促秒杀等高转化场景精心设计。点击任意模板，即刻完成整套图层与徽章编排。
      </p>
    </div>

    <!-- Template Cards Grid -->
    <div class="space-y-3.5">
      <div
        v-for="tpl in LAYOUT_TEMPLATES"
        :key="tpl.id"
        class="border border-chronicle-border rounded-xl p-4 bg-white hover:border-chronicle-accent hover:shadow-md transition-all group flex flex-col justify-between gap-3"
      >
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span
                class="w-2.5 h-2.5 rounded-full"
                :style="{ backgroundColor: tpl.previewColor }"
              ></span>
              <h4 class="font-serif font-bold text-chronicle-primary text-xs tracking-wide">
                {{ tpl.name }}
              </h4>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-chronicle-fill border border-chronicle-border text-chronicle-secondary">
              {{ tpl.presetRatio }}
            </span>
          </div>

          <div class="text-[10px] text-chronicle-accent font-medium">
            {{ tpl.tag }}
          </div>

          <p class="text-[11px] text-chronicle-secondary font-light leading-relaxed">
            {{ tpl.description }}
          </p>
        </div>

        <button
          @click="emit('applyTemplate', tpl)"
          class="w-full py-2 px-3 rounded-lg bg-chronicle-fill hover:bg-chronicle-primary hover:text-white border border-chronicle-border text-chronicle-primary font-medium flex items-center justify-center gap-1.5 transition active:scale-[0.99] text-xs shadow-xs group-hover:bg-chronicle-primary group-hover:text-white"
        >
          <span>一键套用该版式</span>
          <ArrowRight class="w-3.5 h-3.5 transition group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  </div>
</template>
