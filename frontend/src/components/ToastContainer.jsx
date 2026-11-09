import ToastItem from './ToastItem'
import { useToast } from '../context/useToast'

function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) {
    return null
  }

  return (
    <aside className="toast-container" aria-label="Notifications" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </aside>
  )
}

export default ToastContainer
