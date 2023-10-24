/*
  ####################################
  # Dragster React
  # Drag and drop hook for React
  # Author: Alex Tana
  # License: MIT
  ####################################
*/
import type {
  Preview,
  EventType,
  IDType,
  DragsterParameters,
} from '../core/types'
import { useEventHook } from '../core/utils/useEventHook'
import { useState, useEffect, useRef } from 'react'

export function useDragster<T extends IDType>({
  items = [],
  dropZoneClass = '',
  itemClass = '',
  animationDuration = 200,
}: DragsterParameters<T>): {
  lists: T[][]
  onDragEnd: (fn: () => void) => {
    off: () => void
  }
  onDragStart: (fn: () => void) => {
    off: () => void
  }
} {
  const [lists, setLists] = useState<T[][]>(items)

  const allElements = useRef<NodeListOf<Element> | null>(null) // the actual DOM nodes
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

  const isTouchDevice = useRef<boolean>(false)

  let animationRunning = false

  const dragStartEvent = useEventHook()
  const dragEndEvent = useEventHook()

  const removeEventListeners = () => {
    if (isTouchDevice.current) {
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleEnd)
    } else {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleEnd)
    }
  }

  useEffect(() => {
    allElements.current = document.querySelectorAll(`.${dropZoneClass}`)

    if (!allElements.current.length) return

    isTouchDevice.current = typeof window.ontouchstart !== 'undefined'

    for (const dropzone of allElements.current) {
      isTouchDevice.current
        ? dropzone.addEventListener(
            'touchstart',
            initialiseDrag as EventListener
          )
        : dropzone.addEventListener(
            'mousedown',
            initialiseDrag as EventListener
          )
    }

    return () => {
      removeEventListeners()
      dragStartEvent.off
      dragEndEvent.off
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function initialiseDrag(e: EventType) {
    // detect right mouse click
    // and return if pressed
    e.preventDefault()

    if (!isTouchDevice.current) {
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
      for (const [i, list] of Object.entries(lists as T[][])) {
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
          JSON.stringify(lists[originalListIndex][originalIndex])
        )

        lists[originalListIndex].splice(originalIndex, 1)
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

      if (isTouchDevice.current) {
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
    for (const [i, list] of Object.entries(lists as T[][])) {
      // special case for empty list
      // find out which list this is
      // by looking at the array from
      // the given classes
      if (!target && targetElement && allElements.current) {
        targetListIndex = Array.from(allElements.current).findIndex(
          (f) => f === targetElement
        )

        if (lists[targetListIndex]?.length > 1) {
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
      const copy = [...lists]
      copy[addedPreview.list]?.splice(addedPreview.target, 1)

      setLists(copy)
    }

    // add the dragged item to the target list
    if (originalItem) {
      const copy = [...lists]
      copy[targetListIndex]?.splice(targetIndex, 0, originalItem)

      setLists(copy)
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
      setLists(JSON.parse(JSON.stringify(startingLists)))
    } else {
      // ✅✅ SUCCESSFUL DRAG ✅✅
      // the preview has already added the item to the list
      // if successful then overwrite the starting list
      startingLists = JSON.parse(JSON.stringify(lists))
      // drag completed so fire drag end event
      dragEndEvent.trigger()
    }

    cleanUp()
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
