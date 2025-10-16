const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const morgan = require('morgan')

const app = express()
const PORT = process.env.PORT || 3001

// Security middleware
app.use(helmet())

// CORS configuration for multiple sites
const allowedOrigins = [
  'https://gab-fashion-house.vercel.app',
  'https://urban-jungle.vercel.app',  // Add Urban Jungle
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173'
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use(limiter)

// Logging
app.use(morgan('combined'))

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// CAC Bank API endpoints
const CAC_API_BASE_URL = process.env.CAC_API_BASE_URL || 'http://172.17.2.52:8080/pay/paymentapi'

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    allowedOrigins: allowedOrigins
  })
})

// Authentication endpoint
app.post('/auth/signin', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    const response = await fetch(`${CAC_API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    })

    if (!response.ok) {
      const errorData = await response.json()
      return res.status(response.status).json({ error: errorData.message || 'Authentication failed' })
    }

    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error('Auth error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Payment initiation endpoint
app.post('/PaymentInitiateRequest', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Bearer token required' })
    }

    const response = await fetch(`${CAC_API_BASE_URL}/PaymentInitiateRequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(req.body)
    })

    if (!response.ok) {
      const errorData = await response.json()
      return res.status(response.status).json({ error: errorData.message || 'Payment initiation failed' })
    }

    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error('Payment initiation error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Payment confirmation endpoint
app.post('/PaymentConfirmationRequest', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Bearer token required' })
    }

    const response = await fetch(`${CAC_API_BASE_URL}/PaymentConfirmationRequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(req.body)
    })

    if (!response.ok) {
      const errorData = await response.json()
      return res.status(response.status).json({ error: errorData.message || 'Payment confirmation failed' })
    }

    // CAC Bank confirmation endpoint returns no body, just status
    res.status(200).end()
  } catch (error) {
    console.error('Payment confirmation error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Payment verification endpoint
app.post('/verify-payment', async (req, res) => {
  try {
    const { transaction_id } = req.body

    if (!transaction_id) {
      return res.status(400).json({ error: 'Transaction ID is required' })
    }

    const response = await fetch(`${CAC_API_BASE_URL}/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transaction_id })
    })

    if (!response.ok) {
      const errorData = await response.json()
      return res.status(response.status).json({ error: errorData.message || 'Payment verification failed' })
    }

    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error('Payment verification error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error)
  res.status(500).json({ error: 'Internal server error' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CAC Bank Proxy Server running on port ${PORT}`)
  console.log(`📋 Allowed origins: ${allowedOrigins.join(', ')}`)
  console.log(`🔗 CAC API URL: ${CAC_API_BASE_URL}`)
})

module.exports = app

