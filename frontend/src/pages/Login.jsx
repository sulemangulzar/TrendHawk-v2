import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { 
  AlertCircle, Mail, Lock, User, Target, Eye, EyeOff, 
  ArrowRight, ShieldCheck, Zap 
} from 'lucide-react'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode]     = useState('login')
  const [form, setForm]     = useState({ email: '', password: '', name: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState(null)
  const [showPw, setShowPw] = useState(false)

  const changeMode = (m) => { 
    setMode(m)
    setError(null)
    setForm({ email: '', password: '', name: '' }) 
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      let result = mode === 'login'
        ? await signIn(form.email, form.password)
        : await signUp(form.email, form.password, form.name)

      if (result.error) {
        setError(result.error.message)
      } else {
        if (mode === 'signup') {
          toast.success('Confirmation email sent!')
          changeMode('login')
        } else {
          navigate('/dashboard')
        }
      }
    } catch {
      setError('Connection failure. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex selection:bg-primary/30 relative overflow-hidden font-inter bg-background">
      
      {/* Left Pane (Marketing) */}
      <div className="hidden lg:flex w-1/2 bg-[#09090b] relative flex-col justify-between p-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] translate-x-1/3 -translate-y-1/4 rounded-full pointer-events-none" />
        
        {/* Branding */}
        <Link to="/" className="flex items-center gap-4 group w-max">
           <div className="w-12 h-12 rounded-[16px] bg-[#CCFF00] flex items-center justify-center shadow-lg shadow-[#CCFF00]/20 group-hover:rotate-12 transition-all">
             <Target className="w-6 h-6 text-[#111827]" strokeWidth={3} />
           </div>
           <span className="text-2xl font-black tracking-tighter text-white">Trend<span className="text-zinc-500">Hawk</span></span>
        </Link>
        
        <div className="relative z-10 max-w-lg mb-10">
           <h2 className="text-4xl lg:text-5xl font-black tracking-tighter leading-[1.05] mb-6 text-white">
             Scale your store <br/>
             <span className="text-primary italic">with data.</span>
           </h2>
           <p className="text-lg text-zinc-400 font-medium leading-relaxed">
             Join elite dropshippers who use our neural infrastructure to identify breakout market signals before they hit saturation.
           </p>
           
           <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                 {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-[#09090b] bg-zinc-800" />)}
                 <div className="w-10 h-10 rounded-full border-2 border-[#09090b] bg-primary flex items-center justify-center text-[#111827] text-[9px] font-black">+1k</div>
              </div>
              <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] leading-tight">
                 Active<br/>Traders
              </div>
           </div>
        </div>
      </div>

      {/* Right Pane (Form) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 relative bg-background">
        
        {/* Background Orbs for Mobile */}
        <div className="lg:hidden absolute top-0 left-1/2 -translate-x-1/2 w-screen h-screen pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
        </div>

        <div className="w-full max-w-[380px] relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
          
          {/* Mobile Branding */}
          <div className="flex lg:hidden flex-col items-center mb-10 space-y-4">
            <Link to="/" className="w-12 h-12 rounded-[16px] bg-[#CCFF00] flex items-center justify-center shadow-lg shadow-[#CCFF00]/20 hover:rotate-12 transition-all">
              <Target className="w-6 h-6 text-[#111827]" strokeWidth={3} />
            </Link>
            <div className="text-center">
              <h1 className="text-2xl font-black tracking-tighter text-foreground">Trend<span className="text-muted-foreground/40">Hawk</span></h1>
              <p className="text-muted-foreground font-black uppercase tracking-[0.4em] text-[8px] mt-2">Secure Gateway</p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-card border border-border rounded-[2rem] p-8 sm:p-10 shadow-2xl shadow-black/5 overflow-hidden relative">
             
             {/* Top Progress bar */}
             {loading && (
               <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20 overflow-hidden">
                  <div className="h-full bg-primary w-1/2 animate-[progress_1.5s_infinite_linear]" />
               </div>
             )}

             <div className="mb-10 text-center space-y-2">
                <h2 className="text-2xl font-black text-foreground tracking-tight">
                  {mode === 'login' ? 'Welcome Back.' : 'Join the Elite.'}
                </h2>
                <p className="text-muted-foreground text-sm font-medium">
                  {mode === 'login' 
                    ? 'Access your intelligence dashboard.' 
                    : 'Start your TrendHawk OS trial.'}
                </p>
             </div>

             {error && (
               <div className="mb-6 flex gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl animate-in shake duration-300">
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <div className="text-xs font-black text-destructive leading-tight">{error}</div>
               </div>
             )}

             <form onSubmit={handleSubmit} className="space-y-5">
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Full Identity</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                      <input 
                        type="text"
                        placeholder="Satoshi Nakamoto"
                        required
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full pl-11 pr-4 py-3.5 bg-muted border border-border rounded-xl text-foreground text-[13px] font-medium placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:bg-background transition-all shadow-sm"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Work Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                    <input 
                      type="email"
                      placeholder="name@company.com"
                      required
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full pl-11 pr-4 py-3.5 bg-muted border border-border rounded-xl text-foreground text-[13px] font-medium placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:bg-background transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">Secure Key</label>
                    {mode === 'login' && (
                      <button type="button" className="text-[9px] font-black text-foreground hover:text-primary hover:underline uppercase tracking-widest">Lost Key?</button>
                    )}
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                    <input 
                      type={showPw ? 'text' : 'password'}
                      placeholder="••••••••"
                      required
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      className="w-full pl-11 pr-12 py-3.5 bg-muted border border-border rounded-xl text-foreground text-[13px] font-medium placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:bg-background transition-all shadow-sm"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPw ? <EyeOff size={16} strokeWidth={2.5} /> : <Eye size={16} strokeWidth={2.5} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full mt-2 py-4 bg-primary text-[#111827] rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                >
                  {loading ? 'Processing...' : (mode === 'login' ? 'Secure Sign In' : 'Initialize Access')}
                  {!loading && (
                    <div className="w-5 h-5 rounded-full bg-[#111827] flex items-center justify-center ml-1">
                      <ArrowRight size={10} className="text-primary" strokeWidth={4} />
                    </div>
                  )}
                </button>
             </form>

             <div className="mt-8 pt-8 border-t border-border text-center">
                <p className="text-muted-foreground text-xs font-medium">
                  {mode === 'login' ? "New operative?" : "Already in?"}
                  <button 
                    onClick={() => changeMode(mode === 'login' ? 'signup' : 'login')}
                    className="ml-2 font-black text-foreground hover:bg-primary px-2 py-1 rounded-md transition-all uppercase text-[10px] tracking-widest"
                  >
                    {mode === 'login' ? 'Apply Now' : 'Sign In'}
                  </button>
                </p>
             </div>
          </div>

          {/* Support Indicators */}
          <div className="mt-8 flex items-center justify-center gap-6 opacity-50">
             <div className="flex items-center gap-2 text-[9px] font-black text-foreground uppercase tracking-widest">
                <ShieldCheck size={14} className="text-primary" strokeWidth={3} /> 256-Bit SSL
             </div>
             <div className="flex items-center gap-2 text-[9px] font-black text-foreground uppercase tracking-widest">
                <Zap size={14} fill="currentColor" className="text-primary" strokeWidth={0} /> Intel Link
             </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes progress {
          from { transform: translateX(-100%); }
          to { transform: translateX(200%); }
        }
      `}</style>
    </div>
  )
}
