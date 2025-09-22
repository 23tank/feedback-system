import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { API_BASE, getToken } from '../lib/auth.js'

export default function FormDetail() {
  const { id } = useParams()
  const [form, setForm] = useState(null)
  const [answers, setAnswers] = useState({})

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API_BASE}/forms/${id}`, { headers: { Authorization: `Bearer ${getToken()}` } })
      const data = await res.json();
      setForm(data)
    })()
  }, [id])

  async function submitAll() {
    if (!form) return
    for (const q of form.questions) {
      const ans = answers[q.id]
      if (ans) {
        await fetch(`${API_BASE}/questions/${q.id}/answer`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }, body: JSON.stringify({ answer: ans })
        })
      }
    }
    alert('Responses submitted!')
  }

  if (!form) return <div className="card">Loading...</div>

  return (
    <div className="card">
      <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:12 }}>
        {form.image_url && <img src={form.image_url} alt="" style={{ width:72, height:72, borderRadius:12, objectFit:'cover', border:'1px solid #eee' }} />}
        <div>
          <h2 style={{ margin:'0 0 6px 0' }}>{form.title}</h2>
          <div className="muted">{form.description}</div>
        </div>
      </div>
      <div className="qa">
        {form.questions.map(q => {
          const opts = (() => { try { return JSON.parse(q.options) } catch { return [] } })()
          return (
            <div className="question" key={q.id}>
              <div className="qtext">{q.question_text}</div>
              {q.image_url && <img src={q.image_url} alt="" style={{ width:'100%', maxWidth:420, borderRadius:12, border:'1px solid #eee' }} />}
              {q.type === 'text' ? (
                <input placeholder="Type your answer" value={answers[q.id] || ''} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))} />
              ) : q.type === 'stars' ? (
                <div className="options" style={{ marginTop:8 }}>
                  {[1,2,3,4,5].map(star => (
                    <button
                      key={star}
                      className={`star ${Number(answers[q.id] || 0) >= star ? 'active' : ''}`}
                      onClick={() => setAnswers(a => ({ ...a, [q.id]: star }))}
                      type="button"
                    >★</button>
                  ))}
                </div>
              ) : (
                <div className="options" style={{ marginTop:8 }}>
                  {(q.type === 'yesno' ? ['Yes','No'] : q.type === 'likert' ? ['Very Good','Good','Fair','Poor','Very Poor'] : opts).map(opt => (
                    <label key={opt} className={`option ${answers[q.id] === opt ? 'active' : ''}`}>
                      <input type="radio" name={`q-${q.id}`} value={opt} onChange={() => setAnswers(a => ({ ...a, [q.id]: opt }))} />{opt}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <button className="btn" onClick={submitAll} style={{ marginTop:12 }}>Submit responses</button>
    </div>
  )
}

