// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import UserProfile from './UserProfile'

const { apiFetch, updateUser, useAuth } = vi.hoisted(() => ({
  apiFetch: vi.fn(),
  updateUser: vi.fn(),
  useAuth: vi.fn(),
}))

vi.mock('../api', () => ({ apiFetch }))
vi.mock('../context/useAuth', () => ({ useAuth }))

const authenticatedUser = {
  id: 'user-1',
  fullName: 'Example Provider',
  email: 'provider@example.com',
  role: 'Provider',
  avatarUrl: null,
}

beforeEach(() => {
  useAuth.mockReturnValue({ user: authenticatedUser, updateUser })
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('UserProfile', () => {
  it('shows the authenticated user without reading a separate browser session', () => {
    render(<UserProfile />)

    expect(screen.getByText('Example Provider')).toBeInTheDocument()
    expect(screen.getByText('provider@example.com')).toBeInTheDocument()
    expect(screen.getByText('Provider')).toBeInTheDocument()
    expect(apiFetch).not.toHaveBeenCalled()
  })

  it('updates the profile API and keeps the auth context user in sync', async () => {
    apiFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        id: 'user-1',
        fullName: 'Updated Provider',
        avatarUrl: null,
        role: 'Provider',
      }),
    })
    render(<UserProfile />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), {
      target: { value: 'Updated Provider' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(screen.getByText('Profile updated successfully.')).toBeInTheDocument())
    expect(apiFetch).toHaveBeenCalledWith('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify({ fullName: 'Updated Provider' }),
    })
    expect(updateUser).toHaveBeenCalledWith({
      id: 'user-1',
      fullName: 'Updated Provider',
      avatarUrl: '',
      role: 'Provider',
    })
  })
})
