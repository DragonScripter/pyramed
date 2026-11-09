// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import BedOverviewTable from './BedOverviewTable'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('BedOverviewTable', () => {
  it('renders overview rows and lets analysts change grouping', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          beds: [
            {
              bedLabel: 'Unassigned',
              patientId: 'patient-1',
              patientName: 'Avery',
              admissionStatus: 'Admitted',
              monitoringStatus: 'Critical',
              alertFlagCount: 1,
              heartRate: 130,
              spo2: 97,
              recordedAt: '2026-11-07T20:00:00Z',
            },
          ],
        }),
      }),
    )

    render(<BedOverviewTable />)

    expect(await screen.findByText('Avery')).toBeInTheDocument()
    expect(screen.getByText('Critical (1)')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Group rows by'), {
      target: { value: 'none' },
    })

    expect(screen.queryByText('Critical (1)')).not.toBeInTheDocument()
    expect(screen.getByText('Avery')).toBeInTheDocument()
  })
})
