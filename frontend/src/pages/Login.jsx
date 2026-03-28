import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { 
  AlertCircle, Mail, Lock, User, Target, Eye, EyeOff, 
  ArrowRight, ShieldCheck, Zap, Globe, BarChart3, Tag, 
  ChevronDown, CheckCircle2
} from 'lucide-react'

const GLOBAL_LOCATIONS = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "United Arab Emirates",
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland",
  "Gabon", "Gambia", "Georgia", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guyana",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "Uruguay", "Uzbekistan",
  "Vanuatu", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe"
]

export default function Login({ mode: initialMode = 'login' }) {
  const { signIn, signUp, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode]       = useState(initialMode)
  const [form, setForm]       = useState({ 
    email: '', password: '', name: '', 
    country: 'United States', experience: 'Beginner', niche: '' 
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [showPw, setShowPw]   = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  
  const query = new URLSearchParams(location.search)
  const urlMode = query.get('mode')

  useEffect(() => {
    if (urlMode === 'signup' || urlMode === 'login') setMode(urlMode)
  }, [urlMode])

  const changeMode = (m) => { 
    setMode(m)
    setError(null)
    setEmailSent(false)
    setForm({ email: '', password: '', name: '', country: 'United States', experience: 'Beginner', niche: '' }) 
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      let result = mode === 'login'
        ? await signIn(form.email, form.password)
        : await signUp(form.email, form.password, form)

      if (result.error) {
        setError(result.error.message)
      } else {
        if (mode === 'signup') setEmailSent(true)
        else navigate('/dashboard')
      }
    } catch {
      setError('Connection failure. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen lg:h-screen flex selection:bg-primary/30 relative lg:overflow-hidden font-inter bg-background">
      
      {/* Left Pane (Marketing Sidebar) */}
      <div className="hidden lg:flex w-1/2 bg-[#09090b] relative flex-col justify-between p-12 overflow-hidden border-r border-border/50">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] translate-x-1/3 -translate-y-1/4 rounded-full pointer-events-none" />
        
        {/* Branding */}
        <Link to="/" className="flex items-center gap-4 group w-max relative z-10 transition-all hover:scale-[1.02]">
           <div className="w-12 h-12 rounded-[16px] bg-[#CCFF00] flex items-center justify-center shadow-lg shadow-[#CCFF00]/20 group-hover:rotate-12 transition-all">
             <Target className="w-6 h-6 text-[#111827]" strokeWidth={3} />
           </div>
           <span className="text-2xl font-black tracking-tighter text-white">Trend<span className="text-zinc-500">Hawk</span></span>
        </Link>
        
        <div className="relative z-10 max-w-lg mb-10">
           <h2 className="text-4xl lg:text-5xl font-black tracking-tighter leading-[1.05] mb-6 text-white">
             Master the Market. <br/>
             <span className="text-primary italic">Scale with Precision.</span>
           </h2>
           <p className="text-lg text-zinc-400 font-medium leading-relaxed max-w-md">
             Access real-time eBay and Etsy analytics to identify winning products before the competition.
           </p>
           
           <div className="mt-12 flex items-center gap-8">
              <div className="flex -space-x-4">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="w-12 h-12 rounded-full border-4 border-[#09090b] bg-zinc-800 overflow-hidden shadow-xl" />
                 ))}
                 <div className="w-12 h-12 rounded-full border-4 border-[#09090b] bg-primary flex items-center justify-center text-[#111827] text-[10px] font-black shadow-xl">5K+</div>
              </div>
              <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] leading-tight">
                 Successful<br/>Sellers
              </div>
           </div>
        </div>

        <div className="relative z-10">
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Enterprise Data Protocol • Encryption Enabled</p>
        </div>
      </div>

      {/* Right Pane (Dynamic Form) */}
      <div className="w-full lg:w-1/2 flex flex-col lg:justify-center p-4 sm:p-10 relative bg-background overflow-y-auto">
        
        {/* Mobile Branding (only visible on small screens) */}
        <div className="lg:hidden w-full flex items-center mb-6 mt-4 pl-2">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-[10px] bg-[#CCFF00] flex items-center justify-center shadow-lg shadow-[#CCFF00]/20 group-hover:rotate-12 transition-all">
              <Target className="w-4 h-4 text-[#111827]" strokeWidth={3} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-foreground">Trend<span className="text-muted-foreground">Hawk</span></span>
          </Link>
        </div>

        <div className="w-full max-w-[640px] mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {emailSent ? (
            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-2 animate-bounce">
                <Mail size={28} className="text-primary" strokeWidth={2} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-foreground tracking-tight">Email Verified</h2>
                <p className="text-xs text-muted-foreground font-medium">Clearance required. Check the inbox for:</p>
                <div className="text-xs font-black text-foreground bg-muted px-4 py-2 rounded-xl inline-block mt-2 border border-border">{form.email}</div>
              </div>
              <button
                onClick={() => changeMode('login')}
                className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted rounded-2xl transition-all"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl shadow-black/20 overflow-hidden relative">
               
               {loading && (
                 <div className="absolute top-0 left-0 right-0 h-1 bg-primary/10 overflow-hidden">
                    <div className="h-full bg-primary w-1/2 animate-[progress_1.5s_infinite_linear]" />
                 </div>
               )}

               <div className="mb-8 text-center lg:text-left space-y-2">
                  <h2 className="text-3xl font-black text-foreground tracking-tight">
                    {mode === 'login' ? 'Welcome Back.' : 'Get Started.'}
                  </h2>
                  <p className="text-muted-foreground text-[9px] font-black uppercase tracking-[0.2em]">
                    {mode === 'login' ? 'Authentication Required' : 'Create your professional seller account'}
                  </p>
               </div>

               {error && (
                 <div className="mb-8 flex gap-3 p-5 bg-destructive/10 border border-destructive/20 rounded-2xl animate-in shake duration-300">
                    <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <div className="text-xs font-black text-destructive leading-relaxed uppercase tracking-wider">{error}</div>
                 </div>
               )}

               <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'signup' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Identity */}
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-3">Full Name</label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-all" />
                          <input 
                            type="text" placeholder="John Doe" required value={form.name} 
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            className="w-full pl-12 pr-4 py-3.5 bg-muted/40 border border-border rounded-2xl text-foreground text-[13px] font-bold outline-none focus:border-primary focus:bg-muted transition-all"
                          />
                        </div>
                      </div>

                      {/* Location */}
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-3">Country</label>
                        <div className="relative group">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-all" />
                          <select 
                            value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                            className="w-full pl-12 pr-4 py-3 bg-muted/40 border border-border rounded-2xl text-foreground text-[13px] font-bold outline-none focus:border-primary focus:bg-muted transition-all shadow-sm"
                          >
                            {GLOBAL_LOCATIONS.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                      </div>

                      {/* Experience */}
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-3">Selling Experience</label>
                        <div className="relative group">
                          <BarChart3 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-all" />
                          <select 
                            value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))}
                            className="w-full pl-12 pr-4 py-3 bg-muted/40 border border-border rounded-2xl text-foreground text-[13px] font-bold outline-none focus:border-primary focus:bg-muted transition-all shadow-sm"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Elite">Professional / Elite</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                      </div>

                      {/* Niche */}
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-3">Target Niсhe</label>
                        <div className="relative group">
                          <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-all" />
                          <input 
                            type="text" placeholder="e.g. Home Decor" required value={form.niche}
                            onChange={e => setForm(f => ({ ...f, niche: e.target.value }))}
                            className="w-full pl-12 pr-4 py-3.5 bg-muted/40 border border-border rounded-2xl text-foreground text-[13px] font-bold outline-none focus:border-primary focus:bg-muted transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Standard Credentials */}
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-3">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                        <input 
                          type="email" placeholder="name@email.com" required value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          className="w-full pl-12 pr-4 py-3.5 bg-muted/40 border border-border rounded-2xl text-foreground text-[13px] font-bold outline-none focus:border-primary focus:bg-muted transition-all shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between ml-3">
                        <label className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">Password</label>
                        {mode === 'login' && (
                          <button type="button" className="text-[8px] font-black text-foreground hover:text-primary uppercase tracking-widest transition-all">Forgot Password?</button>
                        )}
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                        <input 
                          type={showPw ? 'text' : 'password'} placeholder="••••••••" required value={form.password}
                          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                          className="w-full pl-12 pr-12 py-3.5 bg-muted/40 border border-border rounded-2xl text-foreground text-[13px] font-bold outline-none focus:border-primary focus:bg-muted transition-all shadow-sm"
                        />
                        <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all">
                          {showPw ? <EyeOff size={16} strokeWidth={2.5} /> : <Eye size={16} strokeWidth={2.5} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-4 bg-[#CCFF00] text-[#111827] rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#CCFF00]/10 hover:shadow-[#CCFF00]/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                  >
                    {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                    {!loading && (
                      <div className="w-5 h-5 rounded-full bg-[#111827] flex items-center justify-center">
                        <ArrowRight size={10} className="text-[#CCFF00]" strokeWidth={4} />
                      </div>
                    )}
                  </button>
               </form>

               <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
                  <p className="text-muted-foreground text-[9px] font-black uppercase tracking-[0.15em]">
                    {mode === 'login' ? "New operative?" : "Already Have account?"}
                  </p>
                  <button 
                    onClick={() => changeMode(mode === 'login' ? 'signup' : 'login')}
                    className="px-5 py-2 bg-muted hover:bg-foreground hover:text-background text-foreground text-[8px] font-black uppercase tracking-[0.15em] rounded-full transition-all"
                  >
                    {mode === 'login' ? 'Sign Up' : 'Log In'}
                  </button>
               </div>
            </div>
          )}

          {/* Neural Protocol Indicators */}
          <div className="mt-12 flex items-center justify-center gap-10 opacity-30 grayscale hover:opacity-50 hover:grayscale-0 transition-all duration-700">
             <div className="flex items-center gap-2 text-[9px] font-black text-foreground uppercase tracking-widest">
                <ShieldCheck size={16} className="text-primary" strokeWidth={3} /> AES-256 Link
             </div>
             <div className="hidden sm:flex items-center gap-2 text-[9px] font-black text-foreground uppercase tracking-widest">
                <Zap size={16} fill="currentColor" className="text-primary" strokeWidth={0} /> Low Latency
             </div>
             <div className="flex items-center gap-2 text-[9px] font-black text-foreground uppercase tracking-widest">
                <CheckCircle2 size={16} className="text-primary" strokeWidth={3} /> Neural Verified
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
