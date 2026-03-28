import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { Target, ArrowRight, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { ThemeToggle } from './ThemeToggle'

const NAV_LINKS = [
  { label: 'Solutions', id: 'features' },
  { label: 'Intelligence', id: 'intelligence' },
  { label: 'Vault', id: 'marketplaces' },
  { label: 'Pricing', id: 'pricing' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollAction = (id) => {
    setMobileOpen(false)
    if (location.pathname !== '/') {
      window.location.href = `/#${id}`
      return
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
      scrolled 
        ? 'bg-background/80 backdrop-blur-xl py-3 shadow-sm' 
        : 'bg-background py-6'
    }`}>
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-[14px] bg-[#CCFF00] flex items-center justify-center shadow-lg shadow-[#CCFF00]/20 group-hover:rotate-12 transition-all duration-300">
            <Target className="w-6 h-6 text-[#111827]" strokeWidth={3} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-foreground">
            Trend<span className="text-muted-foreground/40">Hawk</span>
          </span>
        </Link>

        {/* Center Nav */}
        <nav className="hidden lg:flex items-center gap-12">
          {NAV_LINKS.map(n => (
            n.to ? (
              <Link 
                key={n.label} 
                to={n.to}
                className="text-sm font-bold text-foreground/60 hover:text-foreground transition-colors"
              >
                {n.label}
              </Link>
            ) : (
              <button 
                key={n.label} 
                onClick={() => scrollAction(n.id)}
                className="text-sm font-bold text-foreground/60 hover:text-foreground transition-colors"
              >
                {n.label}
              </button>
            )
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-6">
          <ThemeToggle />
          <Link 
            to="/login" 
            className="text-sm font-bold text-foreground/60 hover:text-foreground transition-colors"
          >
            Sign In
          </Link>
          <Link 
            to="/signup"
            className="btn-primary btn !px-6 !py-2.5 !text-xs uppercase tracking-widest"
          >
            Get Started
            <div className="ml-2 w-5 h-5 rounded-full bg-[#111827] flex items-center justify-center">
               <ArrowRight className="w-3 h-3 text-[#BEF264]" strokeWidth={4} />
            </div>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-3 rounded-2xl bg-muted border border-border text-foreground hover:bg-muted/80 transition-all"
        >
          {mobileOpen ? <X size={24} strokeWidth={3} /> : <Menu size={24} strokeWidth={3} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden absolute top-full left-0 right-0 bg-background border-b border-border overflow-hidden shadow-2xl z-40"
          >
            <div className="p-8 space-y-4">
              <div className="space-y-4">
                {NAV_LINKS.map(n => (
                  n.to ? (
                    <Link
                      key={n.label}
                      to={n.to}
                      onClick={() => setMobileOpen(false)}
                      className="block w-full py-4 text-lg font-black text-foreground border-b border-border"
                    >
                      {n.label}
                    </Link>
                  ) : (
                    <button
                      key={n.label}
                      onClick={() => scrollAction(n.id)}
                      className="block w-full text-left py-4 text-lg font-black text-foreground border-b border-border"
                    >
                      {n.label}
                    </button>
                  )
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-2xl">
                  <span className="text-sm font-black text-foreground uppercase tracking-widest">Interface Theme</span>
                  <ThemeToggle />
                </div>
                <Link 
                  to="/login" 
                  onClick={() => setMobileOpen(false)}
                  className="btn btn-ghost w-full py-4 text-sm font-black uppercase tracking-widest text-foreground"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary btn w-full py-4 text-sm font-black uppercase tracking-widest"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
