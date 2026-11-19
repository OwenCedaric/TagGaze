import { ref, onMounted } from 'vue'
import { get, set } from 'idb-keyval'
import type { BrandKitConfig } from '@/types'

const BRAND_KIT_STORAGE_KEY = 'taggaze_brand_kit'

const DEFAULT_BRAND_KIT: BrandKitConfig = {
  brandName: 'CHRONICLE 旗舰店',
  brandTagline: '官方正品 · 顺丰包邮 · 假一赔十',
  primaryColor: '#3d4451',
  accentColor: '#82a1b9',
  highlightColor: '#e11d48',
  logoSrc: ''
}

export function useBrandKit() {
  const brandKit = ref<BrandKitConfig>({ ...DEFAULT_BRAND_KIT })
  const isLoaded = ref(false)

  async function loadBrandKit() {
    try {
      const saved = await get<BrandKitConfig>(BRAND_KIT_STORAGE_KEY)
      if (saved && typeof saved === 'object') {
        brandKit.value = {
          ...DEFAULT_BRAND_KIT,
          ...saved
        }
      }
    } catch (err) {
      console.warn('Failed to load brand kit from IndexedDB:', err)
    } finally {
      isLoaded.value = true
    }
  }

  async function updateBrandKit(partial: Partial<BrandKitConfig>) {
    brandKit.value = {
      ...brandKit.value,
      ...partial,
      updatedAt: Date.now()
    }
    try {
      await set(BRAND_KIT_STORAGE_KEY, JSON.parse(JSON.stringify(brandKit.value)))
    } catch (err) {
      console.warn('Failed to save brand kit to IndexedDB:', err)
    }
  }

  async function setBrandLogo(src: string) {
    await updateBrandKit({ logoSrc: src })
  }

  async function removeBrandLogo() {
    await updateBrandKit({ logoSrc: '' })
  }

  async function resetBrandKit() {
    brandKit.value = { ...DEFAULT_BRAND_KIT, updatedAt: Date.now() }
    try {
      await set(BRAND_KIT_STORAGE_KEY, JSON.parse(JSON.stringify(brandKit.value)))
    } catch (err) {
      console.warn('Failed to reset brand kit:', err)
    }
  }

  onMounted(() => {
    loadBrandKit()
  })

  return {
    brandKit,
    isLoaded,
    loadBrandKit,
    updateBrandKit,
    setBrandLogo,
    removeBrandLogo,
    resetBrandKit
  }
}
