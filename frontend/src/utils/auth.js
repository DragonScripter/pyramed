import { ROLE_PERMISSIONS } from '../config/roles';

/**
 * Check if a specific user role has a particular permission
 * @param {string} userRole - The current user's role (e.g., 'PHYSICIAN')
 * @param {string} requiredPermission - The permission being requested (e.g., 'analytics:view')
 * @returns {boolean}
 */
export const hasPermission = (userRole, requiredPermission) => {
  if (!userRole || !ROLE_PERMISSIONS[userRole]) {
    return false;
  }
  return ROLE_PERMISSIONS[userRole].includes(requiredPermission);
};