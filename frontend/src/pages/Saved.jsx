import { useEffect, useState } from 'react'
import { getSaved, deleteSaved, getUsage } from '../lib/api'
import { Bookmark, Trash2, ExternalLink, Package, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Saved() {
  const [products, setProducts] = useState([])
  const [usage, setUsage] = useState({ savedCount: 0, savedLimit: 5 })
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    Promise.all([getSaved(), getUsage()])
      .then(([s, u]) => { 
        setProducts(s.products || [])
        setUsage(u)
      })
      .finally(() => setLoading(false))
  }
  
  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Permanently remove this asset from your vault?')) return
    await deleteSaved(id).catch(() => {})
    toast.success('Asset Purged', {
      className: 'bg-card border border-border text-foreground font-poppins text-xs font-black'
    })
    load()
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 pb-12 font-poppins text-foreground">
      
      {/* Header section (Compact SaaS Style) */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-foreground text-[8px] font-black tracking-[0.2em] uppercase shadow-sm">
            <Bookmark size={10} className="animate-pulse" strokeWidth={3} /> <span className="text-primary">Intelligence Archive Online</span>
          </div>
          <h1 className="text-2xl font-black tracking-tighter leading-none">Intelligence Vault</h1>
          <p className="text-muted-foreground text-xs font-medium max-w-2xl leading-relaxed mt-2">
            Your encrypted repository of high-velocity marketplace opportunities and strategic assets.
          </p>
        </div>
        
        {/* Storage Telemetry */}
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm min-w-[240px]">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-[#111827] shadow-md shadow-primary/20">
            <Bookmark size={18} strokeWidth={3} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">STORAGE CAP</span>
              <span className="text-[11px] font-black text-foreground">{usage.savedCount} / {usage.savedLimit}</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border p-px">
              <div 
                className="h-full bg-[#BEF264] shadow-[0_0_10px_rgba(204,255,0,0.4)] rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((usage.savedCount / usage.savedLimit) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin mb-6 shadow-sm" />
          <span className="text-[9px] font-black tracking-[0.4em] text-muted-foreground uppercase">SYNCHRONIZING VAULT...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center bg-card border border-dashed border-border rounded-3xl group transition-colors duration-500">
          <div className="w-16 h-16 bg-muted rounded-2xl border border-border flex items-center justify-center mb-6 mx-auto text-muted-foreground group-hover:bg-primary group-hover:text-[#111827] transition-all duration-500 shadow-sm">
            <Bookmark size={24} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-black text-foreground mb-3 uppercase tracking-tighter">VAULT ARCHIVES VOID</h3>
          <p className="text-muted-foreground text-[11px] font-medium max-w-sm mx-auto italic leading-relaxed px-4">Analyze marketplace breakthroughs to start populating your secure intelligence repository.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {products.map(p => (
            <div key={p.id} className="group relative flex flex-col bg-card border border-border rounded-xl p-4 hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-md h-full">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-border mb-4 p-4 flex items-center justify-center shadow-sm">
                {p.image ? (
                  <img src={p.image} alt={p.title} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100" />
                ) : (
                  <Package className="w-12 h-12 text-muted" strokeWidth={1.5} />
                )}
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
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
                  <button 
                    onClick={() => handleDelete(p.id)} 
                    className="w-8 h-8 bg-foreground text-background rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-md"
                  >
                    <Trash2 size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col">
                <h3 className="text-[13px] font-black text-foreground line-clamp-2 leading-snug mb-3 group-hover:text-primary transition-colors min-h-[2.5rem]" title={p.title}>
                  {p.title}
                </h3>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border shadow-sm ${
                    p.platform === 'ebay' 
                      ? 'bg-primary/10 text-primary border-primary/30' 
                      : 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
                  }`}>
                    {p.platform}
                  </span>
                  <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest shrink-0">
                    SAVED {new Date(p.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/50">
                   <span className="text-xl font-black text-foreground tracking-tighter tabular-nums">
                    <span className="text-primary text-[13px] mr-1">$</span>{p.price?.toFixed(2) || '0.00'}
                  </span>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20">
                    <ShieldCheck size={10} className="text-primary" strokeWidth={3} />
                    <span className="text-[8px] font-black text-foreground uppercase tracking-[0.2em]">SECURED</span>
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
