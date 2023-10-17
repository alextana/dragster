/*
  ####################################
  # Dragster Vue
  # Drag and drop composable for Vue 3
  # Author: Alex Tana
  # License: MIT
  ####################################
*/
import { onMounted, onUnmounted, type Ref, ref } from 'vue'
import type { Preview, EventType, IDType, DragsterParameters } from './types'
import { useEventHook } from './utils/useEventHook'

export function useDragster<T extends IDType>({
  items = [],
  dropZoneClass = '',
  itemClass = '',
  animationDuration = 200,
}: DragsterParameters<T>): {
  lists: Ref<T[][]>
  onDragEnd: (fn: () => void) => {
    off: () => void
  }
  onDragStart: (fn: () => void) => {
    off: () => void
  }
} {
  // I like this line to be blank
  // but prettier doesn't like it
  // so here's three lines of comments
  const lists = ref(items) as Ref<T[][]> // reactive list

  let allElements: NodeListOf<HTMLElement> | null = null // the actual DOM nodes
  let startingLists = JSON.parse(JSON.stringify(items)) // starting value before dragging

  let elem: HTMLElement | null = null // the real element that's currently being tracked
  let dragging: HTMLElement | null | undefined = null // the copied element being dragged

  let startX = 0 // The x-coordinate where the drag started
  let startY = 0 // The y-coordinate where the drag started

  // 🔄 INDEXES TO KEEP TRACK OF
  let originalIndex = -1 // -> index of the element that is being dragged
  let originalListIndex = -1 // -> the index of the list that hosted the starting element
  let targetListIndex = -1 // -> index of the list of destination
  let targetIndex = -1 // -> index of the destination item

  let originalItem: T | null = null // this is the original item being dragged
  let addedPreview: Preview | null = null // indeces of the preview

  let isTouchDevice: boolean = false

  let animationRunning = false

  const dragStartEvent = useEventHook()
  const dragEndEvent = useEventHook()

  onUnmounted(() => {
    removeEventListeners()
    dragStartEvent.off
    dragEndEvent.off
  })

  onMounted(() => {
    allElements = document.querySelectorAll(`.${dropZoneClass}`)

    if (allElements === null) return

    isTouchDevice = typeof window.ontouchstart !== 'undefined'

    allElements.forEach((dropzone) => {
      isTouchDevice
        ? dropzone.addEventListener(
            'touchstart',
            initialiseDrag as EventListener
          )
        : dropzone.addEventListener(
            'mousedown',
            initialiseDrag as EventListener
          )
    })
  })

  function initialiseDrag(e: EventType) {
    // detect right mouse click
    // and return if pressed
    e.preventDefault()

    if (!isTouchDevice) {
      if (e instanceof MouseEvent && e.button !== 0) {
        return
      }
    }

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
      for (const [i, list] of Object.entries(lists.value as T[][])) {
        originalIndex = list.findIndex(
          (f: T) => f.id.toString() === elem?.getAttribute('id')
        )

        // if something is found break the loop
        if (originalIndex !== -1) {
          originalListIndex = Number(i)
          break
        }
      }

      if (!originalItem) {
        originalItem = JSON.parse(
          JSON.stringify(lists.value[originalListIndex][originalIndex])
        )

        lists.value[originalListIndex].splice(originalIndex, 1)
      }

      // fire drag start event
      dragStartEvent.trigger()

      // style the element to be spooky 👻 while dragging
      dragging.style.position = 'absolute'
      dragging.style.width = elem.clientWidth + 'px'
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

    const dx =
      e instanceof TouchEvent ? e.touches[0].pageX - startX : e.pageX - startX
    const dy =
      e instanceof TouchEvent ? e.touches[0].pageY - startY : e.pageY - startY

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

    const targetElement = pointElement?.closest(
      `.${dropZoneClass}`
    ) as HTMLElement

    if (animationRunning) {
      return
    }

    if (!target && !targetElement) {
      targetIndex = -1
      return
    }

    // get the target element and assign target indeces
    for (const [i, list] of Object.entries(lists.value as T[][])) {
      // special case for empty list
      // find out which list this is
      // by looking at the array from
      // the given classes
      if (!target && targetElement) {
        if (!allElements) return

        targetListIndex = Array.from(allElements).findIndex(
          (f: Node) => f === targetElement
        )

        if (lists.value[targetListIndex]?.length > 1) {
          return
        }

        targetIndex = 0
      }

      if (!target?.getAttribute('id')) {
        break
      }

      const found = list.find(
        (f: T) => f.id.toString() === target.getAttribute('id')
      )

      if (!found) {
        continue
      }

      targetIndex = list.findIndex(
        (f: T) => f.id.toString() === target.getAttribute('id')
      )

      targetListIndex = Number(i)

      break
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

    if (animationDuration) {
      runAnimation()
    }
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
      // ✅✅ SUCCESSFUL DRAG ✅✅
      // the preview has already added the item to the list
      // if successful then overwrite the starting list
      startingLists = JSON.parse(JSON.stringify(lists.value))
      // drag completed so fire drag end event
      dragEndEvent.trigger()
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

  const runAnimation = () => {
    if (!animationDuration || typeof animationDuration !== 'number') {
      return
    }

    animationRunning = true

    setTimeout(() => {
      animationRunning = false
    }, Number(animationDuration))
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
    onDragEnd: dragEndEvent.on,
    onDragStart: dragStartEvent.on,
  }
}
