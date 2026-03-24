import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Zap, ArrowRight, Loader2, UserPlus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const { login }             = useAuth()
  const navigate              = useNavigate()

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      login(data.token, data.user)
      toast.success('Account created! Let\'s upload your resume.')
      navigate('/upload')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const strength = pw => {
    if (!pw) return 0
    let s = 0
    if (pw.length >= 6)  s++
    if (pw.length >= 10) s++
    if (/[A-Z]/.test(pw)) s++
    if (/[0-9]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    return s
  }

  const pw       = form.password
  const pwStr    = strength(pw)
  const pwColors = ['', 'bg-rose-500', 'bg-amber-500', 'bg-yellow-400', 'bg-brand-400', 'bg-emerald-400']
  const pwLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent']

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent-500/4 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-2xl font-display font-semibold text-white">ResumeAI</span>
          </div>
          <h1 className="text-3xl font-display font-semibold text-white">Create your account</h1>
          <p className="text-slate-400 mt-2">Start matching with your dream job today</p>
        </div>

        <div className="card p-8">
          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['ATS Scoring', 'Job Matching', 'AI Assistant', 'Skill Analysis'].map(f => (
              <span key={f} className="badge-blue text-xs">{f}</span>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label">Full name</label>
              <input
                name="name" type="text" required
                value={form.name} onChange={handle}
                placeholder="Arjun Sharma"
                className="input"
              />
            </div>

            <div>
              <label className="label">Email address</label>
              <input
                name="email" type="email" required
                value={form.email} onChange={handle}
                placeholder="you@example.com"
                className="input"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  name="password" type={showPw ? 'text' : 'password'} required
                  value={form.password} onChange={handle}
                  placeholder="Min. 6 characters"
                  className="input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength meter */}
              {pw && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${i <= pwStr ? pwColors[pwStr] : 'bg-slate-700'}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">{pwLabels[pwStr]} password</p>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
              {loading ? 'Creating account…' : 'Create free account'}
            </button>
          </form>

          <div className="divider" />
          <p className="text-center text-slate-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
