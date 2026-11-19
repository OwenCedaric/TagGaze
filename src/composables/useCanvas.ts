import { ref, computed } from 'vue'
import { get, set } from 'idb-keyval'
import type { CanvasDimensions, CanvasElement, TextElement, ImageElement, SvgElement, GuideOverlayType, LayoutTemplate, SplitConfig, ProjectFile } from '@/types'
import { CANVAS_PRESETS } from '@/constants/presets'
import { TEXT_TIERS, type PromoBenefitPreset } from '@/constants/fonts'
import { SVG_ASSETS } from '@/constants/assets'
import { generateDemoHeroImage, generateDemoSplitImages } from '@/constants/demoImage'
import { useHistory } from './useHistory'

const STORAGE_KEY = 'taggaze_project_state'

export function useCanvas() {
  const currentPreset = ref<CanvasDimensions>(CANVAS_PRESETS[0]) // Default 3:4 (1200 x 1600)
  const elements = ref<CanvasElement[]>([])
  const selectedId = ref<string | null>(null)
  const isBaseImageLocked = ref(true)
  const canvasBgColor = ref('#ffffff') // Chronicle Light Pure Canvas
  const guideOverlay = ref<GuideOverlayType>('none')
  const enableSnapping = ref<boolean>(true) // Smart Magnetic Snapping
  const splitConfig = ref<SplitConfig>({
    mode: 'single',
    ratio: 0.5,
    dividerWidth: 4,
    dividerColor: '#ffffff',
    badge: 'none'
  })
  const isLoaded = ref(false)

  const selectedElement = computed(() => {
    return elements.value.find((el) => el.id === selectedId.value) || null
  })

  const baseImage = computed(() => {
    return elements.value.find(
      (el) => el.type === 'image' && (el as ImageElement).isBaseImage
    ) as ImageElement | undefined
  })

  const hasBaseImage = computed(() => {
    if (splitConfig.value.mode !== 'single') {
      return !!(splitConfig.value.imageA || splitConfig.value.imageB)
    }
    return !!baseImage.value
  })

  // History system
  const { canUndo, canRedo, record, undo: historyUndo, redo: historyRedo, reset: historyReset } = useHistory<{
    elements: CanvasElement[]
    preset: CanvasDimensions
    canvasBgColor: string
    splitConfig?: SplitConfig
  }>({
    elements: [],
    preset: currentPreset.value,
    canvasBgColor: canvasBgColor.value,
    splitConfig: splitConfig.value
  })

  function saveSnapshot() {
    record({
      elements: JSON.parse(JSON.stringify(elements.value)),
      preset: { ...currentPreset.value },
      canvasBgColor: canvasBgColor.value,
      splitConfig: JSON.parse(JSON.stringify(splitConfig.value))
    })
    persistState()
  }

  // IndexedDB Persistence
  async function persistState() {
    try {
      await set(STORAGE_KEY, {
        elements: JSON.parse(JSON.stringify(elements.value)),
        preset: JSON.parse(JSON.stringify(currentPreset.value)),
        canvasBgColor: canvasBgColor.value,
        splitConfig: JSON.parse(JSON.stringify(splitConfig.value)),
        updatedAt: Date.now()
      })
    } catch (err) {
      console.warn('Failed to save project to IndexedDB:', err)
    }
  }

  async function loadState() {
    try {
      const data = await get<{
        elements: CanvasElement[]
        preset: CanvasDimensions
        canvasBgColor?: string
        splitConfig?: SplitConfig
      }>(STORAGE_KEY)

      if (data && Array.isArray(data.elements)) {
        elements.value = data.elements
        if (data.preset) {
          currentPreset.value = data.preset
        }
        if (data.canvasBgColor) {
          canvasBgColor.value = data.canvasBgColor
        }
        if (data.splitConfig) {
          splitConfig.value = data.splitConfig
        }
        historyReset({
          elements: elements.value,
          preset: currentPreset.value,
          canvasBgColor: canvasBgColor.value,
          splitConfig: splitConfig.value
        })
      }
    } catch (err) {
      console.warn('Failed to restore project from IndexedDB:', err)
    } finally {
      isLoaded.value = true
    }
  }

  function undo() {
    const prevState = historyUndo()
    if (prevState) {
      elements.value = prevState.elements
      currentPreset.value = prevState.preset
      canvasBgColor.value = prevState.canvasBgColor || '#ffffff'
      if (prevState.splitConfig) {
        splitConfig.value = prevState.splitConfig
      }
      selectedId.value = null
      persistState()
    }
  }

  function redo() {
    const nextState = historyRedo()
    if (nextState) {
      elements.value = nextState.elements
      currentPreset.value = nextState.preset
      canvasBgColor.value = nextState.canvasBgColor || '#ffffff'
      if (nextState.splitConfig) {
        splitConfig.value = nextState.splitConfig
      }
      selectedId.value = null
      persistState()
    }
  }

  function setPreset(preset: CanvasDimensions) {
    currentPreset.value = preset
    if (baseImage.value) {
      calibrateBaseImageSize(baseImage.value, baseImage.value.fitMode || 'cover')
    }
    saveSnapshot()
  }

  function selectElement(id: string | null) {
    selectedId.value = id
  }

  function addText(tierOrCustom?: 'hero' | 'subtitle' | 'price' | 'body' | Partial<TextElement>) {
    let config: Partial<TextElement> = {}

    if (typeof tierOrCustom === 'string') {
      const tier = TEXT_TIERS.find((t) => t.id === tierOrCustom) || TEXT_TIERS[0]
      config = {
        text: tier.defaultText,
        fontFamily: tier.fontFamily,
        fontSize: tier.fontSize,
        fontWeight: tier.fontWeight,
        fill: tier.fill,
        backgroundColor: tier.backgroundColor,
        backgroundPadding: tier.backgroundPadding,
        backgroundRadius: tier.backgroundRadius,
        stroke: tier.stroke,
        strokeWidth: tier.strokeWidth,
        align: tier.align,
        y: tier.defaultY
      }
    } else if (tierOrCustom) {
      config = tierOrCustom
    } else {
      const tier = TEXT_TIERS[0]
      config = {
        text: tier.defaultText,
        fontFamily: tier.fontFamily,
        fontSize: tier.fontSize,
        fontWeight: tier.fontWeight,
        fill: tier.fill,
        align: tier.align,
        y: tier.defaultY
      }
    }

    const defaultWidth = config.fontSize && config.fontSize > 40 ? 640 : 800

    const newText: TextElement = {
      id: 'text_' + Date.now() + Math.random().toString(36).slice(2, 6),
      type: 'text',
      text: config.text || '营销文案描述',
      fontFamily: config.fontFamily || "'Noto Serif SC', serif",
      fontSize: config.fontSize || 48,
      fontWeight: config.fontWeight || '700',
      fill: config.fill || '#3d4451', // Chronicle Light Primary Ink
      align: config.align || 'center',
      lineHeight: config.lineHeight || 1.35,
      letterSpacing: config.letterSpacing || 0.5,
      x: config.x !== undefined ? config.x : (currentPreset.value.width - defaultWidth) / 2,
      y: config.y !== undefined ? config.y : currentPreset.value.height * 0.15,
      width: config.width || defaultWidth,
      height: 90,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      locked: false,
      zIndex: elements.value.length + 1,
      ...config
    }

    elements.value.push(newText)
    selectedId.value = newText.id
    saveSnapshot()
    return newText
  }

  function addPromoBenefit(preset: PromoBenefitPreset) {
    const targetPreset = currentPreset.value
    const pillWidth = Math.min(Math.round(targetPreset.width * 0.72), 760)

    const newBenefitText: TextElement = {
      id: 'text_benefit_' + Date.now(),
      type: 'text',
      text: preset.fullText,
      fontFamily: "'Noto Sans SC', sans-serif",
      fontSize: 34,
      fontWeight: '700',
      fill: preset.fill,
      backgroundColor: preset.backgroundColor,
      backgroundPadding: 14,
      backgroundRadius: preset.backgroundRadius || 6,
      align: 'center',
      lineHeight: 1.3,
      letterSpacing: 0.5,
      shadowColor: preset.shadowColor || 'rgba(0,0,0,0.2)',
      shadowBlur: 10,
      shadowOffsetY: 3,
      x: Math.round((targetPreset.width - pillWidth) / 2),
      y: Math.round(targetPreset.height * 0.82),
      width: pillWidth,
      height: 64,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      locked: false,
      zIndex: elements.value.length + 1
    }

    elements.value.push(newBenefitText)
    selectedId.value = newBenefitText.id
    saveSnapshot()
    return newBenefitText
  }

  function addBrandGuarantee(brandName: string, brandTagline: string, primaryColor: string) {
    const targetPreset = currentPreset.value
    const textContent = `【${brandName || '官方旗舰'}】${brandTagline || '官方正品 · 顺丰速发 · 假一赔十'}`
    const pillWidth = Math.min(targetPreset.width - 80, Math.max(460, textContent.length * 24 + 48))

    const brandEl: TextElement = {
      id: 'text_brand_' + Date.now(),
      type: 'text',
      text: textContent,
      fontFamily: "'Noto Sans SC', sans-serif",
      fontSize: 26,
      fontWeight: '700',
      fill: '#ffffff',
      backgroundColor: primaryColor || '#3d4451',
      backgroundPadding: 12,
      backgroundRadius: 6,
      align: 'center',
      lineHeight: 1.3,
      letterSpacing: 0.5,
      shadowColor: 'rgba(0,0,0,0.2)',
      shadowBlur: 10,
      shadowOffsetY: 3,
      x: Math.round((targetPreset.width - pillWidth) / 2),
      y: Math.round(targetPreset.height * 0.88),
      width: pillWidth,
      height: 56,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      locked: false,
      zIndex: elements.value.length + 1
    }

    elements.value.push(brandEl)
    selectedId.value = brandEl.id
    saveSnapshot()
    return brandEl
  }

  function calibrateBaseImageSize(imgEl: ImageElement, fitMode: 'cover' | 'contain') {
    const natW = imgEl.naturalWidth || currentPreset.value.width
    const natH = imgEl.naturalHeight || currentPreset.value.height
    const canvasW = currentPreset.value.width
    const canvasH = currentPreset.value.height

    imgEl.fitMode = fitMode

    if (fitMode === 'cover') {
      const scale = Math.max(canvasW / natW, canvasH / natH)
      imgEl.width = Math.round(natW * scale)
      imgEl.height = Math.round(natH * scale)
      imgEl.x = Math.round((canvasW - imgEl.width) / 2)
      imgEl.y = Math.round((canvasH - imgEl.height) / 2)
    } else {
      const scale = Math.min(canvasW / natW, canvasH / natH)
      imgEl.width = Math.round(natW * scale)
      imgEl.height = Math.round(natH * scale)
      imgEl.x = Math.round((canvasW - imgEl.width) / 2)
      imgEl.y = Math.round((canvasH - imgEl.height) / 2)
    }
  }

  function setBaseImage(src: string, fitMode: 'cover' | 'contain' = 'cover') {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const baseEl: ImageElement = {
        id: 'base_img_' + Date.now(),
        type: 'image',
        src,
        isBaseImage: true,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        fitMode,
        x: 0,
        y: 0,
        width: currentPreset.value.width,
        height: currentPreset.value.height,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        locked: isBaseImageLocked.value,
        zIndex: 0
      }

      calibrateBaseImageSize(baseEl, fitMode)

      elements.value = elements.value.filter(
        (el) => !(el.type === 'image' && (el as ImageElement).isBaseImage)
      )
      elements.value.unshift(baseEl)
      selectedId.value = null
      saveSnapshot()
    }
    img.src = src
  }

  function updateBaseImageFit(fitMode: 'cover' | 'contain') {
    if (baseImage.value) {
      calibrateBaseImageSize(baseImage.value, fitMode)
      saveSnapshot()
    }
  }

  function removeBaseImage() {
    elements.value = elements.value.filter(
      (el) => !(el.type === 'image' && (el as ImageElement).isBaseImage)
    )
    saveSnapshot()
  }

  function addSticker(src: string) {
    const imgEl: ImageElement = {
      id: 'sticker_' + Date.now() + Math.random().toString(36).slice(2, 6),
      type: 'image',
      src,
      isBaseImage: false,
      x: currentPreset.value.width / 2 - 120,
      y: currentPreset.value.height / 2 - 120,
      width: 240,
      height: 240,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      locked: false,
      zIndex: elements.value.length + 1
    }

    elements.value.push(imgEl)
    selectedId.value = imgEl.id
    saveSnapshot()
    return imgEl
  }

  function addSvg(
    svgContent: string,
    fill = '#82a1b9',
    customWidth?: number,
    customHeight?: number,
    customX?: number,
    customY?: number
  ) {
    let width = customWidth || 120
    let height = customHeight || 120

    // Auto-calculate dimensions from viewBox if not passed explicitly
    if (!customWidth || !customHeight) {
      const vbMatch = svgContent.match(/viewBox=["']([\d.\s-]+)["']/)
      if (vbMatch) {
        const parts = vbMatch[1].trim().split(/\s+/).map(Number)
        if (parts.length === 4 && parts[2] && parts[3]) {
          const aspect = parts[2] / parts[3]
          if (aspect >= 3) {
            width = 200
            height = Math.round(200 / aspect)
          } else if (aspect <= 0.5) {
            height = 140
            width = Math.round(140 * aspect)
          } else {
            width = 110
            height = Math.round(110 / aspect)
          }
        }
      }
    }

    const posX = customX !== undefined ? customX : Math.round((currentPreset.value.width - width) / 2)
    const posY = customY !== undefined ? customY : Math.round(currentPreset.value.height * 0.72)

    const svgEl: SvgElement = {
      id: 'svg_' + Date.now() + Math.random().toString(36).slice(2, 6),
      type: 'svg',
      svgContent,
      fill,
      x: posX,
      y: posY,
      width,
      height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      locked: false,
      zIndex: elements.value.length + 1
    }

    elements.value.push(svgEl)
    selectedId.value = svgEl.id
    saveSnapshot()
    return svgEl
  }

  function loadDemoTemplate() {
    const demoUrl = generateDemoHeroImage()
    if (!demoUrl) return

    const img = new Image()
    img.onload = () => {
      const baseEl: ImageElement = {
        id: 'base_img_' + Date.now(),
        type: 'image',
        src: demoUrl,
        isBaseImage: true,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        fitMode: 'cover',
        x: 0,
        y: 0,
        width: currentPreset.value.width,
        height: currentPreset.value.height,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        locked: isBaseImageLocked.value,
        zIndex: 0
      }
      calibrateBaseImageSize(baseEl, 'cover')

      elements.value = [baseEl]

      // 1. Add Marketing Hero title
      const heroTier = TEXT_TIERS.find((t) => t.id === 'hero')
      if (heroTier) {
        addText('hero')
      }

      // 2. Add Default Badge: Five Stars Review
      const defaultBadge = SVG_ASSETS.find((a) => a.id === 'badge-5stars') || SVG_ASSETS[0]
      if (defaultBadge) {
        addSvg(
          defaultBadge.svg,
          defaultBadge.defaultFill,
          defaultBadge.defaultWidth,
          defaultBadge.defaultHeight,
          Math.round((currentPreset.value.width - (defaultBadge.defaultWidth || 200)) / 2),
          1180
        )
      }

      // 3. Add Price bar
      const priceTier = TEXT_TIERS.find((t) => t.id === 'price')
      if (priceTier) {
        addText('price')
      }

      selectedId.value = null
      saveSnapshot()
    }
    img.src = demoUrl
  }

  function applyTemplate(template: LayoutTemplate) {
    const targetPreset = CANVAS_PRESETS.find((p) => p.ratio === template.presetRatio) || currentPreset.value
    currentPreset.value = targetPreset

    function populateTemplateElements(baseImgEl: ImageElement) {
      calibrateBaseImageSize(baseImgEl, 'cover')
      const newElements: CanvasElement[] = [baseImgEl]

      for (const item of template.elements) {
        if (item.type === 'text') {
          const textItem = item as Partial<TextElement>
          const defaultW = textItem.fontSize && textItem.fontSize > 40 ? 700 : 800
          const textEl: TextElement = {
            id: 'text_' + Date.now() + Math.random().toString(36).slice(2, 6),
            type: 'text',
            text: textItem.text || '营销文案',
            fontFamily: textItem.fontFamily || "'Noto Serif SC', serif",
            fontSize: textItem.fontSize || 48,
            fontWeight: textItem.fontWeight || '700',
            fill: textItem.fill || '#3d4451',
            align: textItem.align || 'center',
            lineHeight: textItem.lineHeight || 1.35,
            letterSpacing: textItem.letterSpacing || 0.5,
            x: textItem.x !== undefined ? textItem.x : Math.round((targetPreset.width - (textItem.width || defaultW)) / 2),
            y: textItem.y !== undefined ? textItem.y : Math.round(targetPreset.height * 0.15),
            width: textItem.width || defaultW,
            height: 90,
            rotation: textItem.rotation || 0,
            scaleX: 1,
            scaleY: 1,
            opacity: 1,
            locked: false,
            zIndex: newElements.length + 1,
            backgroundColor: textItem.backgroundColor,
            backgroundPadding: textItem.backgroundPadding,
            backgroundRadius: textItem.backgroundRadius,
            stroke: textItem.stroke,
            strokeWidth: textItem.strokeWidth
          }
          newElements.push(textEl)
        } else if (item.type === 'svg') {
          const svgItem = item as Partial<SvgElement>
          const w = svgItem.width || 120
          const h = svgItem.height || 120
          const svgEl: SvgElement = {
            id: 'svg_' + Date.now() + Math.random().toString(36).slice(2, 6),
            type: 'svg',
            svgContent: svgItem.svgContent || '',
            fill: svgItem.fill || '#82a1b9',
            x: svgItem.x !== undefined ? svgItem.x : Math.round((targetPreset.width - w) / 2),
            y: svgItem.y !== undefined ? svgItem.y : Math.round(targetPreset.height * 0.72),
            width: w,
            height: h,
            rotation: svgItem.rotation || 0,
            scaleX: 1,
            scaleY: 1,
            opacity: 1,
            locked: false,
            zIndex: newElements.length + 1
          }
          newElements.push(svgEl)
        }
      }

      elements.value = newElements
      selectedId.value = null
      saveSnapshot()
    }

    if (baseImage.value) {
      populateTemplateElements(baseImage.value)
    } else {
      const demoUrl = generateDemoHeroImage()
      if (!demoUrl) return
      const img = new Image()
      img.onload = () => {
        const baseEl: ImageElement = {
          id: 'base_img_' + Date.now(),
          type: 'image',
          src: demoUrl,
          isBaseImage: true,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          fitMode: 'cover',
          x: 0,
          y: 0,
          width: targetPreset.width,
          height: targetPreset.height,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          locked: isBaseImageLocked.value,
          zIndex: 0
        }
        populateTemplateElements(baseEl)
      }
      img.src = demoUrl
    }
  }

  function updateElement(id: string, partial: Partial<CanvasElement>) {
    const idx = elements.value.findIndex((el) => el.id === id)
    if (idx !== -1) {
      elements.value[idx] = { ...elements.value[idx], ...partial } as CanvasElement
      saveSnapshot()
    }
  }

  function removeElement(id: string) {
    elements.value = elements.value.filter((el) => el.id !== id)
    if (selectedId.value === id) {
      selectedId.value = null
    }
    saveSnapshot()
  }

  function duplicateElement(id: string) {
    const el = elements.value.find((e) => e.id === id)
    if (!el || (el.type === 'image' && (el as ImageElement).isBaseImage)) return

    const clone: CanvasElement = {
      ...JSON.parse(JSON.stringify(el)),
      id: el.type + '_' + Date.now(),
      x: el.x + 30,
      y: el.y + 30,
      zIndex: elements.value.length + 1
    }

    elements.value.push(clone)
    selectedId.value = clone.id
    saveSnapshot()
  }

  function bringForward(id: string) {
    const idx = elements.value.findIndex((e) => e.id === id)
    if (idx !== -1 && idx < elements.value.length - 1) {
      const temp = elements.value[idx]
      elements.value[idx] = elements.value[idx + 1]
      elements.value[idx + 1] = temp
      saveSnapshot()
    }
  }

  function sendBackward(id: string) {
    const idx = elements.value.findIndex((e) => e.id === id)
    if (idx > 0) {
      if (idx === 1 && (elements.value[0] as ImageElement).isBaseImage) return
      const temp = elements.value[idx]
      elements.value[idx] = elements.value[idx - 1]
      elements.value[idx - 1] = temp
      saveSnapshot()
    }
  }

  function toggleLock(id: string) {
    const el = elements.value.find((e) => e.id === id)
    if (el) {
      el.locked = !el.locked
      saveSnapshot()
    }
  }

  function toggleSnapping() {
    enableSnapping.value = !enableSnapping.value
  }

  function updateSplitConfig(partial: Partial<SplitConfig>) {
    splitConfig.value = { ...splitConfig.value, ...partial }
    saveSnapshot()
  }

  function setSplitImage(slot: 'A' | 'B', src: string) {
    if (slot === 'A') {
      splitConfig.value.imageA = src
    } else {
      splitConfig.value.imageB = src
    }
    saveSnapshot()
  }

  function loadDemoSplitImages() {
    const demos = generateDemoSplitImages()
    splitConfig.value = {
      mode: 'split-vertical',
      ratio: 0.5,
      dividerWidth: 4,
      dividerColor: '#ffffff',
      badge: 'vs',
      imageA: demos.imageA,
      imageB: demos.imageB
    }
    saveSnapshot()
  }

  function addCalloutPin(type: 'arrow' | 'focus' | 'magnifier' | 'pindot', labelText: string) {
    const W = currentPreset.value.width
    const H = currentPreset.value.height

    let assetId = 'arrow-curved-right'
    let defaultFill = '#e11d48'
    let defaultW = 100
    let defaultH = 80

    if (type === 'focus') {
      assetId = 'callout-focus-ring'
      defaultFill = '#f59e0b'
      defaultW = 90
      defaultH = 90
    } else if (type === 'magnifier') {
      assetId = 'callout-magnifier'
      defaultFill = '#82a1b9'
      defaultW = 90
      defaultH = 90
    } else if (type === 'pindot') {
      assetId = 'callout-pin-dot'
      defaultFill = '#10b981'
      defaultW = 75
      defaultH = 85
    }

    const asset = SVG_ASSETS.find((a) => a.id === assetId)
    if (!asset) return

    // Position pointer near center left
    const ptrX = Math.round(W * 0.3)
    const ptrY = Math.round(H * 0.46)

    // Add pointer SVG
    const svgEl = addSvg(asset.svg, asset.defaultFill || defaultFill, defaultW, defaultH, ptrX, ptrY)

    // Add label next to pointer
    const textW = Math.max(220, labelText.length * 28 + 40)
    const labelX = ptrX + defaultW + 16
    const labelY = ptrY + Math.round((defaultH - 46) / 2)

    const calloutText: TextElement = {
      id: 'text_' + Date.now() + Math.random().toString(36).slice(2, 6),
      type: 'text',
      text: labelText,
      fontFamily: "'Noto Sans SC', sans-serif",
      fontSize: 24,
      fontWeight: '700',
      fill: '#ffffff',
      backgroundColor: '#3d4451',
      backgroundPadding: 10,
      backgroundRadius: 6,
      align: 'center',
      lineHeight: 1.2,
      letterSpacing: 0.5,
      shadowColor: 'rgba(0,0,0,0.2)',
      shadowBlur: 8,
      shadowOffsetY: 2,
      x: labelX,
      y: labelY,
      width: textW,
      height: 48,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      locked: false,
      zIndex: elements.value.length + 1
    }

    elements.value.push(calloutText)
    selectedId.value = calloutText.id
    saveSnapshot()
    return { svgEl, calloutText }
  }

  function restoreProject(project: ProjectFile) {
    if (project.preset) {
      currentPreset.value = project.preset
    }
    if (project.canvasBgColor) {
      canvasBgColor.value = project.canvasBgColor
    }
    if (Array.isArray(project.elements)) {
      elements.value = JSON.parse(JSON.stringify(project.elements))
    }
    if (project.splitConfig) {
      splitConfig.value = JSON.parse(JSON.stringify(project.splitConfig))
    }
    if (project.guideOverlay) {
      guideOverlay.value = project.guideOverlay
    }
    selectedId.value = null
    saveSnapshot()
  }

  return {
    currentPreset,
    elements,
    selectedId,
    selectedElement,
    baseImage,
    hasBaseImage,
    canvasBgColor,
    isBaseImageLocked,
    isLoaded,
    canUndo,
    canRedo,
    undo,
    redo,
    loadState,
    setPreset,
    selectElement,
    addText,
    addPromoBenefit,
    addBrandGuarantee,
    addCalloutPin,
    setBaseImage,
    updateBaseImageFit,
    removeBaseImage,
    addSticker,
    addSvg,
    updateElement,
    removeElement,
    duplicateElement,
    bringForward,
    sendBackward,
    toggleLock,
    loadDemoTemplate,
    loadDemoSplitImages,
    guideOverlay,
    applyTemplate,
    enableSnapping,
    toggleSnapping,
    splitConfig,
    updateSplitConfig,
    setSplitImage,
    restoreProject
  }
}
