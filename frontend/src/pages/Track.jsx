import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  scrapeProduct, getTracked, addTracked, deleteTracked,
  getPriceHistory, addSaved
} from '../lib/api'
import { useDashboard } from '../context/DashboardContext'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, Trash2, ExternalLink, Package, RefreshCw,
  TrendingUp, Star, Box, Zap,
  Activity, Globe, Info, MousePointer2, Heart, DollarSign,
  ShoppingCart, BarChart2, User, Flame, Clock
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'
import FeatureLock from '../components/FeatureLock'

// ── Helpers ──────────────────────────────────────────────────────────────────
function detectPlatform(url) {
  if (!url) return null
  if (url.includes('ebay.com') || url.includes('ebay.')) return 'ebay'
  if (url.includes('etsy.com')) return 'etsy'
  return null
}

function timeAgo(iso) {
  if (!iso) return null
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// ── Badges ───────────────────────────────────────────────────────────────────
function TrendBadge({ score }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--lime-dim)] text-[var(--text)] border border-[var(--lime-border)] text-[10px] font-bold tracking-tight">
      <TrendingUp size={10} className="text-[var(--lime)]" />
      {score ?? 0}
    </span>
  )
}

function HotBadge({ score }) {
  if (!score || score < 70) return null
  return (
    <span className="hot-badge">
      <Flame size={9} />
      HOT
    </span>
  )
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function ResultSkeleton() {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 mb-8 animate-pulse">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="w-28 h-28 rounded-2xl bg-[var(--bg)] shrink-0" />
        <div className="flex-1 space-y-4">
          <div className="flex gap-2">
            <div className="w-32 h-4 bg-[var(--bg)] rounded-full" />
            <div className="w-20 h-4 bg-[var(--bg)] rounded-full" />
          </div>
          <div className="w-3/4 h-8 bg-[var(--bg)] rounded-lg" />
          <div className="w-1/4 h-10 bg-[var(--bg)] rounded-lg" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-[var(--bg)] rounded-xl border border-[var(--border)]" />
        ))}
      </div>

      {/* Revenue Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-[var(--bg)] rounded-xl opacity-60" />
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-12 bg-[var(--bg)] rounded-xl flex-1" />
        <div className="h-12 w-32 bg-[var(--bg)] rounded-xl" />
        <div className="h-12 w-32 bg-[var(--bg)] rounded-xl" />
      </div>
    </div>
  )
}

// ── Tracked Product Card ──────────────────────────────────────────────────────
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
    } catch (e) { console.error(e) }
    finally { setLoadingHistory(false) }
  }

  useEffect(() => { loadHistory() }, [expanded])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--lime-border)] transition-all duration-300 shadow-sm group"
    >
      <div className="p-5">
        <div className="flex gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl border border-[var(--border)] bg-white p-1.5 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-500">
            {p.image
              ? <img src={p.image} alt={p.title} className="w-full h-full object-contain" />
              : <Package size={20} className="text-[var(--text3)]" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-bold text-[var(--text)] line-clamp-1 leading-tight">{p.title}</h3>
              <button
                onClick={() => onDelete(p.id)}
                className="p-1.5 text-[var(--text3)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-widest">{p.platform}</span>
              <div className="w-1 h-1 rounded-full bg-[var(--text3)] opacity-30" />
              <TrendBadge score={p.trend_score} />
              <HotBadge score={p.trend_score} />
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

        {/* Timestamp */}
        {p.created_at && (
          <p className="text-[10px] text-[var(--text3)] flex items-center gap-1 mb-3">
            <span className="live-dot" style={{ width: 5, height: 5 }} />
            Tracked {timeAgo(p.created_at)} · residential proxies
          </p>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-[var(--hover-bg)] text-[var(--text2)] text-xs font-bold hover:bg-[var(--border)] transition-all"
        >
          {expanded ? <Info size={12} /> : <TrendingUp size={12} className="text-[var(--lime)]" />}
          {expanded ? 'Collapse Insights' : 'Neural History'}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-dashed border-[var(--border)]">
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
                            <stop offset="5%" stopColor="var(--lime)" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="var(--lime)" stopOpacity={0} />
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Hero Result Card ──────────────────────────────────────────────────────────
function AnalysisResult({ data, onSaveTracked, onSaveVault }) {
  const isHot = (data.trendScore || 0) >= 70
  const scrapedAt = data.scraped_at || data.scrapedAt

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 mb-8 shadow-sm relative overflow-hidden"
    >
      {/* Decorative */}
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
        <Globe size={100} className="text-[var(--text)]" />
      </div>
      {isHot && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--lime)] to-transparent animate-gradient-x" />
      )}

      {/* Header Row */}
      <div className="relative z-10 flex flex-col md:flex-row gap-8 mb-8">
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="w-28 h-28 rounded-2xl border border-[var(--border)] bg-white p-2.5 flex items-center justify-center shrink-0 shadow-sm"
        >
          {data.mainImage || data.image
            ? <img src={data.mainImage || data.image} alt={data.title} className="w-full h-full object-contain" />
            : <Package size={32} className="text-[var(--text3)]" />}
        </motion.div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded bg-[var(--hover-bg)] text-[10px] font-bold text-[var(--text2)] uppercase tracking-widest border border-[var(--border)]">
              {data.platform} Captured
            </span>
            <TrendBadge score={data.trendScore} />
            {isHot && <span className="hot-badge"><Flame size={9} />HOT</span>}
            {scrapedAt && (
              <span className="flex items-center gap-1 text-[10px] text-[var(--text3)] font-medium">
                <span className="live-dot" style={{ width: 5, height: 5 }} />
                Scraped {timeAgo(scrapedAt)} · real-time via residential proxies
              </span>
            )}
          </div>

          <h3 className="text-xl font-bold text-[var(--text)] tracking-tight mb-2 leading-tight pr-10">{data.title}</h3>

          <div className="flex items-baseline gap-4">
            <div className="text-3xl font-bold text-[var(--text)] tracking-tighter tabular-nums">
              <span className="text-[var(--text3)] mr-0.5">$</span>{data.price?.toFixed(2)}
            </div>
            {data.sellerName && (
              <span className="flex items-center gap-1 text-xs text-[var(--text3)] font-medium">
                <User size={11} /> {data.sellerName}
                {data.sellerRating && <span className="text-amber-500 font-bold ml-1">★ {data.sellerRating}</span>}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Sold / Listed', value: (data.soldQuantity || data.sold_count || 0).toLocaleString(), icon: ShoppingCart },
          { label: 'Reviews', value: (data.reviewsCount || data.reviewCount || 0).toLocaleString(), icon: Star },
          { label: 'Rating', value: data.rating ? `${data.rating}★` : '—', icon: Star },
          { label: 'In Carts / Watchers', value: (data.in_carts || data.inCarts || data.watchCount || 0).toLocaleString(), icon: MousePointer2 },
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

      {/* Revenue Estimates */}
      {(data.estMonthlySales || data.est_monthly_sales || data.monthlySales || data.favorites) && (
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Est. Monthly Sales', value: data.estMonthlySales || data.est_monthly_sales || data.monthlySales || '—', icon: BarChart2 },
            { label: 'Est. Monthly Revenue', value: data.estMonthlyRevenue || data.est_monthly_revenue || data.revenueEst ? `$${(data.estMonthlyRevenue || data.est_monthly_revenue || data.revenueEst || 0).toLocaleString()}` : '—', icon: DollarSign },
            { label: 'Favorites', value: (data.favorites || 0).toLocaleString(), icon: Heart },
            { label: 'Competition', value: data.competitionLevel || data.saturationLabel || '—', icon: Activity },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-[var(--lime-dim)] border border-[var(--lime-border)] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={12} className="text-[var(--lime)]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text2)]">{label}</span>
              </div>
              <div className="text-xl font-bold text-[var(--text)]">{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="relative z-10 flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => onSaveTracked(data)}
          className="h-12 px-8 bg-[var(--lime)] text-black rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all flex-1 shadow-sm"
        >
          <Plus size={18} /> Commit to Vault
        </button>
        <button
          onClick={() => onSaveVault(data)}
          className="h-12 px-6 rounded-xl border border-[var(--border)] bg-[var(--hover-bg)] text-[var(--text)] text-sm font-bold hover:bg-[var(--border)] transition-all inline-flex items-center justify-center gap-2"
        >
          <Heart size={14} /> Save
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
    </motion.div>
  )
}

// ── Cache ─────────────────────────────────────────────────────────────────────
let trackedCache = null

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
      trackedCache = r.products || []
      setTracked(trackedCache)
    }).finally(() => setTrackedLoading(false))
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
    const msgs = ['Establishing neural link...', 'Parsing metadata...', 'Synthesizing metrics...', 'Estimating revenue...']
    let i = 0; setStatusMsg(msgs[0])
    const interval = setInterval(() => { i = (i + 1) % msgs.length; setStatusMsg(msgs[i]) }, 1800)

    try {
      const data = await scrapeProduct(url, platform)
      if (data.success) {
        setResult({ ...data.data, scraped_at: new Date().toISOString() })
        toast.success('🟢 Intelligence Gathered', { duration: 3000 })
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
      toast.success('✅ Indexed to Vault')
      setResult(null); setUrl('')
      loadAll()
    } catch (err) {
      toast.error('Vault Limit Reached')
    }
  }

  const handleSaveVault = async (productData) => {
    try {
      await addSaved({
        title: productData.title,
        price: productData.price,
        image: productData.mainImage || productData.image,
        url: productData.url,
        platform: productData.platform,
        trend_score: productData.trendScore || 0,
      })
      toast.success('💾 Saved to Vault')
    } catch {
      toast.error('Save failed')
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
    <div className="w-full max-w-6xl mx-auto space-y-10 pb-12 font-poppins">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text)]">Market <span className="black-pill !text-lg !px-3 !py-1 ml-1">Intelligence</span></h1>
          <p className="text-[var(--text2)] mt-1">Deploy an institutional scan to isolate ROI and trend velocity.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard" className="px-5 py-2 border border-[var(--border)] rounded-lg text-sm font-medium hover:bg-[var(--hover-bg)] text-[var(--text)] transition-colors">
            Dashboard
          </Link>
          <div className="black-pill !px-5 !py-2 flex items-center gap-2">
            <span className="live-dot" style={{ width: 6, height: 6 }} /> Extraction Live
          </div>
        </div>
      </motion.div>

      {/* Input Area */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm"
      >
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
          <motion.button
            type="submit"
            disabled={loading || !url.trim()}
            whileTap={{ scale: 0.95 }}
            className="h-14 px-8 bg-[var(--lime)] text-black rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-sm disabled:opacity-50 min-w-[160px]"
          >
            {loading
              ? <><RefreshCw size={18} className="animate-spin" /> Scanning...</>
              : <><Zap size={18} /> Extract Intelligence</>}
          </motion.button>
        </form>

        {/* Loading bar */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 overflow-hidden"
            >
              <div className="flex justify-between items-end mb-2">
                <div className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-widest">{statusMsg}</div>
                <div className="text-[10px] font-bold text-[var(--lime)] uppercase tracking-widest flex items-center gap-1">
                  <span className="live-dot" style={{ width: 5, height: 5 }} /> Neural Link Active
                </div>
              </div>
              <div className="h-1 w-full bg-[var(--bg)] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[var(--lime)] rounded-full"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Result */}
      <AnimatePresence>
        {loading && !result && (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ResultSkeleton />
          </motion.div>
        )}
        {result && (
          <motion.div key="result">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-lg font-bold text-[var(--text)] whitespace-nowrap">Intelligence Result</h2>
              <div className="h-px bg-[var(--border)] w-full" />
            </div>
            <AnalysisResult data={result} onSaveTracked={handleSaveTracked} onSaveVault={handleSaveVault} />
          </motion.div>
        )}
      </AnimatePresence>

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
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl h-52 animate-pulse" />
            ))}
          </div>
        ) : tracked.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-2xl"
          >
            <Package size={40} className="mx-auto text-[var(--text3)] opacity-20 mb-4" />
            <p className="text-sm font-bold text-[var(--text2)]">Monitoring Vault Empty</p>
            <p className="text-xs text-[var(--text3)] mt-1">Start a scan to begin institutional asset tracking.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracked.map(p => (
              <TrackedProductCard
                key={p.id}
                product={p}
                onDelete={handleDelete}
                currentPlan={usage?.plan}
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
