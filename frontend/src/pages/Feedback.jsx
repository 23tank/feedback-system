import { useEffect, useState } from 'react'
import { API_BASE, getToken } from '../lib/auth.js'
import { Link } from 'react-router-dom'

export default function Feedback() {
  const [items, setItems] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [submittedCount, setSubmittedCount] = useState(0)

  async function load() {
    setLoading(true)
    const res = await fetch(`${API_BASE}/feedback`, { headers: { Authorization: `Bearer ${getToken()}` } })
    const data = await res.json()
    setItems(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/stats`, { headers: { Authorization: `Bearer ${getToken()}` } })
        const data = await res.json()
        if (res.ok) setSubmittedCount(data.userSubmitted || 0)
      } catch {}
    })()
  }, [])

  async function submitFeedback() {
    if (!text.trim()) return
    await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ feedback_text: text })
    })
    setText('')
    load()
  }

  async function vote(id, direction) {
    await fetch(`${API_BASE}/feedback/${id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ direction })
    })
    load()
  }

  return (
    <div className="grid">
      <div className="card">
        <h2>Submit Feedback</h2>
        <textarea placeholder="Your feedback..." value={text} onChange={e => setText(e.target.value)} />
        <button className="btn" onClick={submitFeedback}>Submit</button>
      </div>
      <div className="card">
        <h2>All Feedback</h2>
        {loading ? <div>Loading...</div> : (
          <ul className="list">
            {items.map(it => (
              <li key={it.id} className="list-item">
                <div>
                  <div className="muted">@{it.username} • {new Date(it.created_at).toLocaleString()}</div>
                  <div>{it.feedback_text}</div>
                </div>
                <div className="actions">
                  <button className="icon" onClick={() => vote(it.id, 'up')}>⬆</button>
                  <span className="votes">{it.votes}</span>
                  <button className="icon" onClick={() => vote(it.id, 'down')}>⬇</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="card">
        <h2>Your activity</h2>
        <div className="muted" style={{ marginBottom: 10 }}>Forms submitted: {submittedCount}</div>
        <Link className="btn" to="/forms">See available forms</Link>
      </div>
    </div>
  )
}

