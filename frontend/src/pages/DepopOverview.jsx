import { useState, useEffect } from 'react'
import axios from 'axios'

const MOCK_STATS = {
  totalRevenue: 82.48, revenueChange: 12,
  activeListings: 7, totalListings: 9,
  pendingOrders: 2,
  totalSales: 14, salesChange: 3,
  avgPrice: 22.50,
  profileViews: 340, viewsChange: 18,
}

const MOCK_LISTINGS = [
  { id: 'l1', title: 'Striped Grey Baggy Sweats', price: 29.26, category: 'Clothing', views: 54, likes: 7, status: 'active', listedAt: '19/11/2025', image: null },
  { id: 'l2', title: 'Fashion Item Hoodie', price: 34.99, category: 'Clothing', views: 102, likes: 18, status: 'active', listedAt: '19/11/2025', image: null },
  { id: 'l3', title: 'Y2K Cargo Trousers', price: 19.00, category: 'Clothing', views: 31, likes: 4, status: 'active', listedAt: '01/12/2025', image: null },
  { id: 'l4', title: 'Vintage Band Tee', price: 12.50, category: 'Clothing', views: 67, likes: 9, status: 'active', listedAt: '10/01/2026', image: null },
]

export default function DepopOverview() {
  const [stats, setStats] = useState(MOCK_STATS)
  const [listings, setListings] = useState(MOCK_LISTINGS)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const showAlert = (type, msg) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 4000) }

  const fetchData = async () => {
    setLoading(true)
    setAlert(null)
    try {
      const [sRes, lRes] = await Promise.all([
        axios.get('/api/depop/stats'),
        axios.get('/api/depop/listings'),
      ])
      setStats(sRes.data)
      setListings(lRes.data.listings || [])
    } catch (err) {
      const msg = err.response?.data?.error || err.message
      if (msg?.includes('ECONNREFUSED') || err.code === 'ERR_NETWORK') {
        showAlert('error', 'Backend is offline. Start the backend server and refresh.')
      } else {
        showAlert('error', `Depop error: ${msg}`)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing from Depop?')) return
    setDeleting(id)
    try { await axios.delete(`/api/depop/listings/${id}`) } catch { /* mock */ }
    setListings(prev => prev.filter(l => l.id !== id))
    showAlert('success', 'Listing deleted.')
    setDeleting(null)
  }

  const handleBoost = async (id) => {
    try { await axios.post(`/api/depop/listings/${id}/boost`) } catch { /* mock */ }
    showAlert('success', 'Listing boosted!')
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <span className="spinner spinner-dark" style={{ width: 28, height: 28 }} />
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>Depop Overview</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Your shop stats and active listings</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={fetchData}>↻ Refresh</button>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      {/* Stats grid */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total Revenue', value: `£${stats.totalRevenue?.toFixed(2)}`, change: `↑ ${stats.revenueChange}% this month`, up: true },
            { label: 'Active Listings', value: stats.activeListings, change: `of ${stats.totalListings} total`, up: null },
            { label: 'Pending Orders', value: stats.pendingOrders, change: stats.pendingOrders > 0 ? 'Needs attention' : 'All clear', up: stats.pendingOrders === 0 },
            { label: 'Total Sales', value: stats.totalSales, change: `↑ ${stats.salesChange} this week`, up: true },
            { label: 'Avg. Sale Price', value: `£${stats.avgPrice?.toFixed(2)}`, change: 'per item', up: null },
            { label: 'Profile Views', value: stats.profileViews, change: `↑ ${stats.viewsChange}% this week`, up: true },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 8 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: s.up === true ? 'var(--green)' : s.up === false ? 'var(--red)' : 'var(--text-muted)' }}>
                {s.change}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Listings */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px 0', marginBottom: 14 }}>
          <span style={{ fontWeight: 600 }}>Active Listings ({listings.length})</span>
        </div>
        {listings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏷</div>
            <div className="empty-text">No listings found</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Views</th>
                  <th>Likes</th>
                  <th>Status</th>
                  <th>Listed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map(l => (
                  <tr key={l.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 8, background: 'var(--bg-main)',
                          border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: 18, flexShrink: 0,
                          overflow: 'hidden'
                        }}>
                          {l.image ? <img src={l.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👕'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{l.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.category}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--accent)' }}>£{l.price?.toFixed(2)}</td>
                    <td>{l.views ?? 0}</td>
                    <td>❤️ {l.likes ?? 0}</td>
                    <td><span className={`badge ${l.status === 'active' ? 'badge-green' : 'badge-orange'}`}>{l.status}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{l.listedAt}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => handleBoost(l.id)}>🚀 Boost</button>
                        <button
                          className="btn btn-sm"
                          style={{ background: 'var(--red-light)', color: 'var(--red)', border: '1px solid #fecaca' }}
                          onClick={() => handleDelete(l.id)}
                          disabled={deleting === l.id}
                        >
                          {deleting === l.id ? <span className="spinner spinner-dark" /> : '🗑'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
