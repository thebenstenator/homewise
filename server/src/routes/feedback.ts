import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { sendFeedback } from '../services/emailService.js'

const router = Router()
router.use(requireAuth)

const feedbackSchema = z.object({
  message: z.string().min(1).max(2000).trim(),
})

// POST /api/feedback
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = feedbackSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message })
      return
    }

    await sendFeedback(req.user!.name, req.user!.email, parsed.data.message)
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Failed to send feedback' })
  }
})

export default router
