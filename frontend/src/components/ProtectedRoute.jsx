import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth' // switch to a default import if useAuth.js uses `export default`

export default function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/not-authorized" replace />
  }

  return <Outlet />
}