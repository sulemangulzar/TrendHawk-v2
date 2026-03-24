import { useEffect, useState } from 'react'
import { getAlerts, deleteAlert } from '../lib/api'
import { Bell, Trash2, Package, Shield, Zap, TrendingDown, Target } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    getAlerts().then(r => setAlerts(r.alerts || [])).finally(() => setLoading(false))
  }
  
  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this monitoring trigger?')) return
    await deleteAlert(id).catch(() => {})
    toast.success('Signal Deactivated', {
      style: { background: '#111827', color: '#fff', fontSize: '12px', fontWeight: '900', borderRadius: '16px' }
    })
    load()
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20 font-inter text-[#111827]">
      
      {/* Header section (Finto Style) */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#BEF264]/10 border border-[#BEF264]/20 text-[#84CC16] text-[10px] font-black tracking-[0.4em] uppercase shadow-sm">
            <Bell size={12} strokeWidth={4} /> Automated Surveillance Array
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tighter leading-none">Market Triggers</h1>
          <p className="text-zinc-500 text-lg font-medium max-w-2xl leading-relaxed">
            Autonomous price monitoring and inventory shift detectors. Stabilize your market position with real-time signal intercepts.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-44 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 border-4 border-[#F9FAFB] border-t-[#84CC16] rounded-full animate-spin mb-8 shadow-sm" />
          <span className="text-[11px] font-black tracking-[0.5em] text-zinc-200 uppercase">SCANNING UPLINKS...</span>
        </div>
      ) : alerts.length === 0 ? (
        <div className="py-44 text-center bg-white border-2 border-dashed border-[#E5E7EB] rounded-[4rem] group hover:border-[#BEF264] transition-colors duration-500 shadow-sm">
          <div className="w-24 h-24 bg-[#F9FAFB] rounded-[2.5rem] border border-[#E5E7EB] flex items-center justify-center mb-10 mx-auto text-zinc-100 group-hover:bg-[#BEF264] group-hover:text-[#111827] transition-all duration-500 shadow-sm">
            <Bell size={44} strokeWidth={1} />
          </div>
          <h3 className="text-2xl font-black text-[#111827] mb-4 uppercase tracking-tighter text-center">NO ACTIVE SIGNALS</h3>
          <p className="text-zinc-400 text-sm font-medium max-w-sm mx-auto italic leading-relaxed px-6">Initialize price triggers on tracked assets to receive immediate intelligence when the market fluctuates.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-[3.5rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F9FAFB] bg-[#F9FAFB]/50">
                  <th className="px-10 py-8 text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em]">Active Signal</th>
                  <th className="px-10 py-8 text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em]">Trigger Condition</th>
                  <th className="px-10 py-8 text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em]">Signal Type</th>
                  <th className="px-10 py-8 text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em]">Status</th>
                  <th className="px-10 py-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F9FAFB]">
                {alerts.map(a => (
                  <tr key={a.id} className="hover:bg-[#F9FAFB]/50 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center text-zinc-200 group-hover:bg-[#BEF264] group-hover:text-[#111827] transition-all">
                          <Package size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                          <div className="text-[13px] font-black text-[#111827] uppercase tracking-tight">SIG-{a.id.slice(0, 6)}</div>
                          <div className="text-[10px] font-black text-zinc-200 uppercase tracking-widest mt-1">TRK: {a.product_id.slice(0, 10)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-2.5 text-lg font-black text-[#111827] tabular-nums tracking-tighter">
                        <TrendingDown size={18} className="text-emerald-500" strokeWidth={3} />
                        <span className="text-sm text-zinc-300 mr-0.5">$</span>{a.target_price?.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-cyan-50 text-cyan-600 border border-cyan-100 shadow-sm">
                        {a.alert_type === 'price_drop' ? 'Price Reduction' : 'Target Threshold'}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className={`w-2.5 h-2.5 rounded-full shadow-lg ${a.is_active ? 'bg-emerald-500 animate-pulse shadow-emerald-500/20' : 'bg-red-500'}`} />
                        <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${a.is_active ? 'text-emerald-600' : 'text-red-500'}`}>
                          {a.is_active ? 'Monitoring' : 'Terminated'}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button 
                        onClick={() => handleDelete(a.id)} 
                        className="w-10 h-10 flex items-center justify-center text-zinc-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Security notice (Finto Style) */}
      <div className="mt-12 p-8 bg-[#BEF264]/5 border border-[#BEF264]/10 rounded-[2.5rem] flex flex-col sm:flex-row items-center gap-8 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-[#BEF264] flex items-center justify-center text-[#111827] shadow-lg shadow-[#BEF264]/20 shrink-0">
          <Shield size={28} strokeWidth={3} />
        </div>
        <div className="text-center sm:text-left">
          <h4 className="text-xs font-black text-[#111827] uppercase tracking-[0.3em] mb-1.5">Encrypted Pulse Intercept</h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed font-black uppercase tracking-tighter">Monitoring signals are dispatched via ephemeral proxies to maintain absolute tactical invisibility against competitor scrapers.</p>
        </div>
      </div>
    </div>
  )
}
