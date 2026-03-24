import { useEffect, useState } from 'react'
import {
  adminGetUsers, adminUpdatePlan, adminUpdateCredits,
  adminToggleAdmin, adminRefreshCache, adminGetStats
} from '../lib/api'
import {
  Shield, RefreshCw, Users, Database, Zap,
  TrendingUp, RefreshCcw, Check, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

const PLANS = ['free', 'basic', 'pro', 'growth']

const PLAN_COLORS = {
  free: 'bg-muted text-muted-foreground border-border',
  basic: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  pro: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  growth: 'bg-primary/10 text-primary border-primary/30',
  admin: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
}

export default function Admin() {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [cacheRefreshing, setCacheRefreshing] = useState(false)

  const loadAll = () => {
    setLoading(true)
    setRefreshing(true)
    Promise.all([
      adminGetUsers().then(r => setUsers(r.users || [])).catch(() => toast.error('Admin access required')),
      adminGetStats().then(r => setStats(r)).catch(() => {})
    ]).finally(() => { setLoading(false); setRefreshing(false) })
  }

  useEffect(() => { loadAll() }, [])

  const updatePlan = async (id, plan) => {
    await adminUpdatePlan(id, plan)
    toast.success(`Plan upgraded to ${plan}`, {
      className: 'bg-card border border-border text-foreground font-poppins text-xs font-black'
    })
    loadAll()
  }

  const resetCredits = async (id) => {
    await adminUpdateCredits(id, 0)
    toast.success('Credits reset', {
      className: 'bg-card border border-border text-foreground font-poppins text-xs font-black'
    })
    loadAll()
  }

  const toggleAdmin = async (id, current) => {
    const action = !current ? 'assigned' : 'removed'
    await adminToggleAdmin(id, !current)
    toast.success(`Admin role ${action}`, {
      className: 'bg-card border border-border text-foreground font-poppins text-xs font-black'
    })
    loadAll()
  }

  const triggerCacheRefresh = async () => {
    setCacheRefreshing(true)
    try {
      const res = await adminRefreshCache()
      if (res.success) {
        toast.success(`Cache synced: ${res.count} items`, {
           className: 'bg-card border border-border text-foreground font-poppins text-xs font-black'
        })
        loadAll()
      } else {
        toast.error(res.error || 'Sync failed')
      }
    } catch (e) {
      toast.error('Sync failed — check logs')
    } finally {
      setCacheRefreshing(false)
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 pb-12 font-poppins text-foreground">

      {/* Header section (Compact SaaS Style) */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-500 text-[8px] font-black tracking-[0.2em] uppercase shadow-sm">
            <Shield size={10} strokeWidth={4} /> Restricted Command Center
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter leading-none">Admin Console</h1>
          <p className="text-muted-foreground text-xs font-medium max-w-2xl leading-relaxed mt-2">
            Universal system governance. Manage user tiers, monitor cache high-water marks, and orchestrate platform synchronization.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={triggerCacheRefresh}
            disabled={cacheRefreshing}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-80 active:scale-95 transition-all disabled:opacity-50 shadow-md shadow-foreground/10"
          >
            <RefreshCcw size={14} className={cacheRefreshing ? 'animate-spin text-primary' : 'text-primary'} strokeWidth={3} />
            {cacheRefreshing ? 'Syncing...' : 'Sync Cache'}
          </button>
          <button
            onClick={loadAll}
            disabled={refreshing}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-card border border-border text-foreground text-[10px] font-black uppercase tracking-[0.2em] hover:bg-muted transition-all shadow-sm active:scale-95"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} strokeWidth={3} />
            Telemetry
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            icon={<Users size={16} strokeWidth={3} />}
            label="COMMAND USERS"
            value={stats.totalUsers ?? 0}
            color="cyan"
          />
          <StatCard
            icon={<Zap size={16} strokeWidth={3} />}
            label="PREMIUM TIER"
            value={stats.paidUsers ?? 0}
            sub={stats.totalUsers ? `${Math.round((stats.paidUsers / stats.totalUsers) * 100)}% Conversion` : ''}
            color="emerald"
          />
          <StatCard
            icon={<TrendingUp size={16} strokeWidth={3} />}
            label="CACHED ASSETS"
            value={stats.cache?.productCount ?? 0}
            sub={stats.cache?.lastRefreshed ? `Updated ${new Date(stats.cache.lastRefreshed).toLocaleDateString()}` : 'No sync data'}
            color="amber"
          />
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] grayscale pointer-events-none">
               <Database size={80} className="text-foreground" />
            </div>
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-4 relative z-10">TIER BREAKDOWN</p>
            <div className="space-y-2 relative z-10">
              {Object.entries(stats.planBreakdown || {}).filter(([, v]) => v > 0).map(([plan, count]) => (
                <div key={plan} className="flex items-center justify-between">
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border shadow-sm ${PLAN_COLORS[plan] || PLAN_COLORS.free}`}>{plan}</span>
                  <span className="text-[11px] font-black text-foreground tabular-nums">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User Management Table */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-6 border-b border-border/50 flex items-center gap-4">
           <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-foreground">
              <Users size={16} strokeWidth={3} />
           </div>
          <div>
            <h2 className="text-sm font-black text-foreground uppercase tracking-tight">User Management</h2>
            <p className="text-[9px] font-black text-muted-foreground uppercase mt-1 tracking-[0.2em]">{users.length} TOTAL REGISTERED IDENTITIES</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                {['Identity', 'Tier', 'Power Units', 'Assets', 'Role', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading && users.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-50">
                    <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin shadow-sm" />
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em]">SYNCHRONIZING USERS...</span>
                  </div>
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-xs font-black text-muted-foreground uppercase tracking-widest italic">No operational identities detected</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-[10px] font-black text-foreground uppercase shadow-sm group-hover:bg-primary group-hover:text-background transition-all">
                          {(u.full_name || u.email || '?').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-xs font-black text-foreground leading-none mb-1 uppercase tracking-tight">{u.full_name || 'Anonymous'}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.plan || 'free'}
                        onChange={e => updatePlan(u.id, e.target.value)}
                        className="bg-muted border border-border rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-foreground outline-none focus:border-[#BEF264] transition-all cursor-pointer shadow-sm"
                      >
                        {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-foreground tabular-nums tracking-tighter">{u.searches_used ?? 0}</span>
                        <div className="w-16 h-1.5 bg-muted border border-border rounded-full overflow-hidden p-px">
                          <div className="h-full bg-[#BEF264] rounded-full shadow-[0_0_8px_rgba(190,242,100,0.4)]" style={{ width: `${Math.min((u.searches_used ?? 0) * 5, 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-foreground tabular-nums tracking-tighter">{u.tracked_count ?? 0}</span>
                        <div className="w-16 h-1.5 bg-muted border border-border rounded-full overflow-hidden p-px">
                          <div className="h-full bg-[#BEF264] rounded-full shadow-[0_0_8px_rgba(190,242,100,0.4)]" style={{ width: `${Math.min((u.tracked_count ?? 0) * 10, 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[8px] font-black border shadow-sm ${u.is_admin ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 'bg-muted text-muted-foreground border-border'}`}>
                        {u.is_admin ? 'ADMIN' : 'USER'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <button
                          onClick={() => resetCredits(u.id)}
                          className="px-3 py-1.5 rounded-lg bg-muted hover:bg-foreground text-[8px] font-black uppercase tracking-widest text-foreground hover:text-background border border-border transition-all shadow-sm"
                        >
                          Reset Units
                        </button>
                        <button
                          onClick={() => toggleAdmin(u.id, u.is_admin)}
                          title={u.is_admin ? 'Revoke Access' : 'Grant Access'}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all shadow-sm ${u.is_admin ? 'bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500 hover:text-white' : 'bg-muted text-muted-foreground border-border hover:text-foreground'}`}
                        >
                          <Shield size={14} strokeWidth={3} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub, color = 'cyan' }) {
  const colorMap = {
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500 shadow-cyan-500/10',
    emerald: 'bg-primary/10 border-primary/30 text-primary shadow-primary/20',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-amber-500/10',
  }
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm group hover:-translate-y-1 transition-transform duration-300">
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-5 shadow-sm transition-all group-hover:scale-110 ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2">{label}</p>
      <p className="text-2xl font-black text-foreground tabular-nums tracking-tighter leading-none mb-2">{value}</p>
      {sub && <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed">{sub}</p>}
    </div>
  )
}
