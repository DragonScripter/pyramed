// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { getAccessToken } from '../auth/authSession'
import { AuthProvider } from './AuthProvider'
import { useAuth } from './useAuth'

const { getCurrentUser, loginRequest, logoutRequest } = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  loginRequest: vi.fn(),
  logoutRequest: vi.fn(),
}))

vi.mock('../auth/authApi', () => ({
  getCurrentUser,
  login: loginRequest,
  logout: logoutRequest,
}))

function AuthControls() {
  const { isAuthenticated, isLoading, login, logout, updateUser, user } = useAuth()

  return (
    <>
      <output data-testid="authenticated">{String(isAuthenticated)}</output>
      <output data-testid="loading">{String(isLoading)}</output>
      <output data-testid="role">{user?.role ?? 'none'}</output>
      <output data-testid="name">{user?.fullName ?? 'none'}</output>
      <button type="button" onClick={() => login({ email: 'user@example.com', password: 'secret' })}>
        Sign in
      </button>
      <button type="button" onClick={() => logout()}>
        Sign out
      </button>
      <button type="button" onClick={() => updateUser({ fullName: 'Updated Provider' })}>
        Update name
      </button>
    </>
  )
}

function CurrentPath() {
  return <output data-testid="path">{useLocation().pathname}</output>
}

function renderProvider(initialPath = '/patients') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <AuthControls />
        <CurrentPath />
      </AuthProvider>
    </MemoryRouter>,
  )
}

function mockLogin(expiresAt = new Date(Date.now() + 60_000).toISOString()) {
  loginRequest.mockResolvedValue({
    accessToken: 'signed-token',
    expiresIn: Math.max(1, Math.ceil((Date.parse(expiresAt) - Date.now()) / 1000)),
  })
  getCurrentUser.mockResolvedValue({
    id: 'user-1', fullName: 'Example Provider', role: 'Provider', avatarUrl: null,
  })
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.clearAllMocks()
})

describe('AuthProvider', () => {
  it('stores a verified login session in memory', async () => {
    mockLogin()
    renderProvider()

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('true'))
    expect(screen.getByTestId('role')).toHaveTextContent('Provider')
    expect(getAccessToken()).toBe('signed-token')
    expect(getCurrentUser).toHaveBeenCalledOnce()
  })

  it('clears the session and redirects to login when it expires', async () => {
    vi.useFakeTimers()
    mockLogin(new Date(Date.now() + 1_000).toISOString())
    renderProvider()

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    await act(async () => {})

    await act(async () => {
      vi.advanceTimersByTime(1_000)
    })

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(screen.getByTestId('path')).toHaveTextContent('/login')
    expect(getAccessToken()).toBeNull()
  })

  it('logs out locally even when the logout request succeeds asynchronously', async () => {
    mockLogin()
    logoutRequest.mockResolvedValue(undefined)
    renderProvider()

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('true'))
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))

    await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('false'))
    expect(screen.getByTestId('path')).toHaveTextContent('/login')
    expect(getAccessToken()).toBeNull()
  })

  it('merges profile updates into the authenticated user', async () => {
    mockLogin()
    renderProvider()

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('true'))
    fireEvent.click(screen.getByRole('button', { name: 'Update name' }))

    expect(screen.getByTestId('name')).toHaveTextContent('Updated Provider')
    expect(screen.getByTestId('role')).toHaveTextContent('Provider')
  })
})
