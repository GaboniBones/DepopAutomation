const express = require('express')
const router = express.Router()
const { getShopStats, getListings, uploadListing, deleteListing, boostListing } = require('../services/depop')

// GET /api/depop/stats
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await getShopStats()
    res.json(stats)
  } catch (err) {
    console.error('[Depop] Stats error:', err.message)
    next(err)
  }
})

// GET /api/depop/listings
router.get('/listings', async (req, res, next) => {
  try {
    const listings = await getListings()
    res.json({ listings })
  } catch (err) {
    console.error('[Depop] Listings error:', err.message)
    next(err)
  }
})

// POST /api/depop/upload
// Body: { title, description, price, images, category, condition }
router.post('/upload', async (req, res, next) => {
  try {
    const { title, description, price, images, category, condition } = req.body

    if (!title || !price) {
      return res.status(400).json({ error: 'title and price are required.' })
    }
    if (!images || images.length === 0) {
      return res.status(400).json({ error: 'At least one image is required.' })
    }

    const result = await uploadListing({ title, description, price, images, category, condition })
    res.json(result)
  } catch (err) {
    console.error('[Depop] Upload error:', err.message)
    next(err)
  }
})

// DELETE /api/depop/listings/:id
router.delete('/listings/:id', async (req, res, next) => {
  try {
    await deleteListing(req.params.id)
    res.json({ success: true })
  } catch (err) {
    console.error('[Depop] Delete error:', err.message)
    next(err)
  }
})

// POST /api/depop/listings/:id/boost
router.post('/listings/:id/boost', async (req, res, next) => {
  try {
    await boostListing(req.params.id)
    res.json({ success: true })
  } catch (err) {
    console.error('[Depop] Boost error:', err.message)
    next(err)
  }
})

module.exports = router
