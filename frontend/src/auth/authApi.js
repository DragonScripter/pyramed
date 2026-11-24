import { apiFetch } from '../api'

export class AuthApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'AuthApiError'
    this.status = status
  }
}

async function readErrorMessage(response) {
  const body = await response.json().catch(() => null)
  return body?.message ?? `Request failed (${response.status})`
}

export async function login({ email, password }) {
  const response = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    handleUnauthorized: false,
  })

  if (!response.ok) {
    throw new AuthApiError(await readErrorMessage(response), response.status)
  }

  const payload = await response.json().catch(() => null)
  if (!payload?.accessToken || !payload?.expiresAt || !payload?.user) {
    throw new AuthApiError('The server returned an invalid login response.', 500)
  }

  return payload
}

export async function logout() {
  const response = await apiFetch('/api/auth/logout', {
    method: 'POST',
    handleUnauthorized: false,
  })

  if (!response.ok && response.status !== 401) {
    throw new AuthApiError(await readErrorMessage(response), response.status)
  }
}

export async function getCurrentUser() {
  const response = await apiFetch('/api/users/me')
  if (!response.ok) {
    throw new AuthApiError(await readErrorMessage(response), response.status)
  }

  return response.json()
}
