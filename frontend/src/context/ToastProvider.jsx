import { useCallback, useMemo, useReducer, useRef } from 'react'
import { ToastContext } from './toastContext'
import { DEFAULT_TOAST_DURATION, toastReducer } from './toastState'
import { useActivityLog } from '../components/ActivityLogContext'

const DEDUPE_WINDOW_MS = 10000

const isToastSeverity = (severity) =>
  ['info', 'warning', 'critical'].includes(severity)

export function ToastProvider({ children }) {
  const [state, dispatch] = useReducer(toastReducer, {
    toasts: [],
    queue: [],
  })
  const toastSequence = useRef(0)
  const recentToasts = useRef(new Map())
  const { addEntry } = useActivityLog()

  const addToast = useCallback(
    (input) => {
      const options = typeof input === 'string' ? { message: input } : input
      const severity = isToastSeverity(options?.severity) ? options.severity : 'info'
      const message = options?.message ?? ''

      // De-duplicate identical alerts raised within a short window.
      const dedupeKey = `${severity}:${message}`
      const now = Date.now()
      const lastShown = recentToasts.current.get(dedupeKey)
      if (lastShown !== undefined && now - lastShown < DEDUPE_WINDOW_MS) {
        return null
      }
      recentToasts.current.set(dedupeKey, now)

      const toast = {
        id: `toast-${now}-${++toastSequence.current}`,
        message,
        severity,
        duration: options?.duration ?? DEFAULT_TOAST_DURATION,
      }

      dispatch({ type: 'add', toast })

      // Every toast is also written to the bottom activity log.
      if (message) {
        addEntry({ severity, message })
      }

      return toast.id
    },
    [addEntry],
  )

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