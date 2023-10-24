export type Preview = {
  list: number
  target: number
}

export type IDType = {
  id: number | string
}

export type EventType = MouseEvent | TouchEvent
export interface DragsterParameters<T> {
  items: T[][]
  dropZoneClass: string
  itemClass: string
  animationDuration?: number
}
