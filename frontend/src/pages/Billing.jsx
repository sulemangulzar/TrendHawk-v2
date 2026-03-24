import { CreditCard, Lock, Check, Zap } from 'lucide-react'

const PLANS = [
  { id: 'free', name: 'Baseline Intelligence', price: 0, credits: 2, tracked: 3, features: ['Unlimited feature access', 'eBay & Etsy scraping', 'Capital profit modeling', 'Trend scoring (0-100)'], cta: 'Active Allocation', live: true },
  { id: 'basic', name: 'Basic Operative', price: 5, credits: 10, tracked: 10, features: ['10 analysis credits/mo', 'Track up to 10 products', 'Core trend intelligence'], cta: 'Coming Soon', live: false },
  { id: 'pro', name: 'Professional Vanguard', price: 9, credits: 20, tracked: 25, features: ['20 analysis credits/mo', 'Track up to 25 products', 'Full competitive analysis'], cta: 'Coming Soon', popular: true, live: false },
  { id: 'growth', name: 'Enterprise Growth', price: 15, credits: 35, tracked: 50, features: ['35 analysis credits/mo', 'Track up to 50 products', 'Export analytics (CSV)'], cta: 'Coming Soon', live: false },
]

export default function Billing() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 pb-12 font-poppins text-foreground">
      
      {/* Header section (Compact SaaS Style) */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className="space-y-3 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-foreground text-[8px] font-black tracking-[0.2em] uppercase shadow-sm">
            <CreditCard size={10} strokeWidth={4} /> Restricted Capital Architecture
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter leading-none">Capital Tiers</h1>
          <p className="text-muted-foreground text-xs font-medium max-w-lg mx-auto leading-relaxed">
            Scale your intelligence with precise credit allocations tailored for high-velocity marketplace operations.
          </p>
        </div>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10 rounded-full shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[8px] font-black text-foreground uppercase tracking-[0.2em]">Network Phase: Internal Beta · External Billing Restricted</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map(plan => (
          <div key={plan.id} className={`group relative flex flex-col bg-card border border-border rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 h-full ${
            plan.popular 
            ? 'border-primary/50 shadow-md' 
            : 'hover:border-primary/30 shadow-sm hover:shadow-md'
          }`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foreground text-background px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.3em] shadow-md border border-border/50">
                Recommended
              </div>
            )}
            
            <div className="mb-6">
              <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2">{plan.name}</div>
              <div className="flex items-baseline gap-1 relative">
                <span className="text-3xl font-black text-foreground tracking-tighter tabular-nums drop-shadow-sm">
                  {plan.price === 0 ? 'Comp' : `$${plan.price}`}
                </span>
                {plan.price > 0 && <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">/ mo</span>}
              </div>
              <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-muted rounded-xl border border-border w-fit">
                <Zap size={12} className="text-primary" strokeWidth={3} />
                <span className="text-[9px] font-black text-foreground uppercase tracking-widest">{plan.credits} Units</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8 flex-1 border-t border-border/50 pt-6">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-3">
                  <div className="mt-0.5 w-4 h-4 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Check size={10} strokeWidth={4} className="text-primary" />
                  </div>
                  <span className="text-[11px] font-black text-muted-foreground leading-tight uppercase tracking-tight group-hover:text-foreground transition-colors">{f}</span>
                </li>
              ))}
            </ul>

            <button 
              className={`h-12 w-full rounded-xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:scale-[1.02] ${
                plan.id === 'free' 
                ? 'bg-foreground text-background shadow-md shadow-foreground/10' 
                : 'bg-muted text-muted-foreground border border-border cursor-not-allowed'
              }`}
              disabled={!plan.live}
            >
              {plan.id === 'free' ? (
                <>Baseline Provisioned</>
              ) : (
                <>
                  Tier Locked <Lock size={12} strokeWidth={3} />
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
