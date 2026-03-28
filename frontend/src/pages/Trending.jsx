import { useEffect, useState } from 'react'
import { getTrending, addSaved } from '../lib/api'
import { useDashboard } from '../context/DashboardContext'
import {
  TrendingUp, Package, ShoppingCart, Flame,
  Star, Eye, RefreshCw, ExternalLink, Globe, Activity,
  Heart, Filter
} from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

// ── Helpers ──────────────────────────────────────────────────────────────────
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

function SatBadge({ label }) {
  if (!label) return null
  const styles = {
    Untapped: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    Trending: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
    Saturated: 'bg-red-500/10 text-red-600 border-red-500/20',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold border tracking-tighter ${styles[label] || 'bg-[var(--hover-bg)] text-[var(--text3)] border-[var(--border)]'}`}>
      {label}
    </span>
  )
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 h-full animate-pulse shadow-sm relative overflow-hidden">
      <div className="aspect-square rounded-xl bg-[var(--bg)] mb-4 border border-[var(--border)]" />
      <div className="space-y-3">
        <div className="h-4 bg-[var(--bg)] rounded-md w-3/4" />
        <div className="h-4 bg-[var(--bg)] rounded-md w-1/2" />
        <div className="pt-4 border-t border-[var(--border)] flex justify-between items-center">
          <div className="h-6 w-16 bg-[var(--bg)] rounded-lg" />
          <div className="h-6 w-12 bg-[var(--bg)] rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product: p, index }) {
  const [saved, setSaved] = useState(false)
  const isHot = (p.trend_score || 0) >= 75
  const isRising = (p.sold_last_24h || 0) > 0

  const handleSave = async (e) => {
    e.stopPropagation()
    try {
      await addSaved({
        title: p.title,
        price: p.price,
        image: p.image_url || p.image,
        url: p.product_url,
        platform: p.platform,
        trend_score: p.trend_score || 0,
      })
      setSaved(true)
      toast.success('💾 Saved to Vault')
    } catch {
      toast.error('Save failed')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="group relative flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--lime-border)] transition-all duration-300 shadow-sm hover:shadow-lg"
    >
      {/* HOT ribbon */}
      {isHot && (
        <div className="absolute top-3 right-3 z-10">
          <span className="hot-badge"><Flame size={9} /> HOT</span>
        </div>
      )}

      {/* Media */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-[var(--border)] mb-5 p-4 flex items-center justify-center shadow-sm group-hover:scale-[1.02] transition-transform duration-500">
        {p.image_url || p.image ? (
          <img
            src={p.image_url || p.image}
            alt={p.title}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text3)]">
            <Package size={32} strokeWidth={1} />
          </div>
        )}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[var(--text)] text-[var(--bg)] text-[9px] font-bold uppercase tracking-widest shadow-sm">
          {p.platform}
        </div>
      </div>

      {/* Signal Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {p.in_carts > 0 && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600 border border-orange-500/20 text-[9px] font-bold">
            <ShoppingCart size={9} /> {p.in_carts} in carts
          </div>
        )}
        {isRising && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--lime-dim)] text-[var(--text)] border border-[var(--lime-border)] text-[9px] font-bold">
            <Flame size={9} className="text-[var(--lime)]" /> {p.sold_last_24h}+ sold today
          </div>
        )}
        {p.is_bestseller && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 text-[9px] font-bold">
            <Star size={9} fill="currentColor" strokeWidth={0} /> Bestseller
          </div>
        )}
        {p.almost_gone && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 border border-red-500/20 text-[9px] font-bold">
            ⚡ Almost Gone
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-[var(--text)] leading-tight line-clamp-2 mb-3 min-h-[2.5rem]" title={p.title}>
        {p.title}
      </h3>

      {/* Timestamp */}
      {p.scraped_at && (
        <p className="text-[10px] text-[var(--text3)] flex items-center gap-1 mb-3">
          <span className="live-dot" style={{ width: 5, height: 5 }} />
          Updated {timeAgo(p.scraped_at)} · residential proxies
        </p>
      )}

      {/* Bottom */}
      <div className="mt-auto space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-[var(--text)] tracking-tight tabular-nums">
            <span className="text-[var(--text3)] text-xs mr-0.5">$</span>{(p.price ?? 0).toFixed(2)}
          </div>
          <TrendBadge score={p.trend_score} />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
          <SatBadge label={p.saturation_label} />
          <div className="flex items-center gap-2">
            {p.watch_count > 0 && (
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text3)] tracking-tight">
                <Eye size={12} strokeWidth={2} /> {p.watch_count}
              </span>
            )}
            {/* Save button */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleSave}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm ${
                saved
                  ? 'bg-[var(--lime)] text-black'
                  : 'bg-[var(--hover-bg)] border border-[var(--border)] hover:bg-[var(--lime-dim)] hover:border-[var(--lime-border)] text-[var(--text)]'
              }`}
              title={saved ? 'Saved!' : 'Save to Vault'}
            >
              <Heart size={12} fill={saved ? 'currentColor' : 'none'} />
            </motion.button>
            {p.product_url && (
              <a
                href={p.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-[var(--hover-bg)] border border-[var(--border)] hover:bg-[var(--text)] hover:text-[var(--bg)] flex items-center justify-center transition-all shadow-sm"
              >
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Cache ─────────────────────────────────────────────────────────────────────
const trendingCache = {}
let lastUpdatedCache = null

export default function Trending() {
  const { usage } = useDashboard()
  const [platform, setPlatform] = useState('all')
  const [satFilter, setSatFilter] = useState('all')
  const [products, setProducts] = useState(trendingCache['all'] || [])
  const [loading, setLoading] = useState(!trendingCache['all'])
  const [lastUpdated, setLastUpdated] = useState(lastUpdatedCache)

  const isFree = usage?.plan === 'free'

  const load = (p) => {
    if (!trendingCache[p]) setLoading(true)
    getTrending(p, 40).then(r => {
      trendingCache[p] = r.products || []
      setProducts(trendingCache[p])
      if ((r.products || []).length > 0) {
        const ts = r.products[0]?.scraped_at
        if (ts) {
          lastUpdatedCache = new Date(ts).toLocaleDateString()
          setLastUpdated(lastUpdatedCache)
        }
      }
    }).finally(() => setLoading(false))
  }

  useEffect(() => {
    if (trendingCache[platform]) {
      setProducts(trendingCache[platform])
      setLoading(false)
    }
    load(platform)
  }, [platform])

  // Filter by saturation
  let filtered = satFilter === 'all'
    ? products
    : products.filter(p => p.saturation_label === satFilter)

  // Apply Free Tier "Half Access" (Limit to 20 products)
  const totalCount = filtered.length
  if (isFree) {
    filtered = filtered.slice(0, 20)
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-8 pb-12 font-poppins">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text)]">Market Heatmap</h1>
            {lastUpdated && (
              <span className="px-2 py-0.5 rounded bg-[var(--hover-bg)] text-[10px] font-bold text-[var(--text3)] uppercase tracking-widest border border-[var(--border)]">
                Updated {lastUpdated}
              </span>
            )}
            <span className="hot-badge"><Flame size={9} /> Live Feed</span>
          </div>
          <p className="text-[var(--text2)]">Real-time demand surges identified within the global marketplace.</p>
        </div>

        {/* Platform Tabs + Filter Pills */}
        <div className="flex flex-wrap gap-3">
          {/* Saturation filter */}
          <div className="flex items-center gap-1 bg-[var(--surface)] p-1 rounded-xl border border-[var(--border)] shadow-sm">
            <Filter size={12} className="text-[var(--text3)] ml-2" />
            {['all', 'Untapped', 'Trending', 'Saturated'].map(s => (
              <button
                key={s}
                onClick={() => setSatFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wide ${
                  satFilter === s
                    ? 'bg-[var(--text)] text-[var(--bg)] shadow-sm'
                    : 'text-[var(--text3)] hover:text-[var(--text)]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Platform tabs */}
          <div className="flex bg-[var(--surface)] p-1 rounded-xl border border-[var(--border)] shadow-sm">
            {['all', 'ebay', 'etsy'].map(p => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-widest ${
                  platform === p
                    ? 'bg-[var(--text)] text-[var(--bg)] shadow-md'
                    : 'text-[var(--text3)] hover:text-[var(--text)]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Count indicator */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-[var(--text3)] font-medium">
          <Activity size={12} className="text-[var(--lime)]" />
          Showing {filtered.length} products
          {satFilter !== 'all' && <span className="text-[var(--text)]">· filtered by "{satFilter}"</span>}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
          {Array.from({ length: 15 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-32 text-center bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-2xl"
        >
          <Globe size={48} className="mx-auto text-[var(--text3)] opacity-20 mb-6" />
          <h3 className="text-lg font-bold text-[var(--text)] mb-2">
            {satFilter !== 'all' ? `No ${satFilter} products found` : 'Indexing Global Marketplaces'}
          </h3>
          <p className="text-[var(--text3)] max-w-sm mx-auto text-sm">
            {satFilter !== 'all'
              ? 'Try a different filter or platform.'
              : 'The intelligence sweep is currently in progress. Synchronized data will appear here shortly.'}
          </p>
          <button
            onClick={() => { setSatFilter('all'); load(platform) }}
            className="mt-8 px-6 py-2 bg-[var(--text)] text-[var(--bg)] rounded-lg text-sm font-bold flex items-center justify-center gap-2 mx-auto hover:opacity-90"
          >
            <RefreshCw size={14} /> Force Sync
          </button>
        </motion.div>
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>

          {isFree && totalCount > filtered.length && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 border-t border-[var(--border)] border-dashed text-center"
            >
              <div className="inline-flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <Zap size={20} fill="currentColor" strokeWidth={0} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-[var(--text)] uppercase tracking-tight">Intelligence Restricted</h3>
                  <p className="text-sm text-[var(--text3)] max-w-md mx-auto">
                    You are viewing a restricted feed (Top 20 signals). Upgrade to Professional to unlock the full global heatmap and all trending intelligence.
                  </p>
                </div>
                <Link to="/login" className="px-6 py-2 bg-[var(--text)] text-[var(--bg)] rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all">
                  Upgrade Intelligence Hub
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
