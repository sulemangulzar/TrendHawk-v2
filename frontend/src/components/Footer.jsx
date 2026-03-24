import { Link } from 'react-router-dom'
import { Target, Twitter, Github, Linkedin, Globe } from 'lucide-react'

const FOOTER_SECTIONS = [
  {
    title: 'Toolbox',
    links: [
      { label: 'Trending Feed', to: '/dashboard/trending' },
      { label: 'Market Tracking', to: '/dashboard/track' },
      { label: 'Profit Engine', to: '/dashboard/calculator' },
      { label: 'Store Scout', to: '/dashboard/spy' },
    ]
  },
  {
    title: 'Ecosystem',
    links: [
      { label: 'Intelligence', id: 'marketplaces' },
      { label: 'Roadmap', to: '#' },
      { label: 'Success Stories', to: '#' },
      { label: 'Pricing', id: 'pricing' },
    ]
  },
  {
    title: 'Legacy',
    links: [
      { label: 'Privacy Policy', to: '#' },
      { label: 'Terms of Service', to: '#' },
      { label: 'Security', to: '#' },
      { label: 'Contact Support', to: '#' },
    ]
  }
]

export default function Footer() {
  const scrollAction = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="bg-muted border-t border-border pt-20 pb-12">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          
          <div className="col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-all">
                <Target className="w-5 h-5 text-primary-foreground" strokeWidth={3} />
              </div>
              <span className="text-xl font-black tracking-tighter text-foreground">Trend<span className="text-muted-foreground/40">Hawk</span></span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm font-medium">
              The ultimate product intelligence hub for digital entrepreneurs. Identify winners, track shifts, and scale with real-time market data.
            </p>
            <div className="flex items-center gap-3">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary hover:bg-primary/5 transition-all">
                  <Icon size={18} strokeWidth={2.5} />
                </a>
              ))}
            </div>
          </div>

          {FOOTER_SECTIONS.map(section => (
            <div key={section.title} className="col-span-1">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground mb-6">{section.title}</h4>
              <ul className="space-y-4">
                {section.links.map(link => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link to={link.to} className="text-[13px] font-bold text-muted-foreground hover:text-foreground transition-colors">
                        {link.label}
                      </Link>
                    ) : (
                      <button onClick={() => scrollAction(link.id)} className="text-[13px] font-bold text-muted-foreground hover:text-foreground transition-colors">
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">
            © 2026 TrendHawkIntelligence. Built for Scale.
          </p>
          <div className="flex items-center gap-10">
            <span className="flex items-center gap-2.5 text-[9px] font-black text-foreground uppercase tracking-widest bg-card border border-border px-3.5 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Infrastructure: Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
