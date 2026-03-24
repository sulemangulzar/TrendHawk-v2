import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PricingCard from '../components/PricingCard'
import { 
  ArrowRight, TrendingUp, Target, Package, Bookmark, 
  Calculator, Globe, Flame, Sparkles, Search, 
  BarChart3, ShieldCheck, Zap, Check, ChevronRight, 
  Eye, Brain, DollarSign, Database, MoveRight
} from 'lucide-react'

/* ─── Data ─────────────────────────────────────────────────── */

const STRATEGY_CARDS = [
  {
    icon: TrendingUp,
    title: 'Real-time Data & Signals',
    desc: 'Deep-scrape eBay and Etsy simultaneously. Get market trends, sell-through rates, and competitive data in seconds.',
    bullets: ['Live market snapshots', 'Demand velocity tracking', 'Saturation analysis']
  },
  {
    icon: Eye,
    title: 'Competitor Store Scout',
    desc: 'Reverse engineer successful sellers. Find their winning products and see what is actually moving in real-time.',
    bullets: ['Seller revenue estimates', 'Hidden winning products', 'Storefront intelligence']
  },
  {
    icon: Brain,
    title: 'AI Product Intel',
    desc: 'Our neural engine identifies patterns in reviews and listings to tell you exactly WHY a product is selling.',
    bullets: ['Sentiment extraction', 'Feature gap detection', 'Painless sourcing']
  },
  {
    icon: Calculator,
    title: 'ROI Precision Engine',
    desc: 'Advanced fee calculations for all platforms. Know your real net profit before you commit to inventory.',
    bullets: ['Multi-platform fee mapping', 'Shipping cost estimation', 'Ad spend modeling']
  }
]

const PLANS = [
  {
    id: 'free',
    name: 'Starter Tier',
    price: 0,
    desc: 'Get a taste of TrendHawk intelligence',
    credits: 2,
    features: ['2 product analyses/mo', 'Trending products access', 'Basic profit engine', 'Track 3 products', 'Product Vault (5 slots)'],
    cta: 'Start Free'
  },
  {
    id: 'basic',
    name: 'Professional',
    price: 5,
    desc: 'For side-hustlers testing the waters',
    credits: 10,
    features: ['10 analyses/mo', 'Live keyword search', 'Calculator presets', 'Track 10 products', 'Product Vault (20 slots)'],
    cta: 'Coming Soon',
    soon: true
  },
  {
    id: 'pro',
    name: 'Business Pro',
    price: 9,
    desc: 'For serious sellers scaling up coverage',
    credits: 20,
    features: ['20 analyses/mo', 'Interactive Price History', 'Saturation signals', 'Track 25 products', 'Product Vault (50 slots)'],
    cta: 'Coming Soon',
    soon: true
  },
  {
    id: 'growth',
    name: 'Enterprise',
    price: 15,
    desc: 'For high-volume sellers & agencies',
    credits: 35,
    features: ['35 analyses/mo', 'Store Spy (Alpha)', 'Priority scraping', 'Track 50 products', 'Unlimited Vault storage'],
    cta: 'Coming Soon',
    soon: true
  }
]

/* ─── Main Export ───────────────────────────────────────────── */
export default function Landing() {
  const scrollAction = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="relative min-h-screen bg-background selection:bg-primary/40 text-foreground font-inter">
      <Header />

      <main>
        {/* ── Section A: Hero (Finto Style) ────────────────── */}
        <section className="relative pt-24 pb-20 lg:pt-36 lg:pb-32 overflow-hidden bg-background">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-10 grid lg:grid-cols-2 gap-20 items-center">
            
            {/* Left Content */}
            <div className="space-y-8 animate-finto-in">
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#09090b] text-primary text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/10">
                <Sparkles size={12} className="text-primary" />
                Alpha Release • Market Intelligence
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter leading-[0.95] text-foreground">
                Global Trend Data <br/>
                <span className="text-muted-foreground/40 italic">to Grow Your</span> <br/>
                E-commerce.
              </h1>
              
              <p className="max-w-xl text-base sm:text-lg text-muted-foreground font-medium leading-relaxed">
                Identify winning products before they saturate the market. Harness real-time marketplace intelligence from eBay, Etsy, and global suppliers to scale your business with data-driven certainty.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <Link to="/login" className="btn-primary btn w-full sm:w-auto px-8 py-4 text-xs font-black uppercase tracking-[0.2em] group">
                  Get Started 
                  <div className="ml-3 w-5 h-5 rounded-full bg-[#111827] flex items-center justify-center transition-transform group-hover:translate-x-1">
                    <ArrowRight size={12} className="text-[#BEF264]" strokeWidth={4} />
                  </div>
                </Link>
                <Link to="/login" className="btn-ghost btn w-full sm:w-auto px-8 py-4 text-xs font-black uppercase tracking-[0.2em] bg-transparent border border-border text-foreground hover:bg-muted/50">
                  Contact Sales
                </Link>
              </div>

              <div className="flex items-center gap-8 pt-6">
                <div className="flex flex-col gap-1">
                  <div className="text-2xl font-black text-foreground">1.2M+</div>
                  <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Products Tracked</div>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="flex flex-col gap-1">
                  <div className="text-2xl font-black text-[#CCFF00] bg-[#09090b] px-2 py-0.5 rounded-lg w-fit shadow-lg">85%</div>
                  <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Trend Accuracy</div>
                </div>
              </div>
            </div>

            {/* Right Mockup (Finto Style) */}
            <div className="relative animate-finto-in [animation-delay:200ms]">
               {/* Decorative Gradient Blob */}
               <div className="absolute -top-[20%] -right-[10%] w-[120%] h-[120%] bg-gradient-to-br from-primary/30 to-transparent blur-[120px] rounded-full pointer-events-none -z-10" />
               
               {/* Main Card */}
               <div className="relative rounded-[2rem] bg-card border border-border p-8 shadow-2xl">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center">
                        <Package size={20} className="text-foreground" />
                      </div>
                      <div>
                        <div className="text-[13px] font-black text-foreground">Titanium Ceramic Watch</div>
                        <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Market Status: Breakout</div>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#09090b] text-primary text-[9px] font-black uppercase tracking-widest shadow-md">
                      <Zap size={10} fill="currentColor" strokeWidth={0} /> Live Signal
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="space-y-1">
                      <div className="text-3xl font-black text-foreground tracking-tighter">$142,502</div>
                      <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Est. Monthly Profit</div>
                    </div>
                    <div className="space-y-1 text-right">
                      <div className="flex justify-end">
                        <div className="text-3xl font-black text-primary tracking-tighter bg-[#09090b] px-3 py-1 rounded-xl shadow-lg">64.2%</div>
                      </div>
                      <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Net Margin</div>
                    </div>
                  </div>

                  {/* Micro Chart */}
                  <div className="h-28 w-full bg-muted/30 rounded-2xl border border-border p-5 relative overflow-hidden group">
                     <div className="absolute top-3 left-5 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Price Velocity (24H)</div>
                     <div className="absolute bottom-4 left-5 right-5 flex items-end gap-1.5 h-10">
                        {[40, 60, 45, 90, 65, 85, 52, 95, 75, 88].map((h, i) => (
                          <div 
                            key={i} 
                            className="flex-1 bg-primary hover:bg-primary/80 transition-all rounded-t-sm" 
                            style={{ height: `${h}%` }} 
                          />
                        ))}
                     </div>
                  </div>

                  {/* Floating Metric */}
                  <div className="absolute -bottom-6 -left-10 bg-[#111827] text-white p-5 rounded-2xl shadow-2xl animate-bounce duration-[4000ms]">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-xl bg-[#BEF264] flex items-center justify-center text-[#111827]">
                          <Zap size={16} fill="currentColor" />
                       </div>
                       <div>
                          <div className="text-xs font-black uppercase tracking-widest text-[#9CA3AF]">ROI Potential</div>
                          <div className="text-lg font-black text-white">184%</div>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* ── Section C: Social Proof (Finto Style) ──────────────────── */}
        <section className="py-12 bg-muted border-y border-border">
          <div className="max-w-[1440px] mx-auto px-6 flex flex-wrap items-center justify-between gap-10">
             <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] w-full lg:w-auto text-center lg:text-left">
               Trusted by 500+ Dropshippers
             </div>
             <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 grayscale opacity-40 hover:opacity-100 transition-opacity flex-1">
               {[
                 { label: 'ebay', icon: Globe },
                 { label: 'etsy', icon: Sparkles },
                 { label: 'amazon', icon: Package },
                 { label: 'tiktok shop', icon: Zap },
                 { label: 'walmart', icon: Target }
               ].map(logo => (
                 <div key={logo.label} className="flex items-center gap-2">
                   <logo.icon className="w-4 h-4 text-foreground" strokeWidth={3} />
                   <span className="text-lg font-black tracking-tighter text-foreground uppercase">{logo.label}</span>
                 </div>
               ))}
             </div>
          </div>
        </section>

        {/* ── Section D: Strategy Bento Grid (Finto Style) ─────────── */}
        <section id="features" className="py-20 lg:py-32 bg-background">
           <div className="max-w-[1440px] mx-auto px-6 sm:px-10">
              <div className="max-w-3xl mb-20 space-y-6">
                <div className="inline-block px-4 py-1.5 rounded-full bg-[#09090b] text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-6 shadow-lg">
                  Market Intelligence
                </div>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-foreground leading-[1.05]">
                  Optimize Your E-commerce <br/>
                  <span className="text-muted-foreground/50 italic">Strategy.</span>
                </h2>
                <p className="text-muted-foreground text-base sm:text-lg max-w-xl font-medium leading-relaxed">
                  Manual research is dead. Use our neural infrastructure to find winning products and scale your store with data.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                {STRATEGY_CARDS.map((card, idx) => (
                  <div 
                    key={card.title} 
                    className={`card group !p-8 lg:!p-10 ${
                      idx % 2 !== 0 ? 'md:translate-y-12' : ''
                    }`}
                  >
                    {/* Floating Accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                    
                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground mb-8 group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
                      <card.icon size={28} strokeWidth={3} />
                    </div>
                    
                    <h3 className="text-xl font-black text-foreground mb-4 tracking-tight">{card.title}</h3>
                    <p className="text-sm text-muted-foreground font-medium mb-8 leading-relaxed max-w-sm">
                      {card.desc}
                    </p>
                    
                    <ul className="space-y-3 pt-6 border-t border-border">
                       {card.bullets.map(b => (
                         <li key={b} className="flex items-center gap-3 text-xs font-black text-foreground/60">
                           <div className="w-4 h-4 rounded-full bg-[#09090b] flex items-center justify-center shadow-sm">
                              <Check size={10} className="text-primary" strokeWidth={4} /> 
                           </div>
                           {b}
                         </li>
                       ))}
                    </ul>

                    {/* Finto Style Hover Indicator */}
                    <div className="mt-8 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-foreground opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-500">
                      Learn More <MoveRight size={14} strokeWidth={3} />
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </section>

        {/* ── Section E: Breakout Discovery (Finto Style) ─────── */}
        <section className="py-20 lg:py-32 bg-background border-y border-border">
           <div className="max-w-[1440px] mx-auto px-6 sm:px-10">
             <div className="flex flex-col lg:flex-row items-center gap-20 lg:gap-24">
                <div className="flex-1 space-y-8 animate-finto-in">
                   <div className="inline-block px-4 py-1.5 rounded-full bg-[#09090b] text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-6 shadow-lg">
                      The Edge
                   </div>
                   <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.05]">
                      Spot Breakout <br/>
                      <span className="text-muted-foreground/40 italic">Opportunities Fast.</span>
                   </h2>
                   <p className="text-muted-foreground text-base sm:text-lg font-medium leading-relaxed max-w-xl">
                     Scan millions of listings across eBay and Etsy daily. Identify \"demand spikes\" before they become saturated in your local market.
                   </p>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                     {[
                       { title: 'eBay Breakthroughs', desc: 'Identify spikes in bidding activity.' },
                       { title: 'Etsy Handcrafted Edge', desc: 'Discover trending artisanal niches.' },
                       { title: 'Global Supply Nodes', desc: 'Direct access to high-velocity makers.' }
                     ].map(item => (
                       <div key={item.title} className="p-6 rounded-2xl bg-muted/50 border border-border group hover:border-primary transition-all">
                          <h4 className="text-sm font-black text-foreground mb-1">{item.title}</h4>
                          <p className="text-xs text-muted-foreground font-medium">{item.desc}</p>
                       </div>
                     ))}
                   </div>
                   <button onClick={() => scrollAction('features')} className="btn-primary btn group">
                     Explore Intelligence 
                     <div className="ml-3 w-5 h-5 rounded-full bg-foreground flex items-center justify-center transition-transform group-hover:translate-x-1">
                        <ArrowRight size={12} className="text-primary" strokeWidth={4} />
                     </div>
                   </button>
                </div>

                <div className="flex-1 w-full lg:w-auto">
                    <div className="card w-full aspect-square md:aspect-video flex items-center justify-center relative overflow-hidden group">
                       <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent group-hover:opacity-100 transition-opacity" />
                       <div className="relative z-10 w-full p-6 sm:p-12">
                          <div className="grid grid-cols-2 gap-4">
                             {[
                               { name: 'Ceramic Matcha Set', velocity: '+241%', status: 'Breakout' },
                               { name: 'Ergonomic Footrest', velocity: '+89%', status: 'Surging' },
                               { name: 'Bamboo Keycap Set', velocity: '+112%', status: 'Hot' },
                               { name: 'Minimalist Desk Mat', velocity: '+45%', status: 'Steady' }
                             ].map((item, idx) => (
                               <div key={idx} className="rounded-2xl bg-background border border-border p-4 shadow-sm group-hover:border-primary transition-colors flex flex-col justify-between h-28 relative overflow-hidden">
                                  {/* Minimalist chart background */}
                                  <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-primary/10 to-transparent" />
                                  <div className="absolute bottom-0 left-0 right-0 h-px bg-primary/20" />
                                  
                                  <div className="relative z-10 flex items-start justify-between mb-2">
                                     <div className="w-8 h-8 rounded-lg bg-[#09090b] flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                       <TrendingUp size={14} strokeWidth={3} />
                                     </div>
                                     <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-[#09090b] px-2 py-0.5 rounded-full ring-1 ring-primary/20 shadow-sm">{item.status}</span>
                                  </div>
                                  <div className="relative z-10">
                                    <div className="text-xs font-bold text-foreground truncate mb-0.5">{item.name}</div>
                                    <div className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-1">
                                      Vel: <span className="text-primary bg-[#09090b] px-1.5 py-0.5 rounded-md shadow-sm">{item.velocity}</span>
                                    </div>
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>
             </div>
           </div>
        </section>

        {/* ── Section F: Module Ecosystem (Finto Style) ────────── */}
        <section id="marketplaces" className="py-20 lg:py-32 bg-background">
           <div className="max-w-[1440px] mx-auto px-6 sm:px-10 text-center space-y-16">
              <div className="max-w-2xl mx-auto space-y-4">
                  <div className="inline-block px-4 py-1.5 rounded-full bg-[#09090b] text-primary text-[10px] font-black uppercase tracking-[0.4em] shadow-lg">
                    Module Ecosystem
                  </div>
                 <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.05]">
                   Everything You Need <br/>
                   <span className="text-muted-foreground/40 italic">To Scale.</span>
                 </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                 {[
                   { icon: DollarSign, title: 'Profit Forge', desc: 'Precise fee calculations for eBay, Etsy, and global shipping.' },
                   { icon: Database, title: 'Vault Access', desc: 'Securely save and organize trending winning products.' },
                   { icon: MoveRight, title: 'Live Pulse', desc: 'Monitor price and stock shifts across any marketplace.', gated: true }
                 ].map(feat => (
                   <div key={feat.title} className="card relative !p-8 group hover:border-primary">
                      {feat.gated && (
                        <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[#09090b] flex items-center justify-center text-primary shadow-lg">
                          <Zap size={16} fill="currentColor" strokeWidth={0} />
                        </div>
                      )}
                      <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center text-foreground mb-6 mx-auto group-hover:bg-[#CCFF00] group-hover:text-black transition-all duration-500">
                        <feat.icon size={28} strokeWidth={3} />
                      </div>
                      <h4 className="text-xl font-black text-foreground mb-3 tracking-tight">{feat.title}</h4>
                      <p className="text-sm text-muted-foreground font-medium leading-relaxed">{feat.desc}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* ── Section G: Pricing (Finto Style) ──────── */}
        <section id="pricing" className="py-20 lg:py-32 bg-muted/30 border-t border-border">
           <div className="max-w-[1440px] mx-auto px-6 sm:px-10">
              <div className="max-w-3xl mb-16 space-y-4">
                  <div className="inline-block px-4 py-1.5 rounded-full bg-[#09090b] text-primary text-[10px] font-black uppercase tracking-[0.4em] shadow-lg mb-6">Investment</div>
                 <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
                   Investment Plans <br/>
                   <span className="text-muted-foreground/40 italic">for Every Stage.</span>
                 </h2>
                 <p className="text-muted-foreground text-base sm:text-lg font-medium leading-relaxed max-w-xl">
                   Start free to test the waters. Upgrade as your market coverage grows. Simple, honest pricing for serious entrepreneurs.
                 </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {PLANS.map(plan => (
                   <PricingCard key={plan.id} plan={plan} />
                 ))}
              </div>
           </div>
        </section>

        {/* ── Section H: Final Call to Action (Finto Style) ─────────── */}
        <section className="py-20 lg:py-32 px-6 bg-background">
           <div className="max-w-[1440px] mx-auto">
              <div className="relative overflow-hidden bg-[#09090b] rounded-[2.5rem] py-20 px-10 sm:px-20 text-center">
                 {/* Decorative background grid and circles */}
                 <div className="absolute inset-0 opacity-10 pointer-events-none" 
                      style={{ backgroundImage: 'radial-gradient(#BEF264 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                 <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#BEF264]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                 <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-black/50 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
                 
                 <div className="relative z-10 space-y-10 max-w-3xl mx-auto">
                   <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter text-white leading-[0.95]">
                     Find Your Next <br/>
                     Winning Product Today.
                   </h2>
                   <p className="text-lg text-white/60 font-medium leading-relaxed max-w-xl mx-auto">
                     Join hundreds of entrepreneurs using TrendHawk to outperform the market and build their e-commerce empire.
                   </p>
                   <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                      <Link to="/login" className="btn btn-primary px-8 py-4 text-xs font-black uppercase tracking-widest group">
                        Get Started Free
                        <div className="ml-3 w-5 h-5 rounded-full bg-[#111827] flex items-center justify-center transition-transform group-hover:translate-x-1">
                          <ArrowRight size={12} className="text-[#BEF264]" strokeWidth={4} />
                        </div>
                      </Link>
                      <Link to="/login" className="text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">
                        View Documentation
                      </Link>
                   </div>
                 </div>
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
