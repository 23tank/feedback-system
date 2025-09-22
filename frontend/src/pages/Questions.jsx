import { useEffect, useState } from 'react'
import { API_BASE, getToken } from '../lib/auth.js'

export default function Questions() {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})

  async function load() {
    const res = await fetch(`${API_BASE}/questions`, { headers: { Authorization: `Bearer ${getToken()}` } })
    const data = await res.json()
    setQuestions(data)
  }

  useEffect(() => { load() }, [])

  async function submitAnswer(qid) {
    const answer = answers[qid]
    if (!answer) return
    await fetch(`${API_BASE}/questions/${qid}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ answer })
    })
    const idx = questions.findIndex(q => q.id === qid)
    if (idx === questions.length - 1) {
      window.location.href = '/admin'
    } else {
      const next = questions[idx + 1]
      document.getElementById(`q-${next.id}`)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="card">
      <h2>Questionnaires</h2>
      <div className="qa">
        {questions.map(q => {
          const opts = (() => { try { return JSON.parse(q.options) } catch { return [] } })()
          return (
            <div id={`q-${q.id}`} className="question" key={q.id}>
              <div className="qtext">{q.question_text}</div>
              <div className="options">
                {opts.map(opt => (
                  <label key={opt} className={`option ${answers[q.id] === opt ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt}
                      onChange={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                    />
                    {opt}
                  </label>
                ))}
              </div>
              <button className="btn" onClick={() => submitAnswer(q.id)}>Submit answer</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

