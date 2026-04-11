import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { Types } from 'mongoose'
import { MaintenanceLog } from '../models/MaintenanceLog.js'
import { requireAuth } from '../middleware/auth.js'
import { computeHealthScore } from '../services/healthScore.js'

const router = Router()
router.use(requireAuth)

// GET /api/history/stats — must be declared before /:id-style routes
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await computeHealthScore(req.user!._id)
    res.json(stats)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats.' })
  }
})

// GET /api/history  (optional ?applianceId=)
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user!._id)
    const query: Record<string, unknown> = { userId }
    if (req.query.applianceId) {
      const idParsed = z.string().regex(/^[0-9a-f]{24}$/).safeParse(req.query.applianceId)
      if (!idParsed.success) {
        res.status(400).json({ error: 'Invalid appliance ID' })
        return
      }
      query.applianceId = new Types.ObjectId(idParsed.data)
    }

    const logs = await MaintenanceLog.find(query)
      .sort({ completedAt: -1 })
      .populate('applianceId', 'name typeId')
      .lean()

    res.json(logs)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history.' })
  }
})

export default router
