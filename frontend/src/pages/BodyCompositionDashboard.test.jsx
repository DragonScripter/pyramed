// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

const patients = [
  { patientId: 'patient-1', name: 'Alex Morgan' },
  { patientId: 'patient-2', name: 'Sam Taylor' },
]

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => patients,
    }),
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

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

  it('updates selected patient and time-range request parameters', async () => {
    render(<BodyCompositionDashboard />)

    await screen.findByRole('option', { name: 'Sam Taylor' })
    const patientSelector = screen.getByLabelText('Patient')
    expect(screen.getByLabelText('Time range')).toHaveValue('30d')

    fireEvent.change(patientSelector, { target: { value: 'patient-2' } })
    fireEvent.change(screen.getByLabelText('Time range'), {
      target: { value: '7d' },
    })

    expect(patientSelector).toHaveValue('patient-2')
    expect(screen.getByLabelText('Time range')).toHaveValue('7d')
    expect(
      screen.getByText(
        'Ready to request body composition for Sam Taylor over Last 7 days.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText('Body composition analysis results'),
    ).toHaveAttribute('data-patient-id', 'patient-2')
    expect(
      screen.getByLabelText('Body composition analysis results'),
    ).toHaveAttribute('data-time-range', '7d')
    expect(
      screen.getByRole('heading', { name: 'Composition overview' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Body composition trends' }),
    ).toBeInTheDocument()
  })

  it('shows date inputs and stores date parameters for a custom range', async () => {
    render(<BodyCompositionDashboard />)

    await screen.findByRole('option', { name: 'Sam Taylor' })
    fireEvent.change(screen.getByLabelText('Time range'), {
      target: { value: 'custom' },
    })

    const startDate = screen.getByLabelText('Start date')
    const endDate = screen.getByLabelText('End date')

    fireEvent.change(startDate, { target: { value: '2026-10-01' } })
    fireEvent.change(endDate, { target: { value: '2026-10-31' } })

    expect(startDate).toHaveValue('2026-10-01')
    expect(endDate).toHaveValue('2026-10-31')
    expect(
      screen.getByLabelText('Body composition analysis results'),
    ).toHaveAttribute('data-time-range', 'custom')
    expect(
      screen.getByLabelText('Body composition analysis results'),
    ).toHaveAttribute('data-start-date', '2026-10-01')
    expect(
      screen.getByLabelText('Body composition analysis results'),
    ).toHaveAttribute('data-end-date', '2026-10-31')
    expect(
      screen.getByLabelText('Body composition analysis results'),
    ).toHaveAttribute('data-request-ready', 'false')
  })

  it('validates required, ordered, and non-future custom range dates', async () => {
    render(<BodyCompositionDashboard />)

    await screen.findByRole('option', { name: 'Sam Taylor' })
    fireEvent.change(screen.getByLabelText('Patient'), {
      target: { value: 'patient-2' },
    })
    fireEvent.change(screen.getByLabelText('Time range'), {
      target: { value: 'custom' },
    })

    const startDate = screen.getByLabelText('Start date')
    const endDate = screen.getByLabelText('End date')

    expect(
      screen.getByRole('alert'),
    ).toHaveTextContent('Choose both a start date and an end date.')

    fireEvent.change(startDate, { target: { value: '2026-10-31' } })
    fireEvent.change(endDate, { target: { value: '2026-10-01' } })

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Start date must be on or before the end date.',
    )

    fireEvent.change(startDate, { target: { value: '2099-01-01' } })
    fireEvent.change(endDate, { target: { value: '2099-01-02' } })

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Custom range dates cannot be in the future.',
    )
    expect(
      screen.getByLabelText('Body composition analysis results'),
    ).toHaveAttribute('data-request-ready', 'false')
  })
})
