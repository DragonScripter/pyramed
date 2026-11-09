import { useEffect } from 'react'
import './ToastContainer.css'

const SEVERITY_DETAILS = {
  info: {
    icon: 'i',
    label: 'Information',
  },
  warning: {
    icon: '!',
    label: 'Warning',
  },
  critical: {
    icon: '!',
    label: 'Critical alert',
  },
}

function ToastItem({ toast, onDismiss }) {
  const details = SEVERITY_DETAILS[toast.severity] ?? SEVERITY_DETAILS.info

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => onDismiss(toast.id), toast.duration)

    return () => window.clearTimeout(timeoutId)
  }, [onDismiss, toast.duration, toast.id])

  return (
    <article
      className={`toast-item toast-item--${toast.severity}`}
      role={toast.severity === 'critical' ? 'alert' : 'status'}
    >
      <span className="toast-item__icon" aria-hidden="true">
        {details.icon}
      </span>
      <div className="toast-item__content">
        <p className="toast-item__severity">{details.label}</p>
        <p className="toast-item__message">{toast.message}</p>
      </div>
      <button
        className="toast-item__close"
        type="button"
        aria-label={`Dismiss ${details.label.toLowerCase()}: ${toast.message}`}
        onClick={() => onDismiss(toast.id)}
      >
        ×
      </button>
    </article>
  )
}

export default ToastItem
