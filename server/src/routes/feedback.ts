import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { sendFeedback } from '../services/emailService.js'
import { validateBody } from '../middleware/validate.js'

const router = Router()
router.use(requireAuth)

const feedbackSchema = z.object({
  message: z.string().min(1).max(2000).trim(),
})

const FEEDBACK_TO = process.env.FEEDBACK_TO_EMAIL ?? 'homewiseapp@outlook.com'

// POST /api/feedback
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = validateBody(feedbackSchema, req.body, res)
    if (!data) return

    await sendFeedback(req.user!.name, req.user!.email, data.message, FEEDBACK_TO)
    res.json({ ok: true })
  } catch (err) {
    console.error('Failed to send feedback:', err)
    res.status(500).json({ error: 'Failed to send feedback' })
  }
})

export default router
