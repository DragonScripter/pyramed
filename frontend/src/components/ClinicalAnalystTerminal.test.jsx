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

vi.mock('./PatientDemographicsCard', () => ({ default: () => null }))

describe('Clinical Analyst Terminal navigation', () => {
  it('opens the terminal from the navigation menu', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Toggle menu' }))
    fireEvent.click(
      screen.getByRole('link', { name: 'Clinical Analyst Terminal' }),
    )

    expect(
      screen.getByRole('heading', {
        name: 'Clinical Analyst Administration Terminal',
      }),
    ).toBeInTheDocument()
  })
})
