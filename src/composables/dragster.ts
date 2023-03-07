/*
  DRAGSTER
  drag and drop composable for Vue 3
*/
import { onMounted, onUnmounted, type Ref, ref } from 'vue'
import type { Preview, EventType, IDType, DragsterParameters } from './types'
import { useEventHook } from './utils/useEventHook'

export function useDragster<T extends IDType>({
  items = [],
  dropZoneClass = '',
  itemClass = ''
}: DragsterParameters<T>): {
  lists: Ref<T[][]>
  onDragEnd: (fn: () => void) => {
    off: () => void
  }
} {
  // I like this line to be blank
  // but prettier doesn't like it
  // so here's three lines of comments
  const lists = ref(items) as Ref<T[][]> // reactive list

  let allElements: NodeList | HTMLElement[] = [] // the actual DOM nodes
  let startingLists = JSON.parse(JSON.stringify(items)) // starting value before dragging

  let elem: HTMLElement | null = null // the real element that's currently being tracked
  let dragging: HTMLElement | null | undefined = null // the copied element being dragged

  let startX = 0 // The x-coordinate where the drag started
  let startY = 0 // The y-coordinate where the drag started

  // 🔄 INDECES TO KEEP TRACK OF
  let originalIndex = -1 // -> index of theelement that is being dragged
  let originalListIndex = -1 // -> the index of the list that hosted the starting element
  let targetListIndex = -1 // -> index of the list of destination
  let targetIndex = -1 // -> index of the destination item

  let originalItem: T | null = null // this is the original item being dragged
  let addedPreview: Preview | null = null // indeces of the preview

  let previousTarget: HTMLElement | null = null
  let isTouchDevice: boolean = false

  const dragEvent = useEventHook()

  onUnmounted(() => {
    removeEventListeners()
  })

  onMounted(() => {
    allElements = document.querySelectorAll(`.${dropZoneClass}`)
    isTouchDevice = typeof window.ontouchstart !== 'undefined'

    isTouchDevice
      ? window.addEventListener('touchstart', initialiseDrag, { passive: false })
      : window.addEventListener('mousedown', initialiseDrag)
  })

  function initialiseDrag(e: EventType) {
    e.preventDefault()
    if (e.target instanceof HTMLElement) {
      elem = e.target?.closest(`.${itemClass}`) as HTMLElement

      if (!elem) {
        return
      }
      dragging = elem?.cloneNode(true) as HTMLElement

      if (!dragging) {
        return
      }

      // find index of the dragged item
      // relative to the lists
      for (const [i, list] of Object.entries(lists.value)) {
        originalIndex = list.findIndex((f) => f.id.toString() === elem?.getAttribute('id'))

        // if something is found break the loop
        if (originalIndex !== -1) {
          originalListIndex = Number(i)
          break
        }
      }

      if (!originalItem) {
        originalItem = JSON.parse(JSON.stringify(lists.value[originalListIndex][originalIndex]))

        lists.value[originalListIndex].splice(originalIndex, 1)
      }

      // style the element to be spooky 👻 while dragging
      dragging.style.position = 'absolute'
      dragging.style.zIndex = '1000'
      dragging.style.opacity = '.8'
      dragging.style.pointerEvents = 'none'

      startX = e instanceof TouchEvent ? e.touches[0].pageX : e.pageX
      startY = e instanceof TouchEvent ? e.touches[0].pageY : e.pageY

      document.body.appendChild(dragging)

      dragging.style.left = startX - dragging.clientWidth / 2 + 'px'
      dragging.style.top = startY - dragging.clientHeight / 2 + 'px'

      if (isTouchDevice) {
        // touch event needs to be bound to event target
        // otherwise when the dom element is removed
        // touchmove stops firing
        e.target.addEventListener('touchmove', handleMove, { passive: false })
        e.target.addEventListener('touchend', handleEnd)
      } else {
        window.addEventListener('mousemove', handleMove)
        window.addEventListener('mouseup', handleEnd)
      }
    }
  }

  function handleMove(e: EventType) {
    e.preventDefault()
    if (!dragging) {
      return
    }

    const dx = e instanceof TouchEvent ? e.touches[0].pageX - startX : e.pageX - startX
    const dy = e instanceof TouchEvent ? e.touches[0].pageY - startY : e.pageY - startY

    dragging.style.left = startX + dx - dragging.clientWidth / 2 + 'px'
    dragging.style.top = startY + dy - dragging.clientHeight / 2 + 'px'

    // find out which item we're hovering on
    // since the dragging element has pointer events set to none
    // it won't affect our check
    const pointElement = document.elementFromPoint(
      e instanceof TouchEvent ? e.touches[0].clientX : e.clientX,
      e instanceof TouchEvent ? e.touches[0].clientY : e.clientY
    )
    const target = pointElement?.closest(`.${itemClass}`) as HTMLElement

    const targetElement = pointElement?.closest(`.${dropZoneClass}`) as HTMLElement

    if (!target && !targetElement) {
      targetIndex = -1
      return
    }

    // only do the expensive computation if needed
    if (previousTarget && target === previousTarget) {
      return
    }

    previousTarget = target

    // get the target element and assign target indeces
    for (const [i, list] of Object.entries(lists.value)) {
      // special case for empty list
      // find out which list this is
      // by looking at the array from
      // the given classes
      if (!target && targetElement) {
        targetListIndex = Array.from(allElements).findIndex((f) => f === targetElement)
        targetIndex = 0

        break
      }

      if (!target.getAttribute('id')) {
        break
      }

      const found = list.find((f) => f.id.toString() === target.getAttribute('id'))

      if (!found) {
        continue
      }

      targetIndex = list.findIndex((f) => f.id.toString() === target.getAttribute('id'))

      targetListIndex = Number(i)

      break
    }

    // 🟡 only let the item back to the original position
    // if it has previously been on another index
    if (!addedPreview && targetIndex === originalIndex && originalListIndex === targetListIndex) {
      return
    }

    // if a preview has been added remove it on the next
    // occurrence
    if (addedPreview) {
      lists.value[addedPreview.list]?.splice(addedPreview.target, 1)
    }

    // add the dragged item to the target list
    if (originalItem) {
      lists.value[targetListIndex]?.splice(targetIndex, 0, originalItem)
    }

    // keep track of the preview item
    addedPreview = { list: targetListIndex, target: targetIndex }
  }

  function handleEnd(e: EventType) {
    e.preventDefault()
    if (!dragging || !elem) return

    elem.style.opacity = '1'

    document.body.removeChild(dragging)
    dragging = null

    if (targetIndex === -1) {
      // ❌❌ UNSUCCESSFUL DRAG ❌❌
      // restore the list to starting value
      lists.value = JSON.parse(JSON.stringify(startingLists))
    } else {
      // ✅✅ SUCCESFULL DRAG ✅✅
      // the preview has already added the item to the list
      // if successful then overwrite the starting list
      startingLists = JSON.parse(JSON.stringify(lists.value))
      dragEvent.trigger()
    }

    cleanUp()
  }

  const removeEventListeners = () => {
    if (isTouchDevice) {
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleEnd)
    } else {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleEnd)
    }
  }

  const cleanUp = () => {
    originalIndex = -1
    originalListIndex = -1
    targetListIndex = -1
    targetIndex = -1
    addedPreview = null
    originalItem = null

    removeEventListeners()
  }

  return {
    lists: lists,
    onDragEnd: dragEvent.on
  }
}
