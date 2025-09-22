import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Feedback from './pages/Feedback.jsx'
import Questions from './pages/Questions.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import Forms from './pages/Forms.jsx'
import FormDetail from './pages/FormDetail.jsx'
import AdminCreateForm from './pages/AdminCreateForm.jsx'
import { getUser, logout } from './lib/auth.js'

function NavBar() {
  const navigate = useNavigate()
  const user = getUser()
  return (
    <nav className="nav">
      <Link to="/" className="brand" style={{ display:'flex', alignItems:'center', gap:10 }}>
        <img src="/logo.svg" alt="logo" className="brand-logo" />
        <span className="brand-title">Feedback System</span>
      </Link>
      <div className="spacer" />
      <Link to="/feedback">Feedback</Link>
      <Link to="/forms">See available forms</Link>
      {user?.role === 'admin' && <>
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/create-form">Create form</Link>
      </>}
      {!user && <Link to="/login">Login</Link>}
      {!user && <Link to="/register">Register</Link>}
      {user && (
        <button className="btn" onClick={() => { logout(); navigate('/login') }}>Logout</button>
      )}
    </nav>
  )
}

function ProtectedRoute({ children, roles }) {
  const user = getUser()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const user = getUser()
  return (
    <div className="container">
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/feedback') : '/login'} replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
        <Route path="/questions" element={<ProtectedRoute><Questions /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/forms" element={<ProtectedRoute><Forms /></ProtectedRoute>} />
        <Route path="/forms/:id" element={<ProtectedRoute><FormDetail /></ProtectedRoute>} />
        <Route path="/admin/create-form" element={<ProtectedRoute roles={["admin"]}><AdminCreateForm /></ProtectedRoute>} />
      </Routes>
    </div>
  )
}

