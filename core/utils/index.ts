export const isObjSame = (
  obj1: object | null,
  obj2: object | null
): boolean | null => {
  if (!obj1 || !obj2) return null
  return JSON.stringify(obj1) === JSON.stringify(obj2)
}
