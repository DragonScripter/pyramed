import { useState } from 'react'
import { Link, useMatch } from 'react-router-dom'
import { useAuth } from '../context/useAuth' // match the export style in useAuth.js
import { PERMISSIONS } from '../config/roles'
import { hasPermission } from '../utils/auth'
import './HamburgerMenu.css'

function HamburgerMenu({ patientId }) {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

  const patientMatch = useMatch('/patients/:patientId/*')
  const currentPatientId = patientMatch?.params.patientId ?? patientId

  const close = () => setIsOpen(false)

  const items = [
    { label: 'Welcome Page', to: '/', public: true },
    { label: 'Live Bedside Chart', to: '/bedside' },
    { label: 'Patient List', to: '/patients' },
    ...(currentPatientId
      ? [{ label: 'Patient Info', to: `/patients/${currentPatientId}` }]
      : []),
    { label: 'Patient Registration', to: '/registration', permission: PERMISSIONS.PATIENTS_WRITE },
    { label: 'Demo Telemetry', to: '/demo-telemetry' },
    { label: 'My Profile', to: '/profile' },
    { label: 'Body Composition Dashboard', to: '/body-composition' },
    { label: 'Clinical Analyst Terminal', to: '/clinical-analyst' },
    { label: 'Role Management', to: '/admin/roles', permission: PERMISSIONS.ROLES_WRITE },
  ]

  const visibleItems = items.filter((item) => {
    if (item.public) return true
    if (!isAuthenticated) return false
    return !item.permission || hasPermission(user?.role, item.permission)
  })

  const handleLogout = async () => {
    close()
    await logout()
  }

  return (
    <nav className="hamburger-nav">
      <button
        className="hamburger-button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <span />
        <span />
        <span />
      </button>

      {isOpen && (
        <ul className="hamburger-menu">
          {visibleItems.map((item) => (
            <li key={item.to}>
              <Link to={item.to} onClick={close}>
                {item.label}
              </Link>
            </li>
          ))}

          <li>
            {isAuthenticated ? (
              <button type="button" onClick={handleLogout}>
                Log out
              </button>
            ) : (
              <Link to="/login" onClick={close}>
                Log in
              </Link>
            )}
          </li>
        </ul>
      )}
    </nav>
  )
}

export default HamburgerMenu
