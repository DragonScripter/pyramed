// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ToastProvider } from './ToastProvider'
import { useToast } from './useToast'

function ToastControls() {
  const { toasts, queuedToasts, addToast, removeToast } = useToast()

  return (
    <>
      {['One', 'Two', 'Three', 'Four'].map((message) => (
        <button
          key={message}
          type="button"
          onClick={() => addToast({ message, severity: 'warning' })}
        >
          Add {message}
        </button>
      ))}
      <button type="button" onClick={() => removeToast(toasts[0]?.id)}>
        Remove first
      </button>
      <output data-testid="visible-toasts">
        {toasts.map((toast) => toast.message).join(', ')}
      </output>
      <output data-testid="queued-toasts">
        {queuedToasts.map((toast) => toast.message).join(', ')}
      </output>
    </>
  )
}

describe('ToastProvider', () => {
  it('caps visible toasts and promotes queued entries when one is removed', () => {
    render(
      <ToastProvider>
        <ToastControls />
      </ToastProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add One' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add Two' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add Three' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add Four' }))

    expect(screen.getByTestId('visible-toasts')).toHaveTextContent('One, Two, Three')
    expect(screen.getByTestId('queued-toasts')).toHaveTextContent('Four')

    fireEvent.click(screen.getByRole('button', { name: 'Remove first' }))

    expect(screen.getByTestId('visible-toasts')).toHaveTextContent('Two, Three, Four')
    expect(screen.getByTestId('queued-toasts')).toBeEmptyDOMElement()
  })
})
