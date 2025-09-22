import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE, getToken } from '../lib/auth.js'

export default function Forms() {
  const [forms, setForms] = useState([])
  useEffect(() => {
    (async () => {
      const res = await fetch(`${API_BASE}/forms`, { headers: { Authorization: `Bearer ${getToken()}` } })
      const data = await res.json()
      setForms(data)
    })()
  }, [])

  return (
    <div className="grid">
      {forms.map(f => (
        <div className="card" key={f.id}>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            {f.image_url && <img src={f.image_url} alt="" style={{ width:64, height:64, borderRadius:12, objectFit:'cover', border:'1px solid #eee' }} />}
            <div>
              <h3 style={{ margin:'0 0 6px 0' }}>{f.title}</h3>
              <div className="muted">{f.description}</div>
            </div>
          </div>
          <div style={{ marginTop:12 }}>
            <Link to={`/forms/${f.id}`} className="btn">Open form</Link>
          </div>
        </div>
      ))}
    </div>
  )
}

