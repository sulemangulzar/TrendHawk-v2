import { Check, Zap, MoveRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PricingCard({ plan }) {
  const isMostPopular = plan.id === 'pro'

  return (
    <div className={`relative flex flex-col bg-card rounded-3xl p-8 border transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${
      isMostPopular 
        ? 'border-primary shadow-lg shadow-primary/10' 
        : 'border-border hover:border-muted-foreground/30'
    }`}>
      {isMostPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-[9px] font-black text-primary-foreground uppercase tracking-[0.2em] rounded-full shadow-lg">
          Most Popular
        </div>
      )}

      <div className="mb-8">
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-4">{plan.name}</div>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-4xl sm:text-5xl font-black tracking-tighter text-foreground">
            {plan.price === 0 ? 'Free' : `$${plan.price}`}
          </span>
          {plan.price > 0 && <span className="text-base text-muted-foreground font-black">/mo</span>}
        </div>
        <p className="text-xs text-muted-foreground font-medium leading-relaxed">{plan.desc}</p>
        
        <div className="flex items-center gap-3 mt-6 p-3.5 rounded-xl bg-muted border border-border">
          <div className="w-7 h-7 rounded-lg bg-[#09090b] flex items-center justify-center shadow-sm">
            <Zap className="w-3.5 h-3.5 text-primary" strokeWidth={3} fill="currentColor" />
          </div>
          <span className="text-[13px] font-black text-foreground leading-none">{plan.credits} intelligence credits</span>
        </div>
      </div>

      <ul className="space-y-4 mb-10 flex-1 pt-6 border-t border-border">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-4">
            <div className="mt-0.5 w-4 h-4 rounded-full bg-[#09090b] flex items-center justify-center shrink-0 shadow-sm">
              <Check className="w-2.5 h-2.5 text-primary" strokeWidth={4} />
            </div>
            <span className="text-[13px] text-muted-foreground font-medium leading-tight">{f}</span>
          </li>
        ))}
      </ul>

      <Link 
        to="/login"
        className={`btn w-full py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all text-center flex items-center justify-center gap-2 ${
          plan.soon 
            ? 'bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-50' 
            : isMostPopular
              ? 'btn-primary'
              : 'btn-ghost border border-border bg-transparent text-foreground hover:bg-muted'
        }`}
      >
        {plan.cta}
        {!plan.soon && <MoveRight size={14} strokeWidth={3} />}
      </Link>
    </div>
  )
}
