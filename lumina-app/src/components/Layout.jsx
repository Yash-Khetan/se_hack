import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Clock, Zap, MessageSquare, Calendar,
  Columns, Receipt, Brain, Bell, Search, Settings, Sparkles
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, section: 'core' },
  { to: '/timetable', label: 'Timetable & Attendance', icon: Clock, section: 'core' },
  { to: '/focus', label: 'ContextSwitch', icon: Zap, section: 'core' },
  { to: '/hub', label: 'Group Discussion Hub', icon: MessageSquare, badge: 3, section: 'collab' },
  { to: '/calendar', label: 'Gmail & Calendar', icon: Calendar, section: 'collab' },
  { to: '/kanban', label: 'Kanban Board', icon: Columns, section: 'collab' },
  { to: '/expenses', label: 'Expense Logger', icon: Receipt, section: 'personal' },
  { to: '/brain', label: 'Second Brain (RAG)', icon: Brain, section: 'personal' },
]

const sections = [
  { id: 'core', label: 'Core Engine' },
  { id: 'collab', label: 'Collaboration' },
  { id: 'personal', label: 'Personal' },
]

const titles = {
  '/': 'Dashboard',
  '/timetable': 'Timetable & Attendance',
  '/focus': 'ContextSwitch',
  '/hub': 'Group Discussion Hub',
  '/calendar': 'Gmail & Calendar Heatmap',
  '/kanban': 'Kanban Board',
  '/expenses': 'Expense Logger',
  '/brain': 'Second Brain',
}

export default function Layout() {
  const location = useLocation()
  const pageTitle = titles[location.pathname] || 'Lumina'

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Sparkles size={18} color="white" />
          </div>
          <div>
            <div className="logo-text">Lumina</div>
            <div className="logo-sub">Engineering Sidekick</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sections.map(section => (
            <div key={section.id}>
              <div className="nav-section-label">{section.label}</div>
              {navItems
                .filter(item => item.section === section.id)
                .map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                  >
                    <item.icon size={18} />
                    {item.label}
                    {item.badge && <span className="nav-badge">{item.badge}</span>}
                  </NavLink>
                ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-card">
            <div className="user-avatar">R</div>
            <div>
              <div className="user-name">Renee Patel</div>
              <div className="user-role">3rd Year · CS Dept</div>
            </div>
            <Settings size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-content">
        <header className="top-nav">
          <span className="top-nav-title">{pageTitle}</span>

          <div className="top-nav-search">
            <Search className="search-icon" size={14} />
            <input id="global-search" placeholder="Search anything..." />
          </div>

          <div className="top-nav-actions">
            <button className="nav-icon-btn" id="notif-btn" title="Notifications">
              <Bell size={16} />
              <span className="notif-dot" />
            </button>
            <div
              className="user-avatar"
              style={{ width: 32, height: 32, fontSize: '0.75rem', cursor: 'pointer' }}
              title="Profile"
            >
              R
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
