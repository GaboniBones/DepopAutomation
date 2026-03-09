import { useState, useEffect } from 'react'
import axios from 'axios'
import './Dashboard.css'

// Simple SVG line chart
function LineChart({ data = [] }) {
  const W = 600, H = 160, PAD = 30
  if (!data.length) return null
  const max = Math.max(...data.map(d => d.v), 1)
  const pts = data.map((d, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2)
    const y = PAD + (1 - d.v / max) * (H - PAD * 2)
    return [x, y]
  })
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ')
  const fill = `${path} L ${pts[pts.length - 1][0]} ${H - PAD} L ${PAD} ${H - PAD} Z`
  const yLabels = [0, max * 0.33, max * 0.66, max].reverse()

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 160, overflow: 'visible' }}>
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2f54eb" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#2f54eb" stopOpacity="0" />
        </linearGradient>
      </defs>
      {yLabels.map((v, i) => {
        const y = PAD + (i / 3) * (H - PAD * 2)
        return (
          <g key={i}>
            <line x1={PAD} x2={W - PAD} y1={y} y2={y} stroke="#e5e7eb" strokeWidth="1" />
            <text x={PAD - 5} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
              ${Math.round(v)}
            </text>
          </g>
        )
      })}
      <path d={fill} fill="url(#chartFill)" />
      <path d={path} fill="none" stroke="#2f54eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="#2f54eb" />
      ))}
      <text x={PAD} y={H} fontSize="10" fill="#9ca3af">12:00 AM</text>
      <text x={W - PAD} y={H} fontSize="10" fill="#9ca3af" textAnchor="end">11:59 PM</text>
    </svg>
  )
}

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({ totalSales: 82.48, profit: 41.24, orders: 3, products: 0 })
  const [chartData] = useState([
    { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 5 },
    { v: 82 }, { v: 82 }, { v: 82 }, { v: 95 }, { v: 95 },
  ])

  return (
    <div className="dashboard">
      {/* Welcome topbar */}
      <div className="dash-topbar">
        <div>
          <h1 className="welcome-text">Welcome back, You 👋</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline btn-sm">Upgrade</button>
          <button className="btn btn-primary btn-sm">Earn $75+</button>
        </div>
      </div>

      {/* Banner cards */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <button className="banner-card blue" onClick={() => onNavigate('import')}>
          <div className="banner-icon">📦</div>
          <div className="banner-text">
            <div className="banner-title">Find Products To Dropship</div>
            <div className="banner-sub">Proven to work products</div>
          </div>
          <span className="banner-arrow">→</span>
        </button>
        <button className="banner-card blue-light" onClick={() => onNavigate('overview')}>
          <div className="banner-icon">📈</div>
          <div className="banner-text">
            <div className="banner-title">Track Your <span style={{ color: '#fde047' }}>PROFITS</span></div>
            <div className="banner-sub">See how much revenue and profits you're making</div>
          </div>
          <span className="banner-arrow">→</span>
        </button>
      </div>

      {/* Main grid */}
      <div className="dash-main-grid">
        {/* Left col */}
        <div className="dash-left">
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontWeight: 600 }}>Top Sellers</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>⏱ 7d 5h</span>
            </div>
            <div className="sellers-row">
              {[
                { name: 'ez20082005@...', amt: '$10,000', img: '🏆' },
                { name: 'ethan_sells123', amt: '$8,672', img: '🥈' },
                { name: 'Mateo', amt: '$7,627', img: '🥉' },
              ].map((s, i) => (
                <div key={i} className="seller-card">
                  <div className="seller-avatar">{s.img}</div>
                  <div className="seller-name">{s.name}</div>
                  <div className="seller-amt">{s.amt}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick action cards */}
          <div className="grid-2">
            <div className="quick-card" onClick={() => onNavigate('overview')}>
              <div className="quick-card-img">📊</div>
              <div>
                <div className="quick-card-title">Profit Tracker</div>
                <div className="quick-card-sub">Track revenue & margins in real-time</div>
              </div>
            </div>
            <div className="quick-card" onClick={() => onNavigate('fulfillment')}>
              <div className="quick-card-img">🚚</div>
              <div>
                <div className="quick-card-title">Auto Fulfill</div>
                <div className="quick-card-sub">Automate your order fulfillment</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right col */}
        <div className="dash-right">
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 600, marginBottom: 16 }}>Your Dashboard</div>
            <div className="stats-row">
              <div className="stat-block wide">
                <div className="stat-label-sm">TOTAL SALES</div>
                <div className="stat-num">${stats.totalSales.toFixed(2)}</div>
                <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 3 }}>→ Today</div>
              </div>
              <div className="stat-block">
                <div className="stat-label-sm">PROFIT</div>
                <div className="stat-num">${stats.profit.toFixed(2)}</div>
                <div className="stat-dash">—</div>
              </div>
              <div className="stat-block">
                <div className="stat-label-sm">ORDERS</div>
                <div className="stat-num">{stats.orders}</div>
                <div className="stat-dash">—</div>
              </div>
              <div className="stat-block">
                <div className="stat-label-sm">PRODUCTS</div>
                <div className="stat-num">{stats.products}</div>
                <div className="stat-dash">—</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>Today (EST)</div>
            <LineChart data={chartData} />
          </div>
        </div>
      </div>
    </div>
  )
}
