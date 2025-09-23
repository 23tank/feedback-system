import { useEffect, useMemo, useState } from 'react'
import { API_BASE, getToken } from '../lib/auth.js'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js'
import { Pie, Bar, Line } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement)

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [stats, setStats] = useState(null)
  const [feedback, setFeedback] = useState([])
  const [minVotes, setMinVotes] = useState(0)
  const [history, setHistory] = useState([])
  const [historyFilters, setHistoryFilters] = useState({ formId: '', userId: '', limit: 50 })
  const [users, setUsers] = useState([])

  async function load() {
    const qs = new URLSearchParams()
    if (historyFilters.formId) qs.set('formId', historyFilters.formId)
    if (historyFilters.userId) qs.set('userId', historyFilters.userId)
    if (historyFilters.limit) qs.set('limit', String(historyFilters.limit))

    const [aRes, fRes, sRes, hRes, uRes] = await Promise.all([
      fetch(`${API_BASE}/admin/analytics`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      fetch(`${API_BASE}/admin/feedback?minVotes=${minVotes}`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      fetch(`${API_BASE}/admin/stats`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      fetch(`${API_BASE}/admin/history?${qs.toString()}` , { headers: { Authorization: `Bearer ${getToken()}` } }),
      fetch(`${API_BASE}/admin/users`, { headers: { Authorization: `Bearer ${getToken()}` } })
    ])
    const a = await aRes.json();
    const f = await fRes.json();
    const s = await sRes.json();
    const h = await hRes.json();
    const u = await uRes.json();
    setAnalytics(a)
    setFeedback(f)
    setStats(s)
    setHistory(Array.isArray(h) ? h : [])
    setUsers(Array.isArray(u) ? u : [])
  }

  useEffect(() => { load() }, [minVotes, historyFilters])

  const charts = useMemo(() => {
    if (!analytics) return null
    return {
      usersVsFeedback: {
        labels: ['Users', 'Feedback'],
        datasets: [{ data: [analytics.users, analytics.feedback], backgroundColor: ['#10b981', '#f59e0b'] }]
      },
      votes: {
        labels: ['Positive', 'Negative'],
        datasets: [{ label: 'Votes', data: [analytics.votes.positive || 0, analytics.votes.negative || 0], backgroundColor: ['#22c55e', '#ef4444'] }]
      },
      trends: {
        labels: analytics.trends.map(t => new Date(t.date).toLocaleDateString()),
        datasets: [{ label: 'Feedback per day', data: analytics.trends.map(t => t.count), borderColor: '#3b82f6' }]
      }
    }
  }, [analytics])

  return (
    <div className="grid">
      <div className="card">
        <h2>Admin Analytics</h2>
        {stats && (
          <div className="muted" style={{ marginBottom: 8 }}>
            Forms: {stats.totalForms} • Responses: {stats.totalResponses}
          </div>
        )}
        <div className="controls">
          <label>Min votes filter
            <input type="number" value={minVotes} onChange={e => setMinVotes(Number(e.target.value))} />
          </label>
        </div>
        {charts && (
          <div className="charts">
            <div className="chart"><Pie data={charts.usersVsFeedback} /></div>
            <div className="chart"><Bar data={charts.votes} /></div>
            <div className="chart"><Line data={charts.trends} /></div>
          </div>
        )}
      </div>
      <div className="card">
        <h2>Users & Submissions</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Username</th>
                <th>Role</th>
                <th>Responses</th>
                <th>Feedback items</th>
                <th>Last response</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>@{u.username}</td>
                  <td>{u.role}</td>
                  <td>{u.response_count}</td>
                  <td>{u.feedback_count}</td>
                  <td>{u.last_response_at ? new Date(u.last_response_at).toLocaleString() : '-'}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={6} className="muted">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <h2>All Feedback</h2>
        <ul className="list">
          {feedback.map(f => (
            <li key={f.id} className="list-item">
              <div>
                <div className="muted">@{f.username} • {new Date(f.created_at).toLocaleString()}</div>
                <div>{f.feedback_text}</div>
              </div>
              <div className="votes">{f.votes}</div>
            </li>
          ))}
        </ul>
      </div>
      <div className="card">
        <h2>Submission History</h2>
        <div className="controls" style={{ gap: 12, display: 'flex', flexWrap: 'wrap' }}>
          <label>Form ID
            <input
              type="number"
              value={historyFilters.formId}
              onChange={e => setHistoryFilters(v => ({ ...v, formId: e.target.value }))}
              placeholder="e.g. 1"
              min={0}
            />
          </label>
          <label>User ID
            <input
              type="number"
              value={historyFilters.userId}
              onChange={e => setHistoryFilters(v => ({ ...v, userId: e.target.value }))}
              placeholder="e.g. 3"
              min={0}
            />
          </label>
          <label>Limit
            <input
              type="number"
              value={historyFilters.limit}
              onChange={e => setHistoryFilters(v => ({ ...v, limit: Math.max(1, Number(e.target.value||50)) }))}
              min={1}
            />
          </label>
          <button onClick={() => load()}>Refresh</button>
          <button onClick={() => setHistoryFilters({ formId: '', userId: '', limit: 50 })}>Clear</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>User ID</th>
                <th>Form</th>
                <th>Form ID</th>
                <th>Question</th>
                <th>Type</th>
                <th>Answer</th>
              </tr>
            </thead>
            <tbody>
              {history.map(r => (
                <tr key={r.id}>
                  <td>{new Date(r.created_at).toLocaleString()}</td>
                  <td>@{r.username}</td>
                  <td>{r.user_id}</td>
                  <td>{r.form_title || '-'}</td>
                  <td>{r.form_id || '-'}</td>
                  <td>{r.question_text}</td>
                  <td>{r.type}</td>
                  <td>{typeof r.answer === 'string' ? r.answer : JSON.stringify(r.answer)}</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr><td colSpan={8} className="muted">No submissions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

