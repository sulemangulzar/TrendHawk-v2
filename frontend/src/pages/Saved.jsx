import { useEffect, useState } from 'react'
import { getSaved, deleteSaved, getUsage } from '../lib/api'
import { useDashboard } from '../context/DashboardContext'
import { Bookmark, Trash2, ExternalLink, Package, ShieldCheck, Activity } from 'lucide-react'
import toast from 'react-hot-toast'

let savedCache = null;
let usageCache = { savedCount: 0, savedLimit: 5 };

export default function Saved() {
  const {  } = useDashboard()
  const [products, setProducts] = useState(savedCache || [])
  const [usage, setUsage] = useState(usageCache)
  const [loading, setLoading] = useState(!savedCache)

  const load = () => {
    if (!savedCache) setLoading(true)
    
    Promise.all([getSaved(), getUsage()])
      .then(([s, u]) => { 
        savedCache = s.products || [];
        usageCache = u;
        setProducts(savedCache)
        setUsage(usageCache)
      })
      .finally(() => {
        setLoading(false)
        
      })
  }
  
  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Permanently remove this asset from your vault?')) return
    await deleteSaved(id).catch(() => {})
    toast.success('Asset Purged')
    load()
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-8 pb-12 animate-in fade-in duration-500 font-poppins">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text)]">Intelligence Vault</h1>
          <p className="text-[var(--text2)] mt-1">Your secure repository of high-velocity marketplace opportunities.</p>
        </div>
        
        {/* Storage Metric */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 flex items-center gap-4 shadow-sm min-w-[280px]">
          <div className="w-10 h-10 rounded-lg bg-[var(--lime-dim)] flex items-center justify-center text-[var(--text)]">
            <Bookmark size={20} strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-wider">Vault Capacity</span>
              <span className="text-xs font-bold text-[var(--text)]">{usage.savedCount || 0} / {usage.savedLimit || 0}</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--bg)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--lime)] rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(((usage.savedCount || 0) / (usage.savedLimit || 1)) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-32 text-center flex flex-col items-center justify-center">
          <RefreshCw size={32} className="animate-spin text-[var(--text3)] opacity-20 mb-4" />
          <span className="text-xs font-bold tracking-widest text-[var(--text3)] uppercase">Synchronizing Archives...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="py-32 text-center bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-2xl">
          <Bookmark size={48} className="mx-auto text-[var(--text3)] opacity-20 mb-6" />
          <h3 className="text-lg font-bold text-[var(--text)] mb-2">Vault Archives Empty</h3>
          <p className="text-[var(--text3)] max-w-sm mx-auto text-sm italic">Analyze marketplace breakthroughs to start populating your secure intelligence repository.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
          {products.map(p => (
            <div key={p.id} className="group relative flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--lime-border)] transition-all duration-300 shadow-sm h-full">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-[var(--border)] mb-5 p-4 flex items-center justify-center shadow-sm group-hover:scale-[1.02] transition-transform duration-500">
                {p.image ? (
                  <img src={p.image} alt={p.title} className="w-full h-full object-contain" />
                ) : (
                  <Package className="text-[var(--text3)]" size={32} strokeWidth={1} />
                )}
                
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                  {p.url && (
                    <a 
                      href={p.url} target="_blank" rel="noopener noreferrer" 
                      className="w-10 h-10 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-lg flex items-center justify-center hover:bg-[var(--hover-bg)] transition-all shadow-md"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                  <button 
                    onClick={() => handleDelete(p.id)} 
                    className="w-10 h-10 bg-[var(--text)] text-[var(--bg)] rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-md"
                  >
                    <Trash2 size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col">
                <h3 className="text-sm font-bold text-[var(--text)] line-clamp-2 leading-tight mb-4 min-h-[2.5rem]" title={p.title}>
                  {p.title}
                </h3>
                
                <div className="flex items-center gap-2 mb-5">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight border ${
                    p.platform === 'ebay' 
                      ? 'bg-[var(--lime-dim)] text-[var(--text)] border-[var(--lime-border)]' 
                      : 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20'
                  }`}>
                    {p.platform}
                  </span>
                  <span className="text-[10px] text-[var(--text3)] font-bold uppercase tracking-tight shrink-0">
                    {new Date(p.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-[var(--border)]">
                   <span className="text-xl font-bold text-[var(--text)] tracking-tight tabular-nums">
                    <span className="text-[var(--text3)] text-xs mr-0.5">$</span>{p.price?.toFixed(2) || '0.00'}
                  </span>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--hover-bg)] border border-[var(--border)]">
                    <ShieldCheck size={12} className="text-[var(--lime)]" strokeWidth={2.5} />
                    <span className="text-[10px] font-bold text-[var(--text)] uppercase tracking-wider">Secured</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RefreshCw(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  )
}
