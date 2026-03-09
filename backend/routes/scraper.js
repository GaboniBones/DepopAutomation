const express = require('express')
const router = express.Router()
const { scrapeAliExpressProduct, debugPage } = require('../services/aliexpress')

// POST /api/scraper/aliexpress
// Body: { url: string }
router.post('/aliexpress', async (req, res, next) => {
  try {
    const { url } = req.body
    if (!url || !url.includes('aliexpress')) {
      return res.status(400).json({ error: 'Please provide a valid AliExpress product URL.' })
    }

    console.log('[Scraper] Scraping:', url)
    const product = await scrapeAliExpressProduct(url)

    if (!product.title || product.price === 0) {
      return res.status(422).json({ error: 'Could not extract product data. The page may have changed or blocked the scraper.' })
    }

    res.json(product)
  } catch (err) {
    console.error('[Scraper] Error:', err.message)
    next(err)
  }
})

// GET /api/scraper/debug?url=...
router.get('/debug', async (req, res, next) => {
  try {
    const result = await debugPage(req.query.url)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

module.exports = router
