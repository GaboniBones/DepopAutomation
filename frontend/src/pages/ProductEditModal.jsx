import { useState } from 'react'
import './ProductEditModal.css'

export default function ProductEditModal({ product, onSave, onClose }) {
  const [form, setForm] = useState({
    title: product.title || '',
    description: product.description || '',
    depopPrice: product.depopPrice || '',
    aliCost: product.aliCost || 0,
    depopUrl: product.depopUrl || '',
    category: product.category || 'Clothing',
    condition: product.condition || 'New',
    image: product.image || null,
  })
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const profit = parseFloat(form.depopPrice) - parseFloat(form.aliCost || 0)
  const isGoodProfit = profit > 0

  const handleSave = async () => {
    setSaving(true)
    try {
      // In production this calls POST /api/depop/upload or PATCH /api/products/:id
      await new Promise(r => setTimeout(r, 800))
      onSave({
        ...product,
        ...form,
        status: form.depopPrice ? 'ready' : 'missing_price',
        depopPrice: parseFloat(form.depopPrice) || 0,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        {/* Header */}
        <div className="modal-header">
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Left: Product Details */}
          <div className="modal-left">
            <h3 className="modal-section-title">⬆ Product Details</h3>

            <div className="form-group">
              <label className="form-label">Product Image</label>
              <div className="product-image-box">
                {form.image
                  ? <img src={form.image} alt="" />
                  : <div className="image-placeholder">🖼</div>
                }
              </div>
              <button className="btn btn-outline btn-sm" style={{ marginTop: 10, width: '100%' }}>
                Upload Custom Image
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Product Name</label>
              <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows={3}
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Product description..."
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={e => set('category', e.target.value)}>
                  <option>Clothing</option>
                  <option>Shoes</option>
                  <option>Accessories</option>
                  <option>Bags</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Condition</label>
                <select className="form-input" value={form.condition} onChange={e => set('condition', e.target.value)}>
                  <option>New</option>
                  <option>Like New</option>
                  <option>Good</option>
                  <option>Fair</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right: Pricing & Fulfillment */}
          <div className="modal-right">
            <h3 className="modal-section-title">$ Pricing & Fulfillment</h3>

            <div className="form-group">
              <label className="form-label">Depop Product URL</label>
              <input
                className="form-input"
                placeholder="https://www.depop.com/products/..."
                value={form.depopUrl}
                onChange={e => set('depopUrl', e.target.value)}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Enter the Depop listing URL for this product (optional – can be added later)
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">AliExpress Product Variant</label>
              <div className="variant-loading">
                <span className="spinner spinner-dark" />
                Loading variants...
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Your Depop Price</label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.depopPrice}
                onChange={e => set('depopPrice', e.target.value)}
              />
            </div>

            {/* Profit calculation */}
            <div className="profit-box">
              <div className="profit-box-title">📈 Profit Calculation</div>
              <div className="profit-row">
                <span>Depop Price:</span>
                <span>${parseFloat(form.depopPrice || 0).toFixed(2)}</span>
              </div>
              <div className="profit-row">
                <span>AliExpress Cost:</span>
                <span className="red">-${parseFloat(form.aliCost || 0).toFixed(2)}</span>
              </div>
              <div className="profit-divider" />
              <div className="profit-row total">
                <span>Your Profit:</span>
                <span className={isGoodProfit ? 'green' : 'red'}>${profit.toFixed(2)}</span>
              </div>
              {isGoodProfit && (
                <div className="profit-message">
                  💡 Great! You'll make ${profit.toFixed(2)} profit per sale
                </div>
              )}
            </div>

            {(!form.title || !form.depopPrice) && (
              <div className="alert alert-warning" style={{ fontSize: 12 }}>
                ⚠ Some information is missing. You can save now and complete it later.
              </div>
            )}

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', borderRadius: 10 }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <><span className="spinner" /> Saving...</> : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
