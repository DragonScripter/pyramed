// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthApiError, getCurrentUser, login, logout } from './authApi'
import { setAccessToken, setUnauthorizedHandler } from './authSession'

afterEach(() => {
  setAccessToken(null)
  setUnauthorizedHandler(null)
  vi.unstubAllGlobals()
})

describe('authentication API client', () => {
  it('returns the token and expiry duration supplied by a successful login', async () => {
    const payload = {
      accessToken: 'signed-token',
      expiresIn: 3600,
    }
    const json = vi.fn().mockResolvedValue(payload)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json }))

    await expect(login({ email: 'provider@example.com', password: 'secret' })).resolves.toEqual(payload)
  })

  it('returns a generic invalid-credential error without triggering logout handling', async () => {
    const onUnauthorized = vi.fn()
    setUnauthorizedHandler(onUnauthorized)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: vi.fn().mockResolvedValue({ message: 'Invalid email or password.' }),
    }))

    await expect(login({ email: 'wrong@example.com', password: 'wrong' }))
      .rejects.toMatchObject({ name: 'AuthApiError', status: 401 })
    expect(onUnauthorized).not.toHaveBeenCalled()
  })

  it('sends logout as a POST request', async () => {
    setAccessToken('signed-token')
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204 })
    vi.stubGlobal('fetch', fetchMock)

    await expect(logout()).resolves.toBeUndefined()

    expect(fetchMock.mock.calls[0][1].method).toBe('POST')
  })

  it('returns the authoritative profile from the protected current-user endpoint', async () => {
    const profile = { id: 'user-1', fullName: 'Example', role: 'Provider' }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(profile),
    }))

    await expect(getCurrentUser()).resolves.toEqual(profile)
  })

  it('provides a typed error for protected API failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: vi.fn().mockResolvedValue({ message: 'Not authorized.' }),
    }))

    await expect(getCurrentUser()).rejects.toBeInstanceOf(AuthApiError)
  })
})
