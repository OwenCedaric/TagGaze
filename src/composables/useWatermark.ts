import { ref, watch, onMounted } from 'vue'
import { get, set } from 'idb-keyval'
import type { WatermarkConfig } from '@/types'

const WATERMARK_STORAGE_KEY = 'taggaze_watermark_state'

export const DEFAULT_WATERMARK: WatermarkConfig = {
  enabled: true, // Default enabled as requested
  type: 'text',
  text: '@TagGaze Official',
  imageSrc: '',
  imageWidth: 160,
  imageHeight: 160,
  mode: 'single',
  opacity: 0.25,
  fontSize: 24,
  angle: -30,
  color: '#FFFFFF',
  gapX: 200,
  gapY: 150,
  x: undefined,
  y: undefined
}

/**
 * Synchronously retrieve initial watermark configuration from localStorage
 * to prevent any visual delay or UI flicker on initial mount.
 */
function getInitialWatermark(): WatermarkConfig {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(WATERMARK_STORAGE_KEY) : null
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        return {
          ...DEFAULT_WATERMARK,
          ...parsed
        }
      }
    }
  } catch (e) {
    console.warn('Failed to parse watermark from localStorage:', e)
  }
  return { ...DEFAULT_WATERMARK }
}

export function useWatermark() {
  const watermark = ref<WatermarkConfig>(getInitialWatermark())

  async function persistWatermark() {
    const snapshot = JSON.parse(JSON.stringify(watermark.value))
    try {
      // 1. IndexedDB persistence (capable of storing large image data URLs)
      await set(WATERMARK_STORAGE_KEY, snapshot)
      // 2. Synchronous localStorage for instantaneous restore
      try {
        localStorage.setItem(WATERMARK_STORAGE_KEY, JSON.stringify(snapshot))
      } catch (storageErr) {
        // If imageSrc exceeds localStorage quota, safely store settings without the raw image
        const safeSnapshot = { ...snapshot, imageSrc: '' }
        localStorage.setItem(WATERMARK_STORAGE_KEY, JSON.stringify(safeSnapshot))
      }
    } catch (e) {
      console.warn('Failed to persist watermark:', e)
    }
  }

  async function loadWatermarkState() {
    try {
      const saved = await get<WatermarkConfig>(WATERMARK_STORAGE_KEY)
      if (saved && typeof saved === 'object') {
        Object.assign(watermark.value, {
          ...DEFAULT_WATERMARK,
          ...saved
        })
      } else {
        // First visit: persist the default enabled watermark
        await persistWatermark()
      }
    } catch (e) {
      console.warn('Failed to restore watermark from IndexedDB:', e)
    }
  }

  function toggleWatermark(enabled?: boolean) {
    watermark.value.enabled = enabled !== undefined ? enabled : !watermark.value.enabled
  }

  function updateWatermark(partial: Partial<WatermarkConfig>) {
    Object.assign(watermark.value, partial)
  }

  function resetWatermarkPosition() {
    watermark.value.x = undefined
    watermark.value.y = undefined
  }

  // Deep watcher: automatically save any modifications to IndexedDB & localStorage
  watch(
    watermark,
    () => {
      persistWatermark()
    },
    { deep: true }
  )

  onMounted(() => {
    loadWatermarkState()
  })

  return {
    watermark,
    toggleWatermark,
    updateWatermark,
    resetWatermarkPosition,
    loadWatermarkState
  }
}
