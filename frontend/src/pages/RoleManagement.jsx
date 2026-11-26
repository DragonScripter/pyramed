import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../api'
import {
  ALL_PERMISSIONS,
  PERMISSIONS,
  ROLE_DEFINITIONS,
  ROLES,
} from '../config/roles'
import { hasPermission } from '../utils/auth'
import './RoleManagement.css'

const ROLE_ORDER = [
  ROLES.CLERK,
  ROLES.PROVIDER,
  ROLES.ANALYST,
  ROLES.ADMINISTRATOR,
]

const PERMISSION_GROUPS = [
  { label: 'Patient data', prefix: 'patients.' },
  { label: 'Clinical records', prefix: 'records.' },
  { label: 'Clinical rules', prefix: 'rules.' },
  { label: 'Insights and audit', prefix: null },
  { label: 'Role administration', prefix: 'roles.' },
]

function groupPermissions(permissions) {
  return PERMISSION_GROUPS.map((group) => ({
    ...group,
    permissions: permissions.filter((permission) => {
      if (group.prefix) return permission.startsWith(group.prefix)
      return permission.startsWith('analytics.') || permission.startsWith('audit.')
    }),
  })).filter((group) => group.permissions.length > 0)
}

function sortRoles(roles) {
  return [...roles].sort((left, right) => {
    const leftIndex = ROLE_ORDER.indexOf(left.name)
    const rightIndex = ROLE_ORDER.indexOf(right.name)
    return (leftIndex < 0 ? ROLE_ORDER.length : leftIndex) -
      (rightIndex < 0 ? ROLE_ORDER.length : rightIndex)
  })
}

export default function RoleManagement() {
  const [loading, setLoading] = useState(true)
  const [canManageRoles, setCanManageRoles] = useState(false)
  const [error, setError] = useState('')
  const [roles, setRoles] = useState([])
  const [savingRoleId, setSavingRoleId] = useState(null)
  const [dirtyRoleIds, setDirtyRoleIds] = useState(new Set())
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    async function loadRolePolicy() {
      try {
        const profileResponse = await apiFetch('/api/users/me')
        if (!profileResponse.ok) throw new Error('Unable to verify your access.')

        const user = await profileResponse.json()
        const canManage = hasPermission(user.role, PERMISSIONS.ROLES_WRITE)
        setCanManageRoles(canManage)

        if (!canManage) return

        const rolesResponse = await apiFetch('/api/roles')
        if (!rolesResponse.ok) {
          throw new Error('Unable to load roles and permissions.')
        }

        const rolesData = await rolesResponse.json()
        setRoles(sortRoles(rolesData))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadRolePolicy()
  }, [])

  const permissionGroups = useMemo(
    () => groupPermissions(ALL_PERMISSIONS),
    [],
  )

  function handlePermissionChange(roleId, permission) {
    setRoles((previousRoles) => previousRoles.map((role) => {
      if (role.roleId !== roleId || role.name === ROLES.ADMINISTRATOR) return role

      const currentPermissions = role.permissions ?? []
      const nextPermissions = currentPermissions.includes(permission)
        ? currentPermissions.filter((item) => item !== permission)
        : [...currentPermissions, permission]

      return { ...role, permissions: nextPermissions }
    }))
    setDirtyRoleIds((previousIds) => new Set(previousIds).add(roleId))
    setFeedback(null)
  }

  async function handleSaveRole(role) {
    if (role.name === ROLES.ADMINISTRATOR || !dirtyRoleIds.has(role.roleId)) return

    setSavingRoleId(role.roleId)
    setFeedback(null)

    try {
      const response = await apiFetch(`/api/roles/${role.roleId}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permissions: role.permissions ?? [] }),
      })
      const result = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(result?.message ?? `Unable to save permissions (${response.status}).`)
      }

      setRoles((previousRoles) => previousRoles.map((item) => (
        item.roleId === role.roleId
          ? { ...item, permissions: result.permissions ?? item.permissions }
          : item
      )))
      setDirtyRoleIds((previousIds) => {
        const nextIds = new Set(previousIds)
        nextIds.delete(role.roleId)
        return nextIds
      })
      setFeedback({ type: 'success', message: `${role.name} permissions saved.` })
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save permissions.' })
    } finally {
      setSavingRoleId(null)
    }
  }

  if (loading) return <p className="role-management__status">Checking role-management access...</p>
  if (error) return <p className="role-management__status" role="alert">{error}</p>
  if (!canManageRoles) {
    return <p className="role-management__status" role="alert">Access denied. Administrators only.</p>
  }

  return (
    <main className="role-management">
      <header className="role-management__header">
        <div>
          <p className="role-management__eyebrow">Access control</p>
          <h1>Role Management</h1>
          <p>Define the access each operational role needs. Administrator permissions are read-only.</p>
        </div>
        <span className="role-management__role-count">{roles.length} roles</span>
      </header>

      {feedback && (
        <p role="status" className={`role-management__feedback role-management__feedback--${feedback.type}`}>
          {feedback.message}
        </p>
      )}

      <div className="role-management__matrix-wrapper">
        <table className="role-management__matrix">
          <caption>Role-to-permission mapping</caption>
          <thead>
            <tr>
              <th scope="col">Permission</th>
              {roles.map((role) => (
                <th scope="col" key={role.roleId}>
                  <span>{ROLE_DEFINITIONS[role.name]?.label ?? role.name}</span>
                  <small>{ROLE_DEFINITIONS[role.name]?.description ?? role.description}</small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissionGroups.map((group) => (
              <tr className="role-management__group" key={group.label}>
                <th colSpan={roles.length + 1} scope="colgroup">{group.label}</th>
              </tr>
            ))}
            {permissionGroups.flatMap((group) => group.permissions.map((permission) => (
              <tr key={permission}>
                <th scope="row"><code>{permission}</code></th>
                {roles.map((role) => {
                  const isAdministrator = role.name === ROLES.ADMINISTRATOR
                  return (
                    <td key={role.roleId}>
                      <input
                        type="checkbox"
                        aria-label={`${role.name}: ${permission}`}
                        checked={(role.permissions ?? []).includes(permission)}
                        onChange={() => handlePermissionChange(role.roleId, permission)}
                        disabled={isAdministrator || savingRoleId === role.roleId}
                      />
                    </td>
                  )
                })}
              </tr>
            ))) }
          </tbody>
        </table>
      </div>

      <section className="role-management__actions" aria-labelledby="save-role-heading">
        <h2 id="save-role-heading">Save changes</h2>
        <div className="role-management__buttons">
          {roles.filter((role) => role.name !== ROLES.ADMINISTRATOR).map((role) => (
            <button
              key={role.roleId}
              type="button"
              onClick={() => handleSaveRole(role)}
              disabled={savingRoleId !== null || !dirtyRoleIds.has(role.roleId)}
            >
              {savingRoleId === role.roleId ? 'Saving...' : `Save ${role.name}`}
              {dirtyRoleIds.has(role.roleId) && savingRoleId !== role.roleId ? ' *' : ''}
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}
