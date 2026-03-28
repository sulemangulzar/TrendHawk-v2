import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Target, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

/**
 * /auth/confirm  — Handles Supabase email confirmation redirects.
 *
 * Supabase email links use two formats:
 *  1. PKCE flow (default):  ?code=xxx
 *  2. Legacy token flow:     #access_token=xxx&refresh_token=xxx&type=signup
 *
 * This page detects both, exchanges the code / sets the session,
 * then redirects to /dashboard (or /login on error).
 */
export default function AuthConfirm() {
  const navigate = useNavigate()
  const location = useLocation()
  const [status, setStatus] = useState('verifying') // verifying | success | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handle = async () => {
      try {
        // ── 1. PKCE code exchange (new Supabase default) ──────────────────
        const params = new URLSearchParams(location.search)
        const code = params.get('code')

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          
          setStatus('success')
          setTimeout(() => navigate('/login?confirmed=true', { replace: true }), 2000)
          return
        }

        // ── 2. Legacy hash fragment (older email links) ────────────────────
        const hash = new URLSearchParams(location.hash.replace('#', ''))
        const accessToken = hash.get('access_token')
        const refreshToken = hash.get('refresh_token')
        const type = hash.get('type')

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (error) throw error

          setStatus('success')
          setTimeout(() => navigate('/login?confirmed=true', { replace: true }), 2000)
          return
        }

        // ── 3. Already logged in ──────────────────────────────────────────
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          navigate('/dashboard', { replace: true })
          return
        }

        // No token found
        throw new Error('Confirmation link is invalid or has expired.')
      } catch (err) {
        setStatus('error')
        setMessage(err.message || 'Verification failed.')
      }
    }

    handle()
  }, [location, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background font-inter">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md w-full">
        {/* Logo */}
        <div className="mb-10">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 mx-auto mb-4" style={{ animation: 'logo-pulse 2.5s ease-in-out infinite' }}>
            <Target size={26} className="text-black" strokeWidth={2.5} />
          </div>
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.25em]">TrendHawk Intelligence</p>
        </div>

        {/* Status Card */}
        <div className="w-full bg-card border border-border rounded-3xl p-10 shadow-2xl shadow-black/5">
          {status === 'verifying' && (
            <>
              <Loader2 size={36} className="mx-auto mb-6 text-primary animate-spin" />
              <h2 className="text-xl font-black text-foreground tracking-tight mb-2">Verifying Identity</h2>
              <p className="text-sm text-muted-foreground">Establishing secure session via neural link...</p>
              <div className="mt-6 h-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-[progress_1.5s_ease-in-out_infinite]" style={{ width: '60%' }} />
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} className="text-primary" strokeWidth={2} />
              </div>
              <h2 className="text-xl font-black text-foreground tracking-tight mb-2">Access Granted</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Email confirmed. Routing you to intelligence headquarters...
              </p>
              <div className="mt-6 flex gap-1 justify-center">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                    style={{ animation: `bounce 0.8s ease-in-out ${i * 0.15}s infinite` }}
                  />
                ))}
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-6">
                <XCircle size={32} className="text-destructive" strokeWidth={2} />
              </div>
              <h2 className="text-xl font-black text-foreground tracking-tight mb-2">Verification Failed</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {message || 'The confirmation link may have expired. Request a new one.'}
              </p>
              <button
                onClick={() => navigate('/login', { replace: true })}
                className="w-full py-3.5 bg-foreground text-background rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all"
              >
                Return to Sign In
              </button>
            </>
          )}
        </div>

        <p className="mt-8 text-[10px] text-muted-foreground font-medium">
          Secured by Supabase Auth · 256-bit encryption
        </p>
      </div>

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        @keyframes logo-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(200,255,0,0.5); }
          50% { box-shadow: 0 0 0 8px rgba(200,255,0,0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}
