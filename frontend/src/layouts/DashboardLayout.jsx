import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useDashboard } from '../context/DashboardContext'
import { ThemeToggle } from '../components/ThemeToggle'
import {
  LayoutDashboard, Search, TrendingUp, Bookmark,
  Calculator, Settings, CreditCard, Shield, LogOut,
  Zap, Menu, X, Target, Eye, Bell, ChevronRight,
  Activity
} from 'lucide-react'

const navGroups = [
  {
    label: 'Intelligence',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', exact: true },
      { to: '/dashboard/track', icon: Search, label: 'Analysis' },
      { to: '/dashboard/trending', icon: TrendingUp, label: 'Heatmap' },
      { to: '/dashboard/spy', icon: Eye, label: 'Store Spy' },
    ]
  },
  {
    label: 'Resources',
    items: [
      { to: '/dashboard/saved', icon: Bookmark, label: 'Vault' },
      { to: '/dashboard/calculator', icon: Calculator, label: 'Calculator' },
      { to: '/dashboard/alerts', icon: Bell, label: 'Triggers' },
    ]
  }
]


export default function DashboardLayout() {
  const { user, signOut } = useAuth()
  const { usage, loading } = useDashboard()
  const [isDark, setIsDark] = useState(false)
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true)
    }
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }


  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        :root {
          --lime:        #C8FF00;
          --lime-dim:    rgba(200,255,0,0.1);
          --lime-border: rgba(200,255,0,0.2);
          --w: 260px;
          --radius: 12px;
          --ease: cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* light */
        html:not(.dark) {
          --bg:        #F9FAFB;
          --bg2:       #F3F4F6;
          --surface:   #FFFFFF;
          --border:    #E5E7EB;
          --border2:   #F3F4F6;
          --text:      #111827;
          --text2:     #4B5563;
          --text3:     #9CA3AF;
          --hover-bg:  #F3F4F6;
          --active-bg: #111827;
          --active-fg: #FFFFFF;
        }

        /* dark */
        html.dark {
          --bg:        #0B0B0B;
          --bg2:       #141414;
          --surface:   #111111;
          --border:    #1F1F1F;
          --border2:   #161616;
          --text:      #F9FAFB;
          --text2:     #9CA3AF;
          --text3:     #4B5563;
          --hover-bg:  #1F1F1F;
          --active-bg: #F9FAFB;
          --active-fg: #0B0B0B;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ly-root {
          font-family: 'Poppins', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          display: flex;
          -webkit-font-smoothing: antialiased;
        }

        /* ── SIDEBAR ───────────────────────────────────── */
        .ly-sidebar {
          position: fixed;
          inset-block: 0;
          left: 0;
          width: var(--w);
          background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          z-index: 50;
          transition: transform 0.3s var(--ease);
        }
        @media (max-width: 1023px) {
          .ly-sidebar { transform: translateX(-100%); }
          .ly-sidebar.open {
            transform: translateX(0);
            box-shadow: 0 0 40px rgba(0,0,0,0.1);
          }
        }

        .ly-logo-wrap {
          padding: 24px 20px 16px;
        }
        .ly-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }
        .ly-logo-mark {
          width: 36px;
          height: 36px;
          background: var(--lime);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px var(--lime-border);
        }
        .ly-logo-name {
          font-weight: 700;
          font-size: 16px;
          letter-spacing: -0.02em;
          color: var(--text);
          line-height: 1;
        }
        .ly-logo-sub {
          font-size: 10px;
          font-weight: 700;
          color: var(--text3);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 1px;
        }

        .ly-nav-body {
          flex: 1;
          padding: 0 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow: hidden;
        }

        .ly-group-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--text3);
          margin-bottom: 8px;
          padding-left: 8px;
          opacity: 0.8;
        }

        .ly-group-items {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ly-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text2);
          text-decoration: none;
          transition: all 0.2s var(--ease);
        }
        .ly-link:hover {
          background: var(--hover-bg);
          color: var(--text);
        }
        .ly-link.active {
          background: var(--lime);
          color: #000000;
          font-weight: 600;
          box-shadow: 0 4px 12px var(--lime-border);
        }
        .ly-link.active svg { color: #000000 !important; }

        .ly-admin-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 10px;
          background: rgba(139, 92, 246, 0.08);
          border: 1px solid rgba(139, 92, 246, 0.1);
          font-size: 14px;
          font-weight: 600;
          color: #8b5cf6;
          text-decoration: none;
          margin-bottom: 8px;
        }
        .ly-admin-link:hover { background: rgba(139, 92, 246, 0.12); }

        .ly-bottom {
          padding: 12px 16px 24px;
          border-top: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .ly-bottom-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text2);
          text-decoration: none;
          transition: all 0.2s var(--ease);
        }
        .ly-bottom-link:hover {
          background: var(--hover-bg);
          color: var(--text);
        }
        .ly-bottom-link.active {
          background: var(--lime);
          color: #000000;
          font-weight: 600;
          box-shadow: 0 4px 12px var(--lime-border);
        }
        .ly-bottom-link.active svg { color: #000000 !important; }

        .ly-theme-toggle {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text2);
          background: transparent;
          border: none;
          cursor: pointer;
          width: 100%;
          text-align: left;
          transition: all 0.2s var(--ease);
        }
        .ly-theme-toggle:hover {
          background: var(--hover-bg);
          color: var(--text);
        }

        .ly-main {
          flex: 1;
          padding-left: var(--w);
        }
        @media (max-width: 1023px) {
          .ly-main { padding-left: 0; padding-top: 60px; }
        }
        .ly-main-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px;
        }
        @media (max-width: 640px) {
          .ly-main-inner { padding: 24px 16px; }
        }

        .ly-mob-header {
          display: none;
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 60px;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          z-index: 40;
          padding: 0 16px;
          align-items: center;
          justify-content: space-between;
        }
        @media (max-width: 1023px) { .ly-mob-header { display: flex; } }
        
        .ly-burger {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--surface);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text);
        }
        
        .ly-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          z-index: 45;
        }
        @media (max-width: 1023px) { .ly-overlay.open { display: block; } }

      `}</style>

      <div className="ly-root">

        {/* ── Mobile Header ─────────────────────────────── */}
        <header className="ly-mob-header">
          <Link to="/dashboard" className="ly-logo">
            <div className="ly-logo-mark">
              <Target size={15} color="#0D0D0C" strokeWidth={2.5} />
            </div>
            <div className="ly-logo-text">
              <div className="ly-logo-name">TRENDHAWK</div>
            </div>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button 
              onClick={toggleTheme}
              className="ly-burger"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
            </button>
            <button
              className="ly-burger"
              onClick={() => setIsMobileMenuOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={16} strokeWidth={2} /> : <Menu size={16} strokeWidth={2} />}
            </button>
          </div>
        </header>

        {/* ── Overlay ───────────────────────────────────── */}
        <div
          className={`ly-overlay${isMobileMenuOpen ? ' open' : ''}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* ── Sidebar ───────────────────────────────────── */}
        <nav className={`ly-sidebar${isMobileMenuOpen ? ' open' : ''}`}>

          {/* Logo */}
          <div className="ly-logo-wrap">
            <Link to="/dashboard" className="ly-logo">
              <div className="ly-logo-mark">
                <Target size={18} color="#000000" strokeWidth={2.5} />
              </div>
              <div>
                <div className="ly-logo-name">TRENDHAWK</div>
                <div className="ly-logo-sub">Intelligence</div>
              </div>
            </Link>
          </div>

          {/* Nav */}
          <div className="ly-nav-body">
            {usage?.isAdmin && (
              <NavLink
                to="/dashboard/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="ly-admin-link"
              >
                <Shield size={14} strokeWidth={2} />
                Admin Console
              </NavLink>
            )}

            {navGroups.map((group, gi) => (
              <div key={gi}>
                <div className="ly-group-label">{group.label}</div>
                <div className="ly-group-items">
                  {group.items.map(item => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.exact}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) => `ly-link${isActive ? ' active' : ''}`}
                    >
                      <item.icon size={14} strokeWidth={2} style={{ flexShrink: 0 }} />
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom nav */}
          <div className="ly-bottom">
            <button 
              onClick={toggleTheme}
              className="ly-theme-toggle"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={14} strokeWidth={2} /> : <Moon size={14} strokeWidth={2} />}
              Appearance
            </button>
            <NavLink
              to="/dashboard/settings"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => `ly-bottom-link${isActive ? ' active' : ''}`}
            >
              <Settings size={14} strokeWidth={2} />
              Settings
            </NavLink>
          </div>

        </nav>

        {/* ── Main Content ──────────────────────────────── */}
        <main className="ly-main">
          <div className="ly-main-inner">
            <Outlet />
          </div>
        </main>

      </div>
    </>
  )
}