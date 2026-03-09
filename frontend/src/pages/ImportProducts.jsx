import { useState } from 'react'
import axios from 'axios'
import ProductEditModal from './ProductEditModal'
import './ImportProducts.css'

const MOCK_PRODUCTS = [
  {
    id: 'p1',
    title: 'Fashion Item',
    aliUrl: 'https://aliexpress.com/item/1',
    image: null,
    aliCost: 14.63,
    depopPrice: 29.26,
    status: 'ready',
    date: '11/19/2025',
    category: 'Clothing',
    condition: 'New',
    description: '',
    depopUrl: '',
  },
  {
    id: 'p2',
    title: 'Striped Grey Baggy Sweats',
    aliUrl: 'https://aliexpress.com/item/2',
    image: null,
    aliCost: 0,
    depopPrice: 0,
    status: 'missing_price',
    date: '11/19/2025',
    category: 'Clothing',
    condition: 'New',
    description: '',
    depopUrl: '',
  },
]

export default function ImportProducts() {
  const [url, setUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [products, setProducts] = useState(MOCK_PRODUCTS)
  const [search, setSearch] = useState('')
  const [alert, setAlert] = useState(null)
  const [editProduct, setEditProduct] = useState(null)

  const showAlert = (type, msg) => {
    setAlert({ type, msg })
    setTimeout(() => setAlert(null), 4000)
  }

  const handleImport = async () => {
    if (!url.trim()) return showAlert('error', 'Please enter an AliExpress product URL.')
    if (!url.includes('aliexpress')) return showAlert('error', 'Please enter a valid AliExpress URL.')
    setImporting(true)
    try {
      const res = await axios.post('/api/scraper/aliexpress', { url })
      const p = res.data
      const newProduct = {
        id: `p-${Date.now()}`,
        title: p.title,
        aliUrl: url,
        image: p.images?.[0] || null,
        aliCost: p.price || 0,
        depopPrice: p.price ? parseFloat((p.price * 2).toFixed(2)) : 0,
        status: p.price ? 'ready' : 'missing_price',
        date: new Date().toLocaleDateString('en-US'),
        category: 'Clothing',
        condition: 'New',
        description: p.description || '',
        depopUrl: '',
        images: p.images || [],
      }
      setProducts(prev => [newProduct, ...prev])
      setUrl('')
      showAlert('success', 'Product imported successfully!')
    } catch (err) {
      showAlert('error', err.response?.data?.error || 'Failed to import product.')
    } finally {
      setImporting(false)
    }
  }

  const handleSaveProduct = (updated) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p))
    setEditProduct(null)
    showAlert('success', 'Product saved!')
  }

  const handleDelete = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="import-page">
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, textAlign: 'center' }}>
        Import and manage your product catalog with ease
      </div>

      {/* Import banner */}
      <div className="import-banner">
        <div className="import-banner-header">
          <span className="import-banner-icon">⚡</span>
          <div>
            <div className="import-banner-title">Import New Product</div>
            <div className="import-banner-sub">Paste any AliExpress link to get started</div>
          </div>
        </div>
        <div className="import-input-row">
          <input
            className="import-url-input"
            placeholder="https://aliexpress.com/item/..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleImport()}
          />
          <button className="btn btn-primary" onClick={handleImport} disabled={importing}>
            {importing ? <><span className="spinner" /> Fetching product... (up to 30s)</> : '+ Import'}
          </button>
        </div>
        <div className="import-banner-hint">
          ✦ AI will analyze the product and set up profit calculations automatically
        </div>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      {/* Search */}
      <input
        className="form-input"
        style={{ marginBottom: 20, background: '#fff' }}
        placeholder="Search products..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Products header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontWeight: 600, fontSize: 16 }}>Your Products</span>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{filtered.length} items</span>
      </div>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛍</div>
          <div className="empty-text">No products yet. Import your first product above.</div>
        </div>
      ) : (
        <div className="products-grid">
          {filtered.map(p => (
            <div key={p.id} className="product-card">
              <div className="product-card-image">
                {p.image
                  ? <img src={p.image} alt={p.title} />
                  : <div className="product-placeholder">🛍</div>
                }
                <span className="ali-badge">AliExpress</span>
                <span className="product-date">{p.date}</span>
              </div>
              <div className="product-card-body">
                <div className="product-title">{p.title}</div>
                <div className={`product-status ${p.status === 'ready' ? 'ready' : 'missing'}`}>
                  {p.status === 'ready'
                    ? <><span className="status-dot green" />Ready</>
                    : <><span className="status-dot orange" />Missing Price</>
                  }
                </div>
              </div>
              <div className="product-card-footer">
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => setEditProduct(p)}>
                  Edit
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => handleDelete(p.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editProduct && (
        <ProductEditModal
          product={editProduct}
          onSave={handleSaveProduct}
          onClose={() => setEditProduct(null)}
        />
      )}
    </div>
  )
}
