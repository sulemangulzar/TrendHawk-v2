import { useEffect, useState } from 'react'
import { getTrending } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import {
  TrendingUp, Package, ShoppingCart, Flame, AlertCircle,
  Star, Eye, RefreshCw, ExternalLink
} from 'lucide-react'

/* ─── Components ───────────────────────────────────────────── */

function TrendBadge({ score }) {
  const color =
    score >= 70 ? 'bg-primary/10 text-foreground border-primary/20'
    : score >= 45 ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    : 'bg-muted text-muted-foreground border-border'
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[8px] font-black border tracking-widest tabular-nums ${color}`}>
      <TrendingUp size={10} strokeWidth={4} />
      {score ?? 0}
    </span>
  )
}

function SatBadge({ label }) {
  if (!label) return null
  const styles = {
    Untapped: 'bg-primary/10 text-foreground border-primary/20',
    Trending: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
    Saturated: 'bg-red-500/10 text-red-600 border-red-500/20',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[8px] font-black border tracking-[0.2em] uppercase ${styles[label] || 'bg-muted text-muted-foreground border-border'}`}>
      {label}
    </span>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 h-full animate-pulse shadow-sm relative overflow-hidden">
      <div className="aspect-square rounded-xl bg-muted/40 mb-4 border border-border/50" />
      <div className="flex gap-1.5 mb-3">
        <div className="h-5 w-16 bg-muted/30 rounded-md" />
        <div className="h-5 w-20 bg-muted/30 rounded-md" />
      </div>
      <div className="h-4 bg-muted/50 rounded-md mb-2 w-full" />
      <div className="h-4 bg-muted/50 rounded-md mb-6 w-2/3" />
      <div className="mt-auto space-y-4 pt-4 border-t border-border/30">
        <div className="flex items-center justify-between">
          <div className="h-6 w-16 bg-muted/40 rounded-lg" />
          <div className="h-5 w-10 bg-muted/30 rounded-full" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 w-12 bg-muted/20 rounded-md" />
          <div className="h-8 w-8 bg-muted/30 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

/* ─── Main Component ────────────────────────────────────────── */
export default function Trending() {
  const [products, setProducts] = useState([])
  const [platform, setPlatform] = useState('all')
  const [loading, setLoading] = useState(true)
  const [cacheEmpty, setCacheEmpty] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  const load = (p) => {
    setLoading(true)
    getTrending(p, 40).then(r => {
      setProducts(r.products || [])
      setCacheEmpty(r.cacheEmpty || false)
      if ((r.products || []).length > 0) {
        const ts = r.products[0]?.scraped_at
        if (ts) setLastUpdated(new Date(ts).toLocaleString())
      }
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load(platform) }, [platform])

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 pb-12 font-poppins text-foreground">
      
      {/* Header (Compact SaaS Style) */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[8px] font-black tracking-[0.2em] uppercase shadow-sm">
              <Flame size={10} fill="currentColor" strokeWidth={0} /> Global Intelligence Feed
            </span>
            {lastUpdated && (
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">WARMED {lastUpdated.split(',')[0]}</span>
            )}
          </div>
          <h1 className="text-2xl font-black tracking-tighter leading-none">Market Breakthroughs</h1>
          <p className="text-muted-foreground text-[11px] font-medium max-w-2xl leading-relaxed mt-1">
            Real-time demand surges identified within the global marketplace. These assets are exhibiting abnormal conversion metrics.
          </p>
        </div>

        {/* Platform Navigator (Finto Style) */}
        <div className="flex bg-card p-1.5 rounded-2xl border border-border shrink-0 shadow-sm">
          {['all', 'ebay', 'etsy'].map(p => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-[0.2em] ${
                platform === p
                  ? 'bg-foreground text-background shadow-md shadow-foreground/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Rendering */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {Array.from({ length: 15 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center bg-card border border-border rounded-3xl shadow-sm">
          <TrendingUp size={48} className="text-muted/50 mx-auto mb-6" strokeWidth={1} />
          <h3 className="text-xl font-black text-foreground mb-2 tracking-tight">Cache Under Synchronization</h3>
          <p className="text-muted-foreground max-w-sm mx-auto font-medium text-[11px] leading-relaxed px-4">The neural engine is currently indexing global marketplaces. Check back shortly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProductCard({ product: p }) {
  return (
    <div className="group relative flex flex-col bg-card border border-border rounded-xl p-4 hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      
      {/* Media Compartment */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-border mb-4 p-4 flex items-center justify-center shadow-sm">
        {p.image_url || p.image ? (
          <img
            src={p.image_url || p.image}
            alt={p.title}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">
            <Package className="w-12 h-12" strokeWidth={1.5} />
          </div>
        )}

        <div className="absolute top-2 left-2 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] bg-card/90 text-foreground border border-border backdrop-blur-md shadow-sm">
          {p.platform}
        </div>
      </div>

      {/* Signal Grid */}
      <div className="flex flex-wrap gap-1.5 mb-3 min-h-[22px]">
        {p.in_carts > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[8px] font-black uppercase tracking-widest shadow-sm">
            <ShoppingCart size={10} strokeWidth={3} /> {p.in_carts}
          </div>
        )}
        {p.sold_last_24h > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/30 text-[8px] font-black uppercase tracking-widest shadow-sm">
            <Flame size={10} strokeWidth={3} /> {p.sold_last_24h}+
          </div>
        )}
        {p.is_bestseller && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[8px] font-black uppercase tracking-widest shadow-sm">
            <Star size={10} fill="currentColor" strokeWidth={0} /> Bestseller
          </div>
        )}
      </div>

      {/* Product Intel */}
      <h3 className="text-[13px] font-black text-foreground leading-snug line-clamp-2 mb-4 min-h-[2.5rem] group-hover:text-primary transition-colors" title={p.title}>
        {p.title}
      </h3>

      {/* Value Matrix */}
      <div className="mt-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-black text-foreground tracking-tighter tabular-nums">
            <span className="text-primary text-[13px] mr-1">$</span>{(p.price ?? 0).toFixed(2)}
          </div>
          <TrendBadge score={p.trend_score} />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <SatBadge label={p.saturation_label} />
          <div className="flex items-center gap-3">
             {p.watch_count > 0 && (
               <span className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                 <Eye size={12} strokeWidth={3} /> {p.watch_count}
               </span>
             )}
             {p.product_url && (
               <a
                 href={p.product_url}
                 target="_blank"
                 rel="noopener noreferrer"
                 onClick={(e) => e.stopPropagation()}
                 className="w-8 h-8 rounded-lg bg-muted border border-border hover:bg-foreground hover:text-background flex items-center justify-center transition-all shadow-sm"
               >
                 <ExternalLink size={12} strokeWidth={2.5} />
               </a>
             )}
          </div>
        </div>
      </div>
    </div>
  )
}
