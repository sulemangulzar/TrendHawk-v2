import { useEffect, useState } from 'react'
import { getTrending } from '../lib/api'
import { useDashboard } from '../context/DashboardContext'
import {
  TrendingUp, Package, ShoppingCart, Flame, 
  Star, Eye, RefreshCw, ExternalLink, Globe, Activity
} from 'lucide-react'

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

function ProductCard({ product: p }) {
  return (
    <div className="group relative flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--lime-border)] transition-all duration-300 shadow-sm">
      
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

      {/* Signals */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {p.in_carts > 0 && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600 border border-orange-500/20 text-[9px] font-bold">
            <ShoppingCart size={9} /> {p.in_carts} units
          </div>
        )}
        {p.sold_last_24h > 0 && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--lime-dim)] text-[var(--text)] border border-[var(--lime-border)] text-[9px] font-bold">
            <Flame size={9} className="text-[var(--lime)]" /> {p.sold_last_24h}+ sold
          </div>
        )}
        {p.is_bestseller && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 text-[9px] font-bold">
            <Star size={9} fill="currentColor" strokeWidth={0} /> Bestseller
          </div>
        )}
      </div>

      {/* Intel */}
      <h3 className="text-sm font-bold text-[var(--text)] leading-tight line-clamp-2 mb-4 min-h-[2.5rem]" title={p.title}>
        {p.title}
      </h3>

      {/* Matrix */}
      <div className="mt-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-[var(--text)] tracking-tight tabular-nums">
            <span className="text-[var(--text3)] text-xs mr-0.5">$</span>{(p.price ?? 0).toFixed(2)}
          </div>
          <TrendBadge score={p.trend_score} />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
          <SatBadge label={p.saturation_label} />
          <div className="flex items-center gap-2">
             {p.watch_count > 0 && (
               <span className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text3)] tracking-tight">
                 <Eye size={12} strokeWidth={2} /> {p.watch_count}
               </span>
             )}
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
    </div>
  )
}

const trendingCache = {};
let lastUpdatedCache = null;

export default function Trending() {
  const {  } = useDashboard()
  const [platform, setPlatform] = useState('all')
  const [products, setProducts] = useState(trendingCache['all'] || [])
  const [loading, setLoading] = useState(!trendingCache['all'])
  const [lastUpdated, setLastUpdated] = useState(lastUpdatedCache)

  const load = (p) => {
    if (!trendingCache[p]) setLoading(true)
    
    getTrending(p, 40).then(r => {
      trendingCache[p] = r.products || [];
      setProducts(trendingCache[p])
      if ((r.products || []).length > 0) {
        const ts = r.products[0]?.scraped_at
        if (ts) {
          lastUpdatedCache = new Date(ts).toLocaleDateString();
          setLastUpdated(lastUpdatedCache);
        }
      }
    }).finally(() => {
      setLoading(false)
      
    })
  }

  useEffect(() => { 
    if (trendingCache[platform]) {
      setProducts(trendingCache[platform]);
      setLoading(false);
    }
    load(platform);
  }, [platform])

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-8 pb-12 animate-in fade-in duration-500 font-poppins">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold tracking-tight text-[var(--text)]">Market Heatmap</h1>
              {lastUpdated && (
                <span className="px-2 py-0.5 rounded bg-[var(--hover-bg)] text-[10px] font-bold text-[var(--text3)] uppercase tracking-widest border border-[var(--border)]">Updated {lastUpdated}</span>
              )}
           </div>
           <p className="text-[var(--text2)]">Real-time demand surges identified within the global marketplace.</p>
        </div>

        <div className="flex bg-[var(--surface)] p-1 rounded-xl border border-[var(--border)] shadow-sm">
          {['all', 'ebay', 'etsy'].map(p => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-widest ${
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

      {/* Grid Rendering */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
          {Array.from({ length: 15 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="py-32 text-center bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-2xl">
          <Globe size={48} className="mx-auto text-[var(--text3)] opacity-20 mb-6" />
          <h3 className="text-lg font-bold text-[var(--text)] mb-2">Indexing Global Marketplaces</h3>
          <p className="text-[var(--text3)] max-w-sm mx-auto text-sm">The intelligence sweep is currently in progress. Synchronized data will appear here shortly.</p>
          <button onClick={() => load(platform)} className="mt-8 px-6 py-2 bg-[var(--text)] text-[var(--bg)] rounded-lg text-sm font-bold flex items-center justify-center gap-2 mx-auto hover:opacity-90">
             <RefreshCw size={14} /> Force Sync
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
