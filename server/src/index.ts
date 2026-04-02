import 'dotenv/config'
import express, { Request, Response } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import authRoutes from './routes/auth.js'
import applianceTypeRoutes from './routes/applianceTypes.js'
import applianceRoutes from './routes/appliances.js'
import scheduleRoutes from './routes/schedules.js'
import userRoutes from './routes/users.js'
import { errorHandler } from './middleware/errorHandler.js'
import { startScheduler, runWeeklyDigest } from './services/scheduler.js'
import { requireAuth } from './middleware/auth.js'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/appliance-types', applianceTypeRoutes)
app.use('/api/appliances', applianceRoutes)
app.use('/api/schedules', scheduleRoutes)
app.use('/api/users', userRoutes)

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
