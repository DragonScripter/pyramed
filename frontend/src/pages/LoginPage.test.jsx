// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'
import LoginPage from './LoginPage'

const { login, useAuth } = vi.hoisted(() => ({
  login: vi.fn(),
  useAuth: vi.fn(),
}))

vi.mock('../context/useAuth', () => ({ useAuth }))

function CurrentPath() {
  return <output data-testid="path">{useLocation().pathname}</output>
}

function renderLogin(entry = '/login') {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <LoginPage />
      <CurrentPath />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  useAuth.mockReturnValue({ isAuthenticated: false, isLoading: false, login })
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('LoginPage', () => {
  it('validates missing and malformed credentials before submitting', () => {
    renderLogin()

    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'not-an-email' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
    expect(screen.getByText('Password is required.')).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
  })

  it('shows a generic error for invalid credentials', async () => {
    login.mockRejectedValue({ status: 401 })
    renderLogin()

    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'clinician@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'incorrect' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password.')
  })

  it('submits normalized credentials and returns to the requested internal path', async () => {
    login.mockResolvedValue({ id: 'user-1', role: 'Provider' })
    useAuth.mockReturnValue({ isAuthenticated: false, isLoading: false, login })
    renderLogin({ pathname: '/login', state: { from: '/body-composition' } })

    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: ' clinician@example.com ' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'secret' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/body-composition'))
    expect(login).toHaveBeenCalledWith({
      email: 'clinician@example.com',
      password: 'secret',
    })
  })
})
