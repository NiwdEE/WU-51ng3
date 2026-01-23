import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Ticket, Plus, LogOut, User, Lock, Mail, FileText, Upload, Eye, EyeOff } from 'lucide-react'
import { ChristmasDecorations } from '@/components/ChristmasDecorations'

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen christmas-bg">
        <ChristmasDecorations />
        <nav className="christmas-nav relative z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Ticket className="h-6 w-6 text-red-600" />
                <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent">
                  TicketTracker
                </span>
                <span className="text-2xl">🎄</span>
              </div>
              <div className="flex items-center space-x-4">
                {user ? (
                  <>
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <Link to="/tickets">
                      <Button variant="ghost" size="sm">
                        <Ticket className="h-4 w-4 mr-2" />
                        Tickets
                      </Button>
                    </Link>
                    <Link to="/tickets/new">
                      <Button variant="default" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        New Ticket
                      </Button>
                    </Link>
                    {user.id === 1 && (
                      <Link to="/admin">
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          Admin
                        </Button>
                      </Link>
                    )}
                    <Button variant="outline" size="sm" onClick={logout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="ghost" size="sm">Login</Button>
                    </Link>
                    <Link to="/register">
                      <Button variant="default" size="sm">Register</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/tickets" />} />
            <Route path="/register" element={<Register onRegister={checkAuth} />} />
            <Route path="/login" element={<Login onLogin={checkAuth} />} />
            <Route path="/tickets" element={user ? <TicketList user={user} /> : <Navigate to="/login" />} />
            <Route path="/tickets/new" element={user ? <CreateTicket /> : <Navigate to="/login" />} />
            <Route path="/tickets/:id" element={user ? <TicketDetail user={user} /> : <Navigate to="/login" />} />
            <Route path="/admin" element={user ? <AdminPanel user={user} /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

function Register({ onRegister }) {
  const [formData, setFormData] = useState({ email: '', password: '', name: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-md christmas-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an account 🎁</CardTitle>
          <CardDescription className="text-center">
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="success" className="mb-4">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="John Doe"
                  className="pl-10"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

function Login({ onLogin }) {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-md christmas-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome back 🎅</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
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
    <div className="space-y-6 relative z-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">🎄 Tickets 🎄</h2>
          <p className="text-gray-200">Manage and track all your tickets this holiday season</p>
        </div>
        <Link to="/tickets/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Ticket
          </Button>
        </Link>
      </div>

      {tickets.length === 0 ? (
        <Card className="christmas-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Ticket className="h-12 w-12 text-red-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tickets yet 🎅</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first ticket to get started</p>
            <Link to="/tickets/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tickets.map(ticket => (
            <Card
              key={ticket.id}
              className="cursor-pointer hover:shadow-md transition-shadow christmas-card"
              onClick={() => navigate(`/tickets/${ticket.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{ticket.title}</CardTitle>
                    <CardDescription className="mt-2">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {ticket.owner_name}
                        </span>
                        {ticket.attachments_count > 0 && (
                          <span className="flex items-center text-muted-foreground">
                            <FileText className="h-3 w-3 mr-1" />
                            {ticket.attachments_count} attachment{ticket.attachments_count > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function CreateTicket() {
  const [formData, setFormData] = useState({ title: '', description: '' })
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
    <div className="max-w-2xl mx-auto relative z-10">
      <Card className="christmas-card">
        <CardHeader>
          <CardTitle>Create New Ticket 🎁</CardTitle>
          <CardDescription>Fill in the details to create a new support ticket</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Brief description of the issue"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about the issue"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">Create Ticket</Button>
              <Button type="button" variant="outline" onClick={() => navigate('/tickets')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
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

  if (!ticket && !error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative z-10">
      <Card className="christmas-card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{ticket.title}</CardTitle>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {ticket.owner_name}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {ticket.description && (
            <div className="prose max-w-none">
              <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap">
                {ticket.description}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {ticket.attachments && ticket.attachments.length > 0 && (
        <Card className="christmas-card">
          <CardHeader>
            <CardTitle className="text-xl">Attachments 📎</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ticket.attachments.map(att => (
              <div key={att.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{att.filename}</p>
                    <p className="text-sm text-muted-foreground">{att.content_type}</p>
                  </div>
                </div>
                {att.thumbnail_path && (
                  <div className="mt-3">
                    <img
                      src={att.thumbnail_path}
                      alt="thumbnail"
                      className="max-w-md rounded-lg border"
                    />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {(ticket.owner_id === user.id || user.id === 1) && (
        <Card className="christmas-card">
          <CardHeader>
            <CardTitle className="text-xl">Upload Attachment 📤</CardTitle>
            <CardDescription>Add files to this ticket (PDF, PNG, or JPEG only)</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="application/pdf,image/png,image/jpeg"
                  onChange={(e) => setFile(e.target.files[0])}
                  disabled={uploading}
                />
              </div>
              <Button type="submit" disabled={!file || uploading}>
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload File'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function AdminPanel({ user }) {
  const [tickets, setTickets] = useState([])
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('created_at DESC')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (user.id !== 1) {
      navigate('/tickets')
      return
    }
    loadData()
  }, [search, sort])

  const loadData = async () => {
    setLoading(true)
    setError('')

    const ticketsUrl = `/admin/tickets?search=${encodeURIComponent(search)}&sort=${encodeURIComponent(sort)}`
    const ticketsResult = await api.fetch(ticketsUrl)

    if (ticketsResult.ok) {
      setTickets(ticketsResult.data.tickets)
    } else {
      setError(ticketsResult.data.error || 'Failed to load tickets')
    }

    const statsResult = await api.fetch('/admin/stats')
    if (statsResult.ok) {
      setStats(statsResult.data)
    }

    setLoading(false)
  }

  if (loading && !tickets.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading admin panel...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 relative z-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">🎄 Admin Panel 🎄</h2>
          <p className="text-gray-200">Manage all tickets and view statistics</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {stats && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card className="christmas-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
            </CardContent>
          </Card>
          <Card className="christmas-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_tickets}</div>
            </CardContent>
          </Card>
          <Card className="christmas-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Public Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.public_tickets}</div>
            </CardContent>
          </Card>
          <Card className="christmas-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Private Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.private_tickets}</div>
            </CardContent>
          </Card>
          <Card className="christmas-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_attachments}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="christmas-card">
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search tickets by title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-64">
              <Select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="created_at DESC">Newest First</option>
                <option value="created_at ASC">Oldest First</option>
                <option value="title ASC">Title A-Z</option>
                <option value="title DESC">Title Z-A</option>
                <option value="owner_id ASC">Owner ID</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {tickets.length === 0 ? (
        <Card className="christmas-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Ticket className="h-12 w-12 text-red-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search filters</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="christmas-card">
          <CardHeader>
            <CardTitle>All Tickets ({tickets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tickets.map(ticket => (
                <div
                  key={ticket.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{ticket.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {ticket.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {ticket.owner_name} ({ticket.owner_email})
                        </span>
                        <span>ID: {ticket.id}</span>
                        <span>Owner ID: {ticket.owner_id}</span>
                        {ticket.attachments_count > 0 && (
                          <span className="flex items-center">
                            <FileText className="h-3 w-3 mr-1" />
                            {ticket.attachments_count} attachment{ticket.attachments_count > 1 ? 's' : ''}
                          </span>
                        )}
                        <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default App
