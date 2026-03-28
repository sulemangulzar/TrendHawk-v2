import { useEffect, useState } from 'react'
import { getAlerts, deleteAlert } from '../lib/api'
import { useDashboard } from '../context/DashboardContext'
import { Bell, Trash2, Package, Shield, Zap, TrendingDown, Target, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

let alertsCache = null;

export default function Alerts() {
  const {  } = useDashboard()
  const [alerts, setAlerts] = useState(alertsCache || [])
  const [loading, setLoading] = useState(!alertsCache)

  const load = () => {
    if (!alertsCache) setLoading(true)
    
    getAlerts().then(r => {
      alertsCache = r.alerts || [];
      setAlerts(alertsCache);
    }).finally(() => {
      setLoading(false)
      
    })
  }
  
  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this monitoring trigger?')) return
    await deleteAlert(id).catch(() => {})
    toast.success('Signal Deactivated')
    load()
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-8 pb-12 animate-in fade-in duration-500 font-poppins text-[var(--text)]">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Market Triggers</h1>
        <p className="text-[var(--text2)] mt-1">Autonomous price monitoring and inventory shift detectors.</p>
      </div>

      {loading ? (
        <div className="py-32 text-center flex flex-col items-center justify-center">
          <RefreshCw size={32} className="animate-spin text-[var(--text3)] opacity-20 mb-4" />
          <span className="text-xs font-bold tracking-widest text-[var(--text3)] uppercase">Syncing Uplinks...</span>
        </div>
      ) : alerts.length === 0 ? (
        <div className="py-32 text-center bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-2xl">
          <Bell size={48} className="mx-auto text-[var(--text3)] opacity-20 mb-6" />
          <h3 className="text-lg font-bold text-[var(--text)] mb-2">No Active Signals</h3>
          <p className="text-[var(--text3)] max-w-sm mx-auto text-sm italic">Initialize price triggers on tracked assets to receive immediate intelligence.</p>
        </div>
      ) : (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                  <th className="px-8 py-5 text-[10px] font-bold text-[var(--text3)] uppercase tracking-widest">Active Signal</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-[var(--text3)] uppercase tracking-widest">Target Price</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-[var(--text3)] uppercase tracking-widest">Signal Type</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-[var(--text3)] uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {alerts.map(a => (
                  <tr key={a.id} className="hover:bg-[var(--hover-bg)] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[var(--text3)] group-hover:bg-[var(--lime-dim)] group-hover:text-[var(--text)] transition-all">
                          <Package size={18} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[var(--text)] uppercase tracking-tight">SIG-{a.id.slice(0, 8)}</div>
                          <div className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-tight mt-0.5 opacity-60">ID: {a.product_id.slice(0, 12)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-1 text-sm font-bold text-[var(--text)] tabular-nums">
                        <TrendingDown size={14} className="text-emerald-500 mr-1" />
                        <span className="text-[var(--text3)] text-xs font-medium">$</span>{a.target_price?.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-tight bg-[var(--bg)] border border-[var(--border)]">
                        {a.alert_type === 'price_drop' ? 'Price Reduction' : 'Target Threshold'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${a.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-tight ${a.is_active ? 'text-emerald-600' : 'text-red-500'}`}>
                          {a.is_active ? 'Active' : 'Terminated'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => handleDelete(a.id)} 
                        className="w-8 h-8 flex items-center justify-center text-[var(--text3)] hover:text-red-500 hover:bg-red-50rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Security notice */}
      <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl flex items-center gap-6 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-[var(--lime-dim)] flex items-center justify-center text-[var(--text)] shrink-0">
          <Shield size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h4 className="text-[10px] font-bold text-[var(--text)] uppercase tracking-widest mb-0.5">Tactical Signal Intercept</h4>
          <p className="text-[11px] text-[var(--text3)] leading-relaxed font-bold uppercase tracking-tight opacity-80">Monitoring signals are dispatched via ephemeral proxies to maintain strategic invisibility.</p>
        </div>
      </div>
    </div>
  )
}
