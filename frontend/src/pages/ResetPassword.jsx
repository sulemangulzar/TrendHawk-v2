import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Target, CheckCircle2, XCircle, Loader2, ShieldCheck, Lock } from 'lucide-react'

/**
 * /reset-password — Handles the recovery flow for password resets.
 * 
 * Flow:
 * 1. User clicks email link -> /reset-password?code=xxx
 * 2. This page exchanges the code for a session.
 * 3. Shows "Set New Password" form.
 * 4. Signs out user after success and redirects to /login.
 */
export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const [status, setStatus] = useState('verifying') // verifying | idle | success | error
  const [message, setMessage] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const initSession = async () => {
      try {
        // 1. Detect code (PKCE) or tokens (Hash)
        const params = new URLSearchParams(location.search)
        const code = params.get('code')
        const hash = new URLSearchParams(location.hash.replace('#', ''))
        const accessToken = hash.get('access_token')

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          setStatus('idle')
        } else if (accessToken) {
          // Tokens are already in memory if hash was used, setSession is implicit in some SDK versions
          // but we can ensure it here
          const refreshToken = hash.get('refresh_token')
          if (refreshToken) {
            await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          }
          setStatus('idle')
        } else {
          // Check if already has a session (though we want to be sure it's fresh)
          const { data: { session } } = await supabase.auth.getSession()
          if (!session) throw new Error('Recovery session could not be established or has expired.')
          setStatus('idle')
        }
      } catch (err) {
        setStatus('error')
        setMessage(err.message)
      }
    }

    initSession()
  }, [location])

  const handleReset = async (e) => {
    e.preventDefault()
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    setMessage('')
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error

      // Important: Sign out for security, forcing them to use the new password at /login
      await supabase.auth.signOut()
      
      setStatus('success')
      setTimeout(() => navigate('/login?reset=true', { replace: true }), 2500)
    } catch (err) {
      setMessage(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background font-inter overflow-hidden">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center">
        {/* Logo Branding */}
        <div className="mb-12 text-center group">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 mx-auto mb-4 transition-transform group-hover:scale-110">
            <Target size={28} className="text-black" strokeWidth={2.5} />
          </div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">TrendHawk Intelligence</p>
        </div>

        {/* Action Card */}
        <div className="w-full bg-card border border-border rounded-[32px] p-8 md:p-12 shadow-2xl relative">
          {status === 'verifying' && (
            <div className="text-center py-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-6" />
              <h1 className="text-xl font-black text-foreground mb-2">Syncing Identity</h1>
              <p className="text-sm text-muted-foreground">Initializing secure recovery protocols...</p>
            </div>
          )}

          {status === 'idle' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 border border-primary/20">
                  <ShieldCheck className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-2xl font-black text-foreground tracking-tight mb-2">Lost Key Recovery</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Establish a new encryption key for your TrendHawk intelligence account.
                </p>
              </div>

              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Secure Password</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      required
                      autoFocus
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-muted border border-border rounded-2xl text-foreground text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                    />
                  </div>
                </div>

                {message && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3">
                    <AlertCircle size={16} className="text-destructive shrink-0 mt-0.5" />
                    <p className="text-[11px] text-destructive leading-normal font-medium">{message}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-primary text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Update Protocol
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} className="text-primary" />
              </div>
              <h1 className="text-2xl font-black text-foreground mb-2 tracking-tight">Access Restored</h1>
              <p className="text-sm text-muted-foreground mb-8">
                Your security key has been updated. Routing back to terminal for sign-in...
              </p>
              <div className="flex gap-1 justify-center">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" style={{ animation: `bounce 0.8s ease-in-out ${i * 0.15}s infinite` }} />
                ))}
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-6">
                <XCircle size={32} className="text-destructive" />
              </div>
              <h1 className="text-xl font-black text-foreground mb-2">Protocol Error</h1>
              <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                {message || 'The recovery link has expired or is invalid. Please request a new "Lost Key" transmission.'}
              </p>
              <button
                onClick={() => navigate('/login', { replace: true })}
                className="w-full py-4 bg-foreground text-background rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all"
              >
                Return to Login
              </button>
            </div>
          )}
        </div>

        <p className="mt-10 text-[10px] text-muted-foreground font-medium uppercase tracking-[0.1em]">
          Secured by Supabase Identity Protocol · Encrypted v2.4
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}

// Simple ArrowRight component if not imported
const ArrowRight = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
)

const AlertCircle = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)
