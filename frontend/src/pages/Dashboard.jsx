import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, Bookmark, RefreshCw, Trash2, Box, Zap, Globe, Package,
  ArrowRight, BarChart3, Activity, TrendingUp, DollarSign, Flame,
  ChevronRight, Target, Wifi, Factory
} from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { scrapeProduct, deleteTracked } from '../lib/api'
import { DashboardSkeleton } from '../components/DashboardSkeletons'
import { useDashboard } from '../context/DashboardContext'

// ── Animated counter hook ────────────────────────────────────────────────────
function useCountUp(target, duration = 800) {
  const [val, setVal] = useState(0)
  const rafRef = useRef(null)
  useEffect(() => {
    if (target === 0) { setVal(0); return }
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(Math.round(eased * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])
  return val
}

// ── Relative time ────────────────────────────────────────────────────────────
function timeAgo(iso) {
  if (!iso) return null
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, accent = false, badge }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm flex flex-col justify-between group hover:border-[var(--lime-border)] transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-[var(--text2)]">{label}</span>
        <div className={`p-2 rounded-xl ${accent ? 'bg-[var(--lime-dim)]' : 'bg-[var(--hover-bg)]'} text-[var(--text)]`}>
          <Icon size={18} />
        </div>
      </div>
      <div>
        <div className="text-[var(--text)] text-3xl font-bold mb-1 tabular-nums">{value}</div>
        {sub && (
          <p className="text-xs font-medium text-[var(--text3)] flex items-center gap-1.5 mt-2">
            {sub}
          </p>
        )}
        {badge && badge}
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const { usage, tracked, trending, loading, refresh } = useDashboard()
  const [scanUrl, setScanUrl] = useState('')
  const [isScanning, setIsScanning] = useState(false)

  // Derived KPIs
  const creditsUsed = usage?.used ?? 0
  const creditsLimit = usage?.limit ?? 2
  const isAdmin = usage?.isAdmin
  const trackedCount = usage?.trackedCount ?? 0
  const trackedLimit = usage?.trackedLimit ?? 10

  // Est. monthly revenue = sum of price * estimated monthly velocity from tracked
  const estMonthlyRevenue = tracked.reduce((acc, p) => {
    const price = parseFloat(p.price) || 0
    const velocity = parseInt(p.sold_quantity) || 0
    // Conservative: assume sold_quantity is per listing lifespan, estimate 10% monthly
    return acc + price * Math.max(velocity * 0.1, 1)
  }, 0)

  const animatedRevenue = useCountUp(Math.round(estMonthlyRevenue))
  const animatedCredits = useCountUp(creditsUsed)
  const animatedTracked = useCountUp(trackedCount)

  const handleQuickScan = async (e) => {
    e.preventDefault()
    if (!scanUrl) return
    setIsScanning(true)
    const platform = scanUrl.includes('ebay') ? 'ebay' : 'etsy'
    try {
      await scrapeProduct(scanUrl, platform)
      toast.success('🟢 Market Intelligence Captured', { duration: 3000 })
      setScanUrl('')
      refresh(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Extraction failed')
    } finally {
      setIsScanning(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Permanent deletion from Vault?')) return
    try {
      await deleteTracked(id)
      toast.success('Asset Purged')
      refresh(false)
    } catch { toast.error('Purge failed') }
  }

  if (loading && !usage) return <DashboardSkeleton />

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text)]">Dashboard Overview</h1>
          <p className="text-[var(--text2)] mt-1">Command centre for your e-commerce intelligence.</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/dashboard/settings"
            className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm font-medium hover:bg-[var(--hover-bg)] text-[var(--text)] transition-colors"
          >
            Settings
          </Link>
          <Link
            to="/dashboard/track"
            className="px-5 py-2 bg-[var(--lime)] text-[#0D0D0C] rounded-lg text-sm font-semibold hover:opacity-90 shadow-[0_0_15px_var(--lime-border)] transition-all whitespace-nowrap flex items-center gap-2"
          >
            <Zap size={14} strokeWidth={2.5} /> New Scan
          </Link>
        </div>
      </motion.div>

      {/* Quick Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-2 flex items-center shadow-sm relative overflow-hidden group focus-within:border-[var(--lime-border)] transition-colors"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--lime-dim)] to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
        <Search className="text-[var(--text3)] ml-3 shrink-0 relative z-10" size={20} />
        <form onSubmit={handleQuickScan} className="flex-1 flex px-3 relative z-10">
          <input
            type="text"
            placeholder="Paste eBay or Etsy URL to extract product data..."
            value={scanUrl}
            onChange={e => setScanUrl(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-[var(--text)] text-sm placeholder:text-[var(--text3)]"
          />
          <button
            type="submit"
            disabled={isScanning || !scanUrl}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shrink-0 disabled:opacity-40 ${
              scanUrl
                ? 'bg-[var(--lime)] text-black shadow-[0_0_10px_var(--lime-border)]'
                : 'bg-[var(--text)] text-[var(--bg)]'
            }`}
          >
            {isScanning ? (
              <><RefreshCw size={14} className="animate-spin" /> Fetching</>
            ) : 'Extract'}
          </button>
        </form>
      </motion.div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tracked Products */}
        <StatCard
          label="Tracked Products"
          value={`${animatedTracked} / ${trackedLimit}`}
          icon={Box}
          accent
          sub={
            <><span className="live-dot" /> Active monitoring</>
          }
        />

        {/* Est. Revenue Potential */}
        <StatCard
          label="Est. Revenue Potential"
          value={`$${animatedRevenue.toLocaleString()}`}
          icon={DollarSign}
          accent
          sub={
            <><Wifi size={12} className="text-[var(--lime)]" /> Based on tracked products</>
          }
        />

        {/* Access Tier */}
        <StatCard
          label="Access Tier"
          value={isAdmin ? 'Root Access' : `${(usage?.plan || 'Free').charAt(0).toUpperCase() + (usage?.plan || 'Free').slice(1)} Tier`}
          icon={Globe}
          sub={null}
          badge={
            <Link
              to="/dashboard/billing"
              className="text-xs font-bold text-[var(--text3)] hover:text-[var(--text)] transition-colors flex items-center gap-1 mt-2 w-max uppercase tracking-wider"
            >
              Manage plan <ArrowRight size={12} />
            </Link>
          }
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold text-[var(--text)]">Recent Activity</h2>
            <Link to="/dashboard/saved" className="text-sm font-medium text-[var(--text2)] hover:text-[var(--text)] transition-colors">
              View all
            </Link>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
            <AnimatePresence mode="wait">
              {tracked.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-16 text-center flex flex-col items-center justify-center text-[var(--text3)]"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[var(--hover-bg)] flex items-center justify-center mb-4">
                    <Package size={24} className="opacity-50 text-[var(--text)]" />
                  </div>
                  <p className="text-sm font-semibold text-[var(--text)] mb-1">Your vault is empty</p>
                  <p className="text-xs max-w-[220px]">Extract products from supported marketplaces to start building your deep vault.</p>
                </motion.div>
              ) : (
                <motion.div key="list" className="divide-y divide-[var(--border)]">
                  {tracked.slice(0, 6).map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 hover:bg-[var(--hover-bg)] transition-colors flex items-center justify-between gap-4 group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-white border border-[var(--border2)] flex flex-shrink-0 items-center justify-center p-1 relative overflow-hidden">
                          {p.image
                            ? <img src={p.image} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" alt="" />
                            : <Package size={16} className="text-[var(--text3)]" />}
                        </div>
                        <div className="min-w-0 flex flex-col">
                          <h3 className="font-semibold text-sm text-[var(--text)] truncate max-w-[250px] md:max-w-[320px]">{p.title}</h3>
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--lime-dim)] text-[var(--text)] text-[10px] font-bold uppercase tracking-tight">
                              {p.platform}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-[var(--border)] opacity-50" />
                            <span className="text-[11px] font-bold text-[var(--text3)] tracking-tight">${(p.price || 0).toFixed(2)}</span>
                            {p.created_at && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-[var(--border)] opacity-50" />
                                <span className="text-[10px] text-[var(--text3)] flex items-center gap-1">
                                  <span className="live-dot" style={{ width: 5, height: 5 }} />
                                  {timeAgo(p.created_at)} · real-time via residential proxies
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/dashboard/track?url=${encodeURIComponent(p.url)}`}
                          className="p-2 text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--hover-bg)] rounded-lg border border-transparent hover:border-[var(--border)] transition-all"
                          title="Analyze"
                        >
                          <BarChart3 size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-[var(--text2)] hover:text-red-500 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Quick Tools + Trending Now */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text)] px-1">Quick Tools</h2>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-sm group hover:border-[var(--lime-border)] transition-colors"
          >
            <div className="flex items-center gap-3 mb-3 text-[var(--text)] font-semibold">
              <div className="black-pill !p-2 rounded-lg"><Bookmark size={16} className="text-[var(--lime)]" /></div>
              Saved Insights
            </div>
            <p className="text-xs text-[var(--text2)] font-medium mb-5 leading-relaxed">
              Access everything you have extracted and saved securely in your intelligence vault.
            </p>
            <Link
              to="/dashboard/saved"
              className="inline-flex items-center justify-center gap-2 w-full bg-[var(--hover-bg)] hover:bg-[var(--border2)] text-[var(--text)] text-xs font-semibold py-2.5 rounded-lg transition-colors"
            >
              Open Vault
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-sm group hover:border-[var(--border2)] transition-colors"
          >
            <div className="flex items-center gap-3 mb-3 text-[var(--text)] font-semibold">
              <div className="p-2 bg-[#3b82f6]/10 text-[#3b82f6] rounded-lg"><TrendingUp size={16} /></div>
              Live Heatmap
            </div>
            <p className="text-xs text-[var(--text2)] font-medium mb-5 leading-relaxed">
              Monitor what's buzzing across multiple marketplaces and catch emerging market trends.
            </p>
            <Link
              to="/dashboard/trending"
              className="inline-flex items-center justify-center gap-2 w-full bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 text-[#3b82f6] text-xs font-semibold py-2.5 rounded-lg transition-colors"
            >
              Explore Heatmap
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-sm group hover:border-[var(--lime-border)] transition-colors"
          >
            <div className="flex items-center gap-3 mb-3 text-[var(--text)] font-semibold">
              <div className="black-pill !p-2 rounded-lg"><Factory size={16} className="text-[var(--lime)]" /></div>
              Supplier Finder
            </div>
            <p className="text-xs text-[var(--text2)] font-medium mb-5 leading-relaxed">
              Execute global sourcing protocols across Tier-1 marketplaces and Alibaba.
            </p>
            <Link
              to="/dashboard/supplier"
              className="inline-flex items-center justify-center gap-2 w-full black-pill hover:bg-black/90 text-[var(--lime)] text-xs font-semibold py-2.5 rounded-lg transition-colors border-none"
            >
              Search Suppliers
            </Link>
          </motion.div>

          {/* Trending Now mini */}
          {trending && trending.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[var(--text)] font-semibold text-sm">
                  <div className="black-pill !p-1.5 rounded-md"><Flame size={12} className="text-[var(--lime)]" /></div>
                  Trending Now
                </div>
                <span className="black-pill !px-3 !py-1 !text-[8px] flex items-center gap-1.5 border-none">
                  <span className="live-dot" style={{ width: 5, height: 5 }} /> Live
                </span>
              </div>
              <div className="space-y-3">
                {trending.slice(0, 3).map((p, i) => (
                  <div key={p.id || i} className="flex items-center gap-3 group cursor-default">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[var(--border)] shrink-0 flex items-center justify-center overflow-hidden">
                      {p.image_url || p.image
                        ? <img src={p.image_url || p.image} className="w-full h-full object-contain" alt="" />
                        : <Package size={12} className="text-[var(--text3)]" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[var(--text)] truncate">{p.title}</p>
                      <p className="text-[10px] text-[var(--text3)] font-medium">${(p.price || 0).toFixed(2)} · Score {p.trend_score}</p>
                    </div>
                    <ChevronRight size={12} className="text-[var(--text3)] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
              <Link
                to="/dashboard/trending"
                className="mt-4 flex items-center justify-center gap-1 text-[10px] font-bold text-[var(--text3)] hover:text-[var(--text)] transition-colors uppercase tracking-wider"
              >
                See full heatmap <ChevronRight size={10} />
              </Link>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  )
}
