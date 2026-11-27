// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from '../api'
import AccessLedger from './AccessLedger'

vi.mock('../api', () => ({
  apiFetch: vi.fn(),
}))

const response = (payload) => ({
  ok: true,
  json: async () => payload,
})

describe('AccessLedger', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    apiFetch.mockReset()
  })

  it('loads a read-only ledger with the default server sort', async () => {
    apiFetch.mockResolvedValue(
      response({
        items: [
          {
            id: 1,
            userName: 'Dr. Lee',
            userRole: 'provider',
            patientId: 'patient-1',
            action: 0,
            timestampUtc: '2026-11-27T15:30:00.0000000Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 25,
      }),
    )

    render(<AccessLedger />)

    expect(await screen.findByText('Dr. Lee')).toBeInTheDocument()
    expect(screen.getByText('View')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
    expect(apiFetch).toHaveBeenCalledWith(
      expect.stringContaining('sortBy=timestamp&sortDir=desc'),
      expect.any(Object),
    )
  })

  it('requeries from the first page when filters or server sorting change', async () => {
    apiFetch.mockResolvedValue(
      response({
        items: [
          {
            id: 1,
            userName: 'Dr. Lee',
            userRole: 'provider',
            patientId: 'patient-1',
            action: 1,
            timestampUtc: '2026-11-27T15:30:00.0000000Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 25,
      }),
    )

    render(<AccessLedger />)
    await screen.findByText('Dr. Lee')

    fireEvent.change(screen.getByLabelText('User Name'), {
      target: { value: 'Lee' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply Filters' }))

    await waitFor(() => {
      expect(apiFetch).toHaveBeenLastCalledWith(
        expect.stringContaining('userName=Lee'),
        expect.any(Object),
      )
    })

    fireEvent.click(screen.getByRole('button', { name: 'User' }))

    await waitFor(() => {
      expect(apiFetch).toHaveBeenLastCalledWith(
        expect.stringContaining('sortBy=userName&sortDir=asc'),
        expect.any(Object),
      )
    })
  })
})
