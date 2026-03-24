import { useState, useEffect } from 'react'
import {
  Calculator as CalcIcon, DollarSign, Percent, Truck, Target,
  TrendingUp, Save, Trash2, FolderOpen, AlertCircle, Info
} from 'lucide-react'
import { getPresets, createPreset, deletePreset, getUsage } from '../lib/api'
import FeatureLock from '../components/FeatureLock'
import toast from 'react-hot-toast'

export default function Calculator() {
  const [form, setForm] = useState({ price: '', cogs: '', referral: '15', shipping: '5', ads: '0', other: '0' })
  const [result, setResult] = useState(null)
  const [presets, setPresets] = useState([])
  const [usage, setUsage] = useState({ plan: 'free' })
  const [loadingPresets, setLoadingPresets] = useState(false)

  useEffect(() => {
    getUsage().then(setUsage).catch(() => {})
    loadPresets()
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
      toast.success('Configuration Archived', {
        className: 'bg-card border border-border text-foreground font-poppins text-xs font-black'
      })
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
    toast.success(`Loaded Archive: ${p.name}`, {
      className: 'bg-card border border-border text-foreground font-poppins text-xs font-black'
    })
  }

  const removePreset = async (id) => {
    if (!confirm('Erase this financial model?')) return
    await deletePreset(id)
    loadPresets()
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 pb-12 font-poppins text-foreground">
      
      {/* Header section (Compact SaaS Style) */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[8px] font-black tracking-[0.2em] uppercase shadow-sm">
            <CalcIcon size={10} strokeWidth={4} /> Advanced Fiscal Telemetry
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter leading-none">Profit Forge</h1>
          <p className="text-muted-foreground text-xs font-medium max-w-2xl leading-relaxed mt-2">
            High-fidelity precision modeling for global commerce. Quantify your unit economics with mathematical authority.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Presets Sidebar (Compact SaaS Style) */}
        <div className="lg:col-span-3 space-y-6">
          <FeatureLock requiredPlan="basic" currentPlan={usage.plan} featureName="Simulation Presets">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6 px-1">
                <h3 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] flex items-center gap-2">
                  <FolderOpen size={12} strokeWidth={3} className="text-[#BEF264]" /> ARCHIVED MODELS
                </h3>
              </div>

              {loadingPresets ? (
                <div className="py-10 text-center text-muted-foreground text-[9px] font-black uppercase tracking-[0.4em] animate-pulse">SYNCHRONIZING...</div>
              ) : presets.length === 0 ? (
                <div className="py-10 text-center px-4 border-2 border-dashed border-border rounded-2xl">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-relaxed">Vault currently empty.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {presets.map(p => (
                    <div key={p.id} className="group flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border hover:border-primary hover:bg-background transition-all cursor-pointer shadow-sm" onClick={() => applyPreset(p)}>
                      <span className="text-[11px] font-black text-foreground group-hover:text-primary truncate pr-2 uppercase tracking-tighter">{p.name}</span>
                      <button onClick={(e) => { e.stopPropagation(); removePreset(p.id) }} className="p-1.5 text-muted-foreground/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-red-500/10">
                        <Trash2 size={14} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button 
                onClick={saveCurrentAsPreset}
                className="w-full mt-6 flex items-center justify-center gap-2 py-4 rounded-xl bg-muted border border-border text-foreground text-[9px] font-black uppercase tracking-[0.3em] hover:bg-foreground hover:text-background transition-all shadow-sm"
              >
                <Save size={12} strokeWidth={3} /> Archive Config
              </button>
            </div>
          </FeatureLock>

          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 shadow-sm">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-[#BEF264] flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
                <RefreshCcw size={14} className={cacheRefreshing ? 'animate-spin text-[#BEF264]' : 'text-[#BEF264]'} strokeWidth={3} />
              </div>
              <p className="text-[9px] text-muted-foreground leading-relaxed font-black uppercase tracking-wider">
                Include marketing overhead and tiered logistics to isolate valid net margins.
              </p>
            </div>
          </div>
        </div>

        {/* Middle: Input Form */}
        <div className="lg:col-span-4">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] grayscale pointer-events-none">
               <DollarSign size={140} className="text-foreground" />
            </div>
            <h2 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-8 relative z-10">SIMULATION PARAMETERS</h2>
            <form onSubmit={calculate} className="space-y-6 relative z-10">
              {[
                { key: 'price', label: 'Unit MSRP ($)', placeholder: '29.99', icon: <DollarSign size={14} /> },
                { key: 'cogs', label: 'Acquisition (COGS)', placeholder: '12.00', icon: <Target size={14} /> },
                { key: 'referral', label: 'Platform Fee (%)', placeholder: '15', icon: <Percent size={14} /> },
                { key: 'shipping', label: 'Logistics Payload ($)', placeholder: '5.00', icon: <Truck size={14} /> },
                { key: 'ads', label: 'Marketing CAC ($)', placeholder: '3.00', icon: <DollarSign size={14} /> },
                { key: 'other', label: 'Misc Overhead ($)', placeholder: '0.00', icon: <CalcIcon size={14} /> },
              ].map(({ key, label, placeholder, icon }) => (
                <div key={key} className="space-y-2">
                  <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1">{label}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">{icon}</span>
                    <input 
                      className="w-full bg-muted/50 border border-border rounded-xl h-12 pl-12 pr-4 text-xs font-black text-foreground outline-none focus:border-primary focus:bg-background transition-all placeholder:text-muted-foreground/50 tabular-nums shadow-inner" 
                      type="number" 
                      step="0.01" 
                      placeholder={placeholder}
                      value={form[key]} 
                      onChange={e => set(key, e.target.value)} 
                    />
                  </div>
                </div>
              ))}
              <button type="submit" className="w-full h-14 mt-6 rounded-2xl bg-foreground text-background text-[10px] font-black uppercase tracking-[0.3em] shadow-md shadow-foreground/10 hover:opacity-80 active:scale-95 transition-all flex items-center justify-center gap-3">
                Execute Simulation <TrendingUp size={16} strokeWidth={3} className="text-[#BEF264]" />
              </button>
            </form>
          </div>
        </div>

        {/* Right: Results Display */}
        <div className="lg:col-span-5">
          {result ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-10 duration-500">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm relative overflow-hidden">
                  <div className={`absolute inset-0 opacity-[0.08] ${result.netProfit > 0 ? 'bg-primary' : 'bg-red-500'}`} />
                  <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-3 relative z-10">UNIT PROFIT</div>
                  <div className={`text-4xl font-black tabular-nums tracking-tighter relative z-10 ${result.netProfit > 0 ? 'text-foreground' : 'text-red-500'}`}>
                    <span className="text-xl mr-1 opacity-40">$</span>{result.netProfit.toFixed(2)}
                  </div>
                </div>
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary opacity-[0.05]" />
                  <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-3 relative z-10">ROI EFFICIENCY</div>
                  <div className={`text-4xl font-black tabular-nums tracking-tighter relative z-10 ${result.roi > 50 ? 'text-primary' : result.roi > 0 ? 'text-orange-500' : 'text-red-500'}`}>
                    {result.roi.toFixed(0)}<span className="text-xl ml-1 opacity-40">%</span>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-3xl p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] grayscale pointer-events-none">
                   <Target size={120} className="text-foreground" />
                </div>
                <h3 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.5em] mb-8 relative z-10">FISCAL BREAKDOWN</h3>
                <div className="space-y-4 relative z-10">
                  {[
                    { label: 'Market MSRP', value: `$${result.price.toFixed(2)}`, type: 'neutral' },
                    { label: 'Acquisition (COGS)', value: `-$${result.cogs.toFixed(2)}`, type: 'cost' },
                    { label: 'Platform Infrastructure', value: `-$${result.referralFee.toFixed(2)}`, type: 'cost' },
                    { label: 'Logistics Payload', value: `-$${result.shipping.toFixed(2)}`, type: 'cost' },
                    { label: 'Marketing CAC', value: `-$${result.ads.toFixed(2)}`, type: 'cost' },
                    { label: 'Other Overhead', value: `-$${result.other.toFixed(2)}`, type: 'cost' },
                    { label: 'Critical Break-Even', value: `$${result.breakEven.toFixed(2)}`, type: 'neutral', subtext: 'THRESHOLD FOR 0% MARGIN' },
                  ].map(({ label, value, type, subtext }) => (
                    <div key={label} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0 group">
                      <div>
                        <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] group-hover:text-foreground transition-colors">{label}</div>
                        {subtext && <div className="text-[8px] text-muted-foreground font-black tracking-widest mt-1 opacity-60">{subtext}</div>}
                      </div>
                      <div className={`text-[13px] font-black tabular-nums ${type === 'cost' ? 'text-red-400' : 'text-foreground'}`}>
                        {value}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-6 mt-4 border-t-2 border-[#BEF264]/20">
                    <div className="text-[9px] font-black text-foreground uppercase tracking-[0.4em]">Operational Margin</div>
                    <div className={`text-3xl font-black tabular-nums tracking-tighter ${result.margin > 20 ? 'text-foreground' : 'text-orange-500'}`}>
                      {result.margin.toFixed(1)}<span className="text-xl ml-1 opacity-20">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-dashed border-border rounded-3xl h-full min-h-[500px] flex flex-col items-center justify-center p-12 shadow-sm group hover:border-primary transition-colors duration-500">
              <div className="w-20 h-20 bg-muted rounded-2xl border border-border flex items-center justify-center mb-8 text-muted-foreground group-hover:bg-primary group-hover:text-background transition-all duration-500 shadow-sm">
                <CalcIcon size={32} strokeWidth={1.5} />
              </div>
              <p className="text-xl font-black text-foreground mb-3 uppercase tracking-tighter text-center">Engine Awaiting Input</p>
              <p className="text-muted-foreground text-[11px] font-medium max-w-[280px] text-center italic leading-relaxed px-4">Configure operational telemetry variables on the left to initialize mathematical simulation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
