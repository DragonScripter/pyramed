import { supabase } from './supabaseClient'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export async function apiFetch(path, options = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const headers = new Headers(options.headers)
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`)
  }
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  return fetch(`${API_BASE_URL}${path}`, { ...options, headers })
}