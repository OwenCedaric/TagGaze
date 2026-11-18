import { ref, computed } from 'vue'

export function useHistory<T>(initialState: T, maxDepth = 25) {
  const history = ref<string[]>([JSON.stringify(initialState)]) as { value: string[] }
  const currentIndex = ref(0)
  const isExecuting = ref(false)

  const canUndo = computed(() => currentIndex.value > 0)
  const canRedo = computed(() => currentIndex.value < history.value.length - 1)

  function record(state: T) {
    if (isExecuting.value) return

    const serialized = JSON.stringify(state)
    // Avoid recording identical consecutive states
    if (history.value[currentIndex.value] === serialized) return

    // Truncate redo stack when new action is taken
    history.value = history.value.slice(0, currentIndex.value + 1)
    history.value.push(serialized)

    if (history.value.length > maxDepth) {
      history.value.shift()
    } else {
      currentIndex.value++
    }
  }

  function undo(): T | null {
    if (!canUndo.value) return null
    isExecuting.value = true
    currentIndex.value--
    const state = JSON.parse(history.value[currentIndex.value]) as T
    setTimeout(() => { isExecuting.value = false }, 0)
    return state
  }

  function redo(): T | null {
    if (!canRedo.value) return null
    isExecuting.value = true
    currentIndex.value++
    const state = JSON.parse(history.value[currentIndex.value]) as T
    setTimeout(() => { isExecuting.value = false }, 0)
    return state
  }

  function reset(state: T) {
    history.value = [JSON.stringify(state)]
    currentIndex.value = 0
  }

  return {
    canUndo,
    canRedo,
    record,
    undo,
    redo,
    reset
  }
}
