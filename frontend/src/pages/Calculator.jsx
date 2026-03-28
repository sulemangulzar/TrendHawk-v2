import { useState, useEffect } from 'react'
import {
  Calculator as CalcIcon, DollarSign, Percent, Truck, Target,
  TrendingUp, Save, Trash2, FolderOpen, AlertCircle, Info, RefreshCcw
} from 'lucide-react'
import { getPresets, createPreset, deletePreset, getUsage } from '../lib/api'
import { useDashboard } from '../context/DashboardContext'
import FeatureLock from '../components/FeatureLock'
import toast from 'react-hot-toast'

export default function Calculator() {
  const { setGlobalLoading } = useDashboard()
  const [form, setForm] = useState({ price: '', cogs: '', referral: '15', shipping: '5', ads: '0', other: '0' })
  const [result, setResult] = useState(null)
  const [presets, setPresets] = useState([])
  const [usage, setUsage] = useState({ plan: 'free' })
  const [loadingPresets, setLoadingPresets] = useState(false)

  useEffect(() => {
    
    getUsage().then(setUsage).catch(() => {})
    loadPresets()
    const timer = setTimeout(() => {} , 500)
    return () => {
      clearTimeout(timer)
      
    }
  }, [])

  const loadPresets = () => {
    if (usage.plan === 'free') return
    setLoadingPresets(true)
    getPresets().then(r => setPresets(r.presets || [])).finally(() => setLoadingPresets(false))
  }

  const calculate = (e) => {
    if (e) e.preventDefault()
    const price = parseFloat(form.price) || 0
    const cogs = parseFloat(form.cogs) || 0
    const referralFee = price * (parseFloat(form.referral) / 100)
    const shipping = parseFloat(form.shipping) || 0
    const ads = parseFloat(form.ads) || 0
    const other = parseFloat(form.other) || 0

    const totalFees = referralFee + shipping + ads + other
    const netProfit = price - cogs - totalFees
    const margin = price > 0 ? (netProfit / price) * 100 : 0
    const roi = cogs > 0 ? (netProfit / cogs) * 100 : 0
    const breakEven = cogs + totalFees

    setResult({ price, cogs, referralFee, shipping, ads, other, netProfit, margin, roi, breakEven })
  }

  const saveCurrentAsPreset = async () => {
    const name = prompt("Enter a name for this preset:")
    if (!name) return
    try {
      await createPreset({
        name,
        item_cost: parseFloat(form.cogs) || 0,
        shipping_cost: parseFloat(form.shipping) || 0,
        ad_spend: parseFloat(form.ads) || 0,
        platform_fee_pct: parseFloat(form.referral) || 12.75,
        other_fees: parseFloat(form.other) || 0,
      })
      toast.success('Configuration Archived')
      loadPresets()
    } catch (e) {
      toast.error('Failed to save preset')
    }
  }

  const applyPreset = (p) => {
    setForm({
      ...form,
      cogs: p.item_cost.toString(),
      shipping: p.shipping_cost.toString(),
      referral: p.platform_fee_pct.toString(),
      ads: p.ad_spend.toString(),
      other: p.other_fees.toString(),
    })
    toast.success(`Loaded Archive: ${p.name}`)
  }

  const removePreset = async (id) => {
    if (!confirm('Erase this financial model?')) return
    await deletePreset(id)
    loadPresets()
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-8 pb-12 animate-in fade-in duration-500 font-poppins text-[var(--text)]">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profit Forge</h1>
        <p className="text-[var(--text2)] mt-1">High-fidelity precision modeling for global commerce.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Presets Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <FeatureLock requiredPlan="basic" currentPlan={usage.plan} featureName="Simulation Presets">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm overflow-hidden relative">
               <div className="flex items-center gap-2 mb-6">
                 <FolderOpen size={16} className="text-[var(--lime)]" />
                 <h3 className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-widest">Saved Models</h3>
               </div>

              {loadingPresets ? (
                <div className="py-10 text-center animate-pulse text-[var(--text3)] text-[10px] font-bold uppercase tracking-widest">Syncing...</div>
              ) : presets.length === 0 ? (
                <div className="py-10 text-center px-4 border border-dashed border-[var(--border)] rounded-xl opacity-50">
                  <p className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-wider">Empty Vault</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {presets.map(p => (
                    <div 
                      key={p.id} 
                      className="group flex items-center justify-between p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--lime-border)] transition-all cursor-pointer shadow-sm" 
                      onClick={() => applyPreset(p)}
                    >
                      <span className="text-[11px] font-bold truncate pr-2 tracking-tight">{p.name}</span>
                      <button onClick={(e) => { e.stopPropagation(); removePreset(p.id) }} className="p-1 text-[var(--text3)] hover:text-red-500 transition-all rounded-md">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button 
                onClick={saveCurrentAsPreset}
                className="w-full mt-6 flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--text)] text-[var(--bg)] text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-md"
              >
                <Save size={14} /> Archive Config
              </button>
            </div>
          </FeatureLock>

          <div className="bg-[var(--lime-dim)] border border-[var(--lime-border)] rounded-2xl p-6 shadow-sm">
            <div className="flex gap-4">
              <RefreshCcw size={16} className="text-[var(--text)] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[var(--text2)] leading-relaxed font-medium capitalize italic">
                Include marketing overhead and tiered logistics to isolate valid net margins.
              </p>
            </div>
          </div>
        </div>

        {/* Middle: Input Form */}
        <div className="lg:col-span-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 shadow-sm">
            <h2 className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-widest mb-8">Simulation Parameters</h2>
            <form onSubmit={calculate} className="space-y-6">
              {[
                { key: 'price', label: 'Unit MSRP ($)', placeholder: '29.99', icon: <DollarSign size={14} /> },
                { key: 'cogs', label: 'Acquisition (COGS)', placeholder: '12.00', icon: <Target size={14} /> },
                { key: 'referral', label: 'Platform Fee (%)', placeholder: '15', icon: <Percent size={14} /> },
                { key: 'shipping', label: 'Logistics Payload ($)', placeholder: '5.00', icon: <Truck size={14} /> },
                { key: 'ads', label: 'Marketing CAC ($)', placeholder: '3.00', icon: <DollarSign size={14} /> },
                { key: 'other', label: 'Misc Overhead ($)', placeholder: '0.00', icon: <CalcIcon size={14} /> },
              ].map(({ key, label, placeholder, icon }) => (
                <div key={key} className="space-y-2">
                  <label className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-tight pl-1">{label}</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text3)] group-focus-within:text-[var(--lime)] transition-colors">{icon}</span>
                    <input 
                      className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl h-12 pl-12 pr-4 text-sm font-bold text-[var(--text)] outline-none focus:border-[var(--lime-border)] focus:bg-[var(--surface)] transition-all tabular-nums shadow-inner" 
                      type="number" step="0.01" placeholder={placeholder} value={form[key]} onChange={e => set(key, e.target.value)} 
                    />
                  </div>
                </div>
              ))}
              <button type="submit" className="w-full h-14 mt-4 rounded-xl bg-[var(--lime)] text-[#000000] text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-[var(--lime-dim)] hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3">
                Execute Simulation <TrendingUp size={16} strokeWidth={2.5} />
              </button>
            </form>
          </div>
        </div>

        {/* Right: Results Display */}
        <div className="lg:col-span-5">
          {result ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-2 gap-5">
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm overflow-hidden relative">
                  <div className={`absolute top-0 right-0 w-12 h-12 opacity-10 ${result.netProfit > 0 ? 'text-[var(--lime)]' : 'text-red-500'}`}>
                    <DollarSign size={48} className="translate-x-4 -translate-y-4" />
                  </div>
                  <div className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-widest mb-3">Unit Profit</div>
                  <div className={`text-4xl font-bold tabular-nums tracking-tighter ${result.netProfit > 0 ? 'text-[var(--text)]' : 'text-red-500'}`}>
                    <span className="text-xl mr-1 opacity-20">$</span>{result.netProfit.toFixed(2)}
                  </div>
                </div>
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 opacity-10 text-[var(--lime)]">
                    <Target size={48} className="translate-x-4 -translate-y-4" />
                  </div>
                  <div className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-widest mb-3">ROI Efficiency</div>
                  <div className={`text-4xl font-bold tabular-nums tracking-tighter ${result.roi > 50 ? 'text-[var(--lime)]' : result.roi > 0 ? 'text-orange-500' : 'text-red-500'}`}>
                    {result.roi.toFixed(0)}<span className="text-xl ml-1 opacity-20">%</span>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 shadow-sm">
                <h3 className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-widest mb-8">Fiscal Breakdown</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Market MSRP', value: `$${result.price.toFixed(2)}`, type: 'neutral' },
                    { label: 'Acquisition (COGS)', value: `-$${result.cogs.toFixed(2)}`, type: 'cost' },
                    { label: 'Platform Infrastructure', value: `-$${result.referralFee.toFixed(2)}`, type: 'cost' },
                    { label: 'Logistics Payload', value: `-$${result.shipping.toFixed(2)}`, type: 'cost' },
                    { label: 'Marketing CAC', value: `-$${result.ads.toFixed(2)}`, type: 'cost' },
                    { label: 'Other Overhead', value: `-$${result.other.toFixed(2)}`, type: 'cost' },
                    { label: 'Critical Break-Even', value: `$${result.breakEven.toFixed(2)}`, type: 'neutral', subtext: '0% Margin Threshold' },
                  ].map(({ label, value, type, subtext }) => (
                    <div key={label} className="flex items-center justify-between pb-3 border-b border-[var(--border)] last:border-0 group">
                      <div>
                        <div className="text-[11px] font-bold text-[var(--text2)] uppercase tracking-tight group-hover:text-[var(--text)] transition-colors">{label}</div>
                        {subtext && <div className="text-[9px] text-[var(--text3)] font-medium italic mt-0.5">{subtext}</div>}
                      </div>
                      <div className={`text-sm font-bold tabular-nums ${type === 'cost' ? 'text-red-400' : 'text-[var(--text)]'}`}>
                        {value}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-6 mt-4 border-t-2 border-[var(--lime-border)]">
                    <div className="text-[11px] font-bold text-[var(--text)] uppercase tracking-widest">Operational Margin</div>
                    <div className={`text-3xl font-bold tabular-nums tracking-tighter ${result.margin > 20 ? 'text-[var(--text)]' : 'text-orange-500'}`}>
                      {result.margin.toFixed(1)}<span className="text-xl ml-1 opacity-20">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-2xl h-full min-h-[500px] flex flex-col items-center justify-center p-12 shadow-sm group">
              <div className="w-20 h-20 bg-[var(--bg)] rounded-2xl border border-[var(--border)] flex items-center justify-center mb-10 text-[var(--text3)] group-hover:bg-[var(--lime-dim)] group-hover:text-[var(--text)] transition-all duration-500 shadow-sm shadow-inner">
                <CalcIcon size={40} strokeWidth={1} />
              </div>
              <p className="text-xl font-bold text-[var(--text)] mb-3 text-center">Engine Awaiting Input</p>
              <p className="text-[var(--text3)] text-sm max-w-[280px] text-center italic leading-relaxed">Configure operational variables to initialize numerical simulation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
