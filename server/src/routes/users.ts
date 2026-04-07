import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { User } from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'

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
    const parsed = profileSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message })
      return
    }

    const user = await User.findByIdAndUpdate(req.user!._id, parsed.data, { new: true }).lean()
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
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

export default router
