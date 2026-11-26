import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth' // switch to a default import if useAuth.js uses `export default`
import { hasPermission, hasRole } from '../utils/auth'

export default function ProtectedRoute({ allowedRoles, requiredPermission }) {
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

  if (allowedRoles && !hasRole(user.role, allowedRoles)) {
    return <Navigate to="/not-authorized" replace />
  }

  if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
    return <Navigate to="/not-authorized" replace />
  }

  return <Outlet />
}
