import { useState } from 'react'
import { apiFetch } from '../api'
import { useAuth } from '../context/useAuth'

async function readError(response) {
  const body = await response.json().catch(() => null)
  return body?.message ?? `Request failed (${response.status})`
}

function toProfileUser(profile, authenticatedUser) {
  return {
    id: profile.id,
    name: profile.fullName ?? '',
    email: authenticatedUser?.email ?? '',
    role: profile.role ?? '',
    avatarUrl: profile.avatarUrl ?? '',
  }
}

async function updateMe({ name }, authenticatedUser) {
  const response = await apiFetch('/api/users/me', {
    method: 'PUT',
    body: JSON.stringify({ fullName: name }),
  })

  if (response.status === 401) {
    throw new Error('Your session has expired. Please sign in again.')
  }
  if (!response.ok) throw new Error(await readError(response))

  return toProfileUser(await response.json(), authenticatedUser)
}

function validateProfile({ name }) {
  const errors = {}
  if (!name.trim()) errors.name = 'Name is required'
  return errors
}

export default function UserProfile() {
  const { user: authenticatedUser, updateUser } = useAuth()
  const [form, setForm] = useState({ name: '' })
  const [errors, setErrors] = useState({})
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const user = authenticatedUser
    ? toProfileUser(authenticatedUser, authenticatedUser)
    : null

  const handleChange = (event) =>
    setForm((current) => ({ ...current, name: event.target.value }))

  function handleCancel() {
    setForm({ name: user.name })
    setErrors({})
    setEditing(false)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFeedback(null)

    const validationErrors = validateProfile(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSaving(true)
    try {
      const updated = await updateMe({ name: form.name.trim() }, authenticatedUser)
      updateUser({
        id: updated.id,
        fullName: updated.name,
        avatarUrl: updated.avatarUrl,
        role: updated.role,
      })
      setEditing(false)
      setFeedback({ type: 'success', message: 'Profile updated successfully.' })
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Something went wrong.' })
    } finally {
      setSaving(false)
    }
  }

  if (!user) return <p role="alert">Error: Please sign in to view your profile.</p>

  return (
    <div className="user-profile">
      <h1>My Profile</h1>

      {feedback && (
        <div role="alert" className={`banner banner-${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      <div className="avatar">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={`${user.name}'s avatar`} width={96} height={96} />
        ) : (
          <div aria-hidden="true">{user.name.charAt(0).toUpperCase()}</div>
        )}
      </div>

      {!editing ? (
        <div>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <button onClick={() => {
            setFeedback(null)
            setForm({ name: user.name })
            setEditing(true)
          }}>
            Edit
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} />
          </label>
          {errors.name && <span className="field-error">{errors.name}</span>}

          <label>
            Email (managed by your account)
            <input name="email" type="email" value={user.email} disabled />
          </label>

          <p><strong>Role:</strong> {user.role} (read-only)</p>

          <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          <button type="button" onClick={handleCancel} disabled={saving}>Cancel</button>
        </form>
      )}
    </div>
  )
}
