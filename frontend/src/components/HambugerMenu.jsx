import { useState } from 'react'
import { Link } from 'react-router-dom'
import './HamburgerMenu.css'

function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false)

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
            <Link to='/' onClick={close}>Live Bedside Chart</Link>
          </li>
          <li>
            <Link to="/registration" onClick={close}>Patient Registration</Link>
          </li>
          <li>
            <Link to="/demo-telemetry" onClick={close}>Demo Telemetry</Link>
          </li>
        </ul>
      )}
    </nav>
  )
}

export default HamburgerMenu