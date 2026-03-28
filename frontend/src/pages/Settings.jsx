import { useState, useEffect } from 'react'
import { getUser, updateUser } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useDashboard } from '../context/DashboardContext'
import { ThemeToggle } from '../components/ThemeToggle'
import { 
  User, Mail, Shield, Save, 
  CreditCard, Moon, LogOut, 
  ChevronRight, Zap, Info, ArrowRight, Activity, Globe
} from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user, signOut } = useAuth()
  const { usage } = useDashboard()
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    
    getUser()
      .then(r => setForm({ full_name: r.user?.full_name || '' }))
      .catch(() => {})
      .finally(() => {
        const timer = setTimeout(() => {} , 400)
        return () => clearTimeout(timer)
      })
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateUser(form)
      toast.success('Identity Synchronized')
    } catch { 
      toast.error('Update failed') 
    } finally { 
      setLoading(false) 
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500 font-poppins">
      
      {/* Header (Matching Dashboard) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text)]">Settings</h1>
          <p className="text-[var(--text2)] mt-1">Manage your identity, appearance, and institutional access.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard" className="px-5 py-2 border border-[var(--border)] rounded-lg text-sm font-medium hover:bg-[var(--hover-bg)] text-[var(--text)] transition-colors">Overview</Link>
          <button 
            onClick={handleSignOut}
            className="px-5 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-sm font-semibold hover:bg-red-500/20 transition-all whitespace-nowrap flex items-center gap-2"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      {/* Top Stats-Like Grid (Appearance and Quick State) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Appearance Card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm flex flex-col justify-between group hover:border-[var(--lime-border)] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-[var(--text2)]">Interface</span>
            <div className="p-2 bg-[var(--hover-bg)] rounded-xl text-[var(--text)]">
               <Moon size={18} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-[var(--text)] text-3xl font-bold">Theme</div>
            <ThemeToggle />
          </div>
        </div>

        {/* Subscription Tier Card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm flex flex-col justify-between group hover:border-[var(--lime-border)] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-[var(--text2)]">Access Tier</span>
            <div className="p-2 bg-[var(--lime-dim)] rounded-xl text-[var(--text)]">
               <Globe size={18} />
            </div>
          </div>
          <div>
            <div className="text-[var(--text)] text-3xl font-bold uppercase tracking-tight">
              {usage?.plan || 'Starter'}
            </div>
             <p className="text-xs font-medium text-[var(--text3)] flex items-center gap-1.5 mt-2">
               <Activity size={12} className="text-[var(--lime)]" /> Secured Access
             </p>
          </div>
        </div>

        {/* System Version Card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm flex flex-col justify-between group hover:border-[var(--border2)] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-[var(--text2)]">Environment</span>
            <div className="p-2 bg-[var(--hover-bg)] rounded-xl text-[var(--text3)]">
               <Info size={18} />
            </div>
          </div>
          <div>
            <div className="text-[var(--text)] text-3xl font-bold">V2.0.4</div>
            <p className="text-xs font-medium text-[var(--text3)] mt-2">TH Production Server</p>
          </div>
        </div>
      </div>

      {/* Main Content Area (2/3 and 1/3 split) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Identity Form (2/3) */}
        <div className="lg:col-span-2 space-y-4">
           <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-semibold text-[var(--text)]">Identity Architecture</h2>
           </div>
           
           <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-sm p-8">
              <form onSubmit={handleSave} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold text-[var(--text3)] uppercase tracking-widest ml-1">Primary Uplink</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text3)] opacity-50" />
                      <input 
                        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl h-12 pl-12 pr-4 text-sm text-[var(--text3)] cursor-not-allowed" 
                        value={user?.email || ''} 
                        disabled 
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-xs font-bold text-[var(--text3)] uppercase tracking-widest ml-1">Operator Name</label>
                    <div className="relative group/input">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text3)] group-focus-within/input:text-[var(--text)] transition-colors" />
                      <input 
                        className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl h-12 pl-12 pr-4 text-sm text-[var(--text)] outline-none focus:border-[var(--lime)] transition-all shadow-sm" 
                        placeholder="Enter full name" 
                        value={form.full_name}
                        onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-[var(--border)] flex justify-end">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="px-8 h-12 bg-[var(--text)] text-[var(--bg)] rounded-xl text-sm font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Save size={18} />
                    {loading ? 'Synchronizing...' : 'Commit Changes'}
                  </button>
                </div>
              </form>
           </div>
        </div>

        {/* Right Column: Billing Quick Tool (1/3) */}
        <div className="space-y-4">
           <h2 className="text-lg font-semibold text-[var(--text)] px-1">Subscription</h2>
           
           <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm flex flex-col group hover:border-[var(--lime-border)] transition-colors">
              <div className="flex items-center justify-between mb-6">
                 <div className="p-2 bg-[var(--lime-dim)] text-[var(--text)] rounded-lg"><CreditCard size={18} /></div>
                 <span className="px-2.5 py-1 rounded-md bg-[var(--lime)] text-[#0D0D0C] text-[10px] font-black uppercase tracking-tight">Active Plan</span>
              </div>
              
              <div className="mb-6">
                 <div className="text-[var(--text3)] text-[10px] uppercase font-black tracking-widest mb-1">Current Tier</div>
                 <div className="text-[var(--text)] text-2xl font-bold tracking-tight capitalize">{usage?.plan || 'Starter'}</div>
              </div>

              {usage && !usage.isAdmin && (
                <div className="mb-8 space-y-2">
                   <div className="flex items-center justify-between text-[10px] font-black uppercase text-[var(--text3)] tracking-widest">
                      <span>Neural Usage</span>
                      <span>{usage.used} / {usage.limit}</span>
                   </div>
                   <div className="h-1.5 w-full bg-[var(--bg)] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[var(--lime)] rounded-full transition-all duration-1000 shadow-[0_0_8px_var(--lime-border)]"
                        style={{ width: `${Math.min(100, (usage.used / usage.limit) * 100)}%` }}
                      />
                   </div>
                </div>
              )}

              <Link to="/dashboard/billing" className="inline-flex items-center justify-center gap-2 w-full bg-[var(--text)] text-[var(--bg)] text-xs font-bold py-3 rounded-xl hover:opacity-90 transition-all shadow-sm">
                Manage Billing <ArrowRight size={14} />
              </Link>
           </div>

           <div className="p-6 bg-gradient-to-br from-[var(--surface)] to-[var(--bg)] border border-[var(--border)] rounded-xl shadow-sm italic">
              <p className="text-[10px] text-[var(--text2)] leading-relaxed font-medium">
                Need specialized institutional access or a higher neural unit limit? Contact our core intelligence support team.
              </p>
           </div>
        </div>

      </div>

    </div>
  )
}
