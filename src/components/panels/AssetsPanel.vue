<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Upload,
  Sparkles,
  Move,
  Pipette,
  Award,
  Trash2,
  ArrowUpRight,
  Target,
  Search,
  MapPin,
  HelpCircle,
  Plus
} from 'lucide-vue-next'
import { SVG_ASSETS, ASSET_CATEGORIES } from '@/constants/assets'
import type { SvgElement, BrandKitConfig } from '@/types'

defineProps<{
  activeSvg: SvgElement | null
  brandKit?: BrandKitConfig
}>()

const emit = defineEmits<{
  (e: 'addSvg', svgContent: string, defaultFill: string, defaultWidth?: number, defaultHeight?: number): void
  (e: 'uploadLogo', src: string): void
  (e: 'updateSvgColor', fill: string): void
  (e: 'addCalloutPin', type: 'arrow' | 'focus' | 'magnifier' | 'pindot', labelText: string): void
  (e: 'updateBrandKit', partial: Partial<BrandKitConfig>): void
  (e: 'addBrandGuarantee', name: string, tagline: string, color: string): void
  (e: 'applyBrandColor', color: string): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const brandLogoInput = ref<HTMLInputElement | null>(null)
const selectedCategory = ref<string>('all')

const isBrandKitExpanded = ref(false)

const filteredAssets = computed(() => {
  if (selectedCategory.value === 'all') return SVG_ASSETS
  return SVG_ASSETS.filter((a) => a.category === selectedCategory.value)
})

function handleFileUpload(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    if (event.target?.result) {
      emit('uploadLogo', event.target.result as string)
    }
  }
  reader.readAsDataURL(file)
  target.value = ''
}

function handleBrandLogoUpload(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    if (event.target?.result) {
      emit('updateBrandKit', { logoSrc: event.target.result as string })
    }
  }
  reader.readAsDataURL(file)
  target.value = ''
}

async function pickBadgeColor() {
  if ('EyeDropper' in window) {
    try {
      // @ts-expect-error EyeDropper is experimental
      const eyeDropper = new window.EyeDropper()
      const result = await eyeDropper.open()
      if (result && result.sRGBHex) {
        emit('updateSvgColor', result.sRGBHex)
      }
    } catch (e) {
      console.log('Eyedropper canceled:', e)
    }
  } else {
    alert('当前浏览器暂不支持原生吸管（建议使用 Chrome / Edge 提取底图色彩）')
  }
}
</script>

<template>
  <div class="space-y-5 text-xs text-chronicle-secondary">
    <!-- Brand Kit Card (品牌与店铺资产库) -->
    <div class="border border-chronicle-border rounded-xl p-3.5 bg-chronicle-surface space-y-3 shadow-xs">
      <input
        ref="brandLogoInput"
        type="file"
        accept="image/png,image/svg+xml,image/webp"
        class="hidden"
        @change="handleBrandLogoUpload"
      />

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5 font-serif font-medium text-xs text-chronicle-primary">
          <Award class="w-4 h-4 text-chronicle-accent" />
          <span>品牌与店铺资产库 (Brand Kit)</span>
        </div>
        <button
          type="button"
          @click="isBrandKitExpanded = !isBrandKitExpanded"
          class="text-[10px] text-chronicle-accent hover:underline font-mono"
        >
          {{ isBrandKitExpanded ? '收起配置' : '配置品牌' }}
        </button>
      </div>

      <p class="text-[10px] text-chronicle-secondary font-light">
        持久化存储店铺官方 Logo、品牌色盘与背书标语，一次配置，各模板全自动调用。
      </p>

      <!-- Expandable Configuration Form -->
      <div v-if="isBrandKitExpanded" class="space-y-3 pt-1 border-t border-chronicle-border/60">
        <!-- Brand Name & Slogan -->
        <div class="space-y-1.5">
          <label class="block text-[10px] font-medium text-chronicle-primary">店铺 / 品牌名称</label>
          <input
            type="text"
            :value="brandKit?.brandName || ''"
            @input="emit('updateBrandKit', { brandName: ($event.target as HTMLInputElement).value })"
            placeholder="例：CHRONICLE 旗舰店"
            class="w-full px-2.5 py-1.5 rounded-lg border border-chronicle-border bg-white text-xs font-light text-chronicle-primary"
          />
        </div>

        <div class="space-y-1.5">
          <label class="block text-[10px] font-medium text-chronicle-primary">官方承诺标语 (背书)</label>
          <input
            type="text"
            :value="brandKit?.brandTagline || ''"
            @input="emit('updateBrandKit', { brandTagline: ($event.target as HTMLInputElement).value })"
            placeholder="例：官方正品 · 顺丰速发 · 假一赔十"
            class="w-full px-2.5 py-1.5 rounded-lg border border-chronicle-border bg-white text-xs font-light text-chronicle-primary"
          />
        </div>

        <!-- Brand Colors -->
        <div class="space-y-1.5">
          <label class="block text-[10px] font-medium text-chronicle-primary">品牌色彩规范 (主色 / 辅色 / 点缀)</label>
          <div class="grid grid-cols-3 gap-2">
            <div class="flex items-center gap-1.5 p-1.5 rounded-lg border border-chronicle-border bg-white">
              <input
                type="color"
                :value="brandKit?.primaryColor || '#3d4451'"
                @input="emit('updateBrandKit', { primaryColor: ($event.target as HTMLInputElement).value })"
                class="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
              />
              <span class="text-[9px] text-chronicle-secondary">品牌主色</span>
            </div>
            <div class="flex items-center gap-1.5 p-1.5 rounded-lg border border-chronicle-border bg-white">
              <input
                type="color"
                :value="brandKit?.accentColor || '#82a1b9'"
                @input="emit('updateBrandKit', { accentColor: ($event.target as HTMLInputElement).value })"
                class="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
              />
              <span class="text-[9px] text-chronicle-secondary">辅助点缀</span>
            </div>
            <div class="flex items-center gap-1.5 p-1.5 rounded-lg border border-chronicle-border bg-white">
              <input
                type="color"
                :value="brandKit?.highlightColor || '#e11d48'"
                @input="emit('updateBrandKit', { highlightColor: ($event.target as HTMLInputElement).value })"
                class="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
              />
              <span class="text-[9px] text-chronicle-secondary">大促高光</span>
            </div>
          </div>
        </div>

        <!-- Permanent Brand Logo Uploader -->
        <div class="space-y-1.5">
          <label class="block text-[10px] font-medium text-chronicle-primary">常驻品牌 Logo 图形</label>
          <div v-if="brandKit?.logoSrc" class="flex items-center justify-between p-2 rounded-lg bg-white border border-chronicle-border">
            <img :src="brandKit.logoSrc" class="h-8 max-w-[120px] object-contain" alt="Brand Logo" />
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                @click="brandLogoInput?.click()"
                class="px-2 py-0.5 rounded border border-chronicle-border hover:bg-chronicle-fill text-[10px] transition"
              >
                更换
              </button>
              <button
                type="button"
                @click="emit('updateBrandKit', { logoSrc: '' })"
                class="p-1 rounded text-rose-500 hover:bg-rose-50 transition"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <button
            v-else
            type="button"
            @click="brandLogoInput?.click()"
            class="w-full py-2 px-3 rounded-lg border border-dashed border-chronicle-border hover:border-chronicle-accent bg-white text-chronicle-primary text-[10px] font-medium flex items-center justify-center gap-1.5 transition"
          >
            <Upload class="w-3 h-3 text-chronicle-accent" />
            <span>设置店铺常驻透明 Logo</span>
          </button>
        </div>
      </div>

      <!-- 1-Click Quick Actions using Brand Kit -->
      <div class="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          @click="emit('addBrandGuarantee', brandKit?.brandName || '官方旗舰', brandKit?.brandTagline || '官方正品 · 顺丰速发', brandKit?.primaryColor || '#3d4451')"
          class="p-2 rounded-lg border border-chronicle-border bg-white hover:border-chronicle-accent hover:bg-chronicle-fill text-left transition flex flex-col gap-0.5 shadow-xs"
        >
          <div class="text-[11px] font-medium text-chronicle-primary flex items-center gap-1.5">
            <Award class="w-3.5 h-3.5 text-chronicle-accent" />
            <span>插入官方背书长条</span>
          </div>
          <span class="text-[9px] text-chronicle-secondary font-mono truncate">
            {{ brandKit?.brandName || 'CHRONICLE' }} · 正品保证
          </span>
        </button>

        <button
          v-if="brandKit?.logoSrc"
          type="button"
          @click="emit('uploadLogo', brandKit.logoSrc)"
          class="p-2 rounded-lg border border-chronicle-border bg-white hover:border-chronicle-accent hover:bg-chronicle-fill text-left transition flex flex-col gap-0.5 shadow-xs"
        >
          <div class="text-[11px] font-medium text-chronicle-primary flex items-center gap-1.5">
            <Sparkles class="w-3.5 h-3.5 text-chronicle-accent" />
            <span>插入常驻品牌 Logo</span>
          </div>
          <span class="text-[9px] text-chronicle-secondary font-mono">一键贴图上画布</span>
        </button>

        <button
          v-else
          type="button"
          @click="isBrandKitExpanded = true"
          class="p-2 rounded-lg border border-dashed border-chronicle-border bg-white hover:bg-chronicle-fill text-left transition flex flex-col gap-0.5 shadow-xs"
        >
          <div class="text-[11px] font-medium text-chronicle-secondary flex items-center gap-1.5">
            <Plus class="w-3.5 h-3.5 text-chronicle-accent" />
            <span>配置常驻 Logo</span>
          </div>
          <span class="text-[9px] text-chronicle-secondary/70 font-mono">点击展开配置</span>
        </button>
      </div>
    </div>

    <!-- Custom Logo Upload Card -->
    <div class="border border-chronicle-border rounded-xl p-4 bg-chronicle-surface space-y-2 shadow-xs">
      <input
        ref="fileInput"
        type="file"
        accept="image/png,image/svg+xml,image/webp"
        class="hidden"
        @change="handleFileUpload"
      />
      <button
        @click="fileInput?.click()"
        class="w-full py-2.5 px-3 rounded-lg border border-chronicle-border bg-white hover:bg-chronicle-fill text-chronicle-primary font-medium flex items-center justify-center gap-2 transition active:scale-[0.99] shadow-xs"
      >
        <Upload class="w-3.5 h-3.5 text-chronicle-accent" />
        <span>上传店铺 Logo / 自定义贴图</span>
      </button>
      <p class="text-[10px] text-chronicle-secondary text-center font-light">
        支持透明背景 PNG 或矢量 SVG 格式，可任意拖拽与缩放
      </p>
    </div>

    <!-- Active SVG Color Picker (if selected) -->
    <div v-if="activeSvg" class="p-3.5 bg-white border border-chronicle-border rounded-xl space-y-2.5 shadow-xs">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <Sparkles class="w-3.5 h-3.5 text-chronicle-accent" />
          <span class="font-medium text-chronicle-primary font-serif">当前徽章色彩微调</span>
        </div>
        <button
          @click="pickBadgeColor"
          title="底图屏幕吸管取色"
          class="flex items-center gap-1 px-2 py-0.5 rounded border border-chronicle-border hover:bg-chronicle-fill text-[10px] text-chronicle-secondary hover:text-chronicle-accent transition shadow-xs"
        >
          <Pipette class="w-3 h-3" />
          <span>吸色</span>
        </button>
      </div>

      <div class="flex items-center justify-between gap-1 pt-1">
        <button
          @click="emit('updateSvgColor', '#e11d48')"
          title="大促红"
          class="w-6 h-6 rounded-full border border-chronicle-border bg-[#e11d48] shadow-xs"
        ></button>
        <button
          @click="emit('updateSvgColor', '#f59e0b')"
          title="金橙"
          class="w-6 h-6 rounded-full border border-chronicle-border bg-[#f59e0b] shadow-xs"
        ></button>
        <button
          @click="emit('updateSvgColor', '#82a1b9')"
          title="冰川蓝"
          class="w-6 h-6 rounded-full border border-chronicle-border bg-[#82a1b9] shadow-xs"
        ></button>
        <button
          @click="emit('updateSvgColor', '#10b981')"
          title="抹茶绿"
          class="w-6 h-6 rounded-full border border-chronicle-border bg-[#10b981] shadow-xs"
        ></button>
        <button
          @click="emit('updateSvgColor', '#3d4451')"
          title="墨灰色"
          class="w-6 h-6 rounded-full border border-chronicle-border bg-[#3d4451] shadow-xs"
        ></button>
        <button
          @click="emit('updateSvgColor', '#ffffff')"
          title="纯白"
          class="w-6 h-6 rounded-full border border-chronicle-border bg-white shadow-xs"
        ></button>
        <input
          type="color"
          :value="activeSvg.fill"
          @input="emit('updateSvgColor', ($event.target as HTMLInputElement).value)"
          class="w-7 h-7 rounded border border-chronicle-border bg-transparent cursor-pointer"
        />
      </div>
    </div>

    <!-- 卖点引线与便签组合快捷插入 (1-Click Sell-Point Callouts) -->
    <div class="border border-chronicle-border rounded-xl p-3.5 bg-chronicle-surface space-y-2.5 shadow-xs">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5 font-serif font-medium text-[11px] text-chronicle-primary">
          <Sparkles class="w-3.5 h-3.5 text-chronicle-accent" />
          <span>卖点引线与标注便签组</span>
        </div>
        <span class="text-[9px] text-chronicle-accent font-light">一键成对插入</span>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <button
          @click="emit('addCalloutPin', 'arrow', '升级钛合金轴承')"
          class="p-2 rounded-lg border border-chronicle-border bg-white hover:border-chronicle-accent hover:bg-chronicle-fill text-left transition flex flex-col gap-0.5 shadow-xs"
        >
          <div class="flex items-center gap-1.5 text-[11px] font-medium text-chronicle-primary">
            <ArrowUpRight class="w-3.5 h-3.5 text-chronicle-accent" />
            <span>弧形引线便签</span>
          </div>
          <span class="text-[9px] text-chronicle-secondary font-mono">「升级钛合金轴承」</span>
        </button>

        <button
          @click="emit('addCalloutPin', 'focus', '核心功效焦点')"
          class="p-2 rounded-lg border border-chronicle-border bg-white hover:border-chronicle-accent hover:bg-chronicle-fill text-left transition flex flex-col gap-0.5 shadow-xs"
        >
          <div class="flex items-center gap-1.5 text-[11px] font-medium text-chronicle-primary">
            <Target class="w-3.5 h-3.5 text-chronicle-accent" />
            <span>聚光焦点便签</span>
          </div>
          <span class="text-[9px] text-chronicle-secondary font-mono">「核心功效焦点」</span>
        </button>

        <button
          @click="emit('addCalloutPin', 'magnifier', '微观质感细节')"
          class="p-2 rounded-lg border border-chronicle-border bg-white hover:border-chronicle-accent hover:bg-chronicle-fill text-left transition flex flex-col gap-0.5 shadow-xs"
        >
          <div class="flex items-center gap-1.5 text-[11px] font-medium text-chronicle-primary">
            <Search class="w-3.5 h-3.5 text-chronicle-accent" />
            <span>质感放大便签</span>
          </div>
          <span class="text-[9px] text-chronicle-secondary font-mono">「微观质感细节」</span>
        </button>

        <button
          @click="emit('addCalloutPin', 'pindot', '原产地直采认证')"
          class="p-2 rounded-lg border border-chronicle-border bg-white hover:border-chronicle-accent hover:bg-chronicle-fill text-left transition flex flex-col gap-0.5 shadow-xs"
        >
          <div class="flex items-center gap-1.5 text-[11px] font-medium text-chronicle-primary">
            <MapPin class="w-3.5 h-3.5 text-chronicle-accent" />
            <span>锚点定位便签</span>
          </div>
          <span class="text-[9px] text-chronicle-secondary font-mono">「原产地直采认证」</span>
        </button>
      </div>
    </div>

    <!-- Built-in eCommerce Assets with Category Tabs -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <label class="text-[11px] font-medium text-chronicle-primary font-serif">
          电商与社媒高转化资产库
        </label>
        <span class="text-[10px] text-chronicle-accent flex items-center gap-1 font-light">
          <Move class="w-3 h-3" /> 自由拖动定位
        </span>
      </div>

      <!-- Category Filter Pills -->
      <div class="flex gap-1 overflow-x-auto pb-1">
        <button
          v-for="cat in ASSET_CATEGORIES"
          :key="cat.id"
          @click="selectedCategory = cat.id"
          class="px-2.5 py-1 rounded-lg text-[10px] transition shrink-0"
          :class="selectedCategory === cat.id ? 'bg-chronicle-primary text-white font-medium shadow-xs' : 'bg-white border border-chronicle-border text-chronicle-secondary hover:bg-chronicle-fill'"
        >
          {{ cat.name }}
        </button>
      </div>

      <!-- Assets Grid -->
      <div class="grid grid-cols-2 gap-2.5 max-h-[460px] overflow-y-auto pr-0.5">
        <button
          v-for="asset in filteredAssets"
          :key="asset.id"
          @click="emit('addSvg', asset.svg, asset.defaultFill, asset.defaultWidth, asset.defaultHeight)"
          class="p-3.5 rounded-xl border border-chronicle-border bg-white hover:border-chronicle-accent hover:bg-chronicle-fill flex flex-col items-center justify-center gap-2.5 transition group shadow-xs"
        >
          <div
            class="w-12 h-10 flex items-center justify-center text-chronicle-primary group-hover:scale-105 transition"
            :style="{ color: asset.defaultFill }"
            v-html="asset.svg"
          ></div>
          <span class="text-[11px] text-chronicle-secondary group-hover:text-chronicle-primary font-light text-center">
            {{ asset.name }}
          </span>
        </button>
      </div>

      <div class="p-3 rounded-lg bg-chronicle-fill border border-chronicle-border/60 text-[11px] text-chronicle-secondary font-light space-y-1">
        <div class="font-medium text-chronicle-primary flex items-center gap-1.5">
          <HelpCircle class="w-3.5 h-3.5 text-chronicle-secondary" />
          <span>徽章排版交互说明</span>
        </div>
        <div>• 点击任意徽章即可添加到图片画布中</div>
        <div>• 鼠标悬停可直接拖拽调整位置，拖拽四个控制角可等比缩放</div>
        <div>• 选中徽章后，可使用上方浮动工具栏进行层级调整、复制与删除</div>
      </div>
    </div>
  </div>
</template>
