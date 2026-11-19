import { ref } from 'vue'
import type Konva from 'konva'
import type { ExportOptions } from '@/types'

export function useExport() {
  const isExporting = ref(false)
  const isEstimating = ref(false)
  const estimatedSizeKb = ref<number | null>(null)

  let estimateTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * Convert Konva stage into an HTMLCanvasElement at actual preset resolution.
   * Automatically suppresses visual guide overlays so they never appear in exported files.
   */
  function getStageCanvas(stage: Konva.Stage, scale = 1): HTMLCanvasElement {
    const stageScale = stage.scaleX() || 1
    const guidesLayer = stage.findOne('.guides-layer') as Konva.Layer | null
    const snapLayer = stage.findOne('.snap-layer') as Konva.Layer | null
    const wasGuidesVisible = guidesLayer ? guidesLayer.visible() : false
    const wasSnapVisible = snapLayer ? snapLayer.visible() : false

    if (guidesLayer) guidesLayer.visible(false)
    if (snapLayer) snapLayer.visible(false)

    const canvas = stage.toCanvas({
      pixelRatio: (1 / stageScale) * scale
    })

    if (guidesLayer) guidesLayer.visible(wasGuidesVisible)
    if (snapLayer) snapLayer.visible(wasSnapVisible)
    return canvas
  }

  /**
   * Convert canvas to blob with format & quality
   */
  async function canvasToBlob(canvas: HTMLCanvasElement, format: string, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Canvas toBlob failed'))
        },
        format,
        quality
      )
    })
  }

  /**
   * Estimate exported file size in KB with debounce
   */
  function estimateFileSize(
    stage: Konva.Stage,
    options: ExportOptions,
    debounceMs = 150
  ) {
    if (estimateTimer) clearTimeout(estimateTimer)
    isEstimating.value = true

    estimateTimer = setTimeout(async () => {
      try {
        const canvas = getStageCanvas(stage, options.scale)
        const blob = await canvasToBlob(canvas, options.format, options.quality)
        estimatedSizeKb.value = Math.round(blob.size / 1024)
      } catch (err) {
        console.error('Estimate size error:', err)
        estimatedSizeKb.value = null
      } finally {
        isEstimating.value = false
      }
    }, debounceMs)
  }

  /**
   * Binary search for best quality fitting target size in KB
   */
  async function findOptimalQuality(
    stage: Konva.Stage,
    targetKb: number,
    format: string,
    scale: 1 | 2 = 1
  ): Promise<number> {
    const canvas = getStageCanvas(stage, scale)
    let low = 0.05
    let high = 1.0
    let bestQuality = 0.8
    const toleranceKb = 15

    for (let i = 0; i < 6; i++) {
      const mid = (low + high) / 2
      const blob = await canvasToBlob(canvas, format, mid)
      const currentKb = blob.size / 1024

      if (currentKb <= targetKb) {
        bestQuality = mid
        if (targetKb - currentKb <= toleranceKb) break
        low = mid
      } else {
        high = mid
      }
    }

    return Math.round(bestQuality * 100) / 100
  }

  /**
   * Export image and trigger browser download
   */
  async function downloadStage(
    stage: Konva.Stage,
    options: ExportOptions,
    filename = 'taggaze-export'
  ) {
    isExporting.value = true
    try {
      const canvas = getStageCanvas(stage, options.scale)
      const blob = await canvasToBlob(canvas, options.format, options.quality)
      
      const ext = options.format === 'image/webp' ? 'webp' : options.format === 'image/png' ? 'png' : 'jpg'
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.${ext}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } finally {
      isExporting.value = false
    }
  }

  return {
    isExporting,
    isEstimating,
    estimatedSizeKb,
    estimateFileSize,
    findOptimalQuality,
    downloadStage,
    getStageCanvas,
    canvasToBlob
  }
}
