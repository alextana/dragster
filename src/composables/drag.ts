/*
  drag and drop composable

  rules - an element can only be dragged
  from a drag zone

  and can only be dropped in a drop zone
*/

import { onMounted, ref, type Ref } from 'vue'

export function useDragDrop(
  listsReference: { items: Array<any> },
  dropZones: { drops: Array<any> | null }
) {
  // can either pass a list of refs or classes, for both drop zones and
  // lists

  // if no drop zones are provided we can assume all of the lists
  // can accept items, treat them all as dropzones

  const lists = ref(listsReference.items)

  onMounted(() => {
    let elem: HTMLElement | null = null // the real element that's currently being tracked
    let dragging: HTMLElement | null | undefined = null // the copied element being dragged

    let startX = 0 // The x-coordinate where the drag started
    let startY = 0 // The y-coordinate where the drag started
    let originalIndex = -1 // The index of the element within its parent list

    window.addEventListener('mousedown', function (e) {
      e.preventDefault()

      if (e.target instanceof HTMLElement) {
        elem = e.target?.closest('.slick-drag') as HTMLElement

        if (!elem) return

        // make the item invisible whilst dragging
        elem.style.opacity = '0'
        dragging = elem?.cloneNode(true) as HTMLElement

        if (!dragging) {
          return
        }

        // find index of the dragged item
        // relative to the lists
        for (const list of lists.value) {
          originalIndex = list.findIndex((f: any) => f.id.toString() === elem?.getAttribute('id'))
          // if something is found break the loop
          if (originalIndex !== -1) {
            break
          }
        }

        // style the element to be spooky 👻 while dragging
        dragging.style.position = 'absolute'
        dragging.style.zIndex = '1000'
        dragging.style.opacity = '1'
        document.body.appendChild(dragging)

        startX = e.pageX
        startY = e.pageY
        dragging.style.left = startX - dragging.clientWidth / 2 + 'px'
        dragging.style.top = startY - dragging.clientHeight / 2 + 'px'

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
      }
    })

    function handleMouseMove(e: MouseEvent) {
      if (!dragging) return

      const dx = e.pageX - startX
      const dy = e.pageY - startY

      dragging.style.left = startX + dx - dragging.clientWidth / 2 + 'px'
      dragging.style.top = startY + dy - dragging.clientHeight / 2 + 'px'
    }

    function handleMouseUp(e: MouseEvent) {
      if (!dragging || !elem) return

      elem.style.opacity = '1'

      document.body.removeChild(dragging)
      dragging = null
    }
  })

  console.log('d', dropZones.drops)

  return {
    lists: lists
  }
}
