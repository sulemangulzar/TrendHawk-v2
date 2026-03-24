import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
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

const bottomItems = [
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  { to: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
]

export default function DashboardLayout() {
  const { user, signOut } = useAuth()
  const { usage } = useDashboard()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const usedPct = usage && !usage.isAdmin
    ? Math.round((usage.used / usage.limit) * 100)
    : 100

  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Barlow+Condensed:wght@400;600;700;800;900&display=swap');

        :root {
          --lime: #CCFF00;
          --lime-dim: #a8d400;
          --sidebar-w: 220px;
        }

        /* ── LIGHT ── */
        .th-root {
          --bg: #F5F4EF;
          --bg2: #ECEAE2;
          --surface: #FFFFFF;
          --border: #D8D5CB;
          --text: #1A1A18;
          --muted: #7A7870;
          --accent: var(--lime);
          --accent-text: #1A1A18;
          --nav-active-bg: #1A1A18;
          --nav-active-text: var(--lime);
          --tag-bg: #E8E6DE;
        }

        /* ── DARK ── */
        .dark .th-root,
        [data-theme="dark"] .th-root {
          --bg: #111110;
          --bg2: #1A1A18;
          --surface: #1F1F1D;
          --border: #2E2E2B;
          --text: #F0EEE6;
          --muted: #6E6C66;
          --accent: var(--lime);
          --accent-text: #111110;
          --nav-active-bg: var(--lime);
          --nav-active-text: #111110;
          --tag-bg: #2A2A27;
        }

        .th-root {
          font-family: 'Barlow Condensed', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          display: flex;
        }

        /* ── SIDEBAR ── */
        .th-sidebar {
          position: fixed;
          inset-y: 0;
          left: 0;
          width: var(--sidebar-w);
          background: var(--bg);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          z-index: 40;
          transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
        }
        @media (max-width: 1023px) {
          .th-sidebar { transform: translateX(-100%); }
          .th-sidebar.open { transform: translateX(0); box-shadow: 8px 0 40px rgba(0,0,0,0.2); }
        }

        /* ── LOGO STRIP ── */
        .th-logo-strip {
          padding: 28px 20px 20px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .th-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .th-logo-icon {
          width: 32px;
          height: 32px;
          background: var(--accent);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.3s;
        }
        .th-logo:hover .th-logo-icon { transform: rotate(15deg); }
        .th-logo-wordmark {
          font-family: 'Space Mono', monospace;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: -0.03em;
          color: var(--text);
          line-height: 1;
        }
        .th-logo-sub {
          font-size: 8px;
          color: var(--muted);
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-family: 'Space Mono', monospace;
        }

        /* ── LIVE CLOCK ── */
        .th-clock {
          padding: 12px 20px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .th-clock-time {
          font-family: 'Space Mono', monospace;
          font-size: 22px;
          font-weight: 700;
          color: var(--text);
          line-height: 1;
          letter-spacing: -0.04em;
        }
        .th-live-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 3px 8px;
          background: var(--accent);
          border-radius: 4px;
          font-family: 'Space Mono', monospace;
          font-size: 8px;
          font-weight: 700;
          color: var(--accent-text);
          letter-spacing: 0.1em;
        }
        .th-live-dot {
          width: 5px;
          height: 5px;
          background: var(--accent-text);
          border-radius: 50%;
          animation: pulse-dot 1.5s ease-in-out infinite;
          opacity: 0.7;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }

        /* ── NAV GROUPS ── */
        .th-nav-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 18px 14px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          scrollbar-width: none;
        }
        .th-nav-scroll::-webkit-scrollbar { display: none; }

        .th-group-label {
          font-family: 'Space Mono', monospace;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 8px;
          padding-left: 4px;
        }

        .th-nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: var(--muted);
          text-decoration: none;
          transition: color 0.18s, background 0.18s;
          position: relative;
          overflow: hidden;
        }
        .th-nav-link:hover {
          color: var(--text);
          background: var(--bg2);
        }
        .th-nav-link.active {
          background: var(--nav-active-bg);
          color: var(--nav-active-text);
        }
        .th-nav-link.active svg { color: var(--nav-active-text); }

        .th-admin-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          border: 1px dashed #a855f7;
          color: #a855f7;
          text-decoration: none;
          transition: background 0.18s;
        }
        .th-admin-link:hover { background: rgba(168,85,247,0.08); }

        /* ── USAGE BAR ── */
        .th-usage-block {
          padding: 16px 20px;
          border-top: 1px solid var(--border);
        }
        .th-usage-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .th-usage-label {
          font-family: 'Space Mono', monospace;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .th-usage-num {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          color: var(--text);
        }
        .th-usage-track {
          height: 3px;
          background: var(--bg2);
          border-radius: 2px;
          overflow: hidden;
        }
        .th-usage-fill {
          height: 100%;
          background: var(--accent);
          border-radius: 2px;
          transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
        }

        /* ── PROFILE CARD ── */
        .th-profile {
          padding: 14px 20px;
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .th-avatar {
          width: 36px;
          height: 36px;
          border-radius: 6px;
          background: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Space Mono', monospace;
          font-size: 14px;
          font-weight: 700;
          color: var(--accent-text);
          flex-shrink: 0;
        }
        .th-profile-info { flex: 1; min-width: 0; }
        .th-profile-name {
          font-size: 14px;
          font-weight: 800;
          color: var(--text);
          truncate: true;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .th-profile-plan {
          font-family: 'Space Mono', monospace;
          font-size: 8px;
          font-weight: 700;
          color: var(--accent);
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .th-signout {
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          color: var(--muted);
          border-radius: 4px;
          transition: color 0.15s, background 0.15s;
          display: flex;
        }
        .th-signout:hover { color: #ef4444; background: rgba(239,68,68,0.08); }

        /* ── BOTTOM NAV ITEMS ── */
        .th-bottom-nav {
          padding: 10px 14px 4px;
          border-top: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .th-bottom-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--muted);
          text-decoration: none;
          transition: color 0.15s, background 0.15s;
        }
        .th-bottom-link:hover { color: var(--text); background: var(--bg2); }
        .th-bottom-link.active { color: var(--text); }

        /* ── THEME / VERSION ROW ── */
        .th-footer-row {
          padding: 10px 20px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .th-version {
          font-family: 'Space Mono', monospace;
          font-size: 7px;
          font-weight: 700;
          color: var(--muted);
          letter-spacing: 0.2em;
          opacity: 0.45;
        }

        /* ── MOBILE HEADER ── */
        .th-mobile-header {
          display: none;
        }
        @media (max-width: 1023px) {
          .th-mobile-header {
            display: flex;
            position: fixed;
            top: 0; left: 0; right: 0;
            height: 56px;
            background: var(--bg);
            border-bottom: 1px solid var(--border);
            z-index: 50;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
          }
        }
        .th-hamburger {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 6px;
          cursor: pointer;
          color: var(--text);
          display: flex;
        }

        /* ── OVERLAY ── */
        .th-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 39;
        }
        @media (max-width: 1023px) {
          .th-overlay.open { display: block; }
        }

        /* ── MAIN ── */
        .th-main {
          flex: 1;
          padding-left: var(--sidebar-w);
          min-height: 100vh;
        }
        @media (max-width: 1023px) {
          .th-main {
            padding-left: 0;
            padding-top: 56px;
          }
        }
        .th-main-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 32px;
        }
        @media (max-width: 640px) {
          .th-main-inner { padding: 20px 16px; }
        }

        /* ── ACCENT STRIPE on active ── */
        .th-nav-link.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 20%;
          bottom: 20%;
          width: 3px;
          background: var(--accent);
          border-radius: 0 2px 2px 0;
        }
      `}</style>

      <div className="th-root">

        {/* Mobile Header */}
        <header className="th-mobile-header">
          <Link to="/dashboard" className="th-logo" style={{ textDecoration: 'none' }}>
            <div className="th-logo-icon">
              <Target size={16} color="#111110" strokeWidth={3} />
            </div>
            <div>
              <div className="th-logo-wordmark">TRENDHAWK</div>
            </div>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ThemeToggle />
            <button className="th-hamburger" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </header>

        {/* Overlay */}
        <div
          className={`th-overlay ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Sidebar */}
        <nav className={`th-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>

          {/* Logo */}
          <div className="th-logo-strip">
            <Link to="/dashboard" className="th-logo">
              <div className="th-logo-icon">
                <Target size={16} color="#111110" strokeWidth={3} />
              </div>
              <div>
                <div className="th-logo-wordmark">TRENDHAWK</div>
                <div className="th-logo-sub">Intelligence</div>
              </div>
            </Link>
            <div style={{ display: 'none' }} className="lg-theme-toggle">
              {/* desktop theme toggle in footer */}
            </div>
          </div>

          {/* Live Clock */}
          <div className="th-clock">
            <span className="th-clock-time">{timeStr}</span>
            <div className="th-live-badge">
              <div className="th-live-dot" />
              LIVE
            </div>
          </div>

          {/* Nav Groups */}
          <div className="th-nav-scroll">
            {usage?.isAdmin && (
              <NavLink
                to="/dashboard/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="th-admin-link"
              >
                <Shield size={15} strokeWidth={2.5} />
                Admin Console
              </NavLink>
            )}

            {navGroups.map((group, i) => (
              <div key={i}>
                <div className="th-group-label">{group.label}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {group.items.map(item => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.exact}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `th-nav-link${isActive ? ' active' : ''}`
                      }
                    >
                      <item.icon size={15} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Nav Items */}
          <div className="th-bottom-nav">
            {bottomItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `th-bottom-link${isActive ? ' active' : ''}`
                }
              >
                <item.icon size={14} strokeWidth={2.5} />
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Usage Bar */}
          {usage && (
            <div className="th-usage-block">
              <div className="th-usage-header">
                <span className="th-usage-label">
                  <Zap size={8} style={{ display: 'inline', marginRight: 4 }} />
                  Units
                </span>
                <span className="th-usage-num">
                  {usage.isAdmin ? '∞' : `${usage.used}/${usage.limit}`}
                </span>
              </div>
              <div className="th-usage-track">
                <div
                  className="th-usage-fill"
                  style={{ width: usage.isAdmin ? '100%' : `${usedPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Profile */}
          <div className="th-profile">
            <div className="th-avatar">
              {(user?.email || 'U')[0].toUpperCase()}
            </div>
            <div className="th-profile-info">
              <div className="th-profile-name">
                @{user?.email?.split('@')[0]}
              </div>
              <div className="th-profile-plan">
                {usage?.plan || 'Starter'} plan
              </div>
            </div>
            <button className="th-signout" onClick={handleSignOut} title="Sign out">
              <LogOut size={15} strokeWidth={2.5} />
            </button>
          </div>

          {/* Footer Row */}
          <div className="th-footer-row">
            <ThemeToggle />
            <span className="th-version">TH-V2.0.4</span>
          </div>

        </nav>

        {/* Main Content */}
        <main className="th-main">
          <div className="th-main-inner">
            <Outlet />
          </div>
        </main>

      </div>
    </>
  )
}