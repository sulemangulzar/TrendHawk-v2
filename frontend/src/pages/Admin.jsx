import { useEffect, useState } from 'react'
import {
  adminGetUsers, adminUpdatePlan, adminUpdateCredits,
  adminToggleAdmin, adminRefreshCache, adminGetStats
} from '../lib/api'
import {
  Shield, RefreshCw, Users, Database, Zap,
  TrendingUp, RefreshCcw, Search, MoreVertical,
  LogOut, ShieldAlert, Key
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useDashboard } from '../context/DashboardContext'

const PLANS = ['free', 'basic', 'pro', 'growth']

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm flex flex-col justify-between group hover:border-[var(--lime-border)] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-[var(--text2)]">{label}</span>
        <div className="p-2 bg-[var(--hover-bg)] rounded-xl text-[var(--text)]">
          {icon}
        </div>
      </div>
      <div>
        <div className="text-[var(--text)] text-3xl font-bold">{value}</div>
        {sub && <p className="text-xs font-medium text-[var(--text3)] mt-2">{sub}</p>}
      </div>
    </div>
  )
}

export default function Admin() {
  const { setGlobalLoading } = useDashboard()
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [cacheRefreshing, setCacheRefreshing] = useState(false)

  const loadAll = () => {
    setLoading(true)
    setRefreshing(true)
    
    Promise.all([
      adminGetUsers().then(r => setUsers(r.users || [])).catch(() => toast.error('Admin restricted')),
      adminGetStats().then(r => setStats(r)).catch(() => {})
    ]).finally(() => { 
      setLoading(false)
      setRefreshing(false)
      
    })
  }

  useEffect(() => { loadAll() }, [])

  const updatePlan = async (id, plan) => {
    await adminUpdatePlan(id, plan)
    toast.success(`Plan upgraded to ${plan}`)
    loadAll()
  }

  const resetCredits = async (id) => {
    await adminUpdateCredits(id, 0)
    toast.success('Units reset successfully')
    loadAll()
  }

  const toggleAdmin = async (id, current) => {
    const action = !current ? 'granted' : 'revoked'
    await adminToggleAdmin(id, !current)
    toast.success(`Admin access ${action}`)
    loadAll()
  }

  const triggerCacheRefresh = async () => {
    setCacheRefreshing(true)
    try {
      const res = await adminRefreshCache()
      if (res.success) {
        toast.success(`Global cache synchronized. Indexed ${res.count} assets.`)
        loadAll()
      } else {
        toast.error(res.error || 'Synchronization failed')
      }
    } catch (e) {
      toast.error('Synchronization override failed')
    } finally {
      setCacheRefreshing(false)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500 font-poppins">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text)]">Admin Console</h1>
          <p className="text-[var(--text2)] mt-1">Universal system governance and tier management.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={triggerCacheRefresh}
            disabled={cacheRefreshing}
            className="px-5 py-2 bg-[var(--text)] text-[var(--bg)] rounded-lg text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 min-w-[140px] justify-center"
          >
            {cacheRefreshing ? <RefreshCcw size={14} className="animate-spin text-[var(--lime)]" /> : <Database size={14} className="text-[var(--lime)]" />}
            {cacheRefreshing ? 'Syncing...' : 'Sync Cache'}
          </button>
          <button
            onClick={loadAll}
            disabled={refreshing}
            className="px-5 py-2 border border-[var(--border)] rounded-lg text-sm font-medium hover:bg-[var(--hover-bg)] text-[var(--text)] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Users size={18} />}
            label="Total Identities"
            value={stats.totalUsers ?? 0}
            sub="Registered accounts deployed"
          />
          <StatCard
            icon={<Zap size={18} />}
            label="Premium Access"
            value={stats.paidUsers ?? 0}
            sub={stats.totalUsers ? `${Math.round((stats.paidUsers / stats.totalUsers) * 100)}% Conversion rate` : 'No analytical data'}
          />
          <StatCard
            icon={<Database size={18} />}
            label="Cached Signals"
            value={stats.cache?.productCount ?? 0}
            sub={stats.cache?.lastRefreshed ? `Updated ${new Date(stats.cache.lastRefreshed).toLocaleDateString()}` : 'Awaiting sync'}
          />
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm flex flex-col justify-between group hover:border-[var(--lime-border)] transition-colors relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <TrendingUp size={80} className="text-[var(--text)]" />
             </div>
             <div className="flex items-center justify-between mb-4 relative z-10">
               <span className="text-sm font-medium text-[var(--text2)]">Tier Architecture</span>
               <div className="p-2 bg-[var(--hover-bg)] rounded-xl text-[var(--text)]">
                 <Shield size={18} />
               </div>
             </div>
             <div className="space-y-2 relative z-10 mt-1">
               {Object.entries(stats.planBreakdown || {}).filter(([, v]) => v > 0).map(([plan, count]) => (
                 <div key={plan} className="flex items-center justify-between">
                   <span className="text-xs font-bold uppercase tracking-widest text-[var(--text3)]">{plan}</span>
                   <span className="text-sm font-bold text-[var(--text)]">{count}</span>
                 </div>
               ))}
               {Object.keys(stats.planBreakdown || {}).length === 0 && (
                 <p className="text-xs font-semibold text-[var(--text3)]">No tier distributions detected.</p>
               )}
             </div>
          </div>
        </div>
      )}

      {/* User Management Table */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg)]/50">
           <h2 className="text-base font-semibold text-[var(--text)]">Identity Directory</h2>
           <span className="px-3 py-1 bg-[var(--hover-bg)] border border-[var(--border)] rounded-full text-xs font-semibold text-[var(--text2)]">{users.length} Total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                {['Operator', 'Subscription Tier', 'Neural Bandwidth', 'Vault Capacity', 'Privileges', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-bold text-[var(--text3)] uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                     <div className="flex flex-col items-center justify-center text-[var(--text3)] gap-4">
                       <RefreshCw className="animate-spin opacity-50" size={24} />
                       <span className="text-xs font-medium uppercase tracking-widest">Querying identity directory...</span>
                     </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                     <p className="text-sm font-semibold text-[var(--text3)]">No operational identities indexed on this server.</p>
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-[var(--hover-bg)] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--bg)] border border-[var(--border2)] flex items-center justify-center text-xs font-bold text-[var(--text)] uppercase shadow-sm shrink-0">
                          {(u.full_name || u.email || '?').slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[var(--text)] truncate max-w-[180px]">{u.full_name || 'Anonymous'}</p>
                          <p className="text-xs text-[var(--text3)] font-medium truncate max-w-[180px] mt-0.5">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.plan || 'free'}
                        onChange={e => updatePlan(u.id, e.target.value)}
                        className="bg-[var(--surface)] hover:bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text)] outline-none focus:border-[var(--lime)] transition-all cursor-pointer shadow-sm w-[110px]"
                      >
                        {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 w-40">
                        <span className="text-sm font-bold text-[var(--text)] w-6">{u.searches_used ?? 0}</span>
                        <div className="h-1.5 flex-1 bg-[var(--bg)] rounded-full overflow-hidden border border-[var(--border)]">
                          <div className="h-full bg-[var(--lime)] rounded-full" style={{ width: `${Math.min((u.searches_used ?? 0) * 5, 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 w-40">
                        <span className="text-sm font-bold text-[var(--text)] w-6">{u.tracked_count ?? 0}</span>
                        <div className="h-1.5 flex-1 bg-[var(--bg)] rounded-full overflow-hidden border border-[var(--border)]">
                          <div className="h-full bg-[var(--text2)] rounded-full" style={{ width: `${Math.min((u.tracked_count ?? 0) * 10, 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {u.is_admin ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--text)] text-[var(--bg)] text-[10px] font-bold uppercase tracking-widest w-max shadow-sm">
                           <Key size={10} className="text-[var(--lime)]" /> Admin
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--hover-bg)] text-[var(--text2)] border border-[var(--border)] text-[10px] font-bold uppercase tracking-widest w-max">
                           User
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <button
                          onClick={() => resetCredits(u.id)}
                          className="px-3 py-1.5 rounded-lg bg-[var(--bg)] hover:bg-[var(--text)] text-[10px] font-bold uppercase tracking-widest text-[var(--text)] hover:text-[var(--bg)] border border-[var(--border)] transition-all shadow-sm"
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => toggleAdmin(u.id, u.is_admin)}
                          title={u.is_admin ? 'Revoke Access' : 'Grant Access'}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all shadow-sm border border-[var(--border)] ${u.is_admin ? 'text-red-500 hover:bg-red-500 hover:text-white border-red-500/20 bg-red-500/10' : 'bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--hover-bg)]'}`}
                        >
                          {u.is_admin ? <ShieldAlert size={14} /> : <Shield size={14} />}
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
