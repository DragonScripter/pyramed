// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider } from '../context/ToastProvider'
import { useToast } from '../context/useToast'
import ToastContainer from './ToastContainer'

function ToastTrigger({ toast }) {
  const { addToast } = useToast()

  return (
    <button type="button" onClick={() => addToast(toast)}>
      Show {toast.severity}
    </button>
  )
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('ToastContainer', () => {
  it('renders severity styles and dismisses a toast manually', () => {
    render(
      <ToastProvider>
        <ToastTrigger toast={{ message: 'Telemetry is connected.', severity: 'info' }} />
        <ToastContainer />
      </ToastProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Show info' }))

    expect(screen.getByRole('status')).toHaveTextContent('Information')
    expect(screen.getByRole('status')).toHaveClass('toast-item--info')

    fireEvent.click(
      screen.getByRole('button', { name: 'Dismiss information: Telemetry is connected.' }),
    )

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('automatically dismisses visible critical toasts after their duration', () => {
    vi.useFakeTimers()

    render(
      <ToastProvider>
        <ToastTrigger
          toast={{
            message: 'SpO2 requires attention.',
            severity: 'critical',
            duration: 1500,
          }}
        />
        <ToastContainer />
      </ToastProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Show critical' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Critical alert')

    act(() => {
      vi.advanceTimersByTime(1500)
    })

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
