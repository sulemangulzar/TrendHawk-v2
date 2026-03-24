import { useState, useEffect } from 'react'
import { getUser, updateUser } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { User, Mail, Shield, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user } = useAuth()
  const [form, setForm] = useState({ full_name: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getUser().then(r => setForm({ full_name: r.user?.full_name || '' })).catch(() => {})
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateUser(form)
      toast.success('Identity Synchronized', {
        className: 'bg-card border border-border text-foreground font-poppins text-xs font-black'
      })
    } catch { toast.error('Synchronization failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 pb-12 font-poppins text-foreground">
      
      {/* Header section (Compact SaaS Style) */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-foreground text-[8px] font-black tracking-[0.2em] uppercase shadow-sm">
            <Shield size={10} strokeWidth={4} /> <span className="text-foreground">Restricted Identity Access</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter leading-none">Settings</h1>
          <p className="text-muted-foreground text-xs font-medium max-w-2xl leading-relaxed mt-2">
            Manage your high-security institutional credentials and administrative preferences.
          </p>
        </div>
      </div>

      <div className="max-w-3xl">
        <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] grayscale pointer-events-none transition-opacity group-hover:opacity-[0.05]">
            <User size={140} className="text-foreground" />
          </div>
          
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border/50">
              <User size={20} strokeWidth={2.5} className="group-hover:text-[#BEF264] transition-colors" />
            <div>
              <h2 className="text-lg font-black text-foreground tracking-tight uppercase">Profile Architecture</h2>
              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.3em] mt-1 leading-none">GLOBAL ID: {user?.id?.slice(0, 16).toUpperCase()}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1">Primary Uplink (Email)</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" strokeWidth={2.5} />
                  <input 
                    className="w-full bg-muted border border-border rounded-xl h-12 pl-12 pr-4 text-xs font-black text-muted-foreground cursor-not-allowed opacity-60 shadow-inner" 
                    value={user?.email || ''} 
                    disabled 
                  />
                </div>
                <div className="flex items-center gap-1.5 pl-1 text-[8px] font-black text-muted-foreground uppercase tracking-[0.1em] italic">
                  <Shield size={10} strokeWidth={3} className="text-[#BEF264]" /> Identity secured by external authority
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1">Full Operator Name</label>
                <div className="relative group/input">
                  <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/input:text-primary transition-colors" strokeWidth={2.5} />
                  <input 
                    className="w-full bg-muted/50 border border-border rounded-xl h-12 pl-12 pr-4 text-xs font-black text-foreground outline-none focus:border-primary focus:bg-background transition-all placeholder:text-muted-foreground/50 shadow-inner" 
                    placeholder="Enter operator name" 
                    value={form.full_name}
                    onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} 
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border/50 flex justify-end">
              <button 
                type="submit" 
                className="h-12 px-8 rounded-xl bg-foreground text-background text-[10px] font-black uppercase tracking-[0.2em] shadow-md shadow-foreground/10 hover:opacity-80 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 sm:w-auto w-full" 
                disabled={loading}
              >
                {loading ? 'Synchronizing...' : (
                  <>
                    Commit Changes <Save size={14} strokeWidth={2.5} className="text-primary-foreground" /> 
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
