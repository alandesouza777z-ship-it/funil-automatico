import type { PropsWithChildren } from 'react'
import type { AppView } from '../../types/funnel'

interface AppShellProps extends PropsWithChildren {
  activeView: AppView
  sessionEmail: string
  onChangeView: (view: AppView) => void
  onCreateFunnel: () => void
  onLogout: () => void
}

const navItems: { key: AppView; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'builder', label: 'Builder', icon: '🔧' },
  { key: 'templates', label: 'Templates', icon: '📋' },
  { key: 'analytics', label: 'Analytics', icon: '📈' },
]

export function AppShell({ activeView, sessionEmail, onChangeView, onCreateFunnel, onLogout, children }: AppShellProps) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <div className="brand-logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M4 6 L14 22 L24 6 Z" fill="white" opacity="0.9"/>
              <path d="M8 6 L14 16 L20 6 Z" fill="white" opacity="0.5"/>
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-name">Funnelby</span>
            <span className="brand-tag">Canvas Builder</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`nav-item ${activeView === item.key ? 'nav-item--active' : ''}`}
              onClick={() => onChangeView(item.key)}
            >
              <span className="nav-item__icon">{item.icon}</span>
              <span className="nav-item__label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar__spacer" />

        <button type="button" className="btn btn--primary sidebar__create" onClick={onCreateFunnel}>
          <span>+</span>
          Novo Funil
        </button>

        <div className="sidebar__user">
          <div className="user-avatar">{sessionEmail.charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <span className="user-email">{sessionEmail}</span>
          </div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onLogout} title="Sair">
            ↗
          </button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  )
}
