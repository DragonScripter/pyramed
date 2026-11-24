import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import './LoginPage.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getDestination(from) {
  return typeof from === 'string' && from.startsWith('/') && !from.startsWith('//')
    ? from
    : '/'
}

function validate({ email, password }) {
  const errors = {}

  if (!email.trim()) {
    errors.email = 'Email is required.'
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (!password) {
    errors.password = 'Password is required.'
  }

  return errors
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isLoading, login } = useAuth()
  const destination = useMemo(
    () => getDestination(location.state?.from),
    [location.state?.from],
  )
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      navigate(destination, { replace: true })
    }
  }, [destination, isAuthenticated, navigate])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setSubmitError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    setSubmitError('')

    if (Object.keys(nextErrors).length > 0) return

    try {
      await login({ email: form.email.trim(), password: form.password })
      navigate(destination, { replace: true })
    } catch (error) {
      if (error?.status === 401) {
        setSubmitError('Invalid email or password.')
      } else if (error?.status === 403) {
        setSubmitError('Your account is not authorized to access PyraMed.')
      } else {
        setSubmitError(error?.message || 'Unable to sign in. Please try again.')
      }
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <p className="login-card__eyebrow">PyraMed clinical operations</p>
        <h1 id="login-title">Sign in</h1>
        <p className="login-card__description">
          Use your assigned clinical account to access PyraMed.
        </p>

        {submitError && (
          <div className="login-card__error" role="alert">
            {submitError}
          </div>
        )}

        <form className="login-form" noValidate onSubmit={handleSubmit}>
          <div className="login-form__field">
            <label htmlFor="login-email">Email address</label>
            <input
              aria-describedby={errors.email ? 'login-email-error' : undefined}
              aria-invalid={Boolean(errors.email)}
              autoComplete="username"
              id="login-email"
              name="email"
              onChange={handleChange}
              type="email"
              value={form.email}
            />
            {errors.email && (
              <p className="login-form__field-error" id="login-email-error" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div className="login-form__field">
            <label htmlFor="login-password">Password</label>
            <input
              aria-describedby={errors.password ? 'login-password-error' : undefined}
              aria-invalid={Boolean(errors.password)}
              autoComplete="current-password"
              id="login-password"
              name="password"
              onChange={handleChange}
              type="password"
              value={form.password}
            />
            {errors.password && (
              <p className="login-form__field-error" id="login-password-error" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          <button className="login-form__submit" disabled={isLoading} type="submit">
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  )
}
