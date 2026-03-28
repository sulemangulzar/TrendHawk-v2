import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Bookmark, RefreshCw, Trash2, Box, Zap, Globe, Package, ArrowRight, BarChart3, Activity, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { scrapeProduct, deleteTracked } from '../lib/api'
import { DashboardSkeleton } from '../components/DashboardSkeletons'
import { useDashboard } from '../context/DashboardContext'

export default function Dashboard() {
  const { usage, tracked, loading, refresh } = useDashboard()
  const [scanUrl, setScanUrl] = useState('')
  const [isScanning, setIsScanning] = useState(false)

  const handleQuickScan = async (e) => {
    e.preventDefault()
    if (!scanUrl) return
    setIsScanning(true)
    const platform = scanUrl.includes('ebay') ? 'ebay' : 'etsy'
    try {
      await scrapeProduct(scanUrl, platform)
      toast.success('Market Intelligence Captured')
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

  const creditsUsed = usage?.used ?? 0
  const creditsLimit = usage?.limit ?? 2
  const isAdmin = usage?.isAdmin

  // Handled by generic skeletons per logical section
  if (loading && !usage) return <DashboardSkeleton />

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text)]">Dashboard Overview</h1>
          <p className="text-[var(--text2)] mt-1">Manage your vault and track your system usage.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard/settings" className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm font-medium hover:bg-[var(--hover-bg)] text-[var(--text)] transition-colors">Settings</Link>
          <Link to="/dashboard/track" className="px-5 py-2 bg-[var(--lime)] text-[#0D0D0C] rounded-lg text-sm font-semibold hover:opacity-90 shadow-[0_0_15px_var(--lime-border)] transition-all whitespace-nowrap">New Scan</Link>
        </div>
      </div>

      {/* Quick Search Header */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-2 flex items-center shadow-sm relative overflow-hidden group focus-within:border-[var(--lime)] transition-colors">
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
              className="px-5 py-2 bg-[var(--text)] rounded-lg text-sm font-medium text-[var(--bg)] hover:opacity-90 disabled:opacity-40 transition-all flex items-center gap-2 shrink-0"
            >
              {isScanning ? (
                <><RefreshCw size={14} className="animate-spin" /> Fetching</>
              ) : (
                <>Extract</>
              )}
            </button>
         </form>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm flex flex-col justify-between group hover:border-[var(--lime-border)] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-[var(--text2)]">Vault Assets</span>
            <div className="p-2 bg-[var(--lime-dim)] rounded-xl text-[var(--text)]">
               <Box size={18} />
            </div>
          </div>
          <div>
            <div className="text-[var(--text)] text-3xl font-bold mb-1">
              {usage?.trackedCount || 0} <span className="text-base font-medium text-[var(--text3)]">/ {usage?.trackedLimit || 10}</span>
            </div>
            <p className="text-xs font-medium text-[var(--text3)] flex items-center gap-1.5 mt-2">
               <Activity size={12} className="text-[#3b82f6]" /> Active monitoring
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm flex flex-col justify-between group hover:border-[var(--lime-border)] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-[var(--text2)]">Neural Units</span>
            <div className="p-2 bg-[var(--lime-dim)] rounded-xl text-[var(--text)]">
               <Zap size={18} />
            </div>
          </div>
          <div>
            <div className="text-[var(--text)] text-3xl font-bold mb-1">
              {isAdmin ? '∞' : creditsUsed} <span className="text-base font-medium text-[var(--text3)]">{!isAdmin && `/ ${creditsLimit}`}</span>
            </div>
             <p className="text-xs font-medium text-[var(--text3)] flex items-center gap-1.5 mt-2">
               <span className="w-1.5 h-1.5 rounded-full bg-[var(--lime)]" /> API bandwidth
             </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm flex flex-col justify-between group hover:border-[var(--lime-border)] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-[var(--text2)]">Access Tier</span>
            <div className="p-2 bg-[var(--hover-bg)] rounded-xl text-[var(--text)]">
               <Globe size={18} />
            </div>
          </div>
          <div>
            <div className="text-[var(--text)] text-3xl font-bold mb-1 capitalize">
              {isAdmin ? 'Root access' : `${usage?.plan || 'Free'} tier`}
            </div>
            <Link to="/dashboard/settings" className="text-xs font-bold text-[var(--text3)] hover:text-[var(--text)] transition-colors flex items-center gap-1 mt-2 w-max uppercase tracking-wider">
              Manage subscription <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
           <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-semibold text-[var(--text)]">Recent Activity</h2>
              <Link to="/dashboard/saved" className="text-sm font-medium text-[var(--text2)] hover:text-[var(--text)] transition-colors">View all</Link>
           </div>
           
           <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
             {tracked.length === 0 ? (
               <div className="p-16 text-center flex flex-col items-center justify-center text-[var(--text3)]">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--hover-bg)] flex items-center justify-center mb-4">
                     <Package size={24} className="opacity-50 text-[var(--text)]" />
                  </div>
                  <p className="text-sm font-semibold text-[var(--text)] mb-1">Your vault is empty</p>
                  <p className="text-xs max-w-[220px]">Extract products from supported marketplaces to start building your deep vault.</p>
               </div>
             ) : (
               <div className="divide-y divide-[var(--border)]">
                 {tracked.slice(0, 5).map(p => (
                   <div key={p.id} className="p-4 hover:bg-[var(--hover-bg)] transition-colors flex items-center justify-between gap-4 group">
                     <div className="flex items-center gap-4 min-w-0">
                       <div className="w-12 h-12 rounded-xl bg-white border border-[var(--border2)] flex flex-shrink-0 items-center justify-center p-1 relative overflow-hidden">
                         {p.image ? <img src={p.image} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" /> : <Package size={16} className="text-[var(--text3)]" />}
                       </div>
                       <div className="min-w-0 flex flex-col">
                         <h3 className="font-semibold text-sm text-[var(--text)] truncate max-w-[250px] md:max-w-[320px]">{p.title}</h3>
                         <div className="flex items-center gap-3 mt-1.5 cursor-default">
                           <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--lime-dim)] text-[var(--text)] text-[10px] font-bold uppercase tracking-tight">
                             {p.platform}
                           </span>
                           <span className="w-1 h-1 rounded-full bg-[var(--border)] opacity-50" />
                           <span className="text-[11px] font-bold text-[var(--text3)] tracking-tight">${(p.price || 0).toFixed(2)}</span>
                         </div>
                       </div>
                     </div>
                     <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                         <Link to={`/dashboard/track?url=${encodeURIComponent(p.url)}`} className="p-2 text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--hover-bg)] rounded-lg border border-transparent hover:border-[var(--border)] transition-all" title="Analyze">
                           <BarChart3 size={16} />
                         </Link>
                         <button onClick={() => handleDelete(p.id)} className="p-2 text-[var(--text2)] hover:text-red-500 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-all" title="Delete">
                           <Trash2 size={16} />
                         </button>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
        </div>

        {/* Right Column: Tips / Tools */}
        <div className="space-y-4">
           <h2 className="text-lg font-semibold text-[var(--text)] px-1">Quick Tools</h2>
           
           <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-sm group hover:border-[var(--lime-border)] transition-colors">
             <div className="flex items-center gap-3 mb-3 text-[var(--text)] font-semibold">
               <div className="p-2 bg-[var(--lime-dim)] text-[var(--text)] rounded-lg"><Bookmark size={16} /></div>
               Saved Insights
             </div>
             <p className="text-xs text-[var(--text2)] font-medium mb-5 leading-relaxed">
               Access everything you have extracted and saved securely in your intelligence vault.
             </p>
             <Link to="/dashboard/saved" className="inline-flex items-center justify-center gap-2 w-full bg-[var(--hover-bg)] hover:bg-[var(--border2)] text-[var(--text)] text-xs font-semibold py-2.5 rounded-lg transition-colors">
               Open Vault
             </Link>
           </div>
           
           <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-sm group hover:border-[var(--border2)] transition-colors">
             <div className="flex items-center gap-3 mb-3 text-[var(--text)] font-semibold">
               <div className="p-2 bg-[#3b82f6]/10 text-[#3b82f6] rounded-lg"><TrendingUp size={16} /></div>
               Live Heatmap
             </div>
             <p className="text-xs text-[var(--text2)] font-medium mb-5 leading-relaxed">
               Monitor what's buzzing across multiple marketplaces and catch emerging market trends.
             </p>
             <Link to="/dashboard/trending" className="inline-flex items-center justify-center gap-2 w-full bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 text-[#3b82f6] text-xs font-semibold py-2.5 rounded-lg transition-colors">
               Explore Heatmap
             </Link>
           </div>
        </div>

      </div>

    </div>
  )
}
