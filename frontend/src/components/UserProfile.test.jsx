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
  fullName: 'Example Nurse',
  email: 'nurse@example.com',
  role: 'NURSE',
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

    expect(screen.getByText('Example Nurse')).toBeInTheDocument()
    expect(screen.getByText('nurse@example.com')).toBeInTheDocument()
    expect(screen.getByText('NURSE')).toBeInTheDocument()
    expect(apiFetch).not.toHaveBeenCalled()
  })

  it('updates the profile API and keeps the auth context user in sync', async () => {
    apiFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        id: 'user-1',
        fullName: 'Updated Nurse',
        avatarUrl: null,
        role: 'NURSE',
      }),
    })
    render(<UserProfile />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), {
      target: { value: 'Updated Nurse' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(screen.getByText('Profile updated successfully.')).toBeInTheDocument())
    expect(apiFetch).toHaveBeenCalledWith('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify({ fullName: 'Updated Nurse' }),
    })
    expect(updateUser).toHaveBeenCalledWith({
      id: 'user-1',
      fullName: 'Updated Nurse',
      avatarUrl: '',
      role: 'NURSE',
    })
  })
})
