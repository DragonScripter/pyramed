import { Link } from 'react-router-dom'

export default function NotAuthorized() {
  return (
    <main style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
      <h1>Not authorized</h1>
      <p>You don't have permission to view this page.</p>
      <Link to="/">Back to home</Link>
    </main>
  )
}