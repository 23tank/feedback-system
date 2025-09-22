import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../lib/auth.js'

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const navigate = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setOk('')
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Registration failed')
      setOk('Registered. You can login now.')
      setTimeout(() => navigate('/login'), 800)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="card">
      <h2>Register</h2>
      {error && <div className="error">{error}</div>}
      {ok && <div className="success">{ok}</div>}
      <form onSubmit={onSubmit}>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button className="btn" type="submit">Create account</button>
      </form>
      <p>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  )
}

