require('dotenv').config()
const express = require('express')
const cors = require('cors')

const scraperRoutes = require('./routes/scraper')
const ordersRoutes = require('./routes/orders')
const depopRoutes = require('./routes/depop')
const authRoutes = require('./routes/auth')

const app = express()

app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173'] }))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/scraper', scraperRoutes)
app.use('/api/orders', ordersRoutes)
app.use('/api/depop', depopRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.message)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

const PORT = process.env.PORT || 5000
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`Backend running on http://127.0.0.1:${PORT}`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Error] Port ${PORT} is already in use. Kill the existing process and retry.`)
  } else {
    console.error('[Server Error]', err.message)
  }
  process.exit(1)
})

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err.message)
})

process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]', reason)
})
