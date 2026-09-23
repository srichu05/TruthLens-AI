import { useState } from 'react'
import { Page, User } from '../App'
import { ShieldIcon, ArrowRightIcon, EyeIcon, EyeOffIcon, LockIcon, CheckIcon } from '../components/Icons'
import { api } from '../services/api'

interface Props {
  mode: 'login' | 'signup'
  navigate: (page: Page) => void
  onLogin: (user: User) => void
}

export default function AuthPage({ mode, navigate, onLogin }: Props) {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [password, setPw]     = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw]   = useState(false)
  const [error, setError]           = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading]       = useState(false)

  const isSignup = mode === 'signup'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    if (isSignup) {
      if (!name.trim())           { setError('Please enter your full name'); return }
      if (!email.includes('@'))   { setError('Enter a valid email address'); return }
      if (password.length < 6)    { setError('Password must be at least 6 characters'); return }
      if (password !== confirm)   { setError('Passwords do not match'); return }
    } else {
      if (!email || !password)    { setError('Please fill in all fields'); return }
    }

    setLoading(true)
    try {
      if (isSignup) {
        const res = await api.signup(name, email, password)
        if (!res.access_token) {
          setSuccessMsg('Account created successfully! Please check your email inbox to confirm your account, then log in.')
          setLoading(false)
          return
        }
        onLogin({ name: res.user.name, email: res.user.email })
      } else {
        const res = await api.login(email, password)
        onLogin({ name: res.user.name, email: res.user.email })
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }

  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Left brand panel */}
      <div
        className="hidden lg:flex flex-col w-1/2 relative overflow-hidden p-14"
        style={{ backgroundColor: '#0F172A' }}
      >
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <button
          onClick={() => navigate('landing')}
          className="relative z-10 flex items-center gap-2.5 mb-auto"
        >
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <ShieldIcon size={18} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg font-display">TruthLens AI</span>
        </button>

        <div className="relative z-10 mt-auto">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-5">Trusted by researchers worldwide</p>
          <h2 className="text-4xl font-bold text-white font-display leading-tight mb-6">
            Stop spreading.<br />Start verifying.
          </h2>
          <p className="text-sm text-white/50 leading-relaxed mb-10 max-w-sm">
            TruthLens uses state-of-the-art NLP models to analyze news credibility in real time — so you always know what to trust.
          </p>

          {/* Mini testimonial */}
          <div className="bg-white/8 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-primary/30 flex items-center justify-center text-white text-xs font-bold">AK</div>
              <div>
                <p className="text-sm font-semibold text-white">Ananya Kumar</p>
                <p className="text-xs text-white/40">Investigative Journalist</p>
              </div>
              <div className="ml-auto flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xs">★</span>
                ))}
              </div>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              "TruthLens has become an essential tool in my workflow. The explainability feature is what sets it apart."
            </p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-10">
            <button onClick={() => navigate('landing')} className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <ShieldIcon size={18} className="text-white" />
              </div>
              <span className="font-bold text-foreground text-lg font-display">TruthLens AI</span>
            </button>
          </div>

          <h1 className="text-2xl font-bold text-foreground font-display mb-1">
            {isSignup ? 'Create Your TruthLens Account' : 'Welcome Back'}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {isSignup ? 'Start detecting misinformation today — free.' : 'Sign in to continue to TruthLens AI'}
          </p>

          <form onSubmit={submit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Full Name</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Riya Sharma"
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Email Address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-semibold text-foreground">Password</label>
                {!isSignup && <button type="button" className="text-xs text-primary hover:underline">Forgot Password?</button>}
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPw(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-border rounded-xl px-4 py-3 pr-12 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
                <button
                  type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                </button>
              </div>
            </div>
            {isSignup && (
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Confirm Password</label>
                <div className="relative">
                  <input
                    type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                  {confirm && password === confirm && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <CheckIcon size={15} className="text-real" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {successMsg && (
              <div className="flex items-start gap-2 bg-real-bg border border-real-border text-real px-3 py-2.5 rounded-xl text-xs">
                <span className="flex-shrink-0 mt-px">✓</span> {successMsg}
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 bg-fake-bg border border-fake-border text-fake px-3 py-2.5 rounded-xl text-xs">
                <span className="flex-shrink-0 mt-px">⚠</span> {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-primary text-white py-3.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
            >
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</>
                : <>{isSignup ? 'Create Account' : 'Login'} <ArrowRightIcon size={15} /></>
              }
            </button>
          </form>

          {isSignup && (
            <p className="text-xs text-center text-muted-foreground mt-4">
              By creating an account you agree to our{' '}
              <button className="text-primary hover:underline">Terms</button> and{' '}
              <button className="text-primary hover:underline">Privacy Policy</button>.
            </p>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => navigate(isSignup ? 'login' : 'signup')}
              className="text-primary font-semibold hover:underline"
            >
              {isSignup ? 'Login' : 'Sign Up'}
            </button>
          </p>

          {/* Security note */}
          <div className="flex items-center gap-2 justify-center mt-8">
            <LockIcon size={13} className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground">256-bit encrypted · No data sold</p>
          </div>
        </div>
      </div>
    </div>
  )
}
