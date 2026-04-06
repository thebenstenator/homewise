import 'dotenv/config'
import express, { Request, Response } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'
import authRoutes from './routes/auth.js'
import applianceTypeRoutes from './routes/applianceTypes.js'
import applianceRoutes from './routes/appliances.js'
import scheduleRoutes from './routes/schedules.js'
import userRoutes from './routes/users.js'
import historyRoutes from './routes/history.js'
import { errorHandler } from './middleware/errorHandler.js'
import { startScheduler, runWeeklyDigest } from './services/scheduler.js'
import { requireAuth } from './middleware/auth.js'

// Validate required environment variables before starting
const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL', 'BREVO_API_KEY']
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`)
    process.exit(1)
  }
}

const app = express()
const PORT = process.env.PORT || 3001

// Security headers
app.use(helmet())

// CORS — must come before other middleware so preflight requests get credentials header
const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173'
const clientUrlBase = clientUrl.replace('https://www.', 'https://').replace('http://www.', 'http://')
const allowedOrigins = process.env.CLIENT_URL
  ? [clientUrlBase, clientUrlBase.replace('https://', 'https://www.')]
  : ['http://localhost:5173']

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
})

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many registration attempts, please try again later.' },
})

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later.' },
})

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many password reset attempts, please try again later.' },
})

const applianceCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many appliances created, please try again later.' },
})

app.use('/api/', globalLimiter)
app.use('/api/auth/register', registerLimiter)
app.use('/api/auth/login', loginLimiter)
app.use('/api/auth/forgot-password', passwordResetLimiter)
app.use('/api/auth/reset-password', passwordResetLimiter)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/appliance-types', applianceTypeRoutes)
app.use('/api/appliances', (req, res, next) => {
  if (req.method === 'POST') return applianceCreateLimiter(req, res, next)
  next()
})
app.use('/api/appliances', applianceRoutes)
app.use('/api/schedules', scheduleRoutes)
app.use('/api/users', userRoutes)
app.use('/api/history', historyRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Dev-only: manually trigger weekly digest for the requesting user
if (process.env.NODE_ENV === 'development') {
  app.post('/api/dev/trigger-reminders', requireAuth, async (req: Request, res: Response) => {
    await runWeeklyDigest(req.user!._id)
    res.json({ message: 'Digest triggered for your account' })
  })
}

// Error handler (must be last)
app.use(errorHandler)

// Connect to MongoDB then start server
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log('Connected to MongoDB')
    startScheduler()
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message)
    process.exit(1)
  })
