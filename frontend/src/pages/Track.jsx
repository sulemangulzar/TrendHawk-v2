import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  scrapeProduct, getTracked, addTracked, deleteTracked,
  getPriceHistory
} from '../lib/api'
import { useDashboard } from '../context/DashboardContext'
import toast from 'react-hot-toast'
import {
  Search, Plus, Trash2, ExternalLink, Package, RefreshCw,
  TrendingUp, Eye, ShoppingCart, Flame, Star, ChevronDown, ChevronUp, Box
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts'
import FeatureLock from '../components/FeatureLock'

function detectPlatform(url) {
  if (!url) return null
  if (url.includes('ebay.com') || url.includes('ebay.')) return 'ebay'
  if (url.includes('etsy.com')) return 'etsy'
  return null
}

function TrendBadge({ score }) {
  const color =
    score >= 70 ? 'bg-primary/10 text-foreground border-primary/20'
    : score >= 45 ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    : 'bg-muted text-muted-foreground border-border'
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black border tracking-widest tabular-nums ${color}`}>
      <TrendingUp size={10} strokeWidth={4} />
      {score ?? 0}
    </span>
  )
}

function TrackedProductCard({ product, onDelete, currentPlan }) {
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const p = product
  const raw = p.raw_data || {}

  const loadHistory = async () => {
    if (!expanded || currentPlan === 'free' || currentPlan === 'basic') return
    setLoadingHistory(true)
    try {
      const res = await getPriceHistory(p.id)
      setHistory(res.history || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => { loadHistory() }, [expanded])

  return (
    <div className="group relative flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md">
      <div className="p-4">
        <div className="flex gap-4 mb-5">
          {p.image ? (
            <div className="w-16 h-16 rounded-xl border border-border overflow-hidden shrink-0 bg-white p-1.5 flex items-center justify-center shadow-sm">
              <img src={p.image} alt={p.title} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center shrink-0 border border-border text-muted-foreground">
              <Package size={20} strokeWidth={1.5} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[13px] font-black text-foreground leading-snug line-clamp-2 transition-colors group-hover:text-primary" title={p.title}>
                {p.title}
              </h3>
              <button 
                onClick={() => onDelete(p.id)} 
                className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
              >
                <Trash2 size={16} strokeWidth={2.5} />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-[0.2em] border border-border bg-muted text-muted-foreground`}>
                {p.platform}
              </span>
              <div className={`w-1.5 h-1.5 rounded-full ${p.platform === 'ebay' ? 'bg-[#BEF264]' : 'bg-secondary'}`} />
              <TrendBadge score={p.trend_score} />
            </div>
          </div>
        </div>

        {/* Demand Signals */}
        {(raw.in_carts > 0 || raw.sold_last_24h > 0 || raw.is_bestseller) && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {raw.in_carts > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[8px] font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20 uppercase tracking-widest shadow-sm">
                <ShoppingCart size={10} strokeWidth={3} /> {raw.in_carts} Carts
              </span>
            )}
            {raw.sold_last_24h > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[8px] font-bold bg-primary/10 text-primary border border-primary/30 uppercase tracking-widest shadow-sm">
                <Flame size={10} strokeWidth={3} /> {raw.sold_last_24h}+ Sold
              </span>
            )}
            {raw.is_bestseller && (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[8px] font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 uppercase tracking-widest shadow-sm">
                <Star size={10} fill="currentColor" strokeWidth={0} /> Bestseller
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3 bg-muted/50 rounded-xl border border-border shadow-sm">
            <div className="text-lg font-black text-foreground tabular-nums tracking-tighter">
              ${p.price ? p.price.toFixed(2) : '—'}
            </div>
            <div className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">Unit Value</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-xl border border-border shadow-sm">
            <div className="text-lg font-black text-foreground tabular-nums tracking-tighter">
              {p.sold_quantity || '—'}
            </div>
            <div className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">Circulation</div>
          </div>
        </div>

        <button 
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-muted hover:bg-background border border-border text-foreground text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-sm group/btn"
        >
          {expanded ? 'Collapse Matrix' : 'Neural History'}
          {expanded ? <ChevronUp size={14} strokeWidth={3} /> : <ChevronDown size={14} strokeWidth={3} className="text-primary group-hover/btn:text-foreground" />}
        </button>
      </div>

      {expanded && (
        <div className="px-5 pb-5 pt-0 animate-in slide-in-from-top-4 duration-500">
          <FeatureLock requiredPlan="pro" currentPlan={currentPlan} featureName="Neural History Sync">
            <div className="h-32 w-full mt-3 bg-muted rounded-xl p-4 border border-border shadow-inner">
              {loadingHistory ? (
                <div className="h-full flex items-center justify-center italic text-muted-foreground text-[9px] uppercase font-black tracking-[0.3em]">Synchronizing...</div>
              ) : history.length < 2 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-[8px] uppercase font-bold tracking-[0.2em] text-center px-4 leading-relaxed">
                  Accumulating telemetry points... <br/> Recheck in <span className="text-primary font-black">24H</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#BEF264" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#BEF264" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="scraped_at" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '9px', fontWeight: '900', color: 'hsl(var(--foreground))', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      itemStyle={{ color: 'hsl(var(--primary))' }}
                      formatter={(val) => [`$${val}`, 'VALUE']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </FeatureLock>
        </div>
      )}
    </div>
  )
}

function AnalysisResult({ data, onSave }) {
  return (
    <div className="bg-card border-2 border-primary rounded-3xl p-6 sm:p-8 mb-10 shadow-[0_10px_30px_-10px_rgba(204,255,0,0.15)] relative overflow-hidden group animate-in zoom-in-95 duration-500">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none">
         <TrendingUp size={120} className="text-foreground" strokeWidth={1} />
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row gap-6 mb-8 items-center md:items-start">
        {data.mainImage && (
          <div className="w-24 h-24 rounded-2xl border border-border overflow-hidden shrink-0 bg-white p-2 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-700">
            <img src={data.mainImage} alt={data.title} className="w-full h-full object-contain" />
          </div>
        )}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
            <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-[0.2em] border border-border bg-muted text-muted-foreground`}>
              {data.platform} Detection
            </span>
            <TrendBadge score={data.trendScore} />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-foreground leading-tight mb-3 tracking-tighter pr-4">{data.title}</h3>
          <div className="text-3xl font-black text-foreground tracking-tighter tabular-nums flex items-center justify-center md:justify-start gap-1">
            <span className="text-primary-foreground bg-primary px-1 rounded-sm text-lg">$</span>{data.price?.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Velocity', value: data.soldQuantity || '—', icon: Zap },
          { label: 'Reviews', value: data.reviewsCount?.toLocaleString() || '—', icon: Star },
          { label: 'Rating', value: data.rating ? `${data.rating}★` : '—', icon: Box },
          { label: 'Cart Intent', value: data.in_carts || '—', icon: ShoppingCart },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="p-4 bg-muted/50 border border-border rounded-2xl shadow-sm hover:bg-card hover:border-primary transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className="text-primary" strokeWidth={3} />
              <div className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                {label}
              </div>
            </div>
            <div className="text-xl font-black text-foreground tabular-nums tracking-tighter">
              {value}
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row gap-3">
        <button onClick={() => onSave(data)} className="h-10 px-6 bg-foreground text-background rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-foreground/10 hover:opacity-80 active:scale-95 transition-all flex items-center justify-center gap-2 flex-1">
          <Plus size={14} strokeWidth={3} className="text-primary" /> Initialize Vault Entry
        </button>
        {data.url && (
          <a href={data.url} target="_blank" rel="noopener noreferrer" className="h-10 px-6 rounded-xl border border-border bg-muted text-foreground text-[10px] font-black uppercase tracking-[0.2em] hover:bg-background hover:border-foreground transition-all inline-flex items-center justify-center gap-2">
            Source <ExternalLink size={14} strokeWidth={2.5} className="text-primary" />
          </a>
        )}
      </div>
    </div>
  )
}

export default function Track() {
  const { usage, refresh } = useDashboard()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [tracked, setTracked] = useState([])
  const [trackedLoading, setTrackedLoading] = useState(true)
  const [statusMsg, setStatusMsg] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const scanTriggered = useRef(false)

  const loadAll = () => {
    setTrackedLoading(true)
    getTracked().then(r => setTracked(r.products || [])).finally(() => setTrackedLoading(false))
  }

  useEffect(() => { 
    loadAll()
    const urlParam = searchParams.get('url')
    if (urlParam && !scanTriggered.current) {
      setUrl(urlParam)
      // Trigger scan after a short delay to ensure component is ready
      setTimeout(() => {
        const form = document.getElementById('scrape-form')
        if (form) form.requestSubmit()
      }, 500)
      scanTriggered.current = true
    }
  }, [searchParams])

  const handleScrape = async (e) => {
    e.preventDefault()
    if (!url.trim()) return
    const platform = detectPlatform(url)
    if (!platform) { toast.error('Please enter an eBay or Etsy product URL'); return }

    setLoading(true); setResult(null)
    const msgs = ['Dialing neural proxies...', 'Establishing link...', 'Parsing metadata...', 'Synthesizing metrics...']
    let i = 0; setStatusMsg(msgs[0])
    const interval = setInterval(() => { i = (i + 1) % msgs.length; setStatusMsg(msgs[i]) }, 2500)

    try {
      const data = await scrapeProduct(url, platform)
      if (data.success) {
        setResult(data.data)
        toast.success('Intelligence gathered!', {
          className: 'bg-card border border-border text-foreground font-poppins text-xs font-black',
          iconTheme: { primary: 'hsl(var(--primary))', secondary: 'hsl(var(--background))' }
        })
      }
    } catch (err) {
      const msg = err.response?.data?.detail
      if (typeof msg === 'object' && msg?.limitReached) {
        toast.error('Search limit reached. Please upgrade.')
      } else {
        toast.error(typeof msg === 'string' ? msg : 'Resource fetch failed')
      }
    } finally {
      setLoading(false); clearInterval(interval); setStatusMsg('')
    }
  }

  const handleSaveTracked = async (productData) => {
    try {
      await addTracked(productData)
      toast.success('Indexed to monitoring vault')
      setResult(null); setUrl('')
      loadAll()
    } catch (err) {
      const msg = err.response?.data?.detail
      toast.error(typeof msg === 'object' && msg?.message ? msg.message : 'Limit reached')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Halt tracking for this asset?')) return
    try {
      await deleteTracked(id)
      toast.success('Asset de-indexed')
      loadAll()
    } catch {
      toast.error('Operation failed')
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 pb-12 font-poppins text-foreground">
      
      {/* Header section (Finto Style) */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-foreground text-[8px] font-black tracking-[0.2em] uppercase">
            <Zap size={10} className="animate-pulse" strokeWidth={3} /> <span className="text-foreground">Neural Extraction Active</span>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tighter leading-none">Market Monitoring</h1>
          <p className="text-muted-foreground text-[11px] font-medium max-w-lg leading-relaxed mt-1">
            Initialize a deep-scan sequence by deploying a product URL. Our intelligence engine will isolate ROI, trend velocity, and marketplace saturation.
          </p>
        </div>
      </div>

      {/* URL input (Compact SaaS Style) */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 mb-8 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
        <form id="scrape-form" onSubmit={handleScrape} className="flex flex-col sm:flex-row gap-2 relative z-10 w-full">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3 pointer-events-none">
              <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center group-focus-within:border-primary transition-all">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BEF264] group-focus-within:text-primary transition-colors">
                  <Search size={16} strokeWidth={3} />
                </span>
              </div>
            </div>
            <input
              className="w-full bg-muted/50 border border-border rounded-xl h-12 pl-14 pr-4 text-xs font-black text-foreground outline-none focus:border-primary focus:bg-background transition-all placeholder:text-muted-foreground shadow-inner" 
              placeholder="PASTE SOURCE ASSET URL..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            className="h-12 px-6 rounded-xl bg-foreground text-background text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-80 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 sm:w-auto w-full" 
            disabled={loading || !url.trim()}
          >
            {loading ? <RefreshCw size={16} className="animate-spin text-primary" /> : <TrendingUp size={16} className="text-primary" strokeWidth={3} />}
            {loading ? 'Booting...' : 'Decrypt'}
          </button>
        </form>

        {loading && (
          <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center text-[#BEF264] shadow-sm">
                   <Zap size={14} strokeWidth={3} />
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-foreground uppercase tracking-tight">Intelligence Quotient</h3>
                  <p className="text-[8px] font-black text-primary uppercase tracking-widest">Optimized Probability</p>
                </div>
              </div>
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">Syncing...</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border p-px">
              <div className="h-full bg-primary rounded-full w-1/2 shadow-[0_0_10px_rgba(204,255,0,0.5)] animate-[shimmer_2s_infinite_linear]" />
            </div>
          </div>
        )}
      </div>

      {/* Result Display */}
      {result && (
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5 px-1">
             <h2 className="text-[10px] font-black text-foreground uppercase tracking-[0.4em] shrink-0">Captured Intelligence Result</h2>
             <div className="h-px bg-border w-full" />
          </div>
          <AnalysisResult data={result} onSave={handleSaveTracked} />
        </div>
      )}

      {/* Monitoring Vault Grid */}
      <div className="pt-6 border-t border-border">
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-3 w-full">
             <h2 className="text-[10px] font-black text-foreground uppercase tracking-[0.4em] shrink-0">Active Monitoring Vault</h2>
             <div className="h-px bg-border w-full" />
             <div className="px-3 py-1 bg-card border border-border rounded-full text-[9px] font-black text-foreground uppercase tracking-widest shadow-sm shrink-0">
               {tracked.length} SECURE DEPLOYMENTS
             </div>
          </div>
        </div>

        {trackedLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 h-[220px] animate-pulse shadow-sm">
                <div className="flex gap-4 mb-5">
                   <div className="w-16 h-16 rounded-xl bg-muted/40 shrink-0" />
                   <div className="flex-1 space-y-2 mt-1">
                      <div className="h-3 bg-muted/50 rounded w-full" />
                      <div className="h-3 bg-muted/50 rounded w-2/3" />
                      <div className="h-5 w-20 bg-muted/30 rounded-full mt-2" />
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="h-14 bg-muted/40 rounded-xl" />
                  <div className="h-14 bg-muted/40 rounded-xl" />
                </div>
                <div className="h-10 bg-muted/20 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : tracked.length === 0 ? (
          <div className="py-20 text-center bg-card border border-dashed border-border rounded-3xl group transition-colors duration-500">
            <div className="w-16 h-16 bg-muted rounded-2xl border border-border flex items-center justify-center mb-6 mx-auto text-muted-foreground group-hover:bg-primary group-hover:text-[#111827] transition-all duration-500">
              <Package size={24} strokeWidth={1.5} />
            </div>
            <p className="text-lg font-black text-foreground mb-2 uppercase tracking-tight">Vault Empty</p>
            <p className="text-muted-foreground text-[11px] font-medium max-w-sm mx-auto">No active telemetry identified in your monitoring array. Begin a deployment to initialize tracking.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {tracked.map(p => (
              <TrackedProductCard 
                key={p.id} 
                product={p} 
                onDelete={handleDelete} 
                currentPlan={usage.plan}
              />
            ))}
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  )
}
