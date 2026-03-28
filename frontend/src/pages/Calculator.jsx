import { useState, useEffect, useCallback } from 'react'
import {
  Calculator as CalcIcon, DollarSign, Percent, Truck, Target,
  TrendingUp, Save, Trash2, FolderOpen, RefreshCcw,
  ShoppingBag, AlertTriangle, CheckCircle, Plus, X, BarChart3,
  Calendar, Layers, Layers2, Sparkles, BookOpen
} from 'lucide-react'
import { getPresets, createPreset, deletePreset, getUsage } from '../lib/api'
import { useDashboard } from '../context/DashboardContext'
import FeatureLock from '../components/FeatureLock'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

function marginColor(pct) {
  if (pct >= 30) return 'text-[var(--lime)]'
  if (pct >= 15) return 'text-amber-500'
  return 'text-red-500'
}

function marginBg(pct) {
  if (pct >= 30) return 'bg-[var(--lime)] text-black'
  if (pct >= 15) return 'bg-amber-500 text-white'
  return 'bg-red-500 text-white'
}

function marginLabel(pct) {
  if (pct >= 30) return 'Healthy'
  if (pct >= 15) return 'Moderate'
  if (pct > 0) return 'Thin'
  return 'No Margin'
}

export default function Calculator() {
  const { setGlobalLoading } = useDashboard()
  const [form, setForm] = useState({ 
    calcName: '',
    price: '', 
    cogs: '', 
    monthly_sales: '50',
    customFields: [
      { id: 'f1', label: 'Platform Fee (%)', value: '12.75', type: 'percent', isLocked: true },
      { id: 'f2', label: 'Shipping Cost ($)', value: '5.00', type: 'fixed', isLocked: false },
      { id: 'f3', label: 'Ad Spend ($)', value: '3.00', type: 'fixed', isLocked: false },
    ]
  })
  
  const [result, setResult] = useState(null)
  const [presets, setPresets] = useState([])
  const [usage, setUsage] = useState({ plan: 'free' })
  const [loadingPresets, setLoadingPresets] = useState(false)

  useEffect(() => {
    getUsage().then(setUsage).catch(() => {})
    loadPresets()
  }, [])

  const calculate = useCallback(() => {
    const price = parseFloat(form.price) || 0
    const cogs = parseFloat(form.cogs) || 0
    if (price === 0) { setResult(null); return }

    let totalFees = 0
    form.customFields.forEach(field => {
      const val = parseFloat(field.value) || 0
      if (field.type === 'percent') {
        totalFees += price * (val / 100)
      } else {
        totalFees += val
      }
    })

    const monthlySales = parseInt(form.monthly_sales) || 50
    const netProfit = price - cogs - totalFees
    const margin = price > 0 ? (netProfit / price) * 100 : 0
    const roi = cogs > 0 ? (netProfit / cogs) * 100 : 0
    const breakEven = cogs + totalFees
    const monthlyProfit = netProfit * monthlySales
    const monthlyRevenue = price * monthlySales

    setResult({ 
      price, cogs, totalFees, netProfit, margin, roi, 
      breakEven, monthlyProfit, monthlyRevenue, monthlySales 
    })
  }, [form])

  useEffect(() => { calculate() }, [calculate])

  const loadPresets = () => {
    setLoadingPresets(true)
    getPresets()
      .then(r => setPresets(r.presets || []))
      .catch(() => {})
      .finally(() => setLoadingPresets(false))
  }

  const saveCalculation = async () => {
    const name = form.calcName || prompt('Enter a name for this intelligence model:')
    if (!name) return
    
    try {
      await createPreset({
        name,
        item_cost: parseFloat(form.cogs) || 0,
        inputs: form.customFields,
        results: result,
        notes: `Simulated for ${form.monthly_sales} units/mo`
      })
      toast.success('Simulation Archived')
      setForm(f => ({ ...f, calcName: name }))
      loadPresets()
    } catch { toast.error('Encryption/Storage failed') }
  }

  const applyPreset = (p) => {
    setForm({
      calcName: p.name,
      price: p.results?.price?.toString() || '',
      cogs: p.item_cost?.toString() || '',
      monthly_sales: p.results?.monthlySales?.toString() || '50',
      customFields: p.inputs || [
        { id: 'f1', label: 'Platform Fee (%)', value: '12.75', type: 'percent' },
        { id: 'f2', label: 'Shipping Cost ($)', value: '5.00', type: 'fixed' },
      ]
    })
    toast.success(`Loaded Model: ${p.name}`)
  }

  const removePreset = async (id) => {
    if (!confirm('Permanently erase this financial model?')) return
    await deletePreset(id)
    loadPresets()
  }

  const addField = () => {
    const id = 'cf_' + Math.random().toString(36).substr(2, 9)
    setForm(f => ({
      ...f,
      customFields: [...f.customFields, { id, label: 'New Expense', value: '0.00', type: 'fixed', isLocked: false }]
    }))
  }

  const removeField = (id) => {
    setForm(f => ({
      ...f,
      customFields: f.customFields.filter(x => x.id !== id)
    }))
  }

  const updateField = (id, key, val) => {
    setForm(f => ({
      ...f,
      customFields: f.customFields.map(x => x.id === id ? { ...x, [key]: val } : x)
    }))
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-8 pb-12 font-poppins text-[var(--text)]">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[var(--lime)] flex items-center justify-center text-black shadow-lg shadow-[var(--lime)]/20">
              <BarChart3 size={20} />
            </div>
            <h1 className="text-3xl font-black tracking-tighter">Profit Forge <span className="text-[var(--lime)]">v3.0</span></h1>
          </div>
          <p className="text-[var(--text2)] text-sm font-medium">Neural-grade financial modeling & profitability simulation.</p>
        </div>
        
        <div className="flex items-center gap-2">
           <input 
             type="text"
             placeholder="Calculation Name..."
             value={form.calcName}
             onChange={e => setForm(f => ({ ...f, calcName: e.target.value }))}
             className="bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs font-bold focus:border-[var(--lime-border)] outline-none min-w-[200px]"
           />
           <button
             onClick={saveCalculation}
             className="flex items-center gap-2 px-6 py-2.5 bg-[var(--lime)] text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-[var(--lime)]/10"
           >
             <Save size={14} /> Archive
           </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left: History Sidebar (Replaced Suppliers) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--lime)]/5 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />
            
            <div className="flex items-center gap-2 mb-6 relative z-10">
              <BookOpen size={14} className="text-[var(--lime)]" />
              <h3 className="text-[10px] font-black text-[var(--text3)] uppercase tracking-widest">Simulation History</h3>
            </div>

            {loadingPresets ? (
                <div className="py-20 text-center space-y-4">
                  <RefreshCcw size={20} className="mx-auto text-[var(--text3)] animate-spin" />
                  <p className="text-[9px] font-black text-[var(--text3)] uppercase tracking-widest">Decrypting Vault...</p>
                </div>
            ) : presets.length === 0 ? (
                <div className="py-16 text-center px-4 border border-dashed border-[var(--border)] rounded-2xl opacity-40">
                  <div className="w-10 h-10 rounded-full bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center mx-auto mb-4">
                    <Layers2 size={16} className="text-[var(--text3)]" />
                  </div>
                  <p className="text-[9px] font-black text-[var(--text3)] uppercase tracking-[0.2em]">No Archived Models</p>
                </div>
            ) : (
                <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {presets.map(p => (
                    <motion.div
                      layout
                      key={p.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group flex flex-col p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--lime-border)] transition-all cursor-pointer relative overflow-hidden"
                      onClick={() => applyPreset(p)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-black truncate text-[var(--text)] tracking-tight">{p.name}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); removePreset(p.id) }}
                          className="w-6 h-6 flex items-center justify-center text-[var(--text3)] hover:text-red-500 hover:bg-red-500/10 transition-all rounded-lg opacity-0 group-hover:opacity-100"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                         <div className="flex flex-col">
                           <span className="text-[8px] font-black text-[var(--text3)] uppercase tracking-widest">Net Profit</span>
                           <span className={`text-xs font-black ${p.results?.netProfit > 10 ? 'text-[var(--lime)]' : 'text-foreground'}`}>
                             ${(p.results?.netProfit || 0).toFixed(2)}
                           </span>
                         </div>
                         <div className="flex flex-col text-right">
                           <span className="text-[8px] font-black text-[var(--text3)] uppercase tracking-widest">Margin</span>
                           <span className="text-xs font-black opacity-60">
                             {(p.results?.margin || 0).toFixed(1)}%
                           </span>
                         </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
            )}
          </div>

          <div className="bg-[#CCFF00]/5 border border-[#CCFF00]/20 rounded-2xl p-6">
             <div className="flex items-center gap-3 mb-4">
               <Sparkles className="text-[#CCFF00]" size={16} />
               <span className="text-[10px] font-black uppercase tracking-widest text-[#CCFF00]">Strategic Insight</span>
             </div>
             <p className="text-[10px] font-bold text-zinc-400 leading-relaxed italic">
                "Precision in price modeling is the difference between surviving a market cycle and dominating it."
             </p>
          </div>
        </div>

        {/* Middle: Custom Input Engine */}
        <div className="lg:col-span-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl relative">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[10px] font-black text-[var(--text3)] uppercase tracking-[0.3em]">Simulation Parameters</h2>
              <button 
                onClick={addField}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--lime-border)] rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
              >
                <Plus size={12} /> Add Item
              </button>
            </div>

            <div className="space-y-6">
              {/* Core Fixed Fields */}
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-[var(--text3)] uppercase tracking-[0.2em] ml-2">Sale Price ($)</label>
                    <div className="relative group">
                       <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text3)] group-focus-within:text-[var(--lime)] transition-colors" />
                       <input 
                         className="w-full h-14 bg-[var(--bg)] border border-[var(--border)] rounded-2xl pl-11 pr-4 text-sm font-black text-[var(--text)] outline-none focus:border-[var(--lime-border)] transition-all shadow-inner"
                         type="number" placeholder="29.99"
                         value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-[var(--text3)] uppercase tracking-[0.2em] ml-2">Supplier Cost (COGS)</label>
                    <div className="relative group">
                       <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text3)] group-focus-within:text-[var(--lime)] transition-colors" />
                       <input 
                         className="w-full h-14 bg-[var(--bg)] border border-[var(--border)] rounded-2xl pl-11 pr-4 text-sm font-black text-[var(--text)] outline-none focus:border-[var(--lime-border)] transition-all shadow-inner"
                         type="number" placeholder="12.00"
                         value={form.cogs} onChange={e => setForm(f => ({ ...f, cogs: e.target.value }))}
                       />
                    </div>
                 </div>
              </div>

              <div className="h-px bg-[var(--border)] w-full opacity-50" />

              {/* Dynamic Custom Fields */}
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {form.customFields.map((field, idx) => (
                    <motion.div 
                      layout
                      key={field.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="group relative bg-[var(--bg)]/30 border border-[var(--border)] rounded-2xl p-4 transition-all hover:bg-[var(--bg)]/50"
                    >
                      <div className="flex items-center justify-between gap-3">
                         <div className="flex-1 space-y-1">
                            {field.isLocked ? (
                               <span className="text-[9px] font-black text-[var(--text3)] uppercase tracking-widest ml-1">{field.label}</span>
                            ) : (
                               <input 
                                 type="text"
                                 value={field.label}
                                 onChange={e => updateField(field.id, 'label', e.target.value)}
                                 className="bg-transparent text-[11px] font-black uppercase text-[var(--text)] outline-none border-b border-transparent focus:border-[var(--lime)] w-full mb-1"
                               />
                            )}
                            <div className="relative">
                               <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text3)]">
                                  {field.type === 'percent' ? <Percent size={12} /> : <DollarSign size={12} />}
                               </div>
                               <input 
                                 type="number"
                                 value={field.value}
                                 onChange={e => updateField(field.id, 'value', e.target.value)}
                                 className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl h-10 pl-9 pr-3 text-[13px] font-black text-[var(--text)] outline-none focus:border-[var(--lime-border)] transition-all"
                               />
                            </div>
                         </div>
                         {!field.isLocked && (
                           <button onClick={() => removeField(field.id)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors">
                              <X size={14} />
                           </button>
                         )}
                         <div className="flex flex-col gap-1">
                            <button 
                              onClick={() => updateField(field.id, 'type', field.type === 'fixed' ? 'percent' : 'fixed')}
                              className={`text-[8px] font-black px-1.5 py-1 rounded border uppercase tracking-widest ${field.type === 'percent' ? 'bg-[var(--lime)] text-black border-transparent' : 'bg-transparent text-zinc-500 border-zinc-800'}`}
                            >
                              {field.type === 'percent' ? '%' : '$'}
                            </button>
                         </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="space-y-2 pt-4">
                 <label className="text-[9px] font-black text-[var(--text3)] uppercase tracking-[0.2em] ml-2">Monthly Sales Intensity</label>
                 <div className="relative group">
                    <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text3)] group-focus-within:text-[var(--lime)] transition-colors" />
                    <input 
                      className="w-full h-12 bg-[var(--bg)] border border-[var(--border)] rounded-2xl pl-11 pr-4 text-sm font-black text-[var(--text)] outline-none focus:border-[var(--lime-border)] transition-all shadow-inner"
                      type="number" placeholder="50"
                      value={form.monthly_sales} onChange={e => setForm(f => ({ ...f, monthly_sales: e.target.value }))}
                    />
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Intelligence Analysis */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="space-y-6"
              >
                {/* Executive KPIs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--lime)]/5 blur-[40px] rounded-full group-hover:bg-[var(--lime)]/10 transition-all duration-700" />
                    <div className="text-[10px] font-black text-[var(--text3)] uppercase tracking-[0.3em] mb-3">Unit Net Profit</div>
                    <motion.div
                      key={result.netProfit}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-5xl font-black tabular-nums tracking-tighter ${result.netProfit > 0 ? 'text-[var(--text)]' : 'text-red-500'}`}
                    >
                      <span className="text-2xl mr-1 opacity-20">$</span>{result.netProfit.toFixed(2)}
                    </motion.div>
                  </div>

                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-[40px] rounded-full group-hover:bg-amber-500/10 transition-all duration-700" />
                    <div className="text-[10px] font-black text-[var(--text3)] uppercase tracking-[0.3em] mb-3">ROI Ratio</div>
                    <motion.div
                      key={result.roi}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-5xl font-black tabular-nums tracking-tighter ${result.roi > 50 ? 'text-[var(--lime)]' : result.roi > 0 ? 'text-amber-500' : 'text-red-500'}`}
                    >
                      {result.roi.toFixed(0)}<span className="text-2xl ml-1 opacity-20">%</span>
                    </motion.div>
                  </div>
                </div>

                {/* Monthly Scalability */}
                <div className="bg-gradient-to-br from-zinc-900 to-[#09090b] border border-[var(--border)] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-5">
                      <TrendingUp size={120} />
                   </div>
                   <div className="relative z-10">
                      <div className="flex items-center justify-between mb-8">
                        <div className="text-[10px] font-black text-[var(--text3)] uppercase tracking-[0.4em]">Monthly Scale Simulation</div>
                        <div className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black uppercase text-white/50">{result.monthlySales} Units</div>
                      </div>
                      <div className="grid grid-cols-2 gap-12">
                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-[var(--text3)] uppercase tracking-widest">Gross Revenue</span>
                          <motion.div className="text-3xl font-black text-white tracking-tighter tabular-nums">${result.monthlyRevenue.toLocaleString()}</motion.div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-[var(--text3)] uppercase tracking-widest">Model Profit</span>
                          <motion.div className={`text-3xl font-black tracking-tighter tabular-nums ${result.monthlyProfit > 0 ? 'text-[#CCFF00]' : 'text-red-500'}`}>
                            ${result.monthlyProfit.toLocaleString()}
                          </motion.div>
                        </div>
                      </div>
                   </div>
                </div>

                {/* Health & Breakdown */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 shadow-xl">
                  <div className="flex items-center justify-between mb-8">
                     <div className="text-[10px] font-black text-[var(--text3)] uppercase tracking-[0.3em]">Margin Health Analysis</div>
                     <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${marginBg(result.margin)}`}>
                        {result.margin >= 15 ? <CheckCircle size={12}/> : <AlertTriangle size={12}/>}
                        {marginLabel(result.margin)}
                     </div>
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                     <motion.span className={`text-6xl font-black tracking-tighter tabular-nums ${marginColor(result.margin)}`}>
                       {result.margin.toFixed(1)}
                     </motion.span>
                     <span className="text-3xl font-black opacity-10">%</span>
                  </div>

                  <div className="h-3 w-full bg-[var(--bg)] rounded-full overflow-hidden mb-8 border border-[var(--border)]">
                    <motion.div
                      className={`h-full rounded-full transition-all duration-700 ${result.margin >= 30 ? 'bg-[var(--lime)] shadow-[0_0_20px_rgba(204,255,0,0.3)]' : result.margin >= 15 ? 'bg-amber-500' : 'bg-red-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(Math.max(result.margin, 0), 100)}%` }}
                    />
                  </div>

                  <div className="space-y-3">
                     {[
                       { label: 'Sale Price', value: `$${result.price.toFixed(2)}`, accent: false },
                       { label: 'Intelligence Target (COGS)', value: `-$${result.cogs.toFixed(2)}`, accent: false },
                       { label: 'Aggregated Logic Fees', value: `-$${result.totalFees.toFixed(2)}`, accent: 'text-red-400' },
                       { label: 'Breakeven Floor', value: `$${result.breakEven.toFixed(2)}`, accent: 'text-[var(--text)] font-black' },
                     ].map(row => (
                       <div key={row.label} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0 opacity-80 hover:opacity-100 transition-opacity">
                          <span className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-tight">{row.label}</span>
                          <span className={`text-[13px] font-black tabular-nums ${row.accent || 'text-[var(--text)]'}`}>{row.value}</span>
                       </div>
                     ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-[3rem] min-h-[600px] flex flex-col items-center justify-center p-12 shadow-inner group"
              >
                <div className="w-24 h-24 bg-[var(--bg)] rounded-3xl border border-[var(--border)] flex items-center justify-center mb-10 text-[var(--text3)] group-hover:bg-[var(--lime-dim)] group-hover:border-[var(--lime-border)] group-hover:text-[var(--lime)] transition-all duration-500 shadow-2xl">
                  <CalcIcon size={48} strokeWidth={1} />
                </div>
                <h3 className="text-2xl font-black text-[var(--text)] mb-3 text-center tracking-tighter">Neural Engine Standby</h3>
                <p className="text-[var(--text3)] text-xs max-w-[320px] text-center font-medium leading-relaxed tracking-wide px-4">
                  Input enterprise-level pricing parameters to initialize real-time numerical simulations and profitability protocols.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--text3); }
        
        @keyframes progress {
          from { transform: translateX(-100%); }
          to { transform: translateX(200%); }
        }
      `}</style>
    </div>
  )
}
