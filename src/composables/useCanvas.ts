import { ref, computed } from 'vue'
import { get, set } from 'idb-keyval'
import type { CanvasDimensions, CanvasElement, TextElement, ImageElement, SvgElement } from '@/types'
import { CANVAS_PRESETS } from '@/constants/presets'
import { useHistory } from './useHistory'

const STORAGE_KEY = 'taggaze_project_state'

export function useCanvas() {
  const currentPreset = ref<CanvasDimensions>(CANVAS_PRESETS[0]) // Default 3:4 (1200 x 1600)
  const elements = ref<CanvasElement[]>([])
  const selectedId = ref<string | null>(null)
  const isBaseImageLocked = ref(true)
  const isLoaded = ref(false)

  const selectedElement = computed(() => {
    return elements.value.find((el) => el.id === selectedId.value) || null
  })

  // History system
  const { canUndo, canRedo, record, undo: historyUndo, redo: historyRedo, reset: historyReset } = useHistory<{
    elements: CanvasElement[]
    preset: CanvasDimensions
  }>({
    elements: [],
    preset: currentPreset.value
  })

  function saveSnapshot() {
    record({
      elements: JSON.parse(JSON.stringify(elements.value)),
      preset: { ...currentPreset.value }
    })
    persistState()
  }

  // IndexedDB Persistence
  async function persistState() {
    try {
      await set(STORAGE_KEY, {
        elements: elements.value,
        preset: currentPreset.value,
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
      }>(STORAGE_KEY)

      if (data && Array.isArray(data.elements)) {
        elements.value = data.elements
        if (data.preset) {
          currentPreset.value = data.preset
        }
        historyReset({
          elements: elements.value,
          preset: currentPreset.value
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
      selectedId.value = null
      persistState()
    }
  }

  function redo() {
    const nextState = historyRedo()
    if (nextState) {
      elements.value = nextState.elements
      currentPreset.value = nextState.preset
      selectedId.value = null
      persistState()
    }
  }

  function setPreset(preset: CanvasDimensions) {
    currentPreset.value = preset
    saveSnapshot()
  }

  function selectElement(id: string | null) {
    selectedId.value = id
  }

  function addText(custom: Partial<TextElement> = {}) {
    const newText: TextElement = {
      id: 'text_' + Date.now() + Math.random().toString(36).slice(2, 6),
      type: 'text',
      text: custom.text || '双击编辑营销标题',
      fontFamily: custom.fontFamily || "'Bebas Neue', sans-serif",
      fontSize: custom.fontSize || 64,
      fontWeight: custom.fontWeight || 'bold',
      fill: custom.fill || '#FFFFFF',
      align: custom.align || 'center',
      lineHeight: 1.2,
      letterSpacing: 0,
      x: currentPreset.value.width / 2 - 200,
      y: currentPreset.value.height / 2 - 50,
      width: 400,
      height: 100,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      locked: false,
      zIndex: elements.value.length + 1,
      ...custom
    }

    elements.value.push(newText)
    selectedId.value = newText.id
    saveSnapshot()
    return newText
  }

  function addImage(src: string, isBase = false) {
    const imgEl: ImageElement = {
      id: 'img_' + Date.now() + Math.random().toString(36).slice(2, 6),
      type: 'image',
      src,
      isBaseImage: isBase,
      x: 0,
      y: 0,
      width: currentPreset.value.width,
      height: currentPreset.value.height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      locked: isBase ? isBaseImageLocked.value : false,
      zIndex: isBase ? 0 : elements.value.length + 1
    }

    if (isBase) {
      // Remove any existing base image
      elements.value = elements.value.filter((el) => !(el.type === 'image' && (el as ImageElement).isBaseImage))
      elements.value.unshift(imgEl)
      selectedId.value = null
    } else {
      // Regular sticker/logo placed in center
      imgEl.width = 240
      imgEl.height = 240
      imgEl.x = currentPreset.value.width / 2 - 120
      imgEl.y = currentPreset.value.height / 2 - 120
      elements.value.push(imgEl)
      selectedId.value = imgEl.id
    }

    saveSnapshot()
    return imgEl
  }

  function addSvg(svgContent: string, fill = '#FBBF24') {
    const svgEl: SvgElement = {
      id: 'svg_' + Date.now() + Math.random().toString(36).slice(2, 6),
      type: 'svg',
      svgContent,
      fill,
      x: currentPreset.value.width / 2 - 80,
      y: currentPreset.value.height / 2 - 80,
      width: 160,
      height: 160,
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
      // Do not move below base image
      if (idx === 1 && (elements.value[0] as ImageElement).isBaseImage) return
      const temp = elements.value[idx]
      elements.value[idx] = elements.value[idx - 1]
      elements.value[idx - 1] = temp
      saveSnapshot()
    }
  }

  function bringToFront(id: string) {
    const idx = elements.value.findIndex((e) => e.id === id)
    if (idx !== -1 && idx < elements.value.length - 1) {
      const [item] = elements.value.splice(idx, 1)
      elements.value.push(item)
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

  return {
    currentPreset,
    elements,
    selectedId,
    selectedElement,
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
    addImage,
    addSvg,
    updateElement,
    removeElement,
    duplicateElement,
    bringForward,
    sendBackward,
    bringToFront,
    toggleLock
  }
}
