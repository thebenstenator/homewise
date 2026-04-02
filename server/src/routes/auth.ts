import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { User } from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'

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

function setTokenCookie(res: Response, userId: string, user: { email: string; name: string; zipCode: string }) {
  const token = jwt.sign(
    { _id: userId, email: user.email, name: user.name, zipCode: user.zipCode },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
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

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email, passwordHash, zipCode })

  setTokenCookie(res, user._id.toString(), { email: user.email, name: user.name, zipCode: user.zipCode })

  res.status(201).json({
    user: { _id: user._id, email: user.email, name: user.name, zipCode: user.zipCode },
  })
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
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

// POST /api/auth/unsubscribe
router.post('/unsubscribe', requireAuth, async (req: Request, res: Response) => {
  await User.findByIdAndUpdate(req.user!._id, { emailReminders: false })
  res.json({ message: 'Unsubscribed from email reminders' })
})

export default router
