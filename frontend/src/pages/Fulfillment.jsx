import { useState, useEffect } from 'react'
import axios from 'axios'
import './Fulfillment.css'

const MOCK_ORDERS = [
  { id: '10041', itemTitle: 'Striped Grey Baggy Sweats', buyerName: 'Jake M.', buyerUsername: '@jakeshops', amount: 29.26, date: '07/03/2026', status: 'pending', shippingAddress: '14 Baker St\nLondon\nW1U 6SB\nUnited Kingdom' },
  { id: '10040', itemTitle: 'Fashion Item Hoodie', buyerName: 'Emma R.', buyerUsername: '@emmabuyss', amount: 34.99, date: '06/03/2026', status: 'shipped', trackingNumber: 'JD123456789GB', shippingAddress: '9 High Street\nManchester\nM1 1AE' },
  { id: '10039', itemTitle: 'Y2K Cargo Trousers', buyerName: 'Tom K.', buyerUsername: '@tomresells', amount: 19.00, date: '05/03/2026', status: 'completed', shippingAddress: '' },
  { id: '10038', itemTitle: 'Vintage Band Tee', buyerName: 'Sofia L.', buyerUsername: '@sofiawears', amount: 12.50, date: '04/03/2026', status: 'pending', shippingAddress: '22 Park Ave\nBirmingham\nB1 2NA' },
]

const STATUS_STYLE = {
  pending: 'badge-orange',
  shipped: 'badge-blue',
  completed: 'badge-green',
  cancelled: 'badge-red',
}

export default function Fulfillment() {
  const [orders, setOrders] = useState(MOCK_ORDERS)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [tracking, setTracking] = useState('')
  const [fulfilling, setFulfilling] = useState(false)
  const [alert, setAlert] = useState(null)

  const showAlert = (type, msg) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 4000) }

  const fetchOrders = async () => {
    setLoading(true)
    setAlert(null)
    try {
      const res = await axios.get('/api/orders')
      setOrders(res.data.orders || [])
    } catch (err) {
      const msg = err.response?.data?.error || err.message
      if (msg?.includes('ECONNREFUSED') || err.code === 'ERR_NETWORK') {
        showAlert('error', 'Backend is offline. Start the backend server and refresh.')
      } else {
        showAlert('error', `Orders error: ${msg}`)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  const handleFulfill = async () => {
    if (!tracking.trim()) return
    setFulfilling(true)
    try {
      await axios.post(`/api/orders/${selected.id}/fulfill`, { trackingNumber: tracking })
    } catch { /* use mock */ }
    setOrders(prev => prev.map(o => o.id === selected.id ? { ...o, status: 'shipped', trackingNumber: tracking } : o))
    showAlert('success', `Order #${selected.id} marked as shipped!`)
    setSelected(null)
    setTracking('')
    setFulfilling(false)
  }

  const handleComplete = async (id) => {
    try { await axios.post(`/api/orders/${id}/complete`) } catch { /* mock */ }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'completed' } : o))
    showAlert('success', 'Order marked as complete!')
  }

  const counts = { all: orders.length, pending: 0, shipped: 0, completed: 0 }
  orders.forEach(o => { if (counts[o.status] !== undefined) counts[o.status]++ })

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>Fulfillment</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Manage and ship your Depop orders</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={fetchOrders}>↻ Refresh</button>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      {/* Filter tabs */}
      <div className="filter-tabs">
        {['all', 'pending', 'shipped', 'completed'].map(f => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="filter-count">{counts[f] ?? 0}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: 20 }}>
        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <span className="spinner spinner-dark" style={{ width: 26, height: 26 }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div className="empty-text">No {filter !== 'all' ? filter : ''} orders</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Item</th>
                    <th>Buyer</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(o => (
                    <tr key={o.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>#{o.id}</td>
                      <td style={{ fontWeight: 500, maxWidth: 160 }}>{o.itemTitle}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{o.buyerName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.buyerUsername}</div>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--green)' }}>£{o.amount?.toFixed(2)}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{o.date}</td>
                      <td><span className={`badge ${STATUS_STYLE[o.status] || 'badge-blue'}`}>{o.status}</span></td>
                      <td>
                        {o.status === 'pending' && (
                          <button className="btn btn-primary btn-sm" onClick={() => { setSelected(o); setTracking('') }}>
                            Ship
                          </button>
                        )}
                        {o.status === 'shipped' && (
                          <button className="btn btn-sm" style={{ background: 'var(--green)', color: '#fff' }} onClick={() => handleComplete(o.id)}>
                            Complete
                          </button>
                        )}
                        {o.status === 'completed' && (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>✓ Done</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Ship panel */}
        {selected && (
          <div className="card" style={{ alignSelf: 'start' }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18 }}>Ship Order #{selected.id}</div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 3 }}>Item</div>
              <div style={{ fontWeight: 600 }}>{selected.itemTitle}</div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 3 }}>Ship to</div>
              <div style={{ fontWeight: 500, marginBottom: 2 }}>{selected.buyerName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                {selected.shippingAddress || 'No address on file'}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tracking Number</label>
              <input
                className="form-input"
                placeholder="e.g. JD123456789GB"
                value={tracking}
                onChange={e => setTracking(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleFulfill()}
              />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={handleFulfill}
                disabled={fulfilling || !tracking.trim()}
              >
                {fulfilling ? <><span className="spinner" /> Sending...</> : '✅ Mark as Shipped'}
              </button>
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

