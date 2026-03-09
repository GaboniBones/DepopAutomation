const express = require('express')
const router = express.Router()
const { getAccessToken, setCredentials, clearToken, hasCredentials } = require('../services/auth')

// GET /api/auth/status
router.get('/status', (req, res) => {
  res.json({ loggedIn: hasCredentials() })
})

// POST /api/auth/login  { username, password }
router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required.' })
  }

  setCredentials(username, password)

  try {
    await getAccessToken()
    res.json({ success: true })
  } catch (err) {
    clearToken()
    res.status(401).json({ error: err.message })
  }
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  clearToken()
  res.json({ success: true })
})

module.exports = router
