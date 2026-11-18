import { ref } from 'vue'
import type { WatermarkConfig } from '@/types'

export function useWatermark() {
  const watermark = ref<WatermarkConfig>({
    enabled: false,
    text: '@TagGaze Official',
    mode: 'grid',
    opacity: 0.25,
    fontSize: 24,
    angle: -30,
    color: '#FFFFFF',
    gapX: 200,
    gapY: 150
  })

  function toggleWatermark(enabled?: boolean) {
    watermark.value.enabled = enabled !== undefined ? enabled : !watermark.value.enabled
  }

  function updateWatermark(partial: Partial<WatermarkConfig>) {
    Object.assign(watermark.value, partial)
  }

  return {
    watermark,
    toggleWatermark,
    updateWatermark
  }
}
