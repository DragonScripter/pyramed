
import { useState } from 'react'
import { Link, useMatch } from 'react-router-dom' //  Added useMatch
import './HamburgerMenu.css'

//  Added patientId prop from App.jsx
function HamburgerMenu({ patientId }) {
  const [isOpen, setIsOpen] = useState(false)

  //  Get the patient ID from the current URL
  const patientMatch = useMatch('/patients/:patientId/*')

 //   Use the URL patient ID, or fall back to App's default ID
  const currentPatientId =
    patientMatch?.params.patientId ?? patientId

  const close = () => setIsOpen(false)

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
          <li>
            <Link to="/" onClick={close}>
              Live Bedside Chart
            </Link>
          </li>

          {/* NEW: Show Patient Info only when a patient ID exists */}
          {currentPatientId && (
            <li>
              <Link
                to={`/patients/${currentPatientId}`}
                onClick={close}
              >
                Patient Info
              </Link>
            </li>
          )}

          <li>
            <Link to="/registration" onClick={close}>
              Patient Registration
            </Link>
          </li>

          <li>
            <Link to="/demo-telemetry" onClick={close}>
              Demo Telemetry
            </Link>
          </li>
        </ul>
      )}
    </nav>
  )
}

export default HamburgerMenu
