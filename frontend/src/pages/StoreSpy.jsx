import { useState, useEffect } from 'react'
import { searchProducts, getUsage, addSaved } from '../lib/api'
import toast from 'react-hot-toast'
import { 
  Search, Target, TrendingUp, ShoppingCart, 
  ExternalLink, Package, RefreshCw, Eye, 
  Flame, Star, UserCheck
} from 'lucide-react'
import FeatureLock from '../components/FeatureLock'

export default function StoreSpy() {
  const [query, setQuery] = useState('')
  const [platform, setPlatform] = useState('ebay')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [usage, setUsage] = useState({ plan: 'free' })
  const [statusMsg, setStatusMsg] = useState('')

  useEffect(() => {
    getUsage().then(setUsage).catch(() => {})
  }, [])

  const handleSpy = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setResults([])
    const msgs = ['Infiltrating seller profile...', 'Intercepting metadata...', 'Analyzing margins...', 'Synthesizing inventory...']
    let i = 0; setStatusMsg(msgs[0])
    const interval = setInterval(() => { i = (i + 1) % msgs.length; setStatusMsg(msgs[i]) }, 3000)

    try {
      const searchKeyword = platform === 'ebay' ? `seller:${query}` : query
      const data = await searchProducts(searchKeyword, platform)
      
      if (data.success) {
        setResults(data.products || [])
        toast.success(`Infiltration successful! ${data.products?.length || 0} items extracted.`, {
          className: 'bg-card border border-border text-foreground font-poppins text-xs font-black',
          iconTheme: { primary: 'hsl(var(--primary))', secondary: 'hsl(var(--background))' }
        })
      } else {
        toast.error(data.error || 'Spying failed')
      }
    } catch (err) {
      toast.error('Competitor data is being shielded. Try a different profile.')
    } finally {
      setLoading(false); clearInterval(interval); setStatusMsg('')
    }
  }

  const handleSaveToVault = async (product) => {
    try {
      await addSaved({
        title: product.title,
        price: product.price,
        image: product.image,
        url: product.url,
        platform: platform
      })
      toast.success('Indexed to Vault', {
        className: 'bg-card border border-border text-foreground font-poppins text-xs font-black',
        iconTheme: { primary: 'hsl(var(--primary))', secondary: 'hsl(var(--background))' }
      })
    } catch (e) {
      toast.error('Vault capacity reached')
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 pb-12 font-poppins text-foreground">
      
      {/* Header section (Compact SaaS Style) */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[#BEF264] text-[8px] font-black tracking-[0.2em] uppercase shadow-sm">
            <Eye size={10} className="animate-pulse" strokeWidth={3} /> <span className="text-primary">Omniscient View Active</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter leading-none">Store Spy</h1>
          <p className="text-muted-foreground text-xs font-medium max-w-2xl leading-relaxed mt-2">
            Reverse engineer rival strategies. Enter an eBay or Etsy seller profile to decrypt their highest-velocity product deployments.
          </p>
        </div>
      </div>

      <FeatureLock requiredPlan="growth" currentPlan={usage.plan} featureName="Store Spy Intelligence">
        {/* Search Console */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 mb-10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
          <form onSubmit={handleSpy} className="flex flex-col sm:flex-row gap-4 relative z-10 w-full">
            <div className="flex bg-muted p-1 rounded-xl border border-border shrink-0 shadow-inner">
              {['ebay', 'etsy'].map(p => (
                <button 
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all ${platform === p ? 'bg-background text-foreground shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {p}
                </button>
              ))}
            </div>
            
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3 pointer-events-none">
                <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center group-focus-within:border-primary transition-all">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BEF264] group-focus-within:text-primary transition-colors">
                    <Search size={16} strokeWidth={2.5} />
                  </span>
                </div>
              </div>
              <input
                className="w-full bg-muted/50 border border-border rounded-xl h-12 pl-14 pr-4 text-xs font-black text-foreground outline-none focus:border-primary focus:bg-background transition-all placeholder:text-muted-foreground shadow-inner" 
                placeholder={platform === 'ebay' ? "ENTER EBAY SELLER ID..." : "ENTER ETSY STORE NAME..."}
                value={query}
                onChange={e => setQuery(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className="h-12 px-6 rounded-xl bg-foreground text-background text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-80 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md shadow-foreground/10 disabled:opacity-50 sm:w-auto w-full" 
              disabled={loading || !query.trim()}
            >
              {loading ? <RefreshCw size={16} className="animate-spin text-primary" /> : <Eye size={16} strokeWidth={3} className="text-primary" />}
              {loading ? 'Decrypting...' : 'Scout Seller'}
            </button>
          </form>

          {loading && (
            <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(204,255,0,0.8)]" />
                  <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">{statusMsg}</span>
                </div>
                <div className="flex gap-1">
                  {[1,2,3,4].map(s => (
                    <div key={s} className={`h-1 w-4 rounded-full ${s <= 2 ? 'bg-[#BEF264]' : 'bg-muted'}`} />
                  ))}
                </div>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border p-px">
                <div className="h-full bg-primary rounded-full w-2/3 shadow-[0_0_10px_rgba(204,255,0,0.5)] animate-[shimmer_2s_infinite_linear]" />
              </div>
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex items-center justify-between mb-6 px-1">
              <div className="flex items-center gap-3 w-full">
                 <h2 className="text-[10px] font-black text-foreground uppercase tracking-[0.4em] shrink-0 flex items-center gap-2">
                  <UserCheck size={12} strokeWidth={3} className="text-primary" /> Intelligence Report: {query}
                 </h2>
                 <div className="h-px bg-border w-full" />
                 <div className="px-3 py-1 bg-card border border-border rounded-full text-[9px] font-black text-foreground uppercase tracking-widest shadow-sm shrink-0">
                    {results.length} EXTRACTED
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {results.map((p, idx) => (
                <div key={idx} className="group relative flex flex-col bg-card border border-border rounded-2xl p-4 hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-border mb-4 p-4 flex items-center justify-center shadow-sm">
                    {p.image ? (
                      <img src={p.image} alt={p.title} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100" />
                    ) : (
                      <Package size={32} className="text-muted" strokeWidth={1.5} />
                    )}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => handleSaveToVault(p)}
                        className="w-8 h-8 bg-foreground text-background rounded-lg flex items-center justify-center hover:opacity-80 transition-all shadow-md"
                        title="Index to Vault"
                      >
                        <ShoppingCart size={14} strokeWidth={2.5} className="text-primary" />
                      </button>
                      {p.url && (
                        <a 
                          href={p.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-background text-foreground rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-all shadow-md"
                        >
                          <ExternalLink size={14} strokeWidth={2.5} />
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-[13px] font-black text-foreground line-clamp-2 leading-snug mb-3 min-h-[2.5rem] group-hover:text-primary transition-colors" title={p.title}>
                      {p.title}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 mb-4 min-h-[22px]">
                      {p.sold_quantity && (
                        <span className="text-[8px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-md border border-primary/30 shadow-sm">
                          {p.sold_quantity} Sold
                        </span>
                      )}
                      {p.is_bestseller && (
                        <span className="text-[8px] font-black text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-2 py-1 rounded-md border border-yellow-500/20 shadow-sm">
                          Bestseller
                        </span>
                      )}
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/50">
                      <span className="text-xl font-black text-foreground tracking-tighter tabular-nums">
                        <span className="text-primary text-[13px] mr-1">$</span>{p.price?.toFixed(2) || '0.00'}
                      </span>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted border border-border">
                        <TrendingUp size={10} className="text-primary" strokeWidth={3} />
                        <span className="text-[9px] font-black text-foreground tabular-nums">{p.trend_score || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.length === 0 && !loading && (
          <div className="py-20 text-center bg-card border border-dashed border-border rounded-3xl group transition-colors duration-500">
            <div className="w-16 h-16 bg-muted rounded-2xl border border-border flex items-center justify-center mb-6 mx-auto text-muted-foreground group-hover:bg-primary group-hover:text-[#111827] transition-all duration-500 shadow-sm">
              <Target size={24} strokeWidth={1.5} />
            </div>
            <p className="text-lg font-black text-foreground mb-2 uppercase tracking-tight">Awaiting Target Intel</p>
            <p className="text-muted-foreground text-[11px] font-medium max-w-sm mx-auto italic leading-relaxed px-4">Enter a competitor's profile signature to initiate the automated product research sequence.</p>
          </div>
        )}
      </FeatureLock>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  )
}
