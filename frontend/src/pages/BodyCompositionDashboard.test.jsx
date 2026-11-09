// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import BodyCompositionDashboard from './BodyCompositionDashboard'

vi.mock('../supabaseClient', () => ({
  supabase: {
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}))

vi.mock('../components/PatientDemographicsCard', () => ({ default: () => null }))

afterEach(cleanup)

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

  it('renders filter controls and analysis placeholders', () => {
    render(<BodyCompositionDashboard />)

    expect(screen.getByLabelText('Patient')).toBeDisabled()
    expect(screen.getByLabelText('Time range')).toHaveValue('30d')
    expect(
      screen.getByRole('heading', { name: 'Composition overview' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Body composition trends' }),
    ).toBeInTheDocument()
  })
})
