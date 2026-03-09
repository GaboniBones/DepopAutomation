const axios = require('axios')
const cheerio = require('cheerio')

function extractProductId(url) {
  const match = url.match(/\/item\/(\d+)/) || url.match(/productIds=(\d+)/)
  return match?.[1] || null
}

async function scrapeAliExpressProduct(url) {
  const apiKey = process.env.SCRAPER_API_KEY
  if (!apiKey) throw new Error('SCRAPER_API_KEY must be set in .env')

  const productId = extractProductId(url)
  const cleanUrl = productId
    ? `https://www.aliexpress.com/item/${productId}.html`
    : url

  console.log('[Scraper] Fetching via ScraperAPI:', cleanUrl)

  const res = await axios.get('http://api.scraperapi.com', {
    params: {
      api_key: apiKey,
      url: cleanUrl,
      render: true,
      country_code: 'gb',
    },
    timeout: 90000,
  })

  const html = res.data
  const $ = cheerio.load(html)

  // Method 1: __NEXT_DATA__ JSON blob
  const nextDataEl = $('#__NEXT_DATA__').text()
  if (nextDataEl) {
    try {
      const data = JSON.parse(nextDataEl)
      const pageProps = data?.props?.pageProps
      const pdp = pageProps?.pdpData || pageProps?.productInfo || pageProps?.data

      if (pdp) {
        const title =
          pdp.productInfo?.title || pdp.title || pdp.subject || ''
        const priceInfo =
          pdp.priceInfo || pdp.price || pdp.productInfo?.price || {}
        const price =
          priceInfo.salePrice?.minPrice ||
          priceInfo.discountedPrice ||
          priceInfo.originalPrice ||
          priceInfo.minActivityAmount?.value ||
          priceInfo.minAmount?.value ||
          0
        const images =
          pdp.imageInfo?.imagePathList ||
          pdp.mediaInfo?.imageList?.map(i => i.imageUrl || i.url) ||
          pdp.productInfo?.images ||
          pdp.images ||
          []

        if (title) {
          console.log('[Scraper] Got from __NEXT_DATA__:', title)
          return {
            title,
            price: parseFloat(price) || 0,
            description: title,
            images: images.filter(Boolean).slice(0, 8),
          }
        }
      }
    } catch {}
  }

  // Method 2: Look for window.runParams in inline scripts
  let runParamsProduct = null
  $('script').each((_, el) => {
    const text = $(el).html() || ''
    if (text.includes('runParams') && text.includes('subject')) {
      try {
        const match = text.match(/window\.runParams\s*=\s*(\{[\s\S]+?\});?\s*(?:window|var|let|const|$)/)
        if (match) {
          const d = JSON.parse(match[1])?.data
          const title = d?.productInfoComponent?.subject || ''
          const images = d?.imageComponent?.imagePathList || []
          let price = 0
          try {
            const skus = JSON.parse(d?.priceComponent?.skuJson || '[]')
            price = skus?.[0]?.skuVal?.skuAmount?.value || 0
          } catch {}
          if (title) {
            runParamsProduct = { title, price: parseFloat(price) || 0, description: title, images }
          }
        }
      } catch {}
    }
  })
  if (runParamsProduct) {
    console.log('[Scraper] Got from runParams:', runParamsProduct.title)
    return runParamsProduct
  }

  // Method 3: DOM selectors
  const title =
    $('h1[data-pl="product-title"]').text().trim() ||
    $('.product-title-text').text().trim() ||
    $('[class*="title--"]').first().text().trim() ||
    $('h1').first().text().trim() ||
    $('meta[property="og:title"]').attr('content') ||
    ''

  const priceRaw =
    $('[class*="price--currentPriceText"]').first().text() ||
    $('[class*="uniform-banner-box-price"]').first().text() ||
    $('[class*="sale-price"]').first().text() ||
    $('meta[property="og:price:amount"]').attr('content') ||
    ''
  const price = parseFloat(priceRaw.replace(/[^0-9.]/g, '')) || 0

  const images = []
  $('meta[property="og:image"]').each((_, el) => {
    const src = $(el).attr('content')
    if (src && !images.includes(src)) images.push(src)
  })

  const description = $('meta[name="description"]').attr('content') || title

  console.log('[Scraper] DOM result — title:', title, 'price:', price)

  return {
    title,
    price,
    description: (description || title).slice(0, 500),
    images: images.slice(0, 8),
  }
}

async function debugPage(url) {
  const apiKey = process.env.SCRAPER_API_KEY
  if (!apiKey) return { error: 'SCRAPER_API_KEY not set' }

  const productId = extractProductId(url)
  const cleanUrl = productId ? `https://www.aliexpress.com/item/${productId}.html` : url

  const res = await axios.get('http://api.scraperapi.com', {
    params: { api_key: apiKey, url: cleanUrl },
    timeout: 30000,
  })

  const html = res.data
  const $ = cheerio.load(html)

  return {
    hasNextData: !!$('#__NEXT_DATA__').text(),
    h1: $('h1').first().text().trim(),
    title: $('title').text(),
    ogTitle: $('meta[property="og:title"]').attr('content'),
    ogPrice: $('meta[property="og:price:amount"]').attr('content'),
    ogImage: $('meta[property="og:image"]').attr('content'),
    bodySnippet: $('body').text().slice(0, 300),
  }
}

module.exports = { scrapeAliExpressProduct, debugPage }
