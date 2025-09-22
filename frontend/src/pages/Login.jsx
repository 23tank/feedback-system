import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE, saveAuth } from '../lib/auth.js'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login failed')
      saveAuth(data.token, data.user)
      navigate(data.user.role === 'admin' ? '/admin' : '/feedback')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="card">
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={onSubmit}>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="btn" type="submit">Login</button>
      </form>
      <p>
        No account? <a href="/register">Register</a>
      </p>
    </div>
  )
}

