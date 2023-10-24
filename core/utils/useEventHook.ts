// Original version from from https://github.com/vuejs/apollo/blob/v4/packages/vue-apollo-composable/src/util/useEventHook.ts
// allows to trigger an event from a composable and use it
// in the components
export function useEventHook() {
  const fns: Array<() => void> = []

  function on(fn: () => void) {
    fns.push(fn)
    return {
      off: () => off(fn),
    }
  }

  function off(fn: () => void) {
    const index = fns.indexOf(fn)
    if (index !== -1) {
      fns.splice(index, 1)
    }
  }

  function trigger() {
    for (const fn of fns) {
      fn()
    }
  }

  return {
    on,
    off,
    trigger,
  }
}
