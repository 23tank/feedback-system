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

  async function load() {
    const [aRes, fRes, sRes] = await Promise.all([
      fetch(`${API_BASE}/admin/analytics`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      fetch(`${API_BASE}/admin/feedback?minVotes=${minVotes}`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      fetch(`${API_BASE}/admin/stats`, { headers: { Authorization: `Bearer ${getToken()}` } })
    ])
    const a = await aRes.json();
    const f = await fRes.json();
    const s = await sRes.json();
    setAnalytics(a)
    setFeedback(f)
    setStats(s)
  }

  useEffect(() => { load() }, [minVotes])

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
    </div>
  )
}

