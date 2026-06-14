import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Palette, Eye, EyeOff } from 'lucide-react'
import { authAPI } from '../utils/api'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', full_name: '', password: '', phone: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const update = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const { data } = await authAPI.register(form)
      setAuth(data.user, data.access_token)
      toast.success(`Welcome to Canvas to Dreams, ${data.user.full_name.split(' ')[0]}! 🎨`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-canvas-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <Palette className="w-7 h-7 text-canvas-700" />
          </div>
          <h1 className="font-display text-3xl font-bold text-ink">Create Account</h1>
          <p className="text-ink-muted mt-1">Join Canvas to Dreams</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Full Name *</label>
              <input type="text" value={form.full_name} onChange={update('full_name')}
                required placeholder="Your full name" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Email *</label>
              <input type="email" value={form.email} onChange={update('email')}
                required placeholder="your@email.com" className="input" autoComplete="email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Phone (optional)</label>
              <input type="tel" value={form.phone} onChange={update('phone')}
                placeholder="10-digit mobile number" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Password *</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={update('password')}
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  className="input pr-10"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <><span className="animate-spin">⏳</span> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-ink-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-canvas-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
