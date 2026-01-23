import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'

const API_BASE = '/api'

const api = {
  async fetch(url, options = {}) {
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    const data = await response.json()
    return { ok: response.ok, status: response.status, data }
  },

  async fetchMultipart(url, formData) {
    const response = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })
    const data = await response.json()
    return { ok: response.ok, status: response.status, data }
  },
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const result = await api.fetch('/me')
    if (result.ok) {
      setUser(result.data.user)
    }
    setLoading(false)
  }

  const logout = async () => {
    await api.fetch('/logout')
    setUser(null)
  }

  if (loading) return <div>Loading...</div>

  return (
    <BrowserRouter>
      <nav>
        <h1>TicketTracker</h1>
        <div className="nav-links">
          {user ? (
            <>
              <span>Welcome, {user.name} ({user.role})</span>
              <Link to="/tickets"><button>Tickets</button></Link>
              <Link to="/tickets/new"><button>New Ticket</button></Link>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"><button>Login</button></Link>
              <Link to="/register"><button>Register</button></Link>
            </>
          )}
        </div>
      </nav>
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/tickets" />} />
          <Route path="/register" element={<Register onRegister={checkAuth} />} />
          <Route path="/login" element={<Login onLogin={checkAuth} />} />
          <Route path="/tickets" element={user ? <TicketList user={user} /> : <Navigate to="/login" />} />
          <Route path="/tickets/new" element={user ? <CreateTicket /> : <Navigate to="/login" />} />
          <Route path="/tickets/:id" element={user ? <TicketDetail user={user} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

function Register({ onRegister }) {
  const [formData, setFormData] = useState({ email: '', password: '', name: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const payload = { user: { ...formData } }

    const result = await api.fetch('/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    if (result.ok) {
      setSuccess(result.data.message)
      setTimeout(() => navigate('/login'), 2000)
    } else {
      setError(result.data.errors?.join(', ') || result.data.error)
    }
  }

  return (
    <div className="form-container">
      <h2>Register</h2>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  )
}

function Login({ onLogin }) {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const result = await api.fetch('/login', {
      method: 'POST',
      body: JSON.stringify(formData),
    })

    if (result.ok) {
      await onLogin()
      navigate('/tickets')
    } else {
      setError(result.data.error)
    }
  }

  return (
    <div className="form-container">
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

function TicketList({ user }) {
  const [tickets, setTickets] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {
    const result = await api.fetch('/tickets')
    if (result.ok) {
      setTickets(result.data.tickets)
    }
  }

  return (
    <div>
      <h2>Tickets</h2>
      <div className="tickets-list">
        {tickets.map(ticket => (
          <div
            key={ticket.id}
            className="ticket-card"
            onClick={() => navigate(`/tickets/${ticket.id}`)}
          >
            <h3>{ticket.title}</h3>
            <div className="meta">
              By {ticket.owner_name} | Visibility: {ticket.visibility} |
              Attachments: {ticket.attachments_count}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CreateTicket() {
  const [formData, setFormData] = useState({ title: '', description: '', visibility: 'public' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const result = await api.fetch('/tickets', {
      method: 'POST',
      body: JSON.stringify({ ticket: formData }),
    })

    if (result.ok) {
      navigate(`/tickets/${result.data.ticket.id}`)
    } else {
      setError(result.data.errors?.join(', ') || result.data.error)
    }
  }

  return (
    <div className="form-container">
      <h2>Create Ticket</h2>
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Visibility</label>
          <select
            value={formData.visibility}
            onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
        <button type="submit">Create Ticket</button>
      </form>
    </div>
  )
}

function TicketDetail({ user }) {
  const [ticket, setTicket] = useState(null)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const id = window.location.pathname.split('/').pop()

  useEffect(() => {
    loadTicket()
  }, [id])

  const loadTicket = async () => {
    const result = await api.fetch(`/tickets/${id}`)
    if (result.ok) {
      setTicket(result.data.ticket)
    } else {
      setError(result.data.error)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)

    const result = await api.fetchMultipart(`/tickets/${id}/attachments`, formData)

    if (result.ok) {
      setFile(null)
      loadTicket()
    } else {
      setError(result.data.error)
    }
    setUploading(false)
  }

  if (!ticket) return <div>{error || 'Loading...'}</div>

  return (
    <div className="ticket-detail">
      <h2>{ticket.title}</h2>
      <div className="meta">
        By {ticket.owner_name} | Visibility: {ticket.visibility}
      </div>
      <div className="description">{ticket.description}</div>

      {ticket.attachments && ticket.attachments.length > 0 && (
        <div className="attachments">
          <h3>Attachments</h3>
          {ticket.attachments.map(att => (
            <div key={att.id} className="attachment-item">
              <strong>{att.filename}</strong> ({att.content_type})
              {att.thumbnail_path && (
                <div>
                  <img
                    src={att.thumbnail_path}
                    alt="thumbnail"
                    style={{maxWidth: '300px', marginTop: '0.5rem'}}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {(ticket.owner_id === user.id || user.role === 'admin') && (
        <div className="attachments">
          <h3>Upload Attachment</h3>
          <form onSubmit={handleUpload}>
            <div className="form-group">
              <input
                type="file"
                accept="application/pdf,image/png,image/jpeg"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
            <button type="submit" disabled={!file || uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
          {error && <div className="error">{error}</div>}
        </div>
      )}
    </div>
  )
}

export default App
