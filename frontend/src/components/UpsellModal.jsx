/**
 * UpsellModal — Premium upgrade prompt modal
 * Shown when a user clicks a locked/gated feature.
 * Displays tier comparison and CTAs.
 */
import { useEffect } from 'react'
import { X, Zap, Lock, Check, ArrowRight } from 'lucide-react'

const TIERS = [
  {
    id: 'pro',
    name: 'Professional',
    price: '$15',
    period: '/mo',
    color: 'text-[#84CC16]',
    border: 'border-[#BEF264]/30',
    bg: 'bg-[#BEF264]/5',
    badge: 'Most Popular',
    features: [
      '50 Intelligence Searches/mo',
      '50 Product Save Slots',
      'Full Supplier Network Access',
      'Global Heatmap Velocity',
      'Neural Price History',
      'Calculator Intelligence',
    ],
  },
  {
    id: 'growth',
    name: 'Elite',
    price: '$29',
    period: '/mo',
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/5',
    features: [
      '110 Intelligence Searches/mo',
      '1,000 Product Save Slots',
      'Priority Data Extraction',
      'Bulk Intelligence Export',
      'Advanced Sourcing Protocols',
      'Elite Trend Signals',
    ],
  },
]

export default function UpsellModal({ isOpen, onClose, requiredPlan = 'pro', featureName = '' }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const highlight = TIERS.find(t => t.id === requiredPlan) || TIERS[1]

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
    >
      {/* Backdrop (Finto Style) */}
      <div 
        className="absolute inset-0 bg-white/40 backdrop-blur-2xl animate-in fade-in duration-500" 
        onClick={onClose}
      />

      {/* Modal (Finto Style) */}
      <div className="relative z-10 w-full max-w-4xl bg-white border border-[#E5E7EB] rounded-[4rem] shadow-[0_60px_120px_-20px_rgba(0,0,0,0.1)] animate-in zoom-in-95 fade-in slide-in-from-bottom-8 duration-500 overflow-hidden font-inter text-[#111827]">
        
        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#BEF264]" />

        {/* Header */}
        <div className="relative px-12 pt-16 pb-12 border-b border-[#F9FAFB]">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] text-[#111827] flex items-center justify-center hover:bg-[#111827] hover:text-white transition-all group"
          >
            <X size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
          </button>
          
          <div className="flex items-center gap-6 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-[#BEF264]/10 border border-[#BEF264]/20 flex items-center justify-center text-[#84CC16] shadow-sm">
              <Lock size={22} strokeWidth={3} />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-[0.4em] text-[#84CC16] uppercase mb-1">Restricted Protocol</p>
              <h2 className="text-4xl font-black text-[#111827] tracking-tighter uppercase leading-none">
                {featureName ? `Unlock ${featureName}` : 'Upgrade Intelligence'}
              </h2>
            </div>
          </div>
          <p className="text-zinc-500 text-lg font-medium leading-relaxed max-w-2xl">
            This high-velocity feature requires the <span className="text-[#111827] font-black underline decoration-[#BEF264] decoration-4 underline-offset-4 capitalize">{requiredPlan}</span> operative tier. Expand your capabilities below.
          </p>
        </div>

        {/* Tier Cards (Finto Style) */}
        <div className="p-12 grid grid-cols-1 sm:grid-cols-3 gap-8 bg-[#F9FAFB]/30">
          {TIERS.map((tier) => {
            const isHighlighted = tier.id === requiredPlan
            return (
              <div
                key={tier.id}
                className={`relative rounded-[2.5rem] border p-8 transition-all duration-500 hover:-translate-y-1 ${
                  isHighlighted
                    ? 'border-[#BEF264] bg-white shadow-[0_30px_60px_-15px_rgba(190,242,100,0.2)] scale-[1.05] z-10'
                    : 'border-[#E5E7EB] bg-white group hover:border-[#BEF264]'
                }`}
              >
                {tier.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-5 py-1 text-[9px] font-black tracking-widest uppercase bg-[#111827] text-white rounded-full shadow-lg border border-white">
                    {tier.badge}
                  </span>
                )}

                <div className="mb-8">
                  <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-4 text-zinc-300">{tier.name} Operative</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-[#111827] tracking-tighter tabular-nums">{tier.price}</span>
                    <span className="text-xs text-zinc-400 font-black uppercase tracking-widest">{tier.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-10 border-t border-[#F9FAFB] pt-8">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-1 w-4 h-4 rounded-full bg-[#BEF264]/20 border border-[#BEF264]/30 flex items-center justify-center shrink-0">
                         <Check size={10} strokeWidth={4} className="text-[#84CC16]" />
                      </div>
                      <span className="text-[11px] font-black text-zinc-400 leading-tight uppercase group-hover:text-[#111827] transition-colors">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-4 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all flex items-center justify-center gap-3 shadow-sm ${
                    isHighlighted
                      ? 'bg-[#84CC16] hover:bg-[#BEF264] text-[#111827] shadow-xl shadow-[#BEF264]/20'
                      : 'bg-[#F9FAFB] hover:bg-[#111827] text-[#111827] hover:text-white border border-[#E5E7EB]'
                  }`}
                >
                  {isHighlighted ? (
                    <>Initialize <ArrowRight size={14} strokeWidth={3} /></>
                  ) : (
                    <>Select Tier</>
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-12 pb-10 text-center">
          <p className="text-[10px] text-zinc-300 font-black uppercase tracking-[0.4em]">
            Institutional Billing · Encrypted Transactions · Cancel Any Cycle
          </p>
        </div>
      </div>
    </div>
  )
}
