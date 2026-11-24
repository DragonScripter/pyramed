import { getAccessToken, handleUnauthorizedResponse } from './auth/authSession'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export async function apiFetch(path, options = {}) {
  const {
    accessToken = getAccessToken(),
    handleUnauthorized = true,
    ...fetchOptions
  } = options
  const headers = new Headers(fetchOptions.headers)

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  if (fetchOptions.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  })

  if (response.status === 401 && handleUnauthorized && accessToken) {
    handleUnauthorizedResponse()
  }

  return response
}
