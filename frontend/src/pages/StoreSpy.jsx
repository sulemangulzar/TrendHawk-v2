import { useState, useEffect } from 'react'
import { searchProducts, getUsage, addSaved } from '../lib/api'
import { useDashboard } from '../context/DashboardContext'
import toast from 'react-hot-toast'
import { 
  Search, Target, TrendingUp, ShoppingCart, 
  ExternalLink, Package, RefreshCw, Eye, 
  Flame, Star, UserCheck, Activity, Globe, Info
} from 'lucide-react'
import FeatureLock from '../components/FeatureLock'

export default function StoreSpy() {
  const { setGlobalLoading } = useDashboard()
  const [query, setQuery] = useState('')
  const [platform, setPlatform] = useState('ebay')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [usage, setUsage] = useState({ plan: 'free' })
  const [statusMsg, setStatusMsg] = useState('')

  useEffect(() => {
    
    getUsage().then(setUsage).catch(() => {}).finally(() => {
      const timer = setTimeout(() => {} , 300)
    })
  }, [])

  const handleSpy = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setResults([])
    const msgs = ['Infiltrating seller profile...', 'Intercepting metadata...', 'Analyzing margins...', 'Synthesizing inventory...']
    let i = 0; setStatusMsg(msgs[0])
    const interval = setInterval(() => { i = (i + 1) % msgs.length; setStatusMsg(msgs[i]) }, 2000)

    try {
      const searchKeyword = platform === 'ebay' ? `seller:${query}` : query
      const data = await searchProducts(searchKeyword, platform)
      
      if (data.success) {
        setResults(data.products || [])
        toast.success(`Spying successful: ${data.products?.length || 0} items extracted`)
      } else {
        toast.error(data.error || 'Spying failed')
      }
    } catch (err) {
      toast.error('Competitor data shielded. Try a different profile.')
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
      toast.success('Indexed to Vault')
    } catch (e) {
      toast.error('Vault capacity reached')
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 pb-12 animate-in fade-in duration-500 font-poppins">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text)]">Store Intelligence</h1>
          <p className="text-[var(--text2)] mt-1">Reverse engineer rival strategies and isolate their highest-velocity deployments.</p>
        </div>
        <div className="flex bg-[var(--surface)] p-1 rounded-xl border border-[var(--border)] shadow-sm">
          {['ebay', 'etsy'].map(p => (
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

      <FeatureLock requiredPlan="growth" currentPlan={usage.plan} featureName="Store Intelligence">
        
        {/* Search Console */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSpy} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text3)]" />
              <input
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl h-14 pl-12 pr-4 text-sm font-medium text-[var(--text)] outline-none focus:border-[var(--lime)] transition-all placeholder:text-[var(--text3)]" 
                placeholder={platform === 'ebay' ? "Enter eBay Seller ID (e.g. fashion_brand)..." : "Enter Etsy Store Name..."}
                value={query}
                onChange={e => setQuery(e.target.value)}
                disabled={loading}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || !query.trim()}
              className="h-14 px-8 bg-[var(--text)] text-[var(--bg)] rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-50 min-w-[160px]" 
            >
              {loading ? <RefreshCw size={18} className="animate-spin text-[var(--lime)]" /> : <Eye size={18} className="text-[var(--lime)]" />}
              {loading ? 'Decrypting...' : 'Scout Seller'}
            </button>
          </form>

          {loading && (
            <div className="mt-8 animate-in fade-in duration-500">
               <div className="flex justify-between items-end mb-2">
                  <div className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-widest">{statusMsg}</div>
                  <div className="text-[10px] font-bold text-[var(--lime)] uppercase tracking-widest">Intelligence Extraction Active</div>
               </div>
               <div className="h-1 w-full bg-[var(--bg)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--lime)] rounded-full animate-[progress_3s_infinite_linear]" />
               </div>
            </div>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 w-full">
                 <h2 className="text-lg font-bold text-[var(--text)] whitespace-nowrap flex items-center gap-2">
                    <UserCheck size={18} className="text-[var(--lime)]" /> Spy Intelligence: {query}
                 </h2>
                 <div className="h-px bg-[var(--border)] w-full" />
              </div>
              <div className="ml-4 px-3 py-1 bg-[var(--hover-bg)] border border-[var(--border)] rounded-full text-[10px] font-bold text-[var(--text3)] uppercase tracking-widest whitespace-nowrap shadow-sm">
                {results.length} Found
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
              {results.map((p, idx) => (
                <div key={idx} className="group relative flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--lime-border)] transition-all duration-300 shadow-sm">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-[var(--border)] mb-5 p-4 flex items-center justify-center shadow-sm group-hover:scale-[1.02] transition-transform duration-500">
                    {p.image ? (
                      <img src={p.image} alt={p.title} className="w-full h-full object-contain" />
                    ) : (
                      <Package size={32} className="text-[var(--text3)]" strokeWidth={1} />
                    )}
                    
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => handleSaveToVault(p)}
                        className="w-10 h-10 bg-[var(--text)] text-[var(--bg)] rounded-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-md"
                        title="Commit to Vault"
                      >
                        <ShoppingCart size={16} className="text-[var(--lime)]" strokeWidth={2.5} />
                      </button>
                      {p.url && (
                        <a 
                          href={p.url} target="_blank" rel="noopener noreferrer"
                          className="w-10 h-10 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-lg flex items-center justify-center hover:bg-[var(--hover-bg)] transition-all shadow-md"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-sm font-bold text-[var(--text)] leading-tight line-clamp-2 mb-4 min-h-[2.5rem]" title={p.title}>
                    {p.title}
                  </h3>
                  
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {p.sold_quantity && (
                      <span className="px-1.5 py-0.5 rounded bg-[var(--lime-dim)] text-[var(--text)] border border-[var(--lime-border)] text-[9px] font-bold">
                        {p.sold_quantity} Sold
                      </span>
                    )}
                    {p.is_bestseller && (
                      <span className="px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 text-[9px] font-bold">
                        Bestseller
                      </span>
                    )}
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-[var(--border)]">
                    <span className="text-xl font-bold text-[var(--text)] tracking-tight tabular-nums">
                      <span className="text-[var(--text3)] text-xs mr-0.5">$</span>{p.price?.toFixed(2) || '0.00'}
                    </span>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--hover-bg)] border border-[var(--border)]">
                      <TrendingUp size={10} className="text-[var(--lime)]" strokeWidth={3} />
                      <span className="text-[10px] font-bold text-[var(--text)] tabular-nums">{p.trend_score || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.length === 0 && !loading && (
          <div className="py-32 text-center bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-2xl">
            <Target size={48} className="mx-auto text-[var(--text3)] opacity-20 mb-6" />
            <h3 className="text-lg font-bold text-[var(--text)] mb-2">Awaiting Target Intelligence</h3>
            <p className="text-[var(--text3)] max-w-sm mx-auto text-sm italic">Capture a rival signature to reverse-engineer their marketplace deployments.</p>
          </div>
        )}
      </FeatureLock>

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
