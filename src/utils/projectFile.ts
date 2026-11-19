import type {
  ProjectFile,
  CanvasDimensions,
  CanvasElement,
  WatermarkConfig,
  SplitConfig,
  GuideOverlayType,
  BrandKitConfig
} from '@/types'

/**
 * Exports current TagGaze project to a downloadable `.taggaze` JSON bundle
 */
export function exportProjectFile(
  preset: CanvasDimensions,
  canvasBgColor: string,
  elements: CanvasElement[],
  watermark: WatermarkConfig,
  splitConfig?: SplitConfig,
  guideOverlay?: GuideOverlayType,
  brandKit?: BrandKitConfig
): void {
  const project: ProjectFile = {
    version: '1.0',
    appName: 'TagGaze',
    createdAt: Date.now(),
    preset,
    canvasBgColor,
    elements: JSON.parse(JSON.stringify(elements)),
    splitConfig: splitConfig ? JSON.parse(JSON.stringify(splitConfig)) : undefined,
    watermark: JSON.parse(JSON.stringify(watermark)),
    guideOverlay,
    brandKit: brandKit ? JSON.parse(JSON.stringify(brandKit)) : undefined
  }

  const jsonStr = JSON.stringify(project, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const ratioStr = (preset.ratio || '3x4').replace(':', 'x')
  a.href = url
  a.download = `TagGaze-${ratioStr}-${dateStr}.taggaze`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Validates and parses an uploaded `.taggaze` project file
 */
export async function parseProjectFile(file: File): Promise<ProjectFile> {
  const text = await file.text()
  let data: any
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('工程文件解析失败：文件不是合法的 JSON 格式。')
  }

  if (!data || data.appName !== 'TagGaze') {
    throw new Error('工程文件无效：不是 TagGaze 标准工程文件 (.taggaze)。')
  }

  if (!Array.isArray(data.elements)) {
    throw new Error('工程文件损坏：缺少图层元素数据。')
  }

  if (!data.preset || typeof data.preset.width !== 'number' || typeof data.preset.height !== 'number') {
    throw new Error('工程文件损坏：缺少有效画幅基准。')
  }

  return data as ProjectFile
}
