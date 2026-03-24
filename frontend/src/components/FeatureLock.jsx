/**
 * FeatureLock — Tier-gating wrapper component
 * Blurs children and shows a padlock overlay when the user doesn't have access.
 * On click → opens UpsellModal.
 *
 * Usage:
 *   <FeatureLock requiredPlan="pro" currentPlan={usage.plan} featureName="Price History">
 *     <PriceChart ... />
 *   </FeatureLock>
 */
import { useState } from 'react'
import { Lock, Zap } from 'lucide-react'
import UpsellModal from './UpsellModal'

const PLAN_RANK = { free: 0, basic: 1, pro: 2, growth: 3, admin: 99 }

export default function FeatureLock({
  children,
  requiredPlan = 'pro',
  currentPlan = 'free',
  featureName = '',
  className = '',
}) {
  const [modalOpen, setModalOpen] = useState(false)

  const hasAccess =
    currentPlan === 'admin' ||
    (PLAN_RANK[currentPlan] ?? 0) >= (PLAN_RANK[requiredPlan] ?? 99)

  if (hasAccess) return <>{children}</>

  const planLabels = { basic: 'Basic', pro: 'Pro', growth: 'Growth' }
  const planLabel = planLabels[requiredPlan] || 'Pro'

  return (
    <>
      <div
        className={`relative rounded-2xl overflow-hidden cursor-pointer group ${className}`}
        onClick={() => setModalOpen(true)}
      >
        {/* Blurred content */}
        <div className="pointer-events-none select-none" style={{ filter: 'blur(6px)', opacity: 0.4 }}>
          {children}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0f]/60 backdrop-blur-[2px] transition-all group-hover:bg-[#0a0a0f]/70">
          <div className="flex flex-col items-center gap-3 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-lg shadow-cyan-500/10 group-hover:scale-105 transition-transform">
              <Lock size={22} className="text-cyan-400" />
            </div>
            {featureName && (
              <p className="text-sm font-black text-white leading-tight">{featureName}</p>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-black tracking-wider uppercase">
              <Zap size={11} />
              Requires {planLabel} Plan
            </span>
            <p className="text-xs text-zinc-500 max-w-[180px] leading-tight">
              Click to see upgrade options
            </p>
          </div>
        </div>
      </div>

      <UpsellModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        requiredPlan={requiredPlan}
        featureName={featureName}
      />
    </>
  )
}
