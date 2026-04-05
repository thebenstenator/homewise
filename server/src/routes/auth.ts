import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { z } from 'zod'
import { User } from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'
import { sendPasswordReset } from '../services/emailService.js'

const router = Router()

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  zipCode: z.string().regex(/^\d{5}$/, 'Zip code must be 5 digits'),
})

const loginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(1),
})

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function setTokenCookie(res: Response, userId: string, user: { email: string; name: string; zipCode: string }) {
  const token = jwt.sign(
    { _id: userId, email: user.email, name: user.name, zipCode: user.zipCode },
    process.env.JWT_SECRET!,
    { algorithm: 'HS256', expiresIn: '7d' }
  )
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message })
      return
    }

    const { name, email, password, zipCode } = parsed.data

    const existing = await User.findOne({ email })
    if (existing) {
      res.status(409).json({ error: 'An account with that email already exists' })
      return
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, passwordHash, zipCode })

    setTokenCookie(res, user._id.toString(), { email: user.email, name: user.name, zipCode: user.zipCode })

    res.status(201).json({
      user: { _id: user._id, email: user.email, name: user.name, zipCode: user.zipCode },
    })
  } catch (err) {
    res.status(500).json({ error: 'Registration failed. Please try again.' })
  }
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid email or password' })
      return
    }

    const { email, password } = parsed.data

    const user = await User.findOne({ email })
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    setTokenCookie(res, user._id.toString(), { email: user.email, name: user.name, zipCode: user.zipCode })

    res.json({
      user: { _id: user._id, email: user.email, name: user.name, zipCode: user.zipCode },
    })
  } catch (err) {
    res.status(500).json({ error: 'Login failed. Please try again.' })
  }
})

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token')
  res.json({ message: 'Logged out' })
})

// GET /api/auth/me
router.get('/me', requireAuth, (req: Request, res: Response) => {
  res.json({ user: req.user })
})

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const parsed = z.object({ email: z.string().email().trim().toLowerCase() }).safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Valid email required' })
      return
    }

    // Always respond with the same message to avoid leaking whether an email exists
    const genericResponse = { message: 'If that email is registered, a reset link is on its way.' }

    const user = await User.findOne({ email: parsed.data.email })
    if (!user) {
      res.json(genericResponse)
      return
    }

    const token = crypto.randomBytes(32).toString('hex')
    const tokenHash = hashToken(token)
    const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await User.findByIdAndUpdate(user._id, { resetToken: tokenHash, resetTokenExpiry: expiry })

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`
    await sendPasswordReset(user.email, resetUrl)

    res.json(genericResponse)
  } catch (err) {
    res.json({ message: 'If that email is registered, a reset link is on its way.' })
  }
})

// POST /api/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const parsed = z.object({
      token: z.string().min(1),
      password: z.string().min(8, 'Password must be at least 8 characters'),
    }).safeParse(req.body)

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message })
      return
    }

    const tokenHash = hashToken(parsed.data.token)

    const user = await User.findOne({
      resetToken: tokenHash,
      resetTokenExpiry: { $gt: new Date() },
    })

    if (!user) {
      res.status(400).json({ error: 'This reset link is invalid or has expired.' })
      return
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12)
    await User.findByIdAndUpdate(user._id, {
      passwordHash,
      $unset: { resetToken: '', resetTokenExpiry: '' },
    })

    res.json({ message: 'Password updated. You can now log in.' })
  } catch (err) {
    res.status(500).json({ error: 'Password reset failed. Please try again.' })
  }
})

// POST /api/auth/unsubscribe
router.post('/unsubscribe', requireAuth, async (req: Request, res: Response) => {
  try {
    await User.findByIdAndUpdate(req.user!._id, { emailReminders: false })
    res.json({ message: 'Unsubscribed from email reminders' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to unsubscribe. Please try again.' })
  }
})

export default router
