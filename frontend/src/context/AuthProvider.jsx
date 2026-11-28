import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getCurrentUser, login as loginRequest, logout as logoutRequest } from '../auth/authApi'
import {
  clearAccessToken,
  setAccessToken,
  setUnauthorizedHandler,
} from '../auth/authSession'
import { AuthContext } from './authContext'

const emptySession = {
  user: null,
  token: null,
  expiresAt: null,
}

function getExpiryTime(expiresAt) {
  const expiryTime = Date.parse(expiresAt)
  return Number.isNaN(expiryTime) ? null : expiryTime
}

function getExpiresAt(expiresIn) {
  const seconds = Number(expiresIn)
  if (!Number.isFinite(seconds) || seconds <= 0) return null

  return new Date(Date.now() + seconds * 1000).toISOString()
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [session, setSession] = useState(emptySession)
  const [isLoading, setIsLoading] = useState(false)

  const clearSession = useCallback(
    ({ redirect = false } = {}) => {
      clearAccessToken()
      setSession(emptySession)

      if (redirect && location.pathname !== '/login') {
        navigate('/login', {
          replace: true,
          state: { from: `${location.pathname}${location.search}` },
        })
      }
    },
    [location.pathname, location.search, navigate],
  )

  useEffect(() => setUnauthorizedHandler(() => clearSession({ redirect: true })), [clearSession])

  const login = useCallback(
    async ({ email, password }) => {
      setIsLoading(true)

      try {
        const loginResult = await loginRequest({ email, password })
        const expiresAt = getExpiresAt(loginResult.expiresIn)
        const expiryTime = getExpiryTime(expiresAt)

        if (!expiryTime || expiryTime <= Date.now()) {
          throw new Error('The server returned an expired login session.')
        }

        setAccessToken(loginResult.accessToken)
        const profile = await getCurrentUser()
        const user = { ...loginResult.user, ...profile }

        setSession({
          user,
          token: loginResult.accessToken,
          expiresAt,
        })

        return user
      } catch (error) {
        clearSession()
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [clearSession],
  )

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } finally {
      clearSession({ redirect: true })
    }
  }, [clearSession])

  const updateUser = useCallback((updates) => {
    setSession((current) => {
      if (!current.user) return current

      return {
        ...current,
        user: { ...current.user, ...updates },
      }
    })
  }, [])

  const expiryTime = getExpiryTime(session.expiresAt)

  useEffect(() => {
    if (!expiryTime) return undefined

    const timeoutId = window.setTimeout(
      () => clearSession({ redirect: true }),
      Math.max(0, expiryTime - Date.now()),
    )

    return () => window.clearTimeout(timeoutId)
  }, [clearSession, expiryTime])

  const value = useMemo(
    () => ({
      user: session.user,
      token: session.token,
      expiresAt: session.expiresAt,
      isLoading,
      isAuthenticated: Boolean(session.user && session.token),
      login,
      logout,
      updateUser,
    }),
    [isLoading, login, logout, session, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
