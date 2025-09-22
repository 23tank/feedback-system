import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE, getToken } from '../lib/auth.js'

export default function AdminCreateForm() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [published, setPublished] = useState(true)
  const [questions, setQuestions] = useState([{ question_text:'', type:'single', options:'', image_url:'' }])
  const [msg, setMsg] = useState('')

  function addQuestion() {
    setQuestions(qs => [...qs, { question_text:'', type:'single', options:'', image_url:'' }])
  }

  function updateQuestion(i, field, value) {
    setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, [field]: value } : q))
  }

  async function submit() {
    const payload = {
      title,
      description,
      image_url: imageUrl,
      published,
      questions: questions.map(q => ({
        question_text: q.question_text,
        type: q.type,
        options: q.options.split('|').map(s => s.trim()).filter(Boolean),
        image_url: q.image_url
      }))
    }
    const res = await fetch(`${API_BASE}/forms`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (!res.ok) { setMsg(data.message || 'Error creating form'); return }
    setMsg('Form created!')
    setTitle(''); setDescription(''); setImageUrl(''); setPublished(true); setQuestions([{ question_text:'', type:'single', options:'', image_url:'' }])
    setTimeout(() => navigate('/forms'), 500)
  }

  return (
    <div className="card">
      <h2>Create Feedback Form</h2>
      {msg && <div className="success">{msg}</div>}
      <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      <input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
      <input placeholder="Header Image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
      <label style={{ display:'flex', alignItems:'center', gap:8 }}>
        <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} /> Published
      </label>
      <h3>Questions</h3>
      {questions.map((q, i) => (
        <div className="card" key={i} style={{ padding:12, marginBottom:12 }}>
          <input placeholder="Question text" value={q.question_text} onChange={e => updateQuestion(i, 'question_text', e.target.value)} />
          <select value={q.type} onChange={e => updateQuestion(i, 'type', e.target.value)}>
            <option value="single">Single choice</option>
            <option value="yesno">Yes / No</option>
            <option value="likert">Likert (Very Good → Very Poor)</option>
            <option value="text">Free text</option>
            <option value="stars">Star rating (1-5)</option>
          </select>
          <input placeholder="Options (separate with | )" value={q.options} onChange={e => updateQuestion(i, 'options', e.target.value)} />
          <input placeholder="Question Image URL (optional)" value={q.image_url} onChange={e => updateQuestion(i, 'image_url', e.target.value)} />
        </div>
      ))}
      <div style={{ display:'flex', gap:8 }}>
        <button className="btn" onClick={addQuestion}>Add question</button>
        <button className="btn" onClick={submit}>Create form</button>
      </div>
    </div>
  )
}

