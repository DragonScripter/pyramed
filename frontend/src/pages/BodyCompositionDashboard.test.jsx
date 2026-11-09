// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

vi.mock('../supabaseClient', () => ({
  supabase: {
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}))

vi.mock('../components/PatientDemographicsCard', () => ({ default: () => null }))

describe('Body Composition Dashboard navigation', () => {
  it('opens the dashboard from the navigation menu', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Toggle menu' }))
    fireEvent.click(
      screen.getByRole('link', { name: 'Body Composition Dashboard' }),
    )

    expect(
      screen.getByRole('heading', { name: 'Body Composition Dashboard' }),
    ).toBeInTheDocument()
  })
})
