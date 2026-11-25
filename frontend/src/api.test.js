// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from './api'
import {
  getAccessToken,
  setAccessToken,
  setUnauthorizedHandler,
} from './auth/authSession'

afterEach(() => {
  setAccessToken(null)
  setUnauthorizedHandler(null)
  vi.unstubAllGlobals()
})

describe('apiFetch', () => {
  it('adds the in-memory bearer token and JSON content type', async () => {
    setAccessToken('signed-token')
    const fetchMock = vi.fn().mockResolvedValue({ status: 200 })
    vi.stubGlobal('fetch', fetchMock)

    await apiFetch('/api/protected', {
      method: 'POST',
      body: JSON.stringify({ value: 'test' }),
    })

    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/protected')
    expect(options.headers.get('Authorization')).toBe('Bearer signed-token')
    expect(options.headers.get('Content-Type')).toBe('application/json')
  })

  it('clears an expired token and notifies the registered handler on 401', async () => {
    setAccessToken('expired-token')
    const onUnauthorized = vi.fn()
    setUnauthorizedHandler(onUnauthorized)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 401 }))

    await apiFetch('/api/protected')

    expect(getAccessToken()).toBeNull()
    expect(onUnauthorized).toHaveBeenCalledOnce()
  })

  it('does not treat a failed login as an expired session', async () => {
    setAccessToken('existing-token')
    const onUnauthorized = vi.fn()
    setUnauthorizedHandler(onUnauthorized)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 401 }))

    await apiFetch('/api/auth/login', { handleUnauthorized: false })

    expect(getAccessToken()).toBe('existing-token')
    expect(onUnauthorized).not.toHaveBeenCalled()
  })
})
