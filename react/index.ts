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
  const listRef = useRef(lists)
  const allElements = useRef<NodeListOf<Element> | null>(null) // the actual DOM nodes
  const isTouchDevice = useRef<boolean>(false)
  const dragStartEvent = useEventHook()
  const dragEndEvent = useEventHook()

  let startingLists = JSON.parse(JSON.stringify(items)), // starting value before dragging
    elem: HTMLElement | null = null, // the real element that's currently being tracked
    dragging: HTMLElement | null | undefined = null, // the copied element being dragged
    startX = 0, // The x-coordinate where the drag started
    startY = 0, // The y-coordinate where the drag started
    // 🔄 INDEXES TO KEEP TRACK OF
    originalIndex = -1, // -> index of the element that is being dragged
    originalListIndex = -1, // -> the index of the list that hosted the starting element
    targetListIndex = -1, // -> index of the list of destination
    targetIndex = -1, // -> index of the destination item
    originalItem: T | null = null, // this is the original item being dragged
    addedPreview: Preview | null = null, // indeces of the preview
    animationRunning = false

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
      allElements.current = document.querySelectorAll(`.${dropZoneClass}`)

      if (!allElements.current.length) return

      for (const dropzone of allElements.current) {
        dropzone.removeEventListener(
          'touchstart',
          initialiseDrag as EventListener
        )
        dropzone.removeEventListener(
          'mousedown',
          initialiseDrag as EventListener
        )
      }
      removeEventListeners()
      dragStartEvent.off
      dragEndEvent.off
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const removeEventListeners = () => {
    if (!allElements.current) return
    for (const dropzone of allElements.current) {
      if (isTouchDevice.current) {
        dropzone.removeEventListener('touchmove', handleMove as EventListener)
        dropzone.removeEventListener('touchend', handleEnd as EventListener)
      } else {
        dropzone.removeEventListener('mousemove', handleMove as EventListener)
        dropzone.removeEventListener('mouseup', handleEnd as EventListener)
      }
    }
    window.removeEventListener('mousemove', handleMove)
    window.removeEventListener('mouseup', handleEnd)
  }

  listRef.current = lists

  const initialiseDrag = (e: EventType) => {
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
      for (const [i, list] of Object.entries(listRef.current as T[][])) {
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
          JSON.stringify(listRef.current[originalListIndex][originalIndex])
        )

        const copy = [...listRef.current]
        copy[originalListIndex].splice(originalIndex, 1)
        setLists(copy)
        listRef.current = copy
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
    for (const [i, list] of Object.entries(listRef.current as T[][])) {
      // special case for empty list
      // find out which list this is
      // by looking at the array from
      // the given classes
      if (!target && targetElement) {
        if (!allElements.current) return

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
      const copy = [...listRef.current]
      copy[addedPreview.list]?.splice(addedPreview.target, 1)

      setLists(copy)
    }

    // add the dragged item to the target list
    if (originalItem) {
      const copy = [...listRef.current]
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
      listRef.current = startingLists
    } else {
      // ✅✅ SUCCESSFUL DRAG ✅✅
      // the preview has already added the item to the list
      // if successful then overwrite the starting list
      startingLists = JSON.parse(JSON.stringify(lists))
      listRef.current = lists
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
