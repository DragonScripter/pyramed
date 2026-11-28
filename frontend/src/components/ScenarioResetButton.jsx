import { useRef, useState } from 'react'
import { apiFetch } from '../api'
import { useToast } from '../context/useToast'
import './ScenarioResetButton.css'

export default function ScenarioResetButton({
  scenarioId,
  onReset,
}) {
  const [isResetting, setIsResetting] = useState(false)
  const dialogRef = useRef(null)
  const resetInProgress = useRef(false)
  const { addToast } = useToast()

  const openConfirmation = () => {
    if (!scenarioId || resetInProgress.current) return
    dialogRef.current?.showModal()
  }

  const closeConfirmation = () => {
    if (!resetInProgress.current) {
      dialogRef.current?.close()
    }
  }

  const handleCancel = (event) => {
    if (resetInProgress.current) {
      event.preventDefault()
    }
  }

  const handleReset = async () => {
    if (!scenarioId || resetInProgress.current) return

    resetInProgress.current = true
    setIsResetting(true)

    try {
      const response = await apiFetch('/api/scenario/reset', {
        method: 'POST',
        body: JSON.stringify({ scenarioId }),
      })

      if (!response.ok) {
        throw new Error('Scenario reset failed')
      }
    } catch {
      addToast({
        severity: 'warning',
        message: 'Unable to reset scenario. Please try again.',
      })
      return
    } finally {
      resetInProgress.current = false
      setIsResetting(false)
      dialogRef.current?.close()
    }

    addToast({
      severity: 'info',
      message: 'Scenario reset successfully.',
    })

    onReset?.()
  }

  return (
    <div className="scenario-reset">
      <button
        type="button"
        className="scenario-reset__button"
        disabled={!scenarioId || isResetting}
        onClick={openConfirmation}
      >
        Reset Scenario
      </button>

      <dialog
        ref={dialogRef}
        className="scenario-reset__dialog"
        aria-labelledby="scenario-reset-title"
        aria-describedby="scenario-reset-description"
        onCancel={handleCancel}
      >
        <h2 id="scenario-reset-title">
          Reset simulation?
        </h2>

        <p id="scenario-reset-description">
          This will remove the demo data associated
          with the current scenario. This action
          cannot be undone.
        </p>

        <div className="scenario-reset__actions">
          <button
            type="button"
            className="scenario-reset__cancel"
            disabled={isResetting}
            onClick={closeConfirmation}
          >
            Cancel
          </button>

          <button
            type="button"
            className="scenario-reset__confirm"
            disabled={!scenarioId || isResetting}
            onClick={handleReset}
          >
            {isResetting ? 'Resetting...' : 'Confirm Reset'}
          </button>
        </div>
      </dialog>
    </div>
  )
}