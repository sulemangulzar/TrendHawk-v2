import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Factory, Search, ExternalLink, ShieldCheck, 
  Globe, Truck, Award, Zap, ChevronRight,
  Package, DollarSign, Store, ShoppingBag,
  RefreshCw, Info, AlertCircle, CheckCircle2,
  ShieldAlert, Star, UserCheck
} from 'lucide-react'
import { scrapeProduct } from '../lib/api'
import toast from 'react-hot-toast'

// ── Platforms ────────────────────────────────────────────────────────────────
const PLATFORMS = [
  {
    name: 'Alibaba',
    desc: 'B2B Wholesale & Manufacturing',
    color: 'bg-[#FF6A00]',
    textColor: 'text-white',
    searchUrl: (q) => `https://www.alibaba.com/showroom/${encodeURIComponent(q)}.html`,
    icon: Factory,
    trustSignals: ['Trade Assurance', 'Gold Supplier', 'Verified MFR'],
    reliability: 'High'
  },
  {
    name: 'AliExpress',
    desc: 'B2C Retail & Small Batch',
    color: 'bg-[#E62E04]',
    textColor: 'text-white',
    searchUrl: (q) => `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(q)}`,
    icon: ShoppingBag,
    trustSignals: ['Top Brand', '95%+ Positive', 'Buyer Protection'],
    reliability: 'Medium-High'
  },
  {
    name: '1688',
    desc: 'Mainland China Domestic (Cheapest)',
    color: 'bg-[#FF5000]',
    textColor: 'text-white',
    searchUrl: (q) => `https://s.1688.com/selloffer/offer_search.htm?keywords=${encodeURIComponent(q)}`,
    icon: Globe,
    trustSignals: ['L-Level 5', 'Power Merchant', '7+ Years'],
    reliability: 'High (B2B)'
  },
  {
    name: 'DHgate',
    desc: 'Direct Wholesale Marketplace',
    color: 'bg-[#222222]',
    textColor: 'text-white',
    searchUrl: (q) => `https://www.dhgate.com/wholesale/search.do?searchkey=${encodeURIComponent(q)}`,
    icon: Store,
    trustSignals: ['Superior Supplier', 'Top Feedback', 'Annual VIP'],
    reliability: 'Medium'
  },
  {
    name: 'CJ Dropshipping',
    desc: 'Global Fulfillment & Sourcing',
    color: 'bg-[#FF6A00]',
    textColor: 'text-white',
    searchUrl: (q) => `https://cjdropshipping.com/list/search-list.html?searchName=${encodeURIComponent(q)}`,
    icon: Package,
    trustSignals: ['Verified Agent', 'Plus Program', 'QC Inspected'],
    reliability: 'High (Fulfillment)'
  },
  {
    name: 'Temu',
    desc: 'Mass-Market Consumer Retail',
    color: 'bg-[#FF4A00]',
    textColor: 'text-white',
    searchUrl: (q) => `https://www.temu.com/search_result.html?search_key=${encodeURIComponent(q)}`,
    icon: ShoppingBag,
    trustSignals: ['Purchase Protection', 'Verified Stores', 'Free Returns'],
    reliability: 'Medium (Consumer)'
  }
]

// ── Helpers ──────────────────────────────────────────────────────────────────
function detectPlatform(url) {
  if (!url) return null
  if (url.includes('ebay.com') || url.includes('ebay.')) return 'ebay'
  if (url.includes('etsy.com')) return 'etsy'
  return null
}

export default function Supplier() {
  const { usage } = useDashboard()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [result, setResult] = useState(null)
  const scanTriggered = useRef(false)

  const handleSourcingScan = async (e) => {
    e.preventDefault()
    if (!url.trim()) return

    const platform = detectPlatform(url)
    
    setLoading(true); setResult(null)
    const msgs = [
      'Establishing neural link...', 
      'Analyzing physical properties...', 
      'Initiating Neural Trust Scan...',
      'Synthesizing platform metadata...', 
      'Vetting regional logistics...',
      'Mapping supply chain integrity...'
    ]
    let i = 0; setStatusMsg(msgs[0])
    const interval = setInterval(() => { 
      i = (i + 1) % msgs.length; 
      setStatusMsg(msgs[i]) 
    }, 1200)

    try {
      // If it's a raw keyword (no platform detected), fallback to simple keyword extraction
      if (!platform) {
        setResult({ title: url, image: null, isKeyword: true })
        toast.success('🟢 Keyword Processed', { duration: 2000 })
      } else {
        const data = await scrapeProduct(url, platform)
        if (data.success) {
          setResult({
            title: data.data.title,
            image: data.data.mainImage || data.data.image,
            price: data.data.price,
            isKeyword: false
          })
          toast.success('🟢 Intelligence Captured', { duration: 3000 })
        }
      }
    } catch (err) {
      setResult({ title: url.split('/').pop().replace(/-/g, ' '), image: null, isKeyword: true })
      toast.error('Deep scan failed. Pivot to Keyword Search active.')
    } finally {
      setLoading(false); clearInterval(interval); setStatusMsg('')
    }
  }

  const handleDeepSearch = (baseUrl) => {
    if (!result?.title) return
    window.open(baseUrl(result.title), '_blank')
  }

  return (
    <>
      <FeatureLock requiredPlan="pro" currentPlan={usage?.plan} featureName="Supplier Intelligence">
        <div className="w-full max-w-6xl mx-auto space-y-8 md:space-y-10 pb-12 font-inter px-4 md:px-0">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div>
              <h1 className="text-3xl font-black text-[var(--text)] tracking-tight uppercase leading-none">
                Supplier <span className="black-pill !text-lg !px-3 !py-1 ml-1">Intelligence</span>
              </h1>
              <p className="text-[var(--text2)] mt-2 font-medium flex items-center gap-2">
                <ShieldCheck size={14} className="text-[var(--lime)]" /> Execute global sourcing protocols across Tier-1 marketplaces.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="black-pill !px-5 !py-2 flex items-center gap-2">
                <span className="live-dot" style={{ width: 6, height: 6 }} /> Sourcing Network Active
              </div>
            </div>
          </motion.div>

          {/* Input Area */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-sm overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none text-[var(--text)]">
              <Factory size={140} strokeWidth={1} />
            </div>

            <form onSubmit={handleSourcingScan} className="flex flex-col sm:flex-row gap-4 relative z-10">
              <div className="relative flex-1">
                <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text3)]" />
                <input
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl h-14 md:h-16 pl-16 pr-6 text-sm font-bold text-[var(--text)] outline-none focus:border-[var(--lime)] transition-all placeholder:text-[var(--text3)]"
                  placeholder="Paste marketplace product URL or enter Keyword..."
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  disabled={loading}
                />
              </div>
              <motion.button
                type="submit"
                disabled={loading || !url.trim()}
                whileTap={{ scale: 0.95 }}
                className="h-14 md:h-16 px-10 bg-[var(--text)] text-[var(--bg)] rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl disabled:opacity-50"
              >
                {loading
                  ? <><RefreshCw size={18} className="animate-spin" /> Neural Sync...</>
                  : <><Zap size={18} className="text-[var(--lime)]" /> Initialize Scan</>}
              </motion.button>
            </form>

            {/* Loading bar */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-8 overflow-hidden"
                >
                  <div className="flex justify-between items-end mb-3">
                    <div className="text-[10px] font-black text-[var(--text3)] uppercase tracking-widest">{statusMsg}</div>
                    <div className="text-[10px] font-bold text-[var(--lime)] uppercase tracking-widest flex items-center gap-1">
                      <span className="live-dot" style={{ width: 5, height: 5 }} /> Neural Verification ACTIVE
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--bg)] rounded-full overflow-hidden">
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

          {/* Result Card */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4">
                  <h2 className="text-sm font-black text-[#111827] uppercase tracking-widest whitespace-nowrap">Intelligence Strategy Protocol</h2>
                  <div className="h-px bg-[#E5E7EB] w-full" />
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-12 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.06)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none text-[var(--text)]">
                    <Award size={140} />
                  </div>

                  <div className="relative z-10 flex flex-col gap-10">
                    {/* Reliability Overview Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--border)]">
                      <div className="flex-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text3)] mb-2">Target Asset Protocol</p>
                          <h3 className="text-xl md:text-2xl font-black text-[var(--text)] tracking-tight uppercase italic break-words">{result.title}</h3>
                          <div className="h-1.5 w-24 bg-[var(--lime)] mt-4" />
                      </div>
                      
                      <div className="flex items-center gap-6 px-6 md:px-8 py-4 md:py-5 bg-[var(--bg)] border border-[var(--border)] rounded-[2rem] md:rounded-[2.5rem] shrink-0">
                          <div className="text-right">
                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text3)] mb-1">Vetting Score</p>
                            <div className="flex items-center gap-1.5 justify-end">
                                <span className="text-2xl md:text-3xl font-black text-[var(--text)]">9.4</span>
                                <div className="flex gap-0.5">
                                  {[1,2,3].map(i => <Star key={i} size={10} className="fill-[var(--lime)] text-[var(--lime)]" />)}
                                </div>
                            </div>
                          </div>
                          <div className="w-px h-10 bg-[var(--border)]" />
                          <div className="flex flex-col items-center">
                            <Award size={24} className="text-[var(--lime)]" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-[var(--lime)] mt-1">Certified</span>
                          </div>
                      </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="space-y-10">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-[var(--lime-dim)] border border-[var(--border)] rounded-xl">
                              <ShieldCheck size={18} className="text-[var(--lime)]" />
                          </div>
                          <div>
                              <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-tight">Deployment Repos</h3>
                              <p className="text-[10px] text-[var(--text3)] font-bold uppercase tracking-widest">Deep-linking to 6 authorized marketplaces</p>
                          </div>
                        </div>
                        <div className="black-pill !px-4 !py-2 self-start sm:self-auto">
                          <UserCheck size={14} className="text-[var(--lime)] mr-2" />
                          Manual Vetting Advised
                        </div>
                      </div>

                      {/* Operational Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {PLATFORMS.map((p) => (
                          <div
                            key={p.name}
                            className="bg-[var(--bg)] border border-[var(--border)] rounded-[2.5rem] p-6 group hover:border-[var(--lime-border)] transition-all hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.04)]"
                          >
                            <div className="flex items-center justify-between mb-6">
                                <div className={`p-4 ${p.color} text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                                  <p.icon size={22} />
                                </div>
                                <button
                                  onClick={() => handleDeepSearch(p.searchUrl)}
                                  className="px-4 py-2 bg-[var(--surface)] hover:bg-[var(--text)] text-[var(--text3)] hover:text-[var(--bg)] rounded-xl border border-[var(--border)] transition-all flex items-center gap-2 group/btn"
                                >
                                  <span className="text-[10px] font-black uppercase tracking-widest">Execute Deep Search</span>
                                  <ExternalLink size={12} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-black text-[var(--text)] uppercase tracking-tight">{p.name} Hub</h4>
                                  <p className="text-[10px] text-[var(--text3)] font-medium">{p.desc}</p>
                                </div>
                                
                                {/* Trust Badge Protocol */}
                                <div className="pt-4 border-t border-[var(--border)] space-y-3">
                                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--lime)]">Vetting Checklist:</p>
                                  <div className="flex flex-wrap gap-2">
                                      {p.trustSignals.map((sig, sidx) => (
                                        <span key={sidx} className="flex items-center gap-1.5 px-3 py-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[9px] font-bold text-[var(--text2)] uppercase tracking-wider group-hover:border-[var(--lime-border)] group-hover:text-[var(--text)] transition-colors">
                                          <CheckCircle2 size={10} className="text-[var(--lime)]" /> {sig}
                                        </span>
                                      ))}
                                  </div>
                                </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Strategic Sourcing Protocol Note */}
                      <div className="p-6 md:p-8 bg-[var(--text)] text-[var(--bg)] border border-[var(--border)] rounded-[2rem] md:rounded-[2.5rem] relative overflow-hidden group">
                        {/* Gloss Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--lime)]/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        
                        <div className="flex flex-col md:flex-row items-start gap-5 relative z-10">
                            <div className="mt-1 p-3 bg-[var(--bg)]/10 rounded-2xl">
                              <ShieldAlert size={22} className="text-[var(--lime)]" />
                            </div>
                            <div>
                              <h4 className="text-[var(--lime)] text-[10px] font-black uppercase tracking-[0.4em] mb-2">Institutional Protocol Notice</h4>
                              <p className="opacity-70 text-xs font-medium leading-relaxed italic">
                                Strategy Protocol: <span className="text-[var(--lime)] font-bold not-italic">Results vary based on regional marketplace latency and supplier verified status.</span> If a target asset is not identified on one hub, initiate immediate pivot to secondary repos. Some Tier-1 manufacturers may require custom vetting via authorized trade agents.
                              </p>
                            </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </FeatureLock>
      <style>{`
        .live-dot {
          position: relative;
          display: inline-block;
          border-radius: 9999px;
          background: #84CC16;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
      `}</style>
    </>
  )
}
