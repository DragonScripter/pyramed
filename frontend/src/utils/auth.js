import { ROLE_PERMISSIONS } from '../config/roles'

export const normalizeRole = (role) =>
  Object.keys(ROLE_PERMISSIONS).find(
    (knownRole) => knownRole.toLowerCase() === role?.toLowerCase(),
  ) ?? null

export const hasRole = (userRole, allowedRoles = []) => {
  const normalizedRole = normalizeRole(userRole)
  return allowedRoles.some((role) => normalizeRole(role) === normalizedRole)
}

/**
 * Check if a specific user role has a particular permission
 * @param {string} userRole - The current user's role (e.g., 'Provider')
 * @param {string} requiredPermission - The permission being requested (e.g., 'analytics.read')
 * @returns {boolean}
 */
export const hasPermission = (userRole, requiredPermission) => {
  const normalizedRole = normalizeRole(userRole)
  return normalizedRole
    ? ROLE_PERMISSIONS[normalizedRole].includes(requiredPermission)
    : false
}
