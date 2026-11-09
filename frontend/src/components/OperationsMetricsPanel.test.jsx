// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import OperationsMetricsPanel from './OperationsMetricsPanel'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('OperationsMetricsPanel', () => {
  it('renders live operational metrics from the dashboard endpoint', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          activePatientCount: 12,
          rollingHourAlertTriggers: 8,
          datasetResponseStability: 91.7,
        }),
      }),
    )

    render(<OperationsMetricsPanel />)

    expect(await screen.findByText('12')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('91.7%')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith('/api/operations/metrics', {
      signal: expect.any(AbortSignal),
    })
  })
})
