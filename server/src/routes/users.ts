import { Router, Request, Response } from 'express'
import { z } from 'zod'
import crypto from 'crypto'
import { User } from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'

const router = Router()
router.use(requireAuth)

const profileSchema = z.object({
  name: z.string().min(1).trim().optional(),
  zipCode: z.string().regex(/^\d{5}$/, 'Zip code must be 5 digits').optional(),
  emailReminders: z.boolean().optional(),
})

// PUT /api/users/profile
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const data = validateBody(profileSchema, req.body, res)
    if (!data) return

    const user = await User.findByIdAndUpdate(req.user!._id, data, { new: true }).lean()
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        zipCode: user.zipCode,
        emailReminders: user.emailReminders,
      },
    })
  } catch (err) {
    console.error('Failed to update profile:', err)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// POST /api/users/share-token — generate or regenerate share token
router.post('/share-token', async (req: Request, res: Response) => {
  try {
    const token = crypto.randomBytes(24).toString('hex')
    const user = await User.findByIdAndUpdate(req.user!._id, { shareToken: token }, { new: true }).lean()
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    res.json({ shareToken: token })
  } catch (err) {
    console.error('Failed to generate share token:', err)
    res.status(500).json({ error: 'Failed to generate share link' })
  }
})

// DELETE /api/users/share-token — revoke sharing
router.delete('/share-token', async (req: Request, res: Response) => {
  try {
    await User.findByIdAndUpdate(req.user!._id, { $unset: { shareToken: '' } })
    res.json({ ok: true })
  } catch (err) {
    console.error('Failed to revoke share token:', err)
    res.status(500).json({ error: 'Failed to revoke share link' })
  }
})

// GET /api/users/me/share-token — get current share token status
router.get('/me/share-token', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!._id).lean()
    res.json({ shareToken: user?.shareToken ?? null })
  } catch (err) {
    console.error('Failed to fetch share token:', err)
    res.status(500).json({ error: 'Failed to fetch share link' })
  }
})

export default router
