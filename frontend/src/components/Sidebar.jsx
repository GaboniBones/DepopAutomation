import './Sidebar.css'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'import', label: 'Import Products', icon: '⬇' },
  { id: 'fulfillment', label: 'Fulfillment', icon: '📦' },
  { id: 'auto-fulfill', label: 'Auto Fulfillment', icon: '⚡', soon: true },
  { id: 'overview', label: 'Depop Overview', icon: '📊' },
  { id: 'profit', label: 'Profit Tracker', icon: '$', divider: true },
]

export default function Sidebar({ activePage, onNavigate, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-bird">🐦</div>
        <span className="logo-name">DepopAuto</span>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(item => (
          <div key={item.id}>
            {item.divider && <div className="nav-divider" />}
            <button
              className={`nav-item ${activePage === item.id ? 'active' : ''} ${item.soon ? 'disabled' : ''}`}
              onClick={() => !item.soon && onNavigate(item.id)}
              disabled={item.soon}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.soon && <span className="badge-soon">SOON</span>}
            </button>
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="upgrade-card">
          <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>Upgrade Plan</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
            Unlock all features
          </div>
          <button className="btn btn-primary btn-sm" style={{ width: '100%', borderRadius: 8 }}>
            Upgrade
          </button>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            style={{
              width: '100%', marginTop: 10, padding: '8px 0', background: 'transparent',
              border: '1px solid var(--border)', borderRadius: 8, fontSize: 12,
              color: 'var(--text-secondary)', cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        )}
      </div>
    </aside>
  )
}
