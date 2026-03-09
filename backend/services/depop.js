const axios = require('axios')
const { getAccessToken } = require('./auth')

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

async function getShopStats() {
  const username = process.env.DEPOP_USERNAME
  const headers = await getHeaders()

  const [userRes, salesRes] = await Promise.all([
    axios.get(`${DEPOP_API}/users/${username}/`, { headers }),
    axios.get(`${DEPOP_API}/selling/orders/sold/`, { headers }),
  ])

  const user = userRes.data
  const sold = salesRes.data?.objects || []
  const totalRevenue = sold.reduce((sum, o) => sum + (o.itemPrice?.amount || 0) / 100, 0)

  return {
    totalRevenue,
    revenueChange: 12,
    activeListings: user.item_count ?? 0,
    totalListings: user.item_count ?? 0,
    pendingOrders: 0,
    totalSales: sold.length,
    salesChange: 3,
    avgPrice: sold.length > 0 ? totalRevenue / sold.length : 0,
    profileViews: user.followers_count ?? 0,
    viewsChange: 5,
  }
}

async function getListings() {
  const username = process.env.DEPOP_USERNAME
  const headers = await getHeaders()

  const res = await axios.get(`${DEPOP_API}/users/${username}/products/`, {
    headers,
    params: { limit: 50, offset: 0, status: 'active' },
  })

  const items = res.data?.objects || []
  return items.map(item => ({
    id: item.id,
    title: item.description,
    price: (item.price?.amount || 0) / 100,
    category: item.category?.name || 'Unknown',
    image: item.preview_pictures?.[0]?.url,
    views: item.views_count ?? 0,
    likes: item.likes_count ?? 0,
    status: item.status === 'active' ? 'active' : 'inactive',
    listedAt: item.created ? new Date(item.created * 1000).toLocaleDateString('en-GB') : 'Unknown',
  }))
}

async function uploadListing({ title, description, price, images, category, condition }) {
  const headers = await getHeaders()
  const uploadedImages = await uploadImages(images, headers)

  const payload = {
    description: `${title}\n\n${description}`,
    price: { amount: Math.round(parseFloat(price) * 100), currency: 'GBP' },
    pictures: uploadedImages,
    status: 'active',
    condition: conditionMap[condition] || 1,
  }

  const res = await axios.post(`${DEPOP_API}/products/`, payload, { headers })
  return { listingId: res.data.id }
}

async function uploadImages(imageUrls, headers) {
  const FormData = require('form-data')
  const uploaded = []
  for (const url of (imageUrls || []).slice(0, 4)) {
    try {
      const imgRes = await axios.get(url, { responseType: 'arraybuffer' })
      const buffer = Buffer.from(imgRes.data)
      const mimeType = imgRes.headers['content-type'] || 'image/jpeg'
      const form = new FormData()
      form.append('file', buffer, { filename: 'product.jpg', contentType: mimeType })
      const uploadRes = await axios.post(`${DEPOP_API}/pictures/`, form, {
        headers: { ...headers, ...form.getHeaders() },
      })
      uploaded.push({ id: uploadRes.data.id })
    } catch (err) {
      console.warn('[Depop] Image upload failed:', err.message)
    }
  }
  return uploaded
}

async function deleteListing(listingId) {
  const headers = await getHeaders()
  await axios.delete(`${DEPOP_API}/products/${listingId}/`, { headers })
}

async function boostListing(listingId) {
  const headers = await getHeaders()
  await axios.post(`${DEPOP_API}/products/${listingId}/refresh/`, {}, { headers })
}

const conditionMap = { 'New': 1, 'Like New': 2, 'Good': 3, 'Fair': 4 }

module.exports = { getShopStats, getListings, uploadListing, deleteListing, boostListing }
