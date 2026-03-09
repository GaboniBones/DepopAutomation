const express = require('express')
const router = express.Router()
const axios = require('axios')
const { getAccessToken } = require('../services/auth')

const DEPOP_API = 'https://api.depop.com/api/v2'

async function getHeaders() {
  const token = await getAccessToken()
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Depop/3.0 (iPhone; iOS 17; Scale/3.00)',
    Accept: 'application/json',
  }
}

function mapOrder(o) {
  return {
    id: o.id,
    itemTitle: o.items?.[0]?.description || o.item?.description || 'Unknown Item',
    variant: o.items?.[0]?.size_label || '',
    buyerName: `${o.buyer?.first_name || ''} ${o.buyer?.last_name || ''}`.trim() || o.buyer?.username,
    buyerUsername: o.buyer?.username,
    amount: (o.item_price?.amount || 0) / 100,
    date: o.created ? new Date(o.created * 1000).toLocaleDateString('en-GB') : 'Unknown',
    status: o.status === 'sold' ? 'pending' : o.status,
    shippingAddress: o.shipping_address
      ? [o.shipping_address.line_1, o.shipping_address.line_2, o.shipping_address.city, o.shipping_address.postcode, o.shipping_address.country]
          .filter(Boolean).join('\n')
      : null,
    trackingNumber: o.tracking_details?.tracking_number || null,
  }
}

// GET /api/orders
router.get('/', async (req, res, next) => {
  try {
    const headers = await getHeaders()
    const [soldRes, completedRes] = await Promise.all([
      axios.get(`${DEPOP_API}/selling/orders/sold/`, { headers, params: { limit: 50, offset: 0 } }),
      axios.get(`${DEPOP_API}/selling/orders/completed/`, { headers, params: { limit: 20, offset: 0 } })
        .catch(() => ({ data: { objects: [] } })),
    ])
    const sold = (soldRes.data?.objects || []).map(mapOrder)
    const completed = (completedRes.data?.objects || []).map(o => ({ ...mapOrder(o), status: 'completed' }))
    res.json({ orders: [...sold, ...completed] })
  } catch (err) {
    next(err)
  }
})

// POST /api/orders/:id/fulfill
router.post('/:id/fulfill', async (req, res, next) => {
  try {
    const { trackingNumber } = req.body
    if (!trackingNumber) return res.status(400).json({ error: 'trackingNumber is required.' })
    const headers = await getHeaders()
    await axios.post(`${DEPOP_API}/selling/orders/${req.params.id}/ship/`, { tracking_number: trackingNumber }, { headers })
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

// POST /api/orders/:id/complete
router.post('/:id/complete', async (req, res, next) => {
  try {
    const headers = await getHeaders()
    await axios.post(`${DEPOP_API}/selling/orders/${req.params.id}/complete/`, {}, { headers })
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

module.exports = router
