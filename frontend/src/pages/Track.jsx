import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  scrapeProduct, getTracked, addTracked, deleteTracked,
  getPriceHistory
} from '../lib/api'
import { useDashboard } from '../context/DashboardContext'
import toast from 'react-hot-toast'
import {
  Search, Plus, Trash2, ExternalLink, Package, RefreshCw,
  TrendingUp, Star, ChevronDown, ChevronUp, Box, Zap, 
  ArrowRight, Activity, Globe, Info, MousePointer2
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'
import FeatureLock from '../components/FeatureLock'

function detectPlatform(url) {
  if (!url) return null
  if (url.includes('ebay.com') || url.includes('ebay.')) return 'ebay'
  if (url.includes('etsy.com')) return 'etsy'
  return null
}

function TrendBadge({ score }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--lime-dim)] text-[var(--text)] border border-[var(--lime-border)] text-[10px] font-bold tracking-tight">
      <TrendingUp size={10} className="text-[var(--lime)]" />
      {score ?? 0}
    </span>
  )
}

function TrackedProductCard({ product, onDelete, currentPlan }) {
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const p = product

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
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--lime-border)] transition-all duration-300 shadow-sm group">
      <div className="p-5">
        <div className="flex gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl border border-[var(--border)] bg-white p-1.5 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-500">
            {p.image ? (
              <img src={p.image} alt={p.title} className="w-full h-full object-contain" />
            ) : (
              <Package size={20} className="text-[var(--text3)]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-bold text-[var(--text)] line-clamp-1 leading-tight">{p.title}</h3>
              <button 
                onClick={() => onDelete(p.id)} 
                className="p-1.5 text-[var(--text3)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-widest">{p.platform}</span>
              <div className="w-1 h-1 rounded-full bg-[var(--text3)] opacity-30" />
              <TrendBadge score={p.trend_score} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-3">
             <div className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-wider mb-0.5">Value</div>
             <div className="text-lg font-bold text-[var(--text)] tracking-tight">${p.price?.toFixed(2)}</div>
          </div>
          <div className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-3">
             <div className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-wider mb-0.5">Velocity</div>
             <div className="text-lg font-bold text-[var(--text)] tracking-tight">{p.sold_quantity || '0'}</div>
          </div>
        </div>

        <button 
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-[var(--hover-bg)] text-[var(--text2)] text-xs font-bold hover:bg-[var(--border)] transition-all"
        >
          {expanded ? <Info size={12} /> : <TrendingUp size={12} className="text-[var(--lime)]" />}
          {expanded ? 'Collapse Insights' : 'Neural History'}
        </button>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-dashed border-[var(--border)] animate-in slide-in-from-top-2 duration-300">
           <FeatureLock requiredPlan="pro" currentPlan={currentPlan} featureName="Neural History">
              <div className="h-28 w-full mt-4">
                {loadingHistory ? (
                  <div className="h-full flex items-center justify-center text-[10px] uppercase font-bold text-[var(--text3)] tracking-widest animate-pulse">Syncing Telemetry...</div>
                ) : history.length < 2 ? (
                  <div className="h-full flex items-center justify-center text-center px-4">
                     <p className="text-[10px] font-medium text-[var(--text3)] leading-relaxed italic">Accumulating data points. Check back in 24 hours.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--lime)" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="var(--lime)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                      <XAxis dataKey="scraped_at" hide />
                      <YAxis domain={['auto', 'auto']} hide />
                      <Tooltip 
                        contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '10px', color: 'var(--text)' }}
                        itemStyle={{ color: 'var(--lime)' }}
                        formatter={(val) => [`$${val}`, 'Price']}
                      />
                      <Area type="monotone" dataKey="price" stroke="var(--lime)" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
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
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 mb-8 shadow-sm relative overflow-hidden animate-in zoom-in-95 duration-500">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
         <Globe size={100} className="text-[var(--text)]" />
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row gap-8 mb-8">
        <div className="w-28 h-28 rounded-2xl border border-[var(--border)] bg-white p-2.5 flex items-center justify-center shrink-0 shadow-sm">
          {data.mainImage ? (
            <img src={data.mainImage} alt={data.title} className="w-full h-full object-contain" />
          ) : (
            <Package size={32} className="text-[var(--text3)]" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-2 py-0.5 rounded bg-[var(--hover-bg)] text-[10px] font-bold text-[var(--text2)] uppercase tracking-widest border border-[var(--border)]">
              {data.platform} Captured
            </span>
            <TrendBadge score={data.trendScore} />
          </div>
          <h3 className="text-xl font-bold text-[var(--text)] tracking-tight mb-2 leading-tight pr-10">{data.title}</h3>
          <div className="text-3xl font-bold text-[var(--text)] tracking-tighter tabular-nums">
             <span className="text-[var(--text3)] mr-0.5">$</span>{data.price?.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Velocity', value: data.soldQuantity || '0', icon: Activity },
          { label: 'Reviews', value: data.reviewsCount?.toLocaleString() || '0', icon: Star },
          { label: 'Rating', value: data.rating ? `${data.rating}★` : '—', icon: Star },
          { label: 'Engagement', value: data.in_carts || '0', icon: MousePointer2 },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2 text-[var(--text3)]">
               <Icon size={12} className="text-[var(--lime)]" />
               <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            </div>
            <div className="text-xl font-bold text-[var(--text)]">{value}</div>
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => onSave(data)} 
          className="h-12 px-8 bg-[var(--text)] text-[var(--bg)] rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all flex-1 shadow-sm"
        >
          <Plus size={18} className="text-[var(--lime)]" /> Commit to Vault
        </button>
        {data.url && (
          <a 
            href={data.url} target="_blank" rel="noopener noreferrer" 
            className="h-12 px-6 rounded-xl border border-[var(--border)] bg-[var(--hover-bg)] text-[var(--text)] text-sm font-bold hover:bg-[var(--border)] transition-all inline-flex items-center justify-center gap-2"
          >
            Source <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  )
}

let trackedCache = null;

export default function Track() {
  const { usage } = useDashboard()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [tracked, setTracked] = useState(trackedCache || [])
  const [trackedLoading, setTrackedLoading] = useState(!trackedCache)
  const [statusMsg, setStatusMsg] = useState('')
  const [searchParams] = useSearchParams()
  const scanTriggered = useRef(false)

  const loadAll = () => {
    if (!trackedCache) setTrackedLoading(true)
    
    getTracked().then(r => {
      trackedCache = r.products || [];
      setTracked(trackedCache);
    }).finally(() => {
      setTrackedLoading(false)
      
    })
  }

  useEffect(() => { 
    loadAll()
    const urlParam = searchParams.get('url')
    if (urlParam && !scanTriggered.current) {
      setUrl(urlParam)
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
    if (!platform) { toast.error('Enter valid eBay/Etsy URL'); return }

    setLoading(true); setResult(null)
    const msgs = ['Establishing neural link...', 'Parsing metadata...', 'Synthesizing metrics...']
    let i = 0; setStatusMsg(msgs[0])
    const interval = setInterval(() => { i = (i + 1) % msgs.length; setStatusMsg(msgs[i]) }, 2000)

    try {
      const data = await scrapeProduct(url, platform)
      if (data.success) {
        setResult(data.data)
        toast.success('Intelligence Gathered')
      }
    } catch (err) {
      const msg = err.response?.data?.detail
      toast.error(typeof msg === 'string' ? msg : 'Extraction failed')
    } finally {
      setLoading(false); clearInterval(interval); setStatusMsg('')
    }
  }

  const handleSaveTracked = async (productData) => {
    try {
      await addTracked(productData)
      toast.success('Indexed to Vault')
      setResult(null); setUrl('')
      loadAll()
    } catch (err) {
      toast.error('Vault Limit Reached')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('De-index this asset?')) return
    try {
      await deleteTracked(id)
      toast.success('Asset Removed')
      loadAll()
    } catch { toast.error('Action failed') }
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 pb-12 animate-in fade-in duration-500 font-poppins">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text)]">Market Intelligence</h1>
          <p className="text-[var(--text2)] mt-1">Deploy an institutional scan to isolate ROI and trend velocity.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard" className="px-5 py-2 border border-[var(--border)] rounded-lg text-sm font-medium hover:bg-[var(--hover-bg)] text-[var(--text)] transition-colors">Dashboard</Link>
          <div className="px-5 py-2 bg-[var(--lime-dim)] text-[var(--text)] border border-[var(--lime-border)] rounded-lg text-sm font-bold flex items-center gap-2">
             <Activity size={14} className="text-[var(--lime)]" /> Extraction Live
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
        <form id="scrape-form" onSubmit={handleScrape} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text3)]" />
            <input
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl h-14 pl-12 pr-4 text-sm font-medium text-[var(--text)] outline-none focus:border-[var(--lime)] transition-all placeholder:text-[var(--text3)]" 
              placeholder="Paste marketplace product URL (eBay or Etsy)..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || !url.trim()}
            className="h-14 px-8 bg-[var(--text)] text-[var(--bg)] rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-50 min-w-[160px]" 
          >
            {loading ? <RefreshCw size={18} className="animate-spin text-[var(--lime)]" /> : <Zap size={18} className="text-[var(--lime)]" />}
            {loading ? 'Scanning...' : 'Extract Intelligence'}
          </button>
        </form>

        {loading && (
          <div className="mt-8 animate-in fade-in duration-500">
             <div className="flex justify-between items-end mb-2">
                <div className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-widest">{statusMsg}</div>
                <div className="text-[10px] font-bold text-[var(--lime)] uppercase tracking-widest">Neural Link Syncing</div>
             </div>
             <div className="h-1 w-full bg-[var(--bg)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--lime)] rounded-full animate-[progress_3s_infinite_linear]" />
             </div>
          </div>
        )}
      </div>

      {/* Result Display */}
      {result && (
        <div className="space-y-4">
           <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-[var(--text)] whitespace-nowrap">Intelligence Result</h2>
              <div className="h-px bg-[var(--border)] w-full" />
           </div>
           <AnalysisResult data={result} onSave={handleSaveTracked} />
        </div>
      )}

      {/* Vault Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4 w-full">
              <h2 className="text-lg font-bold text-[var(--text)] whitespace-nowrap">Monitoring Vault</h2>
              <div className="h-px bg-[var(--border)] w-full" />
           </div>
           <div className="ml-4 px-3 py-1 bg-[var(--hover-bg)] border border-[var(--border)] rounded-full text-[10px] font-bold text-[var(--text3)] uppercase tracking-widest whitespace-nowrap">
             {tracked.length} Assets
           </div>
        </div>

        {trackedLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl h-48 animate-pulse" />
            ))}
          </div>
        ) : tracked.length === 0 ? (
          <div className="py-20 text-center bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-2xl">
            <Package size={40} className="mx-auto text-[var(--text3)] opacity-20 mb-4" />
            <p className="text-sm font-bold text-[var(--text2)]">Monitoring Vault Empty</p>
            <p className="text-xs text-[var(--text3)] mt-1">Start a scan to begin institutional asset tracking.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
