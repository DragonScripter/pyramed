import { useCallback, useMemo, useReducer, useRef } from 'react'
import { ToastContext } from './toastContext'
import { DEFAULT_TOAST_DURATION, toastReducer } from './toastState'

const isToastSeverity = (severity) =>
  ['info', 'warning', 'critical'].includes(severity)

export function ToastProvider({ children }) {
  const [state, dispatch] = useReducer(toastReducer, {
    toasts: [],
    queue: [],
  })
  const toastSequence = useRef(0)

  const addToast = useCallback((input) => {
    const options = typeof input === 'string' ? { message: input } : input
    const severity = isToastSeverity(options?.severity) ? options.severity : 'info'
    const toast = {
      id: `toast-${Date.now()}-${++toastSequence.current}`,
      message: options?.message ?? '',
      severity,
      duration: options?.duration ?? DEFAULT_TOAST_DURATION,
    }

    dispatch({ type: 'add', toast })
    return toast.id
  }, [])

  const removeToast = useCallback((id) => {
    dispatch({ type: 'remove', id })
  }, [])

  const value = useMemo(
    () => ({
      toasts: state.toasts,
      queuedToasts: state.queue,
      addToast,
      removeToast,
    }),
    [addToast, removeToast, state.queue, state.toasts],
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}
