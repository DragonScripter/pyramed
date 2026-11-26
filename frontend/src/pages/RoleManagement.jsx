import { useEffect, useState } from 'react'
import { apiFetch } from '../api'
import { ALL_PERMISSIONS, PERMISSIONS, ROLE_DEFINITIONS, ROLES } from '../config/roles'
import { hasPermission } from '../utils/auth'

export default function RoleManagement() {
  const [loading, setLoading] = useState(true)
  const [canManageRoles, setCanManageRoles] = useState(false)
  const [error, setError] = useState('')
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [savingRoleId, setSavingRoleId] = useState(null)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    async function checkAccess() {
      try {
        const response = await apiFetch('/api/users/me')

        if (!response.ok) {
          throw new Error('Unable to verify your access.')
        }

       const user = await response.json()

const canManage = hasPermission(user.role, PERMISSIONS.ROLES_WRITE)
setCanManageRoles(canManage)

if (canManage) {
  const rolesResponse = await apiFetch('/api/roles')

  if (!rolesResponse.ok) {
    throw new Error('Unable to load roles and permissions.')
  }

  const rolesData = await rolesResponse.json()

  setRoles(rolesData)

          setPermissions(ALL_PERMISSIONS)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [])

function handlePermissionChange(roleId, permission) {
  setRoles(previousRoles =>
    previousRoles.map(role => {
      if (
        role.roleId !== roleId ||
        role.name === ROLES.ADMINISTRATOR
      ) {
        return role
      }

      const currentPermissions = role.permissions ?? []

      const updatedPermissions = currentPermissions.includes(permission)
        ? currentPermissions.filter(p => p !== permission)
        : [...currentPermissions, permission]

      return {
        ...role,
        permissions: updatedPermissions
      }
    })
  )

  setFeedback(null)
}
  
  async function handleSaveRole(role) {
  if (role.name === ROLES.ADMINISTRATOR) return

  if (!role.roleId) {
    setFeedback({
      type: 'error',
      message: 'Cannot save permissions: invalid role ID.'
    })
    return
  }

  if (!Array.isArray(role.permissions)) {
    setFeedback({
      type: 'error',
      message: 'Cannot save: invalid permissions data.'
    })
    return
  }

  setSavingRoleId(role.roleId)
  setFeedback(null)

  try {
    const response = await apiFetch(
      `/api/roles/${role.roleId}/permissions`,
      {
        method: 'PUT',
        body: JSON.stringify({
          permissions: role.permissions ?? []
        })
      }
    )

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(
        result?.message ?? `Unable to save permissions (${response.status}).`
      )
    }

    setFeedback({
      type: 'success',
      message: `${role.name} permissions saved successfully.`
    })
  } catch (err) {
    setFeedback({
      type: 'error',
      message: err.message || 'Failed to save permissions.'
    })
  } finally {
    setSavingRoleId(null)
  }
}

  if (loading) return <p>Checking administrator access...</p>

  if (error) return <p role="alert">{error}</p>

  if (!canManageRoles) {
    return <p role="alert">Access denied. Administrators only.</p>
  }

  return (
  <main className="role-management">
    <h1>Role Management</h1>
    <p>Manage staff roles and their assigned permissions.</p>

    <h2>Role Permission Matrix</h2>

    <table>
      <thead>
        <tr>
          <th scope="col">Permission</th>
          {roles.map(role => (
            <th scope="col" key={role.roleId}>
              {ROLE_DEFINITIONS[role.name]?.label ?? role.name}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {permissions.map(permission => (
          <tr key={permission}>
            <th scope="row">{permission}</th>

            {roles.map(role => (
              <td key={role.roleId}>
                <input
              type="checkbox"
              aria-label={`${role.name}: ${permission}`}
              checked={(role.permissions ?? []).includes(permission)}
        onChange={() => handlePermissionChange(role.roleId,permission)}
              disabled={role.name === ROLES.ADMINISTRATOR}
            />
              </td>
            ))}
          </tr>
        ))}
            </tbody>
    </table>

    <div className="role-management-actions">
      <h2>Save Permission Changes</h2>

      {roles
        .filter(role => role.name !== ROLES.ADMINISTRATOR)
        .map(role => (
          <button
            key={role.roleId}
            type="button"
            onClick={() => handleSaveRole(role)}
            disabled={savingRoleId !== null}
          >
            {savingRoleId === role.roleId
              ? 'Saving...'
              : `Save ${role.name}`}
          </button>
        ))}
    </div>

    {feedback && (
      <p role="alert" className={`feedback-${feedback.type}`}>
        {feedback.message}
      </p>
    )}
  </main>
)
}
