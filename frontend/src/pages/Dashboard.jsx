import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, TrendingUp, Bookmark, Bell, Package, ArrowRight, Activity, Zap, ShieldCheck, Box, Eye, Trash2, ExternalLink, RefreshCw, Flame, Globe, BarChart3 } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
import { scrapeProduct, deleteTracked } from '../lib/api'
import { DashboardSkeleton } from '../components/DashboardSkeletons'
import { useDashboard } from '../context/DashboardContext'

export default function Dashboard() {
  const { usage, tracked, trending, loading, error, refresh } = useDashboard()
  
  const [scanUrl, setScanUrl] = useState('')
  const [isScanning, setIsScanning] = useState(false)

  const fetchData = (showLoading = true) => {
     refresh(showLoading)
  }

  const handleQuickScan = async (e) => {
    e.preventDefault()
    if (!scanUrl) return
    setIsScanning(true)
    const platform = scanUrl.includes('ebay') ? 'ebay' : 'etsy'
    try {
      await scrapeProduct(scanUrl, platform)
      toast.success('Market Intelligence Captured')
      setScanUrl('')
      fetchData(false)
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
      fetchData(false)
    } catch { toast.error('Purge failed') }
  }

  const chartData = tracked.slice(0, 7).reverse().map((p, i) => ({
    name: i + 1,
    score: p.trend_score || 50,
  }))

  if (chartData.length < 7) {
    for (let i = chartData.length; i < 7; i++) {
        chartData.unshift({ name: i, score: 30 + Math.random() * 40 })
    }
  }

  const creditsUsed = usage?.used ?? 0
  const creditsLimit = usage?.limit ?? 2
  const creditsPercent = usage?.isAdmin ? 100 : Math.min((creditsUsed / creditsLimit) * 100, 100)

  if (loading && !usage) return <DashboardSkeleton />

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 font-poppins text-foreground max-w-5xl mx-auto px-4 lg:px-6">
      
      {/* ─── 01 Header & Quick Command ────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pt-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
             <div className="w-2 h-2 rounded-full bg-[#BEF264] shadow-[0_0_8px_#BEF264]" />
             <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">System Online</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Overview</h1>
        </div>
        
        <form onSubmit={handleQuickScan} className="w-full md:w-[280px] relative">
          <input 
            type="text" 
            placeholder="Search URL..."
            value={scanUrl}
            onChange={e => setScanUrl(e.target.value)}
            className="w-full h-10 bg-muted/40 border border-border rounded-xl pl-4 pr-12 text-sm font-medium text-foreground focus:ring-2 focus:ring-[#BEF264]/20 focus:border-[#BEF264] transition-all outline-none"
          />
          <button 
            type="submit" 
            disabled={isScanning || !scanUrl}
            className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center bg-[#BEF264] text-black rounded-lg hover:opacity-90 disabled:opacity-50 transition-all font-bold"
          >
            {isScanning ? <RefreshCw size={13} className="animate-spin" /> : <Search size={14} strokeWidth={3} />}
          </button>
        </form>
      </div>

      {/* ─── 02 High-Density Metrics Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Vault Status */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm group hover:border-[#BEF264]/50 transition-colors">
          <div className="flex items-center justify-between mb-2 text-muted-foreground">
             <Box size={16} strokeWidth={2.5} />
             <span className="text-[9px] font-black uppercase tracking-widest opacity-50 text-right">Vault assets</span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-black tracking-tighter tabular-nums">{usage?.trackedCount || 0}</div>
            <div className="text-[10px] font-bold text-muted-foreground opacity-30">/ {usage?.trackedLimit || 10}</div>
          </div>
        </div>

        {/* Neural Bandwidth (Usage) */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm group hover:border-[#BEF264]/50 transition-colors">
          <div className="flex items-center justify-between mb-2 text-muted-foreground">
             <Zap size={16} strokeWidth={2.5} className="text-[#BEF264]" />
             <span className="text-[9px] font-black uppercase tracking-widest opacity-50">Neural Units</span>
          </div>
          <div className="text-2xl font-black tracking-tighter tabular-nums mb-2">
            {usage?.isAdmin ? '∞' : creditsUsed} <span className="text-[10px] opacity-30">/ {usage?.isAdmin ? '∞' : creditsLimit}</span>
          </div>
          <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-1000"
              style={{ width: `${creditsPercent}%` }}
            />
          </div>
        </div>

        {/* Uplink status */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2 text-muted-foreground">
             <Globe size={16} strokeWidth={2.5} />
             <span className="text-[9px] font-black uppercase tracking-widest opacity-50">Auth level</span>
          </div>
          <div className="text-lg font-black text-foreground mb-1 tracking-tight">
            {usage?.isAdmin ? 'Root Access' : usage?.plan || 'Standard'}
          </div>
          <div className="text-[9px] font-bold text-muted-foreground uppercase opacity-40">System Sync [24ms]</div>
        </div>

        {/* Quick Nav Shortcut */}
        <Link to="/dashboard/trending" className="bg-primary hover:opacity-90 border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between group transition-all transform hover:-translate-y-1">
          <div className="flex items-center justify-between text-primary-foreground/60">
             <TrendingUp size={16} strokeWidth={3} />
             <ArrowRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="text-[11px] font-black text-primary-foreground uppercase tracking-tight leading-tight mt-4">Open Heatmap Explorer</div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── 03 Market Velocity Chart (Productive version) ──────────────── */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <BarChart3 size={18} strokeWidth={2.5} className="text-muted-foreground" />
                  <h2 className="text-sm font-black uppercase tracking-widest">Market Velocity Sync</h2>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase opacity-40">
                  <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#BEF264]" /> Trend Score</span>
                </div>
              </div>
              
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderRadius: '12px', 
                        border: '1px solid hsl(var(--border))',
                        fontSize: '11px',
                        fontFamily: 'Poppins',
                        fontWeight: '700'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#BEF264" 
                      strokeWidth={3} 
                      fill="#BEF264" 
                      fillOpacity={0.05} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sub-grid of Small Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Link to="/dashboard/spy" className="flex items-center gap-4 p-4 bg-muted/30 border border-border rounded-xl hover:bg-muted/50 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground group-hover:text-[#BEF264]">
                     <Eye size={20} />
                  </div>
                   <div className="flex flex-col">
                      <span className="text-xs font-black uppercase tracking-tight">Competitor Spy</span>
                      <span className="text-[10px] text-muted-foreground font-medium">Analyze store inventories</span>
                   </div>
               </Link>
               <Link to="/dashboard/track" className="flex items-center gap-4 p-4 bg-muted/30 border border-border rounded-xl hover:bg-muted/50 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground group-hover:text-[#BEF264]">
                     <Activity size={20} />
                  </div>
                   <div className="flex flex-col">
                      <span className="text-xs font-black uppercase tracking-tight">Deep Scan</span>
                      <span className="text-[10px] text-muted-foreground font-medium">Verify market saturation</span>
                   </div>
               </Link>
            </div>
        </div>

        {/* ─── 04 Recent Strategic Captures (Dense List) ────────────────── */}
        <div className="bg-card border border-border rounded-2xl flex flex-col shadow-sm max-h-[500px]">
           <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                 <Bookmark size={14} className="text-[#BEF264]" /> Recent Vault Assets
              </h2>
              <Link to="/dashboard/saved" className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                 <ExternalLink size={14} className="text-muted-foreground" />
              </Link>
           </div>
           
           <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {loading ? (
                Array(5).fill(0).map((_, i) => <div key={i} className="h-14 bg-muted animate-pulse rounded-lg m-2" />)
              ) : tracked.length === 0 ? (
                <div className="py-12 px-4 text-center">
                   <p className="text-[10px] font-black text-muted-foreground uppercase opacity-40">System Vault Empty</p>
                </div>
              ) : (
                tracked.slice(0, 6).map(p => (
                  <div key={p.id} className="group flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl transition-all">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-white border border-border overflow-hidden shrink-0 p-1 flex items-center justify-center">
                        <img src={p.image} alt="" className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-[13px] text-foreground truncate max-w-[120px]" title={p.title}>{p.title}</span>
                        <div className="flex items-center gap-2">
                           <span className={`text-[8px] font-black uppercase tracking-widest ${p.platform === 'eBay' ? 'text-[#BEF264]' : 'text-blue-400'}`}>{p.platform}</span>
                           <span className="text-[8px] font-bold text-muted-foreground/40 tabular-nums">${(p.price || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/dashboard/track?url=${encodeURIComponent(p.url)}`} className="p-2 text-muted-foreground hover:text-foreground hover:bg-card rounded-lg border border-transparent hover:border-border transition-all">
                        <BarChart3 size={12} />
                      </Link>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
           </div>
           
           <Link to="/dashboard/saved" className="m-4 p-3 bg-muted/50 rounded-xl text-center text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-colors">
              Access Full Secure Vault
           </Link>
        </div>
      </div>

    </div>
  )
}
