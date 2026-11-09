export const MAX_VISIBLE_TOASTS = 3
export const DEFAULT_TOAST_DURATION = 5000

export function toastReducer(state, action) {
  switch (action.type) {
    case 'add':
      if (state.toasts.length < MAX_VISIBLE_TOASTS) {
        return {
          ...state,
          toasts: [...state.toasts, action.toast],
        }
      }

      return {
        ...state,
        queue: [...state.queue, action.toast],
      }

    case 'remove': {
      const remainingToasts = state.toasts.filter((toast) => toast.id !== action.id)
      const queuedToastIndex = state.queue.findIndex((toast) => toast.id === action.id)

      if (remainingToasts.length === state.toasts.length && queuedToastIndex >= 0) {
        return {
          ...state,
          queue: state.queue.filter((toast) => toast.id !== action.id),
        }
      }

      if (remainingToasts.length === state.toasts.length) {
        return state
      }

      if (state.queue.length === 0) {
        return {
          ...state,
          toasts: remainingToasts,
        }
      }

      return {
        toasts: [...remainingToasts, state.queue[0]],
        queue: state.queue.slice(1),
      }
    }

    default:
      return state
  }
}
